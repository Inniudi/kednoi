let inputElement = document.getElementById("input");
let inputContainer = inputElement.parentElement;
let menu = document.getElementById("burgerMenu");
let isFullScreen = false;
let fileName;
let htmlOutput = inputElement;

let editorPatterns = [
    //[0='TYPE', 1='regEx', 2='flags'],   DON'T FORGET DOUBLE BACKSLASHES
    ['SCENE_HEADING', '^(?:INT\\/EXT|INT\\.\\/EXT|I\\/E|INT|EXT|EST){1}\\.? ', 'i'],
    ['PARENTHETICAL', "^\\(.*", 'm'],
    ['CENTERED', '^\\>.*', 'm'],
    ['BONEYARD', '^\\/\\*', 'm'],
    ['PAGEBREAK', '^\\={3}', 'm'],
    ['SYNOPSE', '^\\={1}', 'm'],
    ['SECTION 3', '^#{3}', 'm'],
    ['SECTION 2', '^#{2}', 'm'],
    ['SECTION 1', '^#{1}', 'm'],
    ['EMPTY', '^\\s*$', 'im']
];

let observer = new MutationObserver(function (mutations)
{
    let tempParent = null;
    mutations.forEach(function (mutation)
    {
        for (var i = 0; i < mutation.addedNodes.length; i++)
        {
            let addedNode = mutation.addedNodes[i];
            if (addedNode.tagName === "DIV")
            {
                if (addedNode.parentElement !== inputElement)
                {
                    observer.disconnect();
                    tempParent = addedNode.parentElement;
                    inputElement.insertBefore(addedNode, tempParent);
                    addedNode.style = "";
                    addedNode.removeAttribute("style");
                    addedNode.setAttribute("autoformat", "false");
                }
                if (addedNode.textContent.length <= 0)
                {
                    observer.disconnect();
                    let emptyNode = document.createElement("div");
                    emptyNode.setAttribute("autoformat", "true");
                    emptyNode.setAttribute("fntype", "EMPTY");
                    emptyNode.innerHTML = "<br>";
                    inputElement.replaceChild(emptyNode, addedNode);
                    let selection = window.getSelection(0);
                    selection.selectAllChildren(emptyNode);
                    selection.getRangeAt(0).collapse(false);
                    Observe();
                }
            }
        }


        for (var i = 0; i < mutation.removedNodes.length; i++)
        {
            let n = window.getSelection().anchorNode;
            let node = n.nodeType === Node.TEXT_NODE ? n.parentNode : n;
            if (mutation.removedNodes[i].tagName === "DIV"
                && node.getAttribute("fntype") !== mutation.removedNodes[i].getAttribute("fntype"))
            {
                CleanBlock(node);
            }
        }
    });
    if (tempParent)
    {
        inputElement.removeChild(tempParent);
        Observe();
    }
});

window.addEventListener('keydown', e =>
{
    if (e.code === "KeyS" && e.ctrlKey)
    {
        e.preventDefault();
        SaveFileToLocal("SP");
    }
});

inputElement.addEventListener('input', () =>
{
    CheckNode(window.getSelection().anchorNode);
    CountPages();
    Unsave();
});

window.addEventListener('click', e =>
{
    if (e.target === inputElement || inputElement.contains(e.target))
    {
        UpdateToolbar();
    }

    if (e.target !== menu && !menu.contains(e.target) && menu.getAttribute("open") === "true")
    {
        ToggleMenu(false, "true");
    }
});

inputElement.addEventListener('keydown', e =>
{
    if (e.key === "Backspace")
    {
        if (inputElement.innerText.length <= 1 && inputElement.innerText.trim().length === 0 && inputElement.children.length <= 1)
        {
            e.preventDefault();
        }
    }

    else if (e.code === "KeyS" && e.ctrlKey)
    {
        e.preventDefault();
        SaveFileToLocal("SP");
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

inputElement.addEventListener('keyup', e =>
{
    if (e.code === "KeyB" && e.ctrlKey)
    {
        e.preventDefault();
        let containerFontStyle = GetFontStyle(window.getSelection().getRangeAt(0).endContainer.parentElement);
        SelectMarkup(document.querySelector(`#font-toolbar div[tool="BOLD"]`), true, (containerFontStyle[0] === "bold").toString(), true);
    }

    else if (e.code === "KeyI" && e.ctrlKey)
    {
        e.preventDefault();
        let containerFontStyle = GetFontStyle(window.getSelection().getRangeAt(0).endContainer.parentElement);
        SelectMarkup(document.querySelector(`#font-toolbar div[tool="ITALIC"]`), true, (containerFontStyle[1] === "oblique").toString(), true);

    }

    else if (e.code === "KeyU" && e.ctrlKey)
    {
        e.preventDefault();
        let containerFontStyle = GetFontStyle(window.getSelection().getRangeAt(0).endContainer.parentElement);
        SelectMarkup(document.querySelector(`#font-toolbar div[tool="UNDERLINE"]`), true, (containerFontStyle[2] === "underline").toString(), true);
    }

    else if (e.code === "Tab")
    {
        e.preventDefault();
        const selection = window.getSelection();
        let textNode = selection.anchorNode;
        let node = selection.anchorNode;
        while (node.parentElement !== inputElement) node = node.parentElement;
        let type = (node.getAttribute("fntype") === "EMPTY" || node.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.getAttribute("fntype");
        let prevType;
        if (node.previousSibling.nodeType !== Node.TEXT_NODE)
        {
            prevType = (node.previousSibling.getAttribute("fntype") === "EMPTY" || node.previousSibling.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.previousSibling.getAttribute("fntype");
        }
        if (suggestion.textContent !== "")
        {
            if (type === "CHARACTER")
            {
                textNode.textContent = suggestion.textContent.toUpperCase();

                const newPos = suggestion.textContent.length;
                const newRange = document.createRange();
                newRange.setStart(textNode, newPos);
                newRange.setEnd(textNode, newPos);

                selection.removeAllRanges();
                selection.addRange(newRange);

                suggestion.style.visibility = 'hidden';
            }
            else
            {
                InsertCharacterMention();
            }
        }
        else
        {
            if (prevType !== "CHARACTER" && prevType !== "PARENTHETICAL")
            {
                node.setAttribute("autoformat", "false");
                node.setAttribute("fntype", type === "ACTION" ? "CHARACTER" : "ACTION");
            }
        }
    }
});

function InsertCharacterMention()
{
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const n = selection.anchorNode;

    if (!n || n.nodeType !== Node.TEXT_NODE) return;

    const text = n.textContent;
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

        n.textContent = newText;

        // Move cursor to after the inserted mention
        const newPos = before.length + suggestion.textContent.length + 1; // +1 for space
        const newRange = document.createRange();
        newRange.setStart(n, newPos);
        newRange.setEnd(n, newPos);

        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    suggestion.style.visibility = 'hidden';
}

inputElement.addEventListener('keyup', e =>
{
    suggestion.innerHTML = "";

    const selection = window.getSelection();
    let node = selection.anchorNode;
    const range = selection.getRangeAt(0).cloneRange();

    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    const cursorPos = selection.anchorOffset;
    const textBeforeCursor = text.slice(0, cursorPos);

    // Check if there's a word starting with @ just before the cursor
    const match = textBeforeCursor.match(/@(\w*)$/);
    while (node.parentElement !== inputElement) node = node.parentElement;
    let type = (node.getAttribute("fntype") === "EMPTY" || node.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.getAttribute("fntype");
    if (match && type != "CHARACTER")
    {
        const query = match[1]; // This is the text after the "@"
        let regEx = new RegExp("^" + query, "i");
        for (let i in characters)
        {
            if (regEx.test(characters[i].name) && inputElement.value != "")
            {
                suggestion.style.visibility = "visible";
                suggestion.innerHTML = characters[i].name;

                suggestion.style.position = 'absolute';
                suggestion.style.left = `${range.getBoundingClientRect().left + window.scrollX}px`;
                suggestion.style.top = `${range.getBoundingClientRect().bottom + window.scrollY}px`;
            }
        }
    }
    else if (type === "CHARACTER")
    {
        const query = node.textContent;
        let regEx = new RegExp("^" + query, "i");
        for (let i in characters)
        {
            if (regEx.test(characters[i].name) && inputElement.value != "")
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

window.onload = Start();

async function Start()
{
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
        inputElement.innerHTML = loadedVersion.htmlSave;
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
    Observe();
    CountPages();

    UpdateCharacterList();
}

function CheckNode(n)
{
    let node = n;

    while (node.parentElement !== inputElement) node = node.parentElement;

    if (node.getAttribute("autoformat") === "false") return;

    let contentToCheck = node.innerText.replaceAll(`<br>`, `\n`);

    let prevType = node.previousSibling && node.previousSibling.nodeType !== 3 ? node.previousSibling.getAttribute("fntype") : null;
    if (!/^\(.*/m.test(contentToCheck) && (prevType === "CHARACTER" || prevType === "PARENTHETICAL"))
    {
        node.setAttribute("fntype", "DIALOG");
    }
    else
    {
        for (var i = 0; i < editorPatterns.length; i++)
        {
            if (new RegExp(editorPatterns[i][1], editorPatterns[i][2]).test(contentToCheck))
            {
                node.setAttribute("fntype", editorPatterns[i][0]);
                return;
            }
            node.setAttribute("fntype", "ACTION");
        }
    }
}

function GetPreviousNode(n)
{
    if (!n.previousSibling)
    {
        return "";
    }
    let prev = n.previousSibling.nodeType === Node.TEXT_NODE ? n.previousSibling.parentElement : n.previousSibling;
    if (prev === inputContainer)
    {
        return "";
    }
    else if (prev === inputElement)
    {
        return prev.firstChild.textContent;
    }
    else
    {
        return prev.innerText;
    }
}

function GetNextNode(n)
{
    if (!n.nextSibling)
    {
        return "";
    }
    let next = n.nextSibling.nodeType === Node.TEXT_NODE ? n.nextSibling.parentElement : n.nextSibling;
    if (next === inputContainer)
    {
        return "";
    }
    else
    {
        return next.innerText;
    }
}

function FormatCurrentAs(type)
{
    let node = window.getSelection().anchorNode;
    while (node.parentElement !== inputElement) node = node.parentElement;
    node.setAttribute("fntype", type);
    node.setAttribute("autoformat", "false");
    Unsave();
}

function Observe()
{
    observer.observe(inputElement, {
        attributes: true, childList: true, subtree: true
    });
}

function UpdateToolbar()
{
    let selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let node = window.getSelection().anchorNode;
    while (node.parentElement !== inputElement) node = node.parentElement;
    let type = (node.getAttribute("fntype") === "EMPTY" || node.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.getAttribute("fntype");
    let t = document.querySelector(`#fntypes-toolbar div[tool="${type}"]`);
    SelectTool(t);
    let containerFontStyle = GetFontStyle(range.endContainer.parentElement);
    SelectMarkup(document.querySelector(`#font-toolbar div[tool="BOLD"]`), false, (containerFontStyle[0] !== "bold").toString());
    SelectMarkup(document.querySelector(`#font-toolbar div[tool="ITALIC"]`), false, (containerFontStyle[1] !== "oblique").toString());
    SelectMarkup(document.querySelector(`#font-toolbar div[tool="UNDERLINE"]`), false, (containerFontStyle[2] !== "underline").toString());
    SelectMarkup(document.querySelector(`#font-toolbar div[tool="CENTERED"]`), false, (node.getAttribute("fntype") !== "CENTERED").toString());
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

    UpdateCharacterList();
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