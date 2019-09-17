const nounsURL = "https://raw.githubusercontent.com/thosgood/maths-dictionary/master/json/nouns.json?token=ABWM5B7EOBETG4OS3MM4LK25RIR5K";

const translateInput = $( '#translateInput' );
const resultsDiv = $( '#results' );

var nouns
// TODO: this can be rewritten somehow simpler, but I can't remember how...
$.getJSON( nounsURL, function( data ) {
    nouns = data;
});

translateInput.keyup( function() {
    var searchValue = $( this ).val();

    if ( searchValue === '' ) {
        resultsDiv.html( '' );
        return;
    }
    
    var regex = new RegExp( searchValue, "i" );
    console.log( Object.keys(nouns) );
});
