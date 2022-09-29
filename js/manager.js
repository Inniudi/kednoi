function GoToFileEditor(project, version)
{
    sessionStorage.setItem("currentSelectedFile", project);
    sessionStorage.setItem("currentSelectedVersion", version);
    window.location.href = "./pages/editor-SW.html";
}

function GoToNewFileEditor()
{
    sessionStorage.removeItem("currentSelectedFile");
    window.location.href = "./pages/editor-SW.html";
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
