const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('#translateInput');
const resultsHTML = $('#results');

var nouns;
$.getJSON(nounsURL, data => nouns = data);

translateInput.keyup(function() {
  var searchValue = $(this).val();
    
  if ( searchValue === '' ) {
    resultsHTML.html('');
    return;
  }

  var parsedInput = {};
  // We're going to check each word to see if it's a noun.
  searchValue.split(' ').forEach(function(item) {
    if ( item === '' ) {
      return;
    }

    // This parsedInput dictionary is going to contain all the information about
    // each word in the input.
    parsedInput[item] = {};
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
          if ( typeof parsedInput[item][nHash] === `undefined` ) {
            parsedInput[item][nHash] = [];
          }
          parsedInput[item][nHash].push(lang);
          itemAdded = true;
        }
      });
    });

    // If we haven't found the word in our list of nouns, then label it as
    // 'unknown'.
    if (!itemAdded) {
      parsedInput[item] = 'unknown';
    }
  });

  // Clear any HTML already on display.
  resultsHTML.html('');

  // Iterate over every word in our parsed input.
  Object.keys(parsedInput).map(word => {
    if ( parsedInput[word] === 'unknown' ) {
      resultsHTML.append(`<span class="unknown">${word}</span>`);
    } else {
      // Note that Object.values returns an array of values, and since we will
      // only have one value (which is itself an array), we need to flatten
      // before joining. The reason that we (currently) use Objects.values is
      // because we don't know, a priori, what the hash corresponding to our
      // word will be (e.g. that 'scheme' corresponds to '08b50276').
      allLanguages = Object.values(parsedInput[word]).flat().join(' ');
      resultsHTML.append(`<span class="noun ${allLanguages}">${word}</span>`);
    }
  });
});
