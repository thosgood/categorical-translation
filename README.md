# Categorical translation

### Things to do

#### Next on my list

- another fundamental constructor is `is: (s((n←)⊠(n←)))`

- the implementation is *really* extra bad because we keep on looking stuff up, and we really shouldn't be going "here's the input so here's the atom of the corresponding object" but instead "here's the input so here's the entire matching object (i.e. the base point, since fibres can be reconstructed)"

- switch to [Dhall](https://github.com/dhall-lang/dhall-lang) ?

#### Theory

- `noun`s are really just `constructor`s that take adjectives
- `variable` should be a subtype of `noun`!
    + and `noun` a subtype of `sentence`! (yikes)
- in the implementation i don't think we care about `type`, but only `argsType` and `fullType` (which of course can be recovered from `type`, but it's so much easier to do this step manually)
    + eventually this can be automated
- how can we type things so that "let $X$ be this and $Y$ be that" checks out
    + i.e. avoiding "let $X$ be this and let $Y$ be that"
- to describe a noun we should give the base + a list of any adjectives (in base form)
    + for example, a 'finite abelian group' would be described as `0677022e[08b70280,0b0e02cd]`
- rewrite "soit ☐ ☐/let ☐ be ☐" to be "let ☐ be **such that**"?
    + or can we just treat "the scheme $X$ such that blah" as a noun? yes?
- pluralisation rules
    + nouns _and_ their adjectives
    + will also have to deal similarly with verb conjugation
    + e.g. a vs. an
        * something like `"atom": { "next.first=vowel": "an", "next.first!=vowel": "a" }` ?
    + gender!
        * something like `"atom": { "next.gender=m": "un", "next.gender=f": "une" }` ?
- typing of "and" etc.
    + more generally/separately, polymorphic types
- synonyms (e.g. Hausdorff and separated)
    + more subtle (language ones) too
    + also, _conversely_, words with multiple meanings
- what is the formal difference between things which have "obvious" bases and those that don't? e.g. "and" and "if ☐ then ☐" vs. "let ☐ be ☐" and "the"
- guidelines/formatting rules/explanation of choices for base notation etc.
    + e.g. we assume that atoms attach to the right, so we include ☐ only if this is not the case; if we include one ☐ then we include all of them, even those that _do_ sit on the right
- **the notation of BASE is _for the moment_ purely suggestive**
    + it would be interesting to know if we _can_ formalise it, so that our languages can "only say things that make sense", but for now it is just a suggestive alternative to abstract hashes
- set of x, sequence of x, ... what are these?

#### Implementation

- https://github.com/reflex-frp/reflex-platform
    + https://vaibhavsagar.com/blog/2019/10/29/getting-along-with-javascript/

- mark which languages are case insensitive
- at the moment i think we just assume that all constructors take two arguments...
    + **i think we can always reduce to this case? i dunno, languages might be weird man...**
- constructors should be **checked** to see that the length of `argTypes` is equal to the number of #s (if the latter is non-zero)
    + this might be a **lot** easier in Dhall?
- should be able to manually insert brackets into the thing to be translated and have them respected
    + should be as 'simple' as just running the script not on the whole input, but on the most nested parts of the sentences first, and then working outwards
    + **definitely want to at least split on full stops, for example**
- adjectives referring to the same noun but with `and` between
- speed will eventually become a problem, i guess
    + might want to start separating out `parsedInput` into nouns, adjectives, constructors etc as we go, so that we don't have to iterate through all items every single time
- some input that can 'guess' the language (look at very early commits to see something like this)
- generating files from some user-editable dictionary
    + this should also generate the functors
        * how will this be done? surely not individual files for every possible pairing? use the fact that these all lie over some formal language and do a search for the elements in the fibre over the same point?
    + basically every yaml file should be machine generated
- automatic yaml checking/linting
    + even when generated, still good to check that it parses
- bases for nouns are Adler-32 hashes of the English name; we need
    + collision checking
    + some local version of the hash script https://www.miniwebtool.com/adler32-checksum-calculator/
- capital letters in e.g. German is going to mean we can't use case-insensitive regexes... ugh

### Things to read

- https://kwarc.info/people/mkohlhase/papers/icms16-smglom.pdf

- https://kwarc.info/people/mkohlhase/papers/synasc13.pdf
- http://www.logique.jussieu.fr/~alp/structure_vernacular.pdf
- https://uniformal.github.io/doc/

- http://mizar.org/JFM/

- https://docs.weblate.org/en/latest/index.html

- https://jiggerwit.wordpress.com/2019/06/20/an-argument-for-controlled-natural-languages-in-mathematics/

- https://en.wikipedia.org/wiki/Pregroup_grammar
    + [English](http://www.math.mcgill.ca/barr/lambek/pdffiles/Pregrammars.pdf)
    + [French](https://hal-lirmm.ccsd.cnrs.fr/file/index/docid/306504/filename/PrellerPrince-LinearParsing.pdf)

- https://arxiv.org/pdf/1811.11041.pdf

## Translation resources

- one of oh so many todo lists, of sorts: https://en.wikipedia.org/wiki/Glossary_of_algebraic_geometry

- https://ru.wikipedia.org/wiki/%D0%93%D0%BB%D0%BE%D1%81%D1%81%D0%B0%D1%80%D0%B8%D0%B9_%D0%B0%D0%BB%D0%B3%D0%B5%D0%B1%D1%80%D0%B0%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B9_%D0%B3%D0%B5%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%B8
- https://es.wikipedia.org/wiki/Anexo:Glosario_de_teor%C3%ADa_de_anillos
- https://arxiv.org/pdf/math/0609472.pdf
- https://www.emaths.co.uk/index.php/teacher-resources/other-resources/english-as-an-additional-language-eal/category/russian


