let autoSaveToggle = document.getElementById("autoSaveSwitch");

let exportTitlePage = document.getElementById("exportTitle");
let exportVersion = document.getElementById("exportVersion");
let exportDate = document.getElementById("exportDate");

let themeSelect = document.getElementById("themeSelect");
let sansEnabled = document.getElementById("sansEnabled");
let boldHeadings = document.getElementById("boldHeadings");
let boldCharacters = document.getElementById("boldCharacters");
let boldTransitions = document.getElementById("boldTransitions");
let headingHightlight = document.getElementById("headingHighlight");
let sceneNumbers = document.getElementById("sceneNumbers");
let sceneNsLeft = document.getElementById("sceneNumbersLeft");
let sceneNsRight = document.getElementById("sceneNumbersRight");
let exportBoneyards = document.getElementById("exportBoneyards");

let fontsLink = document.getElementById("fontsLink");
let themeLink = document.getElementById("themeLink");

function SavePreferences()
{
    newPrefs = new UserPrefs(
        autoSaveToggle.checked,
        exportTitlePage.checked,
        exportVersion.checked,
        exportDate.checked,
        themeSelect.value,
        sansEnabled.checked,
        boldHeadings.checked,
        boldCharacters.checked,
        boldTransitions.checked,
        headingHightlight.checked,
        sceneNumbers.checked,
        sceneNsLeft.checked,
        sceneNsRight.checked,
        exportBoneyards.checked
    );
    localStorage.setItem("UserPrefs", JSON.stringify(newPrefs));
}

function LoadPreferences()
{
    loadedPrefs = new UserPrefs();
    Object.assign(loadedPrefs, JSON.parse(localStorage.getItem("UserPrefs")));
    autoSaveToggle.checked = loadedPrefs.autoSaveEnabled;
    exportTitlePage.checked = loadedPrefs.includeTitlePage;
    exportVersion.checked = loadedPrefs.includeVersionId;
    exportDate.checked = loadedPrefs.includeVersionLastMod;
    themeSelect.value = loadedPrefs.theme;
    SetTheme();
    sansEnabled.checked = loadedPrefs.sansSerifEnabled;
    ToggleFont();
    boldHeadings.checked = loadedPrefs.boldHeadings;
    boldCharacters.checked = loadedPrefs.boldCharacters;
    boldTransitions.checked = loadedPrefs.boldTransitions;
    headingHightlight.checked = loadedPrefs.headingHightlight;
    sceneNumbers.checked = loadedPrefs.sceneNumbers;
    sceneNsLeft.checked = loadedPrefs.sceneNsLeft;
    sceneNsRight.checked = loadedPrefs.sceneNsRight;
    exportBoneyards.checked = loadedPrefs.exportBoneyards;
    ToggleAutoSave();
}

var interval;
function ToggleAutoSave()
{
    if (autoSaveToggle.checked)
    {
        interval = setInterval(SaveFileToLocal, 10 * 1000);
    }
    else
    {
        clearInterval(interval);
    }
    SavePreferences();
}

function ToggleFont()
{
    if (sansEnabled.checked)
    {
        document.documentElement.style.setProperty("--font", "Courier Prime Sans");
    }
    else document.documentElement.style.setProperty("--font", "Courier Prime");

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
