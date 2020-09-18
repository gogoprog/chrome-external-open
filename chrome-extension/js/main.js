let gSelectionInfo = null;

async function process(url, line) {
    const urlToOpen = url.startsWith("webpack://") ? new URL(url.substr(11), await getInspectedWindowUrl()).href : url;
    const position = isFromSourcesPanel(url, line) ? getPositionInSourcesPanel() : line;

    return externalOpen(urlToOpen, position);
}

function isFromSourcesPanel(url, line) {
    // FIXME: how to really detect what the Sources Panel calls that?
    return line === 1 && gSelectionInfo && gSelectionInfo.url === url;
}

function getPositionInSourcesPanel() {
    const res = [gSelectionInfo.startLine + 1, gSelectionInfo.startColumn + 1].join(":");
    gSelectionInfo = null;

    return res;
}

async function getInspectedWindowUrl(callback) {
    return new Promise((resolve, reject) => {
        const tabId = chrome.devtools.inspectedWindow.tabId;
        chrome.tabs.get(tabId, tab => resolve(tab.url));
    });
}

async function externalOpen(file, position) {
    const at = position || 1

    const oUrl = new URL("http://localhost:3333");
    oUrl.searchParams.append('file', file)
    oUrl.searchParams.append('at', at)
    const openInEditorUrl = oUrl.toString()

    const xhr = new XMLHttpRequest();

    console.log("open %s", openInEditorUrl);

    xhr.open("POST", openInEditorUrl, true);
    xhr.onerror = function(e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

function onOpenResource(resource, line) {
  process(resource.url, line);
}

function onSelectionChanged(selectionInfo) {
  gSelectionInfo = selectionInfo;
}

chrome.devtools.panels.setOpenResourceHandler(onOpenResource);
chrome.devtools.panels.sources.onSelectionChanged.addListener(onSelectionChanged);
