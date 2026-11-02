/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const asset = "25";
const pdfCli = require("./pdf.js");

function readCatalog(id) {
    return fs.readFileSync(path.join(root, "catalog", id + ".txt"), "utf8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\s+$/, "");
}

function sitePath(url) {
    return url.slice("https://librecv.org".length) || "/";
}

function langSwitch(lang, enPath, nlPath) {
    const label = lang === "nl" ? "Taal" : "Language";
    const nlCurrent = lang === "nl" ? " aria-current=\"page\"" : "";
    const enCurrent = lang === "en" ? " aria-current=\"page\"" : "";
    return "            <nav class=\"lang-switch\" aria-label=\"" + label + "\">\n" +
        "                <a href=\"" + esc(nlPath) + "\" lang=\"nl\" hreflang=\"nl\"" + nlCurrent + ">NL</a>\n" +
        "                <a href=\"" + esc(enPath) + "\" lang=\"en\" hreflang=\"en\"" + enCurrent + ">EN</a>\n" +
        "            </nav>\n";
}

function esc(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

const enSteps = [
    "Open https://librecv.org/ . For Dutch buttons, add ?lang=nl . Choose a CV or a motivation letter.",
    "On the AI step, replace the whole box with the block below. Create the document.",
    "Or, in the editor, open Use your own AI, paste the block over the box, and press Paste text.",
    "Download the PDF from the header. That PDF can be imported later because it carries document.json. Nothing is uploaded."
];

const nlSteps = [
    "Open https://librecv.org/?lang=nl . Kies een cv of een motivatiebrief.",
    "Vervang bij de AI-stap het hele vak door het blok hieronder. Maak het document.",
    "Of open in de editor Gebruik je eigen AI, plak het blok over het vak, en druk op Tekst plakken.",
    "Download de PDF in de kop. Die PDF kun je later opnieuw openen, want hij bevat document.json. Er wordt niets geüpload."
];

const softwareSample = [
    "<article class=\"sample sample-split\" aria-label=\"Example software engineer CV\">",
    "<aside>",
    "<p class=\"sample-kicker\">Skills</p>",
    "<p>TypeScript</p>",
    "<p>Python</p>",
    "<p>Tests and reviews</p>",
    "<p class=\"sample-kicker\">Contact</p>",
    "<p>rae@example.com</p>",
    "</aside>",
    "<div>",
    "<p class=\"sample-name\">Rae Okonkwo</p>",
    "<p>Software engineer</p>",
    "<p class=\"sample-label\">Projects</p>",
    "<p>Catalogue search stayed under a second after the collection passed a million rows.</p>",
    "<p>A review checklist cut the repeat comments on pull requests.</p>",
    "</div>",
    "</article>"
].join("\n");

const nursingSample = [
    "<article class=\"sample sample-band\" aria-label=\"Example nursing CV\">",
    "<header>",
    "<p class=\"sample-name\">Noor El Amrani</p>",
    "<p>Registered nurse</p>",
    "</header>",
    "<div class=\"sample-cols\">",
    "<div>",
    "<p class=\"sample-label\">Wards</p>",
    "<p>Medical admissions, 28 beds, including the night handover.</p>",
    "<p>A day clinic for wound reviews, twice a week.</p>",
    "</div>",
    "<div>",
    "<p class=\"sample-label\">Shifts</p>",
    "<p>Charge nurse on a Sunday, when the team was short.</p>",
    "<p>Student supervision on the early shift.</p>",
    "</div>",
    "</div>",
    "</article>"
].join("\n");

const pages = [
    {
        id: "software-engineer-cv",
        out: "templates/software-engineer/index.html",
        lang: "en",
        url: "https://librecv.org/templates/software-engineer/",
        pair: "https://librecv.org/nl/sjablonen/softwareontwikkelaar/",
        title: "Software engineer CV template — LibreCV",
        description: "A free software engineer CV template. No account and no paywall. Tools in the sidebar, and a result on each project. Rae Okonkwo is invented.",
        h1: "Software engineer CV template",
        lead: "Put the tools in the sidebar. Put the work on the page, and say what changed because of it. There is no account and no charge for the PDF.",
        open: "Open this CV in LibreCV",
        tipsTitle: "What to include",
        tips: [
            "A role line, such as software engineer, not a list of every language.",
            "One result on each project: what was slow, unclear, or missing, and what you did.",
            "Languages and tools as short skills. Verbs that fit: shipped, tested, wrote, kept.",
            "Leave the picture file out. The frame stays so the layout does not jump."
        ],
        sample: softwareSample,
        note: "Rae Okonkwo is invented. The employers, the dates and rae@example.com are invented.",
        steps: enSteps,
        stepsTitle: "How to load this block",
        blockTitle: "The block",
        command: "node scripts/pdf.js catalog/software-engineer-cv.txt -o cv.pdf",
        related: [
            ["/templates/software-engineer/letter/", "Software engineer motivation letter"],
            ["/nl/sjablonen/softwareontwikkelaar/", "Nederlandse cv"],
            ["/templates/nursing/", "Nursing CV"],
            ["/templates/", "All examples"],
            ["/cli/", "PDF command"]
        ]
    },
    {
        id: "software-engineer-letter",
        out: "templates/software-engineer/letter/index.html",
        lang: "en",
        url: "https://librecv.org/templates/software-engineer/letter/",
        pair: "https://librecv.org/nl/sjablonen/softwareontwikkelaar/brief/",
        title: "Software engineer motivation letter — LibreCV",
        description: "A free software engineer motivation letter. No account and no paywall. Rae Okonkwo is invented. The PDF stays on your computer.",
        h1: "Software engineer motivation letter",
        lead: "Two short sections: what was slow, then the review a teammate can follow. The vacancy is invented.",
        open: "Open this letter in LibreCV",
        tipsTitle: "What to include",
        tips: [
            "The role in the subject line, not a list of every language.",
            "One result in the first paragraphs: what changed.",
            "A closing and your name. Verbs that fit: shipped, tested, wrote, kept."
        ],
        sample: "",
        note: "Rae Okonkwo is invented. Example Catalogue Ltd and Example Bureau are invented.",
        steps: enSteps,
        stepsTitle: "How to load this block",
        blockTitle: "The block",
        command: "node scripts/pdf.js catalog/software-engineer-letter.txt -o letter.pdf",
        related: [
            ["/templates/software-engineer/", "Software engineer CV"],
            ["/nl/sjablonen/softwareontwikkelaar/brief/", "Nederlandse brief"],
            ["/motivation-letter/", "Motivation letter"],
            ["/templates/", "All examples"],
            ["/cli/", "PDF command"]
        ]
    },
    {
        id: "nursing-cv",
        out: "templates/nursing/index.html",
        lang: "en",
        url: "https://librecv.org/templates/nursing/",
        pair: "https://librecv.org/nl/sjablonen/verpleegkundige/",
        title: "Registered nurse CV template — LibreCV",
        description: "A free registered nurse CV template. No account and no paywall. Registration, wards and shifts. Noor El Amrani is invented. Not clinical advice.",
        h1: "Registered nurse CV template",
        lead: "Lead with the registration and where you have worked. A hiring ward reads that before a list of tools. This page does not give clinical advice.",
        open: "Open this CV in LibreCV",
        tipsTitle: "What to include",
        tips: [
            "Your registration, and the body that holds it, on a contact row. The number EX-0000 is fake. Do not copy it.",
            "Wards or clinics, with the kind of work, not a slogan.",
            "Shift work when that is the job: nights, charge, or a clinic day.",
            "Verbs that fit: kept, listed, covered, supervised."
        ],
        sample: nursingSample,
        note: "Noor El Amrani is invented. Do not copy the registration line unless it is yours.",
        steps: enSteps,
        stepsTitle: "How to load this block",
        blockTitle: "The block",
        command: "node scripts/pdf.js catalog/nursing-cv.txt -o cv.pdf",
        related: [
            ["/templates/nursing/letter/", "Registered nurse motivation letter"],
            ["/nl/sjablonen/verpleegkundige/", "Nederlandse cv"],
            ["/templates/software-engineer/", "Software engineer CV"],
            ["/templates/", "All examples"],
            ["/cli/", "PDF command"]
        ]
    },
    {
        id: "nursing-letter",
        out: "templates/nursing/letter/index.html",
        lang: "en",
        url: "https://librecv.org/templates/nursing/letter/",
        pair: "https://librecv.org/nl/sjablonen/verpleegkundige/brief/",
        title: "Registered nurse motivation letter — LibreCV",
        description: "A free registered nurse motivation letter. No account and no paywall. Noor El Amrani is invented. Not clinical advice.",
        h1: "Registered nurse motivation letter",
        lead: "The ward first, then the shift. The letter is an example of arrangement, not clinical advice.",
        open: "Open this letter in LibreCV",
        tipsTitle: "What to include",
        tips: [
            "A registration line that is yours. The sample number EX-0000 is not real.",
            "The ward and the kind of shift, in short paragraphs.",
            "No treatment instructions. Verbs that fit: kept, listed, covered, supervised."
        ],
        sample: "",
        note: "Noor El Amrani is invented. Example Medical Ward exists only in this letter.",
        steps: enSteps,
        stepsTitle: "How to load this block",
        blockTitle: "The block",
        command: "node scripts/pdf.js catalog/nursing-letter.txt -o letter.pdf",
        related: [
            ["/templates/nursing/", "Registered nurse CV"],
            ["/nl/sjablonen/verpleegkundige/brief/", "Nederlandse brief"],
            ["/motivation-letter/", "Motivation letter"],
            ["/templates/", "All examples"],
            ["/cli/", "PDF command"]
        ]
    },
    {
        id: "softwareontwikkelaar-cv",
        out: "nl/sjablonen/softwareontwikkelaar/index.html",
        lang: "nl",
        url: "https://librecv.org/nl/sjablonen/softwareontwikkelaar/",
        pair: "https://librecv.org/templates/software-engineer/",
        title: "CV softwareontwikkelaar — LibreCV",
        description: "Gratis cv voor een softwareontwikkelaar. Geen account en geen betaalmuur. Pim Vogel is verzonnen. De PDF blijft op je computer.",
        h1: "CV softwareontwikkelaar",
        lead: "Gereedschap in de zijbalk. Projecten, met een resultaat, op de pagina. Geen account en geen betaling voor de PDF.",
        open: "Open dit cv in LibreCV",
        tipsTitle: "Wat je opneemt",
        tips: [
            "Een rolregel met de functietitel, niet een lijst van elke taal.",
            "Eén resultaat per project: wat traag of onduidelijk was, en wat er veranderde.",
            "Korte vaardigheden. Werkwoorden die passen: leverde, testte, schreef, hield bij.",
            "Laat het beeldbestand weg. Het kader blijft staan."
        ],
        sample: "",
        note: "Pim Vogel is verzonnen. De werkgevers, de datums en pim@example.com zijn verzonnen.",
        steps: nlSteps,
        stepsTitle: "Zo laad je dit blok",
        blockTitle: "Het blok",
        command: "node scripts/pdf.js catalog/softwareontwikkelaar-cv.txt -o cv.pdf",
        related: [
            ["/nl/sjablonen/softwareontwikkelaar/brief/", "Motivatiebrief softwareontwikkelaar"],
            ["/templates/software-engineer/", "English CV"],
            ["/nl/sjablonen/verpleegkundige/", "CV verpleegkundige"],
            ["/templates/", "Alle voorbeelden"],
            ["/nl/cli/", "PDF-commando"]
        ]
    },
    {
        id: "softwareontwikkelaar-letter",
        out: "nl/sjablonen/softwareontwikkelaar/brief/index.html",
        lang: "nl",
        url: "https://librecv.org/nl/sjablonen/softwareontwikkelaar/brief/",
        pair: "https://librecv.org/templates/software-engineer/letter/",
        title: "Motivatiebrief softwareontwikkelaar — LibreCV",
        description: "Gratis motivatiebrief voor een softwareontwikkelaar. Geen account en geen betaalmuur. Pim Vogel is verzonnen.",
        h1: "Motivatiebrief softwareontwikkelaar",
        lead: "Eerst de vraag, dan de pagina. De vacature is verzonnen. De PDF blijft op je computer.",
        open: "Open deze brief in LibreCV",
        tipsTitle: "Wat je opneemt",
        tips: [
            "De functie in het onderwerp, niet een lijst van elke taal.",
            "Eén resultaat in de eerste alinea's.",
            "Een afsluiting en je naam. Werkwoorden die passen: leverde, testte, schreef, hield bij."
        ],
        sample: "",
        note: "Pim Vogel is verzonnen. Voorbeeldcatalogus BV en Voorbeeldbureau bestaan alleen in deze brief.",
        steps: nlSteps,
        stepsTitle: "Zo laad je dit blok",
        blockTitle: "Het blok",
        command: "node scripts/pdf.js catalog/softwareontwikkelaar-letter.txt -o brief.pdf",
        related: [
            ["/nl/sjablonen/softwareontwikkelaar/", "CV softwareontwikkelaar"],
            ["/templates/software-engineer/letter/", "English letter"],
            ["/nl/motivatiebrief/", "Motivatiebrief"],
            ["/templates/", "Alle voorbeelden"],
            ["/nl/cli/", "PDF-commando"]
        ]
    },
    {
        id: "verpleegkundige-cv",
        out: "nl/sjablonen/verpleegkundige/index.html",
        lang: "nl",
        url: "https://librecv.org/nl/sjablonen/verpleegkundige/",
        pair: "https://librecv.org/templates/nursing/",
        title: "CV verpleegkundige — LibreCV",
        description: "Gratis cv voor een verpleegkundige. Geen account en geen betaalmuur. Esmee Hof is verzonnen. Geen zorgadvies.",
        h1: "CV verpleegkundige",
        lead: "Eerst de registratie, daarna de afdeling en de dienst. Dit is geen zorgadvies. Geen account en geen betaling voor de PDF.",
        open: "Open dit cv in LibreCV",
        tipsTitle: "Wat je opneemt",
        tips: [
            "Je registratie, en de instantie die haar houdt, op een contactregel. Het nummer EX-0000 is nep. Kopieer het niet.",
            "Afdelingen of klinieken, met het soort werk, niet een slogan.",
            "Diensten als het werk uit diensten bestaat.",
            "Werkwoorden die passen: hield bij, zette op een lijst, begeleidde."
        ],
        sample: "",
        note: "Esmee Hof is verzonnen. Kopieer de registratieregel niet, tenzij hij van jou is.",
        steps: nlSteps,
        stepsTitle: "Zo laad je dit blok",
        blockTitle: "Het blok",
        command: "node scripts/pdf.js catalog/verpleegkundige-cv.txt -o cv.pdf",
        related: [
            ["/nl/sjablonen/verpleegkundige/brief/", "Motivatiebrief verpleegkundige"],
            ["/templates/nursing/", "English CV"],
            ["/nl/sjablonen/softwareontwikkelaar/", "CV softwareontwikkelaar"],
            ["/templates/", "Alle voorbeelden"],
            ["/nl/cli/", "PDF-commando"]
        ]
    },
    {
        id: "verpleegkundige-letter",
        out: "nl/sjablonen/verpleegkundige/brief/index.html",
        lang: "nl",
        url: "https://librecv.org/nl/sjablonen/verpleegkundige/brief/",
        pair: "https://librecv.org/templates/nursing/letter/",
        title: "Motivatiebrief verpleegkundige — LibreCV",
        description: "Gratis motivatiebrief voor een verpleegkundige. Geen account en geen betaalmuur. Esmee Hof is verzonnen. Geen zorgadvies.",
        h1: "Motivatiebrief verpleegkundige",
        lead: "Eerst de afdeling, dan de dienst. De brief toont een indeling, geen zorgadvies.",
        open: "Open deze brief in LibreCV",
        tipsTitle: "Wat je opneemt",
        tips: [
            "Een registratieregel die van jou is. Het voorbeeldnummer EX-0000 is niet echt.",
            "De afdeling en het soort dienst, in korte alinea's.",
            "Geen behandeladvies. Werkwoorden die passen: hield bij, zette op een lijst, begeleidde."
        ],
        sample: "",
        note: "Esmee Hof is verzonnen. Voorbeeldafdeling bestaat alleen in deze brief.",
        steps: nlSteps,
        stepsTitle: "Zo laad je dit blok",
        blockTitle: "Het blok",
        command: "node scripts/pdf.js catalog/verpleegkundige-letter.txt -o brief.pdf",
        related: [
            ["/nl/sjablonen/verpleegkundige/", "CV verpleegkundige"],
            ["/templates/nursing/letter/", "English letter"],
            ["/nl/motivatiebrief/", "Motivatiebrief"],
            ["/templates/", "Alle voorbeelden"],
            ["/nl/cli/", "PDF-commando"]
        ]
    }
];

function render(page) {
    const text = readCatalog(page.id);
    const locale = page.lang === "nl" ? "nl_NL" : "en_US";
    const otherLocale = page.lang === "nl" ? "en_US" : "nl_NL";
    const imageAlt = page.lang === "nl"
        ? "LibreCV, een gratis editor voor een CV of motivatiebrief. Geen account."
        : "LibreCV, a free CV and motivation-letter builder. No account.";
    const xDefault = page.lang === "en" ? page.url : page.pair;
    const distinct = page.lang === "nl"
        ? "Deze LibreCV schrijft een CV of een motivatiebrief. Het is niet de LibreCV-vereniging voor computervisie, en niet de Python-bibliotheek SimpleCV."
        : "This LibreCV writes a CV or a motivation letter. It is not the LibreCV computer-vision association, and it is not the SimpleCV Python library.";
    const navLabel = page.lang === "nl" ? "Meer pagina's" : "Related pages";
    const loadNote = page.lang === "nl"
        ? "De knop opent dit blok in de editor. Je kunt het blok hieronder ook zelf plakken."
        : "The button opens this block in the editor. You can also paste the block below yourself.";
    const commandLead = page.lang === "nl"
        ? "Hetzelfde blok maakt een PDF vanaf de opdrachtregel. De tekst is selecteerbaar, en de PDF bevat document.json."
        : "The same block makes a PDF from the command line. The text can be selected, and the PDF carries document.json.";
    const pdfLead = page.lang === "nl"
        ? "Dit is het document. De tekst is selecteerbaar. De PDF bevat document.json, zodat de editor hem opnieuw kan openen."
        : "This is the document. The text can be selected. The PDF carries document.json, so the editor can open it again.";
    const pdfLink = page.lang === "nl" ? "Download de PDF" : "Download the PDF";
    const pdfTitle = page.lang === "nl" ? "De PDF" : "The PDF";
    const pdfPath = sitePath(page.url) + "document.pdf";
    const enPath = sitePath(page.lang === "en" ? page.url : page.pair);
    const nlPath = sitePath(page.lang === "nl" ? page.url : page.pair);
    const tips = page.tips.map(function (tip) { return "<li>" + esc(tip) + "</li>"; }).join("\n");
    const steps = page.steps.map(function (step) { return "<li>" + esc(step) + "</li>"; }).join("\n");
    const related = page.related.map(function (link) {
        return "<a href=\"" + esc(link[0]) + "\">" + esc(link[1]) + "</a>";
    }).join("\n");
    const sample = page.sample ? "<h2>" + (page.lang === "nl" ? "Een indeling" : "A layout") + "</h2>\n" + page.sample + "\n" : "";
    return "<!DOCTYPE html>\n" +
        "<!-- CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ -->\n" +
        "<html lang=\"" + page.lang + "\">\n" +
        "<head>\n" +
        "    <meta charset=\"UTF-8\">\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
        "    <title>" + esc(page.title) + "</title>\n" +
        "    <meta name=\"description\" content=\"" + esc(page.description) + "\">\n" +
        "    <link rel=\"canonical\" href=\"" + esc(page.url) + "\">\n" +
        "    <link rel=\"alternate\" hreflang=\"en\" href=\"" + esc(page.lang === "en" ? page.url : page.pair) + "\">\n" +
        "    <link rel=\"alternate\" hreflang=\"nl\" href=\"" + esc(page.lang === "nl" ? page.url : page.pair) + "\">\n" +
        "    <link rel=\"alternate\" hreflang=\"x-default\" href=\"" + esc(xDefault) + "\">\n" +
        "    <meta name=\"robots\" content=\"index, follow\">\n" +
        "    <meta name=\"theme-color\" content=\"#0f172a\">\n" +
        "    <meta property=\"og:type\" content=\"website\">\n" +
        "    <meta property=\"og:site_name\" content=\"LibreCV\">\n" +
        "    <meta property=\"og:title\" content=\"" + esc(page.title) + "\">\n" +
        "    <meta property=\"og:description\" content=\"" + esc(page.description) + "\">\n" +
        "    <meta property=\"og:url\" content=\"" + esc(page.url) + "\">\n" +
        "    <meta property=\"og:locale\" content=\"" + locale + "\">\n" +
        "    <meta property=\"og:locale:alternate\" content=\"" + otherLocale + "\">\n" +
        "    <meta name=\"twitter:card\" content=\"summary_large_image\">\n" +
        "    <meta name=\"twitter:title\" content=\"" + esc(page.title) + "\">\n" +
        "    <meta name=\"twitter:description\" content=\"" + esc(page.description) + "\">\n" +
        "    <meta name=\"twitter:image\" content=\"https://librecv.org/og.png\">\n" +
        "    <meta name=\"twitter:image:alt\" content=\"" + esc(imageAlt) + "\">\n" +
        "    <meta property=\"og:image\" content=\"https://librecv.org/og.png\">\n" +
        "    <meta property=\"og:image:type\" content=\"image/png\">\n" +
        "    <meta property=\"og:image:width\" content=\"1200\">\n" +
        "    <meta property=\"og:image:height\" content=\"630\">\n" +
        "    <meta property=\"og:image:alt\" content=\"" + esc(imageAlt) + "\">\n" +
        "    <link rel=\"icon\" href=\"/favicon.ico\" sizes=\"48x48\" type=\"image/x-icon\">\n" +
        "    <link rel=\"icon\" href=\"/favicon.png\" sizes=\"96x96\" type=\"image/png\">\n" +
        "    <link rel=\"icon\" href=\"/favicon.svg\" type=\"image/svg+xml\">\n" +
        "    <link rel=\"apple-touch-icon\" href=\"/icon-192.png\">\n" +
        "    <link rel=\"manifest\" href=\"/manifest.json\">\n" +
        "    <link rel=\"stylesheet\" href=\"/styles.css?v=" + asset + "\">\n" +
        "    <script type=\"application/ld+json\">\n" +
        "    {\n" +
        "        \"@context\": \"https://schema.org\",\n" +
        "        \"@type\": \"CreativeWork\",\n" +
        "        \"name\": " + JSON.stringify(page.h1) + ",\n" +
        "        \"headline\": " + JSON.stringify(page.h1) + ",\n" +
        "        \"inLanguage\": " + JSON.stringify(page.lang) + ",\n" +
        "        \"isAccessibleForFree\": true,\n" +
        "        \"url\": " + JSON.stringify(page.url) + ",\n" +
        "        \"description\": " + JSON.stringify(page.description) + ",\n" +
        "        \"creator\": { \"@type\": \"Organization\", \"name\": \"LibreCV\", \"url\": \"https://librecv.org/\" }\n" +
        "    }\n" +
        "    </script>\n" +
        "</head>\n" +
        "<body>\n" +
        "    <main class=\"setup\">\n" +
        "        <article class=\"guide-page\">\n" +
        "            <div class=\"page-tools\">\n" +
        "            <p class=\"kicker\">LibreCV. " + (page.lang === "nl" ? "Geen account." : "No account.") + "</p>\n" +
        langSwitch(page.lang, enPath, nlPath) +
        "            </div>\n" +
        "            <h1>" + esc(page.h1) + "</h1>\n" +
        "            <p class=\"setup-lead\">" + esc(page.lead) + "</p>\n" +
        "            <p><a class=\"btn-primary\" href=\"/?template=" + esc(page.id) + "&amp;lang=" + page.lang + "\">" + esc(page.open) + "</a></p>\n" +
        "            <h2>" + pdfTitle + "</h2>\n" +
        "            <p>" + esc(pdfLead) + "</p>\n" +
        "            <figure class=\"pdf-preview\">\n" +
        "                <div class=\"pdf-sheet\">\n" +
        "                    <iframe src=\"" + esc(pdfPath) + "#toolbar=0&navpanes=0&view=Fit\" title=\"" + esc(page.h1) + "\"></iframe>\n" +
        "                </div>\n" +
        "                <figcaption class=\"pdf-actions\">\n" +
        "                    <a class=\"btn-primary\" href=\"/?template=" + esc(page.id) + "&amp;lang=" + page.lang + "\">" + esc(page.open) + "</a>\n" +
        "                    <a class=\"btn\" href=\"" + esc(pdfPath) + "\">" + esc(pdfLink) + "</a>\n" +
        "                </figcaption>\n" +
        "            </figure>\n" +
        "            <h2>" + esc(page.tipsTitle) + "</h2>\n" +
        "            <ul>\n" + tips + "\n            </ul>\n" +
        sample +
        "            <h2>" + esc(page.stepsTitle) + "</h2>\n" +
        "            <p>" + esc(loadNote) + "</p>\n" +
        "            <ol>\n" + steps + "\n            </ol>\n" +
        "            <h2>" + esc(page.blockTitle) + "</h2>\n" +
        "            <pre class=\"marked\"><code>" + esc(text) + "</code></pre>\n" +
        "            <p class=\"sample-note\">" + esc(page.note) + "</p>\n" +
        "            <h2>" + (page.lang === "nl" ? "Opdrachtregel" : "Command line") + "</h2>\n" +
        "            <p>" + esc(commandLead) + "</p>\n" +
        "            <p><code>" + esc(page.command) + "</code></p>\n" +
        "            <p>" + esc(distinct) + "</p>\n" +
        "            <nav class=\"guide-links\" aria-label=\"" + esc(navLabel) + "\">\n" +
        related + "\n" +
        "                <button type=\"button\" class=\"quiet-link\" data-feedback>Feedback</button>\n" +
        "            </nav>\n" +
        "        </article>\n" +
        "    </main>\n" +
        "    <script src=\"/feedback/open.js?v=2\" defer></script>\n" +
        "</body>\n" +
        "</html>\n";
}

async function writePages() {
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const file = path.join(root, page.out);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, render(page));
        const bytes = await pdfCli.renderMarkedPdf(readCatalog(page.id), page.lang);
        fs.writeFileSync(path.join(path.dirname(file), "document.pdf"), Buffer.from(bytes));
    }
}

if (require.main === module) {
    writePages().catch(function (error) {
        process.stderr.write((error && error.stack ? error.stack : String(error)) + "\n");
        process.exit(1);
    });
}

module.exports = { pages: pages, render: render, readCatalog: readCatalog, asset: asset };
