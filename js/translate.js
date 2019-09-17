const nounsURL = "https://thosgood.com/maths-dictionary/json/nouns.json";

const translateInput = $('#translateInput');
const resultsDiv = $('#results');

var nouns
// TODO: this can be rewritten somehow simpler, but I can't remember how...
$.getJSON(nounsURL, function(data) {
    nouns = data;
});

translateInput.keyup(function() {
    var searchValue = $(this).val();

    if (searchValue === '') {
        resultsDiv.html('');
        return;
    }
    
    var regex = new RegExp(searchValue, "i");
    var matches = [];
    Object.keys(nouns).map(e => {
        Object.keys(nouns[e].root).map(f => {
            var atom = nouns[e].root[f]
            if (atom.search(regex) != -1) {
                matches += atom;
            }
        });
    });

    resultsDiv.html(matches);
});
