let pageCounterText = document.getElementById("pageText");
let inputElem = document.getElementById("input");
let fontSizeHeight = parseFloat(window.getComputedStyle(inputElem, null).getPropertyValue('font-size')) * 1; //multiplicar por el interlineado (en este caso, 1)

const nonPrintableTypes = [
    "BONEYARD",
    "SYNOPSE",
    "SECTION 1",
    "SECTION 2",
    "SECTION 3"
];

function CountPages()
{
    let height = 0;
    let totalPages = 0;
    for (let child of inputElem.children)
    {
        if (!nonPrintableTypes.includes(child.getAttribute("fntype")))
        {
            if (child.getAttribute("fntype") === "PAGEBREAK")
            {
                totalPages++;
                height = 0;
            }
            height += child.clientHeight;
        }
        if (Math.ceil(height / fontSizeHeight) >= 55)
        {
            totalPages++;
            height = 0;
        }
    }
    pageCounterText.textContent = `≈ ${(totalPages + 1).toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false })}`;
    return totalPages;
}