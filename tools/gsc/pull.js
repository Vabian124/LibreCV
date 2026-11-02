/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

// Pull a Search Console sample into gsc-data/.
// The service-account key is read from GSC_SERVICE_ACCOUNT_KEY_PATH, or from
// ~/.config/gsc/gsc-mcp-key.json (on this machine that is the key outside the repo).
// The key, its private key, and access tokens are never written or printed.

const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const outDir = path.join(root, "gsc-data");
const keyPath = process.env.GSC_SERVICE_ACCOUNT_KEY_PATH
    || path.join(os.homedir(), ".config", "gsc", "gsc-mcp-key.json");
const inspectionUrls = [
    "https://librecv.org/",
    "https://librecv.org/nl/",
    "https://librecv.org/sitemap.xml"
];
const siteCandidates = [
    "sc-domain:librecv.org",
    "https://librecv.org/",
    "http://librecv.org/"
];
const dimensions = ["query", "page", "country", "device"];
const rowLimit = 1000;

function fail(message) {
    console.error(message);
    process.exit(1);
}

function base64url(value) {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
    return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function isoDaysAgo(days) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
}

function writeJson(name, value) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, name), JSON.stringify(value, null, 2) + "\n");
    console.log("wrote gsc-data/" + name);
}

function request(url, options) {
    const body = options.body ? Buffer.from(options.body) : null;
    const headers = Object.assign({}, options.headers);
    if (body) headers["Content-Length"] = body.length;
    return new Promise(function (resolve, reject) {
        const req = https.request(url, { method: options.method || "GET", headers: headers }, function (res) {
            const chunks = [];
            res.on("data", function (chunk) { chunks.push(chunk); });
            res.on("end", function () {
                const text = Buffer.concat(chunks).toString("utf8");
                let parsed = {};
                if (text) {
                    try {
                        parsed = JSON.parse(text);
                    } catch (error) {
                        parsed = { raw: text.slice(0, 2000) };
                    }
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

function loadKey() {
    const resolved = path.resolve(keyPath);
    const relative = path.relative(root, resolved);
    if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
        fail("Refusing to read a service-account key from inside the repository.");
    }
    let key;
    try {
        key = JSON.parse(fs.readFileSync(resolved, "utf8"));
    } catch (error) {
        fail("Could not read the service-account key. Set GSC_SERVICE_ACCOUNT_KEY_PATH or place the key outside the repo.");
    }
    if (!key || !key.client_email || !key.private_key) {
        fail("The key file is missing client_email or private_key.");
    }
    return key;
}

function signToken(key) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = base64url(JSON.stringify({
        iss: key.client_email,
        scope: "https://www.googleapis.com/auth/webmasters.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600
    }));
    const unsigned = header + "." + claim;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(unsigned);
    return unsigned + "." + base64url(signer.sign(key.private_key));
}

function authorized(token) {
    return async function (url, options) {
        const headers = Object.assign({
            Authorization: "Bearer " + token,
            Accept: "application/json"
        }, options && options.headers);
        return request(url, {
            method: options && options.method,
            headers: headers,
            body: options && options.body
        });
    };
}

function siteOrder(listed) {
    const known = (listed || []).map(function (entry) { return entry.siteUrl; });
    const preferred = siteCandidates.filter(function (url) { return known.indexOf(url) !== -1; });
    const rest = known.filter(function (url) { return preferred.indexOf(url) === -1; });
    const fallback = siteCandidates.filter(function (url) { return preferred.indexOf(url) === -1 && rest.indexOf(url) === -1; });
    return preferred.concat(rest, fallback);
}

async function firstWorking(call, urls) {
    const attempts = [];
    for (let i = 0; i < urls.length; i += 1) {
        const siteUrl = urls[i];
        let result;
        try {
            result = await call(siteUrl);
        } catch (error) {
            attempts.push({ siteUrl: siteUrl, error: String(error.message || error) });
            continue;
        }
        if (result.status >= 200 && result.status < 300) {
            return { siteUrl: siteUrl, body: result.body };
        }
        attempts.push({ siteUrl: siteUrl, status: result.status, body: result.body });
        if (result.status !== 400 && result.status !== 403 && result.status !== 404) break;
    }
    return { attempts: attempts };
}

async function searchAnalytics(call, siteUrl, dimension, startDate, endDate) {
    const rows = [];
    let first = null;
    let startRow = 0;
    for (;;) {
        const result = await call(
            "https://www.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate,
                    dimensions: [dimension],
                    type: "web",
                    dataState: "all",
                    rowLimit: rowLimit,
                    startRow: startRow
                })
            }
        );
        if (result.status < 200 || result.status >= 300) return result;
        if (!first) first = result.body;
        const batch = result.body.rows || [];
        batch.forEach(function (row) { rows.push(row); });
        if (batch.length < rowLimit) break;
        startRow += rowLimit;
    }
    if (!first.rows) return { status: 200, body: first };
    return { status: 200, body: Object.assign({}, first, { rows: rows }) };
}

async function main() {
    const key = loadKey();
    const assertion = signToken(key);
    const tokenResult = await request("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + encodeURIComponent(assertion)
    });
    if (!tokenResult.body || !tokenResult.body.access_token) {
        writeJson("sites.json", { error: "token request failed", status: tokenResult.status, body: tokenResult.body && tokenResult.body.error ? tokenResult.body.error : { status: tokenResult.status } });
        fail("Google did not return an access token (" + tokenResult.status + ").");
    }
    const call = authorized(tokenResult.body.access_token);
    const sites = await call("https://www.googleapis.com/webmasters/v3/sites");
    writeJson("sites.json", sites.status >= 200 && sites.status < 300 ? sites.body : { status: sites.status, body: sites.body });
    if (sites.status < 200 || sites.status >= 300) fail("sites.list failed (" + sites.status + ").");

    const urls = siteOrder(sites.body.siteEntry);
    const startDate = isoDaysAgo(27);
    const endDate = isoDaysAgo(0);
    const sitemaps = await firstWorking(function (siteUrl) {
        return call("https://www.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/sitemaps");
    }, urls);
    writeJson("sitemaps.json", sitemaps.body || { attempts: sitemaps.attempts });

    const siteUrl = sitemaps.siteUrl || urls[0];
    const analytics = { siteUrl: siteUrl, startDate: startDate, endDate: endDate };
    for (let i = 0; i < dimensions.length; i += 1) {
        const dimension = dimensions[i];
        try {
            const result = await searchAnalytics(call, siteUrl, dimension, startDate, endDate);
            analytics[dimension] = result.status >= 200 && result.status < 300 ? result.body : { status: result.status, body: result.body };
        } catch (error) {
            analytics[dimension] = { error: String(error.message || error) };
        }
    }
    writeJson("analytics.json", analytics);

    const inspection = { siteUrl: siteUrl, results: {} };
    for (let i = 0; i < inspectionUrls.length; i += 1) {
        const inspectionUrl = inspectionUrls[i];
        try {
            const result = await call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inspectionUrl: inspectionUrl,
                    siteUrl: siteUrl,
                    languageCode: "en-US"
                })
            });
            inspection.results[inspectionUrl] = result.status >= 200 && result.status < 300
                ? result.body
                : { status: result.status, body: result.body };
        } catch (error) {
            inspection.results[inspectionUrl] = { error: String(error.message || error) };
        }
    }
    writeJson("inspection.json", inspection);
    console.log("site " + siteUrl);
}

main().catch(function (error) {
    fail(error && error.message ? error.message : String(error));
});
