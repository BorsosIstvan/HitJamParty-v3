import React from 'react';

function GameStats({ albumokListaja }) {
  // 1. Az albumok száma egyszerűen a tömb hossza
  const albumokSzama = albumokListaja.length;

  // 2. Összeszámoljuk az összes dalt az összes albumból (redukálással)
  const osszesDalSzama = albumokListaja.reduce((osszeg, album) => {
    return osszeg + (album.songs ? album.songs.length : 0);
  }, 0);

  return (
    <div style={{ 
      margin: '15px 0', 
      padding: '10px', 
      borderTop: '1px solid rgba(255, 69, 0, 0.2)', 
      borderBottom: '1px solid rgba(255, 69, 0, 0.2)',
      fontSize: '14px',
      opacity: 0.8
    }}>
      <p style={{ margin: '5px 0' }}>🎴 Elérhető albumok: <strong>{albumokSzama}</strong></p>
      <p style={{ margin: '5px 0' }}>🎵 Összes játékban lévő dal: <strong>{osszesDalSzama}</strong></p>
    </div>
  );
}

export default GameStats;
