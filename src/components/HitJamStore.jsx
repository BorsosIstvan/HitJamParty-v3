import React from 'react';

function HitJamStore({ albumok, coins, onVasarlas }) {
  return (
    <div style={{ animation: 'fade-in 0.3s ease', textAlign: 'left' }}>
      <h3 style={{ color: '#fff', textAlign: 'center' }}>HitJam Bolt 🪙</h3>
      <p style={{ fontSize: '13px', opacity: 0.7, textAlign: 'center', marginBottom: '20px' }}>
        Vásárolj új albumokat és prémium skineket!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Példaként kilistázunk egy lezárt albumot a JSON-ből */}
        <div style={{ 
          background: 'rgba(255, 69, 0, 0.05)', 
          padding: '15px', 
          borderRadius: '15px',
          border: '1px solid #ff4500',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: 0, color: '#fff' }}>🔥 90s Techno Classics</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>Ár: 🪙 5 HitJamCoin</p>
          </div>
          
          <button 
            className="hitjam-btn" 
            disabled={coins < 5}
            onClick={() => onVasarlas('techno-90s', 5)}
            style={{ fontSize: '12px', padding: '8px 15px', margin: 0 }}
          >
            {coins >= 5 ? "Megveszem 🛒" : "Kevés Coin 🔒"}
          </button>
        </div>

        {/* Extra dizájn gomb skin vásárlás */}
        <div style={{ 
          background: 'rgba(0, 255, 100, 0.05)', 
          padding: '15px', 
          borderRadius: '15px',
          border: '1px solid #00ff64',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: 0, color: '#fff' }}>🟢 Neon Zöld Gomb Skin</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>Ár: 🪙 2 HitJamCoin</p>
          </div>
          
          <button 
            className="hitjam-btn" 
            disabled={coins < 2}
            style={{ fontSize: '12px', padding: '8px 15px', margin: 0, borderColor: '#00ff64', color: '#00ff64' }}
          >
            Megveszem 🛒
          </button>
        </div>
      </div>
    </div>
  );
}

export default HitJamStore;
