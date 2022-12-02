const bigBlockTemplate = document.getElementById("bigBlockTemplate");
const smallBlockTemplate = document.getElementById("smallBlockTemplate");
const sectionBlockTemplate = document.getElementById("sectionBlockTemplate");
const dialogBlockTemplate = document.getElementById("dialogBlockTemplate");
const destinationBlockTemplate = document.getElementById("destinationBlockTemplate");
const blockToolbar = document.getElementById("addBlockToolbar");
const allBlockTools = document.querySelectorAll(".addBlockTool");
const editorContainer = document.querySelector(".editorContainer");
let draggingBlock = null;
let clickedBttn = null;

function AddBlock(e)
{
    e.stopPropagation();

    switch (e.target.getAttribute("tool"))
    {
        case "destination":
            newBlock = destinationBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "destination");
            newBlock.querySelector("#defaultBlockTemplate").setAttribute("type", "description");
            break;

        case "cause":
            newBlock = bigBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "cause");
            newBlock.querySelector("#defaultBlockTemplate").setAttribute("type", "action");
            break;

        case "effect":
            newBlock = bigBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "effect");
            newBlock.querySelector("#defaultBlockTemplate").setAttribute("type", "result");
            break;

        case "if":
            newBlock = bigBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "if");
            newBlock.querySelector("#defaultBlockTemplate").setAttribute("type", "variable");
            break;

        case "dialog":
            newBlock = bigBlockTemplate.cloneNode(true);
            newBlock.querySelector(".addButton").remove();
            newBlock.setAttribute("type", "dialog");
            break;

        case "and":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.querySelector(".gd-block-content").textContent = "AND";
            newBlock.querySelector(".gd-block-content").contenteditable = false;
            newBlock.setAttribute("type", "and");
            break;

        case "or":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.querySelector(".gd-block-content").textContent = "OR";
            newBlock.querySelector(".gd-block-content").contenteditable = false;
            newBlock.setAttribute("type", "or");
            break;

        case "not":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.querySelector(".gd-block-content").textContent = "NOT";
            newBlock.querySelector(".gd-block-content").contenteditable = false;
            newBlock.setAttribute("type", "not");
            break;

        case "description":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "description");
            break;

        case "variable":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "variable");
            break;

        case "action":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "action");
            break;

        case "result":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "result");
            break;

        case "choice":
            newBlock = bigBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "choice");
            newBlock.querySelector("#defaultBlockTemplate").setAttribute("type", "action");
            break;

        case "section":
            newBlock = sectionBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "section");
            break;

        case "goto":
            newBlock = smallBlockTemplate.cloneNode(true);
            newBlock.setAttribute("type", "goto");
            break;

        default:
            break;
    }

    clickedBttn.parentNode.insertBefore(newBlock, clickedBttn);
    newBlock.style.visibility = "visible";

    CloseBlockToolbar();
    Unsave();
}

function OpenBlockToolbar(e)
{
    clickedBttn = e.target;
    if (clickedBttn.classList.contains("buttonSelected")) return;

    blockToolbar.classList.add("toolbarOpen");
    clickedBttn.classList.add("buttonSelected");
    clickedBttn.appendChild(blockToolbar);

    if (e.target.parentElement === editorContainer)
    {
        EnableTools(["destination", "cause", "effect", "section", "dialog"]);
    }
    else if (e.target.parentElement.parentElement.parentElement.getAttribute("type") === "section")
    {
        EnableTools(["destination", "cause", "effect", "dialog", "description", "variable"]);
    }
    else if (e.target.parentElement.parentElement.getAttribute("type") === "if")
    {
        EnableTools(["variable", "and", "or", "not"]);
    }
    else if (e.target.parentElement.parentElement.getAttribute("type") === "cause")
    {
        EnableTools(["if", "action"]);
    }
    else if (e.target.parentElement.parentElement.getAttribute("type") === "effect")
    {
        EnableTools(["destination", "if", "result", "effect", "dialog", "choice", "goto", "variable"]);
    }
    else
    {
        EnableTools(["destination", "cause", "effect", "if", "action", "result", "dialog", "choice", "goto", "description", "variable"]);
    }

    clickedBttn.addEventListener('mouseleave', CloseBlockToolbar);
}

function CloseBlockToolbar()
{
    clickedBttn.classList.remove("buttonSelected");
    blockToolbar.classList.remove("toolbarOpen");
    document.body.appendChild(blockToolbar);
    clickedBttn.removeEventListener('mouseleave', CloseBlockToolbar);
    clickedBttn = null;
}

function EnableTools(whichTools)
{
    for (let tool of allBlockTools)
    {
        if (tool.classList.contains("toolActive"))
        {
            tool.classList.remove("toolActive");
        }
        if (whichTools.includes(tool.getAttribute("tool")))
        {
            tool.classList.add("toolActive");
        }
    }
}

function ToggleSection(e)
{
    let section = e.target.parentElement.parentElement;
    section.setAttribute("collapsed", section.getAttribute("collapsed") === "true" ? "false" : "true");
}

function RemoveBlock(e)
{
    e.target.parentElement.parentElement.removeChild(e.target.parentElement);
    Unsave();
}

//#region DRAG AND DROP

function DragStart(e)
{
    draggingBlock = e.target;
    e.target.classList.add('hide');
}

function DragEnd(e)
{
    e.target.classList.remove('hide');
}

function DragOver(e)
{
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function DragLeave(e)
{
    e.target.classList.remove('drag-over');
}

function Drop(e)
{
    e.target.classList.remove('drag-over');
    let parent = e.target.parentElement;

    if (e.target.getAttribute("side") === "in")
    {
        parent.insertBefore(draggingBlock, e.target);
    }
    else
    {
        let isBottom = e.target.getAttribute("side") === "bottom";
        parent.parentElement.insertBefore(draggingBlock, isBottom ? parent.nextSibling : parent);
    }

    draggingBlock.classList.remove('hide');
    draggingBlock = null;
}

//#endregion

//#region EDITOR
let menu = document.getElementById("burgerMenu");
let isFullScreen = false;
let fileName = "Guion sin título";
let htmlOutput = document.getElementById("editorContainer");

window.addEventListener('click', e =>
{
    if (e.target !== menu && !menu.contains(e.target) && menu.getAttribute("open") === "true")
    {
        ToggleMenu(false, "true");
    }
});

window.addEventListener('keydown', e =>
{
    if (e.code === "KeyS" && e.ctrlKey)
    {
        e.preventDefault();
        SaveFileToLocal('GD');
    }
    else if (e.code === "Tab")
    {
        e.preventDefault();
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

        if (localStorage.getItem(`SaveF${loadedFileName}`))
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

        LoadScriptData();

        SetVersionsList();
        sessionStorage.removeItem("openedKed");
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

        LoadScriptData();

        SetVersionsList();
        sessionStorage.removeItem("launchQueue");
    }
    else
    {
        fileNameText.textContent = fileName;
    }
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
//#endregion
