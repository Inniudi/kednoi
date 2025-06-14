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

function exportCoTXT()
{
    let htmlCopy = editorContainer.cloneNode(true);
    let currentPage = 1;
    let currentPanel = 1;

    let element = document.createElement('a');

    let content = "";

    for (let block of htmlCopy.querySelectorAll("block"))
    {
        let blockType = block.getAttribute("type");
        let container = block.querySelector(".co-block-container");
        let text = htmlToPlainText(container.querySelector(".co-block-content").innerHTML);

        switch (blockType)
        {
            case "page":
                content += `\n` + "PÁGINA " + currentPage.toString() + `\n`;
                currentPage++;
                currentPanel = 1;
                break;

            case "panel":
                content += "VIÑETA " + currentPage.toString() + `\n`;
                currentPanel++;
                break;
        }

        content += text + `\n`;
    }

    let scriptData = ConvertToFountainTitlePage(loadedProject, loadedVersion);
    let file = scriptData + content;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
    element.setAttribute('download', fileName + ".txt");

    element.click();
    element.remove();
}

function htmlToPlainText(html)
{
    return html
        .replace(/<div>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}

function exportKedFile(text)
{
    let element = document.createElement('a');

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `${fileName}.ked`);

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

let marginsLetter = {
    "SCENE_HEADING": 1.5,
    "ACTION": 1.5,
    "CHARACTER": 3.7,
    "PARENTHETICAL": 3.1,
    "DIALOG": 2.5,
    "TRANSITION": 7.5,
    "CENTERED": 4.25,
    "EMPTY": 1.5
};

let marginsA4 = {
    "SCENE_HEADING": 1.35,
    "ACTION": 1.35,
    "CHARACTER": 3.55,
    "PARENTHETICAL": 2.95,
    "DIALOG": 2.35,
    "TRANSITION": 7.35,
    "CENTERED": 4.05,
    "EMPTY": 1.35
};

function exportPDF(mode)
{
    console.log(loadedScriptData.author);
    if (!confirm("¡Un momentito! Aún no se ha conseguido que las palabras en negrita, cursiva o subrayadas aparezcan en los PDF, pero todo lo demás debería estar en su sitio... Si esto es importante para tu guion, puedes exportarlo a .fountain y convertirlo a PDF en otras herramientas gratuitas online como afterwriting.com")) return;
    window.jsPDF = window.jspdf.jsPDF;
    let margins = mode === "letter" ? marginsLetter : marginsA4;

    const doc = new jsPDF({
        orientation: "p",
        unit: "in",
        format: mode,
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
        doc.setFontSize(18);
        doc.text(loadedScriptData.title.toUpperCase(), 4.25, height, { align: "center" });
        height += 1 / 72 * 36;
        if (episodeCheck.checked)
        {
            doc.setFontSize(14);
            doc.text(loadedScriptData.episode, 4.25, height, { align: "center" });
            height += 1 / 72 * 28;
        }
        height += 1 / 72 * 24;
        doc.setFont("Courier Prime", "normal", "normal");
        doc.setFontSize(12);
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
    let currentScene = 0;
    doc.setFontSize(12);

    for (let block of htmlCopy.children)
    {
        let type = block.getAttribute("fntype");
        if (!nonPrintableTypes.includes(type))
        {
            let maxWidth = maxWidths[type];
            let margin = margins[type];
            let align = "left";

            if (type === "PAGEBREAK")
            {
                if (currentHeight > 1)
                {
                    doc.addPage();
                    doc.setFont("Courier Prime", "normal", "normal");
                    doc.text(`${++currentPage}.`, 7.5, 0.5, { align: "right" });
                    currentHeight = 1;
                }
                continue;
            }

            let splitText = doc.splitTextToSize(block.textContent, maxWidth);
            let lineCountDifference = Math.round((10.17 - currentHeight) / (1 / 72 * 12));
            if (lineCountDifference < splitText.length)
            {
                let firstHalf = splitText.slice(0, lineCountDifference);
                let secondHalf = splitText.slice(lineCountDifference, splitText.length);

                switch (type)
                {
                    case "SCENE_HEADING":
                        currentHeight += 1 / 72 * 12;
                        doc.setFont("Courier Prime", "normal", "bold");
                        currentScene++;
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

                doc.text(firstHalf, margin, currentHeight, { align: align });
                currentHeight += firstHalf.length * (1 / 72 * 12);

                doc.addPage();
                doc.setFont("Courier Prime", "normal", "normal");
                doc.text(`${++currentPage}.`, 7.5, 0.5, { align: "right" });
                currentHeight = 1;
                console.log(currentScene);

                switch (type)
                {
                    case "SCENE_HEADING":
                        doc.setFont("Courier Prime", "normal", "bold");
                        if (sceneNsLeft.checked) doc.text(`${currentScene}`, margin - 0.3, currentHeight, { align: "right" });
                        if (sceneNsRight.checked) doc.text(`${currentScene}`, margin + maxWidth + 0.2, currentHeight, { align: "left" });
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

                doc.text(secondHalf, margin, currentHeight, { align: align });
                currentHeight += secondHalf.length * (1 / 72 * 12);
            }
            else
            {
                if ((type === "SCENE_HEADING" && lineCountDifference <= 2) || (type === "CHARACTER" && lineCountDifference <= 2))
                {
                    doc.addPage();
                    doc.setFont("Courier Prime", "normal", "normal");
                    doc.text(`${++currentPage}.`, 7.5, 0.5, { align: "right" });
                    currentHeight = 1;
                }
                switch (type)
                {
                    case "SCENE_HEADING":
                        if (currentHeight > 1) currentHeight += 1 / 72 * 12;
                        doc.setFont("Courier Prime", "normal", "bold");
                        currentScene++;
                        if (sceneNsLeft.checked) doc.text(`${currentScene}`, margin - 0.3, currentHeight, { align: "right" });
                        if (sceneNsRight.checked) doc.text(`${currentScene}`, margin + maxWidth + 0.2, currentHeight, { align: "left" });
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
                doc.text(splitText, margin, currentHeight, { align: align });
                currentHeight += splitText.length * (1 / 72 * 12);
            }
        }
        else
        {
            switch (type)
            {
                case "SECTION 1":
                    currentSecOne = doc.outline.add(null, block.textContent.replace('#', ''), { pageNumber: currentPage + 1 });
                    break;
                case "SECTION 2":
                    currentSecTwo = doc.outline.add(currentSecOne || null, block.textContent.replace('##', ''), { pageNumber: currentPage + 1 });
                    break;
                case "SECTION 3":
                    currentSecThree = doc.outline.add(currentSecTwo || null, block.textContent.replace('###', ''), { pageNumber: currentPage + 1 });
                    break;
                case "BONEYARD":
                    if (exportBoneyards.checked) doc.createAnnotation({ type: "text", title: "/*", bounds: { x: 0.5, y: currentHeight - (1 / 72 * 18), w: 0.2, h: 0.2 }, contents: `${block.textContent.replace(/\/\*(.*)(?:\*\/)?/, `$1`)}`, open: false });
                    break;
            }
        }
    }

    doc.save(`${fileName}.pdf`);
}

function exportCoPDF(mode)
{
    if (!confirm("¡Un momentito! Aún no se ha conseguido que las palabras en negrita, cursiva o subrayadas aparezcan en los PDF, pero todo lo demás debería estar en su sitio... Si esto es importante para tu guion, puedes exportarlo a .fountain y convertirlo a PDF en otras herramientas gratuitas online como afterwriting.com")) return;
    window.jsPDF = window.jspdf.jsPDF;
    let margins = mode === "letter" ? marginsLetter : marginsA4;

    const doc = new jsPDF({
        orientation: "p",
        unit: "in",
        format: mode,
        lineHeight: 1
    });

    doc.setDocumentProperties({
        title: loadedScriptData.includeEpisode ? `${loadedScriptData.title} - ${loadedScriptData.episode}` : loadedScriptData.title,
        author: loadedScriptData.author,
        creator: loadedScriptData.author
    });

    doc.addFont("../fonts/Courier Prime.ttf", "Lexend", "normal", "normal");
    doc.addFont("../fonts/Courier Prime.ttf", "Courier Prime", "normal", "normal");
    doc.addFont("../fonts/Courier Prime Bold.ttf", "Courier Prime", "normal", "bold");
    doc.setFont("Courier Prime");
    doc.setFontSize(12);

    if (exportTitlePage.checked)
    {
        let height = 3;
        doc.setFont("Courier Prime", "normal", "bold");
        doc.setFontSize(18);
        doc.text(loadedScriptData.title.toUpperCase(), 4.25, height, { align: "center" });
        height += 1 / 72 * 36;
        if (episodeCheck.checked)
        {
            doc.setFontSize(14);
            doc.text(loadedScriptData.episode, 4.25, height, { align: "center" });
            height += 1 / 72 * 28;
        }
        height += 1 / 72 * 24;
        doc.setFont("Courier Prime", "normal", "normal");
        doc.setFontSize(12);
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

    let htmlCopy = editorContainer.cloneNode(true);
    let currentHeight = 1;
    let currentPage = 1;
    let currentPanel = 1;
    let currentSecOne;
    let currentSecTwo;

    doc.setFontSize(12);

    for (let block of htmlCopy.querySelectorAll("block"))
    {
        let blockType = block.getAttribute("type");
        let container = block.querySelector(".co-block-container");
        let text = "";
        let maxWidth = 6.5;

        text = htmlToPlainText(container.querySelector(".co-block-content").innerHTML);
        let splitText = doc.splitTextToSize(text, maxWidth);

        switch (blockType)
        {
            case "page":
                doc.setFont("Courier Prime", "normal", "bold");
                currentHeight += 1 / 72 * 12;
                doc.text("PÁGINA " + currentPage.toString(), margins["SCENE_HEADING"], currentHeight, { align: "left" });
                currentPage++;
                currentPanel = 1;
                currentHeight += 1 / 72 * 12;
                break;

            case "panel":
                doc.setFont("Courier Prime", "normal", "bold");
                currentHeight += 1 / 72 * 12;
                doc.text("VIÑETA " + currentPanel.toString(), margins["SCENE_HEADING"] + 0.25, currentHeight, { align: "left" });
                currentPanel++;
                currentHeight += 1 / 72 * 12;
                break;
        }

        switch (blockType)
        {
            case "panel":
                doc.setFont("Courier Prime", "normal", "normal");
                doc.text(splitText, margins["ACTION"] + 0.25, currentHeight, { align: "left" });
                console.log(margins["ACTION"] + 0.5);
                break;

            case "bubble":
                currentHeight += 1 / 72 * 12;
                doc.setFont("Courier Prime", "normal", "normal");
                doc.text(splitText, margins["DIALOG"], currentHeight, { align: "left" });
                break;

            default:
                doc.setFont("Courier Prime", "normal", "normal");
                doc.text(splitText, margins["ACTION"], currentHeight, { align: "left" });
                break;
        }
        currentHeight += splitText.length * (1 / 72 * 12);
    }

    doc.save(`${fileName}.pdf`);
}

function exportGdPDF()
{
    /*window.jsPDF = window.jspdf.jsPDF;
 
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
 
    doc.addFont("../fonts/Courier Prime.ttf", "Lexend", "normal", "normal");
    doc.addFont("../fonts/Courier Prime.ttf", "Courier Prime", "normal", "normal");
    doc.addFont("../fonts/Courier Prime Bold.ttf", "Courier Prime", "normal", "bold");
    doc.setFont("Courier Prime");
    doc.setFontSize(12);
 
    if (exportTitlePage.checked)
    {
        let height = 3;
        doc.setFont("Courier Prime", "normal", "bold");
        doc.setFontSize(18);
        doc.text(loadedScriptData.title.toUpperCase(), 4.25, height, { align: "center" });
        height += 1 / 72 * 36;
        if (episodeCheck.checked)
        {
            doc.setFontSize(14);
            doc.text(loadedScriptData.episode, 4.25, height, { align: "center" });
            height += 1 / 72 * 28;
        }
        height += 1 / 72 * 24;
        doc.setFont("Courier Prime", "normal", "normal");
        doc.setFontSize(12);
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
 
    let htmlCopy = editorContainer.cloneNode(true);
    let currentHeight = 1;
    let currentPage = 1;
    let currentSecOne;
    let currentSecTwo;
    let currentScene = 0;
 
    let blockPadding = 0.1;
    let blockMargin = 0.1;
    doc.setFontSize(12);
 
    for (let block of htmlCopy.querySelectorAll("block"))
    {
        let blockType = block.getAttribute("type");
        let container = block.querySelector(".gd-block-container");
        let text = "";
        let currentBlockHeight = 0.1;
        let maxWidth = 6.5;
        switch (blockType)
        {
            case "section":
                text = container.querySelector(".gd-block-content").textContent;
                //collapsable content
                break;
 
            case "destination":
                text = container.querySelector("#idContainer").querySelector("#blockIdText").textContent;
                break;
 
            default:
                if (container.children[0].classList.contains("gd-block-content"))
                {
                    text = container.children[0].textContent;
                }
                else
                {
                    DealWithThisBlockCHildren(doc, block);
                }
                break;
        }
 
        let splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, 1 + blockPadding, currentHeight + blockPadding + blockMargin, { align: "left" });
        currentBlockHeight += splitText.length * (1 / 72 * 12) + blockPadding * 2 + blockMargin * 2;
 
        doc.setLineWidth(0.01);
        doc.roundedRect(1, currentHeight, 6.5, currentBlockHeight, 0.1, 0.1);
        currentHeight += splitText.length * (1 / 72 * 12) + blockMargin * 2 + blockPadding * 2;
 
        console.log(block);
    }
 
    doc.output("dataurlnewwindow");*/

    window.print();
}