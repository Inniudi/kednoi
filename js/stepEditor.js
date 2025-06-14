let stepTab = document.getElementById("stepScrollBox");
let stepTemplate = document.getElementById("stepTemplate");

function ToggleSign(element)
{
    let sign = element.getAttribute("sign");
    if (sign === "positive")
    {
        element.style.setProperty("background-image", "url(../src/MinorIcons/negative.svg)");
        element.setAttribute("sign", "negative");
        Unsave();
        return;
    }
    else
    {
        element.style.setProperty("background-image", "url(../src/MinorIcons/positive.svg)");
        element.setAttribute("sign", "positive");
        Unsave();
        return;
    }
}

function ToggleColor(element)
{
    let value = parseInt(element.getAttribute("color"));

    value = value === 6 ? 0 : value + 1;
    element.setAttribute("color", value);

    if (value === 1) element.style.setProperty("background-color", "var(--red)");
    else if (value === 2) element.style.setProperty("background-color", "var(--orange)");
    else if (value === 3) element.style.setProperty("background-color", "var(--yellow)");
    else if (value === 4) element.style.setProperty("background-color", "var(--green)");
    else if (value === 5) element.style.setProperty("background-color", "var(--blue)");
    else if (value === 6) element.style.setProperty("background-color", "var(--violet)");
    else element.style.setProperty("background-color", "var(--grey)");

    Unsave();
}

function AddStep(element)
{
    newBlock = stepTemplate.cloneNode(true);
    stepTab.insertBefore(newBlock, element);
    newBlock.style.visibility = "inherit";
    Unsave();
}

function DeleteStep(element)
{
    stepTab.removeChild(element.parentElement);
    Unsave();
}

//---- Drag n drop

var dragSrcEl = null;
function HandleDragStart(e)
{
    dragSrcEl = e.target;
    dragSrcEl.style.opacity = '0.4';
}

function HandleDragOver(e)
{
    if (e.target.parentElement === dragSrcEl) return;
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function HandleDragEnter(e)
{
    if (e.target.parentElement === dragSrcEl) return;
    e.target.classList.add('drag-over');
}

function HandleDragLeave(e)
{
    if (e.target.parentElement === dragSrcEl) return;
    e.target.classList.remove('drag-over');
}

function HandleDragEnd(e)
{
    dragSrcEl.style.opacity = '1';
    dragSrcEl = null;
}

function HandleDrop(e)
{
    if (dragSrcEl)
    {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        e.target.classList.remove('drag-over');
        let parent = e.target.parentElement;
        let isBottom = e.target.getAttribute("side") === "bottom";
        parent.parentElement.insertBefore(dragSrcEl, isBottom ? parent.nextSibling : parent);

        dragSrcEl.style.opacity = '1';
        dragSrcEl = null;
    }
}