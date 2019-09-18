const translateInput = $('input.translateInput');
const resultsHTML = $('#results');

const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";
var nouns;
$.getJSON(nounsURL, data => nouns = data);

const constructorsURL = "https://thosgood.com/categorical-translation/json/constructors.json";
var constructors;
$.getJSON(constructorsURL, data => constructors = data);

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
    Object.keys(nouns).map(nounBase => {
      if ( typeof nouns[nounBase]['root'][language] !== 'undefined' ) {
        var atom = nouns[nounBase]['root'][language]['atom'];
        if (atom === input) {
          parsedInput[index]['type'] = 'noun';
          parsedInput[index]['base'] = nounBase;
          parsedInput[index]['adjs'] = [];
          inputAdded = true;
        }
      }
    });

    // If we haven't found our word, then label it as 'unknown'.
    if (!inputAdded) {
      parsedInput[index]['type'] = 'unknown';
    }
  });

  // END STEP 1.



  // STEP 2.
  // We now search, for each noun, for adjectives *in the same language*, before
  // and after the noun (where they can be any number of words before or after,
  // as long as all words in between are also adjectives in the same language).
  // This is done by getting all the adjectives linked to the noun, and then
  // searching for them in the input, working outwards from the noun, and using
  // the 'pstn' key of each adjective.
  //
  // When we've done this, we put all the linked adjectives into a list in the
  // noun, since a noun with a bunch of adjectives is just, in particular,
  // another noun.
  parsedInput.forEach(function(item, index) {
    if (item['type'] === 'noun') {
      var nounBase = item['base'];
      var adjectives = nouns[nounBase]['adjs'];
      var befores = [];
      var afters = [];

      // Go through all adjectives linked to the noun.
      Object.keys(adjectives).map(adjectiveBase => {
        // Select those that have a translation in our language, and then build
        // the lists of possible adjectives before or after (resp.) our noun.
        var currentAdjective = adjectives[adjectiveBase][language]
        if ( typeof currentAdjective !== 'undefined' ) {
          switch ( currentAdjective['pstn'] ) {
            case 'before':
              befores.push({'atom': currentAdjective['atom'], 'base': adjectiveBase});
              break;
            case 'after':
              afters.push({'atom': currentAdjective['atom'], 'base': adjectiveBase});
              break;
            default:
              break;
          }
        }
      });

      // TODO: refactor the befores/afters code below, because it's basically
      // the same for both

      // Now for some greedy adjective searching.
      //
      // For adjectives coming *after* the noun.
      // While there are still words left after the noun ...
      while ( parsedInput.length - index > 1 ) {
        var adjFound = false;
        // ... look at the next i words, starting with maximal i ...
        for ( var i = parsedInput.length - index + 1; i >= 1; i--) {
          var totalAfterIndex = [];
          // ... stick them all together ...
          Object.values(parsedInput.slice(index+1, index+i)).map(value => {
            totalAfterIndex.push(value['input']);
          });

          afters.forEach(function(after) {
            // ... check to see if this matches any known adjective ...
            if ( totalAfterIndex.join(' ') === after['atom'] ) {
              var result = {};
              result['input'] = totalAfterIndex.join(' ');
              result['type'] = 'adjective';
              result['base'] = after['base'];
              // ... if it does, then add it to the list of adjectives linked
              // to the noun ...
              parsedInput[index]['adjs'].push(result);
              // ... and then delete it from its original location in
              // parsedInput.
              parsedInput.splice(index+1, i-1);

              adjFound = true;
            }
          });
        }
        // Now, if we *did* find some adjective, then start looking at what's
        // still left after our noun, having removed what we just found. If,
        // however, we did *not* find any adjective, then stop, because we only
        // care about unbroken chains of adjectives (i.e. the moment there is
        // some word that isn't an adjective, we know that anything after it
        // also can't be an adjective (linked to this noun)).
        if ( !adjFound ) {
          break;
        }
      }

      // Now for adjectives coming *before* the noun.
      // Here we have to work slightly differently, because if we remove any
      // found adjectives, then the value of index won't match up with the new
      // value of the index of our noun, because we'd be removing elements
      // *before* our noun. We get around this by simply marking the found
      // adjectives with a toDelete bool (after having added them to the list of
      // adjectives), and then dropping all such objects at the end. Note,
      // however, that this means that we can't use a while loop this time.
      //
      // j is the number of words skipped (i.e. the gap between the noun and
      // where we end our string);
      // i is the length of the string (in words).
      for ( var j = 0; j <= index - 1; j++) {
        var adjFound = false;
        for (var i = 0; i <= index - 1 - j; i++) {
          var totalBeforeIndex = [];
          Object.values(parsedInput.slice(i, index-j)).map(value => {
            totalBeforeIndex.push(value['input']);
          });
          befores.forEach(function(before) {
            if ( totalBeforeIndex.join(' ') === before['atom'] ) {
              var result = {};
              result['input'] = totalBeforeIndex.join(' ');
              result['type'] = 'adjective';
              result['base'] = before['base'];
              parsedInput[index]['adjs'].push(result);
              Object.values(parsedInput.slice(i, index-j)).map(value => {
                value['toDelete'] = true;
              });
              adjFound = true;
            }
          });
        }
        if ( !adjFound ) {
          break;
        }
      }


    } // END if (item['type'] === 'noun')
  }); // END parsedInput.forEach(function(item, index)

  // Now delete any items marked for deletion in the searching of adjectives
  // that come before nouns.
  parsedInput = parsedInput.filter(item => !item['toDelete']);

  // END STEP 2.



  // STEP 2.5
  // Abstract variables.
  parsedInput.forEach(function(item, index) {
    var string = item['input'];
    if ( string.charAt(0) == '$' && string.charAt(string.length-1) == '$' ) {
      item['type'] = 'variable';
    }
  });
  // END STEP 2.5.



  // STEP 3.
  // TODO: sentence constructors.
  // TODO: this will be more regexing than exact searching, right?
  // e.g. (let . be .) should be a regex and we should check that the two matches
  // (the arguments) are both of the right type

  var constructorRegexes = []
  Object.keys(constructors).map(consBase => {
    var cons = constructors[consBase][language];
    // BUILD A REGEX WHERE WE REPLACE THE ☐ BY .* (???) (THIS SHOULD BE TYPED!)
    //
    // LOOK FOR ANY ARROWS IN THE TYPE
    // THEN LOOK FOR WHAT IS DIRECTLY LEFT OF THEM
    // THIS IS THE TYPE OF THE GAPS
    // 
    // SOMEHOW FILL IN THE CONSTRUCTOR
      // think about "let $X$ be a finite group"
        // this is easy if "a" binds first, but tricky if "let ☐ be ☐" tries to
        // generally, we want things with 'final type' equal to n to bind first
    // 
    // NOW REMOVE THESE ARROWS AND CHARACTERS FROM THE TYPE
    // 
    // NOW REMOVE ANY SQUARE TENSOR SYMBOLS THAT HAVE ONLY EMPTY BRACKETS ()
    // EITHER SIDE
    // 
    // NOW REMOVE ANY EMPTY BRACKETS INCLUDING NESTED ONES LIKE (()) OR (()())
    // 
    // WHAT IS LEFT IS THE TYPE OF THE cons WHEN ALL ARGUMENTS WE HAVE HAVE BEEN
    // APPLIED
    console.log(cons);
    regex = new RegExp('');
  });

  // END STEP 3.



  // STEP 4.
  // TODO: do the translation!

  // END STEP 4.



  // STEP 5.
  // TODO: display things for the user.
  resultsHTML.html(JSON.stringify(parsedInput, undefined, 2));
  // for ( i = 0; i < translateInput.length; i++ ) {
  //   currentInput = translateInput[i];
  //   if ( currentInput['id'] !== language ) {
  //   }
  // }

  // END STEP 5.
});
