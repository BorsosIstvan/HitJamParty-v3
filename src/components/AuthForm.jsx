import { useState } from 'react';

function AuthForm({ onAuthSuccess }) {
  const PI_IP_CIM = "api.hitjamparty.com"; 
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Minden mezőt ki kell tölteni!");
      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`http://${PI_IP_CIM}/HitJamParty/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          action: isRegisterMode ? 'register' : 'login'
        })
      });

      if (!response.ok) {
        throw new Error("A szerver nem válaszol. Ellenőrizd a Pi kapcsolatot!");
      }

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        if (isRegisterMode) {
          setSuccessMessage("🎉 Sikeres regisztráció! Most már beléphetsz.");
          setIsRegisterMode(false);
          setPassword("");
        } else {
          onAuthSuccess(data.username, data.score, data.coins, data.ownedAlbums, data.activeAlbumIds);
        }
      } else {
        setError(data.error);
      }

    } catch (err) {
      console.error("Hálózati hiba:", err);
      setLoading(false);
      setError("Nem sikerült elérni a Raspberry Pi-t. Be van kapcsolva?");
    }
  };

  return (
    <div>
      {/* CÍMSOROK - Örökölt dizájnnal */}
      <h2 style={{ margin: '0 0 5px 0' }}>
        {isRegisterMode ? "Új fiók létrehozása 📝" : "Üdvözlünk a buliban! 👋"}
      </h2>
      <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px' }}>
        {isRegisterMode 
          ? "Regisztrálj, hogy gyűjthesd a HitJamCoin-okat!" 
          : "Lépj be a mentett lemezeid eléréséhez!"}
      </p>

      {/* HIBA ÜZENET */}
      {error && (
        <div className="hitjam-alert hitjam-alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* SIKER ÜZENET */}
      {successMessage && (
        <div className="hitjam-alert hitjam-alert-success">
          {successMessage}
        </div>
      )}

      {/* ŰRLAP */}
      <form onSubmit={handleSubmit} className="hitjam-form">
        <div className="hitjam-field">
          <label>Felhasználónév</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="Pl. poci"
            className="hitjam-input"
          />
        </div>

        <div className="hitjam-field">
          <label>Jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            className="hitjam-input"
          />
        </div>

        {/* Újrahasznosítottuk a már megírt dögös hitjam-btn osztályt */}
        <button type="submit" className="hitjam-btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? "Folyamatban..." : (isRegisterMode ? "Regisztráció indítása 🚀" : "Belépés a játékba 🔓")}
        </button>
      </form>

      {/* MÓDVÁLTÓ LENT */}
      <button
        onClick={() => {
          setIsRegisterMode(!isRegisterMode);
          setError("");
          setSuccessMessage("");
        }}
        disabled={loading}
        className="hitjam-link-btn"
      >
        {isRegisterMode ? "Már van fiókom? Lépj be itt!" : "Még nincs fiókod? Regisztrálj itt!"}
      </button>
    </div>
  );
}

export default AuthForm;
