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
// TODO: CHANGE THIS TO BE ON BUTTON PRESS
//       this will (help) solve SO MANY THINGS e.g. binding in something like
//       'Let $X$ be a group and let $Y$ be a scheme', where we need 'and' to
//       bind first, but because the parsedInput is generated on every keypress,
//       everything before the and has already been bound
//       but is this actually a problem? i can't tell any more
//       i'm so confused
translateInput.keyup(function() {
  var searchValue = $(this).val();
  var inputLanguage = $(this).attr('id');

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
      if ( typeof nouns[nounBase]['root'][inputLanguage] !== 'undefined' ) {
        var atom = nouns[nounBase]['root'][inputLanguage]['atom'];
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
        var currentAdjective = adjectives[adjectiveBase][inputLanguage]
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
      //       the same for both

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

  var orderedCons = [];

  // We want to parse noun-type constructors before sentence-type ones (for
  // currently arbitrary reasons (i.e. because it seems to usually work best
  // that way in English))

  Object.keys(constructors).map(consBase => {
    var cons = constructors[consBase];
    // TODO: OH NO IT'S ANOTHER HACK
    var temp = cons[inputLanguage];
    temp['base'] = consBase;
    temp['argsType'] = cons['argsType'];
    switch (cons['fullType'].charAt(0)) {
      case 'n':
        temp['fullType'] = 'n';
        orderedCons.unshift(temp);
        break;
      case 's':
        temp['fullType'] = 's';
        orderedCons.push(temp);
        break;
    }
  });

  orderedCons.forEach(function(item, index) {
    // parsedReplacement will be what we build to eventually replace the basic
    // entry of our constructor in parsedInput
    var parsedReplacement = {};
    parsedReplacement['consAtom'] = item['atom'];
    parsedReplacement['consType'] = item['type'];
    parsedReplacement['base'] = item['base'];
    parsedReplacement['argsType'] = item['argsType'];
    switch (item['fullType']) {
      case 'n':
        parsedReplacement['type'] = 'noun';
        break;
      case 's':
        parsedReplacement['type'] = 'sentence';
        break;
    }

    // parsedConstructor is sort of a bridge towards building parsedReplacement
    // and I'm sure that we don't really need it...
    // ...but this is all one big hack anyway, so who cares :)
    var parsedConstructor = item['atom']
    var numOfArgs = item['argsType'].split(',').length;

    if ( !item['atom'].includes('#') ) {
      // By convention, if all of the arguments of a constructor are on the
      // right, then we don't have to write in all the #s. This just adds them
      // in if it sees that there are none.
      var toAppend = Array(numOfArgs).fill(' #');
      parsedConstructor = parsedConstructor + (toAppend.join(''));
    }
    parsedConstructor = parsedConstructor.split(' ');

    var firstPositioned = null;

    parsedConstructor.forEach(function(cItem, cIndex) {
      // For every non-# word in the constructor ...
      if ( cItem !== '#' ) {
        // ... find out where it occurs in the parsedInput tree ...
        parsedInput.forEach(function(pItem, pIndex) {
          if ( pItem['input'] == cItem ) {
            parsedConstructor[cIndex] = {};
            parsedConstructor[cIndex]['atom'] = cItem;
            parsedConstructor[cIndex]['position'] = pIndex;
            if (!firstPositioned) {
              // ... and, for the first word that we locate, make a note of
              //   (1) where it is within the parsedInput tree, and
              //   (2) where it is within the parsedConstructor list
              // by just keeping a record of their difference (the offset is all
              // that we care about here)
              firstPositioned = pIndex - cIndex;
            }
          }
        });
      }
    });

    for ( var i = 1; i <= numOfArgs; i++ ) {
      // For every # in the constructor, find out what type it represents, by
      // looking at the argsType
      var firstHashPosition = parsedConstructor.indexOf('#');
      parsedConstructor[firstHashPosition] = {};
      // TODO: YOU REALLY NEED TO SORT OUT THIS TYPING CLASS STRUCTURE THING
      var argsTypeExpanded = item['argsType'].replace('n', 'noun');
      argsTypeExpanded = argsTypeExpanded.replace('v', 'variable');
      argsTypeExpanded = argsTypeExpanded.replace('s', 'sentence');
      parsedConstructor[firstHashPosition]['type'] = argsTypeExpanded.split(',')[i-1];
    }

    parsedConstructor.forEach(function(cItem, cIndex) {
      // Now, for every item in the parsedConstructor list that does *not* have
      // a position (i.e. every #), we calculate what position within the
      // parsedInput tree it corresponds to by seeing where it lies with respect
      // to our firstPositioned variable.
      if ( !cItem['position'] && typeof(firstPositioned) !== null ) {
        cItem['position'] = firstPositioned + cIndex;
      }
    });

    parsedReplacement['args'] = [];

    var thingsAdded = 0;

    parsedConstructor.forEach(function(cItem, cIndex) {
      // It *should* be the case that only #s had types assigned to them...
      if ( cItem['type'] && cItem['position'] ) {
        var correspondingItem = parsedInput[cItem['position']];
        if (correspondingItem) {
          switch (cItem['type']) {
            // TODO: this is not nice. there should be some tree of types
            //       somewhere and some function that can tell if a type is a
            //       subtype of another (i.e a class? is that what they're
            //       called in javascript? i don't know. i wish i were writing
            //       this in haskell)
            case 'variable':
              // TODO: rewrite this with something like `.element?`
              if ( correspondingItem['type'] == 'variable') {
                parsedReplacement['args'].push(JSON.parse(JSON.stringify(correspondingItem)));
                thingsAdded += 1;
              }
              break;
            case 'noun':
              // TODO: rewrite this with something like `.element?`
              if ( correspondingItem['type'] == 'noun' || correspondingItem['type'] == 'variable') {
                parsedReplacement['args'].push(JSON.parse(JSON.stringify(correspondingItem)));
                thingsAdded += 1;
              }
              break;
            case 'sentence':
              // TODO: rewrite this with something like `.element?`
              if ( correspondingItem['type'] == 'noun' || correspondingItem['type'] == 'noun' || correspondingItem['type'] == 'variable') {
                parsedReplacement['args'].push(JSON.parse(JSON.stringify(correspondingItem)));
                thingsAdded += 1;
              }
              break;
          }
        }
      }
    });

    if ( thingsAdded ) {
      parsedInput[firstPositioned] = parsedReplacement;
      parsedInput.splice(firstPositioned+1, parsedReplacement['consAtom'].split(' ').length-1)
    }
  });

  // END STEP 3.
  // 
  // TODO: WHY does something like "group $X$" just break it? the moment it sees
  //       a noun on its own I think it just stops??
  //       
  // NOTE: IT'S THE LINE
  //         parsedInput.splice(firstPositioned+1, parsedReplacement['consAtom'].split(' ').length-1)
  // 

  var baseTranslation = {};
  var translations = {};

  function translateToBase(tree) {
    translation = "";
    if ( typeof(tree) !== 'object' ) {
      tree = JSON.parse(tree);
    }

    switch (tree['type']) {
      case 'variable':
        translation += tree['input'];
        break;
      case 'noun':
        translation += tree['base'];
        if (tree['adjs'].length !== 0) {
          tree['adjs'].forEach(function(item, index){
            translation += '.';
            translation += translateToBase(item);
          });
        }
        break;
      case 'adjective':
        translation += tree['base'];
        break;
      case 'constructor':
        translation += tree['base'];
        // if (tree['args']) {
        //   translation += translateToBase(tree['args']);
        // }
        break;
      case 'sentence':
        translation += tree['base'];
        // if (tree['args']) {
        //   translation += translateToBase(tree['args']);
        // }
        break;
    }

    return translation;
  }

  for ( var i = 0; i < translateInput.length; i++ ) {
    currentInput = translateInput[i];
    currentLanguage = currentInput['id'];
    translations[currentLanguage] = ""
    if ( currentLanguage !== inputLanguage ) {
      parsedInput.forEach(function(item, index) {
        // TODO: there's a nice javascript way of writing this, without the
        //       weird callback faff
        translations[currentLanguage] = translateToBase(JSON.stringify(item));
      });
    }
  }

  // STEP 4.
  // TODO: turn the tree into just some base sentence, e.g. 'Let $X$ be a scheme
  //       of finite type' would become `η($X$⊠(08b50276.271a0557))`



  // TODO: use 'vari' to get the arguments in the right order

  // END STEP 4.



  // STEP 5.
  // TODO: display things for the user.
  resultsHTML.html(JSON.stringify(parsedInput, undefined, 2));

  for ( var i = 0; i < translateInput.length; i++ ) {
    currentInput = translateInput[i];
    currentLanguage = currentInput['id'];
    if ( currentLanguage !== inputLanguage ) {
      currentInput.value = translations[currentLanguage];
    }
  }

  // END STEP 5.
});
