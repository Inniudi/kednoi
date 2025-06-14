const editorContainer = document.querySelector(".editorContainer");
const comicPageTemplate = document.getElementById("comicPageTemplate");
const comicPanelTemplate = document.getElementById("comicPanelTemplate");
const comicBubbleTemplate = document.getElementById("comicBubbleTemplate");
let menu = document.getElementById("burgerMenu");
let isFullScreen = false;
let fileName;
let pageCounterText = document.getElementById("pageText");
let toolbarContainer = document.getElementById("toolbarContainer");
let htmlOutput = document.getElementById("editorContainer");

window.addEventListener('resize', PositionToolbar);
PositionToolbar();

function AddPage(e, bttn)
{
    e.stopPropagation();
    clickedBttn = bttn;

    newBlock = comicPageTemplate.cloneNode(true);
    newInput = newBlock.querySelector(".co-block-content");
    //addEventListeners(newInput);

    clickedBttn.parentNode.insertBefore(newBlock, clickedBttn);
    newBlock.style.visibility = "inherit";

    Unsave();
    CountPages();
}

function AddPanel(e, bttn)
{
    e.stopPropagation();
    clickedBttn = bttn;

    newBlock = comicPanelTemplate.cloneNode(true);
    newInput = newBlock.querySelector(".co-block-content");
    //addEventListeners(newInput);

    clickedBttn.parentNode.insertBefore(newBlock, clickedBttn);
    newBlock.style.visibility = "inherit";

    Unsave();
}

function AddBubble(e, bttn)
{
    e.stopPropagation();
    clickedBttn = bttn;

    newBlock = comicBubbleTemplate.cloneNode(true);
    newInput = newBlock.querySelector(".co-block-content");
    //addEventListeners(newInput);

    clickedBttn.parentNode.insertBefore(newBlock, clickedBttn);
    newBlock.style.visibility = "inherit";

    Unsave();
}

window.addEventListener('keydown', e =>
{
    if (e.code === "KeyS" && e.ctrlKey)
    {
        e.preventDefault();
        SaveFileToLocal("CO");
    }
});

function addEventListeners(newInput)
{
    newInput.addEventListener('keydown', e =>
    {
        if (e.code === "KeyS" && e.ctrlKey)
        {
            e.preventDefault();
            SaveFileToLocal("CO");
        }

        else if ((e.code === "KeyB" || e.code === "KeyI" || e.code === "KeyU") && e.ctrlKey)
        {
            e.preventDefault();
        }

        else if (e.code === "Tab")
        {
            e.preventDefault();
        }
    });
    newInput.addEventListener('keyup', e =>
    {
        suggestion.innerHTML = "";

        const selection = window.getSelection();
        const node = selection.anchorNode;
        const range = selection.getRangeAt(0).cloneRange();

        if (!node || node.nodeType !== Node.TEXT_NODE) return;

        const text = node.textContent;
        const cursorPos = selection.anchorOffset;
        const textBeforeCursor = text.slice(0, cursorPos);

        // Check if there's a word starting with @ just before the cursor
        const match = textBeforeCursor.match(/@(\w*)$/);
        if (match)
        {
            const query = match[1]; // This is the text after the "@"
            let regEx = new RegExp("^" + query, "i");
            for (let i in characters)
            {
                if (regEx.test(characters[i].name) && newInput.value != "")
                {
                    suggestion.style.visibility = "visible";
                    suggestion.innerHTML = characters[i].name;

                    suggestion.style.position = 'absolute';
                    suggestion.style.left = `${range.getBoundingClientRect().left + window.scrollX}px`;
                    suggestion.style.top = `${range.getBoundingClientRect().bottom + window.scrollY}px`;
                }
            }
        }
        else
        {
            suggestion.style.visibility = 'hidden';
        }
    });
    newInput.addEventListener('keyup', e =>
    {
        if (e.code === "Tab")
        {
            e.preventDefault();
            if (suggestion)
            {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const node = selection.anchorNode;

                if (!node || node.nodeType !== Node.TEXT_NODE) return;

                const text = node.textContent;
                const cursorPos = selection.anchorOffset;
                const textBeforeCursor = text.slice(0, cursorPos);
                const match = textBeforeCursor.match(/@(\w*)$/);

                if (match)
                {
                    const start = match.index;
                    const end = cursorPos;

                    // Replace the @mention text with the full username
                    const before = text.slice(0, start);
                    const after = text.slice(end);
                    const newText = before + suggestion.textContent + " " + after;

                    node.textContent = newText;

                    // Move cursor to after the inserted mention
                    const newPos = before.length + suggestion.textContent.length + 1; // +1 for space
                    const newRange = document.createRange();
                    newRange.setStart(node, newPos);
                    newRange.setEnd(node, newPos);

                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                suggestion.style.visibility = 'hidden';
            }
        }
    });
}

function GetFontStyle(container)
{
    let result = [null, null, null];
    for (let i = 0; i < 3; i++)
    {
        let lookingAt = container;
        while (result[i] === null || result[i] === "")
        {
            if (lookingAt !== inputElement)
            {
                switch (i)
                {
                    case 0:
                        result[0] = lookingAt.style.fontWeight;
                        break;
                    case 1:
                        result[1] = lookingAt.style.fontStyle;
                        break;
                    case 2:
                        result[2] = lookingAt.style.textDecoration;
                        break;
                }
                lookingAt = lookingAt.parentElement;
            }
            else
            {
                result[i] = "normal";
            }
        }
    }
    return result;
}

function ToggleMenu(event, elem, isNowOpen)
{
    event = event || null;
    elem = elem || null;
    if (event && event.target !== elem)
    {
        event.stopPropagation();
        return;
    }
    isNowOpen = isNowOpen || menu.getAttribute("open");
    if (isNowOpen === "false")
    {
        menu.setAttribute("open", "true");
        return;
    }
    else if (elem !== menu)
    {
        menu.setAttribute("open", "false");
    }
}

function ToggleFullScreen()
{
    if (isFullScreen)
    {
        document.exitFullscreen();
        isFullScreen = false;
        return;
    }
    else
    {
        document.documentElement.requestFullscreen();
        isFullScreen = true;
    }
}

let touchstartX = 0;
let touchendX = 0;

function checkDirection()
{
    if (touchendX < touchstartX - 100) ToggleMenu(null, null, "true");
    if (touchendX > touchstartX + 100) ToggleMenu(null, null, "false");

}

document.addEventListener('touchstart', e =>
{
    touchstartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e =>
{
    touchendX = e.changedTouches[0].screenX;
    checkDirection();
});

function CleanBlock(node)
{
    let block = node;
    while (block.parentElement !== inputElement)
    {
        block = block.parentElement;
    }

    if (block.children.length > 0)
    {
        for (let span of block.children)
        {
            if (span.childNodes.length > 0)
            {
                for (let n of span.childNodes)
                {
                    if (n.nodeType === Node.TEXT_NODE)
                    {
                        block.insertBefore(n, span);
                    }
                }
                block.removeChild(span);
            }
        }
    }
    block.normalize();
}

let scriptTab = document.getElementById("scrollBox");
let scriptTabBttn = document.getElementById("scriptTabBttn");
let characterTabBttn = document.getElementById("characterTabBttn");
let stepTabBttn = document.getElementById("stepTabBttn");


function ToggleScriptTab()
{
    toolbarContainer.style.visibility = "visible";

    scriptTab.style.visibility = "visible";
    characterTab.style.visibility = "hidden";
    stepTab.style.visibility = "hidden";

    scriptTabBttn.setAttribute("open", "true");
    characterTabBttn.setAttribute("open", "false");
    stepTabBttn.setAttribute("open", "false");

    UpdateCharacterList();
}

function ToggleCharacterTab()
{
    toolbarContainer.style.visibility = "hidden";

    scriptTab.style.visibility = "hidden";
    characterTab.style.visibility = "visible";
    stepTab.style.visibility = "hidden";

    scriptTabBttn.setAttribute("open", "false");
    characterTabBttn.setAttribute("open", "true");
    stepTabBttn.setAttribute("open", "false");
}

function ToggleStepTab()
{
    toolbarContainer.style.visibility = "hidden";

    scriptTab.style.visibility = "hidden";
    characterTab.style.visibility = "hidden";
    stepTab.style.visibility = "visible";

    scriptTabBttn.setAttribute("open", "false");
    characterTabBttn.setAttribute("open", "false");
    stepTabBttn.setAttribute("open", "true");
}

let structureContainer;

function ToggleStructure(element)
{
    let panel = element.querySelector("#structureContainer");
    structureContainer = panel;
    panel.setAttribute("open", panel.getAttribute("open") === "true" ? false : true);
    ReadStructure();
    panel.onclick = function (event)
    {
        event.stopPropagation();
    };
}

function ReadStructure()
{
    structureContainer.innerHTML = "";
    let sectionIndex = -1;
    for (let block of inputElement.children)
    {
        if (block.getAttribute("fntype") === "SECTION 1")
        {
            block.setAttribute("sectionIndex", ++sectionIndex);
            let sectionText = /(?:#\s?)(.+)/.exec(block.textContent)[1];
            structureContainer.innerHTML += `<a onclick="ScrollTo(${sectionIndex})" href="#"># ${sectionText}</a><br>`;
        }
    }
}

function ScrollTo(index)
{
    for (let block of inputElement.children)
    {
        if (block.getAttribute("sectionIndex") === `${index}`)
        {
            block.scrollIntoView();
        }
    }
}

function RemoveBlock(e)
{
    if (confirm("¿Estás seguro de borrar esto? Que no hay Ctrl+Z..."))
    {
        e.target.parentElement.parentElement.removeChild(e.target.parentElement);
        Unsave();
        CountPages();
    }
}

function CountPages()
{
    pageCounterText.textContent = `${(editorContainer.childElementCount - 1).toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false })}`;
}

function PositionToolbar()
{
    let newRight = window.innerWidth - editorContainer.offsetLeft;
    toolbarContainer.parentElement.style.setProperty("--toolbar-right", newRight);
}

let toolMarker = document.getElementById("selectedMarker-types");
let fontToolbar = document.getElementById("font-toolbar");
let nonPrintToolbar = document.getElementById("nonPrintable-toolbar");
let fontTools = fontToolbar.getElementsByClassName("tool");
let addTools = nonPrintToolbar.getElementsByClassName("tool");
let addIcon = document.getElementById("toolAddIcon");
let fontIcon = document.getElementById("toolFontIcon");

function SelectMarkup(tool, format, forceOppositeState, bypassOpenToolbar)
{
    format = format || false;

    let toolCurrentState = forceOppositeState || tool.getAttribute("selected");

    if (format && (ToolbarIsOpen(fontToolbar) || bypassOpenToolbar))
    {
        if (tool.getAttribute("tool") === "CENTERED")
        {
            let n = window.getSelection().anchorNode;
            let node = n.nodeType === Node.TEXT_NODE ? n.parentNode : n;
            FormatCurrentAs(node.getAttribute("fntype") === "CENTERED" ? "ACTION" : "CENTERED");
        }
        else
        {
            switch (tool.getAttribute("tool"))
            {
                case "BOLD":
                    document.execCommand("bold");
                    break;

                case "ITALIC":
                    document.execCommand("italic");
                    break;

                case "UNDERLINE":
                    document.execCommand("underline");
                    break;
            }
        }
        Unsave();
    }
    tool.setAttribute("selected", toolCurrentState === "true" ? "false" : "true");
}

function SelectAdd(tool)
{
    if (!ToolbarIsOpen(nonPrintToolbar)) return;
    observer.disconnect();

    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let inputChild = range.endContainer;
    while (inputChild.parentElement !== inputElement) inputChild = inputChild.parentElement;
    let addon = document.createElement("div");

    switch (tool.getAttribute("tool"))
    {
        case "PAGEBREAK":
            addon.setAttribute("fntype", "PAGEBREAK");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "===";
            break;

        case "BONEYARD":
            addon.setAttribute("fntype", "BONEYARD");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "/*";
            break;

        case "SYNOPSE":
            addon.setAttribute("fntype", "SYNOPSE");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "=";
            break;

        case "SECTION 1":
            addon.setAttribute("fntype", "SECTION 1");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "#";
            break;

        case "SECTION 2":
            addon.setAttribute("fntype", "SECTION 2");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "##";
            break;

        case "SECTION 3":
            addon.setAttribute("fntype", "SECTION 3");
            addon.setAttribute("autoformat", "false");
            addon.innerHTML = "###";
            break;
    }

    if (inputChild.getAttribute("fntype") === "EMPTY")
    {
        inputElement.replaceChild(addon, inputChild);
    }
    else
    {
        inputElement.insertBefore(addon, inputChild.nextSibling);
    }
    selection.selectAllChildren(addon);
    selection.getRangeAt(0).collapse(false);
    Observe();
    Unsave();
}

nonPrintToolbar.addEventListener('mousedown', e =>
{
    e.preventDefault();
}
);

function ToolbarIsOpen(tb)
{
    let isOpen = tb.offsetWidth > tb.offsetHeight * 2;
    return isOpen;
}

window.onload = Start();

async function Start()
{
    const observer = new MutationObserver((mutations) =>
    {
        mutations.forEach((mutation) =>
        {
            mutation.addedNodes.forEach((node) =>
            {
                if (node.nodeType === 1)
                {
                    const inputs = node.querySelectorAll('.co-block-content');
                    inputs.forEach((destino) =>
                    {
                        addEventListeners(destino);
                    });
                }
            });
        });
    });

    observer.observe(htmlOutput, {
        childList: true,
        subtree: true
    });
    if (localStorage.getItem("UserPrefs"))
    {
        LoadPreferences();
    }
    else SavePreferences();
    if (sessionStorage.getItem("currentSelectedFile"))
    {
        fileName = sessionStorage.getItem("currentSelectedFile");
        if (localStorage.getItem("SaveF" + fileName))
        {
            LoadFileFromLocal();
        }
        sessionStorage.removeItem("currentSelectedFile");
    }
    else if (sessionStorage.getItem("openedKed"))
    {
        let openedKed = JSON.parse(sessionStorage.getItem("openedKed"));
        console.log(openedKed);
        let loadedFileName = openedKed.fileSaveName;
        let newName = loadedFileName;

        while (localStorage.getItem(`SaveF${newName}`) || newName === null)
        {
            newName = prompt(`¡Ojo! Ya tienes un proyecto con el nombre de archivo "${loadedFileName}". Escribe algo diferente abajo para abrir este archivo con otro nombre o déjalo como está si prefieres sobreescribirlo.`, loadedFileName);
        }

        Object.assign(loadedProject, openedKed);
        Object.assign(loadedVersion, loadedProject.GetVersionByID(loadedProject.lastVersionId));
        Object.assign(loadedScriptData, loadedProject.scriptData);

        fileName = newName;
        loadedProject.fileSaveName = fileName;
        fileNameText.textContent = fileName;
        fileNameInput.value = fileName;
        colorPicker.value = loadedProject.color;
        thumbnailFile = loadedProject.thumbnail;

        versionInput.value = loadedVersion.versionId;
        htmlOutput.innerHTML = loadedVersion.htmlSave;
        statusSelect.value = loadedVersion.versionStatus;

        characterTab.innerHTML = loadedVersion.charactersHtml || characterTab.innerHTML;
        stepTab.innerHTML = loadedVersion.stepHtml || stepTab.innerHTML;

        LoadScriptData();

        SetVersionsList();
        sessionStorage.removeItem("openedKed");
        Unsave();
    }
    else if (sessionStorage.getItem("launchQueue"))
    {
        let file = sessionStorage.getItem("launchQueue");
        let loadedFile = JSON.parse(file);
        let newName = loadedFile.fileSaveName;
        while (localStorage.getItem(`SaveF${newName}`))
        {
            newName = prompt(`¡Ojo! Ya tienes un proyecto con el nombre de archivo "${loadedFileName}". Escribe algo diferente abajo para abrir este archivo con otro nombre o déjalo como está si prefieres sobreescribirlo.`, loadedFileName);
        }
        Object.assign(loadedProject, loadedFile);
        Object.assign(loadedVersion, loadedProject.GetVersionByID(loadedProject.lastVersionId));
        Object.assign(loadedScriptData, loadedProject.scriptData);

        fileName = newName;
        loadedProject.fileSaveName = fileName;
        fileNameText.textContent = fileName;
        fileNameInput.value = fileName;
        colorPicker.value = loadedProject.color;
        thumbnailFile = loadedProject.thumbnail;

        versionInput.value = loadedVersion.versionId;
        htmlOutput.innerHTML = loadedVersion.htmlSave;
        statusSelect.value = loadedVersion.versionStatus;

        characterTab.innerHTML = loadedVersion.charactersHtml || characterTab.innerHTML;
        stepTab.innerHTML = loadedVersion.stepHtml || stepTab.innerHTML;

        LoadScriptData();

        SetVersionsList();
        sessionStorage.removeItem("launchQueue");
    }
    else
    {
        fileNameText.textContent = fileName || "Guion sin título";
        fileNameInput.value = fileName || "Guion sin título";
    }
    CountPages();
    UpdateCharacterList();
}