import React, { useState } from 'react';
import AppContainer from './AppContainer';
import SongDisplay from './components/SongDisplay';
import PlayPauseButton from './PlayPauseButton';
import RandomizerButton from './RandomizerButton';
import QuizDisplay from './components/QuizDisplay';
import HitJamInventory from './components/HitJamInventory'; // Import
import HitJamStore from './components/HitJamStore';         // Import
import { useAudioEngine } from './hooks/useAudioEngine';
import { useQuizEngine } from './hooks/useQuizEngine';
import albumData from './albums.json';
import GameStats from './components/GameStats';
import AuthForm from './components/AuthForm';
import LogoutButton from './components/LogoutButton';
import GameFooter from './components/GameFooter';

const osszesDal = albumData.flatMap(album => album.songs);

function App() {
  const PI_IP_CIM = "192.168.132.218";

  const [user, setUser] = useState(null);
  const [score, setScore] = useState(null);
  const [coins, setCoins] = useState(null);
  const [albums, setAlbums] = useState(null);

  // ÚJ ÁLLAPOTOK A STORE-HOZ ÉS RAKTÁRHOZ:
  const [nezet, setNezet] = useState('jatek'); // 'jatek', 'raktar', 'bolt'
  const [aktivAlbumIds, setAktivAlbumIds] = useState(['retro-party']); // Alapértelmezett aktív album

  const [aktualisDal, setAktualisDal] = useState(osszesDal[Math.floor(Math.random() * osszesDal.length)]);
  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesDal);

  const mentesASzerverre = async (aktualisPont, aktualisCoin) => {
    if (!user) return;
    try {
      await fetch(`http://${PI_IP_CIM}/HitJamParty/save_score.php`, {
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
    if (activeAlbumIds) setAktivAlbumIds(activeAlbumIds);
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

  // Funkció az albumok ki-be kapcsolásához a Raktárban
  const handleToggleAlbum = (albumId) => {
    if (aktivAlbumIds.includes(albumId)) {
      if (aktivAlbumIds.length > 1) { // Legalább egy album maradjon aktív
        setAktivAlbumIds(aktivAlbumIds.filter(id => id !== albumId));
      }
    } else {
      setAktivAlbumIds([...aktivAlbumIds, albumId]);
    }
  };

  // Funkció a vásárláshoz a Boltban
  const handleVasarlas = async (targyId, ar) => {
    if (coins >= ar) {
      const ujCoin = coins - ar;
      setCoins(ujCoin);
      // Itt a jövőben hozzáadhatjuk az új albumot a birtokoltakhoz
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
          {/* Felső Játékos Sáv */}
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '3px 0' }}>player: <strong>{user}</strong> | score: <strong>{score}</strong></p>
            <p style={{ margin: '3px 0', fontSize: '14px', opacity: 0.8 }}>coins: 🪙 {coins}</p>
            <LogoutButton onLogout={handleLogout}/>
          </div>

          {/* ALSÓ/KÖZÉPSŐ NAVIGÁCIÓS SÁV - A szép váltáshoz */}
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

          {/* RENDERELES A VÁLASZTOTT NÉZET ALAPJÁN */}
          {nezet === 'jatek' && (
            <>
              <GameStats albumokListaja={albumData} />
              <SongDisplay trackName={trackName} artistName={artistName} year={aktualisDal.year} valaszolt={valaszolt} />
              <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
              <QuizDisplay eveket={eveket} eloadokat={eloadokat} cimeket={cimeket} onValasz={handleQuizAnswer} valaszolt={valaszolt} helyesE={helyesE} />
              <RandomizerButton dalokListaja={osszesDal} onDalValasztas={setAktualisDal} />
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
