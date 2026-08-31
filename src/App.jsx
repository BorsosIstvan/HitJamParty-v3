import React, { useState } from 'react';
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

  const [user, setUser] = useState(null);
  const [score, setScore] = useState(null);
  const [coins, setCoins] = useState(null);
  const [albumsList, setAlbumsList] = useState(['retro-party']); // Tömbként tároljuk a birtokoltakat

  const [nezet, setNezet] = useState('jatek'); 
  const [aktivAlbumIds, setAktivAlbumIds] = useState(['retro-party']);

  // Szűrés a bepipált albumok alapján
  const jatekbanLevoDalok = albumData
    .filter(album => aktivAlbumIds.includes(album.id))
    .flatMap(album => album.songs);

  const [aktualisDal, setAktualisDal] = useState(osszesLetezoDal[Math.floor(Math.random() * osszesLetezoDal.length)]);
  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesLetezoDal);

  // 1. MEGLEVŐ LOGIKÁD: save_score.php hívása játék közben
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

  const handleSuccesLogin = (username, score, coins, ownedAlbums, activeAlbumIds) => {
    setUser(username);
    setScore(Number(score));
    setCoins(Number(coins));
    
    // Ha a Pi-től tömbként vagy vesszős stringként jön, itt kezeljük:
    if (ownedAlbums) setAlbumsList(Array.isArray(ownedAlbums) ? ownedAlbums : ownedAlbums.split(','));
    if (activeAlbumIds) setAktivAlbumIds(Array.isArray(activeAlbumIds) ? activeAlbumIds : activeAlbumIds.split(','));
  };

  const handleLogout = () => { setUser(null); setNezet('jatek'); };

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

  // 2. MEGLEVŐ LOGIKÁD: save_store.php 'toggle' ágának hívása
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

  // 3. MEGLEVŐ LOGIKÁD: save_store.php 'buy' ágának hívása
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
          setAlbumsList([...albumsList, albumId]); // Hozzáadjuk a helyi listához a megvett albumot
          //alert("🎉 Vásárlás sikeres! Az album bekerült a Raktáradba.");
        } else {
          alert(`⚠️ Hiba: ${data.error}`);
        }
      } catch (err) { console.error("Vásárlási hiba:", err); }
    }
  };

  return (
    <AppContainer>
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
              <GameStats albumokListaja={albumData.filter(a => aktivAlbumIds.includes(a.id))} />
              <SongDisplay trackName={trackName} artistName={artistName} year={aktualisDal.year} valaszolt={valaszolt} />
              <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
              <QuizDisplay eveket={eveket} eloadokat={eloadokat} cimeket={cimeket} onValasz={handleQuizAnswer} valaszolt={valaszolt} helyesE={helyesE} />
              <RandomizerButton dalokListaja={jatekbanLevoDalok} onDalValasztas={setAktualisDal} />
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
      <GameFooter />
    </AppContainer>
  );
}

export default App;
