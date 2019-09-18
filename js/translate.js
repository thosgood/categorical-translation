const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('input.translateInput');
const resultsHTML = $('#results');

var nouns;
$.getJSON(nounsURL, data => nouns = data);

// Clear all search inputs.
$(document).ready(function() {
  translateInput.val('');
});

// At the moment, everything happens every single time the user enters a new
// character into the input.
translateInput.keyup(function() {
  var searchValue = $(this).val();
  var language = $(this).attr('id');
    
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

    // For every noun with a translation into this language, check to see if it
    // matches the input.
    Object.keys(nouns).map(nounHash => {
      if ( typeof nouns[nounHash]['root'][language] !== 'undefined' ) {
        var atom = nouns[nounHash]['root'][language]['atom'];
        if (atom === item) {
          parsedInput[index]['type'] = 'noun';
          parsedInput[index]['root'] = nounHash;
          itemAdded = true;
        }
      }
    });

    // If we haven't found our word, then label it as 'unknown'.
    if (!itemAdded) {
      parsedInput[index]['type'] = 'unknown';
    }
  });

  console.log(parsedInput);

  // STEP 2.
  // We now search, for each noun, for adjectives *in the same language*, before
  // and after the noun (where they can be any number of words before or after,
  // as long as all words in between are also adjectives in the same language).
  // This is done by getting all the adjectives linked to the noun, and then
  // searching for them in the input, working outwards from the noun, and using
  // the 'pstn' key of each adjective.
  parsedInput.forEach(function(item, index) {
    if (item['type'] === 'noun') {
      var languages = item['langs'];
      var nounHash = item['root'];
      var adjectives = nouns[nounHash]['adjs'];
      // FOR EACH LANGUAGE
        // FIND ALL ADJECTIVES IN THAT LANGUAGE
        // SEARCH BEFORE/AFTER FOR THEM
        // 
    }
  });

  // STEP 3.
  // Do the translation!

  // STEP 4.
  // Display things for the user.
  for ( i = 0; i < translateInput.length; i++ ) {
    current = translateInput[i];
    if ( current['id'] !== language ) {
      if ( typeof parsedInput[0]['root'] !== 'undefined' ) {
        current['value'] = parsedInput[0]['root'];
      } else {
        current['value'] = '';
      }
    }
  }
});
