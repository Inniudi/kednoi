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
        sansEnabled ? sansEnabled.checked : true,
        boldHeadings ? boldHeadings.checked : true,
        boldCharacters ? boldCharacters.checked : true,
        boldTransitions ? boldTransitions.checked : true,
        headingHightlight ? headingHightlight.checked : true,
        sceneNumbers ? sceneNumbers.checked : true,
        sceneNsLeft ? sceneNsLeft.checked : false,
        sceneNsRight ? sceneNsRight.checked : false,
        exportBoneyards ? exportBoneyards.checked : false
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
    if (sansEnabled) sansEnabled.checked = loadedPrefs.sansSerifEnabled;
    ToggleFont();
    if (sansEnabled) boldHeadings.checked = loadedPrefs.boldHeadings;
    if (boldCharacters) boldCharacters.checked = loadedPrefs.boldCharacters;
    if (boldTransitions) boldTransitions.checked = loadedPrefs.boldTransitions;
    if (headingHightlight) headingHightlight.checked = loadedPrefs.headingHightlight;
    if (sceneNumbers) sceneNumbers.checked = loadedPrefs.sceneNumbers;
    if (sceneNsLeft) sceneNsLeft.checked = loadedPrefs.sceneNsLeft;
    if (sceneNsRight) sceneNsRight.checked = loadedPrefs.sceneNsRight;
    if (exportBoneyards) exportBoneyards.checked = loadedPrefs.exportBoneyards;
    ToggleAutoSave();
}

var interval;
function ToggleAutoSave()
{
    if (autoSaveToggle.checked)
    {
        interval = setInterval(SaveFileToLocal(loadedProject.type), 10 * 1000);
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
