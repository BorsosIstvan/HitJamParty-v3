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

    // HA ÜRES A PAKLI: Újrakeverjük a játékban lévő dalokat
    if (aktualisPakli.length === 0) {
      aktualisPakli = shuffleArray(dalokListaja);
      console.log("Új játékkör indult, a pakli frissen megkeverve!");
    }
    
    // HÚZÁS: Kiemeljük a legelső dalt
    const kivalasztott = aktualisPakli.shift();
    
    // Elmentjük a maradék paklit
    setPakli(aktualisPakli);
    
    // Beállítjuk az aktuális dalt az App.jsx-ben
    onDalValasztas(kivalasztott);
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
