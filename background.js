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
  console.log('downloading', state.album);
  const {album} = state;
  const folder = `${album.artist} - ${album.title}`
  album.tracks.forEach(({track_num: number, title, file: { 'mp3-128': url} }) => {
    const filename = `${sanitize(folder)}/${sanitize(title)}.mp3`;
    let downloading = browser.downloads.download({filename, url});
    downloading.then(onStartedDownload, onFailed);
  });
}

// show API method doesn't seem to support the callback parameter,
// falling back to call it without a callback:
// Error: Invocation of form pageAction.show(integer, function) doesn't match definition pageAction.show(integer tabId)

function onReceiveAlbum(album) {
  console.log('receiving album', state.album);
  if (Object.keys(state.album).length === 0) {
    console.log('received');
    state.album = album;
    console.log(state.tabId);
    browser.pageAction.show(state.tabId);
    browser.pageAction.onClicked.addListener(download);
  }
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(/https\:\/\/.*\.bandcamp\.com/)) {
    console.log('tabs.onUpdated');
    state.album = {};
    state.tabId = tabId;
    browser.runtime.onMessage.addListener(onReceiveAlbum);
    browser.tabs.executeScript({file: "./lib/browser-polyfill.js"});
    browser.tabs.executeScript({file: "./content.js"});
  }
});
