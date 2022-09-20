async function exportFountain()
{
    let element = document.createElement('a');

    let content = await ConvertToFountain(htmlOutput);
    let scriptData = ConvertToFountainTitlePage(loadedProject, loadedVersion);
    let file = scriptData + content;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
    element.setAttribute('download', fileName + ".fountain");

    element.click();
    element.remove();

}

async function exportFountainTxt()
{
    let element = document.createElement('a');

    let content = await ConvertToFountain(htmlOutput);
    let scriptData = ConvertToFountainTitlePage(loadedProject, loadedVersion);
    let file = scriptData + content;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
    element.setAttribute('download', fileName + ".txt");

    element.click();
    element.remove();

}

let maxWidths = {
    "SCENE_HEADING": 6,
    "ACTION": 6,
    "CHARACTER": 4,
    "PARENTHETICAL": 4,
    "DIALOG": 4,
    "TRANSITION": 6,
    "CENTERED": 6,
    "EMPTY": 6
};

let margins = {
    "SCENE_HEADING": 1.5,
    "ACTION": 1.5,
    "CHARACTER": 3.7,
    "PARENTHETICAL": 3.1,
    "DIALOG": 2.5,
    "TRANSITION": 7.5,
    "CENTERED": 4.25,
    "EMPTY": 1.5
};

function exportPDF()
{
    if (!confirm("¡Un momentito! Aún no se ha conseguido que las palabras en negrita, cursiva o subrayadas aparezcan en los PDF, pero todo lo demás debería estar en su sitio... Si esto es importante para tu guion, puedes exportarlo a .fountain y convertirlo a PDF en otras herramientas gratuitas online como afterwriting.com")) return;
    window.jsPDF = window.jspdf.jsPDF;

    const doc = new jsPDF({
        orientation: "p",
        unit: "in",
        format: "letter",
        lineHeight: 1
    });

    doc.setDocumentProperties({
        title: loadedScriptData.includeEpisode ? `${loadedScriptData.title} - ${loadedScriptData.episode}` : loadedScriptData.title,
        author: loadedScriptData.author,
        creator: loadedScriptData.author
    });

    doc.addFont("../fonts/Courier Prime.ttf", "Courier Prime", "normal", "normal");
    doc.addFont("../fonts/Courier Prime Bold.ttf", "Courier Prime", "normal", "bold");
    doc.setFont("Courier Prime");
    doc.setFontSize(12);

    if (exportTitlePage.checked)
    {
        let height = 3;
        doc.setFont("Courier Prime", "normal", "bold");
        doc.text(loadedScriptData.title.toUpperCase(), 4.25, height, { align: "center" });
        height += 1 / 72 * 24;
        if (episodeCheck.checked)
        {
            doc.text(loadedScriptData.episode, 4.25, height, { align: "center" });
            height += 1 / 72 * 24;
        }
        height += 1 / 72 * 24;
        doc.setFont("Courier Prime", "normal", "normal");
        if (creditCheck.checked)
        {
            doc.text(loadedScriptData.credit, 4.25, height, { align: "center" });
            height += 1 / 72 * 12;
        }
        doc.text(loadedScriptData.author, 4.25, height, { align: "center" });
        height = 5.6;
        if (sourceCheck.checked)
        {
            doc.text(loadedScriptData.source, 4.25, height, { align: "center" });
        }
        height = 8.6;
        if (contactCheck.checked)
        {
            doc.text(loadedScriptData.contact, 1.5, height, { align: "left" });
        }
        if (exportVersion.checked && versionInput.value.length > 0)
        {
            doc.text(versionInput.value, 7.5, height, { align: "right" });
            height += 1 / 72 * 12;
        }
        if (exportDate.checked)
        {
            dateLastMod = new Date(parseInt(loadedVersion.versionLastMod || Date.now()));
            doc.text(`${dateLastMod.getDate().toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false })}/${(dateLastMod.getMonth() + 1).toLocaleString('es-ES', { minimumIntegerDigits: 2, useGrouping: false })}/${dateLastMod.getFullYear()}`, 7.5, height, { align: "right" });
        }
        doc.addPage();
    }

    let htmlCopy = inputElement.cloneNode(true);
    let currentHeight = 1;
    let currentPage = 1;
    let currentSecOne;
    let currentSecTwo;

    for (let block of htmlCopy.children)
    {
        let type = block.getAttribute("fntype");
        if (!nonPrintableTypes.includes(type))
        {

            let maxWidth = maxWidths[type];
            let margin = margins[type];
            let align = "left";

            switch (type)
            {
                case "PAGEBREAK":
                    if (currentHeight > 1)
                    {
                        doc.addPage();
                        doc.setFont("Courier Prime", "normal", "normal");
                        doc.text(`${++currentPage}.`, 7.5, 0.5, { align: "right" });
                        currentHeight = 1;
                    }
                    continue;
                    break;

                case "SCENE_HEADING":
                    currentHeight += 1 / 72 * 12;
                    doc.setFont("Courier Prime", "normal", "bold");
                    break;

                case "CHARACTER":
                    doc.setFont("Courier Prime", "normal", "bold");
                    break;

                case "TRANSITION":
                    doc.setFont("Courier Prime", "normal", "bold");
                    align = "right";
                    break;

                case "CENTERED":
                    align = "center";
                    break;

                default:
                    doc.setFont("Courier Prime", "normal", "normal");
                    break;
            }

            let splitText = doc.splitTextToSize(block.textContent, maxWidth);
            doc.text(splitText, margin, currentHeight, { align: align });

            currentHeight += splitText.length * (1 / 72 * 12);
            if (currentHeight >= 9)
            {
                doc.addPage();
                doc.setFont("Courier Prime", "normal", "normal");
                doc.text(`${++currentPage}.`, 7.5, 0.5, { align: "right" });
                currentHeight = 1;
            }
        }
        else
        {
            switch (type)
            {
                case "SECTION 1":
                    currentSecOne = doc.outline.add(null, block.textContent.replace('#', ''), { pageNumber: currentPage });
                    break;
                case "SECTION 2":
                    currentSecTwo = doc.outline.add(currentSecOne || null, block.textContent.replace('##', ''), { pageNumber: currentPage });
                    break;
                case "SECTION 3":
                    currentSecTwo = doc.outline.add(currentSecTwo || null, block.textContent.replace('###', ''), { pageNumber: currentPage });
                    break;
            }
        }
    }

    doc.save(`${fileName}.pdf`);
}