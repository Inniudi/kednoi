let autoSaveToggle = document.getElementById("autoSaveSwitch");

let exportTitlePage = document.getElementById("exportTitle");
let exportVersion = document.getElementById("exportVersion");
let exportDate = document.getElementById("exportDate");

let themeSelect = document.getElementById("themeSelect");
let sansEnabled = document.getElementById("sansEnabled");
let boldHeadings = document.getElementById("boldHeadings");
let boldCharacters = document.getElementById("boldCharacters");
let boldTransitions = document.getElementById("boldTransitions");
let headingHighlight = document.getElementById("headingHighlight");
let sceneNumbers = document.getElementById("sceneNumbers");
let sceneNsLeft = document.getElementById("sceneNumbersLeft");
let sceneNsRight = document.getElementById("sceneNumbersRight");
let exportBoneyards = document.getElementById("exportBoneyards");
let paperTexCheck = document.getElementById("paperTexCheck");

let fontsLink = document.getElementById("fontsLink");
let themeLink = document.getElementById("themeLink");

let paperTex = document.getElementById("paperTex");

function SavePreferences()
{
    newPrefs = new UserPrefs(
        autoSaveToggle.checked,
        exportTitlePage.checked,
        exportVersion.checked,
        exportDate.checked,
        themeSelect.value,
        sansEnabled ? sansEnabled.checked : true,
        boldHeadings ? boldHeadings.checked : true,
        boldCharacters ? boldCharacters.checked : true,
        boldTransitions ? boldTransitions.checked : true,
        headingHighlight ? headingHighlight.checked : true,
        sceneNumbers ? sceneNumbers.checked : true,
        sceneNsLeft ? sceneNsLeft.checked : false,
        sceneNsRight ? sceneNsRight.checked : false,
        exportBoneyards ? exportBoneyards.checked : false,
        paperTexCheck ? paperTexCheck.checked : true
    );
    localStorage.setItem("UserPrefs", JSON.stringify(newPrefs));
}

function LoadPreferences()
{
    loadedPrefs = new UserPrefs();
    Object.assign(loadedPrefs, JSON.parse(localStorage.getItem("UserPrefs")));
    autoSaveToggle.checked = loadedPrefs.autoSaveEnabled;
    ToggleAutoSave();
    exportTitlePage.checked = loadedPrefs.includeTitlePage;
    exportVersion.checked = loadedPrefs.includeVersionId;
    exportDate.checked = loadedPrefs.includeVersionLastMod;
    themeSelect.value = loadedPrefs.theme;
    SetTheme();
    if (sansEnabled) sansEnabled.checked = loadedPrefs.sansSerifEnabled;
    ToggleFont();
    if (boldHeadings) boldHeadings.checked = loadedPrefs.boldHeadings;
    ToggleBoldHeadings();
    if (boldCharacters) boldCharacters.checked = loadedPrefs.boldCharacters;
    ToggleBoldCharacters();
    if (boldTransitions) boldTransitions.checked = loadedPrefs.boldTransitions;
    ToggleBoldTransitions();
    if (headingHighlight) headingHighlight.checked = loadedPrefs.headingHighlight;
    ToggleHighlightedHeadings();
    if (sceneNumbers) sceneNumbers.checked = loadedPrefs.sceneNumbers;
    ToggleSceneNumbers();
    if (paperTexCheck) paperTexCheck.checked = loadedPrefs.paperTexEnabled;
    TogglePaperTex();
    if (sceneNsLeft) sceneNsLeft.checked = loadedPrefs.sceneNsLeft;
    if (sceneNsRight) sceneNsRight.checked = loadedPrefs.sceneNsRight;
    if (exportBoneyards) exportBoneyards.checked = loadedPrefs.exportBoneyards;
}

var interval;
function ToggleAutoSave()
{
    if (autoSaveToggle.checked)
    {
        interval = setInterval(function ()
        {
            SaveFileToLocal(loadedProject.type);
        }, 10 * 1000);
    }
    else
    {
        clearInterval(interval);
    }
    SavePreferences();
}

function ToggleFont()
{
    if (sansEnabled && sansEnabled.checked)
    {
        document.documentElement.style.setProperty("--font", "Courier Prime Sans");
    }
    else document.documentElement.style.setProperty("--font", "Courier Prime");

    SavePreferences();
}

function ToggleSceneNumbers()
{
    if (sceneNumbers && sceneNumbers.checked)
    {
        document.documentElement.style.setProperty("--sceneNumbers", "inline-block");
    }
    else document.documentElement.style.setProperty("--sceneNumbers", "none");

    SavePreferences();
}

function ToggleBoldHeadings()
{
    if (boldHeadings && boldHeadings.checked)
    {
        document.documentElement.style.setProperty("--boldHeadings", "bold");
    }
    else document.documentElement.style.setProperty("--boldHeadings", "normal");

    SavePreferences();
}

function ToggleBoldCharacters()
{
    if (boldCharacters && boldCharacters.checked)
    {
        document.documentElement.style.setProperty("--boldCharacters", "bold");
    }
    else document.documentElement.style.setProperty("--boldCharacters", "normal");

    SavePreferences();
}

function ToggleBoldTransitions()
{
    if (boldTransitions && boldTransitions.checked)
    {
        document.documentElement.style.setProperty("--boldTransitions", "bold");
    }
    else document.documentElement.style.setProperty("--boldTransitions", "normal");

    SavePreferences();
}

function ToggleHighlightedHeadings()
{
    if (headingHighlight && headingHighlight.checked)
    {
        document.documentElement.style.setProperty("--headingHighlight", "var(--backgroundColor)");
    }
    else document.documentElement.style.setProperty("--headingHighlight", "none");

    SavePreferences();
}

function TogglePaperTex()
{
    if (paperTexCheck && paperTexCheck.checked)
    {
        paperTex.style.setProperty("visibility", "visible");
    }
    else paperTex.style.setProperty("visibility", "hidden");

    SavePreferences();
}

function SetTheme()
{
    switch (themeSelect.value)
    {
        case "1":
            themeLink.setAttribute("href", "../css/themes/lightTheme.css");
            break;
        case "2":
            themeLink.setAttribute("href", "../css/themes/darkTheme.css");
            break;
        case "3":
            themeLink.setAttribute("href", "../css/themes/cozyAutumnTheme.css");
            break;
        case "4":
            themeLink.setAttribute("href", "../css/themes/achromaticTheme.css");
            break;
        default:
            themeLink.setAttribute("href", "../css/themes/lightTheme.css");
            break;
    }
    SavePreferences();
}

function JustSave()
{
    value = exportTitlePage.checked;
    SavePreferences();
}
