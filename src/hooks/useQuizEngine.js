import { useState, useEffect } from 'react';

export function useQuizEngine(aktualisDal, osszesDal) {
  // Három külön tömbben tároljuk a generált opciókat
  const [eveket, setEveket] = useState([]);
  const [eloadokat, setEloadokat] = useState([]);
  const [cimeket, setCimeket] = useState([]);
  
  const [valaszolt, setValaszolt] = useState(false);
  const [helyesE, setHelyesE] = useState(null);

  useEffect(() => {
    if (!aktualisDal || !osszesDal || osszesDal.length === 0) return;

    // --- 1. ÉVSZÁM GENERÁLÁS (A már meglévő logika) ---
    let helyesEv = aktualisDal.year;
    if (!helyesEv) {
      const megtalaltDal = osszesDal.find(d => d.title === aktualisDal.title && d.artist === aktualisDal.artist);
      helyesEv = megtalaltDal ? megtalaltDal.year : 1980;
    }
    const evSet = new Set([helyesEv]);
    while (evSet.size < 4) {
      const hamisEv = helyesEv + (Math.floor(Math.random() * 21) - 10);
      if (hamisEv > 1950 && hamisEv <= 2026) evSet.add(hamisEv);
    }
    setEveket(kevertTomb(Array.from(evSet)));

    // --- 2. ELŐADÓ GENERÁLÁS ---
    const eloadoSet = new Set([aktualisDal.artist]);
    while (eloadoSet.size < 4) {
      const veletlenDal = osszesDal[Math.floor(Math.random() * osszesDal.length)];
      if (veletlenDal.artist) eloadoSet.add(veletlenDal.artist);
    }
    setEloadokat(kevertTomb(Array.from(eloadoSet)));

    // --- 3. DALCÍM GENERÁLÁS ---
    const cimSet = new Set([aktualisDal.title]);
    while (cimSet.size < 4) {
      const veletlenDal = osszesDal[Math.floor(Math.random() * osszesDal.length)];
      if (veletlenDal.title) cimSet.add(veletlenDal.title);
    }
    setCimeket(kevertTomb(Array.from(cimSet)));

    setValaszolt(false);
    setHelyesE(null);
  }, [aktualisDal, osszesDal]);

  // Segédfüggvény a tömbök megkeveréséhez
  const kevertTomb = (tomb) => {
    const ujTomb = [...tomb];
    for (let i = ujTomb.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ujTomb[i], ujTomb[j]] = [ujTomb[j], ujTomb[i]];
    }
    return ujTomb;
  };

  // Ellenőrzés: Megnézzük, hogy a tipp egyezik-e a dal bármelyik helyes adatával
  const ellenorizValasz = (tipp) => {
    if (valaszolt) return null;
    
    let helyesEv = aktualisDal.year;
    if (!helyesEv) {
      const megtalaltDal = osszesDal.find(d => d.title === aktualisDal.title && d.artist === aktualisDal.artist);
      helyesEv = megtalaltDal ? megtalaltDal.year : 1980;
    }

    const talalt = tipp === helyesEv || tipp === aktualisDal.artist || tipp === aktualisDal.title;
    setValaszolt(true);
    setHelyesE(talalt);
    return talalt;
  };

  return {
    eveket,
    eloadokat,
    cimeket,
    valaszolt,
    helyesE,
    ellenorizValasz
  };
}
