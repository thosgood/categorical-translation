const translateInput = $('input.translateInput');
const resultsHTML = $('#results');

const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";
var nouns;
$.getJSON(nounsURL, data => nouns = data);
const constructorsURL = "https://thosgood.com/categorical-translation/json/constructors.json";
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

      // Now for some greedy adjective searching.
      // 
      // Look at the entire string before our noun to see if it matches an
      // adjective of that noun with a translation in our language. If it does,
      // then compress it down to a single entry in parsedInput. If not, then
      // look at the entire string minus the first word, and do the same.
      // Continue doing this until we find a match (if any). If we do, then now
      // look at the entire string before the noun *minus the word just before
      // the noun*. If this word (just before the noun) is an adjective *that is
      // linked to our noun*, then carry on recursively. If it is *not*, then
      // break.
      // 
      // ? ? ? ? n  ->  no match
      // x ? ? ? n  ->  no match
      // x x ? ? n  ->  match!
      // ? ? (a) n  ->  no match
      // x ? (a) n  ->  no match
      // ? x (a) n  ->  break here: this word can't be linked to our noun
      // 
      // (j-1) is the 'gap' between our noun and the preceding string;
      // i is the index from which our preceding string starts;
      // that is, our totalBeforeIndex goes from i to (index-j), but .splice()
      // is strict on the upper bound, so we need to do splice(i, index-j+1)
      //
      // TODO: check for the myriad of possible (probable) off-by-one errors
      for (var j = 1; j <= index; j++) {
        for ( var i = 0; i <= index-1; i++ ) {
          totalBeforeIndex = [];
          Object.values(parsedInput.slice(i, index-j+1)).map(value => {
            totalBeforeIndex.push(value['input']);
          });
          befores.forEach(function(before) {
            if ( totalBeforeIndex.join(' ') === before['atom'] ) {
              result = {};
              result['input'] = totalBeforeIndex.join(' ');
              result['type'] = 'adjective';
              result['base'] = before['base'];
              result['link'] = index;
              parsedInput.splice(i, index-j+1-i, result);
            }
          });
        }
        if ( j >= 1 && typeof parsedInput[index-j] !== 'undefined' && parsedInput[index-j]['link'] != index ) {
          break;
        }
      }

      // As above, but for adjectives coming *after* the noun.
      for (var j = 1; j <= parsedInput.length - index + 1; j++) {
        for ( var i = parsedInput.length - index + j; i >= 1; i-- ) {
          totalAfterIndex = [];
          Object.values(parsedInput.slice(index+j, index+i)).map(value => {
            totalAfterIndex.push(value['input']);
          });
          afters.forEach(function(after) {
            if ( totalAfterIndex.join(' ') === after['atom'] ) {
              result = {};
              result['input'] = totalAfterIndex.join(' ');
              result['type'] = 'adjective';
              result['base'] = after['base'];
              result['link'] = index;
              parsedInput.splice(index+j, i-j, result);
            }
          });
        }
        if (typeof parsedInput[index+j] !== 'undefined' && parsedInput[index+j]['link'] != index ) {
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
  resultsHTML.html(JSON.stringify(parsedInput, undefined, 2));
  // for ( i = 0; i < translateInput.length; i++ ) {
  //   currentInput = translateInput[i];
  //   if ( currentInput['id'] !== language ) {
  //   }
  // }
});
