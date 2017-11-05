function findAlbum(garbage) {
  const trackGarbageRegex = /trackinfo:\s\[/;
  const artistGarbageRegex = /artist:\s\"|\"/g;
  const titleGarbageRegex = /album_title:\s\"|\"/g;
  const trackRegex = /trackinfo:\s\[.*\]/;
  const artistRegex = /artist:\s\".*\"/;
  const titleRegex = /album_title:\s\".*\"/;

  const artist = garbage.match(artistRegex)[0].replace(artistGarbageRegex, '');
  const title = garbage.match(titleRegex)[0].replace(titleGarbageRegex, '');
  const artUrl = document.getElementById('tralbumArt').firstElementChild.getAttribute('href');
  const tracks = JSON.parse(`{${garbage.match(trackRegex)[0].replace(trackGarbageRegex, '\"trackinfo\":[').replace('\}\]', '}]}').replace(/\\\\/, '')}`).trackinfo;

  return {
    artist,
    title,
    artUrl,
    tracks
  }
}

const album = findAlbum(document.documentElement.innerHTML);
browser.runtime.sendMessage(album);
