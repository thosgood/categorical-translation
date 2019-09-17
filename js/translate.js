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
  searchValue.split(' ').forEach(function(item) {
    if ( item === '' ) {
      return;
    }

    parsedInput[item] = {};
    var itemAdded = false;

    Object.keys(nouns).map(nHash => {
      Object.keys(nouns[nHash].root).map(lang => {
        var atom = nouns[nHash].root[lang].atom;
        if (atom === item) {
          if ( typeof parsedInput[item][nHash] === `undefined` ) {
            parsedInput[item][nHash] = [];
          }
          parsedInput[item][nHash].push(lang);
          itemAdded = true;
        }
      });
    });

    if (!itemAdded) {
      parsedInput[item] = 'unknown';
    }
  });

  resultsHTML.html('');
  Object.keys(parsedInput).map(word => {
    if ( parsedInput[word] === 'unknown' ) {
      resultsHTML.append(`<span class="unknown">${word}</span>`);
    } else {
      allLanguages = Object.values(parsedInput[word]).flat().join(' ');
      resultsHTML.append(`<span class="noun ${allLanguages}">${word}</span>`);
    }
  });
});
