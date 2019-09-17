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

  var parsedInput = [];
  searchValue.split(' ').forEach(function(item) {
    if (item === '') {
      return;
    }

    var itemAdded = false;

    // var regex = new RegExp(item);
    Object.keys(nouns).map(nHash => {
      Object.keys(nouns[nHash].root).map(lang => {
        var atom = nouns[nHash].root[lang].atom;
        // if (atom.search(regex) != -1) {
         if (atom === item) {
          parsedInput.push(`<span class="noun ${lang}">${atom}</span>`);
          itemAdded = true;
        }
      });
    });

    if (!itemAdded) {
      parsedInput.push(`<span class="unknown">${item}</span>`);
    }
  });

  resultsHTML.html(parsedInput.join(' '));

  // var regex = new RegExp(searchValue);
  // var matches = [];
  // Object.keys(nouns).map(hashn => {
  //   Object.keys(nouns[hashn].root).map(lang => {
  //     var atom = nouns[hashn].root[lang].atom;
  //       if (atom.search(regex) != -1) {
  //         var adjectives = [];
  //         // matches += `<li>${f}: ${atom} (NOUN)</li>`;
  //         Object.keys(nouns[hashn].adjs).map(hasha => {
  //           var adj = nouns[hashn].adjs[hasha][lang];
  //           if (typeof adj !== 'undefined') {
  //             adjectives += `
  //               <li>${nouns[hashn].adjs[hasha][lang].atom}</li>
  //             `;
  //           }
  //         });
  //         matches += `
  //           <li>
  //             ${lang}: ${atom} (NOUN)
  //             <ul>
  //               ${adjectives}
  //             </ul>
  //           </li>
  //         `;
  //       }
  //   });
  // });

  // resultsUL.html(matches);
});
