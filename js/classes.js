class SaveFile
{
    constructor(saveName, dateNow, htmlSaveC, previewImg, colorVar, status, version, type)
    {
        this.fileSaveName = saveName || null;
        this.color = colorVar || "#f06262";
        this.thumbnail = previewImg;
        this.type = type || "SP";

        this.lastVersionId;

        this.versions = [];
        this.versions.push(new Version(version, status, dateNow, htmlSaveC));

        this.scriptData = new ScriptData();
    }

    GetVersionByID(id)
    {
        return this.versions.find(x => x.versionId === id);
    }
}

class Version
{
    constructor(id, vSt, vLM, vHtmlSave)
    {
        this.versionId = id || "V1";
        this.versionStatus = vSt || ProjectStatus.WIP;
        this.versionLastMod = vLM;
        this.htmlSave = vHtmlSave;
    }
}

class ScriptData
{
    constructor(title, episode, credit, author, source, contact, iEp, iCr, iSo, iCo)
    {
        this.title = title || "Guion sin título";
        this.episode = episode || "";
        this.credit = credit || "";
        this.author = author || "";
        this.source = source || "";
        this.contact = contact || "";
        this.includeEpisode = iEp || false;
        this.includeCredit = iCr || false;
        this.includeSource = iSo || false;
        this.includeContact = iCo || false;
    }
}

class UserPrefs
{
    constructor(aSave, iTitlePage, iVersionId, iVersionDate, theme, sansEnabled, boldHeadings, boldCharacters, boldTransitions, headingHighlight, sceneNumbers, sceneNsLeft, sceneNsRight, exportBoneyards, paperTexEnabled)
    {
        this.autoSaveEnabled = aSave;
        this.includeTitlePage = iTitlePage;
        this.includeVersionId = iVersionId;
        this.includeVersionLastMod = iVersionDate;
        this.theme = theme;
        this.sansSerifEnabled = sansEnabled;
        this.boldHeadings = boldHeadings;
        this.boldCharacters = boldCharacters;
        this.boldTransitions = boldTransitions;
        this.headingHighlight = headingHighlight;
        this.sceneNumbers = sceneNumbers;
        this.sceneNsLeft = sceneNsLeft;
        this.sceneNsRight = sceneNsRight;
        this.exportBoneyards = exportBoneyards;
        this.paperTexEnabled = paperTexEnabled;
    }
}
