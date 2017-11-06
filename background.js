let state = {
  album: {},
  tabId: null
};

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function sanitize(str) {
  return str.replace(/[\\\/$'"]/g, '');
}

function download() {
  const {album} = state;
  const folder = `${album.artist} - ${album.title}`
  album.tracks.forEach(({track_num: number, title, file: { 'mp3-128': url} }) => {
    const filename = `${sanitize(folder)}/${sanitize(title)}.mp3`;
    let downloading = browser.downloads.download({filename, url});
    downloading.then(onStartedDownload, onFailed);
  });
}

function onReceiveAlbum(album) {
  state.album = album;
  browser.pageAction.show(state.tabId);
  browser.pageAction.onClicked.addListener(download);
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(/https\:\/\/.*\.bandcamp\.com/)) {
    state.tabId = tabId;
    browser.runtime.onMessage.addListener(onReceiveAlbum);
    browser.tabs.executeScript({file: "./lib/browser-polyfill.js"});
    browser.tabs.executeScript({file: "./content.js"});
  }
});
