import React, { useState } from 'react';

// Segédfüggvény a tömb tökéletes megkeveréséhez (Fisher-Yates algoritmus)
const shuffleArray = (tomb) => {
  const ujTomb = [...tomb];
  for (let i = ujTomb.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ujTomb[i], ujTomb[j]] = [ujTomb[j], ujTomb[i]];
  }
  return ujTomb;
};

function RandomizerButton({ dalokListaja, onDalValasztas }) {
  // Ebben a state-ben tároljuk a még ki nem sorsolt, már megkevert dalokat
  const [pakli, setPakli] = useState([]);

  const sorsolUjDalt = () => {
    if (!dalokListaja || dalokListaja.length === 0) return;
    
    // Másolatot készítünk a jelenlegi le nem játszott dalokról
    let aktualisPakli = [...pakli];

    // HA ÜRES A PAKLI (vagy ez az első sorsolás): Újrakeverjük az ÖSSZES dalt
    if (aktualisPakli.length === 0) {
      aktualisPakli = shuffleArray(dalokListaja);
      console.log("A dalok elfogytak vagy ez az első kör. A teljes pakli újra lett keverve!");
    }
    
    // HÚZÁS: Kiemeljük a legelső dalt a megkevert pakliból (és töröljük a tömbből)
    const kivalasztott = aktualisPakli.shift();
    
    // Elmentjük a maradék paklit a state-be
    setPakli(aktualisPakli);
    
    // Beküldjük a kisorsolt dalt az App.jsx főállapotába
    onDalValasztas(kivalasztott);
  };

  // Opcionális: Kiírathatjuk a gombra vagy egy kis szövegbe, hogy hány dal van még hátra
  const hatralevoDalokSzama = pakli.length === 0 ? dalokListaja.length : pakli.length;

  return (
    <button 
      className="hitjam-btn" 
      onClick={sorsolUjDalt} 
      style={{ borderColor: '#ff8c00', color: '#ff8c00' }}
    >
      <span>🎲</span>
      <span>Következő dal sorsolása ({hatralevoDalokSzama} maradt)</span>
    </button>
  );
}

export default RandomizerButton;
