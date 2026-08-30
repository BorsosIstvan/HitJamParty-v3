import React, { useState } from 'react';
import AppContainer from './AppContainer';
import SongDisplay from './components/SongDisplay';
import PlayPauseButton from './PlayPauseButton';
import RandomizerButton from './RandomizerButton';
import QuizDisplay from './components/QuizDisplay';
import HitJamInventory from './components/HitJamInventory';
import HitJamStore from './components/HitJamStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useQuizEngine } from './hooks/useQuizEngine';
import albumData from './albums.json';
import GameStats from './components/GameStats';
import AuthForm from './components/AuthForm';
import LogoutButton from './components/LogoutButton';
import GameFooter from './components/GameFooter';

// A teljes nyers adatbázis megmarad kívül a végtelen ciklusok elkerülése miatt
const osszesLetezoDal = albumData.flatMap(album => album.songs);

function App() {
  const PI_IP_CIM = "api.hitjamparty.com";

  const [user, setUser] = useState(null);
  const [score, setScore] = useState(null);
  const [coins, setCoins] = useState(null);
  const [albums, setAlbums] = useState(null);

  const [nezet, setNezet] = useState('jatek'); 
  
  // A bepipált albumok ID-it tároló lista (Alapértelmezetten a 'retro-party' aktív)
  const [aktivAlbumIds, setAktivAlbumIds] = useState(['retro-party']);

  // 1. LÉPÉS: DINAMIKUS DAL-SZŰRÉS A RAKTÁR ALAPJÁN
  // Csak azokat az albumokat vesszük figyelembe, amiknek az ID-ja szerepel az aktivAlbumIds tömbben!
  const jatekbanLevoDalok = albumData
    .filter(album => aktivAlbumIds.includes(album.id))
    .flatMap(album => album.songs);

  // Zseniális induló sorsolás a te egyszerűsített módszereddel (biztonsági mentéssel, ha a szűrt lista még üres lenne)
  const [aktualisDal, setAktualisDal] = useState(() => {
    const kezdoLista = jatekbanLevoDalok.length > 0 ? jatekbanLevoDalok : osszesLetezoDal;
    return kezdoLista[Math.floor(Math.random() * kezdoLista.length)];
  });

  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  
  // A kvíz motor is a globális összes létező dalt kapja meg a hamis opciók generálásához, hogy változatosabb legyen!
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesLetezoDal);

  const mentesASzerverre = async (aktualisPont, aktualisCoin) => {
    if (!user) return;
    try {
      await fetch(`https://${PI_IP_CIM}/HitJamParty/save_score.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, score: aktualisPont, coins: aktualisCoin })
      });
    } catch (err) {
      console.error("Szerver mentési hiba:", err);
    }
  };

  const handleSuccesLogin = (username, score, coins, ownedAlbums, activeAlbumIds) => {
    setUser(username);
    setScore(Number(score));
    setCoins(Number(coins));
    setAlbums(ownedAlbums);
    // Ha a Pi küldött korábbi mentett aktív albumokat, betöltjük, különben marad az alapértelmezett
    if (activeAlbumIds && activeAlbumIds.length > 0) setAktivAlbumIds(activeAlbumIds);
  };

  const handleLogout = () => { setUser(null); };

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

  // 2. LÉPÉS: A Raktár pipáinak kezelése
  const handleToggleAlbum = (albumId) => {
    if (aktivAlbumIds.includes(albumId)) {
      // Biztosítjuk, hogy a játékos ne tudja az ÖSSZES albumot kikapcsolni (legalább 1 kell a játékhoz)
      if (aktivAlbumIds.length > 1) { 
        setAktivAlbumIds(aktivAlbumIds.filter(id => id !== albumId));
      }
    } else {
      // Ha nem volt aktív, hozzáadjuk a listához
      setAktivAlbumIds([...aktivAlbumIds, albumId]);
    }
  };

  const handleVasarlas = async (targyId, ar) => {
    if (coins >= ar) {
      const ujCoin = coins - ar;
      setCoins(ujCoin);
      await mentesASzerverre(score, ujCoin);
      alert(`🎉 Sikeresen megvásároltad! Elköltöttél ${ar} érmét.`);
    }
  };

  return (
    <AppContainer>
      <h2 style={{ margin: '0 0 10px 0' }}>HITJAM PARTY 🎧</h2>

      {!user ? (
        <AuthForm onAuthSuccess={handleSuccesLogin}/>
      ) : (
        <>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '3px 0' }}>player: <strong>{user}</strong> | score: <strong>{score}</strong></p>
            <p style={{ margin: '3px 0', fontSize: '14px', opacity: 0.8 }}>coins: 🪙 {coins}</p>
            <LogoutButton onLogout={handleLogout}/>
          </div>

          <nav className="hitjam-nav">
            <button className={`hitjam-nav-btn ${nezet === 'jatek' ? 'active' : ''}`} onClick={() => setNezet('jatek')}>
              🎮 Játék
            </button>
            <button className={`hitjam-nav-btn ${nezet === 'raktar' ? 'active' : ''}`} onClick={() => setNezet('raktar')}>
              🎒 Raktár
            </button>
            <button className={`hitjam-nav-btn ${nezet === 'bolt' ? 'active' : ''}`} onClick={() => setNezet('bolt')}>
              🪙 Bolt
            </button>
          </nav>

          {nezet === 'jatek' && (
            <>
              {/* JAVÍTÁS: A statisztikának és a sorsoló gombnak is az AKTUÁLISAN szűrt listát adjuk át! */}
              <GameStats albumokListaja={albumData.filter(a => aktivAlbumIds.includes(a.id))} />
              <SongDisplay trackName={trackName} artistName={artistName} year={aktualisDal.year} valaszolt={valaszolt} />
              <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
              <QuizDisplay eveket={eveket} eloadokat={eloadokat} cimeket={cimeket} onValasz={handleQuizAnswer} valaszolt={valaszolt} helyesE={helyesE} />
              
              {/* A Sorsoló gomb mostantól szigorúan csak a bepipált albumok listáját kapja meg */}
              <RandomizerButton dalokListaja={jatekbanLevoDalok} onDalValasztas={setAktualisDal} />
            </>
          )}

          {nezet === 'raktar' && (
            <HitJamInventory albumok={albumData} aktivAlbumIds={aktivAlbumIds} onToggleAlbum={handleToggleAlbum} />
          )}

          {nezet === 'bolt' && (
            <HitJamStore albumok={albumData} coins={coins} onVasarlas={handleVasarlas} />
          )}
        </>
      )}

      <GameFooter />
    </AppContainer>
  );
}

export default App;
