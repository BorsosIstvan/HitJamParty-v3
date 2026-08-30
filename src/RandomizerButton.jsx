import React from 'react';

// A gomb megkapja a teljes daltömböt és az App.jsx állapotmódosító függvényét
function RandomizerButton({ dalokListaja, onDalValasztas }) {
  
  const sorsolUjDalt = () => {
    if (!dalokListaja || dalokListaja.length === 0) return;
    
    // Itt történik a logikai sorsolás, teljesen kiszervezve az App.jsx-ből
    const veletlenIndex = Math.floor(Math.random() * dalokListaja.length);
    const kivalasztott = dalokListaja[veletlenIndex];
    
    // Beküldjük a kisorsolt dalt a főállapotba
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
