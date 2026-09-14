import React from 'react';

// Segédfüggvény a tömb tökéletes megkeveréséhez (Fisher-Yates algoritmus)
const shuffleArray = (tomb) => {
  const ujTomb = [...tomb];
  for (let i = ujTomb.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ujTomb[i], ujTomb[j]] = [ujTomb[j], ujTomb[i]];
  }
  return ujTomb;
};

function RandomizerButton({ dalokListaja, onDalValasztas, pakli, setPakli }) {
  
  const sorsolUjDalt = () => {
    if (!dalokListaja || dalokListaja.length === 0) return;
    
    let aktualisPakli = [...pakli];

    // HA ELFOGYOTT: vagy ha üres, azonnal újratöltjük az összes elérhető dalból
    if (aktualisPakli.length === 0) {
      aktualisPakli = shuffleArray(dalokListaja);
    }
    
    // Kivesszük az első dalt
    const kivalasztott = aktualisPakli.shift();
    
    // Biztonsági mentés: ha valamiért mégis üres maradt a pakli (mert pl. csak 1 dal van az albumban),
    // akkor ne engedjük beragadni, hanem a következő körre készítsük elő a teljes listát
    if (aktualisPakli.length === 0) {
      setPakli([]);
      localStorage.removeItem('hitjam_pakli');
    } else {
      setPakli(aktualisPakli);
    }
    
    if (kivalasztott) {
      onDalValasztas(kivalasztott);
    }
  };


  return (
    <button 
      className="hitjam-btn" 
      onClick={sorsolUjDalt} 
      style={{ borderColor: '#ff8c00', color: '#ff8c00' }}
    >
      <span>🎲</span>
      <span>Következő dal sorsolása</span>
    </button>
  );
}

export default RandomizerButton;
