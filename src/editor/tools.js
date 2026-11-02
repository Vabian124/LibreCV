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
        h("p", { id: "doc-title" }),
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
