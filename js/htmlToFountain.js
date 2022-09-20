let blocks = [];
let finalResult;
let finalTitlePage;

let i = 0;

const LineTypes = {
    Empty: "EMPTY",
    SceneHeading: "SCENE_HEADING",
    Action: "ACTION",
    Character: "CHARACTER",
    Parenthetical: "PARENTHETICAL",
    Dialog: "DIALOG",
    Transition: "TRANSITION",
    Centered: "CENTERED",
    PageBreak: "PAGEBREAK",
    Synopse: "SYNOPSE",
    Boneyard: "BONEYARD",
    SectionOne: "SECTION 1",
    SectionTwo: "SECTION 2",
    SectionThree: "SECTION 3"
};

async function ConvertToFountain(html)
{
    finalResult = "";
    let htmlCopy = html.cloneNode(true);
    i = 0;
    blocks = [].slice.call(htmlCopy.children);
    blocks.unshift(CreateType("EMPTY"));
    blocks.push(CreateType("EMPTY"));

    while (i < blocks.length - 1)
    {
        await ConvertEmphasis(blocks[i]);
        while (!BlockIsType(i, blocks[i].getAttribute("fntype")))
        {
            FixBlock(i, blocks[i].getAttribute("fntype"));
        }
        if (i + 1 < blocks.length - 1) blocks[i].textContent += '\n';

        i++;
    }
    blocks.pop();
    blocks.shift();
    blocks.forEach(b => { finalResult += `${b.textContent}`; });
    return finalResult;
}

async function ConvertEmphasis(block)
{
    block.innerHTML = block.innerHTML.replaceAll(/(<[biu]) style=\"\"/gmi, `$1`).replaceAll(/<b>(.*?)<\/b>/gmi, `**$1**`).replaceAll(/<i>(.*?)<\/i>/gmi, `*$1*`).replaceAll(/<u>(.*?)<\/u>/gmi, `_$1_`);
}

function BlockIsType(i, type)
{
    let isFit = false;

    switch (type)
    {
        case LineTypes.SceneHeading:
            if (blocks[i].textContent !== "")
            {
                isFit = (BlockIsType(i - 1, LineTypes.Empty)
                    && BlockIsType(i + 1, LineTypes.Empty)
                    && (/^((?:INT\/EXT|INT.\/EXT|I\/E|INT|EXT|EST){1}(\.|\ )(?:.*))$/gm.test(blocks[i].textContent)
                    )) || (blocks[i].textContent.trim().startsWith(".") && blocks[i].textContent.trim()[1] !== ".");
            }
            break;

        case LineTypes.Action:
            if (blocks[i].textContent !== "")
            {
                isFit = (!BlockIsType(i, LineTypes.Centered)
                    && !BlockIsType(i, LineTypes.Character)
                    && !BlockIsType(i, LineTypes.Dialog)
                    && !BlockIsType(i, LineTypes.Empty)
                    && !BlockIsType(i, LineTypes.Parenthetical)
                    && !BlockIsType(i, LineTypes.SceneHeading)
                    && !BlockIsType(i, LineTypes.Transition))
                    || blocks[i].textContent.trim().startsWith("!");
            }
            break;

        case LineTypes.Character:
            if (blocks[i].textContent !== "")
            {
                isFit = blocks[i].textContent === blocks[i].textContent.toUpperCase()
                    && BlockIsType(i - 1, LineTypes.Empty)
                    && !BlockIsType(i + 1, LineTypes.Empty);
            }
            break;

        case LineTypes.Dialog:
            if (blocks[i].textContent !== "")
            {
                isFit = (!BlockIsType(i - 1, LineTypes.Empty) || blocks[i - 1].innerText === "  ")
                    && (BlockIsType(i - 1, LineTypes.Character)
                        || BlockIsType(i - 1, LineTypes.Parenthetical)
                        || BlockIsType(i - 1, LineTypes.Dialog)
                        || blocks[i - 1].innerText === "  ");
            }
            break;

        case LineTypes.Parenthetical:
            if (blocks[i].textContent !== "")
            {
                isFit = blocks[i].textContent.trim().startsWith("(")
                    && blocks[i].textContent.trim().endsWith(")")
                    && (BlockIsType(i - 1, LineTypes.Character)
                        || BlockIsType(i - 1, LineTypes.Dialog));
            }
            break;

        case LineTypes.Transition:
            if (blocks[i].textContent !== "")
            {
                isFit = (blocks[i].textContent === blocks[i].textContent.toUpperCase()
                    && BlockIsType(i - 1, LineTypes.Empty)
                    && BlockIsType(i + 1, LineTypes.Empty)
                    && blocks[i].textContent.trim().endsWith("TO:"))
                    || (blocks[i].textContent.trim().startsWith(">") && !blocks[i].textContent.trim().endsWith("<"));
            }
            break;

        case LineTypes.Centered:
            if (blocks[i].textContent !== "")
            {
                isFit = blocks[i].textContent.trim().startsWith(">") && blocks[i].textContent.trim().endsWith("<");
            }
            break;

        case LineTypes.Empty:
            isFit = blocks[i].textContent.trim() === "";
            break;

        case LineTypes.Boneyard:
            isFit = /^\/\*.*?\*\//m.test(blocks[i].textContent.trim());
            break;

        case LineTypes.Synopse:
            isFit = /^\={1}/m.test(blocks[i].textContent.trim());
            break;

        case LineTypes.PageBreak:
            isFit = blocks[i].textContent.trim() === "===";
            break;

        case LineTypes.SectionOne:
            isFit = /^#{1}/m.test(blocks[i].textContent.trim());
            break;

        case LineTypes.SectionTwo:
            isFit = /^#{2}/m.test(blocks[i].textContent.trim());
            break;

        case LineTypes.SectionThree:
            isFit = /^#{3}/m.test(blocks[i].textContent.trim());
            break;

        default:
            break;
    };

    return isFit;
}

function FixBlock(i, type)
{
    switch (type)
    {
        case LineTypes.SceneHeading:
            if (!BlockIsType(i - 1, LineTypes.Empty)) blocks.splice(i, 0, CreateType("EMPTY"));
            else if (!BlockIsType(i + 1, LineTypes.Empty)) blocks.splice(i + 1, 0, CreateType("EMPTY"));
            else if (!(blocks[i].textContent.trim().startsWith("INT")
                || blocks[i].textContent.trim().startsWith("EXT")
                || blocks[i].textContent.trim().startsWith("EST")
                || blocks[i].textContent.trim().startsWith("INT./EXT")
                || blocks[i].textContent.trim().startsWith("INT/EXT")
                || blocks[i].textContent.trim().startsWith("I/E")
            )) blocks[i].textContent = `.${blocks[i].textContent}`;
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Action:
            if (BlockIsType(i - 1, LineTypes.Dialog)) blocks.splice(i, 0, CreateType("EMPTY"));
            else if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = `!${blocks[i].textContent}`;
            break;

        case LineTypes.Character:
            if (blocks[i].textContent !== blocks[i].textContent.toUpperCase()) blocks[i].textContent = blocks[i].textContent.toUpperCase();
            else if (!BlockIsType(i - 1, LineTypes.Empty)) blocks.splice(i, 0, CreateType("EMPTY"));
            else if (BlockIsType(i + 1, LineTypes.Empty)) blocks.splice(i + 1, 1);
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Dialog:
            if (!(BlockIsType(i - 1, LineTypes.Character) || BlockIsType(i - 1, LineTypes.Parenthetical) || BlockIsType(i - 1, LineTypes.Dialog)) && BlockIsType(i - 1, LineTypes.Empty)) blocks[i - 1].textContent = "  ";
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Parenthetical:
            if (!blocks[i].textContent.trim().startsWith("(")) blocks[i].textContent = `(${blocks[i].textContent}`;
            else if (!blocks[i].textContent.trim().endsWith(")")) blocks[i].textContent = `${blocks[i].textContent})`;
            else if (!(BlockIsType(i - 1, LineTypes.Character) || BlockIsType(i - 1, LineTypes.Dialog)) && BlockIsType(i - 1, LineTypes.Empty)) blocks.splice(i - 1, 1);
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Transition:
            if (!blocks[i].textContent === blocks[i].textContent.toUpperCase()) blocks[i].textContent = blocks[i].textContent.toUpperCase();
            else if (!BlockIsType(i - 1, LineTypes.Empty)) blocks.splice(i, 0, CreateType("EMPTY"));
            else if (!BlockIsType(i + 1, LineTypes.Empty)) blocks.splice(i + 1, 0, CreateType("EMPTY"));
            else if (!blocks[i].textContent.trim().endsWith("TO:")) blocks[i].textContent = `>${blocks[i].textContent}`;
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Centered:
            if (!blocks[i].textContent.trim().startsWith(">")) blocks[i].textContent = `>${blocks[i].textContent}`;
            else if (!blocks[i].textContent.trim().endsWith("<")) blocks[i].textContent = `${blocks[i].textContent}<`;
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.Empty:
            if (!blocks[i].textContent.trim() === "") blocks[i].textContent = "";
            else
            {
                newBlock = CreateType("ACTION");
                newBlock.textContent = blocks[i].textContent;
                blocks.splice(i, 1, newBlock);
            }
            break;

        case LineTypes.PageBreak:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = '\n===\n';
            break;

        case LineTypes.Boneyard:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = blocks[i].textContent.replace(/(?:^\/\*)?(.*)(?:\*\/)?/m, `/*$1*/`);
            break;

        case LineTypes.Synopse:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = blocks[i].textContent.replace(/(?:^\=)?(.*)/m, `=$1`);
            break;

        case LineTypes.SectionOne:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = blocks[i].textContent.replace(/(?:^\#)*?(.*)/m, `#$1`);
            break;

        case LineTypes.SectionTwo:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = blocks[i].textContent.replace(/(?:^\#)*?(.*)/m, `##$1`);
            break;

        case LineTypes.SectionThree:
            if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
            else blocks[i].textContent = blocks[i].textContent.replace(/(?:^\#)*?(.*)/m, `###$1`);
            break;

        default:
            if (blocks[i].tagName.toUpperCase() === "SPAN")
            {
                if (blocks[i].textContent.trim() === "") blocks.splice(i, 1);
                else
                {
                    console.log(blocks[i].textContent.trim);
                    newBlock = CreateType("ACTION");
                    newBlock.textContent = blocks[i].textContent;
                    blocks.splice(i, 1, newBlock);
                }
            }
            else
            {
                if (BlockIsType(i, LineTypes.Empty)) blocks.splice(i, 1, CreateType("EMPTY"));
                else
                {
                    newBlock = CreateType("ACTION");
                    newBlock.textContent = blocks[i].textContent;
                    blocks.splice(i, 1, newBlock);
                }
            }
            break;
    }
}

function ConvertToFountainTitlePage()
{
    loadedPrefs = new UserPrefs();
    Object.assign(loadedPrefs, JSON.parse(localStorage.getItem("UserPrefs")));
    let titlePageLines = [];

    if (exportTitlePage.checked)
    {
        if (titleInput.value.length > 0) titlePageLines.push(`Title: ${titleInput.value}`);
        if (episodeCheck.checked) titlePageLines.push(`Episode: ${episodeInput.value}`);
        if (creditCheck.checked) titlePageLines.push(`Credit: ${creditInput.value}`);
        if (authorInput.value.length > 0) titlePageLines.push(`Author: ${authorInput.value}`);
        if (sourceCheck.checked) titlePageLines.push(`Source: ${sourceInput.value}`);
        if ((exportVersion.checked && versionInput.value.length > 0) || exportDate.checked)
        {
            titlePageLines.push(`Draft date:`);
            if (exportVersion.checked && versionInput.value.length > 0) titlePageLines.push(`    ${versionInput.value}`);
            if (exportDate.checked)
            {
                dateLastMod = new Date(parseInt(loadedVersion.versionLastMod || Date.now()));
                titlePageLines.push(`    ${dateLastMod.getDate()}/${dateLastMod.getMonth() + 1}/${dateLastMod.getFullYear()}`);
            }
        }
        if (contactCheck.checked) titlePageLines.push(`Contact: ${contactInput.value}`);

        if (titlePageLines.length > 0) titlePageLines.push("\n\n");
    }

    finalTitlePage = titlePageLines.join('\n');
    return finalTitlePage;
}

function CreateType(fntype)
{
    let e = document.createElement("div");
    e.setAttribute("fntype", fntype);
    return e;
}