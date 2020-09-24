const browser = require('webextension-polyfill');
const path = require('path');
const ID3Writer = require('browser-id3-writer');

let state = {
  album: {},
  tabId: null,
  intervalId: '',
  downloads: {}
};

function onStartedDownload(id) {
  state.downloads[id] = true;
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  state.downloads[Math.random().toString()] = false;
  clearInterval(state.intervalId);
  const { tabId } = state;
  browser.pageAction.setIcon({ tabId, path: `./icons/camper-died.png` });
  console.log(`Download failed: ${error.message}`);
}

function sanitize(str) {
  return str.replaceAll(/[\\\/$'"]/g, '').replaceAll(':', '');
}

function loadFile(url, processResponse) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    if (xhr.status === 200) {
        processResponse(xhr.response);
    } else {
      onFailed(xhr.statusText + ' (' + xhr.status + ')');
    }
  };
  xhr.onerror = function() {
    onFailed('Network error');
  };
  xhr.send();
}


// bugs out on second download?
function animateProgressIcon() {
  const { tabId, downloads } = state;
  const frames = [0, 1, 2, 1];
  let index = 0;

  setActiveIcon(index);
  state.intervalId = setInterval(() => {
    index++;
    console.log(index);
    setActiveIcon(frames[index % 4]);
  }, 250);
}

function setActiveIcon(frame = 1) {
  const { tabId } = state;
  browser.pageAction.setIcon({ tabId, path: `./icons/camper-active-${frame}.png` });
  console.log('frame', frame, Date.now());
}

function downloadOnChanged(event) {
  const { id, state: { current } = {} } = event;
  state.downloads[id] = current === 'complete';
  if (Object.keys(state.downloads).length === state.album.tracks.length + 1 &&
    Object.values(state.downloads).every(download => download)) {
    onComplete();
  }
}

function onComplete() {
  clearInterval(state.intervalId);
  const setActiveFrame = setTimeout(setActiveIcon, 250);
  browser.downloads.onChanged.removeListener(downloadOnChanged);
  state.downloads = {};
}

function download(message, sender) {
  const { album: { tracks, cover, folder, artist, date, title: albumTitle } } = state;

  animateProgressIcon();

  browser.downloads.onChanged.addListener(downloadOnChanged);

  loadFile(cover, coverData => {
    tracks.forEach(({ track_num: number, title, file: { 'mp3-128': url } }) => {
      const filename = `${sanitize(folder)}/${sanitize(title)}.mp3`;
      loadFile(url, trackData => {
        const writer = new ID3Writer(trackData);
        writer.setFrame('TIT2', title)
          .setFrame('TPE2', artist)
          .setFrame('TALB', albumTitle)
          .setFrame('TRCK', number)
          .setFrame('TYER', date)
          .setFrame('APIC', {
              type: 3,
              data: coverData,
              description: 'Super picture'
          });
        writer.addTag();
        taggedUrl = writer.getURL();

        const downloading = browser.downloads.download({ filename, url: taggedUrl });
        console.log(filename);
        downloading.then(onStartedDownload, onFailed);
      });
    });
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
    setActiveIcon();
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
