function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function sanitize(str) {
  return str.replace(/[\\\/$'"]/g, '');
}

function download(album) {
  const folder = `${album.artist} - ${album.title}`
  album.tracks.forEach(({track_num: number, title, file: { 'mp3-128': url} }) => {
    const filename = `${sanitize(folder)}/${sanitize(title)}.mp3`;
    let downloading = browser.downloads.download({filename, url});
    downloading.then(onStartedDownload, onFailed);
  });
}

function runContent() {
  browser.tabs.executeScript(null, {file: "./content.js"});
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(/https\:\/\/.*\.bandcamp\.com\/album\/.*/)) {
    browser.pageAction.show(tabId);
    browser.runtime.onMessage.addListener(download);
    browser.pageAction.onClicked.addListener(runContent);
  }
});
