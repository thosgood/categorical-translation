let Language : Type = < DE | EN | ES | FR | IT | JA | PT | RU | ZH >
let Position : Type = < Before | After >
-- Gender should be a type dependent on Language
let Gender : Type = < M | F | N >

let languageGender : Language -> Gender -> Text =
  

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

{
  08b50276 = {
    root = {
      DE = { atom = Schema , gend = Maskulina   }
    , EN = { atom = scheme                      }
    , ES = { atom = esquema, gend = masculino   }
    , FR = { atom = schéma , gend = masculin    }
    , IT = { atom = schema , gend = maschile    }
    , JA = { atom = 概形                        }
    , PT = { atom = esquema, gend = masculino   }
    , RU = { atom = cхема  , gend = же́нский род }
    , ZH = { atom = 概形                        }
    }
  , adjs = {

  }
}