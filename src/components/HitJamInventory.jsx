import React from 'react';

function HitJamInventory({ albumok, aktivAlbumIds, onToggleAlbum }) {
  return (
    <div style={{ animation: 'fade-in 0.3s ease', textAlign: 'left' }}>
      <h3 style={{ color: '#fff', textAlign: 'center' }}>Saját Raktáram 🎒</h3>
      <p style={{ fontSize: '13px', opacity: 0.7, textAlign: 'center', marginBottom: '20px' }}>
        Kapcsold be azokat az albumokat, amikből sorsolni szeretnél!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {albumok.map((album) => {
          // Ellenőrizzük, hogy a játékos birtokolja-e (a Pi-től kapott listában)
          const megvan = true; // Később ezt szűrhetjük az App.jsx state alapján
          const aktiv = aktivAlbumIds.includes(album.id);

          return (
            <div key={album.id} style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '12px', 
              borderRadius: '15px',
              border: '1px solid rgba(255,69,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🎴</span>
                <div>
                  <h4 style={{ margin: 0, color: '#fff' }}>{album.title}</h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', opacity: 0.6 }}>
                    {album.songs.length} dal elérhető
                  </p>
                </div>
              </div>

              {/* Játékba vonási pipa (Toggle) */}
              <label style={{ cursor: 'pointer', padding: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={aktiv} 
                  onChange={() => onToggleAlbum(album.id)}
                  style={{ accentColor: '#ff4500', transform: 'scale(1.3)' }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HitJamInventory;
