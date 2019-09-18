# Categorical translation

### Things to do

#### Next on my list

- how are you going to deal with 'of finite type' ?

#### Theory

- to describe a noun we should give the base + a list of any adjectives (in base form)
    + for example, a 'finite abelian group' would be described as `0677022e[08b70280,0b0e02cd]`
- rewrite "soit ☐ ☐/let ☐ be ☐" to be "let ☐ be **such that**"?
    + or can we just treat "the scheme $X$ such that blah" as a noun? yes?
- pluralisation rules
    + nouns _and_ their adjectives
    + will also have to deal similarly with verb conjugation
- typing of "and" etc.
    + more generally/separately, polymorphic types
- synonyms (e.g. Hausdorff and separated)
    + more subtle (language ones) too
    + also, conversely, words with multiple meanings
- what is the formal difference between things which have "obvious" bases and those that don't? e.g. "and" and "if ☐ then ☐" vs. "let ☐ be ☐" and "the"
- guidelines/formatting rules/explanation of choices for base notation etc.
    + e.g. we assume that atoms attach to the right, so we include ☐ only if this is not the case; if we include one ☐ then we include all of them, even those that _do_ sit on the right
- **the notation of BASE is _for the moment_ purely suggestive**
    + it would be interesting to know if we _can_ formalise it, so that our languages can "only say things that make sense", but for now it is just a suggestive alternative to abstract hashes

#### Implementation

- some input that can 'guess' the language (look at very early commits to see something like this)
- generating files from some user-editable dictionary
    + this should also generate the functors
        * how will this be done? surely not individual files for every possible pairing? use the fact that these all lie over some formal language and do a search for the elements in the fibre over the same point?
    + basically every yaml file should be machine generated
- automatic yaml checking/linting
    + even when generated, still good to check that it parses
- bases for nouns are Adler-32 hashes of the English name; we need
    + collision checking
    + some local version of the hash script

### Things to read

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

- http://www.unit-conversion.info/texttools/adler-32/
- https://ru.wikipedia.org/wiki/%D0%93%D0%BB%D0%BE%D1%81%D1%81%D0%B0%D1%80%D0%B8%D0%B9_%D0%B0%D0%BB%D0%B3%D0%B5%D0%B1%D1%80%D0%B0%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B9_%D0%B3%D0%B5%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D0%B8
- https://es.wikipedia.org/wiki/Anexo:Glosario_de_teor%C3%ADa_de_anillos
- https://arxiv.org/pdf/math/0609472.pdf
- https://www.emaths.co.uk/index.php/teacher-resources/other-resources/english-as-an-additional-language-eal/category/russian

- 08b50276
    + `https://it.wikipedia.org/wiki/Schema_(matematica)#Tipi_di_schemi`
    + `https://translate.academic.ru/scheme/en/ru/`
    + `https://de.wikipedia.org/wiki/Schema_(algebraische_Geometrie)#Eigenschaften_von_Schemata`

