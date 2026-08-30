import React from 'react';

function LogoutButton({ onLogout }) {
  return (
    <button className="hitjam-btn-logout" onClick={onLogout}>
      <span>🚪</span>
      <span>Kilépés</span>
    </button>
  );
}

export default LogoutButton;
