let characterTab = document.getElementById("characterScrollBox");
let characterTemplate = document.getElementById("characterTemplate");
let characters = [];
let clickedBttn = null;
const characterCardTemplate = document.getElementById("characterTemplate");
let suggestion = document.getElementById("suggestion");

function CalcDialogPercent(name)
{
    let totalDialog = 0;
    let thisCharacterDialog = 0;

    for (let block of inputElement.children)
    {
        if (block.getAttribute("fntype") === "CHARACTER")
        {
            totalDialog++;
            if (/([A-ZÀ-Ö]+)(?:\s?\(.+)?/gm.exec(block.textContent.trim())[1] === name.toUpperCase()) thisCharacterDialog++;
        }
    }

    let result = thisCharacterDialog * 100 / totalDialog;
    return Math.round((result + Number.EPSILON) * 10) / 10;
}

function UpdateCharacterList()
{
    characters = [];
    let cards = characterTab.getElementsByClassName("characterCard");
    for (i = 0; i < cards.length; i++)
    {
        let mainInfo = cards[i].getElementsByClassName("charMainInfo")[0];
        characters.push(new Character(mainInfo.getElementsByClassName("charName")[0].textContent, mainInfo.getElementsByClassName("charAge")[0].textContent));
        if(editorType === "SP") mainInfo.getElementsByClassName("charDialogPercent")[0].textContent = CalcDialogPercent(mainInfo.getElementsByClassName("charName")[0].textContent) + "% del diálogo";
    }
}

function SetProfilePhotoForCard(button)
{
    var reader = new FileReader();
    reader.addEventListener('load', function ()
    {
        console.log("loaded");
        button.parentElement.parentElement.style.backgroundImage = "url(" + reader.result + ")";
        Unsave();
    });
    reader.readAsDataURL(button.files[0]);
    Unsave();
}

function DeleteCharacter(e)
{
    if (confirm("¿Estás seguro de borrar esto? Que no hay Ctrl+Z..."))
    {
        e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
        Unsave();
    }
}

function AddCharacter(e, bttn)
{
    e.stopPropagation();
    clickedBttn = bttn;

    newBlock = characterCardTemplate.cloneNode(true);

    clickedBttn.parentNode.insertBefore(newBlock, clickedBttn);
    newBlock.style.visibility = "inherit";

    Unsave();
}
