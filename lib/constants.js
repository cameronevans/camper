module.exports = {
   trackGarbageRegex: /trackinfo:\s\[/,
   artistGarbageRegex: /artist:\s\"|\"/g,
   titleGarbageRegex: /album_title:\s\"|\"/g,
   trackRegex: /trackinfo:\s\[.*\]/,
   artistRegex: /artist:\s\".*\"/,
   titleRegex: /album_title:\s\".*\"/
};
