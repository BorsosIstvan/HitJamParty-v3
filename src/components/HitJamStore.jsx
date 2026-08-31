import React from 'react';

function HitJamStore({ albumok, ownedAlbumsList, coins, onVasarlas }) {
  // A Pi-től kapott listát ellenőrizzük (alapból a retro mindig megvan)
  const meglevoAlbumok = ownedAlbumsList && ownedAlbumsList.length > 0 ? ownedAlbumsList : ['retro-party'];

  // SZŰRÉS: Csak azokat az albumokat tesszük a boltba, amik benne vannak a JSON-ben, 
  // DE nem az első (retro-party) album, mert az mindenkinek ingyen jár!
  const boltiKinalat = albumok.filter(album => album.id !== 'retro-party');

  return (
    <div style={{ animation: 'fade-in 0.3s ease', textAlign: 'left' }}>
      <h3 style={{ color: '#fff', textAlign: 'center' }}>HitJam Bolt 🪙</h3>
      <p style={{ fontSize: '12px', opacity: 0.7, textAlign: 'center', marginBottom: '15px' }}>
        Vásárolj új lemezeket a megszerzett érméidből!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {boltiKinalat.map((album) => {
          const marMegvan = meglevoAlbumok.includes(album.id);
          // Ha a JSON-ben nincs megadva ár, az alapértelmezett legyen pl. 5 coin
          const ar = album.price !== undefined ? album.price : 5; 

          return (
            <div key={album.id} style={{ 
              background: 'rgba(255, 69, 0, 0.05)', 
              padding: '15px', 
              borderRadius: '15px',
              border: marMegvan ? '1px solid #00ff64' : '1px solid #ff4500',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#fff' }}>🔥 {album.title}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                  {marMegvan ? "Sikeresen megvásárolva!" : `Ár: 🪙 ${ar} HitJamCoin`}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.5 }}>
                  {album.description}
                </p>
              </div>
              
              {!marMegvan ? (
                <button 
                  className="hitjam-btn" 
                  disabled={coins < ar}
                  onClick={() => onVasarlas(album.id, ar)}
                  style={{ fontSize: '12px', padding: '8px 15px', margin: 0 }}
                >
                  {coins >= ar ? "Megveszem 🛒" : "Kevés Coin 🔒"}
                </button>
              ) : (
                <span style={{ color: '#00ff64', fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.5px' }}>BIRTOLKOLVA</span>
              )}
            </div>
          );
        })}

        {boltiKinalat.length === 0 && (
          <p style={{ textStyle: 'italic', opacity: 0.5, textAlign: 'center' }}>Jelenleg nincs új megvásárolható album.</p>
        )}
      </div>
    </div>
  );
}

export default HitJamStore;
