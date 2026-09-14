import React, { useState, useEffect, useRef } from 'react'; // Behozzuk a useRef-et is
import AppContainer from './AppContainer';
import SongDisplay from './components/SongDisplay';
import PlayPauseButton from './PlayPauseButton';
import RandomizerButton from './RandomizerButton';
import QuizDisplay from './components/QuizDisplay';
import HitJamInventory from './components/HitJamInventory';
import HitJamStore from './components/HitJamStore';
import HitJamAdmin from './components/HitJamAdmin'; 
import { useAudioEngine } from './hooks/useAudioEngine';
import { useQuizEngine } from './hooks/useQuizEngine';
import albumData from './albums.json';
import GameStats from './components/GameStats';
import AuthForm from './components/AuthForm';
import LogoutButton from './components/LogoutButton';
import GameFooter from './components/GameFooter';

const osszesLetezoDal = albumData.flatMap(album => album.songs);

function App() {
  const PI_IP_CIM = "api.hitjamparty.com";

  // --- OKOS LOCALSTORAGE KEZDETI ÁLLAPOTOK ---

  // 1. Felhasználó beolvasása
  const [user, setUser] = useState(() => {
    return localStorage.getItem('hitjam_user') || null;
  });

  // 2. Pontszám beolvasása
  const [score, setScore] = useState(() => {
    const mentettPont = localStorage.getItem('hitjam_score');
    return mentettPont ? Number(mentettPont) : null;
  });

  // 3. Coinok beolvasása
  const [coins, setCoins] = useState(() => {
    const mentettCoin = localStorage.getItem('hitjam_coins');
    return mentettCoin ? Number(mentettCoin) : null;
  });

  // 4. Megvásárolt albumok listája
  const [albumsList, setAlbumsList] = useState(() => {
    const mentettAlbumok = localStorage.getItem('hitjam_albumsList');
    return mentettAlbumok ? JSON.parse(mentettAlbumok) : ['retro-party'];
  });

  const [nezet, setNezet] = useState('jatek'); 

  // 5. Aktív albumok listája
  const [aktivAlbumIds, setAktivAlbumIds] = useState(() => {
    const mentettAktivak = localStorage.getItem('hitjam_aktivAlbumIds');
    return mentettAktivak ? JSON.parse(mentettAktivak) : ['retro-party'];
  });

  // 6. Elmentett megkevert pakli beolvasása
  const [pakli, setPakli] = useState(() => {
    const mentettPakli = localStorage.getItem('hitjam_pakli');
    return mentettPakli ? JSON.parse(mentettPakli) : [];
  });

  // Csak akkor töltünk a háttérben, ha még egyáltalán nincs elmentett felhasználónk
  const [loadingGuest, setLoadingGuest] = useState(() => {
    return !localStorage.getItem('hitjam_user');
  });

  // Ez a React-szabványos jelző mutatja meg, hogy az oldal legelső betöltése fut-e éppen
  const isInitialMount = useRef(true);

  const jatekbanLevoDalok = albumData
    .filter(album => aktivAlbumIds.includes(album.id))
    .flatMap(album => album.songs);

  const [aktualisDal, setAktualisDal] = useState(osszesLetezoDal[Math.floor(Math.random() * osszesLetezoDal.length)]);

  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesLetezoDal);

  const handleSuccesLogin = (username, score, coins, ownedAlbums, activeAlbumIds) => {
    const tisztaOwned = Array.isArray(ownedAlbums) ? ownedAlbums : ownedAlbums.split(',');
    const tisztaActive = Array.isArray(activeAlbumIds) ? activeAlbumIds : activeAlbumIds.split(',');

    setUser(username);
    setScore(Number(score));
    setCoins(Number(coins));
    setAlbumsList(tisztaOwned);
    setAktivAlbumIds(tisztaActive);
    setLoadingGuest(false);
    
    // AZONNALI MENTÉS LOCALSTORAGE-BA
    localStorage.setItem('hitjam_user', username);
    localStorage.setItem('hitjam_score', score.toString());
    localStorage.setItem('hitjam_coins', coins.toString());
    localStorage.setItem('hitjam_albumsList', JSON.stringify(tisztaOwned));
    localStorage.setItem('hitjam_aktivAlbumIds', JSON.stringify(tisztaActive));
  };

  // --- AUTOMATIKUS VENDÉG BELÉPTETÉS INDULÁSKOR ---
  useEffect(() => {
    const mentettUser = localStorage.getItem('hitjam_user');
    if (mentettUser) {
      setLoadingGuest(false);
      return; 
    }

    async function autoGuestLogin() {
      try {
        const response = await fetch(`https://${PI_IP_CIM}/HitJamParty/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: "vendeg", password: "vendeg123", action: "login" })
        });
        const data = await response.json();
        
        if (data.success) {
          handleSuccesLogin(data.username, data.score, data.coins, data.ownedAlbums, data.activeAlbumIds);
        } else {
          setLoadingGuest(false); 
        }
      } catch (err) {
        console.error("Nem sikerült az automata vendég belépés:", err);
        setLoadingGuest(false);
      }
    }

    autoGuestLogin();
  }, []);

  // --- AUTOMATIKUS LOCALSTORAGE MENTÉSEK MŰKÖDÉS KÖZBEN ---

  // Mentés: Ha a pakli változik
  useEffect(() => {
    localStorage.setItem('hitjam_pakli', JSON.stringify(pakli));
  }, [pakli]);

  // Mentés: Ha a pontszám vagy coin változik
  useEffect(() => {
    if (score !== null) localStorage.setItem('hitjam_score', score.toString());
    if (coins !== null) localStorage.setItem('hitjam_coins', coins.toString());
  }, [score, coins]);

  // Mentés: Ha a birtokolt vagy aktív albumok listája változik
  useEffect(() => {
    localStorage.setItem('hitjam_albumsList', JSON.stringify(albumsList));
    localStorage.setItem('hitjam_aktivAlbumIds', JSON.stringify(aktivAlbumIds));
  }, [albumsList, aktivAlbumIds]);

  // Mentés: Ha változik a bejelentkezett felhasználó
  useEffect(() => {
    if (user) {
      localStorage.setItem('hitjam_user', user);
    } else {
      localStorage.removeItem('hitjam_user');
    }
  }, [user]);

  // ALBUM VÁLTOZÁS FIGYELŐ: Csak akkor ürítünk, ha valódi változtatás történt a Raktárban
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPakli([]);
    localStorage.removeItem('hitjam_pakli');
  }, [aktivAlbumIds]);

  const mentesASzerverre = async (aktualisPont, aktualisCoin) => {
    if (!user) return;
    try {
      await fetch(`https://${PI_IP_CIM}/HitJamParty/save_score.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, score: aktualisPont, coins: aktualisCoin })
      });
    } catch (err) { console.error("Szerver mentési hiba:", err); }
  };

  const handleLogout = () => { 
    setUser(null); 
    setScore(null);
    setCoins(null);
    setAlbumsList(['retro-party']);
    setAktivAlbumIds(['retro-party']);
    setPakli([]);
    setNezet('jatek'); 
    localStorage.clear(); 
  };



  const handleQuizAnswer = async (valasztottTipp, mod) => {
    const sikerult = ellenorizValasz(valasztottTipp);
    if (sikerult) {
      const pontErtek = mod === 'ev' ? 10 : 5;
      const ujPontszam = score + pontErtek;
      const regiSzazasok = Math.floor(score / 100);
      const ujSzazasok = Math.floor(ujPontszam / 100);
      let ujCoin = coins;
      if (ujSzazasok > regiSzazasok) ujCoin = coins + 1;

      setScore(ujPontszam);
      setCoins(ujCoin);
      await mentesASzerverre(ujPontszam, ujCoin);
    }
  };

  const handleToggleAlbum = async (albumId) => {
    let ujAktivIds = [];
    if (aktivAlbumIds.includes(albumId)) {
      if (aktivAlbumIds.length > 1) { 
        ujAktivIds = aktivAlbumIds.filter(id => id !== albumId);
      } else { return; }
    } else {
      ujAktivIds = [...aktivAlbumIds, albumId];
    }
    
    setAktivAlbumIds(ujAktivIds);

    try {
      await fetch(`https://${PI_IP_CIM}/HitJamParty/save_store.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, action: 'toggle', activeAlbumIds: ujAktivIds })
      });
    } catch (err) { console.error("Raktár mentési hiba:", err); }
  };

  const handleVasarlas = async (albumId, ar) => {
    if (coins >= ar) {
      const ujCoinok = coins - ar;
      try {
        const response = await fetch(`https://${PI_IP_CIM}/HitJamParty/save_store.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, action: 'buy', album_id: albumId, coins: ujCoinok })
        });
        const data = await response.json();
        
        if (data.success) {
          setCoins(ujCoinok);
          setAlbumsList([...albumsList, albumId]);
        } else {
          alert(`⚠️ Hiba a boltban: ${data.error}`);
        }
      } catch (err) { console.error("Vásárlási hiba:", err); }
    }
  };

  return (
    <AppContainer>
      <h2 style={{ margin: '0 0 10px 0' }}>HITJAM PARTY 🎧</h2>

      {/* AMÍG A HÁTTÉRBEN TÖLT A VENDÉG LOGIN */}
      {loadingGuest && !user ? (
        <p style={{ color: '#ff4500', fontWeight: 'bold' }}>Party előkészítése... 🕺</p>
      ) : (
        /* HA KÉSZ A LOGIN ELLENŐRZÉS */
        <>
          {!user ? (
            /* Ha a vendég login valamiért elbukna, csak akkor mutatjuk az űrlapot */
            <AuthForm onAuthSuccess={handleSuccesLogin}/>
          ) : (
            <>
              {/* Játékos státusz */}
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '3px 0' }}>player: <strong>{user}</strong> | score: <strong>{score}</strong></p>
                <p style={{ margin: '3px 0', fontSize: '14px', opacity: 0.8 }}>coins: 🪙 {coins}</p>
                
                {/* A Kilépés gomb mostantól tökéletes "Bejelentkezés" gombként is funkcionál a vendégnek! */}
                <LogoutButton onLogout={handleLogout} />
              </div>

              <nav className="hitjam-nav">
                <button className={`hitjam-nav-btn ${nezet === 'jatek' ? 'active' : ''}`} onClick={() => setNezet('jatek')}>🎮 Játék</button>
                <button className={`hitjam-nav-btn ${nezet === 'raktar' ? 'active' : ''}`} onClick={() => setNezet('raktar')}>🎒 Raktár</button>
                <button className={`hitjam-nav-btn ${nezet === 'bolt' ? 'active' : ''}`} onClick={() => setNezet('bolt')}>🪙 Bolt</button>
                
                {user === 'poci' && (
                  <button className={`hitjam-nav-btn ${nezet === 'admin' ? 'active' : ''}`} onClick={() => setNezet('admin')} style={{ color: '#00ff64' }}>
                    👑 Admin
                  </button>
                )}
              </nav>

              {nezet === 'jatek' && (
                <>
                  <GameStats albumokListaja={albumData.filter(a => aktivAlbumIds.includes(a.id))} pakli={pakli} />
                  <SongDisplay trackName={trackName} artistName={artistName} year={aktualisDal.year} valaszolt={valaszolt} />
                  <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
                  <QuizDisplay eveket={eveket} eloadokat={eloadokat} cimeket={cimeket} onValasz={handleQuizAnswer} valaszolt={valaszolt} helyesE={helyesE} />
                  <RandomizerButton dalokListaja={jatekbanLevoDalok} onDalValasztas={setAktualisDal} pakli={pakli} setPakli={setPakli} />
                </>
              )}

              {nezet === 'raktar' && (
                <HitJamInventory albumok={albumData} ownedAlbumsList={albumsList} aktivAlbumIds={aktivAlbumIds} onToggleAlbum={handleToggleAlbum} />
              )}

              {nezet === 'bolt' && (
                <HitJamStore albumok={albumData} ownedAlbumsList={albumsList} coins={coins} onVasarlas={handleVasarlas} />
              )}

              {nezet === 'admin' && user === 'poci' && (
                <HitJamAdmin apiUrl={`https://${PI_IP_CIM}/HitJamParty/admin.php`} />
              )}
            </>
          )}
        </>
      )}
      <GameFooter />
    </AppContainer>
  );
}

export default App;
