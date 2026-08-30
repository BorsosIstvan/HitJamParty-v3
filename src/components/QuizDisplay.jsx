import React, { useState } from 'react';

function QuizDisplay({ eveket, eloadokat, cimeket, onValasz, valaszolt, helyesE }) {
  // Belső állapot a játékmód követésére: 'ev', 'artist', vagy 'title'
  const [jatekMod, setJatekMod] = useState('ev');

  // Kiválasztjuk, hogy melyik opciós listát kell épp kirajzolni
  let aktualisOpciok = eveket;
  let kerdesSzoveg = "Melyik évben jelent meg a dal?";
  
  if (jatekMod === 'artist') {
    aktualisOpciok = eloadokat;
    kerdesSzoveg = "Ki adja elő ezt a dalt?";
  } else if (jatekMod === 'title') {
    aktualisOpciok = cimeket;
    kerdesSzoveg = "Mi a dal pontos címe?";
  }

  // Meghívjuk a szülőt a tippel, de átadjuk a mód típusát is a pontozáshoz
  const handleGombKattintas = (tipp) => {
    onValasz(tipp, jatekMod);
  };

  return (
    <div style={{ margin: '15px 0' }}>
      
      {/* KAPSZULA FÜLEK: Zsúfoltság helyett elegáns váltás */}
      <div className="quiz-tabs">
        <button 
          className={`quiz-tab-btn ${jatekMod === 'ev' ? 'active' : ''}`}
          onClick={() => !valaszolt && setJatekMod('ev')}
        >
          📅 Évszám
        </button>
        <button 
          className={`quiz-tab-btn ${jatekMod === 'artist' ? 'active' : ''}`}
          onClick={() => !valaszolt && setJatekMod('artist')}
        >
          🎤 Előadó
        </button>
        <button 
          className={`quiz-tab-btn ${jatekMod === 'title' ? 'active' : ''}`}
          onClick={() => !valaszolt && setJatekMod('title')}
        >
          🎵 Dalcím
        </button>
      </div>

      {/* Dinamikus kérdés szöveg */}
      <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '10px 0' }}>{kerdesSzoveg}</p>
      
      {/* 2x2-es rács a gomboknak */}
      <div className="quiz-grid">
        {aktualisOpciok.map((tipp) => (
          <button 
            key={tipp} 
            className="quiz-btn"
            disabled={valaszolt}
            onClick={() => handleGombKattintas(tipp)}
            style={{ fontSize: jatekMod !== 'ev' ? '18px' : '18px' }} // Szövegeknél picit kisebb betű, hogy elférjen a gombon
          >
            {tipp}
          </button>
        ))}
      </div>

      {/* Visszajelzés */}
      {valaszolt && (
        <p style={{ 
          fontSize: '17px', 
          fontWeight: 'bold', 
          color: helyesE ? '#00ff64' : '#ff3333',
          margin: '10px 0 0 0'
        }}>
          {helyesE 
            ? `🎉 Helyes! (${jatekMod === 'ev' ? '+10' : '+5'} Pont)` 
            : "❌ Sajnos hibás tipp!"
          }
        </p>
      )}
    </div>
  );
}

export default QuizDisplay;
