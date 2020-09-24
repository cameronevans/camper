module.exports = {
   trackGarbageRegex: /trackinfo":\[/,
   artistGarbageRegex: /artist":\"|\"/g,
   titleGarbageRegex: /album_title":\"|\"/g,
   dateGarbageRegex: /album_release_date":\"|\"/g,
   trackRegex: /trackinfo":\[(.*?)\]/,
   artistRegex: /artist":\"(.*?)\"/,
   titleRegex: /album_title":\"(.*?)\"/,
   dateRegex: /album_release_date":\"(.*?)\"/
};
