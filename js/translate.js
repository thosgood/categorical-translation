const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('#translateInput');
const resultsUL = $('#results');

var nouns
$.getJSON(nounsURL, data => nouns = data);

translateInput.keyup(function() {
  var searchValue = $(this).val();
  var regex = new RegExp(searchValue);
    
  if (searchValue === '') {
    resultsUL.html('');
    return;
  }

  var matches = [];
  Object.keys(nouns).map(hashn => {
    Object.keys(nouns[hashn].root).map(lang => {
      var atom = nouns[hashn].root[lang].atom;
        if (atom.search(regex) != -1) {
          var adjectives = [];
          // matches += `<li>${f}: ${atom} (NOUN)</li>`;
          Object.keys(nouns[hashn].adjs).map(hasha => {
            var adj = nouns[hashn].adjs[hasha][lang];
            if (typeof adj !== 'undefined') {
              adjectives += `
                <li>${nouns[hashn].adjs[hasha][lang].atom}</li>
              `;
            }
          });
          matches += `
            <li>
              ${lang}: ${atom} (NOUN)
              <ul>
                ${adjectives}
              </ul>
            </li>
          `;
        }
    });
  });

  resultsUL.html(matches);
});
