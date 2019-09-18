const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";
const constructorsURL = "https://thosgood.com/categorical-translation/json/constructors.json";

const translateInput = $('input.translateInput');
const resultsHTML = $('#results');

var nouns;
$.getJSON(nounsURL, data => nouns = data);
var constructors;
$.getJSON(nounsURL, data => constructors = data);

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
  searchValue.split(' ').forEach(function(input, index) {
    if ( input === '' ) {
      return;
    }

    // This parsedInput dictionary is going to contain all the information about
    // each word in the input.
    parsedInput[index] = { 'input': input };
    // If we find one or more matches for the word, then we don't want to label
    // it as 'unknown', so we will use the itemAdded variable to ensure this.
    var inputAdded = false;

    // For every noun with a translation into this language, check to see if it
    // matches the input.
    Object.keys(nouns).map(nounHash => {
      if ( typeof nouns[nounHash]['root'][language] !== 'undefined' ) {
        var atom = nouns[nounHash]['root'][language]['atom'];
        if (atom === input) {
          parsedInput[index]['type'] = 'noun';
          parsedInput[index]['base'] = nounHash;
          inputAdded = true;
        }
      }
    });

    // If we haven't found our word, then label it as 'unknown'.
    if (!inputAdded) {
      parsedInput[index]['type'] = 'unknown';
    }
  });

  // STEP 2.
  // We now search, for each noun, for adjectives *in the same language*, before
  // and after the noun (where they can be any number of words before or after,
  // as long as all words in between are also adjectives in the same language).
  // This is done by getting all the adjectives linked to the noun, and then
  // searching for them in the input, working outwards from the noun, and using
  // the 'pstn' key of each adjective.
  parsedInput.forEach(function(item, index) {
    if (item['type'] === 'noun') {
      var nounHash = item['base'];
      var adjectives = nouns[nounHash]['adjs'];
      var befores = [];
      var afters = [];

      // Go through all adjectives linked to the noun.
      Object.keys(adjectives).map(adjectiveHash => {
        // Select those that have a translation in our language, and then build
        // the lists of possible adjectives before or after (resp.) our noun.
        var currentAdjective = adjectives[adjectiveHash][language]
        if ( typeof currentAdjective !== 'undefined' ) {
          switch ( currentAdjective['pstn'] ) {
            case 'before':
              befores.push({'atom': currentAdjective['atom'], 'base': adjectiveHash});
              break;
            case 'after':
              afters.push({'atom': currentAdjective['atom'], 'base': adjectiveHash});
              break;
            default:
              break;
          }
        }
      });

      // Look before our noun to see if the preceding word is a suitable
      // adjective. If so, look at the word before that, and so on. If not, then
      // break.
      for ( i = 1; i <= index; i++ ) {
        befores.forEach(function(before) {
          if ( parsedInput[index-i]['input'] === before['atom'] ) {
            parsedInput[index-i]['type'] = 'adjective';
            parsedInput[index-i]['base'] = before['base'];
            parsedInput[index-i]['link'] = index;
          }
        });
        if ( parsedInput[index-i]['type'] !== 'adjective' ) {
          break;
        }
      }
      // As above, but for words coming after.
      // TODO: make this work for 'of finite type'!
      for ( i = 1; i < (parsedInput.length - index); i++ ) {
        afters.forEach(function(after) {
          if ( parsedInput[index+i]['input'] === after['atom'] ) {
            parsedInput[index+i]['type'] = 'adjective';
            parsedInput[index+i]['base'] = after['base'];
            parsedInput[index+i]['link'] = index;
          }
        });
        if ( parsedInput[index+i]['type'] !== 'adjective' ) {
          break;
        }
      }
    }
  });

  // STEP 3.
  // TODO: sentence constructors.

  // STEP 4.
  // TODO: do the translation!

  // STEP 5.
  // TODO: display things for the user.
  for ( i = 0; i < translateInput.length; i++ ) {
    currentInput = translateInput[i];
    if ( currentInput['id'] !== language ) {
    }
  }

  console.log(parsedInput);
});
