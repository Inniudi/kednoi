let blockTemplate = document.getElementById("blockTemplate");

function AddBlock(button)
{
    newBlock = blockTemplate.cloneNode(true);
    button.parentNode.insertBefore(newBlock, button);
    newBlock.style.visibility = "visible";
}

function AddContent(button)
{
    newBlock = blockTemplate.cloneNode(true);
    button.previousSibling.appendChild(newBlock);
    newBlock.style.visibility = "visible";

}