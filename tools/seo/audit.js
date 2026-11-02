/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function walk(dir, out) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
        if (entry.name === "node_modules" || entry.name === "gsc-data" || entry.name === ".git") return;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (entry.name === "index.html" || entry.name === "404.html") out.push(full);
    });
    return out;
}

function attr(html, name) {
    const re = new RegExp("<" + name + "[^>]*>", "i");
    return html.match(re);
}

function meta(html, key) {
    const re = new RegExp("<meta\\s+[^>]*(?:name|property)=\"" + key + "\"[^>]*>", "i");
    const tag = html.match(re);
    if (!tag) return "";
    const content = tag[0].match(/content="([^"]*)"/);
    return content ? content[1] : "";
}

function hrefs(html, rel) {
    const out = [];
    const re = /<link\s+[^>]*>/gi;
    let tag;
    while ((tag = re.exec(html))) {
        if (tag[0].indexOf('rel="' + rel + '"') === -1 && tag[0].indexOf("rel='" + rel + "'") === -1) continue;
        const href = tag[0].match(/href="([^"]+)"/);
        const lang = tag[0].match(/hreflang="([^"]+)"/);
        if (href) out.push({ href: href[1], lang: lang ? lang[1] : "" });
    }
    return out;
}

const files = walk(root, []);
const pages = files.map(function (file) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const title = (html.match(/<title>([^<]*)<\/title>/) || ["", ""])[1];
    const description = meta(html, "description");
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const h1text = h1.map(function (tag) {
        return tag.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    });
    const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || ["", ""])[1];
    const robots = meta(html, "robots");
    const images = html.match(/<img\s+[^>]*>/gi) || [];
    const missingAlt = images.filter(function (tag) {
        return !/alt="[^"]*"/.test(tag) && !/alt='[^']*'/.test(tag);
    }).length;
    const internal = (html.match(/href="\/[^"]*"/g) || []).length;
    const issues = [];
    const quiet = rel === "404.html" || rel.indexOf("feedback/") === 0;
    if (!title) issues.push("missing title");
    else if (!quiet && (title.length < 30 || title.length > 60)) issues.push("title length " + title.length);
    if (rel !== "404.html" && rel.indexOf("feedback/") !== 0) {
        if (!description) issues.push("missing description");
        else if (description.length < 100 || description.length > 160) issues.push("description length " + description.length);
        if (!canonical) issues.push("missing canonical");
        if (robots.indexOf("noindex") !== -1) issues.push("indexable page is noindex");
    }
    if (h1.length !== 1) issues.push(h1.length + " h1");
    if (!quiet && !meta(html, "og:title")) issues.push("missing og:title");
    if (!meta(html, "og:image") && rel !== "404.html" && rel.indexOf("feedback/") !== 0) issues.push("missing og:image");
    if (html.indexOf('rel="icon" href="/favicon.ico"') === -1) issues.push("missing favicon.ico");
    if (missingAlt) issues.push(missingAlt + " images missing alt");
    if (/http:\/\/librecv\.org/.test(html)) issues.push("http librecv URL");
    const langs = hrefs(html, "alternate");
    return { rel: rel, title: title, description: description, h1: h1text, canonical: canonical, internal: internal, langs: langs, issues: issues };
});

const byCanonical = {};
pages.forEach(function (page) {
    if (page.canonical) byCanonical[page.canonical] = page;
});
pages.forEach(function (page) {
    page.langs.forEach(function (link) {
        if (!link.lang || link.lang === "x-default") return;
        const back = byCanonical[link.href];
        if (!back) {
            page.issues.push("hreflang " + link.lang + " target is not a page: " + link.href);
            return;
        }
        const returns = back.langs.some(function (item) {
            return item.href === page.canonical;
        });
        if (!returns) page.issues.push("hreflang " + link.lang + " is not returned by " + link.href);
    });
});

let failed = 0;
pages.forEach(function (page) {
    if (!page.issues.length) return;
    failed += 1;
    console.log(page.rel);
    page.issues.forEach(function (issue) { console.log("  " + issue); });
});
console.log(pages.length + " pages, " + failed + " with issues");
if (process.argv.indexOf("--fail") !== -1 && failed) process.exit(1);
