let toolMarker = document.getElementById("selectedMarker-types");
let toolbarContainer = document.getElementById("toolbarContainer");
let toolbar = document.getElementById("fntypes-toolbar");
let fontToolbar = document.getElementById("font-toolbar");
let nonPrintToolbar = document.getElementById("nonPrintable-toolbar");
let tools = toolbar.getElementsByClassName("tool");
let fontTools = fontToolbar.getElementsByClassName("tool");
let addTools = nonPrintToolbar.getElementsByClassName("tool");
let addIcon = document.getElementById("toolAddIcon");
let fontIcon = document.getElementById("toolFontIcon");

window.addEventListener('resize', PositionToolbar);
PositionToolbar();

function SelectTool(tool, format)
{
    format = format || false;
    if (format && !ToolbarIsOpen(toolbar)) return;

    for (let element of tools)
    {
        element.setAttribute("selected", "false");
    };

    if (!tool) return;

    tool.setAttribute("selected", "true");
    toolMarker.style.setProperty("--selectedIndex", tool.getAttribute("toolIndex"));

    if (format && ToolbarIsOpen(toolbar)) FormatCurrentAs(tool.getAttribute("tool"));
}

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

inputElement.addEventListener('keyup', UpdateToolbar);

toolbar.addEventListener('mousedown', e =>
{
    e.preventDefault();
}
);
nonPrintToolbar.addEventListener('mousedown', e =>
{
    e.preventDefault();
}
);
for (let element of tools)
{
    element.addEventListener('mousedown', e =>
    {
        e.preventDefault();
    }
    );
}

function PositionToolbar()
{
    let newRight = window.innerWidth - inputContainer.offsetLeft;
    toolbarContainer.parentElement.style.setProperty("--toolbar-right", newRight);
}

function ToolbarIsOpen(tb)
{
    let isOpen = tb.offsetWidth > tb.offsetHeight * 2;
    return isOpen;
}