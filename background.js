
// abre data cifras ao clicar no icone
const openDataCifras = () => browser.tabs.create({ "url": "/app/index.html" });
browser.browserAction.onClicked.addListener(openDataCifras);