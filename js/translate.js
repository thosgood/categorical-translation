const nounsURL = "https://thosgood.com/categorical-translation/json/nouns.json";

const translateInput = $('#translateInput');
const resultsUL = $('#results');

var nouns
// TODO: this can be rewritten somehow simpler, but I can't remember how...
$.getJSON(nounsURL, function(data) {
    nouns = data;
});

translateInput.keyup(function() {
    var searchValue = $(this).val();

    if (searchValue === '') {
        resultsUL.html('');
        return;
    }
    
    var regex = new RegExp(searchValue, "i");
    var matches = [];
    Object.keys(nouns).map(e => {
        Object.keys(nouns[e].root).map(f => {
            var atom = nouns[e].root[f].atom
            if (atom.search(regex) != -1) {
                matches += `<li>${f}: ${atom}</li>`;
            }
        });
    });

    resultsUL.html(matches);
});
