fileCardTemplate = document.getElementById("fileCardTemplate");
cardContainer = document.getElementById("cardContainer");

for (var i = 0, len = localStorage.length; i < len; ++i)
{
    if (localStorage.key(i).startsWith("SaveF") && localStorage.key(i).length > 5)
    {
        let projectObj = new SaveFile();
        Object.assign(projectObj, JSON.parse(localStorage.getItem(localStorage.key(i))));
        let currentVersion = new Version();
        Object.assign(currentVersion, projectObj.GetVersionByID(projectObj.lastVersionId));

        let newCard = fileCardTemplate.cloneNode(true);

        newCard.setAttribute("fileName", projectObj.fileSaveName);
        newCard.setAttribute("version", currentVersion.versionId);

        console.log(projectObj.fileSaveName);
        newCard.querySelector(".cardTitle").childNodes[0].textContent = projectObj.fileSaveName;
        newCard.querySelector(".cardDecor").style = "background-color: " + projectObj.color;
        newCard.querySelector(".cardLastMod").textContent = "Últ. mod. " + GetLastModified(Date.now() - currentVersion.versionLastMod);
        newCard.querySelector(".cardLastMod").textContent += " - " + Math.trunc(localStorage.getItem(localStorage.key(i)).toString().length / 1024) + "kb";
        newCard.querySelector(".statusBadge").textContent = currentVersion.versionStatus || "-";
        newCard.querySelector(".statusBadge").setAttribute("status", currentVersion.versionStatus);
        newCard.querySelector(".versionBadge").textContent = currentVersion.versionId || "-";
        newCard.querySelector(".cardImage").style.backgroundImage = "url(" + (projectObj.thumbnail) + ")";

        cardContainer.appendChild(newCard);

        newCard.style.visibility = "visible";
        newCard.removeAttribute("hidden");
        newCard.setAttribute("aria-hidden", "false");
    }
    else continue;
}

function GetLastModified(miliseconds)
{
    seconds = Math.round(miliseconds / 1000);
    if (seconds < 60)
    {
        return "ahora";
    }
    else if (seconds < 3600)
    {
        return `hace ${Math.floor(seconds / 60)} min.`;
    }

    else if (seconds < 7200)
    {
        return "hace 1 hora";
    }
    else if (seconds < 86400)
    {
        return `hace ${Math.floor(seconds / 3600)} horas`;
    }

    else if (seconds < 172800)
    {
        return "hace 1 día";
    }
    else
    {
        return `hace ${Math.floor(seconds / 86400)} días`;
    }
}