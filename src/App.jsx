import React, { useState, useEffect } from 'react'; // Behozzuk a useEffect-et az automatizmushoz
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

  // --- INTELLIGENS LOCALSTORAGE ÁLLAPOTOK ---

  // Megnézzük, van-e elmentett felhasználó, ha nincs, alapértelmezetten null
  const [user, setUser] = useState(() => {
    return localStorage.getItem('hitjam_user') || null;
  });

  const [score, setScore] = useState(null);
  const [coins, setCoins] = useState(null);
  const [albumsList, setAlbumsList] = useState(['retro-party']);

  const [nezet, setNezet] = useState('jatek'); 
  const [aktivAlbumIds, setAktivAlbumIds] = useState(['retro-party']);

  // Megnézzük, van-e elmentett félbehagyott pakli a helyi tárolóban
  const [pakli, setPakli] = useState(() => {
    const mentettPakli = localStorage.getItem('hitjam_pakli');
    return mentettPakli ? JSON.parse(mentettPakli) : [];
  });

  // Extra állapot, hogy mutassuk, ha a háttérben épp az automatikus vendég login fut
  // HA már van elmentett user, akkor nem kell mutatni a loadingot az automata login alatt
  const [loadingGuest, setLoadingGuest] = useState(() => {
    const mentettUser = localStorage.getItem('hitjam_user');
    return !mentettUser; 
  });

  const jatekbanLevoDalok = albumData
    .filter(album => aktivAlbumIds.includes(album.id))
    .flatMap(album => album.songs);

  const [aktualisDal, setAktualisDal] = useState(osszesLetezoDal[Math.floor(Math.random() * osszesLetezoDal.length)]);

  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesLetezoDal);

  const handleSuccesLogin = (username, score, coins, ownedAlbums, activeAlbumIds) => {
    setUser(username);
    setScore(Number(score));
    setCoins(Number(coins));
    if (ownedAlbums) setAlbumsList(Array.isArray(ownedAlbums) ? ownedAlbums : ownedAlbums.split(','));
    if (activeAlbumIds) setAktivAlbumIds(Array.isArray(activeAlbumIds) ? activeAlbumIds : activeAlbumIds.split(','));
    setLoadingGuest(false);
    // ÚJ: Elmentjük a sikeresen bejelentkezett usert helyileg is
    localStorage.setItem('hitjam_user', username);
  };

  // --- AUTOMATIKUS VENDÉG BELÉPTETÉS INDULÁSKOR ---
  useEffect(() => {
    async function autoGuestLogin() {
      try {
        // Bekopogunk a Pi-re a fix vendég adatokkal
        const response = await fetch(`https://${PI_IP_CIM}/HitJamParty/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: "vendeg", password: "vendeg123", action: "login" })
        });
        const data = await response.json();
        
        if (data.success) {
          handleSuccesLogin(data.username, data.score, data.coins, data.ownedAlbums, data.activeAlbumIds);
        } else {
          setLoadingGuest(false); // Ha hibás a vendég fiók a Pi-n, megállunk és mutatjuk a logint
        }
      } catch (err) {
        console.error("Nem sikerült az automata vendég belépés:", err);
        setLoadingGuest(false);
      }
    }

    autoGuestLogin();
  }, []);

  // 1. AUTOMATIKUS MENTÉS: Ha változik a pakli tartalma, azonnal elmentjük
  useEffect(() => {
    localStorage.setItem('hitjam_pakli', JSON.stringify(pakli));
  }, [pakli]);

  // 2. AUTOMATIKUS MENTÉS: Ha változik a bejelentkezett felhasználó, megjegyezzük
  useEffect(() => {
    if (user) {
      localStorage.setItem('hitjam_user', user);
    } else {
      localStorage.removeItem('hitjam_user');
    }
  }, [user]);

  // 3. ALBUM VÁLTOZÁS: Ha a Raktárban megváltoztatják az aktív albumokat, 
  // ürítjük a paklit a helyi tárolóból is, hogy tiszta lappal induljon a sorsolás
  useEffect(() => {
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
    setNezet('jatek'); 
    
    // ÚJ: Kijelentkezéskor teljesen kitakarítjuk a localStorage-ot,
    // hogy a következő bejelentkező ne lássa az előző játékos adatait és pakliját
    localStorage.removeItem('hitjam_user');
    localStorage.removeItem('hitjam_pakli');
    setPakli([]); 
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
