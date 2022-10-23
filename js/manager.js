function GoToFileEditor(project, version, type, scope)
{
    sessionStorage.setItem("currentSelectedFile", project);
    sessionStorage.setItem("currentSelectedVersion", version);
    window.location.href = `${scope}pages/editor-${type}.html`;
}

function GoToNewSPEditor()
{
    sessionStorage.removeItem("currentSelectedFile");
    window.location.href = "../pages/editor-SP.html";
}

function GoToNewGDEditor()
{
    sessionStorage.removeItem("currentSelectedFile");
    window.location.href = "../pages/editor-GD.html";
}

function GoToDashboard()
{
    if (!saved)
    {
        if (confirm("¡Hey, que no has guardado! ¿Quieres salir de todos modos?"))
        {
            window.location.href = '../index.html';
        }
    }
    else window.location.href = '../index.html';
}

const ProjectStatus = {
    WIP: "WIP",
    Revision: "en revisión",
    Draft: "borrador",
    Complete: "terminado"
};