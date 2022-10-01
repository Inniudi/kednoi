let dashboard = document.getElementById("dashboard");

function ToggleDashboard(open)
{
    dashboard.setAttribute("open", open);
}

if ("serviceWorker" in navigator)
{
    navigator.serviceWorker.register("sw.js").then(registration =>
    {
        console.log("SW registered");
        console.log(registration);
    }).catch(error =>
    {
        console.log("sw registration failed");
    });
}

function OpenKedProject(input)
{
    let reader = new FileReader();
    reader.addEventListener('load', function (e)
    {
        sessionStorage.setItem("openedKed", e.target.result);
    });
    reader.readAsText(input.files[0]);
    GoToNewFileEditor();
}