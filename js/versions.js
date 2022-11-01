verListItemTemplate = document.getElementById("verTemplate");
verListContainer = document.getElementById("verContainer");
function SetVersionsList()
{
    verListContainer.innerHTML = "";
    Load();
    for (var i = loadedProject.versions.length - 1; i >= 0; i--)
    {
        ver = new Version();
        Object.assign(ver, loadedProject.versions[i]);

        newCard = verListItemTemplate.cloneNode(true);
        newCard.setAttribute("version", ver.versionId);
        newCard.querySelector("#title").textContent = ver.versionId;
        dateLastMod = new Date(parseInt(ver.versionLastMod));
        newCard.querySelector("#lastMod").textContent = `${dateLastMod.getDate()}/${dateLastMod.getMonth() + 1}/${dateLastMod.getFullYear()}`;
        newCard.querySelector("#status").textContent = ver.versionStatus;

        verListContainer.appendChild(newCard);
        newCard.style.visibility = "visible";
    }
}

function DeleteVersion(versionId)
{
    if (loadedProject.versions.length <= 1) alert("No es posible borrar la única versión que existe de este guion. ");
    else if (confirm("Si continúas, no podrás volver a editar o descargar esta versión."))
    {
        isThisVersion = versionId === loadedVersion.versionId;
        loadedProject.versions.splice(loadedProject.versions.indexOf(loadedProject.GetVersionByID(versionId)), 1);

        loadedProject.lastVersionId = loadedProject.versions[loadedProject.versions.length - 1].versionId;
        localStorage.setItem("SaveF" + fileName, JSON.stringify(loadedProject));

        if (isThisVersion) window.location.href = "../index.html";
        else SetVersionsList();
    }
}

function DeleteProject()
{
    if (confirm("¿Quieres eliminar de forma permanente este proyecto?"))
    {
        localStorage.removeItem("SaveF" + fileName);
        window.location.href = "../index.html";
    }
}

function AddNewVersion()
{
    if (confirm("Esta acción creará una nueva versión a partir de la que se está editando, sea o no la última versión del guion."))
    {
        saved = false;
        SaveFileToLocal(loadedProject.type);
        while (saved === false) { }
        newVersionId = prompt(`Nombra o enumera la nueva versión. La versión actual es \"${loadedVersion.versionId}\".`);
        while (loadedProject.versions.find(x => x.versionId === newVersionId))
        {
            newVersionId = prompt(`¡Ya hay una versión con esa identificación! Nombra o enumera la nueva versión. La versión actual es \"${loadedVersion.versionId}\".`);
        }
        newVersion = new Version();
        Object.assign(newVersion, loadedVersion);
        newVersion.versionId = newVersionId;
        var i = loadedProject.versions.indexOf(loadedProject.versions.find(x => x.versionId === loadedVersion.versionId)) + 1;
        loadedProject.versions.splice(i, 0, newVersion);
        Unsave();
        SaveFileToLocal(loadedProject.type);

        if (confirm("¿Quieres abrir esta versión ahora?"))
        {
            GoToFileEditor(fileName, newVersionId, 'SP', '../');
        }
    }
}