let Language : Type = < DE | EN | ES | FR | IT | JA | PT | RU | ZH >
let Position : Type = < Before | After >
-- Gender should be a type dependent on Language
let Gender : Type = < M | F | N >

-- let languageGender : Language -> Gender -> Text =
  

-- Noun should be dependent on Language
let Noun : Type =
  { atom : Text
  , gend : Gender
  }

-- Adjective should be dependent on Language
let Adjective : Type =
  { atom : Text
  , pstn : Position
  }

let Entry : Type =
  { root : Noun
  , adjs : List Adjective
  }

in {

}