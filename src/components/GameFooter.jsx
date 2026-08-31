import React from 'react';

function GameFooter() {
  return (
    <footer className="hitjam-footer">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 5px' }}>
        
        {/* 1. Sor: Szerzői jog és technológiák */}
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          © 2026 HitJam Party • Powered by Raspberry Pi, React & GitHub
        </p>
        
        {/* 2. Sor: Integrációk */}
        <p style={{ margin: 0, fontSize: '10px', opacity: 0.8, letterSpacing: '0.5px' }}>
          Audio Streams & Metadata via iTunes API • Built with JBL Sound System Compatibility
        </p>
        
        {/* 3. Sor: PWA és Elérhetőség link formájában */}
        <p style={{ margin: '4px 0 0 0', fontSize: '10px' }}>
          Test PWA Application • Available at:{' '}
          <a>
            hitjamparty.com
          </a>
        </p>

      </div>
    </footer>
  );
}

export default GameFooter;

