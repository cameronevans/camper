const browser = require('webextension-polyfill');
const path = require('path');

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

function download(message, sender) {
  const { album: { tracks, cover, folder } } = state;

  tracks.forEach(({ track_num: number, title, file: { 'mp3-128': url } }) => {
    const filename = `${sanitize(folder)}/${sanitize(title)}.mp3`;
    const downloading = browser.downloads.download({filename, url});
    downloading.then(onStartedDownload, onFailed);
  });
  const downloading = browser.downloads.download({filename: `${sanitize(folder)}/cover.jpg`, url: cover});
  downloading.then(onStartedDownload, onFailed);

  return true;
}

function onReceiveAlbum(album) {
  if (Object.keys(state.album).length === 0) {
    state.album = album;
    browser.pageAction.show(state.tabId);
    browser.pageAction.onClicked.addListener(download);
    browser.pageAction.setIcon({ tabId: state.tabId, path: './icons/camper-active.png' });
  }

  return true;
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url.match(/https\:\/\/.*\.bandcamp\.com/)) {
    state.album = {};
    state.tabId = tabId;
    browser.pageAction.onClicked.removeListener(download);
    browser.runtime.onMessage.addListener(onReceiveAlbum);
    browser.tabs.executeScript({file: path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js')});
    browser.tabs.executeScript({file: path.resolve(__dirname, './dist/content.js')});
  }
});
