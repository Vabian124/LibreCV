/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Storage keys and the block types the editor can place. */

const STORAGE_DOC = "cv-tool-document";
const STORAGE_LANG = "cv-tool-lang";
const STORAGE_NAME = "cv-tool-filename";
const ALL_BLOCKS = [
    "name", "photo", "role", "contact", "heading", "skill", "competence", "project",
    "intro", "timeline", "paragraph", "list", "letterhead", "closing", "signature", "spacer"
];

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Mutable editor state: the open document, language, and lazy-load promises. */

let lang = "en";
let doc = null;
let selectedId = null;
let addTarget = "main";
let activeDragCancel = null;
let seq = 1;
let past = [];
let future = [];
let snapArmed = false;
let activeField = null;
let fontConfigPromise = null;
let fontConfigKey = "";
let setupState = { step: 1, kind: "", source: "", palette: "", guideIndex: 0, answers: null };
const PALETTES = {
    zakelijk: { sidebar: "#1e293b", sidebarText: "#f8fafc", accent: "#0284c7", accentLight: "#38bdf8", page: "#ffffff", text: "#334155" },
    groen: { sidebar: "#0b1d16", sidebarText: "#ffffff", accent: "#047857", accentLight: "#6ee7b7", page: "#ffffff", text: "#111827" },
    minimal: { sidebar: "#f4f4f5", sidebarText: "#18181b", accent: "#18181b", accentLight: "#18181b", page: "#ffffff", text: "#18181b" }
};
let stageScale = 1;
let zoomTouched = false;
let filenameCustom = false;
let setupReturn = false;
let saveOk = true;
let saveTimer = 0;
let toastTimer = 0;
let photoReturnFocus = null;
let documentLive = false;
let currentSaveId = "";
let saveSwap = false;
let routeLock = false;
let chromeProceed = false;
let chromeAction = null;
let aiBoxSource = "";
let assetLoads = {};
let pdfLibsPromise = null;
let cropperPromise = null;

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Dutch strings. */

const I18N_NL = {
    ui: {
        title: "LibreCV",
        download: "Download PDF",
        import: "Importeer PDF",
        fileName: "Bestandsnaam",
        timestamp: "Tijdstip in de naam",
        final: "Voeg final toe",
        undo: "Ongedaan",
        redo: "Opnieuw",
        templates: "Sjabloon",
        showcase: "Showcase",
        emptyCv: "Lege CV",
        emptyLetter: "Lege brief",
        theme: "Document",
        sidebarColor: "Zijbalkkleur",
        sidebarText: "Tekst in de zijbalk",
        accent: "Accent",
        page: "Paginakleur",
        text: "Tekstkleur",
        baseSize: "Basisgrootte",
        column: "Kolombreedte",
        block: "Geselecteerd blok",
        none: "Klik een blok in de pagina.",
        blockColor: "Tekstkleur van het blok",
        blockBg: "Achtergrond van het blok",
        blockSize: "Tekstgrootte van het blok",
        resetStyle: "Stijl wissen",
        duplicate: "Dupliceer",
        delete: "Verwijder",
        add: "Blok toevoegen",
        blocks: "Blokken",
        dragHint: "Klik om toe te voegen. Sleep een blok naar de zijbalk of de pagina; Escape zet het terug.",
        dragHintTouch: "Tik een blok om het toe te voegen. Sleep het handvat rechts om het op de pagina te zetten.",
        placeBlock: "Sleep naar de pagina",
        addTo: "Toevoegen aan",
        sidebar: "Zijbalk",
        main: "Pagina",
        format: "Opmaak",
        bold: "Vet",
        italic: "Cursief",
        underline: "Onderstrepen",
        addLine: "Regel toevoegen",
        hint: "Selecteer tekst in een blok om alleen dat stuk een kleur of grootte te geven.",
        file: "Bestand",
        thisBlock: "Dit blok",
        model: "Kopiëren naar een AI",
        modelHint: "Tekst ophalen kopieert een sjabloon. Plak het in je AI. Een oud CV en de vacature zijn optioneel; plak ze onder het sjabloon als je ze hebt. Kopieer het codeblok dat je terugkrijgt, zet dat hier, en druk op Tekst plakken. Er gaat niets naar een server.",
        copy: "Tekst ophalen",
        copied: "Gekopieerd",
        applyText: "Tekst plakken",
        applied: "De pagina is bijgewerkt",
        copyFailed: "Kopiëren lukte niet. De tekst staat in het vak, selecteer hem daar.",
        parseError: "Het antwoord moet @@@CV of @@@LETTER bevatten, en eindigen met @@@END.",
        promptCv: "Herschrijf de volledige tekst in het Nederlands. Geef ALLEEN het blok terug, van @@@CV tot en met @@@END. Laat de veldnamen exact zo. Schrijf alle inhoud in het Nederlands. Zet in NAME een <br> waar de naam over een nieuwe regel moet.",
        promptLetter: "Herschrijf de volledige tekst in het Nederlands. Geef ALLEEN het blok terug, van @@@LETTER tot en met @@@END. Laat de veldnamen exact zo. Schrijf alle inhoud in het Nederlands. Zet in een BODY een lege regel tussen alinea's.",
        groupPerson: "Persoon",
        groupCv: "CV",
        groupLetter: "Brief",
        working: "PDF maken…",
        importFail: "Deze PDF komt niet uit deze editor. Download hem hier eerst, daarna kun je hem weer openen.",
        importBad: "De bijlage in deze PDF is geen geldig document.",
        pdfError: "De PDF lukte niet.",
        libError: "De PDF-bibliotheek is niet geladen.",
        fontError: "Het lettertype lukte niet.",
        reset: "Reset",
        resetArmed: "Document en alle kopieën wissen?",
        toolName: "LibreCV",
        pageOne: "1 pagina",
        pageMany: "{n} pagina's",
        pageBreak: "Pagina {n}",
        zoom: "Zoom",
        fit: "Passend",
        more: "Meer",
        feedback: "Feedback",
        ai: "Gebruik je eigen AI",
        langHint: "NL/EN wisselt de knoppen, de vaste koppen en de spelling. Tekst die je zelf schreef blijft staan.",
        language: "Taal",
        panes: "Delen van de editor",
        backToDoc: "Terug naar document",
        replaceNote: "Doorgaan vervangt het open document. Terug naar document laat het staan.",
        replaceArmed: "Vervangen?",
        saved: "Opgeslagen",
        saves: "Opgeslagen",
        savesTitle: "Opgeslagen documenten",
        savesLead: "Kopieën blijven in deze browser. Er wordt niets geüpload. Reset wist het open document en elke opgeslagen kopie.",
        savesStore: "Dit document opslaan",
        savesCopy: "Kopie opslaan",
        savesEmpty: "Er is nog niets opgeslagen.",
        savesEdit: "Bewerken",
        savesPdf: "PDF",
        savesDownload: "Download deze PDF",
        savesDuplicate: "Dupliceren",
        savesDelete: "Wissen",
        savesDeleteArmed: "Dit wissen?",
        savesOpen: "Het opgeslagen document is geopend.",
        savesStored: "Opgeslagen in deze browser.",
        savesCopied: "Een kopie is opgeslagen. Verdere wijzigingen gaan naar de kopie.",
        savesKindCv: "CV",
        savesKindLetter: "Brief",
        saveFail: "Opslaan lukte niet. Dit apparaat zit vol, of de browser bewaart deze pagina niet. Download de PDF, dat bestand blijft wel.",
        downloadAnyway: "Toch downloaden",
        cancel: "Annuleer",
        downloaded: "De PDF staat in je downloads: {name}. Die kun je later weer openen.",
        imported: "Het document is geopend.",
        placeholderWarn: "Er staat nog voorbeeldtekst in de pagina.",
        nameWarn: "De naam op de pagina is nog leeg.",
        letterPages: "De brief is {n} pagina's.",
        contrastWarn: "Tekst en achtergrond lijken te veel op elkaar.",
        emptyColumn: "Klik een blok links om het hier te zetten.",
        moveBlock: "Sleep naar de zijbalk of de pagina",
        removeLine: "Verwijder regel",
        found: "Gevonden: {list}."
    },
    prefix: { letter: "Motivatiebrief" },
    doc: {
        contact: "Contact",
        skills: "Vaardigheden",
        strengths: "Competenties",
        projects: "Projecten",
        profile: "Profiel",
        work: "Werkervaring",
        education: "Opleiding",
        letter: "Motivatiebrief",
        city: "Woonplaats",
        phone: "Telefoon",
        email: "E-mail",
        born: "Geboren",
        intro: "In het kort"
    },
    ph: {
        name: "Je naam",
        role: "Je rol",
        text: "Tekst",
        heading: "Kop",
        label: "Label",
        title: "Titel",
        date: "2024 – 2026",
        org: "Organisatie",
        to: "Aan de ontvanger",
        subject: "Onderwerp"
    },
    preview: {
        nameA: "Voornaam",
        nameB: "Achternaam",
        role: "Ontwerper",
        contact: "Voorbeeldstad",
        skill: "Schrijven",
        body: "Korte tekst die de vorm van dit blok laat zien.",
        item: "Eerste punt",
        item2: "Tweede punt",
        greeting: "Met vriendelijke groet,",
        paragraph: "Een korte alinea die links en rechts uitlijnt, zoals op de pagina.",
        place: "Voorbeeldstad, vandaag"
    },
    type: {
        name: "Naam",
        role: "Rol",
        contact: "Contactregel",
        heading: "Tussenkop",
        skill: "Vaardigheid",
        competence: "Competentie",
        project: "Project",
        timeline: "Tijdlijn",
        intro: "Introvak",
        paragraph: "Alinea",
        list: "Lijst",
        letterhead: "Briefkop",
        closing: "Afsluiting",
        signature: "Handtekening",
        spacer: "Ruimte",
        photo: "Foto"
    },
    guide: {
        open: "Stappenplan",
        kindTitle: "Wat wil je maken?",
        kindHint: "Daarna vul je het stap voor stap in, begin je leeg, of plak je een lap tekst.",
        cv: "CV",
        letter: "Motivatiebrief",
        modeTitle: "Hoe wil je beginnen?",
        modeHint: "Het stappenplan vraagt je naam, contact, een korte tekst en je ervaring. Elke vraag mag je overslaan. Doorgaan vervangt de pagina.",
        steps: "Stap voor stap",
        blank: "Lege pagina",
        paste: "Tekst plakken",
        showcase: "Voorbeeld bekijken",
        nameTitle: "Wat is je naam?",
        nameHint: "Die komt groot in de zijbalk.",
        roleTitle: "Welke rol zet je erop?",
        roleHint: "Kort, bijvoorbeeld ontwerper of ontwikkelaar.",
        contactTitle: "Hoe kunnen mensen je bereiken?",
        contactHint: "Vul alleen in wat je wilt delen.",
        introTitle: "In het kort",
        introHint: "Een paar zinnen over je.",
        skillsTitle: "Wat kun je?",
        skillsHint: "Eén vaardigheid per regel.",
        workTitle: "Werkervaring",
        workHint: "Functie, periode en organisatie. Punten mogen, één per regel.",
        studyTitle: "Opleiding",
        studyHint: "Dezelfde vorm als het werk.",
        letterheadTitle: "Aan wie is de brief?",
        letterheadHint: "Datum, aanhef en onderwerp. Alleen wat je wilt invullen.",
        bodyTitle: "De tekst van de brief",
        bodyHint: "Een lege regel begint een nieuwe alinea.",
        closeTitle: "Hoe sluit je af?",
        closeHint: "De groet, en daaronder je naam.",
        strengthTitle: "Een competentie",
        strengthHint: "Een titel en een korte zin. Nog een voegt er een toe.",
        projectTitle: "Een project",
        projectHint: "Naam en een zin. Nog een voegt er een toe.",
        another: "Nog een",
        next: "Volgende",
        back: "Terug",
        skip: "Overslaan",
        leaveEmpty: "Leeg laten",
        done: "Klaar",
        close: "Sluit het stappenplan",
        step: "Stap {n} van {m}",
        added: "{n} toegevoegd",
        toColours: "Kies de kleuren",
        pasteTitle: "Plak je tekst",
        pasteHint: "Plak een lap tekst. Maak blokken deelt hem in, in elke browser. Het model in Chrome is optioneel en blijft op deze computer.",
        formatLocal: "Maak blokken",
        formatModel: "Model in Chrome",
        modelMissing: "Deze browser heeft geen model op het apparaat. De tekst is wel ingedeeld.",
        modelWorking: "Het model leest de tekst…",
        modelReady: "Het model heeft de blokken gezet.",
        points: "Punten, één per regel",
        jobTitle: "Functie",
        period: "Periode",
        greeting: "Groet",
        copyModel: "Kopieer voor een ander model"
    },
    shell: {
        kicker: "LibreCV. Geen account.",
        title: "Wat maken we vandaag?",
        cv: "CV",
        cvHint: "Een pagina met zijbalk, ervaring en vaardigheden.",
        letter: "Motivatiebrief",
        letterHint: "Een brief met aanhef, tekst en afsluiting.",
        forkTitle: "Hoe wil je beginnen?",
        guided: "Stap voor stap",
        guidedHint: "Rustig opbouwen. Het beste als je blanco begint.",
        studio: "Studio",
        studioHint: "Meteen de pagina in. Het beste om tekst te plakken of zelf te schuiven.",
        back: "Terug",
        identity: "Wie ben je",
        intro: "In het kort",
        skills: "Vaardigheden",
        work: "Ervaring",
        study: "Opleiding",
        letterhead: "De briefkop",
        body: "De tekst",
        close: "Afsluiting",
        go: "Naar de studio",
        new: "Nieuw",
        fill: "Invullen",
        settings: "Instellingen",
        font: "Lettertype van de pagina",
        addItem: "Enter voegt een regel toe."
    },
    setup: {
        title1: "Wat maken we?",
        hint1: "Een CV en een motivatiebrief zijn twee aparte documenten.",
        cv: "CV",
        cvHint: "Zijbalk, ervaring en vaardigheden. Klaar om in te vullen of als voorbeeld.",
        letter: "Motivatiebrief",
        letterHint: "Aanhef, tekst en afsluiting. Het voorbeeld toont ook elk cv-blok.",
        title2: "Waar beginnen we mee?",
        hint2: "Stap voor stap is het rustigst. Je kunt ook zelf schrijven, tekst plakken, of met het voorbeeld beginnen.",
        blank: "Zelf invullen",
        blankHint: "Een leeg sjabloon van dit document. Jij schrijft de tekst.",
        demo: "Demodata",
        demoHint: "Elk blok staat ingevuld, met verzonnen gegevens. Daarna pas je het aan.",
        guided: "Stap voor stap",
        guidedHint: "Eén vraag per keer. Overslaan mag. Aan het eind kies je de kleuren.",
        model: "Laat een AI het invullen",
        modelHint: "Kopieer een sjabloon, laat een AI je CV of brief schrijven, en plak het antwoord terug.",
        modelLead: "Kies wat je kopieert. De uitleg noemt elk blok van deze editor, dus een nieuw blok komt vanzelf mee.",
        modelBox: "Het sjabloon staat hier. Plak het in een AI. Een oud CV en de vacature zijn optioneel. Kopieer het codeblok dat je terugkrijgt, en plak dat over deze tekst.",
        fast: "Snelste",
        copyGuide: "Kopieer met uitleg",
        copyGuideHint: "Elk blok, met de vorm die de AI moet aanhouden.",
        copyPlain: "Kopieer alleen het sjabloon",
        copyPlainHint: "Alleen de velden. Zonder uitleg.",
        copyAdvanced: "Geavanceerd",
        copyAdvancedHint: "Uitleg, plus kleuren, koppen en de stijl van de pagina.",
        paste: "Tekst plakken",
        pasteHint: "Alleen in Chrome. Plak een lap tekst. De browser maakt er blokken van, op deze computer.",
        chromeOnly: "Chrome",
        chromeWarn: "Dit heeft Chrome nodig. Firefox en andere browsers hebben dit model niet. Weet je zeker dat je Chrome gebruikt, dan kun je doorgaan.",
        chromeProceed: "Ik gebruik Chrome",
        pastePlaceholder: "Plak hier je cv of je brief…",
        title3: "Welk palet?",
        hint3: "Kies een kant-en-klaar palet, of stel de kleuren zelf in.",
        zakelijk: "Zakelijk",
        zakelijkHint: "Leisteen, wit en hemelsblauw.",
        groen: "Zakelijk groen",
        groenHint: "Donkergroen, wit en smaragd.",
        minimal: "Minimaal",
        minimalHint: "Lichtgrijs, wit en zwart.",
        custom: "Zelf kleuren",
        customHint: "Zijbalk, accent, papier en tekst.",
        sidebar: "Zijbalk",
        accent: "Accent",
        page: "Papier",
        text: "Tekst",
        back: "Terug",
        next: "Volgende",
        generate: "Maak het document",
        step: "Stap {n} van 3"
    },
    mark: {
        preamble: "Opdracht. Vul het document onderaan in. Dit is een {kind}. De gebruiker mag ook een oud CV en de vacature plakken. Allebei zijn optioneel. Staan ze erbij, dan is het oude CV de enige bron van feiten en bepaalt de vacature de nadruk, de volgorde en de formulering. Ontbreken ze, gebruik dan alleen wat al in het document staat. Verzin geen werkgever, datum, vaardigheid of diploma. Laat een veld leeg als je het niet weet. Schrijf de tekst in het {lang}. Antwoord met één codeblok en geen andere tekst, zodat het in één klik te kopiëren is. In het codeblok staat alleen het document. Gebruik daar geen markdown: geen sterretjes, geen koppen met een hekje, geen tabellen en geen lijsten met een streepje. Een punt is een regel die begint met POINT: . In NAME en TO is een nieuwe regel het teken <br>, vier tekens, niet omgezet naar een echte regel.",
        keep: "Herhaal @@@JOB één keer per baan en @@@STUDY één keer per opleiding. Laat elke regel die met @@@ begint exact staan, tot en met @@@END.",
        advanced: "Optioneel. Een sectie mag ook COLOR, BACKGROUND en SIZE hebben. COLOR en BACKGROUND zijn een hekje en dan zes hexadecimale tekens. SIZE is de tekstgrootte in punten, van 8 tot 28. @@@THEME zet de pagina. SIDEBAR, SIDEBARTEXT, ACCENT, ACCENTLIGHT, PAGE en TEXT zijn een hekje plus zes hexadecimale tekens. SIZE is de basisgrootte. COLUMN is het percentage van de zijbalk. FONT is roboto, merriweather of lora.",
        fallback: "Blok {type} hoort ook in het document. Velden: {fields}.",
        name: "NAME is de naam. Zet <br> waar de naam in de zijbalk op een nieuwe regel moet.",
        role: "ROLE is één regel, bijvoorbeeld de functie.",
        contact: "CITY, PHONE, EMAIL en BORN zijn contactregels. Een extra regel is LABEL: op de ene regel en VALUE: op de volgende.",
        skill: "Eén vaardigheid per regel. Elke regel begint met POINT: .",
        competence: "Eén competentie per regel. POINT: titel: korte tekst.",
        project: "Eén project per regel. POINT: titel: korte tekst.",
        intro: "Bij een CV is de intro de alinea onder @@@PROFILE. Begin die niet met SUMMARY:. Bij een brief is de intro SUMMARY in de kop.",
        timeline: "@@@JOB is werk, @@@STUDY is opleiding. TITLE, DATE en ORGANIZATION, daarna één POINT: per regel. Een item zonder titel, datum, organisatie en punten valt weg.",
        heading: "TEXT is de kop. STYLE is bar of label. bar heeft een lijn, label niet. Laat TEXT leeg als je deze kop niet wilt.",
        paragraph: "Vrije alinea. Een lege regel begint een nieuwe alinea.",
        list: "Eén punt per regel. Elke regel begint met POINT: .",
        letterhead: "TITLE, DATE, TO en SUBJECT. Bij een brief staan ze in de opening, en TITLE is de kop. Bij een CV is @@@LETTERHEAD alleen een datum, een ontvanger en een onderwerp. Laat TITLE op een CV leeg. Verzin geen kop. In TO mag <br> een nieuwe regel zijn. Een blok waarvan alle vier de velden leeg zijn valt weg.",
        closing: "De groet, en daarna SIGN: met de naam.",
        signature: "SIGN: is de naam onder de groet.",
        spacer: "SIZE is de hoogte in punten, bijvoorbeeld 12.",
        photo: "CAPTION is een kort bijschrift onder de foto. ASPECT is 3 / 4, 1 / 1 of 4 / 3. WIDTH is het kader op de pagina, van 36 tot 100. FILLED: yes houdt dat kader als de foto zelf weg blijft. URL is, als je die hebt, een https-adres van de foto."
    },
    photo: {
        pick: "Kies een foto",
        edit: "Kaderen",
        replace: "Andere foto",
        title: "Foto kaderen",
        hint: "Sleep de foto in het kader. Passend toont de hele foto, max vult het kader. Fotogrootte is hoe groot hij op de pagina staat.",
        size: "Fotogrootte",
        onPage: "Op de pagina",
        inFrame: "In het kader",
        fit: "Passend",
        max: "Max",
        reset: "Reset",
        use: "Gebruik dit kader",
        cancel: "Annuleer",
        portrait: "Portret",
        square: "Vierkant",
        wide: "Breed",
        fail: "Deze afbeelding lukte niet.",
        url: "https-adres van een foto"
    },
    site: {
        title: "Gratis CV maken, geen account — LibreCV",
        skip: "Naar de editor",
        lead: "LibreCV is een gratis editor voor een CV of een motivatiebrief. Geen account. Het document blijft op deze computer. De eigen code is publiek domein (CC0).",
        distinct: "Deze LibreCV schrijft een CV of een motivatiebrief. Het is niet de LibreCV-vereniging voor computervisie, en niet de Python-bibliotheek SimpleCV.",
        how: "Een stap-voor-stap gids leidt je erdoor. Een AI-sjabloon blijft op dit apparaat, of je plakt een antwoord uit een model terug. Je ontwerpt een pagina, geen markdown-bestand.",
        github: "Broncode op GitHub",
        feedback: "Feedback",
        seoNote: "Alleen voor zoekmachines.",
        faqTitle: "Vragen",
        qPrice: "Kost LibreCV iets?",
        aPrice: "Nee. Er is geen account en geen betaling bij de PDF. De prijs is nul.",
        qUpload: "Wordt het document geüpload?",
        aUpload: "Nee. De CV of brief blijft in deze browser. LibreCV heeft geen account. De tekst zit alleen in een feedbacknotitie als je dat zelf aanvinkt.",
        qDutch: "Kan ik een Nederlandse motivatiebrief schrijven?",
        aDutch: "Ja. De brief en de CV zijn twee documenten. Open de Nederlandse pagina, of zet deze site op NL. NL verandert de knoppen en de vaste koppen. Tekst die je al typte blijft staan.",
        qPdf: "Is de tekst in de PDF selecteerbaar?",
        aPdf: "Ja. De download is een PDF met echte tekst, geen foto van de pagina. Die PDF kun je opnieuw importeren en verder bewerken.",
        qSaves: "Kan ik meer dan één document bewaren?",
        aSaves: "Ja. Opgeslagen, in de kop, houdt kopieën in deze browser. Je kunt er een bewerken, dupliceren of de PDF downloaden. Reset wist het open document en elke kopie. Er wordt niets geüpload.",
        qCode: "Welke licentie heeft de code?",
        aCode: "De eigen code is CC0, zo dicht bij het publieke domein als de wet toelaat. De meegeleverde bibliotheken houden hun eigen licentie.",
        privacy: "Privacy",
        examples: "Voorbeelden",
        cli: "PDF-commando",
        letterPage: "Motivatiebrief",
        dutchPage: "Nederlands",
        morePages: "Meer pagina's"
    }
};
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* English strings. */

const I18N_EN = {
    ui: {
        title: "LibreCV",
        download: "Download PDF",
        import: "Import PDF",
        fileName: "File name",
        timestamp: "Add a timestamp",
        final: "Add final",
        undo: "Undo",
        redo: "Redo",
        templates: "Template",
        showcase: "Showcase",
        emptyCv: "Empty CV",
        emptyLetter: "Empty letter",
        theme: "Document",
        sidebarColor: "Sidebar colour",
        sidebarText: "Sidebar text",
        accent: "Accent",
        page: "Page colour",
        text: "Text colour",
        baseSize: "Base size",
        column: "Column width",
        block: "Selected block",
        none: "Click a block on the page.",
        blockColor: "Block text colour",
        blockBg: "Block background",
        blockSize: "Block text size",
        resetStyle: "Clear style",
        duplicate: "Duplicate",
        delete: "Delete",
        add: "Add a block",
        blocks: "Blocks",
        dragHint: "Click to add one. Drag a block to the sidebar or the page; Escape puts it back.",
        dragHintTouch: "Tap a block to add it. Drag the handle on the right to place it on the page.",
        placeBlock: "Drag onto the page",
        addTo: "Add to",
        sidebar: "Sidebar",
        main: "Page",
        format: "Format",
        bold: "Bold",
        italic: "Italic",
        underline: "Underline",
        addLine: "Add a line",
        hint: "Select text inside a block to colour or resize only that part.",
        file: "File",
        thisBlock: "This block",
        model: "Copy to an AI",
        modelHint: "Get text copies a template. Paste it into your AI. An old CV and the job are optional; paste them under the template if you have them. Copy the code block it returns, put that here, and press Paste text. Nothing is sent to a server.",
        copy: "Get text",
        copied: "Copied",
        applyText: "Paste text",
        applied: "The page is updated",
        copyFailed: "Copying failed. The text is in the box; select it there.",
        parseError: "The answer must contain @@@CV or @@@LETTER, and end with @@@END.",
        promptCv: "Rewrite the entire text in English. Return ONLY the block from @@@CV through @@@END. Keep the field names exactly as they are. Write all content in English. Use <br> inside NAME where the name should break onto a new line.",
        promptLetter: "Rewrite the entire text in English. Return ONLY the block from @@@LETTER through @@@END. Keep the field names exactly as they are. Write all content in English. Separate paragraphs inside BODY with a blank line.",
        groupPerson: "Person",
        groupCv: "CV",
        groupLetter: "Letter",
        working: "Making the PDF…",
        importFail: "This PDF did not come from this editor. Download it here first, then you can open it again.",
        importBad: "The attachment in this PDF is not a valid document.",
        pdfError: "The PDF failed.",
        libError: "The PDF library did not load.",
        fontError: "The font failed to load.",
        reset: "Reset",
        resetArmed: "Clear the document and every saved copy?",
        toolName: "LibreCV",
        pageOne: "1 page",
        pageMany: "{n} pages",
        pageBreak: "Page {n}",
        zoom: "Zoom",
        fit: "Fit",
        more: "More",
        feedback: "Feedback",
        ai: "Use your own AI",
        langHint: "NL/EN switches the buttons, the fixed headings and the spellcheck. Text you wrote stays as it is.",
        language: "Language",
        panes: "Editor panes",
        backToDoc: "Back to document",
        replaceNote: "Continuing replaces the open document. Back to document leaves it as it is.",
        replaceArmed: "Replace?",
        saved: "Saved",
        saves: "Saves",
        savesTitle: "Saved documents",
        savesLead: "Copies stay in this browser. Nothing is uploaded. Reset clears the open document and every saved copy.",
        savesStore: "Save this document",
        savesCopy: "Save a copy",
        savesEmpty: "Nothing is saved yet.",
        savesEdit: "Edit",
        savesPdf: "PDF",
        savesDownload: "Download this PDF",
        savesDuplicate: "Duplicate",
        savesDelete: "Delete",
        savesDeleteArmed: "Delete this?",
        savesOpen: "The saved document is open.",
        savesStored: "Saved in this browser.",
        savesCopied: "A copy is saved. Further edits go to the copy.",
        savesKindCv: "CV",
        savesKindLetter: "Letter",
        saveFail: "Saving failed. This device is full, or the browser is not keeping this page. Download the PDF. That file stays.",
        downloadAnyway: "Download anyway",
        cancel: "Cancel",
        downloaded: "The PDF is in your downloads: {name}. You can open it here again later.",
        imported: "The document is open.",
        placeholderWarn: "Sample text is still on the page.",
        nameWarn: "The name on the page is still empty.",
        letterPages: "The letter is {n} pages.",
        contrastWarn: "The text and the background are too close.",
        emptyColumn: "Click a block on the left to put it here.",
        moveBlock: "Drag to the sidebar or the page",
        removeLine: "Remove line",
        found: "Found: {list}."
    },
    prefix: { letter: "Motivation_letter" },
    doc: {
        contact: "Contact",
        skills: "Skills",
        strengths: "Strengths",
        projects: "Projects",
        profile: "Profile",
        work: "Experience",
        education: "Education",
        letter: "Motivation letter",
        city: "City",
        phone: "Phone",
        email: "Email",
        born: "Born",
        intro: "In short"
    },
    ph: {
        name: "Your name",
        role: "Your role",
        text: "Text",
        heading: "Heading",
        label: "Label",
        title: "Title",
        date: "2024 – 2026",
        org: "Organisation",
        to: "Recipient",
        subject: "Subject"
    },
    preview: {
        nameA: "First",
        nameB: "Last",
        role: "Designer",
        contact: "Example City",
        skill: "Writing",
        body: "Short text that shows the shape of this block.",
        item: "First point",
        item2: "Second point",
        greeting: "Kind regards,",
        paragraph: "A short paragraph aligned on both sides, the way it sits on the page.",
        place: "Example City, today"
    },
    type: {
        name: "Name",
        role: "Role",
        contact: "Contact line",
        heading: "Section heading",
        skill: "Skill",
        competence: "Strength",
        project: "Project",
        timeline: "Timeline",
        intro: "Intro box",
        paragraph: "Paragraph",
        list: "List",
        letterhead: "Letter header",
        closing: "Closing",
        signature: "Signature",
        spacer: "Spacer",
        photo: "Photo"
    },
    guide: {
        open: "Guide",
        kindTitle: "What are you making?",
        kindHint: "Then fill it in step by step, start from a blank page, or paste a block of text.",
        cv: "CV",
        letter: "Motivation letter",
        modeTitle: "How do you want to start?",
        modeHint: "The guide asks your name, contact details, a short text and your experience. You can skip any question. Continuing replaces the page.",
        steps: "Step by step",
        blank: "Blank page",
        paste: "Paste text",
        showcase: "View the example",
        nameTitle: "What is your name?",
        nameHint: "It appears large in the sidebar.",
        roleTitle: "Which role do you want on it?",
        roleHint: "Short, for example designer or developer.",
        contactTitle: "How can people reach you?",
        contactHint: "Fill in only what you want to share.",
        introTitle: "In short",
        introHint: "A few sentences about you.",
        skillsTitle: "What can you do?",
        skillsHint: "One skill on each line.",
        workTitle: "Experience",
        workHint: "Role, period and organisation. Bullets are optional, one on each line.",
        studyTitle: "Education",
        studyHint: "The same shape as experience.",
        letterheadTitle: "Who is the letter to?",
        letterheadHint: "Date, recipient and subject. Only what you want to include.",
        bodyTitle: "The letter itself",
        bodyHint: "A blank line starts a new paragraph.",
        closeTitle: "How do you close?",
        closeHint: "The sign-off, and your name under it.",
        strengthTitle: "A strength",
        strengthHint: "A title and a short line. Another adds one more.",
        projectTitle: "A project",
        projectHint: "A name and one line. Another adds one more.",
        another: "Add another",
        next: "Next",
        back: "Back",
        skip: "Skip",
        leaveEmpty: "Leave empty",
        done: "Done",
        close: "Close the guide",
        step: "Step {n} of {m}",
        added: "{n} added",
        toColours: "Choose colours",
        pasteTitle: "Paste your text",
        pasteHint: "Paste a block of text. Make blocks sorts it in any browser. Chrome's model is optional and stays on this computer.",
        formatLocal: "Make blocks",
        formatModel: "Model in Chrome",
        modelMissing: "This browser has no on-device model. The text was still sorted into blocks.",
        modelWorking: "The model is reading the text…",
        modelReady: "The model placed the blocks.",
        points: "Bullets, one on each line",
        jobTitle: "Role",
        period: "Period",
        greeting: "Sign-off",
        copyModel: "Copy for another model"
    },
    shell: {
        kicker: "LibreCV. No account.",
        title: "What are we making today?",
        cv: "CV",
        cvHint: "A page with a sidebar, experience and skills.",
        letter: "Motivation letter",
        letterHint: "A letter with a header, body and closing.",
        forkTitle: "How do you want to start?",
        guided: "Guided builder",
        guidedHint: "Step-by-step setup. Best for starting fresh.",
        studio: "Studio editor",
        studioHint: "Jump straight in. Best for pasting existing text or manual control.",
        back: "Back",
        identity: "Who you are",
        intro: "In short",
        skills: "Skills",
        work: "Experience",
        study: "Education",
        letterhead: "Letter header",
        body: "The letter",
        close: "Closing",
        go: "Go to Studio",
        new: "New",
        fill: "Fill in",
        settings: "Settings",
        font: "Typeface on the page",
        addItem: "Press Enter to add another line."
    },
    setup: {
        title1: "What are we making?",
        hint1: "A CV and a motivation letter are two separate documents.",
        cv: "CV",
        cvHint: "Sidebar, experience and skills. Ready to fill in, or to load as an example.",
        letter: "Motivation letter",
        letterHint: "Header, body and closing. The example also shows every CV block.",
        title2: "How should we start?",
        hint2: "Step by step is the calm way. You can also write it yourself, paste text, or start from the example.",
        blank: "Fill it in yourself",
        blankHint: "An empty template of this document. You write the text.",
        demo: "Demo data",
        demoHint: "Every block is filled in, with invented details. Then you edit it.",
        guided: "Step by step",
        guidedHint: "One question at a time. You can skip. Colours come at the end.",
        model: "Let an AI fill it in",
        modelHint: "Copy a template, let an AI write your CV or letter, and paste the answer back.",
        modelLead: "Choose what you copy. The guide names every block in this editor, so a new block is included on its own.",
        modelBox: "The template is here. Paste it into an AI. An old CV and the job are optional. Copy the code block it returns and paste it over this text.",
        fast: "Fastest",
        copyGuide: "Copy with a guide",
        copyGuideHint: "Every block, with the shape the AI should follow.",
        copyPlain: "Copy the template only",
        copyPlainHint: "Just the fields. No guide.",
        copyAdvanced: "Advanced",
        copyAdvancedHint: "The guide, plus colours, headings and the page style.",
        paste: "Paste text",
        pasteHint: "Chrome only. Paste a block of text. The browser turns it into blocks, on this computer.",
        chromeOnly: "Chrome",
        chromeWarn: "This needs Chrome. Firefox and other browsers do not have this on-device model. If you are sure you are using Chrome, you can continue.",
        chromeProceed: "I'm using Chrome",
        pastePlaceholder: "Paste your CV or letter here…",
        title3: "Which palette?",
        hint3: "Pick a ready-made palette, or set the colours yourself.",
        zakelijk: "Business",
        zakelijkHint: "Slate, white and sky blue.",
        groen: "Business green",
        groenHint: "Deep green, white and emerald.",
        minimal: "Minimal",
        minimalHint: "Light grey, white and black.",
        custom: "My own colours",
        customHint: "Sidebar, accent, paper and text.",
        sidebar: "Sidebar",
        accent: "Accent",
        page: "Paper",
        text: "Text",
        back: "Back",
        next: "Next",
        generate: "Create document",
        step: "Step {n} of 3"
    },
    mark: {
        preamble: "Task. Fill in the document at the end. This is a {kind}. The user may also paste an old CV and the job. Both are optional. If they are included, the old CV is the only source of facts and the job text decides the emphasis, the order, and the wording. If they are left out, use only what is already in the document. Do not invent an employer, a date, a skill, or a degree. Leave a field empty when you do not know it. Write the words in {lang}. Reply with one code block and no other text, so it can be copied in one click. The code block is the document only. Inside it, do not use markdown: no asterisks, no hash headings, no tables, and no dash lists. A point is a line that starts with POINT: . Inside NAME and TO, a new line is the token <br>, four characters, not a real line break.",
        keep: "Repeat @@@JOB once for each job and @@@STUDY once for each course. Keep every line that starts with @@@ exactly, through @@@END.",
        advanced: "Optional. A section may also have COLOR, BACKGROUND and SIZE. COLOR and BACKGROUND are a hash followed by six hex digits. SIZE is the type size in points, from 8 to 28. @@@THEME sets the page. SIDEBAR, SIDEBARTEXT, ACCENT, ACCENTLIGHT, PAGE and TEXT are a hash plus six hex digits. SIZE is the base size. COLUMN is the sidebar percentage. FONT is roboto, merriweather or lora.",
        fallback: "The {type} block belongs in the document too. Fields: {fields}.",
        name: "NAME is the name. Use <br> where the name should break onto a new line in the sidebar.",
        role: "ROLE is one line, for example the job title.",
        contact: "CITY, PHONE, EMAIL and BORN are contact lines. An extra line is LABEL: on one line and VALUE: on the next.",
        skill: "One skill on each line. Each line starts with POINT: .",
        competence: "One strength on each line. POINT: title: short text.",
        project: "One project on each line. POINT: title: short text.",
        intro: "On a CV the intro is the paragraph under @@@PROFILE. Do not start it with SUMMARY:. On a letter the intro is SUMMARY in the header.",
        timeline: "@@@JOB is work, @@@STUDY is education. TITLE, DATE and ORGANIZATION, then one POINT: on each line. An entry with an empty title, date, organisation and no points is left out.",
        heading: "TEXT is the heading. STYLE is bar or label. bar has a line under it, label does not. Leave TEXT empty when you do not want this heading.",
        paragraph: "A free paragraph. A blank line starts another paragraph.",
        list: "One point on each line. Each line starts with POINT: .",
        letterhead: "TITLE, DATE, TO and SUBJECT. On a letter they sit in the opening, and TITLE is the heading. On a CV, @@@LETTERHEAD is only a date, a recipient and a subject. Leave TITLE empty on a CV. Do not invent a heading. In TO, <br> starts a new line. A block with all four fields empty is left out.",
        closing: "The sign-off, then SIGN: with the name.",
        signature: "SIGN: is the name under the sign-off.",
        spacer: "SIZE is the height in points, for example 12.",
        photo: "CAPTION is a short line under the picture. ASPECT is 3 / 4, 1 / 1, or 4 / 3. WIDTH is the frame on the page, from 36 to 100. FILLED: yes keeps that frame when the picture itself stays out. URL, when you have one, is an https address for the picture."
    },
    photo: {
        pick: "Choose a photo",
        edit: "Frame",
        replace: "Different photo",
        title: "Frame the photo",
        hint: "Drag the photo inside the frame. Fit shows the whole photo, max fills the frame. Photo size is how large it is on the page.",
        size: "Photo size",
        onPage: "On the page",
        inFrame: "Inside the frame",
        fit: "Fit",
        max: "Max",
        reset: "Reset",
        use: "Use this frame",
        cancel: "Cancel",
        portrait: "Portrait",
        square: "Square",
        wide: "Wide",
        fail: "This image did not work.",
        url: "https address of a picture"
    },
    site: {
        title: "Free CV builder, no account — LibreCV",
        skip: "Skip to the builder",
        lead: "LibreCV is a free CV and motivation-letter builder. No account. The document stays on this computer. The project's own code is public domain (CC0).",
        distinct: "This LibreCV writes a CV or a motivation letter. It is not the LibreCV computer-vision association, and it is not the SimpleCV Python library.",
        how: "A step-by-step guide walks you through it. An AI template stays on this device, or you paste an answer from any model. You design a page, not a markdown file.",
        github: "Source code on GitHub",
        feedback: "Feedback",
        seoNote: "Only here for search engines.",
        faqTitle: "Questions",
        qPrice: "Does LibreCV cost anything?",
        aPrice: "No. There is no account and no charge when you download the PDF. The price is zero.",
        qUpload: "Is the document uploaded?",
        aUpload: "No. The CV or letter stays in this browser. LibreCV has no account. The text is included in a feedback note only if you tick that box.",
        qDutch: "Can I write a Dutch motivation letter?",
        aDutch: "Yes. The letter and the CV are two documents. Open the Dutch page, or switch this site to NL. NL changes the buttons and the fixed headings. Text you already typed stays as it is.",
        qPdf: "Can the PDF text be selected?",
        aPdf: "Yes. The download is a PDF with real text, not a picture of the page. You can import that PDF and keep editing.",
        qSaves: "Can I keep more than one document?",
        aSaves: "Yes. Saves, in the header, keeps copies in this browser. You can edit one, duplicate it, or download its PDF. Reset clears the open document and every saved copy. Nothing is uploaded.",
        qCode: "What license is the code under?",
        aCode: "The project's own code is CC0, as close to the public domain as the law allows. The bundled libraries keep their own licenses.",
        privacy: "Privacy",
        examples: "Examples",
        cli: "PDF command",
        letterPage: "Motivation letter",
        dutchPage: "Nederlands",
        morePages: "More pages"
    }
};
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The string table. Dutch and English live in the files next to this one. */

const I18N = { nl: I18N_NL, en: I18N_EN };
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Empty documents, the demo, and a new block of each type. */

function t(key) {
    const parts = key.split(".");
    let node = I18N[lang] || I18N.nl;
    for (let i = 0; i < parts.length; i++) {
        if (node == null) return key;
        node = node[parts[i]];
    }
    return node == null ? key : node;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function safeCss(value) {
    return String(value).replace(/["'<>;]/g, "");
}

function uid() {
    seq += 1;
    return "b" + seq;
}

function cvTheme() {
    return {
        sidebar: "#1e293b",
        sidebarText: "#f8fafc",
        accent: "#0284c7",
        accentLight: "#38bdf8",
        page: "#ffffff",
        text: "#334155",
        baseSize: 9.5,
        sidebarWidth: 33,
        font: "roboto"
    };
}

function letterTheme() {
    return {
        sidebar: "#0b1d16",
        sidebarText: "#ffffff",
        accent: "#047857",
        accentLight: "#6ee7b7",
        page: "#ffffff",
        text: "#111827",
        baseSize: 8.8,
        sidebarWidth: 32,
        font: "roboto"
    };
}

function block(type, fields) {
    return {
        id: uid(),
        type: type,
        color: "",
        background: "",
        fontSize: 0,
        fields: fields
    };
}

function barHeading(key) {
    return block("heading", { key: key, style: "bar", html: "" });
}

function labelHeading(html) {
    return block("heading", { key: "", style: "label", html: html });
}

function makeLetterhead(date, to, subject, title) {
    return block("letterhead", {
        title: title || "",
        date: date || "",
        to: to || "",
        subject: subject || ""
    });
}

function demoPack() {
    if (lang === "en") {
        return {
            role: "Designer",
            city: "Example City",
            born: "01-01-1998 (28)",
            skills: ["Writing", "Prototypes", "Layout", "Workshops", "HTML"],
            strengths: [
                ["Clear writing", "Turns a tangled idea into a short text."],
                ["Working together", "Keeps the notes when a made-up team changes the plan."],
                ["Structure", "Sorts a loose page into headings and a calm order."]
            ],
            projects: [
                ["North Light", "A made-up site for a studio that makes lamps."],
                ["North Cape", "A made-up exhibition. The captions are invented."],
                ["Example Guide", "A practice site where a team added its own pages."]
            ],
            intro: "Alex Jansen is a made-up designer from Example City. This CV belongs to nobody. It shows a name, a role, contact, skills, strengths, a short introduction, four jobs and two studies.",
            jobs: [
                ["Designer", "2022 – 2024", "North Light Ltd", ["A house style for a fictional lamp studio.", "Short product lines for a catalogue that does not exist."]],
                ["Designer", "2020 – 2022", "Example Bureau", ["Campaigns for clients who were never real.", "Presentations a stranger could follow in five minutes."]],
                ["Intern", "2019", "Example Studio", ["Sat in on a campaign that was never broadcast."]],
                ["Shop assistant", "2016 – 2018", "Example Shop", ["Worked in a shop beside a course, so this CV also shows a simple job."]]
            ],
            studies: [
                ["Communication", "2017 – 2021", "Example University", ["A graduation project about an imaginary museum."]],
                ["Media foundation", "2015 – 2017", "Example College", ["Type, pictures and a first practice site."]]
            ],
            letterIntro: "Alex Jansen is a made-up designer. This letter belongs to nobody. It shows a header, a recipient, a subject, a short box, sections and a signature.",
            every: "This example puts every block on the page, so a paragraph, a list, a header and a signature are all visible.",
            greeting: "Dear committee,",
            sections: [
                ["A wide base", "I like to work on the whole piece, not on one loose button. First the reader's question, then the text, then the page."],
                ["From question to page", "At North Light, a studio that exists only here, I wrote the product lines and built the site. The job was fictional. The order is real: a question, a text, a page."],
                ["Explaining to a team", "What I like most is making a difficult subject short for someone else. In this example that is a half-hour workshop and a one-page note."],
                ["Switching when it is busy", "At Example Bureau the campaigns were never broadcast. The example learned to keep a story short and to change the order the same afternoon."],
                ["Own projects", "North Cape is an imaginary exhibition about maps. I made the captions and the floor plan. Example Guide is a practice site. Both exist only in this letter."]
            ],
            list: [
                "A page that answers the reader's question at a glance.",
                "Text that stays short when the subject is complicated.",
                "The same words on screen and in the PDF."
            ],
            closeNote: "I will gladly explain this made-up application in a meeting that also does not exist.",
            closing: "Kind regards,",
            date: "Example City, 29 October 2026",
            to: "Example Organisation<br>For the committee<br>Example Street 1<br>1234 AB Example City",
            subject: "Subject: application as a designer, a made-up vacancy"
        };
    }
    return {
        role: "Ontwerper",
        city: "Voorbeeldstad",
        born: "01-01-1998 (28 jaar)",
        skills: ["Schrijven", "Prototypes", "Vormgeving", "Workshops", "HTML"],
        strengths: [
            ["Helder schrijven", "Maakt van een ingewikkeld idee een korte tekst."],
            ["Samenwerken", "Houdt de notities bij als een verzonnen team het plan wijzigt."],
            ["Structuur", "Zet een losse pagina om in koppen en een rustige volgorde."]
        ],
        projects: [
            ["Noorderlicht", "Een verzonnen site voor een studio die lampen maakt."],
            ["Noordkaap", "Een denkbeeldige tentoonstelling. De bijschriften zijn verzonnen."],
            ["Voorbeeldgids", "Een oefensite waarop een team zelf pagina's toevoegde."]
        ],
        intro: "Alex Jansen is een verzonnen ontwerper uit Voorbeeldstad. Dit cv hoort bij niemand. Het toont een naam, een rol, contact, vaardigheden, competenties, een korte introductie, vier banen en twee opleidingen.",
        jobs: [
            ["Ontwerper", "2022 – 2024", "Noorderlicht BV", ["Een huisstijl voor een fictieve lampenstudio.", "Korte productteksten voor een catalogus die niet bestaat."]],
            ["Vormgever", "2020 – 2022", "Voorbeeldbureau", ["Campagnes voor opdrachtgevers die nooit hebben bestaan.", "Presentaties die een buitenstaander in vijf minuten volgt."]],
            ["Stagiair", "2019", "Atelier Voorbeeld", ["Meegelopen bij een campagne die nooit is uitgezonden."]],
            ["Winkelmedewerker", "2016 – 2018", "Voorbeeldwinkel", ["Naast een opleiding in de winkel gestaan, zodat dit cv ook een eenvoudige baan toont."]]
        ],
        studies: [
            ["Communicatie", "2017 – 2021", "Voorbeeld Hogeschool", ["Afstudeerproject over een denkbeeldig museum."]],
            ["Voortraject media", "2015 – 2017", "Voorbeeld College", ["Typografie, beeld en een eerste oefensite."]]
        ],
        letterIntro: "Alex Jansen is een verzonnen ontwerper. Deze brief hoort bij niemand. Hij toont een briefkop, een ontvanger, een onderwerp, een kort vak, tussenkoppen en een handtekening.",
        every: "Dit voorbeeld zet elk blok op de pagina, zodat een alinea, een lijst, een briefkop en een handtekening allemaal te zien zijn.",
        greeting: "Beste commissie,",
        sections: [
            ["Een brede basis", "Ik werk het liefst aan het hele stuk, niet aan één losse knop. Eerst de vraag van de lezer, dan de tekst, dan de pagina."],
            ["Van vraag naar pagina", "Bij Noorderlicht, een studio die alleen in dit voorbeeld bestaat, schreef ik de productteksten en zette ik de site in elkaar. Het werk was fictief. De volgorde is echt: een vraag, een tekst, een pagina."],
            ["Uitleggen aan een team", "Wat ik het liefste doe is een ingewikkeld onderwerp kort maken voor iemand anders. In dit voorbeeld is dat een workshop van een half uur en een notitie van één bladzijde."],
            ["Schakelen als het druk is", "Bij Voorbeeldbureau zijn de campagnes nooit uitgezonden. Het voorbeeld leerde een verhaal kort te houden en dezelfde middag nog een andere volgorde te kiezen."],
            ["Eigen projecten", "Noordkaap is een denkbeeldige tentoonstelling over kaarten. Ik maakte het bijschrift en de plattegrond. Voorbeeldgids is een oefensite. Allebei bestaan alleen in deze brief."]
        ],
        list: [
            "Een pagina die in één oogopslag de vraag van de lezer beantwoordt.",
            "Teksten die kort blijven, ook als het onderwerp ingewikkeld is.",
            "Dezelfde woorden op het scherm en in de PDF."
        ],
        closeNote: "Ik licht deze verzonnen sollicitatie graag toe in een gesprek dat eveneens niet bestaat.",
        closing: "Met vriendelijke groet,",
        date: "Voorbeeldstad, 29 oktober 2026",
        to: "Voorbeeld Organisatie<br>Aan de commissie<br>Voorbeeldstraat 1<br>1234 AB Voorbeeldstad",
        subject: "Betreft: sollicitatie als ontwerper, een verzonnen vacature"
    };
}

function placeholderPhoto() {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='320' viewBox='0 0 240 320'><rect width='240' height='320' fill='#d6dee8'/><circle cx='120' cy='118' r='46' fill='#94a3b8'/><ellipse cx='120' cy='270' rx='74' ry='58' fill='#94a3b8'/></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function demoSidebar(copy, withProjects, compactPhoto) {
    const side = [
        block("name", { html: "Alex<br>Jansen" }),
        block("photo", { src: placeholderPhoto(), original: "", caption: "", aspect: compactPhoto ? "1 / 1" : "3 / 4" }),
        block("role", { html: copy.role }),
        barHeading("doc.contact"),
        block("contact", { labelKey: "city", label: "", html: copy.city }),
        block("contact", { labelKey: "phone", label: "", html: "+31 6 0000 0000" }),
        block("contact", { labelKey: "email", label: "", html: "alex@example.com" }),
        block("contact", { labelKey: "born", label: "", html: copy.born }),
        barHeading("doc.skills")
    ];
    copy.skills.forEach(function (skill) { side.push(block("skill", { html: skill })); });
    if (withProjects) {
        side.push(barHeading("doc.projects"));
        copy.projects.forEach(function (item) {
            side.push(block("project", { title: item[0], body: item[1] }));
        });
    }
    side.push(barHeading("doc.strengths"));
    copy.strengths.forEach(function (item) {
        side.push(block("competence", { title: item[0], body: item[1] }));
    });
    return side;
}

function demoExperience(main, copy) {
    main.push(barHeading("doc.work"));
    copy.jobs.forEach(function (job) {
        main.push(block("timeline", { title: job[0], date: job[1], org: job[2], items: job[3] }));
    });
    main.push(barHeading("doc.education"));
    copy.studies.forEach(function (study) {
        main.push(block("timeline", { title: study[0], date: study[1], org: study[2], items: study[3] }));
    });
}

function demoCv() {
    const copy = demoPack();
    const main = [
        makeLetterhead(copy.date, copy.city, copy.role, "CV"),
        barHeading("doc.profile"),
        block("intro", { html: copy.intro }),
        block("paragraph", { html: copy.every }),
        block("list", { items: copy.list.slice() })
    ];
    demoExperience(main, copy);
    main.push(block("closing", { paragraphs: [copy.closing] }));
    main.push(block("signature", { html: "Alex Jansen" }));
    main.push(block("spacer", { size: 18 }));
    return {
        version: 1,
        lang: lang,
        kind: "cv",
        theme: cvTheme(),
        sidebar: demoSidebar(copy, true),
        main: main
    };
}

function demoLetter() {
    const copy = demoPack();
    const main = [
        makeLetterhead(copy.date, copy.to, copy.subject, t("doc.letter")),
        block("intro", { html: copy.letterIntro }),
        block("paragraph", { html: copy.greeting })
    ];
    copy.sections.forEach(function (section) {
        main.push(labelHeading(section[0]));
        main.push(block("paragraph", { html: section[1] }));
        if (section[2]) main.push(block("paragraph", { html: section[2] }));
    });
    main.push(block("list", { items: copy.list.slice() }));
    demoExperience(main, copy);
    main.push(block("paragraph", { html: copy.closeNote }));
    main.push(block("closing", { paragraphs: [copy.closing] }));
    main.push(block("signature", { html: "Alex Jansen" }));
    main.push(block("spacer", { size: 8 }));
    return {
        version: 1,
        lang: lang,
        kind: "letter",
        theme: letterTheme(),
        sidebar: demoSidebar(copy, true, true),
        main: main
    };
}

function emptyCv() {
    return {
        version: 1,
        lang: lang,
        kind: "cv",
        theme: cvTheme(),
        sidebar: [
            block("name", { html: "" }),
            block("role", { html: "" }),
            barHeading("doc.contact"),
            block("contact", { labelKey: "city", label: "", html: "" }),
            block("contact", { labelKey: "phone", label: "", html: "" }),
            block("contact", { labelKey: "email", label: "", html: "" }),
            block("contact", { labelKey: "born", label: "", html: "" }),
            barHeading("doc.skills"),
            block("skill", { html: "" }),
            barHeading("doc.strengths"),
            block("competence", { title: "", body: "" })
        ],
        main: [
            barHeading("doc.profile"),
            block("intro", { html: "" }),
            barHeading("doc.work"),
            block("timeline", { title: "", date: "", org: "", items: [""] }),
            barHeading("doc.education"),
            block("timeline", { title: "", date: "", org: "", items: [""] })
        ]
    };
}

function emptyLetter() {
    return {
        version: 1,
        lang: lang,
        kind: "letter",
        theme: letterTheme(),
        sidebar: [
            block("name", { html: "" }),
            block("role", { html: "" }),
            barHeading("doc.contact"),
            block("contact", { labelKey: "city", label: "", html: "" }),
            block("contact", { labelKey: "phone", label: "", html: "" }),
            block("contact", { labelKey: "email", label: "", html: "" })
        ],
        main: [
            makeLetterhead("", "", "", ""),
            block("intro", { html: "" }),
            block("paragraph", { html: "" }),
            block("paragraph", { html: "" }),
            block("closing", { paragraphs: [""] }),
            block("signature", { html: "" })
        ]
    };
}

function createBlock(type) {
    const fields = {
        name: { html: "" },
        role: { html: "" },
        contact: { labelKey: "custom", label: "", html: "" },
        heading: {
            key: "",
            style: doc && doc.kind === "letter" && addTarget === "main" ? "label" : "bar",
            html: ""
        },
        photo: { src: "", original: "", caption: "", aspect: "3 / 4", url: "" },
        skill: { html: "" },
        competence: { title: "", body: "" },
        project: { title: "", body: "" },
        timeline: { title: "", date: "", org: "", items: [""] },
        intro: { html: "" },
        paragraph: { html: "" },
        list: { items: [""] },
        letterhead: { title: "", date: "", to: "", subject: "" },
        spacer: { size: 12 },
        closing: { paragraphs: [""] },
        signature: { html: "" }
    };
    return block(type, fields[type] || { html: "" });
}

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Undo, redo, and saving the document in this browser. */

function normalize(data) {
    data.version = 1;
    data.sidebar = Array.isArray(data.sidebar) ? data.sidebar : [];
    data.main = Array.isArray(data.main) ? data.main : [];
    if (data.kind !== "letter" && data.kind !== "cv") data.kind = "cv";
    const base = data.kind === "letter" ? letterTheme() : cvTheme();
    const saved = data.theme || {};
    const hadLight = Object.prototype.hasOwnProperty.call(saved, "accentLight");
    data.theme = Object.assign(base, saved);
    data.theme.baseSize = Number(data.theme.baseSize) || base.baseSize;
    data.theme.sidebarWidth = Number(data.theme.sidebarWidth) || base.sidebarWidth;
    if (!hadLight) data.theme.accentLight = base.accentLight;
    if (data.theme.font !== "merriweather" && data.theme.font !== "lora") data.theme.font = "roboto";
    data.lang = data.lang === "en" ? "en" : "nl";
    let max = 1;
    data.sidebar.concat(data.main).forEach(function (item) {
        const n = Number(String(item.id || "").replace(/\D/g, ""));
        if (n > max) max = n;
        item.fields = item.fields || {};
        item.color = item.color || "";
        item.background = item.background || "";
        item.fontSize = Number(item.fontSize) || 0;
    });
    seq = max;
}

function snapshot() {
    past.push(JSON.stringify(doc));
    if (past.length > 60) past.shift();
    future = [];
    syncHistoryButtons();
}

function rememberSnapshot() {
    if (snapArmed) return;
    snapshot();
    snapArmed = true;
}

function restore(next) {
    doc = next;
    normalize(doc);
    lang = doc.lang;
    try { localStorage.setItem(STORAGE_LANG, lang); } catch (error) { /* keep going */ }
    if (!selectedBlock()) selectedId = null;
    applyLanguage();
    render();
    save();
}

function syncHistoryButtons() {
    const undoBtn = document.getElementById("undo-btn");
    const redoBtn = document.getElementById("redo-btn");
    if (undoBtn) undoBtn.disabled = !past.length;
    if (redoBtn) redoBtn.disabled = !future.length;
}

function undo() {
    if (!past.length) return;
    future.push(JSON.stringify(doc));
    restore(JSON.parse(past.pop()));
    syncHistoryButtons();
}

function redo() {
    if (!future.length) return;
    past.push(JSON.stringify(doc));
    restore(JSON.parse(future.pop()));
    syncHistoryButtons();
}

function markSaved(ok) {
    const node = document.getElementById("save-state");
    saveOk = ok;
    if (!node) {
        if (!ok) showToast(t("ui.saveFail"), "error");
        return;
    }
    node.classList.toggle("is-fail", !ok);
    node.dataset.state = ok ? "ok" : "fail";
    node.textContent = ok ? t("ui.saved") : "";
    window.clearTimeout(saveTimer);
    if (!ok) showToast(t("ui.saveFail"), "error");
    if (ok) {
        saveTimer = window.setTimeout(function () {
            if (node.dataset.state === "ok") node.textContent = "";
        }, 1600);
    }
}

function save() {
    if (document.body.dataset.phase === "setup") return;
    try {
        localStorage.setItem(STORAGE_DOC, JSON.stringify(doc));
        documentLive = true;
        updateLinkedSave();
        if (!saveOk || document.getElementById("save-state")) markSaved(true);
    } catch (error) {
        if (saveOk) markSaved(false);
    }
    updateFilenamePreview();
    refreshIdentity();
}

function syncFilenameFromPerson() {
    if (filenameCustom) {
        refreshIdentity();
        return;
    }
    const input = document.getElementById("pdf-name");
    const person = plainName().replace(/\s+/g, " ").trim();
    const next = !person || person === t("ph.name") ? "" : person;
    if (input && input.value !== next) {
        input.value = next;
        try { localStorage.setItem(STORAGE_NAME, next); } catch (error) { /* ignore */ }
    }
    updateFilenamePreview();
    refreshIdentity();
}

function refreshIdentity() {
    const title = document.getElementById("doc-title");
    if (document.body.dataset.phase !== "studio") document.title = t("site.title");
    if (!doc) return;
    const kind = doc.kind === "letter" ? t("setup.letter") : t("setup.cv");
    const person = plainName().replace(/\s+/g, " ").trim();
    const named = person && person !== t("ph.name");
    const label = named ? kind + " · " + person : kind;
    if (title) title.textContent = label;
    if (document.body.dataset.phase === "studio") document.title = label + " — " + t("ui.title");
}

function selectedBlock() {
    if (!selectedId || !doc) return null;
    return doc.sidebar.concat(doc.main).find(function (item) { return item.id === selectedId; }) || null;
}

function columnOf(id) {
    if (doc.sidebar.some(function (item) { return item.id === id; })) return "sidebar";
    return "main";
}

function plainName() {
    const found = doc.sidebar.concat(doc.main).find(function (item) { return item.type === "name"; });
    if (!found) return "";
    const holder = document.createElement("div");
    holder.innerHTML = found.fields.html || "";
    return (holder.textContent || "").replace(/\s+/g, " ").trim();
}

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Turn pasted plain text into CV or letter blocks. */

const SECTION_HEADS = [
    ["work", /^(werkervaring(?:en)?|experience|work experience|employment|loopbaan)$/i],
    ["study", /^(opleiding(?:en)?|education|studies?|scholing)$/i],
    ["skills", /^(vaardigheden|skills|kundigheden)$/i],
    ["strengths", /^(competenties|strengths|kernkwaliteiten)$/i],
    ["projects", /^(projecten|projects)$/i],
    ["profile", /^(profiel|profile|over mij|about(?: me)?|in het kort|samenvatting|summary)$/i],
    ["contact", /^(contact|contactgegevens)$/i]
];

function headingId(line) {
    const clean = String(line || "").trim().replace(/[:.]$/, "");
    for (let i = 0; i < SECTION_HEADS.length; i++) {
        if (SECTION_HEADS[i][1].test(clean)) return SECTION_HEADS[i][0];
    }
    return "";
}

function isBullet(line) {
    return /^([-*•]|\d+[.)])\s+/.test(String(line || "").trim());
}

function bulletText(line) {
    return String(line || "").trim().replace(/^([-*•]|\d+[.)])\s+/, "").trim();
}

function looksLikeDate(line) {
    const value = String(line || "").trim();
    if (!value || value.length > 42) return false;
    return /(\d{4}\s*[–—-]\s*(?:\d{4}|heden|present|nu|now))|((?:jan(?:uari)?|feb(?:ruari)?|mrt|maart|apr(?:il)?|mei|jun(?:i)?|jul(?:i)?|aug(?:ustus)?|sep(?:tember)?|okt(?:ober)?|nov(?:ember)?|dec(?:ember)?|january|february|march|april|may|june|july|august|september|october|november|december)[a-z.]*\s+\d{4})|^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/i.test(value);
}

function buildCvData(data) {
    const next = { version: 1, lang: lang, kind: "cv", theme: doc.theme, sidebar: [], main: [] };
    next.sidebar.push(block("name", { html: textToHtml(data.name || t("ph.name")) }));
    next.sidebar.push(block("role", { html: textToHtml(data.role || t("ph.role")) }));
    const contacts = [
        ["city", data.city],
        ["phone", data.phone],
        ["email", data.email],
        ["born", data.born]
    ].filter(function (row) { return row[1]; });
    if (contacts.length) {
        next.sidebar.push(barHeading("doc.contact"));
        contacts.forEach(function (row) {
            next.sidebar.push(block("contact", { labelKey: row[0], label: "", html: textToHtml(row[1]) }));
        });
    }
    const skills = data.skills || [];
    if (skills.length) {
        next.sidebar.push(barHeading("doc.skills"));
        skills.forEach(function (skill) { next.sidebar.push(block("skill", { html: textToHtml(skill) })); });
    }
    (data.strengths || []).forEach(function (item, index) {
        if (index === 0) next.sidebar.push(barHeading("doc.strengths"));
        next.sidebar.push(block("competence", { title: textToHtml(item.title), body: textToHtml(item.body) }));
    });
    (data.projects || []).forEach(function (item, index) {
        if (index === 0) next.sidebar.push(barHeading("doc.projects"));
        next.sidebar.push(block("project", { title: textToHtml(item.title), body: textToHtml(item.body) }));
    });
    if (data.intro) {
        next.main.push(barHeading("doc.profile"));
        next.main.push(block("intro", { html: textToHtml(data.intro) }));
    }
    if ((data.jobs || []).length) {
        next.main.push(barHeading("doc.work"));
        data.jobs.forEach(function (item) { pushTimeline(next.main, item); });
    }
    if ((data.studies || []).length) {
        next.main.push(barHeading("doc.education"));
        data.studies.forEach(function (item) { pushTimeline(next.main, item); });
    }
    return next;
}

function buildLetterData(data) {
    const next = { version: 1, lang: lang, kind: "letter", theme: doc.theme, sidebar: [], main: [] };
    next.sidebar.push(block("name", { html: textToHtml(data.name || t("ph.name")) }));
    next.sidebar.push(block("role", { html: textToHtml(data.role || t("ph.role")) }));
    const contacts = [["city", data.city], ["phone", data.phone], ["email", data.email]].filter(function (row) { return row[1]; });
    if (contacts.length) {
        next.sidebar.push(barHeading("doc.contact"));
        contacts.forEach(function (row) {
            next.sidebar.push(block("contact", { labelKey: row[0], label: "", html: textToHtml(row[1]) }));
        });
    }
    const head = data.letter || {};
    next.main.push(makeLetterhead(
        textToHtml(head.date || ""),
        nameToHtml(head.to || ""),
        textToHtml(head.subject || ""),
        ""
    ));
    if (data.intro) next.main.push(block("intro", { html: textToHtml(data.intro) }));
    (head.paragraphs || []).forEach(function (paragraph) {
        next.main.push(block("paragraph", { html: textToHtml(paragraph) }));
    });
    if (head.closing) next.main.push(block("closing", { paragraphs: [textToHtml(head.closing)] }));
    if (head.sign || data.name) next.main.push(block("signature", { html: textToHtml(head.sign || data.name || "") }));
    return next;
}

function parseLoose(text, kind) {
    const lines = String(text || "").replace(/\r/g, "").split("\n");
    const flat = lines.join("\n");
    const email = (flat.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [""])[0];
    const phoneMatch = flat.match(/(?:\+\d{1,3}[\s().-]*)?(?:\(?0\)?[\s.-]*)?\d(?:[\s().-]*\d){8,12}/);
    const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, " ").trim() : "";
    const born = (lines.map(function (line) { return line.trim(); }).find(function (line) { return /^\d{2}[-/.]\d{2}[-/.]\d{4}$/.test(line); }) || "");
    const sections = { preamble: [], profile: [], skills: [], strengths: [], projects: [], work: [], study: [], contact: [] };
    let current = "preamble";
    lines.forEach(function (line) {
        const id = headingId(line);
        if (id) {
            current = id;
            return;
        }
        sections[current].push(line);
    });
    function grouped(list) {
        const chunks = [];
        let buf = [];
        function flush() {
            if (buf.some(function (line) { return line.trim(); })) chunks.push(buf);
            buf = [];
        }
        list.forEach(function (line) {
            if (!line.trim()) flush();
            else buf.push(line);
        });
        flush();
        return chunks.map(function (chunk) {
            const bullets = [];
            const heads = [];
            chunk.forEach(function (line) {
                if (isBullet(line)) bullets.push(bulletText(line));
                else heads.push(line.trim());
            });
            const date = heads.find(looksLikeDate) || "";
            const rest = heads.filter(function (line) { return line !== date; });
            return { title: rest[0] || "", org: rest.slice(1).join(", "), date: date, items: bullets };
        }).filter(function (entry) { return entry.title || entry.org || entry.date || entry.items.length; });
    }
    const preamble = sections.preamble.map(function (line) { return line.trim(); }).filter(Boolean);
    const leftovers = preamble.filter(function (line) {
        if (email && line.indexOf(email) >= 0) return false;
        if (phone && line.replace(/\s/g, "").indexOf(phone.replace(/\s/g, "")) >= 0) return false;
        if (born && line === born) return false;
        if (isBullet(line)) return false;
        return true;
    });
    let name = "";
    let role = "";
    if (kind !== "letter") {
        name = leftovers.find(function (line) {
            return line.length < 42 && line.split(/\s+/).length <= 5 && !looksLikeDate(line) && line.indexOf(":") < 0;
        }) || "";
        const after = leftovers.slice(leftovers.indexOf(name) + 1);
        role = after.find(function (line) {
            return line.length < 48 && line.split(/\s+/).length <= 7 && !looksLikeDate(line);
        }) || "";
        if (role.length > 40) role = "";
    }
    const used = {};
    [name, role, email, phone, born].forEach(function (value) { if (value) used[value] = true; });
    const city = leftovers.find(function (line) {
        return !used[line] && line.length < 32 && !looksLikeDate(line) && line.indexOf("@") < 0 && !/\d{3}/.test(line) && line.split(/\s+/).length <= 3;
    }) || "";
    if (city) used[city] = true;
    const introLines = [];
    if (kind !== "letter") {
        leftovers.forEach(function (line) { if (!used[line]) introLines.push(line); });
        sections.profile.forEach(function (line) { if (line.trim()) introLines.push(line.trim()); });
    }
    function titled(list) {
        return list.map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) {
            const value = isBullet(line) ? bulletText(line) : line;
            const split = value.indexOf(":");
            return split < 0
                ? { title: value, body: "" }
                : { title: value.slice(0, split).trim(), body: value.slice(split + 1).trim() };
        });
    }
    const skills = sections.skills.map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) {
        return isBullet(line) ? bulletText(line) : line;
    });
    if (!skills.length && kind !== "letter") {
        preamble.filter(isBullet).forEach(function (line) { skills.push(bulletText(line)); });
    }
    const data = {
        name: name,
        role: role,
        city: city,
        phone: phone,
        email: email,
        born: born,
        intro: introLines.join("\n").trim(),
        skills: skills,
        strengths: titled(sections.strengths),
        projects: titled(sections.projects),
        jobs: grouped(sections.work),
        studies: grouped(sections.study),
        letter: null
    };
    if (kind === "letter") {
        const bodyLines = lines.map(function (line) { return line.trim(); });
        const subjectLine = bodyLines.find(function (line) { return /^(onderwerp|betreft|subject|re)\s*:/i.test(line); }) || "";
        const greetAt = bodyLines.findIndex(function (line) { return /^(beste|geachte|dear|hi|hallo)\b/i.test(line); });
        const closeAt = bodyLines.findIndex(function (line) { return /^(met vriendelijke groet|hoogachtend|kind regards|yours sincerely|sincerely|groeten)\b/i.test(line); });
        const date = bodyLines.find(function (line) { return looksLikeDate(line); }) || "";
        const topEnd = greetAt > 0 ? greetAt : Math.min(bodyLines.length, 8);
        const top = bodyLines.slice(0, topEnd).filter(Boolean).filter(function (line) {
            return line !== date && line !== subjectLine && line.indexOf(email) < 0 && line !== phone && !headingId(line);
        });
        const person = top.length ? top[0] : "";
        const start = greetAt >= 0 ? greetAt + 1 : 0;
        const end = closeAt >= 0 ? closeAt : bodyLines.length;
        const paragraphs = bodyLines.slice(start, end).join("\n").split(/\n{2,}/).map(function (part) { return part.trim(); }).filter(Boolean);
        const after = closeAt >= 0 ? bodyLines.slice(closeAt + 1).filter(Boolean) : [];
        data.name = person || data.name;
        data.letter = {
            date: date,
            to: top.filter(function (line) { return line !== person; }).join("\n"),
            subject: subjectLine.replace(/^(onderwerp|betreft|subject|re)\s*:\s*/i, ""),
            paragraphs: paragraphs,
            closing: closeAt >= 0 ? bodyLines[closeAt] : "",
            sign: after.length ? after[after.length - 1] : person
        };
    }
    return data;
}

function installDocument(next, keepTheme) {
    if (keepTheme && doc) next.theme = doc.theme;
    snapshot();
    doc = next;
    normalize(doc);
    selectedId = null;
    filenameCustom = false;
    syncFilenameFromPerson();
    showError("");
    applyLanguage();
    render();
    documentLive = true;
    save();
}

function describeLoose(data) {
    const bits = [];
    if (data.name) bits.push(data.name);
    if (data.role) bits.push(data.role);
    if (data.skills && data.skills.length) bits.push(t("doc.skills") + " " + data.skills.length);
    if (data.jobs && data.jobs.length) bits.push(t("doc.work") + " " + data.jobs.length);
    if (data.studies && data.studies.length) bits.push(t("doc.education") + " " + data.studies.length);
    if (data.letter && data.letter.paragraphs && data.letter.paragraphs.length) bits.push(t("shell.body"));
    return bits.join(", ");
}

function applyLooseText(text, kind) {
    const data = parseLoose(text, kind);
    if (kind === "letter" && data.letter) installDocument(buildLetterData(data), true);
    else installDocument(buildCvData(data), true);
    return data;
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Read and write the @@@CV / @@@LETTER document format. */

function markedText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    holder.querySelectorAll("br").forEach(function (br) { br.replaceWith("\n"); });
    return holder.textContent.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function textToHtml(value) {
    return escapeHtml(value || "").replace(/\n/g, "<br>");
}

function nameToHtml(value) {
    return String(value || "")
        .split(/<br\s*\/?>/i)
        .map(function (part) { return escapeHtml(part.trim()); })
        .filter(Boolean)
        .join("<br>");
}

function fieldValue(text, key) {
    const match = String(text || "").match(new RegExp("^" + key + ":[^\\S\\n]*(.*)$", "im"));
    return match ? match[1].trim() : "";
}

function photoAspect(value) {
    const text = String(value || "").toLowerCase().replace(/\s+/g, "");
    if (text === "1/1") return "1 / 1";
    if (text === "4/3") return "4 / 3";
    return "3 / 4";
}

function photoAddress(value) {
    const text = String(value || "").trim();
    if (/^https:\/\//i.test(text)) return text;
    if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(text) && text.length <= 8000000) return text;
    return "";
}

function readPhotoFields(rest) {
    const width = Number(fieldValue(rest, "WIDTH"));
    const filled = /^(yes|ja|true|1)$/i.test(fieldValue(rest, "FILLED"));
    const url = photoAddress(fieldValue(rest, "URL"));
    const fields = {
        src: "",
        original: "",
        caption: textToHtml(fieldValue(rest, "CAPTION")),
        aspect: photoAspect(fieldValue(rest, "ASPECT")),
        url: /^data:image\//i.test(url) ? "" : url
    };
    if (width >= 36 && width <= 100) fields.width = Math.round(width);
    if (filled) fields.src = typeof placeholderPhoto === "function" ? placeholderPhoto() : "";
    if (/^data:image\//i.test(url)) fields.pending = url;
    return fields;
}

function placePhoto(next, rest) {
    const fields = readPhotoFields(rest);
    const item = block("photo", fields);
    if (fieldValue(rest, "COLUMN").toLowerCase() === "main") {
        next.main.push(item);
        return item;
    }
    const hasSidebarPhoto = next.sidebar.some(function (entry) { return entry.type === "photo"; });
    if (hasSidebarPhoto) {
        next.sidebar.push(item);
        return item;
    }
    const roleAt = next.sidebar.findIndex(function (entry) { return entry.type === "role"; });
    if (roleAt >= 0) {
        next.sidebar.splice(roleAt, 0, item);
        return item;
    }
    const nameAt = next.sidebar.findIndex(function (entry) { return entry.type === "name"; });
    if (nameAt >= 0) next.sidebar.splice(nameAt + 1, 0, item);
    else next.sidebar.unshift(item);
    return item;
}

function photoMarkedLines(item) {
    const fields = item.fields || {};
    const lines = ["@@@PHOTO", "CAPTION: " + markedText(fields.caption || "")];
    lines.push("ASPECT: " + (fields.aspect || "3 / 4"));
    const width = typeof photoWidth === "function" ? photoWidth(item) : (Number(fields.width) || 92);
    lines.push("WIDTH: " + width);
    if (fields.src) lines.push("FILLED: yes");
    if (/^https:\/\//i.test(String(fields.url || ""))) lines.push("URL: " + String(fields.url).trim());
    if (typeof columnOf === "function" && columnOf(item.id) === "main") lines.push("COLUMN: main");
    return lines;
}

function pointBody(line) {
    const trimmed = String(line || "").trim();
    if (trimmed.indexOf("POINT:") === 0) return trimmed.slice(6).trim();
    if (trimmed.indexOf("- ") === 0 || trimmed.indexOf("* ") === 0) return trimmed.slice(2).trim();
    return null;
}

function profileBody(rest) {
    const text = String(rest || "").trim();
    if (!text) return "";
    const summary = fieldValue(text, "SUMMARY");
    const other = text.replace(/^SUMMARY:[^\S\n]*.*$/gim, "").trim();
    if (summary && !other) return summary;
    return text;
}

function letterheadFilled(rest) {
    return ["TITLE", "DATE", "TO", "SUBJECT"].some(function (key) { return fieldValue(rest, key); });
}

function blankEntry(item) {
    return !item.title && !item.date && !item.org && !(item.items && item.items.length);
}

function bulletLines(text) {
    return String(text || "").split(/\r?\n/).map(pointBody).filter(function (line) { return line; });
}

function titledLines(text) {
    return bulletLines(text).map(function (line) {
        const split = line.indexOf(":");
        return split < 0
            ? { title: "", body: line }
            : { title: line.slice(0, split).trim(), body: line.slice(split + 1).trim() };
    });
}

function entryFrom(text) {
    const bullets = [];
    const fields = {};
    String(text || "").split(/\r?\n/).forEach(function (line) {
        const trimmed = line.trim();
        const point = pointBody(trimmed);
        if (point !== null) {
            if (point) bullets.push(point);
            return;
        }
        const match = trimmed.match(/^(TITLE|DATE|ORGANIZATION):\s*(.*)$/i);
        if (match) fields[match[1].toUpperCase()] = match[2].trim();
    });
    return {
        title: fields.TITLE || "",
        date: fields.DATE || "",
        org: fields.ORGANIZATION || "",
        items: bullets
    };
}

function exportMarked() {
    const lines = [doc.kind === "letter" ? "@@@LETTER" : "@@@CV"];
    const name = doc.sidebar.concat(doc.main).find(function (item) { return item.type === "name"; });
    const role = doc.sidebar.concat(doc.main).find(function (item) { return item.type === "role"; });
    lines.push("NAME: " + (name ? markedText(name.fields.html).replace(/\n/g, "<br>") : ""));
    lines.push("ROLE: " + (role ? markedText(role.fields.html) : ""));
    const intro = doc.sidebar.concat(doc.main).find(function (item) { return item.type === "intro"; });
    if (doc.kind === "letter") {
        const letterhead = doc.sidebar.concat(doc.main).find(function (item) { return item.type === "letterhead"; });
        if (letterhead) {
            lines.push("TITLE: " + markedText(letterhead.fields.title || ""));
            lines.push("DATE: " + markedText(letterhead.fields.date));
            lines.push("TO: " + markedText(letterhead.fields.to).replace(/\n/g, "<br>"));
            lines.push("SUBJECT: " + markedText(letterhead.fields.subject));
        }
        lines.push("SUMMARY: " + (intro ? markedText(intro.fields.html).replace(/\n/g, " ") : ""));
    }
    const sidePhotos = [];
    let leadPhoto = null;
    doc.sidebar.forEach(function (item, index) {
        if (item.type !== "photo") return;
        if (!leadPhoto) leadPhoto = item;
        else sidePhotos.push({ item: item, index: index });
    });
    let photoAt = 0;
    function flushSidebarPhotos(before) {
        while (photoAt < sidePhotos.length && sidePhotos[photoAt].index < before) {
            photoMarkedLines(sidePhotos[photoAt].item).forEach(function (line) { lines.push(line); });
            photoAt += 1;
        }
    }
    function sidebarSection(headingKey, type) {
        const index = doc.sidebar.findIndex(function (item) {
            if (headingKey && item.type === "heading" && item.fields.key === headingKey) return true;
            return item.type === type;
        });
        return index < 0 ? doc.sidebar.length + 1 : index;
    }
    if (leadPhoto) photoMarkedLines(leadPhoto).forEach(function (line) { lines.push(line); });
    lines.push("@@@CONTACT");
    ["city", "phone", "email", "born"].forEach(function (key) {
        const row = doc.sidebar.concat(doc.main).find(function (item) {
            return item.type === "contact" && item.fields.labelKey === key;
        });
        lines.push(key.toUpperCase() + ": " + (row ? markedText(row.fields.html) : ""));
    });
    doc.sidebar.concat(doc.main).forEach(function (item) {
        if (item.type === "contact" && item.fields.labelKey === "custom") {
            lines.push("LABEL: " + markedText(item.fields.label));
            lines.push("VALUE: " + markedText(item.fields.html));
        }
    });
    flushSidebarPhotos(sidebarSection("doc.skills", "skill"));
    lines.push("@@@SKILLS");
    doc.sidebar.concat(doc.main).forEach(function (item) {
        if (item.type === "skill") lines.push("POINT: " + markedText(item.fields.html));
    });
    flushSidebarPhotos(sidebarSection("doc.strengths", "competence"));
    lines.push("@@@STRENGTHS");
    doc.sidebar.concat(doc.main).forEach(function (item) {
        if (item.type === "competence") lines.push("POINT: " + markedText(item.fields.title) + ": " + markedText(item.fields.body));
    });
    flushSidebarPhotos(sidebarSection("doc.projects", "project"));
    lines.push("@@@PROJECTS");
    doc.sidebar.concat(doc.main).forEach(function (item) {
        if (item.type === "project") lines.push("POINT: " + markedText(item.fields.title) + ": " + markedText(item.fields.body));
    });
    flushSidebarPhotos(doc.sidebar.length);
    if (doc.kind !== "letter") {
        lines.push("@@@PROFILE");
        lines.push(intro ? markedText(intro.fields.html) : "");
    }
    let mode = "job";
    let closing = null;
    let sign = "";
    doc.main.forEach(function (item) {
        if (item.type === "heading") {
            if (item.fields.key === "doc.education") mode = "study";
            else if (item.fields.key === "doc.work") mode = "job";
            else if (!item.fields.key && item.fields.key !== "doc.profile" && item.fields.key !== "doc.letter") {
                lines.push("@@@SECTION");
                lines.push("HEADING: " + markedText(item.fields.html));
            }
            return;
        }
        if (item.type === "timeline") {
            lines.push(mode === "study" ? "@@@STUDY" : "@@@JOB");
            lines.push("TITLE: " + markedText(item.fields.title));
            lines.push("DATE: " + markedText(item.fields.date));
            lines.push("ORGANIZATION: " + markedText(item.fields.org));
            (item.fields.items || []).forEach(function (bullet) { lines.push("POINT: " + markedText(bullet)); });
        } else if (item.type === "paragraph") {
            lines.push("@@@PARAGRAPH");
            lines.push(markedText(item.fields.html));
        } else if (item.type === "letterhead") {
            if (doc.kind === "letter") return;
            lines.push("@@@LETTERHEAD");
            lines.push("TITLE: " + markedText(item.fields.title || ""));
            lines.push("DATE: " + markedText(item.fields.date));
            lines.push("TO: " + markedText(item.fields.to).replace(/\n/g, "<br>"));
            lines.push("SUBJECT: " + markedText(item.fields.subject));
        } else if (item.type === "list") {
            lines.push("@@@LIST");
            (item.fields.items || []).forEach(function (bullet) { lines.push("POINT: " + markedText(bullet)); });
        } else if (item.type === "closing") {
            closing = item;
        } else if (item.type === "signature") {
            sign = markedText(item.fields.html);
        } else if (item.type === "spacer") {
            lines.push("@@@SPACER");
            lines.push("SIZE: " + (Number(item.fields.size) || 12));
        } else if (item.type === "photo") {
            photoMarkedLines(item).forEach(function (line) { lines.push(line); });
        }
    });
    if (closing || sign) {
        lines.push("@@@CLOSING");
        if (closing) lines.push((closing.fields.paragraphs || []).map(markedText).filter(Boolean).join("\n\n"));
        if (sign) lines.push("SIGN: " + sign);
    }
    lines.push("@@@END");
    return lines.join("\n");
}

function stripCodeFence(raw) {
    const text = String(raw || "").replace(/^\uFEFF/, "");
    const re = /```[a-zA-Z0-9_-]*[ \t]*\r?\n?([\s\S]*?)```/g;
    let found = "";
    let match;
    while ((match = re.exec(text))) {
        if (match[1].indexOf("@@@") >= 0) found = match[1];
    }
    return found || text;
}

function markerIndex(source, name, last) {
    const re = new RegExp("@@@" + name + "(?![A-Za-z])", "g");
    let at = -1;
    let match;
    while ((match = re.exec(source))) {
        at = match.index;
        if (!last) break;
    }
    return at;
}

function parseMarked(raw) {
    const source = stripCodeFence(raw);
    const end = markerIndex(source, "END", true);
    const cvAt = markerIndex(source, "CV", false);
    const letterAt = markerIndex(source, "LETTER", false);
    const start = cvAt >= 0 && (letterAt < 0 || cvAt < letterAt) ? cvAt : letterAt;
    if (start < 0 || end < start) throw new Error(t("ui.parseError"));
    photoLoads = [];
    const kind = /^@@@LETTER(?![A-Za-z])/.test(source.slice(start)) ? "letter" : "cv";
    const chunks = source.slice(start, end).split(/\n@@@/).map(function (chunk) { return chunk.trim(); }).filter(Boolean);
    return { kind: kind, chunks: chunks };
}

let photoLoads = [];

function pushTimeline(target, item) {
    target.push(block("timeline", {
        title: textToHtml(item.title),
        date: textToHtml(item.date),
        org: textToHtml(item.org),
        items: (item.items.length ? item.items : [""]).map(textToHtml)
    }));
}

function hexField(text, key) {
    const value = fieldValue(text, key);
    return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "";
}

function applyChunkPaint(next, sideBefore, mainBefore, rest) {
    const color = hexField(rest, "COLOR");
    const background = hexField(rest, "BACKGROUND");
    const size = Number(fieldValue(rest, "SIZE"));
    const sized = size >= 8 && size <= 28;
    if (!color && !background && !sized) return;
    next.sidebar.slice(sideBefore).concat(next.main.slice(mainBefore)).forEach(function (item) {
        if (item.type === "spacer") return;
        if (color) item.color = color;
        if (background) item.background = background;
        if (sized) item.fontSize = size;
    });
}

function applyThemeFields(theme, rest) {
    const map = {
        SIDEBAR: "sidebar",
        SIDEBARTEXT: "sidebarText",
        ACCENT: "accent",
        ACCENTLIGHT: "accentLight",
        PAGE: "page",
        TEXT: "text"
    };
    Object.keys(map).forEach(function (key) {
        const value = hexField(rest, key);
        if (value) theme[map[key]] = value;
    });
    const size = Number(fieldValue(rest, "SIZE"));
    if (size >= 8 && size <= 14) theme.baseSize = size;
    const column = Number(fieldValue(rest, "COLUMN"));
    if (column >= 24 && column <= 50) theme.sidebarWidth = column;
    const font = fieldValue(rest, "FONT").toLowerCase();
    if (font === "roboto" || font === "merriweather" || font === "lora") theme.font = font;
}

function applyMarked(raw) {
    const parsed = parseMarked(raw);
    const next = { version: 1, lang: lang, kind: parsed.kind, theme: doc.theme, sidebar: [], main: [] };
    const seen = {};
    let useful = false;
    let sign = "";
    function marker(flag, key) {
        if (seen[flag]) return;
        seen[flag] = true;
        next.sidebar.push(barHeading(key));
    }
    parsed.chunks.forEach(function (chunk) {
        const breakAt = chunk.indexOf("\n");
        const head = (breakAt < 0 ? chunk : chunk.slice(0, breakAt)).replace(/^@+/, "").trim().toUpperCase();
        const rest = breakAt < 0 ? "" : chunk.slice(breakAt + 1).trim();
        if (head === "THEME") {
            applyThemeFields(next.theme, rest);
            return;
        }
        const sideBefore = next.sidebar.length;
        const mainBefore = next.main.length;
        if (head === "CV" || head === "LETTER") {
            const person = fieldValue(rest, "NAME");
            const role = fieldValue(rest, "ROLE");
            if (person) {
                next.sidebar.push(block("name", { html: nameToHtml(person) }));
                useful = true;
            }
            if (role) next.sidebar.push(block("role", { html: textToHtml(role) }));
            if (parsed.kind === "letter") {
                next.main.push(makeLetterhead(
                    textToHtml(fieldValue(rest, "DATE")),
                    nameToHtml(fieldValue(rest, "TO")),
                    textToHtml(fieldValue(rest, "SUBJECT")),
                    textToHtml(fieldValue(rest, "TITLE"))
                ));
                useful = true;
            }
            if (fieldValue(rest, "SUMMARY")) {
                next.main.push(block("intro", { html: textToHtml(fieldValue(rest, "SUMMARY")) }));
                useful = true;
            }
        } else if (head === "CONTACT") {
            const rows = ["city", "phone", "email", "born"].filter(function (key) { return fieldValue(rest, key.toUpperCase()); });
            const custom = [];
            rest.split(/\n/).forEach(function (line, index, all) {
                if (!/^LABEL:/i.test(line)) return;
                const valueLine = all[index + 1] || "";
                custom.push({
                    label: line.replace(/^LABEL:\s*/i, "").trim(),
                    value: /^VALUE:/i.test(valueLine) ? valueLine.replace(/^VALUE:\s*/i, "").trim() : ""
                });
            });
            if (rows.length || custom.length) marker("contact", "doc.contact");
            rows.forEach(function (key) {
                next.sidebar.push(block("contact", { labelKey: key, label: "", html: textToHtml(fieldValue(rest, key.toUpperCase())) }));
                useful = true;
            });
            custom.forEach(function (row) {
                next.sidebar.push(block("contact", { labelKey: "custom", label: textToHtml(row.label), html: textToHtml(row.value) }));
            });
        } else if (head === "SKILLS") {
            const skills = bulletLines(rest);
            if (!skills.length) return;
            marker("skills", "doc.skills");
            skills.forEach(function (skill) { next.sidebar.push(block("skill", { html: textToHtml(skill) })); });
            useful = true;
        } else if (head === "STRENGTHS") {
            const items = titledLines(rest);
            if (!items.length) return;
            marker("strengths", "doc.strengths");
            items.forEach(function (item) {
                next.sidebar.push(block("competence", { title: textToHtml(item.title), body: textToHtml(item.body) }));
            });
            useful = true;
        } else if (head === "PROJECTS") {
            const items = titledLines(rest);
            if (!items.length) return;
            marker("projects", "doc.projects");
            items.forEach(function (item) {
                next.sidebar.push(block("project", { title: textToHtml(item.title), body: textToHtml(item.body) }));
            });
            useful = true;
        } else if (head === "PROFILE") {
            const body = profileBody(rest);
            if (!body) return;
            next.main.push(barHeading("doc.profile"));
            next.main.push(block("intro", { html: textToHtml(body) }));
            useful = true;
        } else if (head === "JOB" || head === "STUDY") {
            const item = entryFrom(rest);
            if (blankEntry(item)) return;
            const flag = head === "STUDY" ? "study" : "work";
            if (!seen[flag]) {
                seen[flag] = true;
                next.main.push(barHeading(flag === "study" ? "doc.education" : "doc.work"));
            }
            pushTimeline(next.main, item);
            useful = true;
        } else if (head === "PARAGRAPH" || head === "OPENING") {
            rest.split(/\n{2,}/).forEach(function (part) {
                if (!part.trim()) return;
                next.main.push(block("paragraph", { html: textToHtml(part.trim()) }));
                useful = true;
            });
        } else if (head === "LIST") {
            const items = bulletLines(rest);
            if (!items.length) return;
            next.main.push(block("list", { items: items.map(textToHtml) }));
            useful = true;
        } else if (head === "LETTERHEAD") {
            if (!letterheadFilled(rest)) return;
            next.main.push(makeLetterhead(
                textToHtml(fieldValue(rest, "DATE")),
                nameToHtml(fieldValue(rest, "TO")),
                textToHtml(fieldValue(rest, "SUBJECT")),
                textToHtml(fieldValue(rest, "TITLE"))
            ));
            useful = true;
        } else if (head === "SECTION") {
            const heading = fieldValue(rest, "HEADING");
            const bodyAt = rest.search(/^BODY:\s*/im);
            const body = bodyAt < 0 ? "" : rest.slice(bodyAt).replace(/^BODY:\s*/i, "");
            if (!heading && !body.trim()) return;
            if (heading) {
                next.main.push(block("heading", {
                    key: "",
                    style: parsed.kind === "letter" ? "label" : "bar",
                    html: textToHtml(heading)
                }));
            }
            body.split(/\n{2,}/).forEach(function (part) {
                if (part.trim()) next.main.push(block("paragraph", { html: textToHtml(part.trim()) }));
            });
            useful = true;
        } else if (head === "CLOSING") {
            sign = fieldValue(rest, "SIGN") || sign;
            const paragraphs = rest.replace(/^SIGN:.*$/gim, "").trim().split(/\n{2,}/).map(function (part) {
                return part.trim();
            }).filter(function (part) { return part && !/^SIGN:/i.test(part); });
            if (paragraphs.length) {
                next.main.push(block("closing", { paragraphs: paragraphs.map(textToHtml) }));
                useful = true;
            }
        } else if (head === "HEADING") {
            const text = fieldValue(rest, "TEXT");
            if (!text) return;
            const style = /^label$/i.test(fieldValue(rest, "STYLE")) ? "label" : "bar";
            next.main.push(block("heading", { key: "", style: style, html: textToHtml(text) }));
            useful = true;
        } else if (head === "SPACER") {
            const size = Number(fieldValue(rest, "SIZE")) || 12;
            next.main.push(block("spacer", { size: Math.max(4, Math.min(48, size)) }));
            useful = true;
        } else if (head === "PHOTO") {
            const item = placePhoto(next, rest);
            if (item.fields.pending) {
                photoLoads.push([item, item.fields.pending]);
                delete item.fields.pending;
            }
            useful = true;
        }
        applyChunkPaint(next, sideBefore, mainBefore, rest);
    });
    if (sign) next.main.push(block("signature", { html: textToHtml(sign) }));
    if (!useful) throw new Error(t("ui.parseError"));
    snapshot();
    doc = next;
    normalize(doc);
    selectedId = null;
    const nameInput = document.getElementById("pdf-name");
    nameInput.value = plainName();
    try { localStorage.setItem(STORAGE_NAME, nameInput.value); } catch (error) { /* ignore */ }
    showError("");
    applyLanguage();
    render();
    save();
    photoLoads.forEach(function (pair) { importPhotoAddress(pair[0], pair[1]); });
    doc.sidebar.concat(doc.main).forEach(function (item) {
        if (item.type === "photo" && /^https:\/\//i.test(item.fields.url || "")) importPhotoAddress(item, item.fields.url);
    });
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Reorder blocks with the pointer. Escape puts a drag back. */

function dropTarget(x, y, ignore) {
    const stack = document.elementsFromPoint(x, y);
    let column = null;
    let block = null;
    for (let index = 0; index < stack.length; index += 1) {
        const node = stack[index];
        if (!node || node.nodeType !== 1) continue;
        if (ignore && (node === ignore || node.closest && ignore.contains(node))) continue;
        if (node.closest("#drag-ghost, #drop-line, #floatbar")) continue;
        if (node.closest("#toast, .crop-dialog, .topbar, .library, .drawer")) return null;
        const col = node.id === "col-sidebar" || node.id === "col-main" ? node : node.closest("#col-sidebar, #col-main");
        if (!col) continue;
        column = col;
        const hit = node.closest(".block");
        if (hit && hit !== ignore && hit.parentElement === col) block = hit;
        break;
    }
    if (!column) return null;
    if (!block) {
        const blocks = Array.from(column.children).filter(function (node) {
            return node !== ignore && node.classList.contains("block");
        });
        let before = null;
        blocks.forEach(function (node) {
            if (before) return;
            const rect = node.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) before = node;
        });
        return { column: column, before: before };
    }
    const rect = block.getBoundingClientRect();
    const after = y > rect.top + rect.height / 2;
    let before = after ? block.nextElementSibling : block;
    if (before && !before.classList.contains("block")) before = null;
    return { column: column, before: before };
}

function paintDrop(spot) {
    document.querySelectorAll(".col.is-drop").forEach(function (node) { node.classList.remove("is-drop"); });
    const line = document.getElementById("drop-line");
    if (!spot) {
        if (line) line.hidden = true;
        return;
    }
    spot.column.classList.add("is-drop");
    if (!line) return;
    const columnRect = spot.column.getBoundingClientRect();
    let top = columnRect.top + 10;
    if (spot.before) top = spot.before.getBoundingClientRect().top;
    else {
        const blocks = spot.column.querySelectorAll(":scope > .block");
        const last = blocks[blocks.length - 1];
        if (last) top = last.getBoundingClientRect().bottom + 3;
    }
    line.hidden = false;
    line.style.left = (columnRect.left + 10) + "px";
    line.style.width = Math.max(24, columnRect.width - 20) + "px";
    line.style.top = top + "px";
}

function clearDrop() {
    document.querySelectorAll(".col.is-drop").forEach(function (node) { node.classList.remove("is-drop"); });
    const line = document.getElementById("drop-line");
    if (line) line.hidden = true;
    const ghost = document.getElementById("drag-ghost");
    if (ghost) ghost.hidden = true;
    document.body.classList.remove("is-dragging");
}

function ensureDragChrome() {
    if (!document.getElementById("drop-line")) {
        const line = document.createElement("div");
        line.id = "drop-line";
        line.hidden = true;
        document.body.appendChild(line);
    }
    if (!document.getElementById("drag-ghost")) {
        const ghost = document.createElement("div");
        ghost.id = "drag-ghost";
        ghost.hidden = true;
        document.body.appendChild(ghost);
    }
}

function showGhost(text, x, y) {
    ensureDragChrome();
    const ghost = document.getElementById("drag-ghost");
    ghost.hidden = false;
    ghost.textContent = text;
    ghost.style.left = (x + 14) + "px";
    ghost.style.top = (y + 16) + "px";
}

function bindDrag(handle, blockEl) {
    handle.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const originParent = blockEl.parentElement;
        const originNext = blockEl.nextSibling;
        let cancelled = false;
        blockEl.classList.add("is-dragging");
        blockEl.style.pointerEvents = "none";
        document.body.classList.add("is-dragging");
        const bar = document.getElementById("floatbar");
        if (bar) bar.hidden = true;
        ensureDragChrome();
        function finish(commit) {
            activeDragCancel = null;
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", up);
            handle.removeEventListener("pointercancel", up);
            blockEl.classList.remove("is-dragging");
            blockEl.style.pointerEvents = "";
            clearDrop();
            function showBar() {
                updateInspector();
                positionFloatbar();
            }
            if (!commit || cancelled) {
                if (originParent) originParent.insertBefore(blockEl, originNext);
                showBar();
                return;
            }
            const from = columnOf(blockEl.dataset.id);
            const previous = JSON.stringify(doc);
            syncColumnsFromDom();
            if (JSON.stringify(doc) === previous) {
                showBar();
                return;
            }
            past.push(previous);
            if (past.length > 60) past.shift();
            future = [];
            syncHistoryButtons();
            save();
            if (columnOf(blockEl.dataset.id) !== from) render();
            else showBar();
        }
        function move(moveEvent) {
            nudgeScroll(moveEvent.clientX, moveEvent.clientY);
            const spot = dropTarget(moveEvent.clientX, moveEvent.clientY, blockEl);
            paintDrop(spot);
            if (!spot) return;
            const before = spot.before && spot.before.parentElement === spot.column ? spot.before : null;
            if (blockEl.parentElement !== spot.column || blockEl.nextSibling !== before) {
                spot.column.insertBefore(blockEl, before);
            }
        }
        function up() { finish(true); }
        activeDragCancel = function () {
            cancelled = true;
            finish(false);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
        handle.addEventListener("pointercancel", up);
        try { handle.setPointerCapture(event.pointerId); } catch (error) { /* synthetic events */ }
    });
}

function bindLibraryCard(button, type) {
    let start = null;
    let dragging = false;
    let pointerId = null;
    let fromGrip = false;
    button.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) return;
        fromGrip = !!(event.target.closest && event.target.closest(".library-grip"));
        if (event.pointerType === "touch" && !fromGrip) return;
        start = { x: event.clientX, y: event.clientY };
        pointerId = event.pointerId;
        dragging = false;
        if (fromGrip) event.preventDefault();
    });
    button.addEventListener("pointermove", function (event) {
        if (!start || event.pointerId !== pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!dragging) {
            if (dx * dx + dy * dy < 36) return;
            dragging = true;
            try { button.setPointerCapture(pointerId); } catch (error) { /* already gone */ }
            if (narrowStudio()) setStudioPane("page");
            document.body.classList.add("is-dragging");
            const bar = document.getElementById("floatbar");
            if (bar) bar.hidden = true;
            ensureDragChrome();
            activeDragCancel = function () {
                dragging = false;
                start = null;
                fromGrip = false;
                button.dataset.suppressClick = "1";
                try { button.releasePointerCapture(pointerId); } catch (error) { /* not captured */ }
                clearDrop();
                updateInspector();
                activeDragCancel = null;
            };
        }
        nudgeScroll(event.clientX, event.clientY);
        showGhost(t("type." + type), event.clientX, event.clientY);
        paintDrop(dropTarget(event.clientX, event.clientY, null));
    });
    function end(event) {
        if (!start || event.pointerId !== pointerId) return;
        const dropped = dragging;
        const gripTap = fromGrip;
        const spot = dropped ? dropTarget(event.clientX, event.clientY, null) : null;
        start = null;
        dragging = false;
        fromGrip = false;
        activeDragCancel = null;
        clearDrop();
        if (dropped || gripTap) button.dataset.suppressClick = "1";
        if (!dropped || !spot) {
            updateInspector();
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        insertBlockAt(type, spot);
    }
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", function (event) {
        start = null;
        dragging = false;
        fromGrip = false;
        activeDragCancel = null;
        clearDrop();
        if (event.pointerId === pointerId) button.dataset.suppressClick = "1";
    });
    button.addEventListener("click", function (event) {
        if (button.dataset.suppressClick) {
            button.dataset.suppressClick = "";
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        addBlock(type);
        if (narrowStudio()) setStudioPane("page");
    });
}

function insertBlockAt(type, spot) {
    const columnName = spot.column.id === "col-sidebar" ? "sidebar" : "main";
    snapshot();
    const item = createBlock(type);
    const list = doc[columnName];
    let index = list.length;
    if (spot.before && spot.before.dataset && spot.before.dataset.id) {
        const found = list.findIndex(function (entry) { return entry.id === spot.before.dataset.id; });
        if (found >= 0) index = found;
    }
    list.splice(index, 0, item);
    selectedId = item.id;
    setAddTarget(columnName);
    render();
    save();
    const node = document.querySelector('.block[data-id="' + item.id + '"]');
    const field = node && node.querySelector(".editable");
    if (field) focusEditable(field);
    else if (node) node.scrollIntoView({ block: "nearest" });
}

function syncColumnsFromDom() {
    const all = doc.sidebar.concat(doc.main);
    ["sidebar", "main"].forEach(function (name) {
        const column = document.getElementById(name === "sidebar" ? "col-sidebar" : "col-main");
        const ids = Array.from(column.children)
            .filter(function (node) { return node.classList.contains("block"); })
            .map(function (node) { return node.dataset.id; });
        doc[name] = ids.map(function (id) {
            return all.find(function (item) { return item.id === id; });
        }).filter(Boolean);
    });
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Editable text and drawing one block on the page. */

function serialize(root) {
    let out = "";
    root.childNodes.forEach(function (node) {
        if (node.nodeType === 3) {
            out += escapeHtml(node.textContent);
            return;
        }
        if (node.nodeType !== 1) return;
        const name = node.nodeName;
        if (name === "BR") {
            out += "<br>";
            return;
        }
        if (name === "B" || name === "STRONG") {
            out += "<strong>" + serialize(node) + "</strong>";
            return;
        }
        if (name === "I" || name === "EM") {
            out += "<em>" + serialize(node) + "</em>";
            return;
        }
        if (name === "U") {
            out += "<u>" + serialize(node) + "</u>";
            return;
        }
        if (name === "SPAN" || name === "FONT") {
            const color = (node.style && node.style.color) || node.getAttribute("color") || "";
            const size = (node.style && node.style.fontSize) || "";
            const weight = String((node.style && node.style.fontWeight) || "").toLowerCase();
            const numeric = parseInt(weight, 10);
            const bold = weight === "bold" || weight === "bolder" || numeric >= 600;
            const italic = String((node.style && node.style.fontStyle) || "").toLowerCase() === "italic";
            const deco = String((node.style && (node.style.textDecorationLine || node.style.textDecoration)) || "").toLowerCase();
            let inner = serialize(node);
            if (deco.indexOf("underline") >= 0) inner = "<u>" + inner + "</u>";
            if (italic) inner = "<em>" + inner + "</em>";
            if (bold) inner = "<strong>" + inner + "</strong>";
            const style = [];
            if (color) style.push("color:" + safeCss(color));
            if (size) style.push("font-size:" + safeCss(size));
            out += style.length ? '<span style="' + style.join(";") + '">' + inner + "</span>" : inner;
            return;
        }
        if (name === "DIV" || name === "P") {
            if (out && !out.endsWith("<br>")) out += "<br>";
            out += serialize(node);
            return;
        }
        out += serialize(node);
    });
    return out;
}

function fieldIsBlank(node) {
    return !node.textContent.replace(/\u00a0/g, " ").trim();
}

function editable(className, html, write, placeholder) {
    const node = document.createElement("div");
    node.className = "editable" + (className ? " " + className : "");
    node.contentEditable = "true";
    node.lang = spellLocale();
    node.setAttribute("lang", node.lang);
    node.spellcheck = true;
    node.setAttribute("spellcheck", "true");
    if (placeholder) node.dataset.placeholder = placeholder;
    if (className === "date" || placeholder === t("doc.phone") || placeholder === t("doc.email") || placeholder === t("doc.born") || placeholder === t("ph.date")) {
        node.spellcheck = false;
        node.setAttribute("spellcheck", "false");
    }
    node.innerHTML = html || "";
    node.classList.toggle("is-blank", fieldIsBlank(node));
    node.addEventListener("focus", function () {
        activeField = node;
        rememberSnapshot();
    });
    node.addEventListener("input", function () {
        node.classList.toggle("is-blank", fieldIsBlank(node));
        write(serialize(node));
    });
    node.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || event.shiftKey || event.altKey || event.isComposing || event.keyCode === 229) return;
        if (node.closest(".line")) return;
        const block = node.closest(".block");
        if (!block) return;
        const multiline = block.classList.contains("name")
            || block.classList.contains("paragraph")
            || block.classList.contains("intro")
            || node.classList.contains("body")
            || node.classList.contains("to");
        if (multiline) return;
        event.preventDefault();
        const fields = Array.prototype.slice.call(document.querySelectorAll("#sheet .editable"));
        const next = fields[fields.indexOf(node) + 1];
        if (next) focusEditable(next);
        else node.blur();
    });
    node.addEventListener("paste", function (event) {
        event.preventDefault();
        const text = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
        const before = node.innerHTML;
        let inserted = false;
        try { inserted = document.execCommand("insertText", false, text); } catch (error) { inserted = false; }
        if (!inserted || node.innerHTML === before) {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            node.dispatchEvent(new Event("input", { bubbles: true }));
        }
    });
    return node;
}

function focusEditable(node) {
    if (!node) return;
    node.focus();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function focusLine(id, index) {
    const rows = document.querySelectorAll('.block[data-id="' + id + '"] .line .editable');
    focusEditable(rows[index]);
}

function photoWidth(item) {
    const saved = Number(item.fields && item.fields.width);
    if (saved >= 36 && saved <= 100) return saved;
    return defaultPhotoWidth(item);
}

function defaultPhotoWidth(item) {
    if (columnOf(item.id) === "main") return 48;
    if (doc && doc.kind === "letter") return 64;
    return 92;
}

let photoWidthSnapped = false;

function paintPhotoWidth(item) {
    if (!item) return;
    const width = photoWidth(item);
    const sizeInput = document.getElementById("block-size");
    const sizeLabel = document.getElementById("block-size-value");
    if (sizeInput && sizeLabel && selectedBlock() === item) {
        sizeInput.value = String(width);
        sizeLabel.textContent = width + "%";
    }
    const page = document.getElementById("crop-page-size");
    const pageLabel = document.getElementById("crop-page-value");
    if (page) page.value = String(width);
    if (pageLabel) pageLabel.textContent = width + "%";
}

function applyPhotoFrame(item) {
    const frame = document.querySelector('.block[data-id="' + item.id + '"] .photo-frame');
    if (frame) frame.style.width = photoWidth(item) + "%";
    paintPhotoWidth(item);
}

function setPhotoWidth(item, width, snap) {
    if (!item) return;
    if (snap && !photoWidthSnapped) {
        snapshot();
        photoWidthSnapped = true;
    }
    item.fields.width = Math.max(36, Math.min(100, Math.round(Number(width))));
    applyPhotoFrame(item);
    save();
}

function resetPhotoWidth(item) {
    if (!item) return;
    snapshot();
    photoWidthSnapped = true;
    delete item.fields.width;
    applyPhotoFrame(item);
    save();
}

function nudgeScroll(x, y) {
    [document.querySelector(".preview"), document.querySelector(".library")].forEach(function (pane) {
        if (!pane) return;
        const rect = pane.getBoundingClientRect();
        if (x < rect.left - 8 || x > rect.right + 8 || y < rect.top || y > rect.bottom) return;
        const edge = 64;
        if (y < rect.top + edge) pane.scrollTop -= 22;
        else if (y > rect.bottom - edge) pane.scrollTop += 22;
    });
}

function paint(node, item) {
    if (item.type === "spacer") {
        node.style.height = (Number(item.fields.size) || 12) + "px";
        node.style.color = "";
        node.style.background = "";
        node.style.fontSize = "";
        return;
    }
    node.style.color = item.color || "";
    node.style.background = item.background || "";
    node.style.fontSize = item.fontSize ? item.fontSize + "pt" : "";
    if (item.color) node.style.setProperty("--block-color", item.color);
    else node.style.removeProperty("--block-color");
}

function headingStyle(item) {
    if (item.fields.style === "label" || item.fields.style === "bar") return item.fields.style;
    if (doc.kind === "letter" && columnOf(item.id) === "main" && !item.fields.key) return "label";
    return "bar";
}

function lineList(item, key, asList) {
    const list = document.createElement(asList ? "ul" : "div");
    list.className = asList ? "bullets" : "closing";
    const rows = item.fields[key] || [];
    rows.forEach(function (html, index) {
        const row = document.createElement(asList ? "li" : "div");
        row.className = "line";
        const field = editable("", html, function (value) {
            item.fields[key][index] = value;
            save();
        }, t("ph.text"));
        field.title = t("shell.addItem");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "line-x";
        remove.textContent = "\u00d7";
        remove.setAttribute("aria-label", t("ui.removeLine"));
        remove.title = t("ui.removeLine");
        remove.addEventListener("mousedown", function (event) { event.preventDefault(); });
        remove.addEventListener("click", function () {
            snapshot();
            item.fields[key].splice(index, 1);
            if (!item.fields[key].length) item.fields[key].push(escapeHtml(t("ph.text")));
            render();
            save();
        });
        field.addEventListener("keydown", function (event) {
            if (event.altKey || event.isComposing || event.keyCode === 229) return;
            const empty = !field.textContent.replace(/\u00a0/g, " ").trim();
            if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                if (empty) {
                    if (item.fields[key].length < 2) {
                        field.blur();
                        return;
                    }
                    snapshot();
                    item.fields[key].splice(index, 1);
                    render();
                    save();
                    focusLine(item.id, Math.max(0, index - 1));
                    return;
                }
                snapshot();
                item.fields[key].splice(index + 1, 0, "");
                render();
                save();
                focusLine(item.id, index + 1);
                return;
            }
            if (event.key === "Backspace" && empty && !event.shiftKey && !event.ctrlKey && !event.metaKey && item.fields[key].length > 1) {
                event.preventDefault();
                snapshot();
                item.fields[key].splice(index, 1);
                render();
                save();
                focusLine(item.id, Math.max(0, index - 1));
            }
        });
        row.append(field, remove);
        list.appendChild(row);
    });
    return list;
}

function renderBlock(item) {
    const node = document.createElement("section");
    node.className = "block " + item.type;
    node.dataset.id = item.id;
    paint(node, item);
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "drag-handle";
    handle.tabIndex = -1;
    handle.textContent = "\u22ee\u22ee";
    handle.setAttribute("aria-label", t("ui.moveBlock"));
    handle.title = t("ui.moveBlock");
    bindDrag(handle, node);
    node.appendChild(handle);
    node.addEventListener("pointerdown", function (event) {
        if (event.target.closest(".drag-handle") || event.target.closest(".line-x")) return;
        select(item.id);
    });

    const fields = item.fields;
    if (item.type === "spacer") {
        node.classList.add("is-spacer");
        node.setAttribute("aria-hidden", "true");
    } else if (item.type === "photo") {
        const frame = document.createElement("button");
        frame.type = "button";
        frame.className = "photo-frame";
        frame.style.aspectRatio = fields.aspect || "3 / 4";
        frame.style.width = photoWidth(item) + "%";
        frame.title = fields.src ? t("photo.edit") : t("photo.pick");
        if (fields.src) {
            const img = document.createElement("img");
            img.alt = "";
            img.src = fields.src;
            const badge = document.createElement("span");
            badge.className = "photo-edit";
            badge.textContent = t("photo.edit");
            frame.append(img, badge);
        } else {
            frame.classList.add("is-empty");
            const mark = document.createElement("span");
            mark.className = "photo-mark";
            mark.textContent = "+";
            const label = document.createElement("span");
            label.className = "photo-label";
            label.textContent = t("photo.pick");
            frame.append(mark, label);
        }
        frame.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (fields.src || fields.original) openPhotoCrop(item.id);
            else pickPhoto(item.id);
        });
        node.appendChild(frame);
        if (fields.caption) {
            node.appendChild(editable("photo-caption", fields.caption, function (html) {
                fields.caption = html;
                save();
            }, t("ph.text")));
        }
    } else if (item.type === "heading") {
        if (headingStyle(item) === "label") node.classList.add("is-label");
        node.appendChild(editable("", fields.key ? escapeHtml(t(fields.key)) : (fields.html || ""), function (html) {
            fields.key = "";
            fields.style = headingStyle(item);
            fields.html = html;
            save();
        }, t("ph.heading")));
    } else if (item.type === "contact") {
        const label = document.createElement("div");
        label.className = "contact-label";
        if (fields.labelKey && fields.labelKey !== "custom") {
            label.textContent = t("doc." + fields.labelKey);
        } else {
            label.appendChild(editable("", fields.label || "", function (html) {
                fields.label = html;
                fields.labelKey = "custom";
                save();
            }, t("ph.label")));
        }
        const contactPrompt = fields.labelKey && fields.labelKey !== "custom" ? t("doc." + fields.labelKey) : t("ph.text");
        node.append(
            label,
            editable("", fields.html || "", function (html) { fields.html = html; save(); }, contactPrompt)
        );
    } else if (item.type === "competence" || item.type === "project") {
        node.append(
            editable("title", fields.title || "", function (html) { fields.title = html; save(); }, t("ph.title")),
            editable("body", fields.body || "", function (html) { fields.body = html; save(); }, t("ph.text"))
        );
    } else if (item.type === "timeline") {
        const top = document.createElement("div");
        top.className = "timeline-top";
        top.append(
            editable("title", fields.title || "", function (html) { fields.title = html; save(); }, t("ph.title")),
            editable("date", fields.date || "", function (html) { fields.date = html; save(); }, t("ph.date"))
        );
        node.append(
            top,
            editable("org", fields.org || "", function (html) { fields.org = html; save(); }, t("ph.org")),
            lineList(item, "items", true)
        );
    } else if (item.type === "intro") {
        const label = document.createElement("div");
        label.className = "intro-label";
        label.dataset.i18n = "doc.intro";
        label.textContent = t("doc.intro");
        node.append(label, editable("", fields.html || "", function (html) { fields.html = html; save(); }, t("ph.text")));
    } else if (item.type === "list") {
        node.appendChild(lineList(item, "items", true));
    } else if (item.type === "letterhead") {
        const top = document.createElement("div");
        top.className = "letterhead-top";
        top.append(
            editable("doc-title", fields.title || "", function (html) {
                fields.title = html;
                save();
            }, doc && doc.kind === "letter" ? t("doc.letter") : t("ph.heading")),
            editable("date", fields.date || "", function (html) { fields.date = html; save(); }, t("ph.date"))
        );
        node.append(
            top,
            editable("to", fields.to || "", function (html) { fields.to = html; save(); }, t("ph.to")),
            editable("subject", fields.subject || "", function (html) { fields.subject = html; save(); }, t("ph.subject"))
        );
    } else if (item.type === "closing") {
        node.appendChild(lineList(item, "paragraphs", false));
    } else {
        const prompts = { name: t("ph.name"), role: t("ph.role"), skill: t("ph.text"), paragraph: t("ph.text"), signature: t("ph.name") };
        node.appendChild(editable("", fields.html || "", function (html) {
            fields.html = html;
            save();
            if (item.type === "name") syncFilenameFromPerson();
        }, prompts[item.type] || t("ph.text")));
    }
    return node;
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Render the page, selection, zoom, and text formatting. */

function render() {
    const sidebar = document.getElementById("col-sidebar");
    const main = document.getElementById("col-main");
    sidebar.replaceChildren();
    main.replaceChildren();
    doc.sidebar.forEach(function (item) { sidebar.appendChild(renderBlock(item)); });
    doc.main.forEach(function (item) { main.appendChild(renderBlock(item)); });
    if (!doc.sidebar.length) sidebar.appendChild(columnHint());
    if (!doc.main.length) main.appendChild(columnHint());
    applyTheme();
    syncThemeInputs();
    syncTemplateState();
    if (selectedId && selectedBlock()) select(selectedId);
    else {
        selectedId = null;
        updateInspector();
    }
    fillBlockGrid();
    syncSpellLocale();
    requestAnimationFrame(updatePageGuides);
}

function columnHint() {
    const hint = document.createElement("p");
    hint.className = "column-hint";
    hint.textContent = t("ui.emptyColumn");
    return hint;
}

function blurField() {
    const active = document.activeElement;
    if (active && active !== document.body && active.isContentEditable && typeof active.blur === "function") active.blur();
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
}

function clearFocus() {
    blurField();
    selectedId = null;
    document.querySelectorAll(".block.is-selected").forEach(function (node) {
        node.classList.remove("is-selected");
    });
    updateInspector();
}

function select(id) {
    selectedId = id;
    document.querySelectorAll(".block.is-selected").forEach(function (node) {
        node.classList.remove("is-selected");
    });
    const node = document.querySelector('.block[data-id="' + id + '"]');
    if (node) {
        node.classList.add("is-selected");
        setAddTarget(node.parentElement && node.parentElement.id === "col-sidebar" ? "sidebar" : "main");
    }
    updateInspector();
}

function defaultTextColor(item) {
    return columnOf(item.id) === "sidebar" ? doc.theme.sidebarText : doc.theme.text;
}

function updateInspector() {
    const item = selectedBlock();
    const bar = document.getElementById("floatbar");
    const inStudio = document.body.dataset.phase === "studio";
    document.body.classList.toggle("has-selection", !!(item && inStudio));
    syncLibraryHint();
    if (!bar) return;
    if (!item || !inStudio) {
        bar.hidden = true;
        return;
    }
    bar.hidden = false;
    setColorInput("block-color", item.color || defaultTextColor(item));
    setColorInput("block-bg", item.background || "#ffffff");
    const sizeInput = document.getElementById("block-size");
    const sizeLabel = document.getElementById("block-size-value");
    if (sizeInput && sizeLabel) {
        if (item.type === "photo") {
            const width = photoWidth(item);
            sizeInput.min = "36";
            sizeInput.max = "100";
            sizeInput.step = "2";
            sizeInput.value = String(width);
            sizeInput.title = t("photo.size");
            sizeLabel.textContent = width + "%";
        } else if (item.type === "spacer") {
            const size = Number(item.fields.size) || 12;
            sizeInput.min = "8";
            sizeInput.max = "80";
            sizeInput.step = "1";
            sizeInput.value = String(size);
            sizeInput.title = t("ui.blockSize");
            sizeLabel.textContent = size + " px";
        } else {
            const size = item.fontSize || doc.theme.baseSize;
            sizeInput.min = "8";
            sizeInput.max = "28";
            sizeInput.step = "0.5";
            sizeInput.value = String(size);
            sizeInput.title = t("ui.blockSize");
            sizeLabel.textContent = size + " pt";
        }
    }
    const photoUrl = document.getElementById("photo-url");
    if (photoUrl) {
        const showUrl = item.type === "photo";
        photoUrl.hidden = !showUrl;
        if (showUrl && document.activeElement !== photoUrl) photoUrl.value = item.fields.url || "";
    }
    const lines = item.type === "list" || item.type === "timeline" || item.type === "closing";
    const addLine = document.getElementById("add-line");
    if (addLine) addLine.hidden = !lines;
    bar.title = t("ui.hint");
    syncLibraryHint();
    positionFloatbar();
}

function syncLibraryHint() {
    const note = document.getElementById("library-hint");
    if (!note) return;
    const item = selectedBlock();
    const lines = item && (item.type === "list" || item.type === "timeline" || item.type === "closing");
    const hint = narrowStudio() ? t("ui.dragHintTouch") : t("ui.dragHint");
    note.textContent = lines ? t("shell.addItem") + " " + t("ui.hint") : hint;
}

function positionFloatbar() {
    const bar = document.getElementById("floatbar");
    const node = selectedId && document.querySelector('.block[data-id="' + selectedId + '"]');
    if (!bar || bar.hidden || !node) return;
    const rect = node.getBoundingClientRect();
    const width = bar.offsetWidth || 280;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const chrome = document.getElementById("topbar");
    const limit = chrome ? chrome.getBoundingClientRect().bottom + 8 : 68;
    let top = rect.top - bar.offsetHeight - 10;
    if (top < limit) top = Math.min(rect.bottom + 10, window.innerHeight - bar.offsetHeight - 8);
    bar.style.left = left + "px";
    bar.style.top = top + "px";
}

function cancelDrag() {
    if (typeof activeDragCancel !== "function") return false;
    const cancel = activeDragCancel;
    activeDragCancel = null;
    cancel();
    return true;
}

function updatePageGuides() {
    const sheet = document.getElementById("sheet");
    const guides = document.getElementById("guides");
    const status = document.getElementById("page-status");
    if (!sheet || !guides) return;
    const width = sheet.offsetWidth;
    if (!width) return;
    const pagePx = width * (297 / 210);
    const pages = Math.max(1, Math.ceil((sheet.scrollHeight - 1) / pagePx));
    guides.replaceChildren();
    for (let index = 1; index < pages; index++) {
        const line = document.createElement("div");
        line.className = "page-break";
        line.style.top = (index * pagePx) + "px";
        const tag = document.createElement("span");
        tag.className = "page-break-label";
        tag.textContent = t("ui.pageBreak").replace("{n}", String(index + 1));
        line.appendChild(tag);
        guides.appendChild(line);
    }
    const label = pages === 1 ? t("ui.pageOne") : t("ui.pageMany").replace("{n}", String(pages));
    if (status) status.textContent = label;
    const chip = document.getElementById("page-chip");
    if (chip) {
        chip.textContent = label;
        chip.classList.toggle("is-warn", !!(doc && doc.kind === "letter" && pages > 1));
    }
    applyStageScale(stageScale);
}

function pageCount() {
    const sheet = document.getElementById("sheet");
    if (!sheet || !sheet.offsetWidth) return 1;
    const pagePx = sheet.offsetWidth * (297 / 210);
    return Math.max(1, Math.ceil((sheet.scrollHeight - 1) / pagePx));
}

function previewFitScale() {
    const preview = document.getElementById("preview");
    const sheet = document.getElementById("sheet");
    if (!preview || !sheet || !sheet.offsetWidth) return 1;
    const styles = getComputedStyle(preview);
    const pad = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
    const available = preview.clientWidth - pad - 8;
    if (!available) return 1;
    return Math.max(0.4, Math.min(1, available / sheet.offsetWidth));
}

function setZoom(scale, touched) {
    zoomTouched = !!touched;
    const next = Math.max(0.4, Math.min(1.3, scale || 1));
    const zoom = document.getElementById("zoom");
    const pct = Math.round(next * 100);
    if (zoom) zoom.value = String(pct);
    const label = document.getElementById("zoom-value");
    if (label) label.textContent = pct + "%";
    applyStageScale(next);
}

function fitStage(retry) {
    if (document.body.dataset.phase !== "studio") return;
    const sheet = document.getElementById("sheet");
    if (!sheet || !sheet.offsetWidth) {
        if (!retry) requestAnimationFrame(function () { fitStage(true); });
        return;
    }
    setZoom(previewFitScale(), false);
    updatePageGuides();
}

function applyStageScale(scale) {
    stageScale = scale || 1;
    const stage = document.getElementById("stage");
    const inner = document.getElementById("stage-scale");
    const sheet = document.getElementById("sheet");
    if (!stage || !inner || !sheet) return;
    inner.style.transform = stageScale === 1 ? "" : "scale(" + stageScale + ")";
    const width = sheet.offsetWidth;
    const height = sheet.offsetHeight;
    if (!width || !height) return;
    stage.style.width = Math.ceil(width * stageScale) + "px";
    stage.style.height = Math.ceil(height * stageScale) + "px";
}

function useTemplate(kind) {
    snapshot();
    currentSaveId = "";
    doc = kind === "letter" ? emptyLetter() : emptyCv();
    selectedId = null;
    filenameCustom = false;
    applyLanguage();
    render();
    syncFilenameFromPerson();
    save();
}

function addBlock(type) {
    snapshot();
    const item = createBlock(type);
    doc[addTarget].push(item);
    selectedId = item.id;
    render();
    save();
    const node = document.querySelector('.block[data-id="' + item.id + '"]');
    const field = node && node.querySelector(".editable");
    if (field) focusEditable(field);
    else if (node) node.scrollIntoView({ block: "nearest" });
}

function moveBlock(delta) {
    const item = selectedBlock();
    if (!item) return;
    const column = columnOf(item.id);
    const index = doc[column].findIndex(function (entry) { return entry.id === item.id; });
    const next = index + delta;
    if (index < 0 || next < 0 || next >= doc[column].length) return;
    snapshot();
    const moved = doc[column].splice(index, 1)[0];
    doc[column].splice(next, 0, moved);
    render();
    save();
    const node = document.querySelector('.block[data-id="' + item.id + '"]');
    if (!node) return;
    node.tabIndex = -1;
    node.focus();
    node.scrollIntoView({ block: "nearest" });
}

function duplicateBlock() {
    const item = selectedBlock();
    if (!item) return;
    snapshot();
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = uid();
    const column = columnOf(item.id);
    const index = doc[column].findIndex(function (entry) { return entry.id === item.id; });
    doc[column].splice(index + 1, 0, copy);
    selectedId = copy.id;
    render();
    save();
}

function deleteBlock() {
    const item = selectedBlock();
    if (!item) return;
    const column = columnOf(item.id);
    const index = doc[column].findIndex(function (entry) { return entry.id === item.id; });
    snapshot();
    doc[column] = doc[column].filter(function (entry) { return entry.id !== item.id; });
    const next = doc[column][Math.min(index, doc[column].length - 1)] || null;
    selectedId = next ? next.id : null;
    render();
    save();
    if (!next) return;
    const node = document.querySelector('.block[data-id="' + next.id + '"]');
    if (!node) return;
    node.tabIndex = -1;
    node.focus();
}

function addLine() {
    const item = selectedBlock();
    if (!item) return;
    snapshot();
    if (item.type === "closing") item.fields.paragraphs.push("");
    else item.fields.items.push("");
    render();
    save();
}

function stripSpans(fields) {
    Object.keys(fields).forEach(function (key) {
        if (typeof fields[key] === "string") {
            fields[key] = fields[key].replace(/<\/?span[^>]*>/gi, "");
        } else if (Array.isArray(fields[key])) {
            fields[key] = fields[key].map(function (entry) {
                return String(entry).replace(/<\/?span[^>]*>/gi, "");
            });
        }
    });
}

function resetStyle() {
    const item = selectedBlock();
    if (!item) return;
    snapshot();
    item.color = "";
    item.background = "";
    item.fontSize = 0;
    stripSpans(item.fields);
    render();
    save();
}

function applyTextStyle(style) {
    const selection = window.getSelection();
    if (!activeField || !selection || !selection.rangeCount || selection.isCollapsed) return false;
    if (!activeField.contains(selection.anchorNode)) return false;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    if (style.color) span.style.color = style.color;
    if (style.fontSize) span.style.fontSize = style.fontSize;
    try {
        range.surroundContents(span);
    } catch (error) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
    }
    selection.removeAllRanges();
    activeField.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
}

function format(command) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, null);
    if (activeField) activeField.dispatchEvent(new Event("input", { bubbles: true }));
}

function syncTemplateState() {
    document.querySelectorAll("[data-template]").forEach(function (button) {
        button.classList.toggle("is-current", button.dataset.template === doc.kind);
    });
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Use your own AI: copy a template, paste an answer, and refill when the mode changes. */

function showToast(message, tone, actions) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.replaceChildren();
    if (!message) {
        toast.hidden = true;
        return;
    }
    toast.hidden = false;
    toast.className = "toast" + (tone === "error" ? " is-error" : tone === "warn" ? " is-warn" : "");
    toast.setAttribute("role", tone === "error" || tone === "warn" ? "alert" : "status");
    const text = document.createElement("p");
    text.textContent = message;
    toast.appendChild(text);
    (actions || []).forEach(function (action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = action.primary ? "btn-primary" : "btn";
        button.textContent = action.label;
        button.addEventListener("click", action.run);
        toast.appendChild(button);
    });
    if (tone !== "error" && tone !== "warn") {
        toastTimer = window.setTimeout(function () { toast.hidden = true; }, 4200);
    }
}

function showStatus(message) {
    const box = document.getElementById("status");
    if (box) {
        box.hidden = !message;
        box.textContent = message || "";
    }
    if (message) showToast(message, "ok");
}

function markCatalog() {
    return [
        { types: ["name"], key: "name", shape: "NAME: Voornaam<br>Achternaam" },
        { types: ["role"], key: "role", shape: "ROLE: " },
        { types: ["contact"], key: "contact", shape: "@@@CONTACT\nCITY: \nPHONE: \nEMAIL: \nBORN: \nLABEL: \nVALUE: " },
        { types: ["skill"], key: "skill", shape: "@@@SKILLS\nPOINT: " },
        { types: ["competence"], key: "competence", shape: "@@@STRENGTHS\nPOINT: titel: tekst" },
        { types: ["project"], key: "project", shape: "@@@PROJECTS\nPOINT: titel: tekst" },
        { types: ["intro"], key: "intro", shape: "@@@PROFILE\nSUMMARY: " },
        { types: ["timeline"], key: "timeline", shape: "@@@JOB\nTITLE: \nDATE: \nORGANIZATION: \nPOINT: \n@@@STUDY" },
        { types: ["heading"], key: "heading", shape: "@@@HEADING\nTEXT: \nSTYLE: bar" },
        { types: ["paragraph"], key: "paragraph", shape: "@@@PARAGRAPH" },
        { types: ["list"], key: "list", shape: "@@@LIST\nPOINT: " },
        { types: ["letterhead"], key: "letterhead", shape: "@@@LETTERHEAD\nTITLE: \nDATE: \nTO: \nSUBJECT: " },
        { types: ["closing"], key: "closing", shape: "@@@CLOSING\nSIGN: " },
        { types: ["signature"], key: "signature", shape: "SIGN: " },
        { types: ["spacer"], key: "spacer", shape: "@@@SPACER\nSIZE: 12" },
        { types: ["photo"], key: "photo", shape: "@@@PHOTO\nCAPTION: \nASPECT: 3 / 4\nWIDTH: 92\nFILLED: yes\nURL: " }
    ];
}

function uncoveredBlocks() {
    const known = {};
    markCatalog().forEach(function (entry) {
        entry.types.forEach(function (type) { known[type] = true; });
    });
    return ALL_BLOCKS.filter(function (type) { return !known[type]; });
}

function fieldSketch(type) {
    try {
        return Object.keys(createBlock(type).fields).filter(function (key) {
            return key !== "src" && key !== "original";
        }).join(", ");
    } catch (error) {
        return type;
    }
}

function themeBlock(theme) {
    const source = theme || (setupState.kind === "letter" ? letterTheme() : cvTheme());
    return [
        "@@@THEME",
        "SIDEBAR: " + source.sidebar,
        "SIDEBARTEXT: " + source.sidebarText,
        "ACCENT: " + source.accent,
        "ACCENTLIGHT: " + source.accentLight,
        "PAGE: " + source.page,
        "TEXT: " + source.text,
        "SIZE: " + source.baseSize,
        "COLUMN: " + source.sidebarWidth,
        "FONT: " + (source.font || "roboto")
    ].join("\n");
}

function modelInstructions(mode, kind) {
    const lines = [t("mark.preamble")
        .replace("{lang}", lang === "en" ? "English" : "Nederlands")
        .replace("{kind}", (kind || setupState.kind) === "letter" ? t("setup.letter") : t("setup.cv"))];
    markCatalog().forEach(function (entry) {
        const say = t("mark." + entry.key);
        if (say && say !== "mark." + entry.key) lines.push("", say);
    });
    uncoveredBlocks().forEach(function (type) {
        const fields = fieldSketch(type);
        lines.push("", t("mark.fallback").replace("{type}", t("type." + type)).replace("{fields}", fields));
    });
    if (mode === "advanced") lines.push("", t("mark.advanced"));
    lines.push("", t("mark.keep"));
    return lines.join("\n");
}

function blankMarked() {
    const letter = setupState.kind === "letter";
    const lines = [letter ? "@@@LETTER" : "@@@CV", "NAME: ", "ROLE: "];
    if (letter) lines.push("TITLE: ", "DATE: ", "TO: ", "SUBJECT: ", "SUMMARY: ");
    lines.push(
        "@@@PHOTO", "CAPTION: ", "ASPECT: 3 / 4", "WIDTH: " + (letter ? "64" : "92"), "FILLED: yes", "URL: ",
        "@@@CONTACT", "CITY: ", "PHONE: ", "EMAIL: ", "BORN: ",
        "@@@SKILLS", "POINT: ",
        "@@@STRENGTHS", "POINT: ",
        "@@@PROJECTS", "POINT: "
    );
    if (!letter) lines.push("@@@PROFILE", "");
    lines.push(
        "@@@JOB", "TITLE: ", "DATE: ", "ORGANIZATION: ", "POINT: ",
        "@@@STUDY", "TITLE: ", "DATE: ", "ORGANIZATION: ", "POINT: ",
        "@@@HEADING", "TEXT: ", "STYLE: bar",
        "@@@PARAGRAPH", "",
        "@@@LIST", "POINT: "
    );
    if (!letter) lines.push("@@@LETTERHEAD", "TITLE: ", "DATE: ", "TO: ", "SUBJECT: ");
    lines.push("@@@CLOSING", "", "SIGN: ", "@@@SPACER", "SIZE: 12", "@@@END");
    return lines.join("\n");
}

function modelBundle(mode) {
    let body = blankMarked();
    if (mode === "advanced") body = body.replace("@@@END", themeBlock() + "\n@@@END");
    if (mode === "plain") return body;
    return modelInstructions(mode) + "\n\n" + body;
}

function filledBundle(mode) {
    let body = exportMarked();
    if (mode === "advanced" && doc && doc.theme) body = body.replace("@@@END", themeBlock(doc.theme) + "\n@@@END");
    if (mode === "plain") return body;
    return modelInstructions(mode, doc && doc.kind) + "\n\n" + body;
}

async function copyModelText(mode, filled) {
    const text = filled ? filledBundle(mode) : modelBundle(mode);
    const box = document.getElementById(filled ? "llm-input" : "setup-model-text");
    if (box) {
        box.value = text;
        box.scrollTop = 0;
    }
    try {
        await navigator.clipboard.writeText(text);
        if (filled) showStatus(t("ui.copied"));
        else setupMessage(t("ui.copied"), false);
    } catch (error) {
        if (box) {
            box.focus();
            box.select();
        }
        if (filled) showError(t("ui.copyFailed"));
        else setupMessage(t("ui.copyFailed"), true);
    }
}

function refreshAiBox(force) {
    const box = document.getElementById("llm-input");
    const pick = document.getElementById("model-mode");
    if (!box || !doc) return;
    if (!force && box.value && box.value !== aiBoxSource) return;
    const text = filledBundle(pick ? pick.value : "guide");
    aiBoxSource = text;
    box.value = text;
    box.scrollTop = 0;
}

async function copyForModel() {
    const pick = document.getElementById("model-mode");
    copyModelText(pick ? pick.value : "guide", true);
    aiBoxSource = document.getElementById("llm-input") ? document.getElementById("llm-input").value : aiBoxSource;
}

function applyModelText() {
    const input = document.getElementById("llm-input");
    try {
        applyMarked(input ? input.value : "");
        showStatus(t("ui.applied"));
    } catch (error) {
        showError(error && error.message ? error.message : t("ui.parseError"));
    }
}

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Choose a photo, frame it, and set how large it is on the page. */

let cropper = null;
let photoTargetId = null;
let cropRatio = 0.75;
let cropHome = null;

function findBlock(id) {
    if (!doc) return null;
    return doc.sidebar.concat(doc.main).find(function (item) { return item.id === id; }) || null;
}

function pickPhoto(id) {
    photoTargetId = id;
    const input = document.getElementById("photo-file");
    if (!input) return;
    input.value = "";
    input.click();
}

function loadImage(url) {
    return new Promise(function (resolve, reject) {
        const image = new Image();
        image.onload = function () { resolve(image); };
        image.onerror = reject;
        image.src = url;
    });
}

function downscaleImage(image, max) {
    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
}

function aspectNumber(value) {
    if (value === "1 / 1") return 1;
    if (value === "4 / 3") return 4 / 3;
    return 3 / 4;
}

function aspectName(value) {
    if (Math.abs(value - 1) < 0.05) return "1 / 1";
    if (value > 1) return "4 / 3";
    return "3 / 4";
}

function markCropAspect(value) {
    cropRatio = value;
    document.querySelectorAll("#crop-dialog [data-aspect]").forEach(function (button) {
        button.classList.toggle("is-selected", Math.abs(Number(button.dataset.aspect) - value) < 0.05);
    });
    if (cropper) cropper.setAspectRatio(value);
}

function closePhotoCrop() {
    const dialog = document.getElementById("crop-dialog");
    if (!dialog || dialog.hidden) return false;
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    dialog.hidden = true;
    const back = photoReturnFocus;
    photoReturnFocus = null;
    if (back && typeof back.focus === "function") back.focus();
    return true;
}

function cropScale() {
    if (!cropper) return 1;
    const image = cropper.getImageData();
    if (!image.naturalWidth) return 1;
    return image.width / image.naturalWidth;
}

function syncCropZoom() {
    const input = document.getElementById("crop-zoom");
    const label = document.getElementById("crop-zoom-value");
    if (!input) return;
    const percent = Math.max(10, Math.min(300, Math.round(cropScale() * 100)));
    input.value = String(percent);
    if (label) label.textContent = percent + "%";
}

function placeCrop(scale) {
    if (!cropper) return;
    const box = cropper.getCropBoxData();
    cropper.zoomTo(scale);
    const canvas = cropper.getCanvasData();
    cropper.setCanvasData({
        left: box.left + (box.width - canvas.width) / 2,
        top: box.top + (box.height - canvas.height) / 2
    });
    syncCropZoom();
}

function fitCrop() {
    if (!cropper) return;
    const box = cropper.getCropBoxData();
    const image = cropper.getImageData();
    placeCrop(Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight));
}

function fillCrop() {
    if (!cropper) return;
    const box = cropper.getCropBoxData();
    const image = cropper.getImageData();
    placeCrop(Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight));
}

function resetCrop() {
    if (!cropper || !cropHome) return;
    cropper.setAspectRatio(cropHome.ratio);
    markCropAspect(cropHome.ratio);
    cropper.setCanvasData(cropHome.canvas);
    cropper.setCropBoxData(cropHome.crop);
    syncCropZoom();
}


function loadAsset(src, kind) {
    if (assetLoads[src]) return assetLoads[src];
    assetLoads[src] = new Promise(function (resolve, reject) {
        if (kind === "css") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = src;
            link.onload = function () { resolve(); };
            link.onerror = function () { assetLoads[src] = null; reject(new Error(src)); };
            document.head.appendChild(link);
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = function () { resolve(); };
        script.onerror = function () { assetLoads[src] = null; reject(new Error(src)); };
        document.head.appendChild(script);
    });
    return assetLoads[src];
}

function ensurePdfLibs() {
    if (window.dompdf && window.PDFLib && typeof FONT_DATA !== "undefined") return Promise.resolve();
    if (!pdfLibsPromise) {
        pdfLibsPromise = Promise.all([
            loadAsset("vendor/dompdf.min.js", "js"),
            loadAsset("vendor/pdf-lib.min.js", "js"),
            loadAsset("vendor/fonts.js", "js")
        ]).catch(function (error) {
            pdfLibsPromise = null;
            throw error;
        });
    }
    return pdfLibsPromise;
}

function ensureCropper() {
    if (!document.querySelector('link[data-cropper]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "vendor/cropper.min.css";
        link.setAttribute("data-cropper", "1");
        document.head.appendChild(link);
    }
    if (typeof Cropper !== "undefined") return Promise.resolve();
    if (!cropperPromise) {
        cropperPromise = loadAsset("vendor/cropper.min.js", "js").catch(function (error) {
            cropperPromise = null;
            throw error;
        });
    }
    return cropperPromise;
}

function openPhotoCrop(id) {
    ensureCropper().then(function () {
        openPhotoCropNow(id);
    }).catch(function () {
        showError(t("photo.fail"));
    });
}

function openPhotoCropNow(id) {
    const item = findBlock(id);
    if (!item) return;
    const src = item.fields.original || item.fields.src;
    if (!src) {
        pickPhoto(id);
        return;
    }
    photoTargetId = id;
    const dialog = document.getElementById("crop-dialog");
    const img = document.getElementById("crop-image");
    if (!dialog || !img || typeof Cropper === "undefined") {
        showError(t("photo.fail"));
        return;
    }
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    photoReturnFocus = document.activeElement;
    dialog.hidden = false;
    paintPhotoWidth(item);
    markCropAspect(aspectNumber(item.fields.aspect));
    const cancel = document.getElementById("crop-cancel");
    if (cancel) cancel.focus();
    img.onload = function () {
        img.onload = null;
        cropHome = null;
        cropper = new Cropper(img, {
            aspectRatio: cropRatio,
            viewMode: 0,
            dragMode: "move",
            autoCropArea: 1,
            background: false,
            responsive: true,
            toggleDragModeOnDblclick: false,
            ready: function () {
                cropHome = {
                    ratio: cropRatio,
                    canvas: cropper.getCanvasData(),
                    crop: cropper.getCropBoxData()
                };
                syncCropZoom();
            },
            zoom: function () {
                syncCropZoom();
            }
        });
    };
    img.src = src;
    if (img.complete && img.naturalWidth) img.onload();
}

function applyPhotoCrop() {
    const item = findBlock(photoTargetId);
    if (!item || !cropper) return;
    const canvas = cropper.getCroppedCanvas({ maxWidth: 900, maxHeight: 1200, fillColor: "#fff", imageSmoothingQuality: "high" });
    if (!canvas) return;
    snapshot();
    item.fields.src = canvas.toDataURL("image/jpeg", 0.86);
    item.fields.aspect = aspectName(cropRatio);
    closePhotoCrop();
    render();
    save();
    select(item.id);
}

function readPhotoFile(file) {
    const reader = new FileReader();
    reader.onload = function () {
        loadImage(String(reader.result || "")).then(function (image) {
            const item = findBlock(photoTargetId);
            if (!item) return;
            snapshot();
            item.fields.original = downscaleImage(image, 1600);
            item.fields.url = "";
            render();
            save();
            openPhotoCrop(item.id);
        }).catch(function () { showError(t("photo.fail")); });
    };
    reader.onerror = function () { showError(t("photo.fail")); };
    reader.readAsDataURL(file);
}

function rememberPhotoAddress(item, address) {
    item.fields.url = /^https:\/\//i.test(address) ? address : "";
}

function storePhotoImage(item, dataUrl, address) {
    return loadImage(dataUrl).then(function (image) {
        const stored = downscaleImage(image, 1600);
        snapshot();
        item.fields.original = stored;
        item.fields.src = stored;
        rememberPhotoAddress(item, address);
        render();
        save();
        return true;
    });
}

function importPhotoAddress(item, address) {
    const url = photoAddress(address);
    if (!item || item.type !== "photo" || !url) {
        if (address && String(address).trim()) showError(t("photo.fail"));
        return Promise.resolve(false);
    }
    if (/^data:image\//i.test(url)) {
        return storePhotoImage(item, url, "").catch(function () {
            showError(t("photo.fail"));
            return false;
        });
    }
    return fetch(url, { mode: "cors", credentials: "omit" }).then(function (response) {
        if (!response.ok) throw new Error("photo");
        return response.blob();
    }).then(function (blob) {
        if (blob.type && !/^image\//i.test(blob.type)) throw new Error("photo");
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () { resolve(String(reader.result || "")); };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }).then(function (dataUrl) {
        return storePhotoImage(item, dataUrl, url);
    }).catch(function () {
        showError(t("photo.fail"));
        return false;
    });
}

/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* File name, lazy PDF libraries, download, and import. */

function filePrefix() {
    return doc.kind === "letter" ? t("prefix.letter") : "CV";
}

function pdfFilename() {
    const safe = function (value) {
        return Array.from(String(value || "").replace(/\.pdf$/i, "")).filter(function (char) {
            return char.charCodeAt(0) >= 32 && "<>:\"/\\|?*".indexOf(char) === -1;
        }).join("")
            .trim()
            .replace(/\s+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
    };
    const parts = [safe(filePrefix())];
    const name = safe(document.getElementById("pdf-name").value);
    if (name) parts.push(name);
    if (document.getElementById("pdf-timestamp").checked) {
        const now = new Date();
        const pad = function (value) { return String(value).padStart(2, "0"); };
        parts.push(now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + "-" + pad(now.getHours()) + pad(now.getMinutes()));
    }
    if (document.getElementById("pdf-final").checked) parts.push("final");
    return parts.filter(Boolean).join("_") + ".pdf";
}

function updateFilenamePreview() {
    const preview = document.getElementById("pdf-preview");
    if (preview && document.getElementById("pdf-name")) preview.textContent = pdfFilename();
}

function downloadBlob(bytes, filename) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}

function showError(message) {
    const box = document.getElementById("error");
    if (box) {
        box.hidden = !message;
        box.textContent = message || "";
    }
    if (message) showToast(message, "error");
    else showToast("");
}

function decodeFont(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

function fontChoice() {
    const key = doc && doc.theme && doc.theme.font;
    if (key === "merriweather") return { key: "merriweather", family: "Merriweather" };
    if (key === "lora") return { key: "lora", family: "Lora" };
    return { key: "roboto", family: "Roboto" };
}

function getFontConfig() {
    const choice = fontChoice();
    if (!fontConfigPromise || fontConfigKey !== choice.family) {
        fontConfigKey = choice.family;
        const pack = typeof FONT_DATA !== "undefined" ? FONT_DATA[choice.key] : null;
        if (!pack) {
            fontConfigPromise = Promise.reject(new Error(t("ui.fontError")));
        } else {
            const regular = decodeFont(pack.regular);
            const bold = decodeFont(pack.bold);
            const italic = decodeFont(pack.italic);
            const boldItalic = decodeFont(pack.boldItalic);
            const faces = [
                [regular, 400, "normal"],
                [regular, 500, "normal"],
                [bold, 600, "normal"],
                [bold, 700, "normal"],
                [bold, 800, "normal"],
                [italic, 400, "italic"],
                [italic, 500, "italic"],
                [boldItalic, 600, "italic"],
                [boldItalic, 700, "italic"],
                [boldItalic, 800, "italic"]
            ];
            fontConfigPromise = Promise.resolve(faces.map(function (face) {
                return { fontFamily: choice.family, fontBytes: face[0], fontWeight: face[1], fontStyle: face[2] };
            }));
        }
    }
    return fontConfigPromise;
}

async function buildPdfBytes() {
    if (!window.dompdf || typeof dompdf.renderToBytes !== "function" || !window.PDFLib) {
        throw new Error(t("ui.libError"));
    }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    const previousScale = stageScale;
    applyStageScale(1);
    document.body.classList.add("pdf-exporting");
    const stamped = [];
    document.querySelectorAll("#sheet .skill, #sheet .intro, #sheet .heading").forEach(function (node) {
        stamped.push([node, node.getAttribute("style")]);
        const computed = getComputedStyle(node);
        if (node.classList.contains("skill") || node.classList.contains("intro")) {
            node.style.backgroundColor = computed.backgroundColor;
            node.style.borderLeftWidth = computed.borderLeftWidth;
            node.style.borderLeftStyle = "solid";
            node.style.borderLeftColor = computed.borderLeftColor;
        }
        if (node.classList.contains("heading") && !node.classList.contains("is-label")) {
            node.style.borderBottomWidth = "1px";
            node.style.borderBottomStyle = "solid";
            node.style.borderBottomColor = computed.borderBottomColor;
        }
    });
    const photoSources = [];
    document.querySelectorAll("#sheet .photo-frame img").forEach(function (img) {
        const src = img.getAttribute("src") || "";
        if (src.indexOf("data:image/svg") !== 0) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 240;
        canvas.height = img.naturalHeight || 320;
        try {
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            photoSources.push([img, src]);
            img.setAttribute("src", canvas.toDataURL("image/png"));
        } catch (error) { /* keep the drawing */ }
    });
    try {
        const family = fontChoice().family;
        await document.fonts.load("16px " + family);
        await document.fonts.load("700 16px " + family);
        await document.fonts.ready;
        await new Promise(function (resolve) {
            requestAnimationFrame(function () { requestAnimationFrame(resolve); });
        });
        const rendered = await dompdf.renderToBytes(document.getElementById("sheet"), {
            format: "a4",
            pagination: true,
            pageConfig: {
                header: { content: "", height: 0 },
                footer: { content: "", height: 0 }
            },
            backgroundColor: doc.theme.page || "#ffffff",
            marginPt: 0,
            compress: true,
            useCORS: true,
            fontConfig: await getFontConfig(),
            metadata: {
                title: pdfFilename().replace(/\.pdf$/i, ""),
                author: document.getElementById("pdf-name").value || "",
                creator: t("ui.toolName")
            }
        });
        const pdf = await PDFLib.PDFDocument.load(rendered);
        await pdf.attach(new TextEncoder().encode(JSON.stringify(doc)), "document.json", {
            mimeType: "application/json",
            description: "LibreCV document",
            creationDate: new Date(),
            modificationDate: new Date()
        });
        return await pdf.save();
    } finally {
        stamped.forEach(function (pair) {
            if (pair[1] === null) pair[0].removeAttribute("style");
            else pair[0].setAttribute("style", pair[1]);
        });
        photoSources.forEach(function (pair) { pair[0].setAttribute("src", pair[1]); });
        applyStageScale(previousScale);
        document.body.classList.remove("pdf-exporting");
    }
}

function plainFieldText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html || "";
    return (holder.textContent || "").replace(/\s+/g, " ").trim();
}

function downloadWarnings() {
    const known = {};
    ["name", "role", "text", "heading", "label", "title", "date", "org", "to", "subject"].forEach(function (key) {
        known[t("ph." + key)] = true;
    });
    let placeholders = 0;
    doc.sidebar.concat(doc.main).forEach(function (item) {
        Object.keys(item.fields || {}).forEach(function (key) {
            const value = item.fields[key];
            const list = Array.isArray(value) ? value : [value];
            list.forEach(function (entry) {
                if (typeof entry === "string" && known[plainFieldText(entry)]) placeholders += 1;
            });
        });
    });
    const notes = [];
    if (!plainName()) notes.push(t("ui.nameWarn"));
    if (placeholders) notes.push(t("ui.placeholderWarn"));
    const pages = pageCount();
    if (doc.kind === "letter" && pages > 1) notes.push(t("ui.letterPages").replace("{n}", String(pages)));
    if (contrastNotes(doc.theme).length) notes.push(t("ui.contrastWarn"));
    return notes;
}

async function downloadPdf(force) {
    if (force !== true) {
        const notes = downloadWarnings();
        if (notes.length) {
            showToast(notes.join(" "), "warn", [
                { label: t("ui.downloadAnyway"), primary: true, run: function () { showToast(""); downloadPdf(true); } },
                { label: t("ui.cancel"), run: function () { showToast(""); } }
            ]);
            return;
        }
    }
    const button = document.getElementById("download");
    button.disabled = true;
    button.textContent = t("ui.working");
    showError("");
    try {
        await ensurePdfLibs();
        const filename = pdfFilename();
        downloadBlob(await buildPdfBytes(), filename);
        showStatus(t("ui.downloaded").replace("{name}", filename));
    } catch (error) {
        console.error(error);
        showError(t("ui.pdfError") + " " + (error && error.message ? error.message : ""));
    } finally {
        button.disabled = false;
        button.textContent = t("ui.download");
    }
}

async function readAttachment(bytes) {
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const names = pdf.catalog.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFDict);
    if (!names) throw new Error("missing");
    const embedded = names.lookup(PDFLib.PDFName.of("EmbeddedFiles"), PDFLib.PDFDict);
    if (!embedded) throw new Error("missing");
    const list = embedded.lookup(PDFLib.PDFName.of("Names"), PDFLib.PDFArray);
    if (!list) throw new Error("missing");
    let fallback = "";
    for (let i = 0; i < list.size(); i += 2) {
        const nameObj = list.lookup(i);
        const name = nameObj && typeof nameObj.decodeText === "function" ? nameObj.decodeText() : "";
        const spec = list.lookup(i + 1, PDFLib.PDFDict);
        const ef = spec.lookup(PDFLib.PDFName.of("EF"), PDFLib.PDFDict);
        const stream = ef.lookup(PDFLib.PDFName.of("F"));
        const text = new TextDecoder().decode(PDFLib.decodePDFRawStream(stream).decode());
        if (name === "document.json") return text;
        if (!fallback && text.indexOf('"version"') !== -1) fallback = text;
    }
    if (fallback) return fallback;
    throw new Error("missing");
}

async function importPdfBytes(bytes) {
    try {
        await ensurePdfLibs();
    } catch (error) {
        showError(t("ui.libError"));
        return;
    }
    let text = "";
    try {
        text = await readAttachment(bytes);
    } catch (error) {
        showError(t("ui.importFail"));
        return;
    }
    let data = null;
    try {
        data = JSON.parse(text);
    } catch (error) {
        showError(t("ui.importBad"));
        return;
    }
    if (!data || data.version !== 1 || !Array.isArray(data.sidebar) || !Array.isArray(data.main)) {
        showError(t("ui.importBad"));
        return;
    }
    snapshot();
    currentSaveId = "";
    doc = data;
    normalize(doc);
    lang = doc.lang;
    try { localStorage.setItem(STORAGE_LANG, lang); } catch (error) { /* ignore */ }
    selectedId = null;
    filenameCustom = false;
    showError("");
    applyLanguage();
    render();
    syncFilenameFromPerson();
    setupReturn = false;
    documentLive = true;
    setPhase("studio");
    save();
    showStatus(t("ui.imported"));
    syncRoute("push");
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Page colours, contrast, and the palette preview. */

function mixHex(base, tint, amount) {
    const read = function (hex) {
        const h = String(hex || "").replace("#", "");
        if (!/^[0-9a-fA-F]{6}$/.test(h)) return [255, 255, 255];
        return [0, 2, 4].map(function (index) { return parseInt(h.slice(index, index + 2), 16); });
    };
    const from = read(base);
    const to = read(tint);
    return "#" + from.map(function (channel, index) {
        const mixed = Math.round(channel + (to[index] - channel) * amount).toString(16);
        return mixed.length === 1 ? "0" + mixed : mixed;
    }).join("");
}

function applyTheme() {
    const sheet = document.getElementById("sheet");
    const theme = doc.theme;
    [sheet, document.getElementById("library")].forEach(function (node) {
        if (!node) return;
        node.style.setProperty("--sidebar", theme.sidebar);
        node.style.setProperty("--sidebar-text", theme.sidebarText);
        node.style.setProperty("--accent", theme.accent);
        node.style.setProperty("--accent-light", theme.accentLight || theme.accent);
        node.style.setProperty("--page", theme.page);
        node.style.setProperty("--text", theme.text);
        node.style.setProperty("--skill-fill", mixHex(theme.sidebar, "#ffffff", 0.1));
        node.style.setProperty("--skill-fill-main", mixHex(theme.page, theme.accent, 0.1));
        node.style.setProperty("--intro-fill", mixHex(theme.page, theme.accent, 0.12));
        node.style.setProperty("--rule", mixHex(theme.page, "#64748b", 0.45));
        node.style.setProperty("--rule-side", mixHex(theme.sidebar, "#ffffff", 0.28));
    });
    sheet.dataset.kind = doc.kind === "letter" ? "letter" : "cv";
    sheet.style.setProperty("--base-size", theme.baseSize + "pt");
    sheet.style.setProperty("--sidebar-width", theme.sidebarWidth + "%");
    sheet.style.fontFamily = fontChoice().family + ', "Segoe UI", sans-serif';
    const library = document.getElementById("library");
    if (library) library.style.fontFamily = sheet.style.fontFamily;
}

function setColorInput(id, value) {
    const input = document.getElementById(id);
    if (input && /^#[0-9a-fA-F]{6}$/.test(value || "")) input.value = value;
}

function syncThemeInputs() {
    const theme = doc.theme;
    setColorInput("theme-sidebar", theme.sidebar);
    setColorInput("theme-sidebar-text", theme.sidebarText);
    setColorInput("theme-accent", theme.accent);
    setColorInput("theme-page", theme.page);
    setColorInput("theme-text", theme.text);
    const size = document.getElementById("theme-size");
    const width = document.getElementById("theme-width");
    if (size) size.value = theme.baseSize;
    if (width) width.value = theme.sidebarWidth;
    const sizeValue = document.getElementById("theme-size-value");
    const widthValue = document.getElementById("theme-width-value");
    if (sizeValue) sizeValue.textContent = theme.baseSize + " pt";
    if (widthValue) widthValue.textContent = theme.sidebarWidth + "%";
    const font = document.getElementById("theme-font");
    if (font) font.value = theme.font || "roboto";
    paintContrastWarning();
}

function hexChannels(hex) {
    const raw = String(hex || "").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map(function (part) { return part + part; }).join("") : raw;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
    return [0, 2, 4].map(function (index) { return parseInt(full.slice(index, index + 2), 16); });
}

function contrastRatio(a, b) {
    function lum(hex) {
        const channels = hexChannels(hex);
        if (!channels) return 0;
        const linear = channels.map(function (channel) {
            const value = channel / 255;
            return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }
    const left = lum(a);
    const right = lum(b);
    const lighter = Math.max(left, right);
    const darker = Math.min(left, right);
    return (lighter + 0.05) / (darker + 0.05);
}

function contrastNotes(colors) {
    if (!colors) return [];
    const notes = [];
    if (contrastRatio(colors.sidebar, colors.sidebarText) < 4.5) notes.push("sidebar");
    if (contrastRatio(colors.page, colors.text) < 4.5) notes.push("page");
    return notes;
}

function paintContrastWarning() {
    const setupNote = document.getElementById("setup-contrast");
    if (setupNote) {
        let bad = [];
        try { bad = contrastNotes(activePalette()); } catch (error) { bad = []; }
        setupNote.hidden = !bad.length;
        setupNote.textContent = bad.length ? t("ui.contrastWarn") : "";
    }
    const themeNote = document.getElementById("theme-contrast");
    if (themeNote && doc && doc.theme) {
        const bad = contrastNotes(doc.theme);
        themeNote.hidden = !bad.length;
        themeNote.textContent = bad.length ? t("ui.contrastWarn") : "";
    }
}

function readableOn(hex) {
    const raw = String(hex || "").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map(function (part) { return part + part; }).join("") : raw;
    const n = parseInt(full, 16);
    if (!isFinite(n)) return "#f8fafc";
    const y = ((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114;
    return y > 160000 ? "#18181b" : "#f8fafc";
}

function accentLightFor(accent, sidebar) {
    if (readableOn(sidebar) === "#18181b") return accent;
    const known = { "#0284c7": "#38bdf8", "#047857": "#6ee7b7" };
    const hit = known[String(accent || "").toLowerCase()];
    if (hit) return hit;
    const n = parseInt(String(accent || "").replace("#", ""), 16);
    if (!isFinite(n)) return accent;
    const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (channel) {
        const mixed = Math.round(channel + (255 - channel) * 0.45);
        const hex = Math.max(0, Math.min(255, mixed)).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    });
    return "#" + channels.join("");
}

function activePalette() {
    let colors;
    if (setupState.palette === "custom") {
        const sidebar = document.getElementById("setup-sidebar").value;
        colors = {
            sidebar: sidebar,
            sidebarText: readableOn(sidebar),
            accent: document.getElementById("setup-accent").value,
            page: document.getElementById("setup-page").value,
            text: document.getElementById("setup-text").value
        };
    } else if (PALETTES[setupState.palette]) {
        colors = Object.assign({}, PALETTES[setupState.palette]);
    } else {
        colors = Object.assign({}, setupState.kind === "letter" ? PALETTES.groen : PALETTES.zakelijk);
    }
    if (!colors.accentLight) colors.accentLight = accentLightFor(colors.accent, colors.sidebar);
    return colors;
}

function paintPalettePreview() {
    const node = document.getElementById("palette-preview");
    if (!node) return;
    const colors = activePalette();
    const side = node.querySelector(".pp-side");
    const main = node.querySelector(".pp-main");
    side.style.background = colors.sidebar;
    side.style.color = colors.sidebarText;
    main.style.background = colors.page;
    main.style.color = colors.text;
    node.style.setProperty("--pp-accent", colors.accent);
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The block picker and its small previews. */

function previewLine(className, text) {
    const node = document.createElement("div");
    if (className) node.className = className;
    node.textContent = text;
    return node;
}

function previewFor(type) {
    const frame = document.createElement("div");
    frame.className = "library-frame";
    frame.setAttribute("aria-hidden", "true");
    const sample = document.createElement("div");
    const sideTypes = { name: 1, photo: 1, role: 1, contact: 1, skill: 1, competence: 1, project: 1 };
    const onSide = type === "heading" || type === "spacer" ? addTarget === "sidebar" : !!sideTypes[type];
    sample.className = "library-sample " + (onSide ? "is-side" : "is-main");
    sample.dataset.kind = doc.kind === "letter" ? "letter" : "cv";
    const piece = document.createElement("div");
    piece.className = "block " + type;
    if (type === "spacer") piece.classList.add("is-spacer");
    if (type === "heading" && doc.kind === "letter" && !onSide) piece.classList.add("is-label");
    if (type === "photo") {
        const frame = document.createElement("div");
        frame.className = "photo-frame";
        piece.appendChild(frame);
    } else if (type === "name") {
        piece.append(document.createTextNode(t("preview.nameA")), document.createElement("br"), document.createTextNode(t("preview.nameB")));
    } else if (type === "role") {
        piece.textContent = t("preview.role");
    } else if (type === "contact") {
        piece.append(previewLine("contact-label", t("doc.city")), previewLine("", t("preview.contact")));
    } else if (type === "heading") {
        piece.textContent = t("ph.heading");
    } else if (type === "skill") {
        piece.textContent = t("preview.skill");
    } else if (type === "competence" || type === "project") {
        piece.append(previewLine("title", t("ph.title")), previewLine("body", t("preview.body")));
    } else if (type === "intro") {
        piece.append(previewLine("intro-label", t("doc.intro")), previewLine("", t("preview.body")));
    } else if (type === "timeline") {
        const top = document.createElement("div");
        top.className = "timeline-top";
        top.append(previewLine("title", t("ph.title")), previewLine("date", t("ph.date")));
        const list = document.createElement("ul");
        list.className = "bullets";
        const item = document.createElement("li");
        item.textContent = t("preview.item");
        list.appendChild(item);
        piece.append(top, previewLine("org", t("ph.org")), list);
    } else if (type === "paragraph") {
        piece.textContent = t("preview.paragraph");
    } else if (type === "list") {
        const list = document.createElement("ul");
        list.className = "bullets";
        [t("preview.item"), t("preview.item2")].forEach(function (text) {
            const item = document.createElement("li");
            item.textContent = text;
            list.appendChild(item);
        });
        piece.appendChild(list);
    } else if (type === "letterhead") {
        const top = document.createElement("div");
        top.className = "letterhead-top";
        top.append(previewLine("doc-title", t("doc.letter")), previewLine("date", t("preview.place")));
        piece.append(top, previewLine("to", t("ph.to")), previewLine("subject", t("ph.subject")));
    } else if (type === "closing") {
        const row = document.createElement("div");
        row.className = "closing";
        row.appendChild(previewLine("line", t("preview.greeting")));
        piece.appendChild(row);
    } else if (type === "signature") {
        piece.appendChild(previewLine("editable", t("preview.nameA") + " " + t("preview.nameB")));
    }
    sample.appendChild(piece);
    frame.appendChild(sample);
    return frame;
}

function fillBlockGrid() {
    const grid = document.getElementById("block-grid");
    if (!grid || !doc) return;
    grid.replaceChildren();
    const types = ALL_BLOCKS;
    types.forEach(function (type) {
        const button = keepSelection(h("button", { class: "library-card", type: "button" }));
        const grip = h("span", { class: "library-grip", "aria-hidden": "true", title: t("ui.placeBlock"), i18nTitle: "ui.placeBlock" });
        grip.textContent = "\u22ee\u22ee";
        button.append(previewFor(type), h("span", { class: "library-name", text: t("type." + type), i18n: "type." + type }), grip);
        bindLibraryCard(button, type);
        grid.appendChild(button);
    });
}

function setAddTarget(next) {
    const target = next === "sidebar" ? "sidebar" : "main";
    const changed = addTarget !== target;
    addTarget = target;
    const radio = document.querySelector('input[name="add-target"][value="' + addTarget + '"]');
    if (radio) radio.checked = true;
    if (changed) fillBlockGrid();
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Named copies of the open document, kept in this browser. */

const STORAGE_SAVES = "cv-tool-saves";
const SAVE_LIMIT = 24;

function readSaves() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_SAVES) || "[]");
        if (!Array.isArray(raw)) return [];
        return raw.filter(function (item) {
            return item && typeof item.id === "string" && item.doc && item.doc.version === 1 && Array.isArray(item.doc.sidebar) && Array.isArray(item.doc.main);
        });
    } catch (error) {
        return [];
    }
}

function writeSaves(list) {
    try {
        localStorage.setItem(STORAGE_SAVES, JSON.stringify(list));
    } catch (error) {
        showToast(t("ui.saveFail"), "error");
    }
    const count = String(list.length || "");
    document.querySelectorAll(".saves-count").forEach(function (node) {
        node.textContent = count;
    });
}

function saveTitle() {
    const input = document.getElementById("pdf-name");
    const named = input && input.value.trim();
    if (named) return named;
    const person = typeof plainName === "function" ? plainName().replace(/\s+/g, " ").trim() : "";
    if (person && person !== t("ph.name")) return person;
    return doc && doc.kind === "letter" ? t("ui.savesKindLetter") : t("ui.savesKindCv");
}

function newSaveId() {
    return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function updateLinkedSave() {
    if (saveSwap || !currentSaveId || !doc) return;
    const list = readSaves();
    const index = list.findIndex(function (item) { return item.id === currentSaveId; });
    if (index < 0) {
        currentSaveId = "";
        return;
    }
    list[index].doc = JSON.parse(JSON.stringify(doc));
    list[index].name = saveTitle();
    list[index].kind = doc.kind === "letter" ? "letter" : "cv";
    list[index].lang = doc.lang === "en" ? "en" : "nl";
    list[index].updated = Date.now();
    try { localStorage.setItem(STORAGE_SAVES, JSON.stringify(list)); } catch (error) { /* the live copy still saved */ }
}

function rememberSave(asCopy) {
    if (!doc) return;
    const list = readSaves();
    const fresh = asCopy || !currentSaveId || !list.some(function (item) { return item.id === currentSaveId; });
    const id = fresh ? newSaveId() : currentSaveId;
    const next = {
        id: id,
        name: saveTitle(),
        kind: doc.kind === "letter" ? "letter" : "cv",
        lang: doc.lang === "en" ? "en" : "nl",
        updated: Date.now(),
        doc: JSON.parse(JSON.stringify(doc))
    };
    const index = list.findIndex(function (item) { return item.id === id; });
    if (index >= 0) list[index] = next;
    else list.unshift(next);
    if (list.length > SAVE_LIMIT) list.length = SAVE_LIMIT;
    writeSaves(list);
    currentSaveId = id;
    paintSaves();
    showStatus(t(asCopy ? "ui.savesCopied" : "ui.savesStored"));
}

function clearSaves() {
    currentSaveId = "";
    try { localStorage.removeItem(STORAGE_SAVES); } catch (error) { /* private mode */ }
    writeSaves([]);
    paintSaves();
}

function forgetSave(id) {
    const list = readSaves().filter(function (item) { return item.id !== id; });
    if (currentSaveId === id) currentSaveId = "";
    writeSaves(list);
    paintSaves();
}

function openSave(id) {
    const item = readSaves().find(function (entry) { return entry.id === id; });
    if (!item) return;
    snapshot();
    doc = JSON.parse(JSON.stringify(item.doc));
    normalize(doc);
    lang = doc.lang === "en" ? "en" : "nl";
    currentSaveId = item.id;
    filenameCustom = true;
    selectedId = null;
    documentLive = true;
    setupReturn = false;
    const name = document.getElementById("pdf-name");
    if (name) name.value = item.name || saveTitle();
    try { localStorage.setItem(STORAGE_NAME, name ? name.value : item.name); } catch (error) { /* ignore */ }
    try { localStorage.setItem(STORAGE_LANG, lang); } catch (error) { /* ignore */ }
    applyLanguage();
    render();
    setPhase("studio");
    save();
    syncRoute("push");
    toggleSaves(false);
    showStatus(t("ui.savesOpen"));
}

function saveWhen(stamp) {
    try {
        return new Date(stamp).toLocaleDateString(lang === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "short", year: "numeric" });
    } catch (error) {
        return "";
    }
}

function paintSaves() {
    const listNode = document.getElementById("save-manager-list");
    const empty = document.getElementById("save-manager-empty");
    if (!listNode) return;
    const list = readSaves();
    listNode.textContent = "";
    if (empty) empty.hidden = list.length > 0;
    list.forEach(function (item) {
        const kind = item.kind === "letter" ? t("ui.savesKindLetter") : t("ui.savesKindCv");
        const edit = h("button", { type: "button", class: "btn", i18n: "ui.savesEdit", text: t("ui.savesEdit") });
        const pdf = h("button", { type: "button", class: "btn", i18n: "ui.savesPdf", i18nTitle: "ui.savesDownload", text: t("ui.savesPdf"), title: t("ui.savesDownload") });
        const copy = h("button", { type: "button", class: "btn", i18n: "ui.savesDuplicate", text: t("ui.savesDuplicate") });
        const remove = h("button", { type: "button", class: "btn", i18n: "ui.savesDelete", text: t("ui.savesDelete") });
        edit.addEventListener("click", function () { openSave(item.id); });
        pdf.addEventListener("click", function () { downloadSaved(item.id, pdf); });
        copy.addEventListener("click", function () { duplicateSave(item.id); });
        remove.addEventListener("click", function () {
            if (remove.dataset.armed !== "1") {
                listNode.querySelectorAll("button[data-armed]").forEach(function (button) {
                    button.dataset.armed = "";
                    button.textContent = t(button.dataset.i18n || "ui.savesDelete");
                });
                remove.dataset.armed = "1";
                remove.textContent = t("ui.savesDeleteArmed");
                return;
            }
            forgetSave(item.id);
        });
        const row = h("li", { class: "save-row" }, [
            h("strong", { text: item.name || kind }),
            h("p", { class: "note", text: kind + " · " + saveWhen(item.updated) }),
            h("div", { class: "save-row-actions" }, [edit, pdf, copy, remove])
        ]);
        if (item.id === currentSaveId) row.classList.add("is-current");
        listNode.appendChild(row);
    });
    document.querySelectorAll(".saves-count").forEach(function (node) {
        node.textContent = list.length ? String(list.length) : "";
    });
}

function duplicateSave(id) {
    const item = readSaves().find(function (entry) { return entry.id === id; });
    if (!item) return;
    const copy = JSON.parse(JSON.stringify(item));
    copy.id = newSaveId();
    copy.updated = Date.now();
    const list = readSaves();
    list.unshift(copy);
    if (list.length > SAVE_LIMIT) list.length = SAVE_LIMIT;
    writeSaves(list);
    paintSaves();
    showStatus(t("ui.savesStored"));
}

let savesReturn = null;

function toggleSaves(force) {
    const panel = document.getElementById("save-manager");
    if (!panel) return;
    const open = typeof force === "boolean" ? force : panel.hidden;
    panel.hidden = !open;
    document.querySelectorAll(".saves-open").forEach(function (button) {
        button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (open) {
        paintSaves();
        const store = document.getElementById("save-manager-store");
        if (store) store.focus();
        return;
    }
    if (savesReturn && document.body.contains(savesReturn)) savesReturn.focus();
}

async function downloadSaved(id, button) {
    const item = readSaves().find(function (entry) { return entry.id === id; });
    if (!item || saveSwap) return;
    const nameInput = document.getElementById("pdf-name");
    const studio = document.getElementById("studio");
    const backup = {
        doc: JSON.parse(JSON.stringify(doc)),
        lang: lang,
        name: nameInput ? nameInput.value : "",
        custom: filenameCustom,
        id: currentSaveId,
        hidden: !!(studio && studio.hidden)
    };
    saveSwap = true;
    if (button) {
        button.disabled = true;
        button.textContent = t("ui.working");
    }
    try {
        doc = JSON.parse(JSON.stringify(item.doc));
        normalize(doc);
        lang = doc.lang === "en" ? "en" : "nl";
        if (nameInput) nameInput.value = item.name || "";
        render();
        if (studio && studio.hidden) {
            studio.hidden = false;
            document.body.classList.add("pdf-offstage");
        }
        await ensurePdfLibs();
        downloadBlob(await buildPdfBytes(), pdfFilename());
        showStatus(t("ui.downloaded").replace("{name}", pdfFilename()));
    } catch (error) {
        showError(t("ui.pdfError") + " " + (error && error.message ? error.message : ""));
    } finally {
        document.body.classList.remove("pdf-offstage");
        doc = backup.doc;
        normalize(doc);
        lang = backup.lang;
        currentSaveId = backup.id;
        filenameCustom = backup.custom;
        if (nameInput) nameInput.value = backup.name;
        if (studio && backup.hidden) studio.hidden = true;
        render();
        saveSwap = false;
        if (button) {
            button.disabled = false;
            button.textContent = t("ui.savesPdf");
        }
    }
}

function mountSaves() {
    if (document.getElementById("save-manager")) return;
    const close = h("button", { id: "save-manager-close", class: "btn", type: "button", i18n: "ui.cancel" });
    const store = h("button", { id: "save-manager-store", class: "btn-primary", type: "button", i18n: "ui.savesStore" });
    const copy = h("button", { id: "save-manager-copy", class: "btn", type: "button", i18n: "ui.savesCopy" });
    const panel = h("div", { id: "save-manager", class: "save-manager", hidden: "hidden" });
    const card = h("div", { class: "save-manager-card", role: "dialog", "aria-modal": "true", "aria-labelledby": "save-manager-title", "aria-describedby": "save-manager-lead" }, [
        h("div", { class: "save-manager-head" }, [
            h("h2", { id: "save-manager-title", i18n: "ui.savesTitle" }),
            close
        ]),
        h("p", { id: "save-manager-lead", class: "note", i18n: "ui.savesLead" }),
        h("div", { class: "save-manager-actions" }, [store, copy]),
        h("p", { id: "save-manager-empty", class: "note", i18n: "ui.savesEmpty" }),
        h("ul", { id: "save-manager-list", class: "save-list" })
    ]);
    panel.appendChild(card);
    document.body.appendChild(panel);
    close.addEventListener("click", function () { toggleSaves(false); });
    store.addEventListener("click", function () { rememberSave(false); });
    copy.addEventListener("click", function () { rememberSave(true); });
    panel.addEventListener("click", function (event) {
        if (event.target === panel) toggleSaves(false);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && panel.hidden === false) toggleSaves(false);
    });
    document.querySelectorAll(".saves-open").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", function () {
            savesReturn = button;
            toggleSaves();
        });
    });
    paintSaves();
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Stored language, ?lang=, buttons, fixed headings, and the FAQ schema text. */

function spellLocale() {
    return lang === "en" ? "en-US" : "nl-NL";
}

function retargetSpell(node, code) {
    if (!node) return;
    node.lang = code;
    node.setAttribute("lang", code);
    if (node.spellcheck === false) return;
    const focused = document.activeElement === node;
    node.spellcheck = false;
    node.setAttribute("spellcheck", "false");
    node.spellcheck = true;
    node.setAttribute("spellcheck", "true");
    if (focused) {
        node.blur();
        node.focus();
    }
}

function syncSpellLocale() {
    const code = spellLocale();
    document.documentElement.lang = code;
    document.body.lang = code;
    ["sheet", "setup-paste", "setup-model-text", "loose-text", "llm-input"].forEach(function (id) {
        retargetSpell(document.getElementById(id), code);
    });
    document.querySelectorAll(".editable, #setup-guide input, #setup-guide textarea, .drawer textarea").forEach(function (node) {
        retargetSpell(node, code);
    });
    const fileName = document.getElementById("pdf-name");
    if (fileName) {
        fileName.lang = code;
        fileName.spellcheck = false;
        fileName.setAttribute("spellcheck", "false");
    }
}

function applyLanguage() {
    syncSpellLocale();
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
        const value = t(node.dataset.i18n);
        if (value !== node.dataset.i18n) node.textContent = value;
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (node) {
        const value = t(node.dataset.i18nTitle);
        if (value !== node.dataset.i18nTitle) node.title = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
        const value = t(node.dataset.i18nPlaceholder);
        if (value !== node.dataset.i18nPlaceholder) node.placeholder = value;
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (node) {
        const value = t(node.dataset.i18nLabel);
        if (value !== node.dataset.i18nLabel) node.setAttribute("aria-label", value);
    });
    document.querySelectorAll(".lang-switch button").forEach(function (button) {
        button.classList.toggle("is-active", button.dataset.lang === lang);
        button.setAttribute("aria-pressed", button.dataset.lang === lang ? "true" : "false");
    });
    document.querySelectorAll(".lang-switch").forEach(function (node) {
        node.title = t("ui.langHint");
    });
    const nameInput = document.getElementById("pdf-name");
    if (nameInput) nameInput.setAttribute("aria-label", t("ui.fileName"));
    const zoom = document.getElementById("zoom");
    if (zoom) zoom.setAttribute("aria-label", t("ui.zoom"));
    syncLibraryHint();
    syncHistoryButtons();
    refreshIdentity();
    updateFilenamePreview();
    paintContrastWarning();
    syncFaqSchema();
    refreshAiBox(false);
    if (typeof paintSaves === "function") paintSaves();
    const morePages = document.getElementById("more-pages");
    if (morePages) morePages.setAttribute("aria-label", t("site.morePages"));
}

function syncFaqSchema() {
    const node = document.getElementById("faq-ld");
    if (!node) return;
    const pairs = ["qPrice", "qUpload", "qDutch", "qPdf", "qCode"];
    node.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pairs.map(function (key) {
            return {
                "@type": "Question",
                "name": t("site." + key),
                "acceptedAnswer": { "@type": "Answer", "text": t("site.a" + key.slice(1)) }
            };
        })
    });
}

function setLanguage(next) {
    if (setupState.source === "guided") storeGuideStep();
    lang = next === "en" ? "en" : "nl";
    doc.lang = lang;
    try { localStorage.setItem(STORAGE_LANG, lang); } catch (error) { /* ignore */ }
    applyLanguage();
    render();
    save();
    if (document.body.dataset.phase === "setup") showSetupStep(setupState.step);
}

function savedLang() {
    try {
        const stored = localStorage.getItem(STORAGE_LANG);
        if (stored === "nl") return "nl";
        if (stored === "en") return "en";
    } catch (error) { /* keep the English default */ }
    return "en";
}

function requestedLang() {
    try {
        const value = new URLSearchParams(location.search).get("lang");
        if (value === "nl" || value === "en") return value;
    } catch (error) { /* a file URL has no search to read */ }
    return "";
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The on-device model, and the warning shown outside Chrome. */

function browserLooksLikeChrome() {
    const ua = navigator.userAgent || "";
    return /Chrome\/\d/.test(ua) && !/Edg\/|OPR\/|Firefox|FxiOS|SamsungBrowser|CriOS/.test(ua);
}

function chromeLimited() {
    return !browserLooksLikeChrome() && !chromeProceed;
}

function markChromeLimits() {
    const limited = chromeLimited();
    document.querySelectorAll("[data-chrome-only]").forEach(function (node) {
        node.classList.toggle("is-limited", limited);
        if (node.tagName === "BUTTON") node.setAttribute("aria-disabled", limited ? "true" : "false");
    });
}

function askChrome(note, action) {
    if (!chromeLimited()) {
        action();
        return;
    }
    chromeAction = action;
    document.querySelectorAll(".chrome-gate").forEach(function (gate) { gate.hidden = true; });
    if (!note) return;
    note.hidden = false;
    const go = note.querySelector("[data-chrome-go]");
    if (go) go.focus();
}

function allowChromeAndRun() {
    const action = chromeAction;
    chromeProceed = true;
    chromeAction = null;
    document.querySelectorAll(".chrome-gate").forEach(function (gate) { gate.hidden = true; });
    markChromeLimits();
    if (action) action();
}

function browserModelApi() {
    if (typeof LanguageModel !== "undefined") return LanguageModel;
    if (window.ai && window.ai.languageModel) return window.ai.languageModel;
    return null;
}

async function formatWithBrowserModel(text) {
    const api = browserModelApi();
    if (!api) throw new Error(t("guide.modelMissing"));
    const options = {
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }]
    };
    let availability = "unavailable";
    try {
        availability = await api.availability(options);
    } catch (error) {
        try { availability = await api.availability(); } catch (again) { availability = "unavailable"; }
    }
    if (!availability || availability === "unavailable") throw new Error(t("guide.modelMissing"));
    const session = await api.create(Object.assign({}, options, {
        initialPrompts: [{
            role: "system",
            content: "Turn the user's CV or motivation letter into marked text. Output only the block from @@@CV or @@@LETTER through @@@END, with no markdown. Keep these English field names: NAME, ROLE, CITY, PHONE, EMAIL, BORN, TITLE, DATE, ORGANIZATION, SUMMARY, SUBJECT, TO, SIGN, HEADING, BODY. A point is a line starting with POINT: . Write the person's own words in the same language as the input. Use @@@CONTACT, @@@SKILLS, @@@STRENGTHS, @@@PROJECTS, @@@PROFILE, @@@JOB, @@@STUDY, @@@PARAGRAPH, @@@OPENING, @@@SECTION and @@@CLOSING where they fit. On a CV, @@@LETTERHEAD is only a date, a recipient and a subject. Leave TITLE empty unless the source has a heading. Do not invent a heading."
        }]
    }));
    try {
        const answer = await session.prompt(text);
        applyMarked(typeof answer === "string" ? answer : String(answer || ""));
    } finally {
        if (session && session.destroy) session.destroy();
    }
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The top bar and the settings panel. */

function h(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
        if (key === "class") node.className = attrs[key];
        else if (key === "i18n") node.dataset.i18n = attrs[key];
        else if (key === "i18nTitle") node.dataset.i18nTitle = attrs[key];
        else if (key === "text") node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
}

function keepSelection(button) {
    button.addEventListener("mousedown", function (event) { event.preventDefault(); });
    return button;
}

function colorField(id, labelKey) {
    return h("label", { class: "swatch" }, [
        h("span", { i18n: labelKey }),
        h("input", { id: id, type: "color" })
    ]);
}

function bindColor(id, apply) {
    const input = document.getElementById(id);
    let snapped = false;
    input.addEventListener("pointerdown", function () { snapped = false; });
    input.addEventListener("input", function () {
        if (!snapped) {
            snapshot();
            snapped = true;
        }
        apply(input.value);
    });
    input.addEventListener("change", function () { snapped = false; });
}

function mountTools() {
    const root = document.getElementById("drawer");
    const topbar = document.getElementById("topbar");
    const bar = document.getElementById("floatbar");
    const nl = keepSelection(h("button", { type: "button", "data-lang": "nl", text: "NL" }));
    const en = keepSelection(h("button", { type: "button", "data-lang": "en", text: "EN" }));
    nl.addEventListener("click", function () { setLanguage("nl"); });
    en.addEventListener("click", function () { setLanguage("en"); });

    const download = keepSelection(h("button", { id: "download", class: "btn-primary", type: "button", i18n: "ui.download" }));
    function closeMore() {
        const menu = document.querySelector(".more-menu");
        if (menu) menu.open = false;
    }
    const freshBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "shell.new" }));
    freshBtn.addEventListener("click", function () {
        closeMore();
        resetSetup();
        setupReturn = true;
        setPhase("setup");
        syncRoute("push");
    });
    const wipeMenu = keepSelection(h("button", { id: "reset-all", class: "btn menu-reset", type: "button", i18n: "ui.reset" }));
    wipeMenu.addEventListener("click", function () { resetAll(wipeMenu); });
    const settingsBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "shell.settings" }));
    settingsBtn.addEventListener("click", function () {
        closeMore();
        toggleDrawer();
    });
    const fillBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "shell.fill" }));
    fillBtn.addEventListener("click", function () {
        closeMore();
        const kind = doc && doc.kind === "letter" ? "letter" : "cv";
        resetSetup();
        setupReturn = true;
        setPhase("setup");
        chooseKind(kind);
    });
    const pasteBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "guide.paste" }));
    pasteBtn.addEventListener("click", function () {
        closeMore();
        toggleDrawer(true);
        const box = document.getElementById("loose-text");
        if (box) box.focus();
    });
    const importer = keepSelection(h("button", { id: "import", class: "btn", type: "button", i18n: "ui.import" }));
    const file = h("input", { id: "pdf-file", type: "file", accept: "application/pdf,.pdf", hidden: "hidden" });
    download.addEventListener("click", downloadPdf);
    importer.addEventListener("click", function () { file.click(); });
    file.addEventListener("change", function () {
        const picked = file.files && file.files[0];
        file.value = "";
        if (!picked) return;
        picked.arrayBuffer().then(function (buffer) {
            return importPdfBytes(new Uint8Array(buffer));
        }).catch(function () { showError(t("ui.importFail")); });
    });

    const name = h("input", {
        id: "pdf-name",
        class: "topbar-name",
        type: "text",
        autocomplete: "off",
        "data-i18n-placeholder": "ui.fileName"
    });
    name.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        name.blur();
    });
    name.addEventListener("input", function () {
        filenameCustom = true;
        try { localStorage.setItem(STORAGE_NAME, name.value); } catch (error) { /* ignore */ }
        updateFilenamePreview();
    });
    const stamp = h("input", { id: "pdf-timestamp", type: "checkbox" });
    const finalBox = h("input", { id: "pdf-final", type: "checkbox" });
    stamp.addEventListener("change", updateFilenamePreview);
    finalBox.addEventListener("change", updateFilenamePreview);

    const undoBtn = keepSelection(h("button", { id: "undo-btn", class: "btn", type: "button", i18n: "ui.undo" }));
    const redoBtn = keepSelection(h("button", { id: "redo-btn", class: "btn", type: "button", i18n: "ui.redo" }));
    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);

    const cvBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.emptyCv" }));
    const letterBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.emptyLetter" }));
    cvBtn.addEventListener("click", function () { armControl(cvBtn, function () { useTemplate("cv"); }); });
    letterBtn.addEventListener("click", function () { armControl(letterBtn, function () { useTemplate("letter"); }); });

    const zoom = h("input", { id: "zoom", type: "range", min: "40", max: "130", value: "100", "aria-label": t("ui.zoom") });
    zoom.addEventListener("input", function () {
        setZoom(Number(zoom.value) / 100, true);
        updatePageGuides();
    });

    function themeRange(id, key, labelKey, min, max, step) {
        const input = h("input", { id: id, type: "range", min: min, max: max, step: step });
        let snapped = false;
        input.addEventListener("pointerdown", function () { snapped = false; });
        input.addEventListener("input", function () {
            if (!snapped) {
                snapshot();
                snapped = true;
            }
            doc.theme[key] = Number(input.value);
            applyTheme();
            save();
            syncThemeInputs();
        });
        input.addEventListener("change", function () { snapped = false; });
        return h("label", { class: "field" }, [
            h("span", { i18n: labelKey }),
            input,
            h("span", { id: id + "-value" })
        ]);
    }

    const grid = h("div", { id: "block-grid", class: "library-grid" });

    const sidebarRadio = h("input", { type: "radio", name: "add-target", value: "sidebar" });
    const mainRadio = h("input", { type: "radio", name: "add-target", value: "main", checked: "checked" });
    sidebarRadio.addEventListener("change", function () { if (sidebarRadio.checked) setAddTarget("sidebar"); });
    mainRadio.addEventListener("change", function () { if (mainRadio.checked) setAddTarget("main"); });

    const bold = keepSelection(h("button", { class: "btn", type: "button", text: "B", i18nTitle: "ui.bold", "data-command": "bold" }));
    const italic = keepSelection(h("button", { class: "btn", type: "button", text: "I", i18nTitle: "ui.italic", "data-command": "italic" }));
    const underline = keepSelection(h("button", { class: "btn", type: "button", text: "U", i18nTitle: "ui.underline", "data-command": "underline" }));
    bold.addEventListener("click", function () { format("bold"); });
    italic.addEventListener("click", function () { format("italic"); });
    underline.addEventListener("click", function () { format("underline"); });

    const addLineBtn = keepSelection(h("button", { id: "add-line", class: "btn", type: "button", i18n: "ui.addLine" }));
    addLineBtn.addEventListener("click", addLine);
    const duplicateBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.duplicate" }));
    const deleteBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.delete" }));
    const resetBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.resetStyle" }));
    duplicateBtn.addEventListener("click", duplicateBlock);
    deleteBtn.addEventListener("click", deleteBlock);
    resetBtn.addEventListener("click", resetStyle);
    deleteBtn.classList.add("btn-danger");

    const loose = h("textarea", { id: "loose-text", rows: "8" });
    const llm = h("textarea", { id: "llm-input", rows: "10", spellcheck: "false" });
    const formatBtn = keepSelection(h("button", { class: "btn-primary", type: "button", i18n: "guide.formatLocal" }));
    const modelBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "guide.formatModel", "data-chrome-only": "1" }));
    const copyBtn = keepSelection(h("button", { class: "btn-primary", type: "button", i18n: "ui.copy" }));
    const applyBtn = keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.applyText" }));
    formatBtn.addEventListener("click", function () {
        const data = applyLooseText(loose.value, doc.kind === "letter" ? "letter" : "cv");
        const found = describeLoose(data);
        showStatus(t("ui.applied") + (found ? " " + t("ui.found").replace("{list}", found) : ""));
    });
    const chromeNote = h("div", { class: "chrome-gate", hidden: "hidden" }, [
        h("p", { i18n: "setup.chromeWarn" }),
        keepSelection(h("button", { class: "btn", type: "button", "data-chrome-go": "1", i18n: "setup.chromeProceed" }))
    ]);
    modelBtn.addEventListener("click", function () {
        askChrome(chromeNote, function () {
            showStatus(t("guide.modelWorking"));
            formatWithBrowserModel(loose.value).then(function () {
                showStatus(t("guide.modelReady"));
            }).catch(function () {
                applyLooseText(loose.value, doc.kind === "letter" ? "letter" : "cv");
                showError(t("guide.modelMissing"));
            });
        });
    });
    copyBtn.addEventListener("click", function () { copyForModel(); });
    applyBtn.addEventListener("click", applyModelText);
    const fontSelect = h("select", { id: "theme-font" }, [
        h("option", { value: "roboto", text: "Roboto" }),
        h("option", { value: "merriweather", text: "Merriweather" }),
        h("option", { value: "lora", text: "Lora" })
    ]);

    const more = document.createElement("details");
    more.className = "more-menu";
    const summary = document.createElement("summary");
    summary.className = "btn";
    summary.dataset.i18n = "ui.more";
    more.append(summary, h("div", { class: "more-panel" }, [freshBtn, fillBtn, pasteBtn, importer, settingsBtn]));
    const ai = document.createElement("details");
    ai.className = "ai-menu";
    const aiSummary = document.createElement("summary");
    aiSummary.className = "btn";
    aiSummary.dataset.i18n = "ui.ai";
    ai.append(aiSummary, h("div", { class: "ai-panel" }, [
        h("p", { class: "ai-title", i18n: "ui.model" }),
        h("p", { class: "note", i18n: "ui.modelHint" }),
        llm,
        h("div", { class: "menu-actions" }, [
            copyBtn,
            applyBtn,
            h("select", { id: "model-mode" }, [
                h("option", { value: "guide", i18n: "setup.copyGuide" }),
                h("option", { value: "plain", i18n: "setup.copyPlain" }),
                h("option", { value: "advanced", i18n: "setup.copyAdvanced" })
            ])
        ])
    ]));
    ai.addEventListener("toggle", function () {
        if (!ai.open) return;
        more.open = false;
        refreshAiBox(false);
    });
    more.addEventListener("toggle", function () {
        if (more.open) ai.open = false;
    });
    const zoomSlot = document.getElementById("zoom-slot");
    if (zoomSlot) zoomSlot.appendChild(zoom);
    topbar.append(
        h("h1", { id: "doc-title" }),
        h("div", { class: "lang-switch" }, [nl, en]),
        h("span", { id: "save-state", class: "save-state" }),
        h("div", { class: "spacer" }),
        undoBtn,
        redoBtn,
        h("button", { type: "button", class: "btn saves-open", id: "saves-open", "aria-controls": "save-manager", "aria-expanded": "false" }, [
            h("span", { i18n: "ui.saves" }),
            h("span", { class: "saves-count" })
        ]),
        name,
        ai,
        download,
        keepSelection(h("button", { class: "btn", type: "button", i18n: "ui.feedback", "data-feedback": "" })),
        more,
        file
    );
    bar.append(
        bold,
        italic,
        underline,
        h("input", { id: "block-color", type: "color", i18nTitle: "ui.blockColor" }),
        h("input", { id: "block-bg", type: "color", i18nTitle: "ui.blockBg" }),
        h("input", { id: "block-size", type: "range", min: "8", max: "28", step: "0.5" }),
        h("span", { id: "block-size-value", class: "size-readout" }),
        h("input", { id: "photo-url", class: "photo-url", type: "text", hidden: "hidden", autocomplete: "off", spellcheck: "false", "data-i18n-placeholder": "photo.url" }),
        addLineBtn,
        duplicateBtn,
        deleteBtn,
        resetBtn
    );
    root.append(
        h("p", { id: "error", class: "error", hidden: "hidden" }),
        h("p", { id: "status", class: "note", hidden: "hidden" }),
        h("section", { class: "menu-block" }, [
            h("h2", { i18n: "ui.file" }),
            h("label", { class: "check" }, [stamp, h("span", { i18n: "ui.timestamp" })]),
            h("label", { class: "check" }, [finalBox, h("span", { i18n: "ui.final" })]),
            h("p", { id: "pdf-preview", class: "filename" }),
            h("p", { id: "page-status", class: "page-status" }),
            wipeMenu
        ]),
        h("section", { class: "menu-block" }, [
            h("h2", { i18n: "guide.pasteTitle" }),
            h("p", { class: "note", i18n: "guide.pasteHint" }),
            loose,
            h("div", { class: "menu-actions" }, [formatBtn, modelBtn]),
            chromeNote
        ]),
        h("section", { class: "menu-block" }, [
            h("h2", { i18n: "ui.templates" }),
            h("div", { class: "menu-actions" }, [cvBtn, letterBtn])
        ]),
        h("section", { class: "menu-block" }, [
            h("h2", { i18n: "ui.theme" }),
            h("label", { class: "field" }, [h("span", { i18n: "shell.font" }), fontSelect]),
            h("div", { class: "menu-colors" }, [
                colorField("theme-sidebar", "ui.sidebarColor"),
                colorField("theme-sidebar-text", "ui.sidebarText"),
                colorField("theme-accent", "ui.accent"),
                colorField("theme-page", "ui.page"),
                colorField("theme-text", "ui.text")
            ]),
            h("p", { id: "theme-contrast", class: "note contrast-note", hidden: "hidden" }),
            themeRange("theme-size", "baseSize", "ui.baseSize", "8", "14", "0.5"),
            themeRange("theme-width", "sidebarWidth", "ui.column", "24", "50", "1")
        ])
    );
    const modelMode = document.getElementById("model-mode");
    if (modelMode) modelMode.addEventListener("change", function () { refreshAiBox(true); });
    refreshAiBox(true);
    document.getElementById("library").append(
        h("h2", { i18n: "ui.blocks" }),
        h("p", { id: "library-hint", class: "note" }),
        h("div", { class: "row library-target" }, [
            h("span", { class: "note", i18n: "ui.addTo" }),
            h("label", { class: "check" }, [sidebarRadio, h("span", { i18n: "ui.sidebar" })]),
            h("label", { class: "check" }, [mainRadio, h("span", { i18n: "ui.main" })])
        ]),
        grid
    );

    bindColor("theme-sidebar", function (value) { doc.theme.sidebar = value; applyTheme(); save(); paintContrastWarning(); });
    bindColor("theme-sidebar-text", function (value) { doc.theme.sidebarText = value; applyTheme(); save(); paintContrastWarning(); });
    bindColor("theme-accent", function (value) { doc.theme.accent = value; applyTheme(); save(); paintContrastWarning(); });
    bindColor("theme-page", function (value) { doc.theme.page = value; applyTheme(); save(); paintContrastWarning(); });
    bindColor("theme-text", function (value) { doc.theme.text = value; applyTheme(); save(); paintContrastWarning(); });
    fontSelect.addEventListener("change", function () {
        snapshot();
        doc.theme.font = fontSelect.value;
        fontConfigPromise = null;
        fontConfigKey = "";
        applyTheme();
        save();
    });

    const blockColor = document.getElementById("block-color");
    let blockColorSnapped = false;
    blockColor.addEventListener("pointerdown", function () { blockColorSnapped = false; });
    blockColor.addEventListener("input", function () {
        const selection = window.getSelection();
        if (activeField && selection && !selection.isCollapsed && activeField.contains(selection.anchorNode)) return;
        const item = selectedBlock();
        if (!item) return;
        if (!blockColorSnapped) {
            snapshot();
            blockColorSnapped = true;
        }
        item.color = blockColor.value;
        const node = document.querySelector('.block[data-id="' + item.id + '"]');
        if (node) node.style.color = item.color;
        save();
    });
    blockColor.addEventListener("change", function () {
        applyTextStyle({ color: blockColor.value });
        blockColorSnapped = false;
    });

    const blockBg = document.getElementById("block-bg");
    let blockBgSnapped = false;
    blockBg.addEventListener("pointerdown", function () { blockBgSnapped = false; });
    blockBg.addEventListener("input", function () {
        const item = selectedBlock();
        if (!item) return;
        if (!blockBgSnapped) {
            snapshot();
            blockBgSnapped = true;
        }
        item.background = blockBg.value;
        const node = document.querySelector('.block[data-id="' + item.id + '"]');
        if (node) node.style.background = item.background;
        save();
    });
    blockBg.addEventListener("change", function () { blockBgSnapped = false; });

    const photoUrl = document.getElementById("photo-url");
    function usePhotoUrl() {
        const item = selectedBlock();
        if (!item || item.type !== "photo") return;
        const next = photoUrl.value.trim();
        if (!next) {
            if (item.fields.url) {
                snapshot();
                item.fields.url = "";
                save();
            }
            return;
        }
        if (next === (item.fields.url || "")) return;
        importPhotoAddress(item, next);
    }
    photoUrl.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        usePhotoUrl();
    });
    photoUrl.addEventListener("change", usePhotoUrl);
    mountSaves();

    const blockSize = document.getElementById("block-size");
    blockSize.addEventListener("pointerdown", function () { photoWidthSnapped = false; });
    blockSize.addEventListener("input", function () {
        const item = selectedBlock();
        const label = document.getElementById("block-size-value");
        if (item && item.type === "photo") {
            setPhotoWidth(item, blockSize.value, true);
            if (label) label.textContent = blockSize.value + "%";
            return;
        }
        if (label) label.textContent = blockSize.value + (item && item.type === "spacer" ? " px" : " pt");
    });
    blockSize.addEventListener("change", function () {
        photoWidthSnapped = false;
        const value = Number(blockSize.value);
        const item = selectedBlock();
        if (item && item.type === "photo") return;
        if (item && item.type === "spacer") {
            snapshot();
            item.fields.size = value;
            item.fontSize = 0;
            const node = document.querySelector('.block[data-id="' + item.id + '"]');
            if (node) node.style.height = value + "px";
            save();
            return;
        }
        if (applyTextStyle({ fontSize: value + "pt" })) return;
        if (!item) return;
        snapshot();
        item.fontSize = value;
        const node = document.querySelector('.block[data-id="' + item.id + '"]');
        if (node) node.style.fontSize = value + "pt";
        save();
    });
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The step-by-step questions and the document they build. */

function blankGuide() {
    return {
        name: "", role: "", city: "", phone: "", email: "", born: "",
        intro: "", skills: "",
        strengths: [], projects: [], jobs: [], studies: [],
        date: "", to: "", subject: "", body: "", closing: "", sign: ""
    };
}

function guidePlan() {
    const letter = setupState.kind === "letter";
    const contactInputs = [["city", "doc.city"], ["phone", "doc.phone"], ["email", "doc.email"]];
    if (!letter) contactInputs.push(["born", "doc.born"]);
    const steps = [
        { id: "name", title: "guide.nameTitle", hint: "guide.nameHint", inputs: [["name", "ph.name"]] },
        { id: "role", title: "guide.roleTitle", hint: "guide.roleHint", inputs: [["role", "ph.role"]] },
        { id: "contact", title: "guide.contactTitle", hint: "guide.contactHint", inputs: contactInputs }
    ];
    if (letter) {
        steps.push(
            { id: "letterhead", title: "guide.letterheadTitle", hint: "guide.letterheadHint", inputs: [["date", "ph.date"], ["subject", "ph.subject"]], area: ["to", "ph.to"] },
            { id: "intro", title: "guide.introTitle", hint: "guide.introHint", area: ["intro", "doc.intro"] },
            { id: "body", title: "guide.bodyTitle", hint: "guide.bodyHint", area: ["body", "guide.bodyTitle"] },
            { id: "close", title: "guide.closeTitle", hint: "guide.closeHint", inputs: [["closing", "guide.greeting"], ["sign", "ph.name"]] }
        );
        return steps;
    }
    steps.push(
        { id: "intro", title: "guide.introTitle", hint: "guide.introHint", area: ["intro", "doc.intro"] },
        { id: "job", title: "guide.workTitle", hint: "guide.workHint", repeat: "jobs", inputs: [["title", "guide.jobTitle"], ["date", "guide.period"], ["org", "ph.org"]], area: ["points", "guide.points"] },
        { id: "study", title: "guide.studyTitle", hint: "guide.studyHint", repeat: "studies", inputs: [["title", "guide.jobTitle"], ["date", "guide.period"], ["org", "ph.org"]], area: ["points", "guide.points"] },
        { id: "skills", title: "guide.skillsTitle", hint: "guide.skillsHint", area: ["skills", "guide.points"] },
        { id: "strength", title: "guide.strengthTitle", hint: "guide.strengthHint", repeat: "strengths", inputs: [["title", "ph.title"], ["body", "ph.text"]] },
        { id: "project", title: "guide.projectTitle", hint: "guide.projectHint", repeat: "projects", inputs: [["title", "ph.title"], ["body", "ph.text"]] }
    );
    return steps;
}

function readGuideInputs() {
    const values = {};
    document.querySelectorAll("#setup-guide [data-guide-key]").forEach(function (input) {
        values[input.dataset.guideKey] = input.value;
    });
    return values;
}

function storeGuideStep() {
    if (setupState.source !== "guided" || !setupState.answers) return;
    const step = guidePlan()[setupState.guideIndex || 0];
    if (!step || step.repeat) return;
    const values = readGuideInputs();
    Object.keys(values).forEach(function (key) { setupState.answers[key] = values[key]; });
}

function commitRepeat(step) {
    const values = readGuideInputs();
    const draft = {
        title: values.title || "",
        body: values.body || "",
        date: values.date || "",
        org: values.org || "",
        points: values.points || ""
    };
    if (!Object.keys(draft).some(function (key) { return String(draft[key]).trim(); })) return;
    setupState.answers[step.repeat].push(draft);
}

function guideControl(key, labelKey, value, multiline) {
    const input = document.createElement(multiline ? "textarea" : "input");
    if (!multiline) input.type = "text";
    else input.rows = 4;
    input.dataset.guideKey = key;
    input.value = value || "";
    input.placeholder = t(labelKey);
    input.lang = spellLocale();
    input.setAttribute("lang", input.lang);
    input.spellcheck = key !== "phone" && key !== "email" && key !== "born" && key !== "date";
    input.setAttribute("spellcheck", input.spellcheck ? "true" : "false");
    input.autocomplete = "off";
    input.enterKeyHint = multiline ? "enter" : "next";
    return h("label", { class: "field" }, [h("span", { text: t(labelKey) }), input]);
}

function renderGuide() {
    const host = document.getElementById("setup-guide");
    if (!host) return;
    if (!setupState.answers) setupState.answers = blankGuide();
    const steps = guidePlan();
    const index = Math.max(0, Math.min(setupState.guideIndex || 0, steps.length - 1));
    setupState.guideIndex = index;
    const step = steps[index];
    const answers = setupState.answers;
    host.replaceChildren(
        h("p", { class: "kicker", text: t("guide.step").replace("{n}", String(index + 1)).replace("{m}", String(steps.length)) }),
        h("h2", { text: t(step.title) }),
        h("p", { class: "setup-lead", text: t(step.hint) })
    );
    (step.inputs || []).forEach(function (pair) {
        host.appendChild(guideControl(pair[0], pair[1], step.repeat ? "" : answers[pair[0]], false));
    });
    if (step.area) host.appendChild(guideControl(step.area[0], step.area[1], step.repeat ? "" : answers[step.area[0]], true));
    if (step.repeat) {
        host.appendChild(h("p", { class: "note", text: t("guide.added").replace("{n}", String(answers[step.repeat].length)) }));
    }
    const skip = h("button", { type: "button", class: "btn", text: t("guide.leaveEmpty") });
    const another = h("button", { type: "button", class: "btn", text: t("guide.another") });
    const next = h("button", { type: "button", class: "btn-primary", text: index === steps.length - 1 ? t("guide.toColours") : t("guide.next") });
    if (!step.repeat) another.hidden = true;
    function refreshSkip() {
        const values = readGuideInputs();
        const typed = Object.keys(values).some(function (key) { return String(values[key] || "").trim(); });
        skip.textContent = typed ? t("guide.skip") : t("guide.leaveEmpty");
    }
    skip.addEventListener("click", function () {
        if (index >= steps.length - 1) {
            if (step.repeat) commitRepeat(step);
            else storeGuideStep();
            showSetupStep(3);
            syncRoute("push");
            focusPaletteCard();
            return;
        }
        moveGuide(1);
    });
    another.addEventListener("click", function () {
        commitRepeat(step);
        renderGuide();
    });
    next.addEventListener("click", pressGuidePrimary);
    host.appendChild(h("div", { class: "guide-actions" }, [skip, another, next]));
    host.querySelectorAll("input, textarea").forEach(function (input) {
        input.addEventListener("input", refreshSkip);
    });
    refreshSkip();
    const first = host.querySelector("input, textarea");
    if (first) {
        first.focus();
        if (first.setSelectionRange) first.setSelectionRange(first.value.length, first.value.length);
    }
}

function focusPaletteCard() {
    const card = document.querySelector("#view-setup [data-palette].is-selected") || document.querySelector("#view-setup [data-palette]");
    if (card) card.focus();
}

function pressGuidePrimary() {
    const steps = guidePlan();
    const index = Math.max(0, Math.min(setupState.guideIndex || 0, steps.length - 1));
    const step = steps[index];
    if (!step) return;
    if (step.repeat) commitRepeat(step);
    if (index >= steps.length - 1) {
        if (!step.repeat) storeGuideStep();
        showSetupStep(3);
        syncRoute("push");
        focusPaletteCard();
        return;
    }
    moveGuide(1);
}

function moveGuide(delta) {
    storeGuideStep();
    setupState.guideIndex = (setupState.guideIndex || 0) + delta;
    renderGuide();
    if (delta > 0) syncRoute("push");
}

function guideLines(text) {
    return String(text || "").split(/\n/).map(function (line) { return line.trim(); }).filter(Boolean);
}

function guideHtml(value) {
    const raw = String(value || "").trim();
    return raw ? textToHtml(raw) : "";
}

function guideFilled(value) {
    return String(value || "").trim().length > 0;
}

function buildGuideDocument() {
    const kind = setupState.kind === "letter" ? "letter" : "cv";
    const answers = setupState.answers || blankGuide();
    const side = [
        block("name", { html: guideFilled(answers.name) ? nameToHtml(answers.name.replace(/\n/g, "<br>")) : "" }),
        block("role", { html: guideHtml(answers.role) })
    ];
    const contactKeys = ["city", "phone", "email", "born"];
    const contacts = contactKeys.filter(function (key) { return guideFilled(answers[key]); });
    if (contacts.length) {
        side.push(barHeading("doc.contact"));
        contacts.forEach(function (key) {
            side.push(block("contact", { labelKey: key, label: "", html: guideHtml(answers[key]) }));
        });
    }
    const skills = guideLines(answers.skills);
    if (skills.length) {
        side.push(barHeading("doc.skills"));
        skills.forEach(function (skill) { side.push(block("skill", { html: textToHtml(skill) })); });
    }
    const projects = (answers.projects || []).filter(function (item) {
        return guideFilled(item.title) || guideFilled(item.body);
    });
    if (projects.length) {
        side.push(barHeading("doc.projects"));
        projects.forEach(function (item) {
            side.push(block("project", { title: guideHtml(item.title), body: guideHtml(item.body) }));
        });
    }
    const strengths = (answers.strengths || []).filter(function (item) {
        return guideFilled(item.title) || guideFilled(item.body);
    });
    if (strengths.length) {
        side.push(barHeading("doc.strengths"));
        strengths.forEach(function (item) {
            side.push(block("competence", { title: guideHtml(item.title), body: guideHtml(item.body) }));
        });
    }
    const main = [];
    if (kind === "letter") {
        main.push(makeLetterhead(guideHtml(answers.date), guideHtml(answers.to), guideHtml(answers.subject), ""));
    }
    if (guideFilled(answers.intro)) {
        if (kind !== "letter") main.push(barHeading("doc.profile"));
        main.push(block("intro", { html: guideHtml(answers.intro) }));
    }
    if (kind === "letter") {
        const parts = String(answers.body || "").split(/\n{2,}/).map(function (part) { return part.trim(); }).filter(Boolean);
        if (parts.length) parts.forEach(function (part) { main.push(block("paragraph", { html: textToHtml(part) })); });
        else main.push(block("paragraph", { html: "" }));
    }
    const jobs = (answers.jobs || []).filter(function (item) {
        return guideFilled(item.title) || guideFilled(item.date) || guideFilled(item.org) || guideFilled(item.points);
    });
    if (jobs.length) {
        main.push(barHeading("doc.work"));
        jobs.forEach(function (item) {
            const points = guideLines(item.points);
            main.push(block("timeline", {
                title: guideHtml(item.title),
                date: guideHtml(item.date),
                org: guideHtml(item.org),
                items: (points.length ? points : [""]).map(textToHtml)
            }));
        });
    }
    const studies = (answers.studies || []).filter(function (item) {
        return guideFilled(item.title) || guideFilled(item.date) || guideFilled(item.org) || guideFilled(item.points);
    });
    if (studies.length) {
        main.push(barHeading("doc.education"));
        studies.forEach(function (item) {
            const points = guideLines(item.points);
            main.push(block("timeline", {
                title: guideHtml(item.title),
                date: guideHtml(item.date),
                org: guideHtml(item.org),
                items: (points.length ? points : [""]).map(textToHtml)
            }));
        });
    }
    if (kind === "letter") {
        main.push(block("closing", { paragraphs: [guideHtml(answers.closing)] }));
        main.push(block("signature", { html: guideHtml(answers.sign || answers.name) }));
    }
    return {
        version: 1,
        lang: lang,
        kind: kind,
        theme: kind === "letter" ? letterTheme() : cvTheme(),
        sidebar: side,
        main: main
    };
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Which setup step is showing, and creating the document from that choice. */

function showSetupStep(step) {
    setupState.step = step < 1 ? 1 : step;
    document.querySelectorAll(".setup-step").forEach(function (node) {
        node.hidden = Number(node.dataset.setupStep) !== setupState.step;
    });
    document.querySelectorAll("#setup-dots span").forEach(function (dot, index) {
        dot.classList.toggle("is-current", index === setupState.step - 1);
        dot.classList.toggle("is-done", index < setupState.step - 1);
    });
    const kicker = document.getElementById("setup-kicker");
    if (kicker) kicker.textContent = t("setup.step").replace("{n}", String(setupState.step)) + " · " + t("shell.kicker");
    document.querySelectorAll("#view-setup [data-kind]").forEach(function (button) {
        button.classList.toggle("is-selected", button.dataset.kind === setupState.kind);
    });
    document.querySelectorAll("#view-setup [data-source]").forEach(function (button) {
        button.classList.toggle("is-selected", button.dataset.source === setupState.source);
    });
    document.querySelectorAll("#view-setup [data-palette]").forEach(function (button) {
        button.classList.toggle("is-selected", button.dataset.palette === setupState.palette);
    });
    const pasteWrap = document.getElementById("setup-paste-wrap");
    if (pasteWrap) pasteWrap.hidden = !(setupState.step === 2 && setupState.source === "paste");
    const guide = document.getElementById("setup-guide");
    if (guide) guide.hidden = !(setupState.step === 2 && setupState.source === "guided");
    const model = document.getElementById("setup-model");
    if (model) model.hidden = !(setupState.step === 2 && setupState.source === "model");
    const sourceWrap = document.getElementById("setup-source");
    const sourceOpen = setupState.step === 2 && (setupState.source === "guided" || setupState.source === "model" || setupState.source === "paste");
    if (sourceWrap) sourceWrap.hidden = sourceOpen;
    if (setupState.step === 2 && setupState.source === "guided") renderGuide();
    const back = document.getElementById("setup-back");
    const cont = document.getElementById("setup-continue");
    const generate = document.getElementById("setup-generate");
    if (back) back.hidden = setupState.step === 1;
    if (cont) cont.hidden = !(setupState.step === 2 && (setupState.source === "paste" || setupState.source === "model"));
    if (generate) generate.hidden = setupState.step !== 3;
    const custom = document.getElementById("setup-custom");
    if (custom) custom.hidden = setupState.palette !== "custom";
    const backToDoc = document.getElementById("setup-return");
    const replaceNote = document.getElementById("setup-replace-note");
    const actions = document.querySelector(".setup-actions");
    const nav = document.querySelector(".setup-nav");
    if (setupState.step === 1 && actions) {
        if (backToDoc) actions.appendChild(backToDoc);
        if (replaceNote) actions.appendChild(replaceNote);
    } else if (nav && cont) {
        if (backToDoc) nav.insertBefore(backToDoc, cont);
        if (replaceNote) nav.insertBefore(replaceNote, cont);
    }
    if (backToDoc) backToDoc.hidden = !setupReturn;
    if (replaceNote) replaceNote.hidden = !setupReturn;
    if (nav) {
        nav.hidden = !Array.prototype.some.call(nav.children, function (node) {
            return node.tagName === "BUTTON" && !node.hidden;
        });
    }
    paintPalettePreview();
    paintContrastWarning();
}

function armControl(button, action) {
    if (!button.dataset.armed) {
        button.dataset.armed = "1";
        button.textContent = t("ui.replaceArmed");
        window.setTimeout(function () {
            if (!button.dataset.armed) return;
            button.dataset.armed = "";
            button.textContent = t(button.dataset.i18n || "ui.replaceArmed");
        }, 8000);
        return;
    }
    button.dataset.armed = "";
    button.textContent = t(button.dataset.i18n || "ui.replaceArmed");
    action();
}

function resetAll(button) {
    if (!button.dataset.armed) {
        button.dataset.armed = "1";
        button.textContent = t("ui.resetArmed");
        window.setTimeout(function () {
            if (!button.dataset.armed) return;
            button.dataset.armed = "";
            button.textContent = t("ui.reset");
        }, 8000);
        return;
    }
    button.dataset.armed = "";
    button.textContent = t("ui.reset");
    try {
        localStorage.removeItem(STORAGE_DOC);
        localStorage.removeItem(STORAGE_NAME);
    } catch (error) { /* private mode */ }
    clearSaves();
    past = [];
    future = [];
    selectedId = null;
    filenameCustom = false;
    doc = emptyCv();
    normalize(doc);
    const name = document.getElementById("pdf-name");
    if (name) name.value = "";
    const loose = document.getElementById("loose-text");
    if (loose) loose.value = "";
    const llm = document.getElementById("llm-input");
    if (llm) llm.value = "";
    showError("");
    showStatus("");
    documentLive = false;
    resetSetup();
    setupReturn = false;
    syncHistoryButtons();
    setPhase("setup");
    syncRoute("push");
}

function resetSetup() {
    setupState = { step: 1, kind: "", source: "", palette: "", guideIndex: 0, answers: null };
    const paste = document.getElementById("setup-paste");
    if (paste) paste.value = "";
    const model = document.getElementById("setup-model-text");
    if (model) model.value = "";
}

function modelTemplate() {
    return modelBundle("guide");
}

function setupMessage(message, isError) {
    const box = document.getElementById("setup-message");
    if (!box) return;
    box.hidden = !message;
    box.textContent = message || "";
    box.className = isError ? "error" : "note";
}

function openFromText(text) {
    const kind = setupState.kind === "letter" ? "letter" : "cv";
    const theme = Object.assign({}, kind === "letter" ? letterTheme() : cvTheme(), activePalette());
    const raw = String(text || "");
    const previous = doc;
    let built = null;
    try {
        if (raw.indexOf("@@@") >= 0) {
            doc = { version: 1, lang: lang, kind: kind, theme: theme, sidebar: [], main: [] };
            applyMarked(raw);
            doc.theme = theme;
        } else {
            const data = parseLoose(raw, kind);
            built = kind === "letter" ? buildLetterData(data) : buildCvData(data);
            built.kind = kind;
            built.theme = theme;
        }
    } catch (error) {
        doc = previous;
        throw error;
    }
    currentSaveId = "";
    setupReturn = false;
    setPhase("studio");
    if (built) installDocument(built, false);
    else {
        applyTheme();
        render();
        save();
    }
    documentLive = true;
    toggleDrawer(false);
    syncRoute("push");
}

function chooseKind(kind) {
    setupState.kind = kind === "letter" ? "letter" : "cv";
    setupState.palette = setupState.kind === "letter" ? "groen" : "zakelijk";
    const palette = PALETTES[setupState.palette];
    document.getElementById("setup-sidebar").value = palette.sidebar;
    document.getElementById("setup-accent").value = palette.accent;
    document.getElementById("setup-page").value = palette.page;
    document.getElementById("setup-text").value = palette.text;
    showSetupStep(2);
    syncRoute("push");
}

function chooseSource(source) {
    if (source === "paste") {
        askChrome(document.getElementById("chrome-gate"), function () {
            setupState.source = "paste";
            showSetupStep(2);
            const box = document.getElementById("setup-paste");
            if (box) box.focus();
            syncRoute("push");
        });
        return;
    }
    setupState.source = source;
    if (source === "guided") {
        setupState.guideIndex = 0;
        setupState.answers = blankGuide();
        showSetupStep(2);
        syncRoute("push");
        return;
    }
    if (source === "model") {
        showSetupStep(2);
        const box = document.getElementById("setup-model-text");
        if (box) {
            box.value = modelTemplate();
            box.focus();
            box.setSelectionRange(0, 0);
            box.scrollTop = 0;
        }
        syncRoute("push");
        return;
    }
    showSetupStep(2);
    syncRoute("replace");
    showSetupStep(3);
    syncRoute("push");
}

function choosePalette(name) {
    setupState.palette = name;
    if (name !== "custom" && PALETTES[name]) {
        document.getElementById("setup-sidebar").value = PALETTES[name].sidebar;
        document.getElementById("setup-accent").value = PALETTES[name].accent;
        document.getElementById("setup-page").value = PALETTES[name].page;
        document.getElementById("setup-text").value = PALETTES[name].text;
    }
    showSetupStep(3);
    syncRoute("replace");
}

function generateDocument() {
    const kind = setupState.kind === "letter" ? "letter" : "cv";
    let next;
    if (setupState.source === "demo") next = kind === "letter" ? demoLetter() : demoCv();
    else if (setupState.source === "guided") next = buildGuideDocument();
    else     if (setupState.source === "model") {
        try {
            openFromText(document.getElementById("setup-model-text").value);
            setupMessage("");
            setupReturn = false;
        } catch (error) {
            setupMessage(error && error.message ? error.message : t("ui.parseError"), true);
            showSetupStep(2);
        }
        return;
    } else if (setupState.source === "paste") {
        const text = document.getElementById("setup-paste").value;
        const data = parseLoose(text, kind);
        next = kind === "letter" ? buildLetterData(data) : buildCvData(data);
    } else next = kind === "letter" ? emptyLetter() : emptyCv();
    next.kind = kind;
    next.theme = Object.assign({}, kind === "letter" ? letterTheme() : cvTheme(), activePalette());
    setupReturn = false;
    setPhase("studio");
    installDocument(next, false);
    toggleDrawer(false);
    syncRoute("push");
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The homepage, the editor, and which pane is open on a narrow screen. */

function placeSiteFoot(phase) {
    const foot = document.getElementById("site-foot");
    const setup = document.getElementById("view-setup");
    if (!foot || !setup) return;
    if (phase === "studio") document.body.appendChild(foot);
    else setup.appendChild(foot);
}

function setPhase(phase) {
    document.body.dataset.phase = phase;
    const setup = document.getElementById("view-setup");
    const studio = document.getElementById("studio");
    if (setup) setup.hidden = phase !== "setup";
    placeSiteFoot(phase);
    if (studio) {
        studio.hidden = phase !== "studio";
        if (phase === "studio") studio.setAttribute("role", "main");
        else studio.removeAttribute("role");
    }
    const stage = document.getElementById("stage");
    const home = document.getElementById("studio-stage");
    if (stage && home && stage.parentElement !== home) home.appendChild(stage);
    if (phase !== "studio") {
        document.body.classList.remove("has-selection");
        const bar = document.getElementById("floatbar");
        if (bar) bar.hidden = true;
    }
    if (phase === "setup") showSetupStep(setupState.step || 1);
    refreshIdentity();
    requestAnimationFrame(function () {
        if (phase === "studio" && !zoomTouched) fitStage();
        else updatePageGuides();
        positionFloatbar();
    });
}

function narrowStudio() {
    return window.matchMedia("(max-width: 980px)").matches;
}

function setStudioPane(name) {
    const next = name === "library" || name === "settings" ? name : "page";
    document.body.dataset.pane = next;
    document.querySelectorAll("#pane-switch [data-pane]").forEach(function (button) {
        const on = button.dataset.pane === next;
        button.classList.toggle("is-active", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const drawer = document.getElementById("drawer");
    if (drawer && "inert" in drawer && narrowStudio()) drawer.inert = next !== "settings";
    requestAnimationFrame(function () {
        if (document.body.dataset.phase !== "studio") return;
        if (!zoomTouched) fitStage();
        else updatePageGuides();
        positionFloatbar();
    });
}

function toggleDrawer(forceOpen) {
    const drawer = document.getElementById("drawer");
    if (!drawer) return;
    if (narrowStudio()) {
        const open = typeof forceOpen === "boolean" ? forceOpen : document.body.dataset.pane !== "settings";
        setStudioPane(open ? "settings" : "page");
        return;
    }
    const open = typeof forceOpen === "boolean" ? forceOpen : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    if ("inert" in drawer) drawer.inert = !open;
    requestAnimationFrame(function () {
        if (!zoomTouched) fitStage();
        else updatePageGuides();
        positionFloatbar();
    });
}


/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* The step URLs and the back button. */

function normalizePath(path) {
    let value = path || "/";
    if (value.length > 1 && value.charAt(value.length - 1) === "/") value = value.slice(0, -1);
    if (value === "/index.html") return "/";
    return value;
}

function routePath() {
    if (document.body.dataset.phase === "studio") return "/editor";
    const step = setupState.step < 1 ? 1 : setupState.step;
    if (step === 1) return "/step-1";
    if (step === 2) return "/step-2";
    return "/step-3";
}

function routeState() {
    const sidebar = document.getElementById("setup-sidebar");
    return {
        phase: document.body.dataset.phase || "setup",
        step: setupState.step || 1,
        kind: setupState.kind || "",
        source: setupState.source || "",
        palette: setupState.palette || "",
        guideIndex: setupState.guideIndex || 0,
        colors: sidebar ? {
            sidebar: sidebar.value,
            accent: document.getElementById("setup-accent").value,
            page: document.getElementById("setup-page").value,
            text: document.getElementById("setup-text").value
        } : null
    };
}

function syncRoute(mode) {
    if (routeLock) return;
    try {
        const path = routePath();
        const state = routeState();
        const here = normalizePath(location.pathname);
        if (mode === "push") {
            const prev = history.state;
            if (here === path && prev && prev.phase === state.phase && prev.step === state.step && prev.source === state.source && (prev.guideIndex || 0) === (state.guideIndex || 0) && prev.kind === state.kind) return;
            history.pushState(state, "", path);
            return;
        }
        history.replaceState(state, "", path);
    } catch (error) { /* a file URL has no history to replace */ }
}

function applyRouteColors(colors) {
    if (!colors) return;
    const map = {
        "setup-sidebar": colors.sidebar,
        "setup-accent": colors.accent,
        "setup-page": colors.page,
        "setup-text": colors.text
    };
    Object.keys(map).forEach(function (id) {
        const input = document.getElementById(id);
        if (input && map[id]) input.value = map[id];
    });
}

function applyRouteState(state) {
    routeLock = true;
    try {
        if (!state || state.phase === "studio") {
            if (!documentLive) {
                resetSetup();
                setupReturn = false;
                setPhase("setup");
                history.replaceState(routeState(), "", routePath());
                return;
            }
            setupReturn = false;
            setPhase("studio");
            return;
        }
        let step = state.step || 1;
        const kind = state.kind || "";
        const source = state.source || "";
        if (step > 1 && !kind) step = 1;
        if (step > 2 && !source) step = 2;
        setupState.kind = kind;
        setupState.source = step > 1 ? source : "";
        setupState.palette = state.palette || "";
        setupState.guideIndex = state.guideIndex || 0;
        setupState.step = step;
        applyRouteColors(state.colors);
        setupReturn = documentLive;
        setPhase("setup");
        if (step !== (state.step || 1) || (step > 1 && !kind) || (step > 2 && !source)) {
            history.replaceState(routeState(), "", routePath());
        }
    } finally {
        routeLock = false;
    }
}

const CATALOG = {
    "nursing-cv": "@@@CV\nNAME: Noor<br>El Amrani\nROLE: Registered nurse\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 92\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Example City\nPHONE: +31 6 0000 0001\nEMAIL: noor@example.com\nBORN: 01-01-1992 (34)\nLABEL: Registration\nVALUE: Example Nursing Board, number EX-0000\n@@@SKILLS\nPOINT: Handover\nPOINT: Shift notes\nPOINT: Student supervision\n@@@STRENGTHS\nPOINT: Night handover: Leaves a note the next shift can read in two minutes.\nPOINT: Steady lists: Keeps wards and shifts in two short lists, not a slogan.\n@@@PROJECTS\nPOINT: Medical admissions: 28 beds, including the night handover.\nPOINT: Day clinic: Wound reviews, twice a week.\n@@@PROFILE\nNoor El Amrani is a made-up registered nurse from Example City. This CV belongs to nobody. The registration sits in the sidebar. Wards and shifts sit on the page. The number EX-0000 is not a real registration, and this page does not give clinical advice.\n@@@LETTERHEAD\nTITLE:\nDATE: Example City, 31 October 2026\nTO: Example Ward<br>For the hiring team<br>Example Street 1<br>Example City\nSUBJECT: Application as a registered nurse, a made-up vacancy\n@@@JOB\nTITLE: Registered nurse\nDATE: 2022 – 2024\nORGANIZATION: Example Medical Ward\nPOINT: Kept the ward list to admissions, beds and the night handover.\nPOINT: Left the day clinic on the list as two sessions a week.\n@@@JOB\nTITLE: Charge nurse\nDATE: 2020 – 2022\nORGANIZATION: Example Day Clinic\nPOINT: Charge nurse on a Sunday, when the team was short.\nPOINT: Student supervision on the early shift.\n@@@STUDY\nTITLE: Nursing\nDATE: 2016 – 2020\nORGANIZATION: Example University\nPOINT: A classroom placement on a ward that exists only in this CV.\n@@@STUDY\nTITLE: Foundation year\nDATE: 2015 – 2016\nORGANIZATION: Example College\nPOINT: Lists, handover notes and a first practice ward.\n@@@PARAGRAPH\nThe organisations named here exist only in this example.\n@@@LIST\nPOINT: Medical admissions, 28 beds, including the night handover.\nPOINT: A day clinic for wound reviews, twice a week.\nPOINT: Student supervision on the early shift.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nThis example is not a real application.\nSIGN: Noor El Amrani\n@@@THEME\nSIDEBAR: #14532d\nSIDEBARTEXT: #f0fdf4\nACCENT: #047857\nACCENTLIGHT: #6ee7b7\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "nursing-letter": "@@@LETTER\nNAME: Noor<br>El Amrani\nROLE: Registered nurse\nTITLE: Motivation letter\nDATE: Example City, 31 October 2026\nTO: Example Ward<br>For the hiring team<br>Example Street 1<br>Example City\nSUBJECT: Application as a registered nurse, a made-up vacancy\nSUMMARY: Noor El Amrani is a made-up registered nurse. This letter belongs to nobody, the vacancy is invented, and it does not give clinical advice.\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 64\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Example City\nPHONE: +31 6 0000 0001\nEMAIL: noor@example.com\nBORN:\nLABEL: Registration\nVALUE: Example Nursing Board, number EX-0000\n@@@SKILLS\nPOINT: Handover\nPOINT: Shift notes\nPOINT: Student supervision\n@@@STRENGTHS\nPOINT: Night handover: Leaves a note the next shift can read in two minutes.\nPOINT: Steady lists: Keeps wards and shifts in two short lists, not a slogan.\n@@@PROJECTS\nPOINT: Medical admissions: 28 beds, including the night handover.\nPOINT: Day clinic: Wound reviews, twice a week.\n@@@PARAGRAPH\nDear hiring team,\n@@@SECTION\nHEADING: The ward, then the shift\nBODY: I put the registration on the first lines and the work under it. At Example Medical Ward, which exists only in this letter, the list was admissions, a night handover, and a day clinic twice a week.\n@@@SECTION\nHEADING: When the team is short\nBODY: On a made-up Sunday I was the charge nurse. The example is only here to show a shift line. It is not clinical advice.\n@@@LIST\nPOINT: Admissions, beds and a night handover on one list.\nPOINT: A day clinic twice a week.\nPOINT: A Sunday charge when the team was short.\n@@@JOB\nTITLE: Registered nurse\nDATE: 2022 – 2024\nORGANIZATION: Example Medical Ward\nPOINT: Kept the ward list to admissions, beds and the night handover.\n@@@JOB\nTITLE: Charge nurse\nDATE: 2020 – 2022\nORGANIZATION: Example Day Clinic\nPOINT: Charge nurse on a Sunday, when the team was short.\n@@@STUDY\nTITLE: Nursing\nDATE: 2016 – 2020\nORGANIZATION: Example University\nPOINT: A classroom placement on a ward that exists only in this letter.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nI will gladly explain this made-up application in a meeting that also does not exist.\nSIGN: Noor El Amrani\n@@@THEME\nSIDEBAR: #14532d\nSIDEBARTEXT: #f0fdf4\nACCENT: #047857\nACCENTLIGHT: #6ee7b7\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "publieksdienst-letter": "@@@LETTER\nNAME: Noa<br>de Vries\nROLE: Medewerker publieksdienst\nTITLE: Motivatiebrief\nDATE: Utrecht, 31 oktober 2026\nTO: Bibliotheek aan de Werf<br>Ter attentie van de balie\nSUBJECT: medewerker publieksdienst\nSUMMARY: Noa de Vries is verzonnen. Deze brief laat de volgorde van een motivatiebrief zien. De bibliotheek is verzonnen.\n@@@PARAGRAPH\nMensen vragen zelden om de catalogus. Ze vragen of een boek er is, of de zaal nog vrij is, en of hun kaart het doet. Dat werk doe ik graag, en ik schrijf de korte briefjes op de balie die iemand in één oogopslag snapt.\n@@@PARAGRAPH\nIk werk nu in een kleine uitleenbalie. Ik wil datzelfde doen in een grotere zaal.\n@@@CLOSING\nMet vriendelijke groet,\nSIGN: Noa de Vries\n@@@THEME\nSIDEBAR: #f4f4f5\nSIDEBARTEXT: #18181b\nACCENT: #18181b\nACCENTLIGHT: #18181b\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: lora\n@@@END",
    "software-engineer-cv": "@@@CV\nNAME: Rae<br>Okonkwo\nROLE: Software engineer\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 92\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Example City\nPHONE: +31 6 0000 0000\nEMAIL: rae@example.com\nBORN: 01-01-1994 (32)\n@@@SKILLS\nPOINT: TypeScript\nPOINT: Python\nPOINT: Tests and reviews\n@@@STRENGTHS\nPOINT: Clear reviews: Writes the comment once so the next review is shorter.\nPOINT: Structure: Puts a slow query into one sentence a teammate can test.\n@@@PROJECTS\nPOINT: Catalogue search: Stayed under a second after the collection passed a million rows.\nPOINT: Review checklist: Cut the repeat comments on pull requests.\n@@@PROFILE\nRae Okonkwo is a made-up software engineer from Example City. This CV belongs to nobody. Tools sit in the sidebar. Projects, with a result, sit on the page.\n@@@LETTERHEAD\nTITLE:\nDATE: Example City, 31 October 2026\nTO: Example Organisation<br>For the hiring team<br>Example Street 1<br>Example City\nSUBJECT: Application as a software engineer, a made-up vacancy\n@@@JOB\nTITLE: Software engineer\nDATE: 2022 – 2024\nORGANIZATION: Example Catalogue Ltd\nPOINT: Shipped a search path that stayed under a second after a million made-up rows.\nPOINT: Tested the slow queries before they reached the night job.\n@@@JOB\nTITLE: Software engineer\nDATE: 2020 – 2022\nORGANIZATION: Example Bureau\nPOINT: Wrote a review checklist that cut the repeat comments on pull requests.\nPOINT: Kept the notes when a made-up team changed the plan the same afternoon.\n@@@STUDY\nTITLE: Computer science\nDATE: 2016 – 2020\nORGANIZATION: Example University\nPOINT: A graduation project about a search index that never left the classroom.\n@@@STUDY\nTITLE: Foundation year\nDATE: 2015 – 2016\nORGANIZATION: Example College\nPOINT: Type, tests and a first practice site.\n@@@PARAGRAPH\nThe organisations named here exist only in this example.\n@@@LIST\nPOINT: The search result is one sentence a stranger can check.\nPOINT: The review checklist is one page.\nPOINT: The practice site belonged to a team that was never real.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nThis example is not a real application.\nSIGN: Rae Okonkwo\n@@@THEME\nSIDEBAR: #1e293b\nSIDEBARTEXT: #f8fafc\nACCENT: #0284c7\nACCENTLIGHT: #38bdf8\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "software-engineer-letter": "@@@LETTER\nNAME: Rae<br>Okonkwo\nROLE: Software engineer\nTITLE: Motivation letter\nDATE: Example City, 31 October 2026\nTO: Example Organisation<br>For the hiring team<br>Example Street 1<br>Example City\nSUBJECT: Application as a software engineer, a made-up vacancy\nSUMMARY: Rae Okonkwo is a made-up software engineer. This letter belongs to nobody and the vacancy is invented.\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 64\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Example City\nPHONE: +31 6 0000 0000\nEMAIL: rae@example.com\nBORN:\n@@@SKILLS\nPOINT: TypeScript\nPOINT: Python\nPOINT: Tests and reviews\n@@@STRENGTHS\nPOINT: Clear reviews: Writes the comment once so the next review is shorter.\nPOINT: Structure: Puts a slow query into one sentence a teammate can test.\n@@@PROJECTS\nPOINT: Catalogue search: Stayed under a second after the collection passed a million rows.\nPOINT: Review checklist: Cut the repeat comments on pull requests.\n@@@PARAGRAPH\nDear hiring team,\n@@@SECTION\nHEADING: A question, then the page\nBODY: I start with what was slow or unclear. At Example Catalogue Ltd, a company that exists only in this letter, I shipped a search path that stayed under a second after a million made-up rows.\n@@@SECTION\nHEADING: Reviews a teammate can follow\nBODY: At Example Bureau the checklist was for a team that was never real. Write the comment once, then the repeats get shorter.\n@@@LIST\nPOINT: A search result a stranger can check in one sentence.\nPOINT: A review checklist of one page.\nPOINT: Notes that still match after the page is saved.\n@@@JOB\nTITLE: Software engineer\nDATE: 2022 – 2024\nORGANIZATION: Example Catalogue Ltd\nPOINT: Shipped a search path that stayed under a second after a million made-up rows.\n@@@JOB\nTITLE: Software engineer\nDATE: 2020 – 2022\nORGANIZATION: Example Bureau\nPOINT: Wrote a review checklist that cut the repeat comments on pull requests.\n@@@STUDY\nTITLE: Computer science\nDATE: 2016 – 2020\nORGANIZATION: Example University\nPOINT: A graduation project about a search index that never left the classroom.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nI will gladly explain this made-up application in a meeting that also does not exist.\nSIGN: Rae Okonkwo\n@@@THEME\nSIDEBAR: #1e293b\nSIDEBARTEXT: #f8fafc\nACCENT: #0284c7\nACCENTLIGHT: #38bdf8\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "softwareontwikkelaar-cv": "@@@CV\nNAME: Pim<br>Vogel\nROLE: Softwareontwikkelaar\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 92\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Voorbeeldstad\nPHONE: +31 6 0000 0002\nEMAIL: pim@example.com\nBORN: 01-01-1995 (31)\n@@@SKILLS\nPOINT: TypeScript\nPOINT: Python\nPOINT: Tests en reviews\n@@@STRENGTHS\nPOINT: Heldere reviews: Schrijft de opmerking één keer, zodat de volgende review korter is.\nPOINT: Structuur: Zet een trage query in één zin die een teamgenoot kan testen.\n@@@PROJECTS\nPOINT: Cataloguszoeken: Bleef onder een seconde nadat de verzameling een miljoen rijen telde.\nPOINT: Reviewlijst: Bracht de herhaalde opmerkingen op pull requests terug.\n@@@PROFILE\nPim Vogel is een verzonnen softwareontwikkelaar uit Voorbeeldstad. Dit cv hoort bij niemand. Het gereedschap staat in de zijbalk. De projecten, met een resultaat, staan op de pagina.\n@@@LETTERHEAD\nTITLE:\nDATE: Voorbeeldstad, 31 oktober 2026\nTO: Voorbeeld Organisatie<br>Aan het team<br>Voorbeeldstraat 1<br>Voorbeeldstad\nSUBJECT: Sollicitatie als softwareontwikkelaar, een verzonnen vacature\n@@@JOB\nTITLE: Softwareontwikkelaar\nDATE: 2022 – 2024\nORGANIZATION: Voorbeeldcatalogus BV\nPOINT: Leverde een zoekpad dat onder een seconde bleef na een miljoen verzonnen rijen.\nPOINT: Testte de trage queries voordat ze in de nachtelijke taak kwamen.\n@@@JOB\nTITLE: Softwareontwikkelaar\nDATE: 2020 – 2022\nORGANIZATION: Voorbeeldbureau\nPOINT: Schreef een reviewlijst die de herhaalde opmerkingen op pull requests terugbracht.\nPOINT: Hield de notities bij toen een verzonnen team dezelfde middag het plan wijzigde.\n@@@STUDY\nTITLE: Informatica\nDATE: 2016 – 2020\nORGANIZATION: Voorbeeld Hogeschool\nPOINT: Een afstudeerproject over een zoekindex die het lokaal nooit verliet.\n@@@STUDY\nTITLE: Basisjaar\nDATE: 2015 – 2016\nORGANIZATION: Voorbeeld College\nPOINT: Typografie, tests en een eerste oefensite.\n@@@PARAGRAPH\nDe organisaties in dit voorbeeld bestaan alleen hier.\n@@@LIST\nPOINT: Het zoekresultaat is één zin die een buitenstaander kan nagaan.\nPOINT: De reviewlijst is één bladzijde.\nPOINT: De oefensite hoorde bij een team dat nooit heeft bestaan.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nDit voorbeeld is geen echte sollicitatie.\nSIGN: Pim Vogel\n@@@THEME\nSIDEBAR: #1e293b\nSIDEBARTEXT: #f8fafc\nACCENT: #0284c7\nACCENTLIGHT: #38bdf8\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "softwareontwikkelaar-letter": "@@@LETTER\nNAME: Pim<br>Vogel\nROLE: Softwareontwikkelaar\nTITLE: Motivatiebrief\nDATE: Voorbeeldstad, 31 oktober 2026\nTO: Voorbeeld Organisatie<br>Aan het team<br>Voorbeeldstraat 1<br>Voorbeeldstad\nSUBJECT: Sollicitatie als softwareontwikkelaar, een verzonnen vacature\nSUMMARY: Pim Vogel is een verzonnen softwareontwikkelaar. Deze brief hoort bij niemand en de vacature is verzonnen.\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 64\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Voorbeeldstad\nPHONE: +31 6 0000 0002\nEMAIL: pim@example.com\nBORN:\n@@@SKILLS\nPOINT: TypeScript\nPOINT: Python\nPOINT: Tests en reviews\n@@@STRENGTHS\nPOINT: Heldere reviews: Schrijft de opmerking één keer, zodat de volgende review korter is.\nPOINT: Structuur: Zet een trage query in één zin die een teamgenoot kan testen.\n@@@PROJECTS\nPOINT: Cataloguszoeken: Bleef onder een seconde nadat de verzameling een miljoen rijen telde.\nPOINT: Reviewlijst: Bracht de herhaalde opmerkingen op pull requests terug.\n@@@PARAGRAPH\nBeste team,\n@@@SECTION\nHEADING: Eerst de vraag, dan de pagina\nBODY: Ik begin bij wat traag of onduidelijk was. Bij Voorbeeldcatalogus BV, een bedrijf dat alleen in deze brief bestaat, leverde ik een zoekpad dat onder een seconde bleef na een miljoen verzonnen rijen.\n@@@SECTION\nHEADING: Reviews die een teamgenoot volgt\nBODY: Bij Voorbeeldbureau was de lijst voor een team dat nooit heeft bestaan. Eén opmerking, daarna minder herhaling.\n@@@LIST\nPOINT: Een zoekresultaat dat een buitenstaander in één zin nagaat.\nPOINT: Een reviewlijst van één bladzijde.\nPOINT: Notities die na het opslaan nog kloppen.\n@@@JOB\nTITLE: Softwareontwikkelaar\nDATE: 2022 – 2024\nORGANIZATION: Voorbeeldcatalogus BV\nPOINT: Leverde een zoekpad dat onder een seconde bleef na een miljoen verzonnen rijen.\n@@@JOB\nTITLE: Softwareontwikkelaar\nDATE: 2020 – 2022\nORGANIZATION: Voorbeeldbureau\nPOINT: Schreef een reviewlijst die de herhaalde opmerkingen op pull requests terugbracht.\n@@@STUDY\nTITLE: Informatica\nDATE: 2016 – 2020\nORGANIZATION: Voorbeeld Hogeschool\nPOINT: Een afstudeerproject over een zoekindex die het lokaal nooit verliet.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nIk licht deze verzonnen sollicitatie graag toe in een gesprek dat eveneens niet bestaat.\nSIGN: Pim Vogel\n@@@THEME\nSIDEBAR: #1e293b\nSIDEBARTEXT: #f8fafc\nACCENT: #0284c7\nACCENTLIGHT: #38bdf8\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "verpleegkundige-cv": "@@@CV\nNAME: Esmee<br>Hof\nROLE: Verpleegkundige\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 92\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Voorbeeldstad\nPHONE: +31 6 0000 0003\nEMAIL: esmee@example.com\nBORN: 01-01-1993 (33)\nLABEL: Registratie\nVALUE: Voorbeeldregister, nummer EX-0000\n@@@SKILLS\nPOINT: Overdracht\nPOINT: Dienstnotities\nPOINT: Begeleiding\n@@@STRENGTHS\nPOINT: Nachtelijke overdracht: Laat een notitie achter die de volgende dienst in twee minuten leest.\nPOINT: Korte lijsten: Houdt afdelingen en diensten in twee korte lijsten, niet in een slogan.\n@@@PROJECTS\nPOINT: Opnameafdeling: 28 bedden, inclusief de nachtelijke overdracht.\nPOINT: Dagkliniek: Wondcontroles, twee keer per week.\n@@@PROFILE\nEsmee Hof is een verzonnen verpleegkundige uit Voorbeeldstad. Dit cv hoort bij niemand. De registratie staat in de zijbalk. Afdelingen en diensten staan op de pagina. Het nummer EX-0000 is geen echte registratie, en dit cv geeft geen zorgadvies.\n@@@LETTERHEAD\nTITLE:\nDATE: Voorbeeldstad, 31 oktober 2026\nTO: Voorbeeldafdeling<br>Aan het team<br>Voorbeeldstraat 1<br>Voorbeeldstad\nSUBJECT: Sollicitatie als verpleegkundige, een verzonnen vacature\n@@@JOB\nTITLE: Verpleegkundige\nDATE: 2022 – 2024\nORGANIZATION: Voorbeeldafdeling\nPOINT: Hield de afdelingslijst bij opnames, bedden en de nachtelijke overdracht.\nPOINT: Liet de dagkliniek op de lijst staan als twee sessies per week.\n@@@JOB\nTITLE: Eerste verpleegkundige\nDATE: 2020 – 2022\nORGANIZATION: Voorbeelddagkliniek\nPOINT: Eerste verpleegkundige op een zondag, toen het team krap was.\nPOINT: Begeleiding van een student in de vroege dienst.\n@@@STUDY\nTITLE: Verpleegkunde\nDATE: 2016 – 2020\nORGANIZATION: Voorbeeld Hogeschool\nPOINT: Een stage in de klas op een afdeling die alleen in dit cv bestaat.\n@@@STUDY\nTITLE: Basisjaar\nDATE: 2015 – 2016\nORGANIZATION: Voorbeeld College\nPOINT: Lijsten, overdracht en een eerste oefenafdeling.\n@@@PARAGRAPH\nDe organisaties in dit voorbeeld bestaan alleen hier.\n@@@LIST\nPOINT: Opnameafdeling, 28 bedden, inclusief de nachtelijke overdracht.\nPOINT: Een dagkliniek voor wondcontroles, twee keer per week.\nPOINT: Begeleiding van een student in de vroege dienst.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nDit voorbeeld is geen echte sollicitatie.\nSIGN: Esmee Hof\n@@@THEME\nSIDEBAR: #14532d\nSIDEBARTEXT: #f0fdf4\nACCENT: #047857\nACCENTLIGHT: #6ee7b7\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "verpleegkundige-letter": "@@@LETTER\nNAME: Esmee<br>Hof\nROLE: Verpleegkundige\nTITLE: Motivatiebrief\nDATE: Voorbeeldstad, 31 oktober 2026\nTO: Voorbeeldafdeling<br>Aan het team<br>Voorbeeldstraat 1<br>Voorbeeldstad\nSUBJECT: Sollicitatie als verpleegkundige, een verzonnen vacature\nSUMMARY: Esmee Hof is een verzonnen verpleegkundige. Deze brief hoort bij niemand, de vacature is verzonnen, en zij geeft geen zorgadvies.\n@@@PHOTO\nCAPTION:\nASPECT: 3 / 4\nWIDTH: 64\nFILLED: yes\nURL:\n@@@CONTACT\nCITY: Voorbeeldstad\nPHONE: +31 6 0000 0003\nEMAIL: esmee@example.com\nBORN:\nLABEL: Registratie\nVALUE: Voorbeeldregister, nummer EX-0000\n@@@SKILLS\nPOINT: Overdracht\nPOINT: Dienstnotities\nPOINT: Begeleiding\n@@@STRENGTHS\nPOINT: Nachtelijke overdracht: Laat een notitie achter die de volgende dienst in twee minuten leest.\nPOINT: Korte lijsten: Houdt afdelingen en diensten in twee korte lijsten, niet in een slogan.\n@@@PROJECTS\nPOINT: Opnameafdeling: 28 bedden, inclusief de nachtelijke overdracht.\nPOINT: Dagkliniek: Wondcontroles, twee keer per week.\n@@@PARAGRAPH\nBeste team,\n@@@SECTION\nHEADING: Eerst de afdeling, dan de dienst\nBODY: Ik zet de registratie op de eerste regels en het werk daaronder. Op Voorbeeldafdeling, die alleen in deze brief bestaat, stonden de opnames, een nachtelijke overdracht en een dagkliniek twee keer per week.\n@@@SECTION\nHEADING: Als het team krap is\nBODY: Op een verzonnen zondag was ik de eerste verpleegkundige. Het voorbeeld staat hier alleen om een dienstregel te tonen. Het is geen zorgadvies.\n@@@LIST\nPOINT: Opnames, bedden en een nachtelijke overdracht op één lijst.\nPOINT: Een dagkliniek twee keer per week.\nPOINT: Een zondagdienst toen het team krap was.\n@@@JOB\nTITLE: Verpleegkundige\nDATE: 2022 – 2024\nORGANIZATION: Voorbeeldafdeling\nPOINT: Hield de afdelingslijst bij opnames, bedden en de nachtelijke overdracht.\n@@@JOB\nTITLE: Eerste verpleegkundige\nDATE: 2020 – 2022\nORGANIZATION: Voorbeelddagkliniek\nPOINT: Eerste verpleegkundige op een zondag, toen het team krap was.\n@@@STUDY\nTITLE: Verpleegkunde\nDATE: 2016 – 2020\nORGANIZATION: Voorbeeld Hogeschool\nPOINT: Een stage in de klas op een afdeling die alleen in deze brief bestaat.\n@@@SPACER\nSIZE: 12\n@@@CLOSING\nIk licht deze verzonnen sollicitatie graag toe in een gesprek dat eveneens niet bestaat.\nSIGN: Esmee Hof\n@@@THEME\nSIDEBAR: #14532d\nSIDEBARTEXT: #f0fdf4\nACCENT: #047857\nACCENTLIGHT: #6ee7b7\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: roboto\n@@@END",
    "visitor-letter": "@@@LETTER\nNAME: Sam<br>Ibarra\nROLE: Visitor services\nTITLE: Motivation letter\nDATE: Harbour City, 31 October 2026\nTO: Museum of everyday design<br>Hiring desk\nSUBJECT: the visitor-services role\nSUMMARY: Sam Ibarra is invented. This letter shows the order of a motivation letter. The museum is invented.\n@@@PARAGRAPH\nThe person at the desk should be able to explain an exhibition without turning it into a lecture. I have done that work in a small gallery, and I want to do it for you.\n@@@PARAGRAPH\nI can keep a busy Saturday calm, and I can write the short signs that people actually read.\n@@@CLOSING\nYours sincerely,\nSIGN: Sam Ibarra\n@@@THEME\nSIDEBAR: #f4f4f5\nSIDEBARTEXT: #18181b\nACCENT: #18181b\nACCENTLIGHT: #18181b\nPAGE: #ffffff\nTEXT: #334155\nSIZE: 9.5\nCOLUMN: 33\nFONT: lora\n@@@END"
};
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Named documents. CATALOG is filled from catalog/*.txt when the editor is built. */

function requestedTemplate() {
    try {
        const value = new URLSearchParams(location.search).get("template");
        if (value && Object.prototype.hasOwnProperty.call(CATALOG, value)) return value;
    } catch (error) { /* a file URL has no search to read */ }
    return "";
}

function templateLang(id) {
    if (id.indexOf("softwareontwikkelaar") === 0 || id.indexOf("verpleegkundige") === 0 || id.indexOf("publieksdienst") === 0) return "nl";
    return "en";
}

function openRequestedTemplate() {
    const id = requestedTemplate();
    if (!id) return false;
    if (!requestedLang()) lang = templateLang(id);
    doc = emptyCv();
    doc.lang = lang;
    doc.theme = cvTheme();
    normalize(doc);
    applyMarked(CATALOG[id]);
    currentSaveId = "";
    filenameCustom = false;
    documentLive = true;
    const name = document.getElementById("pdf-name");
    const person = plainName();
    if (name) name.value = person;
    try { localStorage.setItem(STORAGE_NAME, person); } catch (error) { /* ignore */ }
    return true;
}
/* CC0-1.0 — https://creativecommons.org/publicdomain/zero/1.0/ */
/* Startup: the stored document, then the setup and editor controls. */

function adoptRoute(fresh) {
    documentLive = !fresh;
    const path = normalizePath(location.pathname);
    routeLock = true;
    try {
        if (!fresh && (path === "/" || path === "/editor")) {
            setupReturn = false;
            setPhase("studio");
        } else if (!fresh && path === "/step-1") {
            resetSetup();
            setupReturn = true;
            setPhase("setup");
        } else {
            resetSetup();
            setupReturn = !fresh;
            setPhase("setup");
        }
        history.replaceState(routeState(), "", routePath());
    } catch (error) { /* keep the screen even if the URL cannot change */ }
    finally {
        routeLock = false;
    }
}
function bindSetup() {
    document.querySelectorAll("#view-setup [data-lang]").forEach(function (button) {
        button.addEventListener("click", function () { setLanguage(button.dataset.lang); });
    });
    document.querySelectorAll("#view-setup [data-kind]").forEach(function (button) {
        button.addEventListener("click", function () { chooseKind(button.dataset.kind); });
    });
    document.querySelectorAll("#view-setup [data-source]").forEach(function (button) {
        button.addEventListener("click", function () { chooseSource(button.dataset.source); });
    });
    document.querySelectorAll("#view-setup [data-palette]").forEach(function (button) {
        button.addEventListener("click", function () { choosePalette(button.dataset.palette); });
    });
    document.getElementById("setup-return").addEventListener("click", function () {
        setupReturn = false;
        setPhase("studio");
        syncRoute("push");
    });
    document.getElementById("setup-import").addEventListener("click", function () {
        const input = document.getElementById("pdf-file");
        if (input) input.click();
    });
    document.getElementById("zoom-fit").addEventListener("click", function () {
        zoomTouched = false;
        fitStage();
    });
    document.getElementById("setup-back").addEventListener("click", function () {
        history.back();
    });
    document.querySelectorAll("[data-copy]").forEach(function (button) {
        button.addEventListener("click", function () { copyModelText(button.dataset.copy, false); });
    });
    document.querySelectorAll("#crop-dialog [data-aspect]").forEach(function (button) {
        button.addEventListener("click", function () { markCropAspect(Number(button.dataset.aspect)); });
    });
    document.getElementById("crop-cancel").addEventListener("click", closePhotoCrop);
    document.getElementById("crop-apply").addEventListener("click", applyPhotoCrop);
    document.getElementById("crop-change").addEventListener("click", function () {
        if (photoTargetId) pickPhoto(photoTargetId);
    });
    const pageSize = document.getElementById("crop-page-size");
    pageSize.addEventListener("pointerdown", function () { photoWidthSnapped = false; });
    pageSize.addEventListener("input", function () {
        setPhotoWidth(findBlock(photoTargetId), pageSize.value, true);
    });
    pageSize.addEventListener("change", function () { photoWidthSnapped = false; });
    document.getElementById("crop-page-max").addEventListener("click", function () {
        photoWidthSnapped = false;
        setPhotoWidth(findBlock(photoTargetId), 100, true);
        photoWidthSnapped = false;
    });
    document.getElementById("crop-page-reset").addEventListener("click", function () {
        photoWidthSnapped = false;
        resetPhotoWidth(findBlock(photoTargetId));
        photoWidthSnapped = false;
    });
    const cropZoom = document.getElementById("crop-zoom");
    cropZoom.addEventListener("input", function () {
        if (!cropper) return;
        cropper.zoomTo(Number(cropZoom.value) / 100);
        syncCropZoom();
    });
    document.getElementById("crop-fit").addEventListener("click", fitCrop);
    document.getElementById("crop-fill").addEventListener("click", fillCrop);
    document.getElementById("crop-reset").addEventListener("click", resetCrop);
    const photoFile = document.getElementById("photo-file");
    photoFile.addEventListener("change", function () {
        const picked = photoFile.files && photoFile.files[0];
        photoFile.value = "";
        if (picked) readPhotoFile(picked);
    });
    document.getElementById("crop-dialog").addEventListener("click", function (event) {
        if (event.target.id === "crop-dialog") closePhotoCrop();
    });
    document.querySelectorAll("[data-chrome-go]").forEach(function (button) {
        button.addEventListener("click", allowChromeAndRun);
    });
    document.getElementById("setup-model-run").addEventListener("click", function () {
        askChrome(document.getElementById("setup-chrome-note"), function () {
            const text = document.getElementById("setup-model-text").value;
            setupMessage(t("guide.modelWorking"), false);
            const theme = Object.assign({}, setupState.kind === "letter" ? letterTheme() : cvTheme(), activePalette());
            doc.theme = theme;
            formatWithBrowserModel(text).then(function () {
                doc.theme = theme;
                applyTheme();
                setupReturn = false;
                setPhase("studio");
                save();
                toggleDrawer(false);
                syncRoute("push");
            }).catch(function () {
                try {
                    openFromText(text);
                    showStatus(t("guide.modelMissing"));
                } catch (error) {
                    setupMessage(error && error.message ? error.message : t("guide.modelMissing"), true);
                }
            });
        });
    });
    markChromeLimits();
    document.getElementById("setup-continue").addEventListener("click", function () {
        showSetupStep(3);
        syncRoute("push");
    });
    document.getElementById("setup-generate").addEventListener("click", generateDocument);
    ["setup-sidebar", "setup-accent", "setup-page", "setup-text"].forEach(function (id) {
        document.getElementById(id).addEventListener("input", function () {
            setupState.palette = "custom";
            showSetupStep(3);
            syncRoute("replace");
        });
    });
    document.addEventListener("keydown", function (event) {
        if (document.body.dataset.phase !== "setup" || event.key !== "Enter" || event.altKey || event.isComposing || event.keyCode === 229) return;
        const target = event.target;
        if (!target || !target.closest) return;
        const palette = target.closest("[data-palette]");
        if (palette && setupState.step === 3) {
            event.preventDefault();
            if (palette.dataset.palette === setupState.palette) generateDocument();
            else choosePalette(palette.dataset.palette);
            return;
        }
        const guide = target.closest("#setup-guide");
        if (guide && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
            const command = event.ctrlKey || event.metaKey;
            if (target.tagName === "TEXTAREA" && !command) return;
            event.preventDefault();
            const fields = Array.prototype.slice.call(guide.querySelectorAll("input, textarea"));
            const nextField = fields[fields.indexOf(target) + 1];
            if (nextField && !command) {
                nextField.focus();
                if (nextField.setSelectionRange) nextField.setSelectionRange(nextField.value.length, nextField.value.length);
                return;
            }
            if (guide.querySelector(".btn-primary")) pressGuidePrimary();
            return;
        }
        if (target.tagName === "TEXTAREA" && (event.ctrlKey || event.metaKey)) {
            const cont = document.getElementById("setup-continue");
            if (cont && !cont.hidden) {
                event.preventDefault();
                cont.click();
            }
        }
    }, true);
}

function bindStudio() {
    document.getElementById("preview").addEventListener("scroll", positionFloatbar, { passive: true });
    document.addEventListener("pointerdown", function (event) {
        if (document.body.dataset.phase !== "studio") return;
        const target = event.target;
        if (!target || !target.closest) return;
        if (target.closest(".editable, #floatbar, .library-card, .topbar, .drawer, .crop-dialog, button, input, textarea, select, a, .drag-handle, .line-x")) return;
        if (target.closest(".block")) {
            blurField();
            return;
        }
        clearFocus();
    }, true);
    document.addEventListener("focusout", function (event) {
        if (event.target && event.target.isContentEditable) snapArmed = false;
    });
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        if (closePhotoCrop()) {
            event.preventDefault();
            return;
        }
        if (document.body.dataset.phase === "setup") return;
        if (cancelDrag()) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        const menu = document.querySelector(".more-menu");
        if (menu && menu.open) {
            menu.open = false;
            event.preventDefault();
            return;
        }
        const target = event.target;
        if (target && (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
            target.blur();
            event.preventDefault();
            return;
        }
        if (selectedId) {
            clearFocus();
            event.preventDefault();
            return;
        }
        if (narrowStudio() && document.body.dataset.pane === "settings") {
            setStudioPane("page");
            event.preventDefault();
            return;
        }
        const drawer = document.getElementById("drawer");
        if (drawer && drawer.classList.contains("is-open")) {
            toggleDrawer(false);
            event.preventDefault();
        }
    }, true);
    document.addEventListener("keydown", function (event) {
        if (document.body.dataset.phase !== "studio") return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            downloadPdf();
            return;
        }
        const tag = event.target && event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (event.target && event.target.isContentEditable) return;
        if (event.ctrlKey || event.metaKey) {
            const key = event.key.toLowerCase();
            if (key === "z") {
                event.preventDefault();
                if (event.shiftKey) redo();
                else undo();
            } else if (key === "y") {
                event.preventDefault();
                redo();
            }
            return;
        }
        if (!selectedId) return;
        if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            deleteBlock();
            return;
        }
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            moveBlock(event.key === "ArrowUp" ? -1 : 1);
        }
    });
    document.addEventListener("selectionchange", function () {
        ["bold", "italic", "underline"].forEach(function (command) {
            const button = document.querySelector('#floatbar [data-command="' + command + '"]');
            if (!button) return;
            let on = false;
            try { on = document.queryCommandState(command); } catch (error) { on = false; }
            button.classList.toggle("is-on", on);
        });
    });
    document.addEventListener("pointerdown", function (event) {
        document.querySelectorAll(".more-menu, .ai-menu").forEach(function (menu) {
            if (!menu.open || menu.contains(event.target)) return;
            menu.open = false;
        });
    }, true);
    document.querySelectorAll("#pane-switch [data-pane]").forEach(function (button) {
        button.addEventListener("click", function () { setStudioPane(button.dataset.pane); });
    });
    window.addEventListener("popstate", function () {
        if (document.body.dataset.phase === "setup" && setupState.source === "guided") storeGuideStep();
        applyRouteState(history.state);
    });
    window.addEventListener("resize", function () {
        const drawer = document.getElementById("drawer");
        if (drawer && "inert" in drawer) {
            if (narrowStudio()) drawer.inert = document.body.dataset.pane !== "settings";
            else drawer.inert = !drawer.classList.contains("is-open");
        }
        if (!zoomTouched) fitStage();
        else updatePageGuides();
        positionFloatbar();
        syncLibraryHint();
    });
}

function boot() {
    try { document.execCommand("styleWithCSS", false, true); } catch (error) { /* ignore */ }
    lang = savedLang();
    const requested = requestedLang();
    if (requested) lang = requested;
    doc = emptyCv();
    normalize(doc);
    mountTools();
    let fresh = true;
    let opened = false;
    if (requestedTemplate()) {
        try { opened = openRequestedTemplate(); } catch (error) { opened = false; }
    }
    if (!opened) {
        try {
            const raw = localStorage.getItem(STORAGE_DOC);
            if (raw) {
                doc = JSON.parse(raw);
                fresh = false;
            } else doc = emptyCv();
        } catch (error) {
            doc = emptyCv();
            fresh = true;
        }
        if (!doc || doc.version !== 1 || !Array.isArray(doc.sidebar) || !Array.isArray(doc.main)) doc = emptyCv();
        normalize(doc);
        if (doc.lang === "en" || doc.lang === "nl") lang = doc.lang;
        if (requested) {
            lang = requested;
            doc.lang = requested;
            try { localStorage.setItem(STORAGE_LANG, requested); } catch (error) { /* ignore */ }
        }
    } else if (requested) {
        try { localStorage.setItem(STORAGE_LANG, requested); } catch (error) { /* ignore */ }
    }
    const name = document.getElementById("pdf-name");
    if (opened) {
        filenameCustom = false;
        name.value = plainName();
    } else {
        let storedName = "";
        try { storedName = localStorage.getItem(STORAGE_NAME) || ""; } catch (error) { storedName = ""; }
        const person = plainName().replace(/\s+/g, " ").trim();
        const follow = !person || person === t("ph.name") ? "" : person;
        filenameCustom = !!(storedName && storedName !== follow);
        name.value = filenameCustom ? storedName : follow;
    }
    applyLanguage();
    adoptRoute(opened ? false : fresh);
    if (requested && document.body.dataset.phase === "studio") save();
    toggleDrawer(false);
    render();
    bindSetup();
    bindStudio();
    setStudioPane("page");
}

boot();
