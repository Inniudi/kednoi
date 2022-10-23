let fileLines = [];
let j = 0;

function OpenFile(openInput)
{
    if (typeof observer !== 'undefined') observer.disconnect();
    let reader = new FileReader();
    reader.addEventListener('load', function (e)
    {
        if (!window.confirm("Al importar un archivo, se sobreescribe la versión que tienes abierta. Si no quieres perder nada, añade una nueva versión vacía, crea un proyecto nuevo o descarga una copia de seguridad. ¿Continuamos?"))
        {
            openInput.value = null;
            return;
        }
        if (fileNameInput.value.trim() === "")
        {
            fileNameText.textContent = "Guion sin título";
            fileNameInput.value = "Guion sin título";
        }

        let text = SplitDataFromScript(e.target.result);
        let titlePage = text[0];
        let scriptText = text[1];

        //Title page
        const regex = /^(.*):(?:[ \t]*(\w+.*)|(?:.*\n((?:[ \t]{3,}\w+.+\n)+)))/gm;
        let scriptDataMatches;
        let newScriptData = new ScriptData();
        while ((scriptDataMatches = regex.exec(titlePage)) !== null)
        {
            if (scriptDataMatches.index === regex.lastIndex)
            {
                regex.lastIndex++;
            }

            switch (scriptDataMatches[1].trim())
            {
                case "Title":
                    newScriptData.title = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    if (fileNameInput.value.trim() === "Guion sin título")
                    {
                        fileNameText.textContent = newScriptData.title;
                        fileNameInput.value = newScriptData.title;
                    }
                    break;

                case "Episode":
                    newScriptData.includeEpisode = true;
                    newScriptData.episode = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    break;

                case "Credit":
                    newScriptData.credit = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    newScriptData.includeCredit = true;
                    break;

                case "Author":
                    newScriptData.author = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    break;

                case "Source":
                    newScriptData.source = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    newScriptData.includeSource = true;
                    break;

                case "Contact":
                    newScriptData.contact = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    newScriptData.includeContact = true;
                    break;

                case "Draft date":
                    let info = (scriptDataMatches[2] || scriptDataMatches[3]).trim();
                    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(info))
                    {
                        let date = /\d{1,2}\/\d{1,2}\/\d{4}/.exec(info)[0].trim().replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, `$3-$2-$1`);
                        loadedVersion.versionLastMod = Date.parse(date);
                        versionInput.value = info.replace(/\d{1,2}\/\d{1,2}\/\d{4}/, "").trim();
                    }
                    break;

                default:
                    window.alert(`¡Ooops! La siguiente información no ha podido ser extraída. Añadela manualmente o anótala. [${scriptDataMatches[1].trim()}: ${(scriptDataMatches[2] || scriptDataMatches[3]).trim()}]`);
                    break;
            }

            loadedScriptData = newScriptData;
            LoadScriptData();
        }

        //Actual script
        j = 0;
        let splitLines = scriptText.split(`\n`);
        fileLines = [];
        for (var k = 0; k < splitLines.length; k++)
        {
            fileLines.push(`${splitLines[k]}\n`);
        }

        htmlOutput.innerHTML = "";
        ConvertLines();

        Observe();

        SaveFileToLocal(loadedProject.type, loadedVersion.versionLastMod);
        CountPages();
    });
    reader.readAsText(openInput.files[0]);
}

function SplitDataFromScript(text)
{
    if (text.length <= 0) return;

    text = text.replaceAll('\r\n', '\n');
    let regEx = /^\s*((?:.+?:(?:(?:[ \t]*|\n).+\n)+)+)?\s*([\S\s]*)/.exec(text);
    let result = [regEx[1], regEx[2]];

    return result;
}

function ConvertLines()
{
    while (j < fileLines.length)
    {
        let type = GetLineType(j);
        let lineContent;

        switch (type)
        {
            case LineTypes.SceneHeading:
                if (fileLines[j].trim().startsWith(`.`))
                {
                    lineContent = fileLines[j].trim().slice(1);
                }
                else lineContent = fileLines[j];
                break;

            case LineTypes.Transition:
                if (fileLines[j].trim().startsWith(`>`))
                {
                    lineContent = fileLines[j].trim().slice(1);
                }
                else lineContent = fileLines[j];
                break;

            case LineTypes.Centered:
                if (fileLines[j].trim().startsWith(`>`))
                {
                    lineContent = fileLines[j].trim().slice(1, fileLines[j].trim().length - 1);
                }
                else lineContent = fileLines[j];
                break;

            case LineTypes.Transition:
                if (fileLines[j].trim().startsWith(`>`))
                {
                    lineContent = fileLines[j].trim().slice(1);
                }
                else lineContent = fileLines[j];
                break;

            case LineTypes.Action:
                if (fileLines[j].trim().startsWith(`!`))
                {
                    lineContent = fileLines[j].trim().slice(1);
                }
                else lineContent = fileLines[j];
                break;

            case LineTypes.PageBreak:
                lineContent = "===";
                break;

            case LineTypes.Synopse:
                lineContent = fileLines[j].replace(/(?:^\=)(.*)/m, `=$1`);
                break;

            case LineTypes.Boneyard:
                lineContent = fileLines[j].replace(/(?:^\/\*)(.*)(?:\*\/)/m, `/*$1`);
                break;

            case LineTypes.SectionOne:
                lineContent = fileLines[j];
                break;

            case LineTypes.SectionTwo:
                lineContent = fileLines[j];
                break;

            case LineTypes.SectionThree:
                lineContent = fileLines[j];
                break;

            case LineTypes.Empty:
                lineContent = fileLines[j];
                break;

            default:
                lineContent = fileLines[j].trim().length > 0 ? fileLines[j] : "";
                break;
        }

        let newBlock = document.createElement("DIV");
        newBlock.setAttribute("fntype", type);
        newBlock.setAttribute("autoformat", "false");
        htmlOutput.appendChild(newBlock);

        lineContent = lineContent.replaceAll('\n', '<br>');

        newBlock.innerHTML = ParseEmphasis(lineContent);

        j++;
    }
}

function GetLineType(j)
{
    if (LineIsType(j, LineTypes.Empty)) return LineTypes.Empty;
    else if (LineIsType(j, LineTypes.PageBreak)) return LineTypes.PageBreak;
    else if (LineIsType(j, LineTypes.Boneyard)) return LineTypes.Boneyard;
    else if (LineIsType(j, LineTypes.Synopse)) return LineTypes.Synopse;
    else if (LineIsType(j, LineTypes.SectionThree)) return LineTypes.SectionThree;
    else if (LineIsType(j, LineTypes.SectionTwo)) return LineTypes.SectionTwo;
    else if (LineIsType(j, LineTypes.SectionOne)) return LineTypes.SectionOne;
    else if (LineIsType(j, LineTypes.SceneHeading)) return LineTypes.SceneHeading;
    else if (LineIsType(j, LineTypes.Character)) return LineTypes.Character;
    else if (LineIsType(j, LineTypes.Parenthetical)) return LineTypes.Parenthetical;
    else if (LineIsType(j, LineTypes.Dialog)) return LineTypes.Dialog;
    else if (LineIsType(j, LineTypes.Centered)) return LineTypes.Centered;
    else if (LineIsType(j, LineTypes.Transition)) return LineTypes.Transition;
    else return LineTypes.Action;
}

function LineIsType(j, type)
{
    isFit = false;

    switch (type)
    {
        case LineTypes.SceneHeading:
            if (fileLines[j] !== "")
            {
                isFit = (((j > 0 && LineIsType(j - 1, LineTypes.Empty)) || j === 0)
                    && LineIsType(j + 1, LineTypes.Empty)
                    && (fileLines[j].trim().startsWith("INT")
                        || fileLines[j].trim().startsWith("EXT")
                        || fileLines[j].trim().startsWith("EST")
                        || fileLines[j].trim().startsWith("INT./EXT")
                        || fileLines[j].trim().startsWith("INT/EXT")
                        || fileLines[j].trim().startsWith("I/E")
                    )) || (fileLines[j].trim().startsWith(".") && fileLines[j].trim()[1] !== ".");
            }
            break;

        case LineTypes.Action:
            if (fileLines[j] !== "")
            {
                isFit = (!LineIsType(j, LineTypes.Centered)
                    && !LineIsType(j, LineTypes.Boneyard)
                    && !LineIsType(j, LineTypes.Synopse)
                    && !LineIsType(j, LineTypes.PageBreak)
                    && !LineIsType(j, LineTypes.SectionOne)
                    && !LineIsType(j, LineTypes.SectionTwo)
                    && !LineIsType(j, LineTypes.SectionThree)
                    && !LineIsType(j, LineTypes.Character)
                    && !LineIsType(j, LineTypes.Dialog)
                    && !LineIsType(j, LineTypes.Empty)
                    && !LineIsType(j, LineTypes.Parenthetical)
                    && !LineIsType(j, LineTypes.SceneHeading)
                    && !LineIsType(j, LineTypes.Transition))
                    || fileLines[j].trim().startsWith("!");
            }
            break;

        case LineTypes.Character:
            if (fileLines[j] !== "")
            {
                isFit = fileLines[j] === fileLines[j].toUpperCase()
                    && j > 0 && LineIsType(j - 1, LineTypes.Empty)
                    && !LineIsType(j + 1, LineTypes.Empty);
            }
            break;

        case LineTypes.Dialog:
            if (fileLines[j] !== "")
            {
                isFit = j > 0 && !LineIsType(j - 1, LineTypes.Empty) && (LineIsType(j - 1, LineTypes.Character)
                    || LineIsType(j - 1, LineTypes.Parenthetical)
                    || LineIsType(j - 1, LineTypes.Dialog));
            }
            break;

        case LineTypes.Parenthetical:
            if (fileLines[j] !== "")
            {
                isFit = fileLines[j].trim().startsWith("(")
                    && fileLines[j].trim().endsWith(")")
                    && (j > 0 && LineIsType(j - 1, LineTypes.Character)
                        || (j > 0 && LineIsType(j - 1, LineTypes.Dialog)));
            }
            break;

        case LineTypes.Transition:
            if (fileLines[j] !== "")
            {
                isFit = (fileLines[j] === fileLines[j].toUpperCase()
                    && j > 0 && LineIsType(j - 1, LineTypes.Empty)
                    && LineIsType(j + 1, LineTypes.Empty)
                    && fileLines[j].trim().endsWith("TO:"))
                    || (fileLines[j].trim().startsWith(">") && !fileLines[j].trim().endsWith("<"));
            }
            break;

        case LineTypes.Centered:
            if (fileLines[j] !== "")
            {
                isFit = fileLines[j].trim().startsWith(">") && fileLines[j].trim().endsWith("<");
            }
            break;

        case LineTypes.PageBreak:
            if (fileLines[j] !== "")
            {
                isFit = fileLines[j].trim() === "===";
            }
            break;

        case LineTypes.Boneyard:
            if (fileLines[j] !== "")
            {
                isFit = /(?:^\/\*){1}(.+)(?:\*\/){1}/m.test(fileLines[j]);
            }
            break;

        case LineTypes.Synopse:
            if (fileLines[j] !== "")
            {
                isFit = /(?:^\={1})(.*)/m.test(fileLines[j]);
            }
            break;

        case LineTypes.SectionOne:
            if (fileLines[j] !== "")
            {
                isFit = /(?:^#{1})(.*)/m.test(fileLines[j]);
            }
            break;

        case LineTypes.SectionTwo:
            if (fileLines[j] !== "")
            {
                isFit = /(?:^#{2})(.*)/m.test(fileLines[j]);
            }
            break;

        case LineTypes.SectionThree:
            if (fileLines[j] !== "")
            {
                isFit = /(?:^#{3})(.*)/m.test(fileLines[j]);
            }
            break;

        case LineTypes.Empty:
            isFit = !fileLines[j] || fileLines[j].trim() === "";
            break;
    };

    return isFit;
}

function ParseEmphasis(t)
{
    let result = t.replaceAll(/\*\*(.*?)\*\*/gmi, `<b>$1</b>`).replaceAll(/\*(.*?)\*/gmi, `<i>$1</i>`).replaceAll(/\_(.*?)\_/gmi, `<u>$1</u>`);
    return result;
}