import React from 'react';

function HitJamInventory({ albumok, ownedAlbumsList, aktivAlbumIds, onToggleAlbum }) {
  const meglevoAlbumok = ownedAlbumsList && ownedAlbumsList.length > 0 ? ownedAlbumsList : ['retro-party'];

  // SZŰRÉS: Kizárólag azokat az albumokat jelenítjük meg a raktárban, 
  // amiket a felhasználó már megvásárolt (szerepel a meglevoAlbumok listában)!
  const sajatBirtokoltAlbumok = albumok.filter(album => meglevoAlbumok.includes(album.id));

  return (
    <div style={{ animation: 'fade-in 0.3s ease', textAlign: 'left' }}>
      <h3 style={{ color: '#fff', textAlign: 'center' }}>Saját Raktáram 🎒</h3>
      <p style={{ fontSize: '12px', opacity: 0.7, textAlign: 'center', marginBottom: '15px' }}>
        Kapcsold be azokat a lemezeket, amikből sorsolni szeretnél!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sajatBirtokoltAlbumok.map((album) => {
          const aktiv = aktivAlbumIds.includes(album.id);

          return (
            <div key={album.id} style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '12px', 
              borderRadius: '15px',
              border: '1px solid rgba(255,69,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#fff' }}>🎴 {album.title}</h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '11px', opacity: 0.6 }}>
                  {album.songs.length} dal aktív a játékban
                </p>
              </div>

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
