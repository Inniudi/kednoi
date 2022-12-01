let pageCounterText = document.getElementById("pageText");
let inputElem = document.getElementById("input");
let fontSizeHeight = parseFloat(window.getComputedStyle(inputElem, null).getPropertyValue('font-size')) * 1; //multiplicar por el interlineado (en este caso, 1)
let charactersPerLine;
let linesPerPage;

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
    fontSizeHeight = parseFloat(window.getComputedStyle(inputElem, null).getPropertyValue('font-size')) * 1;
    for (let child of inputElem.children)
    {
        if (!nonPrintableTypes.includes(child.getAttribute("fntype")))
        {
            if (child.getAttribute("fntype") === "PAGEBREAK")
            {
                totalPages++;
                height = 0;
            }
            else
            {
                let ratio;
                switch (child.getAttribute("fntype"))
                {
                    case "DIALOG":
                        ratio = child.clientWidth / fontSizeHeight / 24.125;
                        break;

                    case "CHARACTER":
                        ratio = child.clientWidth / fontSizeHeight / 22.9375;
                        break;

                    case "PARENTHETICAL":
                        ratio = child.clientWidth / fontSizeHeight / 26.5;
                        break;

                    default:
                        ratio = child.clientWidth / fontSizeHeight / 36.125;
                        break;
                }
                height += Math.max(child.clientHeight * ratio, fontSizeHeight);
            }
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