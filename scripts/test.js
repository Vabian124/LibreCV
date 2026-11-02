/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");
const { built, builtCss } = require("./build.js");

const root = path.join(__dirname, "..");

function fail(message) {
    console.error(message);
    process.exit(1);
}

const editor = fs.readFileSync(path.join(root, "editor.js"), "utf8");
if (built() !== editor) fail("editor.js does not match src/editor. Run npm run build.");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
if (builtCss() !== css) fail("styles.css does not match src/css. Run npm run build.");

const pages = [
    ["index.html", "https://librecv.org/"],
    ["404.html", null],
    ["feedback/index.html", "https://librecv.org/feedback/"],
    ["nl/index.html", "https://librecv.org/nl/"],
    ["nl/motivatiebrief/index.html", "https://librecv.org/nl/motivatiebrief/"],
    ["motivation-letter/index.html", "https://librecv.org/motivation-letter/"],
    ["templates/index.html", "https://librecv.org/templates/"],
    ["templates/software-engineer/index.html", "https://librecv.org/templates/software-engineer/"],
    ["templates/software-engineer/letter/index.html", "https://librecv.org/templates/software-engineer/letter/"],
    ["templates/nursing/index.html", "https://librecv.org/templates/nursing/"],
    ["templates/nursing/letter/index.html", "https://librecv.org/templates/nursing/letter/"],
    ["nl/sjablonen/softwareontwikkelaar/index.html", "https://librecv.org/nl/sjablonen/softwareontwikkelaar/"],
    ["nl/sjablonen/softwareontwikkelaar/brief/index.html", "https://librecv.org/nl/sjablonen/softwareontwikkelaar/brief/"],
    ["nl/sjablonen/verpleegkundige/index.html", "https://librecv.org/nl/sjablonen/verpleegkundige/"],
    ["nl/sjablonen/verpleegkundige/brief/index.html", "https://librecv.org/nl/sjablonen/verpleegkundige/brief/"],
    ["cli/index.html", "https://librecv.org/cli/"],
    ["nl/cli/index.html", "https://librecv.org/nl/cli/"],
    ["privacy/index.html", "https://librecv.org/privacy/"],
    ["nl/privacy/index.html", "https://librecv.org/nl/privacy/"]
];

const styleQueries = [];
pages.forEach(function (page) {
    const html = fs.readFileSync(path.join(root, page[0]), "utf8");
    const h1 = html.match(/<h1[\s>]/g) || [];
    if (h1.length !== 1) fail(page[0] + " has " + h1.length + " h1 elements");
    const style = html.match(/href="(\/styles\.css\?v=\d+)"/);
    if (!style) fail(page[0] + " does not load /styles.css?v=");
    styleQueries.push(style[1]);
    if (html.indexOf("data-feedback") === -1) fail(page[0] + " has no feedback control");
    if (html.indexOf('class="lang-switch"') === -1) fail(page[0] + " has no language switch");
    if (html.indexOf('src="/feedback/open.js?v=2"') === -1) fail(page[0] + " does not load the feedback opener");
    if (html.indexOf("form.js") !== -1) fail(page[0] + " loads the feedback form up front");
    if (html.indexOf("/feedback/desk") !== -1) fail(page[0] + " links the inbox");
    if (page[0] === "404.html") {
        if (html.indexOf('name="robots" content="noindex"') === -1) fail("404.html must stay noindex");
        if (html.indexOf('rel="canonical"') !== -1) fail("404.html must not canonicalize itself to the homepage");
        return;
    }
    const canonical = 'rel="canonical" href="' + page[1] + '"';
    if (html.indexOf(canonical) === -1) fail(page[0] + " is missing " + canonical);
    if (page[0] !== "index.html" && html.indexOf("editor.js") !== -1) fail(page[0] + " should not load editor.js");
});
if (styleQueries.some(function (query) { return query !== styleQueries[0]; })) {
    fail("stylesheet cache queries do not match");
}

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const editorSrc = home.match(/src="(\/editor\.js\?v=\d+)"/);
if (!editorSrc) fail("index.html must load /editor.js?v=");

if (home.indexOf('rel="icon" href="/favicon.svg" type="image/svg+xml"') === -1) {
    fail("the homepage dropped the SVG favicon");
}
const iconTags = home.match(/<link rel="icon"[^>]*>/g) || [];
const rasterTag = iconTags.find(function (tag) {
    const size = tag.match(/sizes="(\d+)x(\d+)"/);
    return tag.indexOf(".svg") === -1 && size && Number(size[1]) >= 48 && size[1] === size[2];
});
if (!rasterTag) fail("the homepage does not link a non-SVG favicon of at least 48px");
const pngTag = iconTags.find(function (tag) {
    return tag.indexOf("image/png") !== -1;
});
const pngHref = pngTag && pngTag.match(/href="(\/[^"]+\.png)"/);
if (!pngHref) fail("the homepage does not link a PNG favicon");
const pngFile = fs.readFileSync(path.join(root, pngHref[1].slice(1)));
if (pngFile.slice(0, 8).toString("hex") !== "89504e470d0a1a0a") fail("the linked favicon is not a PNG file");
const pngSide = pngFile.readUInt32BE(16);
if (pngSide < 48 || pngSide !== pngFile.readUInt32BE(20) || pngSide % 48 !== 0) {
    fail("favicon PNG is not a square of at least 48 and a multiple of 48");
}
if (home.indexOf('rel="icon" href="/favicon.ico"') === -1) fail("the homepage does not link /favicon.ico");
const icoFile = fs.readFileSync(path.join(root, "favicon.ico"));
if (icoFile.length < 22 || icoFile.readUInt16LE(0) !== 0 || icoFile.readUInt16LE(2) !== 1) {
    fail("favicon.ico is not a real ICO file");
}
if (icoFile[0] === 0x3c) fail("favicon.ico is the HTML 404 page");
const icoImage = icoFile.readUInt32LE(18);
if (icoFile.readUInt32LE(icoImage) !== 40) fail("favicon.ico is a PNG inside an ICO, which Google often skips");
const icoWidth = icoFile.readInt32LE(icoImage + 4);
if (icoWidth < 48 || icoWidth % 48 !== 0 || icoFile.readInt32LE(icoImage + 8) !== icoWidth * 2) {
    fail("favicon.ico bitmap is not a square multiple of 48");
}

if (editor.indexOf("function boot()") === -1 || editor.indexOf("\nboot();\n") === -1) {
    fail("the built editor does not boot");
}

if (fs.existsSync(path.join(root, "vendor", "Sortable.min.js"))) fail("vendor/Sortable.min.js is unused");
if (/Sortable/i.test(fs.readFileSync(path.join(root, "NOTICE"), "utf8"))) fail("NOTICE still lists Sortable");

const faqBlock = home.split('id="faq"')[1].split("</details>")[0];
const faqJson = home.match(/<script type="application\/ld\+json" id="faq-ld">([\s\S]*?)<\/script>/);
if (!faqJson) fail("index.html is missing the FAQ schema");
JSON.parse(faqJson[1]).mainEntity.forEach(function (question) {
    if (faqBlock.indexOf(question.name) < 0) fail("FAQ question is not on the page: " + question.name);
    if (faqBlock.indexOf(question.acceptedAnswer.text) < 0) fail("FAQ answer is not on the page: " + question.name);
});
const nlHome = fs.readFileSync(path.join(root, "nl", "index.html"), "utf8");
const nlFaq = nlHome.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!nlFaq) fail("the Dutch page is missing its FAQ schema");
JSON.parse(nlFaq[1]).mainEntity.forEach(function (question) {
    if (nlHome.indexOf(question.name) < 0) fail("Dutch FAQ question is not on the page: " + question.name);
    if (nlHome.indexOf(question.acceptedAnswer.text) < 0) fail("Dutch FAQ answer is not on the page: " + question.name);
});

const strings = {};
vm.createContext(strings);
vm.runInContext(
    fs.readFileSync(path.join(root, "src", "editor", "i18n-nl.js"), "utf8") + "\n" +
    fs.readFileSync(path.join(root, "src", "editor", "i18n-en.js"), "utf8") +
    "\nthis.I18N_NL = I18N_NL;\nthis.I18N_EN = I18N_EN;\n",
    strings
);
function stringShape(node) {
    if (Array.isArray(node)) return node.map(stringShape);
    if (node && typeof node === "object") {
        const out = {};
        Object.keys(node).sort().forEach(function (key) {
            out[key] = stringShape(node[key]);
        });
        return out;
    }
    return typeof node;
}
if (JSON.stringify(stringShape(strings.I18N_NL)) !== JSON.stringify(stringShape(strings.I18N_EN))) {
    fail("Dutch and English interface strings do not match");
}
["I18N_NL", "I18N_EN"].forEach(function (name) {
    const preamble = strings[name].mark.preamble;
    if (/@@@CV(?![A-Za-z])/.test(preamble) || /@@@LETTER(?![A-Za-z])/.test(preamble)) {
        fail(name + " guide preamble names the document tokens");
    }
});

const marked = { t: function () { return "parse"; } };
vm.createContext(marked);
vm.runInContext(
    "function placeholderPhoto() { return 'placeholder'; }\n" +
    "function escapeHtml(value) { return String(value); }\n" +
    "function block(type, fields) { return { id: 'x', type: type, fields: fields }; }\n" +
    fs.readFileSync(path.join(root, "src", "editor", "marked.js"), "utf8") +
    "\nthis.stripCodeFence = stripCodeFence;\nthis.parseMarked = parseMarked;\nthis.pointBody = pointBody;\nthis.fieldValue = fieldValue;\nthis.placePhoto = placePhoto;\nthis.photoAddress = photoAddress;\nthis.profileBody = profileBody;\nthis.letterheadFilled = letterheadFilled;\nthis.blankEntry = blankEntry;\n",
    marked
);
const fenced = "Answer:\n```text\n@@@CV\nNAME: A\nPOINT: one\n@@@END\n```\n";
const unwrapped = marked.stripCodeFence(fenced);
if (unwrapped.indexOf("@@@CV") < 0 || unwrapped.indexOf("```") >= 0) fail("a code fence did not unwrap");
if (marked.parseMarked(fenced).kind !== "cv") fail("a fenced CV did not parse");
if (marked.pointBody("POINT: one") !== "one") fail("POINT: was not accepted");
if (marked.pointBody("- two") !== "two") fail("an old dash point was not accepted");
if (marked.pointBody("* three") !== "three") fail("an old star point was not accepted");
if (marked.pointBody("NAME: A") !== null) fail("a field line was read as a point");
const contact = "CITY: Brussels\nPHONE: \nEMAIL: \nBORN: 14-02-1967";
if (marked.fieldValue(contact, "PHONE") !== "") fail("an empty phone line took the next field");
if (marked.fieldValue(contact, "EMAIL") !== "") fail("an empty email line took the next field");
if (marked.fieldValue(contact, "BORN") !== "14-02-1967") fail("the birth date was not kept");
if (marked.fieldValue(contact, "CITY") !== "Brussels") fail("a filled contact line was lost");
if (marked.fieldValue("PHONE: +31 6 12", "PHONE") !== "+31 6 12") fail("a phone number was cut");
const page = { sidebar: [{ type: "name" }, { type: "role" }], main: [] };
marked.placePhoto(page, "CAPTION: \nASPECT: 1 / 1\nWIDTH: 80\nFILLED: yes\nURL: ");
if (page.sidebar.map(function (item) { return item.type; }).join(",") !== "name,photo,role") fail("the photo frame did not stay under the name");
const frame = page.sidebar[1].fields;
if (frame.aspect !== "1 / 1" || frame.width !== 80 || frame.src !== "placeholder" || frame.url) fail("the photo frame lost its shape");
marked.placePhoto(page, "ASPECT: 4 / 3\nCOLUMN: main\nWIDTH: 48");
if (!page.main.length || page.main[0].type !== "photo" || page.main[0].fields.aspect !== "4 / 3") fail("a main-column photo was moved");
const later = { sidebar: [{ type: "name" }, { type: "role" }, { type: "skill" }], main: [] };
marked.placePhoto(later, "FILLED: yes\nASPECT: 3 / 4\nWIDTH: 92");
if (later.sidebar[1].type !== "photo") fail("the first photo did not stay under the name");
marked.placePhoto(later, "ASPECT: 4 / 3\nWIDTH: 48");
if (later.sidebar[later.sidebar.length - 1].type !== "photo") fail("a later photo was not left where it was written");
if (marked.photoAddress("javascript:alert(1)") || marked.photoAddress("http://example.com/a.jpg")) fail("an unsafe image address was accepted");
if (marked.photoAddress("https://example.com/a.jpg") !== "https://example.com/a.jpg") fail("an https address was dropped");
const letterhead = "DATE: 31 October 2026\nTO: NATO Headquarters<br>Brussels\nSUBJECT: CV Mark Rutte";
if (!marked.letterheadFilled(letterhead)) fail("a filled letter header was dropped");
if (marked.fieldValue(letterhead, "TITLE") !== "") fail("an omitted letter title was invented");
if (marked.letterheadFilled("TITLE: \nDATE: \nTO: \nSUBJECT: ")) fail("an empty letter header was kept");
if (marked.profileBody("SUMMARY: A short line.") !== "A short line.") fail("a profile label was kept");
if (marked.profileBody("A short profile.") !== "A short profile.") fail("profile prose was changed");
if (!marked.blankEntry({ title: "", date: "", org: "", items: [] })) fail("an empty job was kept");
if (marked.blankEntry({ title: "Prime Minister", date: "", org: "", items: [] })) fail("a titled job was dropped");
["src/editor/canvas.js", "src/editor/marked.js"].forEach(function (file) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    if (source.indexOf('fields.title || escapeHtml(t("doc.letter"))') >= 0 || source.indexOf("letterhead.fields.title || escapeHtml(t(\"doc.letter\"))") >= 0) {
        fail(file + " fills an empty letter title");
    }
});

if (editor.indexOf("data-feedback") === -1) fail("the editor has no feedback control");

const opener = fs.readFileSync(path.join(root, "feedback", "open.js"), "utf8");
if (opener.indexOf('"/feedback/form.js?v=2"') === -1) fail("the feedback form is not loaded on click");
const form = fs.readFileSync(path.join(root, "feedback", "form.js"), "utf8");
if (form.indexOf("https://github.com/Vabian124/LibreCV/issues/new?") === -1) fail("the GitHub issue link is missing");
if (home.indexOf("site.distinct") === -1 || home.indexOf("SimpleCV Python library") === -1) fail("the homepage does not say this is the CV editor");
const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
if (llms.indexOf("SimpleCV Python library") === -1 || llms.indexOf("computer-vision association") === -1) fail("llms.txt does not separate this project from the vision names");
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
if (readme.indexOf("github.com/Vabian124/SimpleCV") >= 0) fail("the README still points at SimpleCV");
if (readme.indexOf("does not use GitHub Pages") === -1) fail("the README does not say GitHub Pages is off");
if (form.indexOf("maxnumber") === -1 || form.indexOf("signature") === -1) fail("the feedback form does not solve an ALTCHA challenge");
if (/ghp_|github_pat_|SPACESHIP_API/.test(form)) fail("the feedback form contains a token");
const copySource = form.slice(form.indexOf("var COPY = "), form.indexOf("var KIND_KEYS"));
const copy = vm.runInNewContext(copySource + "\nCOPY;\n");
if (JSON.stringify(stringShape(copy.en)) !== JSON.stringify(stringShape(copy.nl))) {
    fail("the feedback form English and Dutch do not match");
}
const altcha = fs.readFileSync(path.join(root, "feedback", "lib.php"), "utf8");
if (altcha.indexOf("function fb_altcha_matches") === -1 || altcha.indexOf("hash_hmac") === -1 || altcha.indexOf("return 100000") === -1) {
    fail("the private form is not checked with ALTCHA");
}
["feedback/lib.php", "feedback/submit.php", "feedback/challenge.php", "feedback/desk/index.php"].forEach(function (file) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    if (/\$2y\$|\$2a\$|\$argon2/.test(source)) fail(file + " contains a password hash");
});
const desk = fs.readFileSync(path.join(root, "feedback", "desk", "index.php"), "utf8");
if (desk.indexOf(styleQueries[0]) === -1) fail("the inbox stylesheet cache query does not match");
if (desk.indexOf("noindex") === -1) fail("the inbox must be noindex");
if (desk.indexOf('name="action" value="delete"') === -1 || desk.indexOf("Delete permanently") === -1) {
    fail("a feedback note cannot be deleted");
}
if (desk.indexOf('name="action" value="delete-all"') === -1 || desk.indexOf("Delete all notes") === -1) {
    fail("the inbox cannot clear every note");
}
const feedbackPage = fs.readFileSync(path.join(root, "feedback", "index.html"), "utf8");
if (feedbackPage.indexOf("noindex") === -1) fail("the feedback page must be noindex");
if (feedbackPage.indexOf("data-nl=") === -1) fail("the feedback page has no Dutch text");
if (opener.indexOf("documentElement.lang") === -1) fail("the feedback page does not follow the language query");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
robots.split("User-agent:").slice(1).forEach(function (block) {
    if (block.indexOf("Disallow: /feedback/") === -1) fail("a robots group does not hide /feedback/");
});
if (fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").indexOf("feedback") !== -1) fail("sitemap lists feedback");
const template = fs.readFileSync(path.join(root, ".github", "ISSUE_TEMPLATE", "feedback.yml"), "utf8");
if (template.indexOf("https://librecv.org/feedback/") === -1 || template.indexOf("Do not paste a CV") === -1) {
    fail("the GitHub feedback template does not steer an assistant");
}
if (template.indexOf("computer-vision association") === -1) fail("the GitHub feedback template does not name this project");
const steering = fs.readFileSync(path.join(root, "feedback.txt"), "utf8");
if (steering.indexOf("Do not invent a CV") === -1) fail("feedback.txt does not tell an assistant to leave the document out");
if (steering.indexOf("ALTCHA") === -1) fail("feedback.txt does not name the ALTCHA check");
if (steering.indexOf("More menu") !== -1) fail("feedback.txt still puts Feedback in the More menu");
if (steering.indexOf("button in the header") === -1) fail("feedback.txt does not put Feedback in the editor header");
const guide = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
if (guide.indexOf("/feedback/desk") !== -1) fail("llms.txt points at the inbox");
if (guide.indexOf("https://librecv.org/feedback.txt") === -1) fail("llms.txt does not point at the feedback instructions");
if (guide.indexOf("/cli/") === -1) fail("llms.txt does not mention the PDF command");
if (guide.indexOf("Reset clears them") === -1) fail("llms.txt does not mention saved copies");
if (fs.readFileSync(path.join(root, "motivation-letter", "index.html"), "utf8").indexOf("/?template=visitor-letter&amp;lang=en") < 0) {
    fail("the English letter example does not open in the editor");
}
if (fs.readFileSync(path.join(root, "nl", "motivatiebrief", "index.html"), "utf8").indexOf("/?template=publieksdienst-letter&amp;lang=nl") < 0) {
    fail("the Dutch letter example does not open in the editor");
}
["visitor-letter", "publieksdienst-letter"].forEach(function (id) {
    const text = fs.readFileSync(path.join(root, "catalog", id + ".txt"), "utf8");
    if (editor.indexOf(JSON.stringify(text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\s+$/, ""))) < 0) {
        fail("the editor is missing " + id);
    }
});

const saves = {
    localStorage: { data: {}, getItem: function (key) { return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null; }, setItem: function (key, value) { this.data[key] = String(value); }, removeItem: function (key) { delete this.data[key]; } },
    document: { getElementById: function () { return null; }, querySelectorAll: function () { return []; } },
    doc: { version: 1, kind: "letter", lang: "en", theme: {}, sidebar: [], main: [] },
    currentSaveId: "",
    saveSwap: false,
    filenameCustom: false,
    t: function (key) { return key; },
    plainName: function () { return "Sam"; },
    showStatus: function () {},
    showToast: function () {},
    h: function () { return { addEventListener: function () {}, classList: { add: function () {} }, appendChild: function () {} }; }
};
vm.createContext(saves);
vm.runInContext(
    "let currentSaveId = '';\nlet saveSwap = false;\nlet filenameCustom = false;\n" +
    fs.readFileSync(path.join(root, "src", "editor", "saves.js"), "utf8") +
    "\nthis.readSaves = readSaves;\nthis.rememberSave = rememberSave;\nthis.clearSaves = clearSaves;\nthis.STORAGE_SAVES = STORAGE_SAVES;\n",
    saves
);
saves.rememberSave(false);
const stored = JSON.parse(saves.localStorage.data["cv-tool-saves"]);
if (!stored.length || stored[0].kind !== "letter" || stored[0].doc.version !== 1) fail("a save was not stored");
saves.clearSaves();
if (saves.localStorage.data["cv-tool-saves"] !== "[]") fail("reset did not clear the saved copies");

const templatePages = require("./template-pages.js");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
templatePages.pages.forEach(function (page) {
    const text = templatePages.readCatalog(page.id);
    const html = fs.readFileSync(path.join(root, page.out), "utf8");
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (html.indexOf(escaped) < 0) fail(page.out + " does not contain its block");
    if (html.indexOf("/?template=" + page.id + "&amp;lang=") < 0) fail(page.out + " does not open its block");
    const pdfPath = page.url.slice("https://librecv.org".length) + "document.pdf";
    if (html.indexOf(pdfPath) < 0) fail(page.out + " does not show its PDF");
    const pdfBytes = fs.readFileSync(path.join(root, path.dirname(page.out), "document.pdf"));
    if (pdfBytes.slice(0, 5).toString() !== "%PDF-") fail(page.out + " PDF is not a PDF");
    if (sitemap.indexOf("https://librecv.org" + pdfPath) < 0) fail("sitemap is missing " + pdfPath);
    if (sitemap.indexOf(page.url) < 0) fail("sitemap is missing " + page.url);
    if (editor.indexOf(JSON.stringify(text)) < 0) fail("the editor is missing " + page.id);
});
if (sitemap.indexOf("https://librecv.org/cli/") < 0) fail("sitemap is missing the PDF command");
if (editor.indexOf("function openRequestedTemplate()") < 0) fail("the editor cannot open a named block");

const pdfCli = require("./pdf.js");
const PDFLib = require(path.join(root, "vendor", "pdf-lib.min.js"));
pdfCli.renderMarkedPdf(templatePages.readCatalog("nursing-cv"), "en").then(function (bytes) {
    if (Buffer.from(bytes).slice(0, 5).toString() !== "%PDF-") fail("the PDF command did not write a PDF");
    return PDFLib.PDFDocument.load(bytes);
}).then(function (pdf) {
    const names = pdf.catalog.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFDict);
    const embedded = names.lookup(PDFLib.PDFName.of("EmbeddedFiles"), PDFLib.PDFDict);
    const list = embedded.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFArray);
    if (list.lookup(0).decodeText() !== "document.json") fail("the PDF command dropped document.json");
    return pdfCli.renderMarkedPdf(templatePages.readCatalog("nursing-letter"), "en");
}).then(function (bytes) {
    return PDFLib.PDFDocument.load(bytes);
}).then(function (pdf) {
    const names = pdf.catalog.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFDict);
    const embedded = names.lookup(PDFLib.PDFName.of("EmbeddedFiles"), PDFLib.PDFDict);
    const list = embedded.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFArray);
    const spec = list.lookup(1);
    const file = spec.lookup(PDFLib.PDFName.of("EF"), PDFLib.PDFDict).lookup(PDFLib.PDFName.of("F"));
    const raw = zlib.inflateSync(Buffer.from(file.getContents()));
    const saved = JSON.parse(raw.toString("utf8"));
    if (saved.theme.sidebar !== "#14532d" || saved.theme.accentLight !== "#6ee7b7") fail("the PDF command dropped the sidebar colours");
    const photo = saved.sidebar.filter(function (item) { return item.type === "photo" && item.fields.src; })[0];
    if (!photo) fail("the PDF command dropped the sidebar photo");
    const painted = zlib.inflateSync(Buffer.from(pdf.context.lookup(pdf.getPage(0).node.Contents().asArray()[0]).contents)).toString("latin1");
    if (painted.indexOf("<4E4F4F52>") < 0) fail("the PDF command did not paint the name");
    if (painted.indexOf("0.43137254901960786") < 0) fail("the PDF command did not paint the sidebar accent");
    if (painted.indexOf("0.8392156862745098") < 0) fail("the PDF command did not paint the photo mark");
    console.log("ok");
}).catch(function (error) {
    fail(error && error.stack ? error.stack : String(error));
});
