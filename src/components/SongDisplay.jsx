import React from 'react';

// Behozzuk a 'valaszolt' logikai tulajdonságot is a szülőtől
function SongDisplay({ trackName, artistName, year, valaszolt }) {
  return (
    <div style={{ margin: '20px 0', minHeight: '80px' }}>
      
      {/* FELTÉTELES MEGJELENÍTÉS: */}
      {!valaszolt ? (
        /* HA MÉG NEM VÁLASZOLT -> Titkosított kvíz nézet */
        <>
          <h3 style={{ margin: 0, color: '#ff4500', fontSize: '24px', letterSpacing: '1px' }}>
            🎵 TALÁLD KI A DALT!
          </h3>
          <p style={{ margin: '8px 0 0 0', opacity: 0.5, fontStyle: 'italic', fontSize: '14px' }}>
            Hallgasd a zenét és tippelj lenn...
          </p>
        </>
      ) : (
        /* HA MÁR VÁLASZOLT -> Leleplezzük a dal valódi adatait */
        <>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '22px', animation: 'fade-in 0.4s ease' }}>
            {trackName}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#ff8c00', fontWeight: 'bold', animation: 'fade-in 0.4s ease' }}>
            {artistName}
          </p>
          <p style={{ margin: '8px 0 0 0', opacity: 0.8, color: '#ff4500', fontSize: '16px', fontWeight: 'bold' }}>
            📅 {year}
          </p>
        </>
      )}

    </div>
  );
}

export default SongDisplay;
