import React, { useState, useEffect } from 'react';
import albumData from '../albums.json';

function HitJamAdmin({ apiUrl }) {
  const [felhasznalok, setFelhasznalok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const updateApiUrl = apiUrl.replace('admin.php', 'update_user.php');

  const frissitAdatokat = async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Szerver hiba");
      const data = await response.json();
      if (data.success) setFelhasznalok(data.users);
    } catch (err) {
      setError("Nem sikerült frissíteni a listát.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    frissitAdatokat();
  }, [apiUrl]);

  const kezelModositas = async (targetUser, field, value) => {
    try {
      const response = await fetch(updateApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user: targetUser, field: field, value: value })
      });
      const data = await response.json();
      if (data.success) {
        frissitAdatokat(); // Háttér-frissítés, nincs többé alert vagy prompt!
      } else {
        alert(`⚠️ Hiba: ${data.error}`);
      }
    } catch (err) {
      console.error("Módosítási hiba:", err);
    }
  };

  if (loading) return <p style={{ color: '#ff8c00' }}>Admin adatok betöltése...</p>;

  return (
    <div style={{ animation: 'fade-in 0.3s ease', textAlign: 'left', fontSize: '13px' }}>
      <h3 style={{ color: '#fff', textAlign: 'center' }}>👑 HitJam Főparancsnokság</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {felhasznalok.map((u) => {
          const birtokoltAlbumok = u.ownedAlbums ? u.ownedAlbums.split(', ') : ['retro-party'];

          return (
            <div key={u.username} style={{ 
              background: 'rgba(0,0,0,0.5)', 
              padding: '15px', 
              borderRadius: '15px', 
              border: '1px solid rgba(255, 69, 0, 0.2)' 
            }}>
              
              {/* JÁTÉKOS INFÓ ÉS INTERAKTÍV KEZELŐK */}
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff8c00', marginBottom: '10px' }}>
                👤 {u.username}
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                
                {/* 1. PONT KEZELŐ (+- 50 PONT) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🏆 Pontszám: <strong style={{ color: '#00ff64' }}>{u.score}</strong></span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => kezelModositas(u.username, 'score', Math.max(0, u.score - 50))} style={{ background: 'rgba(255,51,51,0.2)', border: '1px solid #ff3333', color: '#ff3333', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>-50</button>
                    <button onClick={() => kezelModositas(u.username, 'score', u.score + 50)} style={{ background: 'rgba(0,255,100,0.2)', border: '1px solid #00ff64', color: '#00ff64', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+50</button>
                  </div>
                </div>

                {/* 2. COIN KEZELŐ (+- 1 COIN) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <span>コイン Coinok: <strong style={{ color: '#ffea00' }}>🪙 {u.coins}</strong></span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => kezelModositas(u.username, 'coins', Math.max(0, u.coins - 1))} style={{ background: 'rgba(255,51,51,0.2)', border: '1px solid #ff3333', color: '#ff3333', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>-1</button>
                    <button onClick={() => kezelModositas(u.username, 'coins', u.coins + 1)} style={{ background: 'rgba(255,234,0,0.2)', border: '1px solid #ffea00', color: '#ffea00', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+1</button>
                  </div>
                </div>

              </div>

              {/* ALBUM PIPÁLÓ LISTA */}
              <p style={{ margin: '5px 0 8px 0', fontSize: '11px', color: '#ff8c00', fontWeight: 'bold' }}>
                🎴 ALBUMOK JOGOSULTSÁGA:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                {albumData.map((album) => {
                  const vanIlyenAlbuma = birtokoltAlbumok.includes(album.id);
                  const isRetro = album.id === 'retro-party';

                  return (
                    <label key={album.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: isRetro ? 'not-allowed' : 'pointer',
                      opacity: isRetro ? 0.5 : 1
                    }}>
                      <span style={{ color: vanIlyenAlbuma ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                        {album.title}
                      </span>
                      <input 
                        type="checkbox"
                        checked={vanIlyenAlbuma}
                        disabled={isRetro}
                        style={{ accentColor: '#ff4500', transform: 'scale(1.2)' }}
                        onChange={(e) => {
                          const actionType = e.target.checked ? 'add_album' : 'remove_album';
                          kezelModositas(u.username, actionType, album.id);
                        }}
                      />
                    </label>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HitJamAdmin;
