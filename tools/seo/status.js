#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.join(__dirname, "..", "..");
const xml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const locs = xml.match(/<loc>([^<]+)<\/loc>/g).map(function (tag) {
    return tag.slice(5, -6);
});

function ask(url, hops) {
    return new Promise(function (resolve) {
        const req = https.request(url, { method: "GET", headers: { "User-Agent": "LibreCV-seo-status" } }, function (res) {
            res.resume();
            const next = res.headers.location;
            if (next && res.statusCode >= 300 && res.statusCode < 400 && hops < 5) {
                const target = new URL(next, url).href;
                ask(target, hops + 1).then(function (landed) {
                    resolve({ url: url, status: res.statusCode, location: target, landed: landed });
                });
                return;
            }
            resolve({ url: url, status: res.statusCode, type: res.headers["content-type"] || "" });
        });
        req.on("error", function (error) {
            resolve({ url: url, status: 0, error: error.message });
        });
        req.setTimeout(15000, function () {
            req.destroy();
            resolve({ url: url, status: 0, error: "timeout" });
        });
        req.end();
    });
}

Promise.all(locs.map(function (url) {
    return ask(url, 0);
})).then(function (rows) {
    let bad = 0;
    rows.forEach(function (row) {
        const line = row.status + " " + row.url + (row.type ? " " + row.type.split(";")[0] : "") + (row.error ? " " + row.error : "") + (row.location ? " -> " + row.location : "");
        if (row.status !== 200) bad += 1;
        console.log(line);
    });
    console.log(rows.length + " URLs, " + bad + " not 200");
    if (bad && process.argv.indexOf("--fail") !== -1) process.exit(1);
});
