const {
  trackGarbageRegex,
  artistGarbageRegex,
  titleGarbageRegex,
  dateGarbageRegex,
  trackRegex,
  artistRegex,
  titleRegex,
  dateRegex
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
  const date = dumpsterDive(garbage, dateRegex, dateGarbageRegex);
  const cover = document.getElementById('tralbumArt').firstElementChild.getAttribute('href');
  const parsedTracks = dumpsterDive(garbage, trackRegex, trackGarbageRegex, '\"trackinfo\":[').replace('\}\]', '}]}').replace(/\\\\/, '');
  if (parsedTracks) {
    const tracks = JSON.parse(`{${parsedTracks}`).trackinfo;
    return {
      artist,
      title,
      folder: `${artist} - ${title}`,
      tracks: tracks.filter(({ file }) => Boolean(file) && Boolean(file['mp3-128'])),
      cover,
      date: new Date(date).getUTCFullYear()
    };
  }
  return {};
}

const isAlbumValid = ({ artist, title, tracks }) => isEmpty(artist) && isEmpty(tracks);

function runContent() {
  const album = findAlbum(document.documentElement.innerHTML.replaceAll('&quot;', '"'));

  if (isAlbumValid(album)) {
    browser.runtime.sendMessage(album);
  }
}

runContent();
