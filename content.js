const {
  trackGarbageRegex,
  artistGarbageRegex,
  titleGarbageRegex,
  trackRegex,
  artistRegex,
  titleRegex
} = require('./lib/constants');

function isEmpty(object = {}) {
  return Object.keys(object).length !== 0;
}

function dumpsterDive(garbage, takeRegex, tossRegex, replace = '') {
  const trash = garbage.match(takeRegex) || [];
  let finds = '';
  if(trash.length > 0){
    finds = trash[0].replace(tossRegex, replace);
  }

  return finds;
}

function findAlbum(garbage) {
  const artist = dumpsterDive(garbage, artistRegex, artistGarbageRegex);
  const title = dumpsterDive(garbage, titleRegex, titleGarbageRegex);
  // the following is not currently needed as the metadata seems to be included in the tracks, could include it in the downloads regardless?
  // const artUrl = document.getElementById('tralbumArt').firstElementChild.getAttribute('href');
  const parsedTracks = dumpsterDive(garbage, trackRegex, trackGarbageRegex, '\"trackinfo\":[').replace('\}\]', '}]}').replace(/\\\\/, '');
  if (parsedTracks) {
    const tracks = JSON.parse(`{${parsedTracks}`).trackinfo;

    return {
      artist,
      title,
      tracks
    };
  }
}

function isAlbumValid(album = {}) {
  const {artist, title, tracks} = album;
  let valid = false;
  if (isEmpty(album) && isEmpty(artist) && isEmpty(tracks)) {
    valid = true;
  }

  return valid;
}

function runContent() {
  const album = findAlbum(document.documentElement.innerHTML);

  if (isAlbumValid(album)) {
    browser.runtime.sendMessage(album);
  }
}

runContent();
