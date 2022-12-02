var GHPATH = '/kednoi';
var VERSION = 'v2.091a - 02/12/2022';
var URLS = [
    `${GHPATH}/`,
    //HTMLS
    `${GHPATH}/index.html`,
    `${GHPATH}/pages/editor-SP.html`,
    `${GHPATH}/pages/editor-GD.html`,
    `${GHPATH}/pages/credits.html`,
    //CSS
    `${GHPATH}/css/blocks.css`,
    `${GHPATH}/css/dashboard.css`,
    `${GHPATH}/css/editorStyle.css`,
    `${GHPATH}/css/editorGDStyle.css`,
    `${GHPATH}/css/editorStyleSmall.css`,
    `${GHPATH}/css/editorGDStyleSmall.css`,
    `${GHPATH}/css/themes/lightTheme.css`,
    `${GHPATH}/css/themes/darkTheme.css`,
    `${GHPATH}/css/themes/cozyAutumnTheme.css`,
    `${GHPATH}/css/themes/achromaticTheme.css`,
    `${GHPATH}/css/index.css`,
    `${GHPATH}/css/index-small.css`,
    `${GHPATH}/css/overlays.css`,
    `${GHPATH}/css/scriptStyle.css`,
    `${GHPATH}/css/scrollBar.css`,
    `${GHPATH}/css/creditsStyle.css`,
    `${GHPATH}/css/fonts.css`,
    //JS
    `${GHPATH}/js/classes.js`,
    `${GHPATH}/js/dashboard.js`,
    `${GHPATH}/js/editor.js`,
    `${GHPATH}/js/export.js`,
    `${GHPATH}/js/fountainToHtml.js`,
    `${GHPATH}/js/gdBlockSystem.js`,
    `${GHPATH}/js/htmlToFountain.js`,
    `${GHPATH}/js/index.js`,
    `${GHPATH}/js/manager.js`,
    `${GHPATH}/js/pageCounter.js`,
    `${GHPATH}/js/preferences.js`,
    `${GHPATH}/js/save+load.js`,
    `${GHPATH}/js/toolbar.js`,
    `${GHPATH}/js/versions.js`,
    //FONTS
    `${GHPATH}/fonts/Courier Prime Bold Italic.ttf`,
    `${GHPATH}/fonts/Courier Prime Bold.ttf`,
    `${GHPATH}/fonts/Courier Prime Italic.ttf`,
    `${GHPATH}/fonts/Courier Prime Sans Bold Italic.ttf`,
    `${GHPATH}/fonts/Courier Prime Sans Bold.ttf`,
    `${GHPATH}/fonts/Courier Prime Sans Italic.ttf`,
    `${GHPATH}/fonts/Courier Prime Sans.ttf`,
    `${GHPATH}/fonts/Courier Prime.ttf`,
    `${GHPATH}/fonts/Lexend-VariableFont_wght.ttf`,
    //SRC
    `${GHPATH}/src/Decorations/decor1.svg`,
    `${GHPATH}/src/Decorations/decor2.svg`,
    `${GHPATH}/src/Decorations/decor3.svg`,
    `${GHPATH}/src/Decorations/decor4.svg`,
    `${GHPATH}/src/Decorations/decorationStaticPrimary.svg`,
    `${GHPATH}/src/Decorations/decorationStaticSecondary.svg`,
    `${GHPATH}/src/Decorations/decorColors.svg`,
    `${GHPATH}/src/Decorations/pattern.svg`,
    `${GHPATH}/src/Decorations/spDecorMask.svg`,
    `${GHPATH}/src/Decorations/gdDecorMask.svg`,
    `${GHPATH}/src/MinorIcons/arrow.svg`,
    `${GHPATH}/src/MinorIcons/ArrowDownIcon.svg`,
    `${GHPATH}/src/MinorIcons/blockID.svg`,
    `${GHPATH}/src/MinorIcons/checkIcon.svg`,
    `${GHPATH}/src/MinorIcons/choice.svg`,
    `${GHPATH}/src/MinorIcons/cross.svg`,
    `${GHPATH}/src/MinorIcons/deleteIcon.svg`,
    `${GHPATH}/src/MinorIcons/description.svg`,
    `${GHPATH}/src/MinorIcons/dialog.svg`,
    `${GHPATH}/src/MinorIcons/editIcon.svg`,
    `${GHPATH}/src/MinorIcons/goToIcon.svg`,
    `${GHPATH}/src/MinorIcons/hand.svg`,
    `${GHPATH}/src/MinorIcons/homeIcon.svg`,
    `${GHPATH}/src/MinorIcons/newGD.svg`,
    `${GHPATH}/src/MinorIcons/newSP.svg`,
    `${GHPATH}/src/MinorIcons/question.svg`,
    `${GHPATH}/src/MinorIcons/star.svg`,
    `${GHPATH}/src/MinorIcons/variable.svg`,
    `${GHPATH}/src/ToolIcons/act1.svg`,
    `${GHPATH}/src/ToolIcons/act2.svg`,
    `${GHPATH}/src/ToolIcons/act3.svg`,
    `${GHPATH}/src/ToolIcons/ActionIcon.svg`,
    `${GHPATH}/src/ToolIcons/add.svg`,
    `${GHPATH}/src/ToolIcons/bold.svg`,
    `${GHPATH}/src/ToolIcons/boneyard.svg`,
    `${GHPATH}/src/ToolIcons/center.svg`,
    `${GHPATH}/src/ToolIcons/CharacterIcon.svg`,
    `${GHPATH}/src/ToolIcons/DialogIcon.svg`,
    `${GHPATH}/src/ToolIcons/font.svg`,
    `${GHPATH}/src/ToolIcons/FullScrIcon.svg`,
    `${GHPATH}/src/ToolIcons/italic.svg`,
    `${GHPATH}/src/ToolIcons/NotFullScrIcon.svg`,
    `${GHPATH}/src/ToolIcons/pagebreak.svg`,
    `${GHPATH}/src/ToolIcons/PageIcon.svg`,
    `${GHPATH}/src/ToolIcons/ParentheticalIcon.svg`,
    `${GHPATH}/src/ToolIcons/SceneheadingIcon.svg`,
    `${GHPATH}/src/ToolIcons/synopse.svg`,
    `${GHPATH}/src/ToolIcons/TransitionIcon.svg`,
    `${GHPATH}/src/ToolIcons/underlined.svg`,
    `${GHPATH}/src/grungeTex.jpg`,
    `${GHPATH}/src/icon.svg`,
    `${GHPATH}/src/iconPrimary.svg`,
    `${GHPATH}/src/logo.svg`,
    `${GHPATH}/src/paperTex.jpg`,
    `${GHPATH}/src/projectPreviewImg.png`,
];

self.addEventListener("install", e =>
{
    e.waitUntil(
        caches.open("static").then(cache =>
        {
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener("fetch", e =>
{
    e.respondWith(
        caches.match(e.request).then(response =>
        {
            return response || fetch(e.request);
        }));
});
