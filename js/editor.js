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
        let node = window.getSelection().anchorNode;
        while (node.parentElement !== inputElement) node = node.parentElement;
        let type = (node.getAttribute("fntype") === "EMPTY" || node.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.getAttribute("fntype");
        let prevType = (node.previousSibling.getAttribute("fntype") === "EMPTY" || node.previousSibling.getAttribute("fntype") === "CENTERED") ? "ACTION" : node.previousSibling.getAttribute("fntype");

        if (prevType !== "CHARACTER" && prevType !== "PARENTHETICAL")
        {
            node.setAttribute("autoformat", "false");
            node.setAttribute("fntype", type === "ACTION" ? "CHARACTER" : "ACTION");
        }

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

        LoadScriptData();

        SetVersionsList();
        sessionStorage.removeItem("openedKed");
        Unsave();
    }
    else if (sessionStorage.getItem("launchQueue"))
    {
        let launchParams = sessionStorage.getItem("launchQueue");
        let file = await launchParams.files[0].getFile();
        file.handle = launchParams.files[0];
        if (/.*\.ked$/i.test(file.name))
        {
            let loadedFileName = file.name.replace(/(.*)\.ked$/i, `$1`);
            let newName = loadedFileName;
            if (localStorage.getItem(`SaveF${loadedFileName}`))
            {
                newName = prompt(`¡Ojo! Ya tienes un proyecto con el nombre de archivo "${loadedFileName}". Escribe algo diferente abajo para abrir este archivo con otro nombre o déjalo como está si prefieres sobreescribirlo.`, loadedFileName);
            }
            let reader = new FileReader();
            reader.addEventListener('load', function (e)
            {
                Object.assign(loadedProject, JSON.parse(e.target.result));
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

                LoadScriptData();

                SetVersionsList();
            });
            reader.readAsText(file);
        }
        else if (/.*\.fountain$/i.test(file.name))
        {
            OpenFile(launchParams);
        }
        sessionStorage.removeItem("launchQueue");
    }
    else
    {
        fileNameText.textContent = fileName || "Guion sin título";
        fileNameInput.value = fileName || "Guion sin título";
    }
    Observe();
    CountPages();
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
