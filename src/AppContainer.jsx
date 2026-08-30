import React from 'react';

function AppContainer({ children }) {
  return (
    // Csak átadjuk a CSS osztálynevet. Reactban class helyett: className!
    <div id="hitjamApp" className="app-container">
      {children}
    </div>
  );
}

export default AppContainer;
