function JoursFeries(an: number) {
  let JourAn = new Date(an, 0, 1);
  let FeteTravail = new Date(an, 4, 1);
  let Victoire1945 = new Date(an, 4, 8);
  let FeteNationale = new Date(an, 6, 14);
  let Assomption = new Date(an, 7, 15);
  let Toussaint = new Date(an, 10, 1);
  let Armistice = new Date(an, 10, 11);
  let Noel = new Date(an, 11, 25);

  var G = an % 19;
  var C = Math.floor(an / 100);
  var H =
    (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
  var I =
    H -
    Math.floor(H / 28) *
      (1 -
        Math.floor(H / 28) *
          Math.floor(29 / (H + 1)) *
          Math.floor((21 - G) / 11));
  let J = (an * 1 + Math.floor(an / 4) + I + 2 - C + Math.floor(C / 4)) % 7;
  let L = I - J;
  let MoisPaques = 3 + Math.floor((L + 40) / 44);
  let JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4);
  let Paques = new Date(an, MoisPaques - 1, JourPaques);

  let LundiPaques = new Date(an, MoisPaques - 1, JourPaques + 1);
  let Ascension = new Date(an, MoisPaques - 1, JourPaques + 39);
  let Pentecote = new Date(an, MoisPaques - 1, JourPaques + 49);
  let LundiPentecote = new Date(an, MoisPaques - 1, JourPaques + 50);

  return Array(
    JourAn,
    Paques,
    LundiPaques,
    FeteTravail,
    Victoire1945,
    Ascension,
    Pentecote,
    LundiPentecote,
    FeteNationale,
    Assomption,
    Toussaint,
    Armistice,
    Noel
  );
}
function dernierJourMoisSelected(moisSelected: any) {
  let myDate = new Date();
  myDate.setMonth(moisSelected);
  myDate.setDate(0);
  let lastDay = myDate.getDate();
  return lastDay;
}

function estJourOuvre(dateSelected: any, joursFeries: any) {
  let estFerie = false;
  let joursOuvres = false;
  joursFeries.forEach((element: any) => {
    if (element.getTime() === dateSelected.getTime()) {
      estFerie = true;
    }
  });
  let joursSemaine = dateSelected.getDay();

  if (joursSemaine !== 0 && joursSemaine !== 6 && estFerie === false) {
    joursOuvres = true;
  }
  return joursOuvres;
}

const JoursOuvres = (moisSelected: any): number => {
  let dateActuelle = new Date();
  let joursFeries = JoursFeries(dateActuelle.getFullYear());
  let dateDebut = new Date(dateActuelle.getFullYear(), moisSelected - 1, 1);
  let dernierJoursMois = dernierJourMoisSelected(moisSelected);
  let dateFin = new Date(
    dateActuelle.getFullYear(),
    moisSelected - 1,
    dernierJoursMois
  );

  let dCurrent = dateDebut;
  let estOuvre = false;
  let nbJoursTravaille = 0;
  do {
    estOuvre = estJourOuvre(dCurrent, joursFeries);
    if (estOuvre) {
      ++nbJoursTravaille;
    }
  } while (dCurrent.setDate(dCurrent.getDate() + 1) <= dateFin.getTime());
  return nbJoursTravaille;
};

export default JoursOuvres;
