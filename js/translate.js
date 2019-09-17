const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('#translateInput');
const resultsHTML = $('#results');

var nouns;
$.getJSON(nounsURL, data => nouns = data);

translateInput.keyup(function() {
  var searchValue = $(this).val();
    
  if (searchValue === '') {
    resultsHTML.html('');
    return;
  }

  var parsedInput = {};
  searchValue.split(' ').forEach(function(item) {
    if (item === '') {
      return;
    }

    parsedInput[item] = {};
    var itemAdded = false;

    // var regex = new RegExp(item);
    Object.keys(nouns).map(nHash => {
      Object.keys(nouns[nHash].root).map(lang => {
        var atom = nouns[nHash].root[lang].atom;
        // if (atom.search(regex) != -1) {
        if (atom === item) {
          if (typeof parsedInput[item][nHash] === `undefined`) {
            parsedInput[item][nHash] = [];
          }
          parsedInput[item][nHash].push(lang);
          itemAdded = true;
        }
      });
    });

    if (!itemAdded) {
      parsedInput[item] = `unknown`;
    }
  });

  console.log(parsedInput);
  // resultsHTML.html(parsedInput.join(' '));
});
