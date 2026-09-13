import React from 'react';

function GameStats({ albumokListaja, pakli }) {
  const albumokSzama = albumokListaja.length;

  const osszesDalSzama = albumokListaja.reduce((osszeg, album) => {
    return osszeg + (album.songs ? album.songs.length : 0);
  }, 0);

  // Kiszámoljuk a hátralévő és a már lejátszott dalok számát
  const hatralevoDalok = pakli.length === 0 ? osszesDalSzama : pakli.length;
  const aktualisDalSorszama = osszesDalSzama - hatralevoDalok;

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
      <p style={{ margin: '5px 0' }}>🎵 Játékban lévő dalok: <strong>{osszesDalSzama}</strong></p>
      
      {/* ÚJ STATISZTIKAI KIJELZÉSEK */}
      <p style={{ margin: '5px 0', color: '#ff8c00' }}>
        📊 Sorsolási folyamat: <strong>{aktualisDalSorszama} / {osszesDalSzama}</strong> dal lejátszva
      </p>
      <p style={{ margin: '5px 0', color: '#ffa500' }}>
        🃏 Még a pakliban maradt: <strong>{hatralevoDalok}</strong> dal
      </p>
    </div>
  );
}

export default GameStats;
