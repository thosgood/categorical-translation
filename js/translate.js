const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('#translateInput');
const resultsHTML = $('#results');

var nouns;
$.getJSON(nounsURL, data => nouns = data);

// At the moment, everything happens every single time the user enters a new
// character into the input.
translateInput.keyup(function() {
  var searchValue = $(this).val();
    
  if ( searchValue === '' ) {
    resultsHTML.html('');
    return;
  }

  var parsedInput = [];
  // STEP 1.
  // We're going to check each word to see if it's a noun.
  searchValue.split(' ').forEach(function(item, index) {
    if ( item === '' ) {
      return;
    }

    // This parsedInput dictionary is going to contain all the information about
    // each word in the input.
    parsedInput[index] = { 'input': item };
    // If we find one or more matches for the word, then we don't want to label
    // it as 'unknown', so we will use the itemAdded variable to ensure this.
    var itemAdded = false;

    // For every entry (i.e. Adler32 hash) in our JSON file of nouns,
    // we go through every language key and check to see if our word matches
    // any of the corresponding atom values.
    Object.keys(nouns).map(nHash => {
      Object.keys(nouns[nHash].root).map(lang => {
        var atom = nouns[nHash].root[lang].atom;
        if (atom === item) {
          // If this is the first language that contains this word, then
          // initialise an array, where we can store all languages that contain
          // this word.
          parsedInput[index]['type'] = 'noun';
          parsedInput[index]['root'] = nHash;
          if ( typeof parsedInput[index]['langs'] === `undefined` ) {
            parsedInput[index]['langs'] = [];
          }
          parsedInput[index]['langs'].push(lang);
          itemAdded = true;
        }
      });
    });
    
    // If we haven't found the word in our list of nouns, then label it as
    // 'unknown'.
    if (!itemAdded) {
      parsedInput[index]['type'] = 'unknown';
    }
  });

  // STEP 2.
  // We now search, for each noun, for adjectives *in the same language*, before
  // and after the noun (where they can be any number of words before or after,
  // as long as all words in between are also adjectives in the same language).

  // STEP 3.
  // Display things for the user.

  // Start by clearing any HTML already on display.
  resultsHTML.html('');

  // Iterate over every word in our parsed input.
  parsedInput.forEach(function(item, index) {
    atomHTML = '';
    atomHTML += '<div class="atom">';
    switch ( item['type'] ) {
      case 'unknown':
        atomHTML += `<span class="unknown">${item['input']}</span>`;
        break;
      case 'noun':
        // Note that Object.values returns an array of values, and since we will
        // only have one value (which is itself an array), we need to flatten
        // before joining. The reason that we (currently) use Objects.values is
        // because we don't know, a priori, what the hash corresponding to our
        // word will be (e.g. that 'scheme' corresponds to '08b50276').
        atomHTML += `<span class="noun">${item['input']}</span>`;
        console.log(item);
        allLanguages = Object.values(item['langs']).flat();
        allLanguages.forEach(function(lang) {
          atomHTML += `<span class="language">${lang}</span>`;
        });
        break;
    }
    atomHTML += '</div>';
    resultsHTML.append(atomHTML);
  });
});
