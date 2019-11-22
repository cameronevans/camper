module.exports = {
   trackGarbageRegex: /trackinfo:\s\[/,
   artistGarbageRegex: /artist:\s\"|\"/g,
   titleGarbageRegex: /album_title:\s\"|\"/g,
   dateGarbageRegex: /album_release_date:\s\"|\"/g,
   trackRegex: /trackinfo:\s\[.*\]/,
   artistRegex: /artist:\s\".*\"/,
   titleRegex: /album_title:\s\".*\"/,
   dateRegex: /album_release_date:\s\".*\"/
};
