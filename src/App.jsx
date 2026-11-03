import React, { useState, useEffect, useRef } from 'react';
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
import GameFooter from './components/GameFooter';

const osszesLetezoDal = albumData.flatMap(album => album.songs);

function App() {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('hitjam_user') || 'Vendég';
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user);

  const [score, setScore] = useState(() => {
    const mentettPont = localStorage.getItem('hitjam_score');
    return mentettPont ? Number(mentettPont) : 0;
  });

  const [coins, setCoins] = useState(() => {
    const mentettCoin = localStorage.getItem('hitjam_coins');
    return mentettCoin ? Number(mentettCoin) : 0;
  });

  const [albumsList, setAlbumsList] = useState(() => {
    const mentettAlbumok = localStorage.getItem('hitjam_albumsList');
    return mentettAlbumok ? JSON.parse(mentettAlbumok) : ['retro-party'];
  });

  const [nezet, setNezet] = useState('jatek'); 

  const [aktivAlbumIds, setAktivAlbumIds] = useState(() => {
    const mentettAktivak = localStorage.getItem('hitjam_aktivAlbumIds');
    return mentettAktivak ? JSON.parse(mentettAktivak) : ['retro-party'];
  });

  const [pakli, setPakli] = useState(() => {
    const mentettPakli = localStorage.getItem('hitjam_pakli');
    return mentettPakli ? JSON.parse(mentettPakli) : [];
  });

  const isInitialMount = useRef(true);

  const jatekbanLevoDalok = albumData
    .filter(album => aktivAlbumIds.includes(album.id))
    .flatMap(album => album.songs);

  const [aktualisDal, setAktualisDal] = useState(osszesLetezoDal[Math.floor(Math.random() * osszesLetezoDal.length)]);

  const { trackName, artistName, isPlaying, togglePlay } = useAudioEngine(aktualisDal.artist, aktualisDal.title);
  const { eveket, eloadokat, cimeket, valaszolt, helyesE, ellenorizValasz } = useQuizEngine(aktualisDal, osszesLetezoDal);

  useEffect(() => {
    localStorage.setItem('hitjam_pakli', JSON.stringify(pakli));
  }, [pakli]);

  useEffect(() => {
    localStorage.setItem('hitjam_score', score.toString());
    localStorage.setItem('hitjam_coins', coins.toString());
  }, [score, coins]);

  useEffect(() => {
    localStorage.setItem('hitjam_albumsList', JSON.stringify(albumsList));
    localStorage.setItem('hitjam_aktivAlbumIds', JSON.stringify(aktivAlbumIds));
  }, [albumsList, aktivAlbumIds]);

  useEffect(() => {
    localStorage.setItem('hitjam_user', user);
  }, [user]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPakli([]);
    localStorage.removeItem('hitjam_pakli');
  }, [aktivAlbumIds]);

  const handleQuizAnswer = (valasztottTipp, mod) => {
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
    }
  };

  const handleToggleAlbum = (albumId) => {
    let ujAktivIds = [];
    if (aktivAlbumIds.includes(albumId)) {
      if (aktivAlbumIds.length > 1) { 
        ujAktivIds = aktivAlbumIds.filter(id => id !== albumId);
      } else { return; }
    } else {
      ujAktivIds = [...aktivAlbumIds, albumId];
    }
    setAktivAlbumIds(ujAktivIds);
  };

  const handleVasarlas = (albumId, ar) => {
    if (coins >= ar) {
      setCoins(coins - ar);
      setAlbumsList([...albumsList, albumId]);
    } else {
      alert("⚠️ Nincs elég coinod a vásárláshoz!");
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUser(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <AppContainer>
      <h2 style={{ margin: '0 0 10px 0' }}>HITJAM PARTY 🎧</h2>

      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0' }}>
          <span>player: </span>
          {isEditingName ? (
            <>
              <input 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
                style={{ background: '#222', color: '#fff', border: '1px solid #55px', borderRadius: '4px', padding: '2px 5px', width: '120px' }}
              />
              <button onClick={handleSaveName} style={{ background: '#00ff64', color: '#000', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>Mentés</button>
            </>
          ) : (
            <>
              <strong>{user}</strong>
              <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </>
          )}
          <span style={{ marginLeft: 'auto' }}>score: <strong>{score}</strong></span>
        </div>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}>coins: 🪙 {coins}</p>
      </div>

      <nav className="hitjam-nav">
        <button className={`hitjam-nav-btn ${nezet === 'jatek' ? 'active' : ''}`} onClick={() => setNezet('jatek')}>🎮 Játék</button>
        <button className={`hitjam-nav-btn ${nezet === 'raktar' ? 'active' : ''}`} onClick={() => setNezet('raktar')}>🎒 Raktár</button>
        <button className={`hitjam-nav-btn ${nezet === 'bolt' ? 'active' : ''}`} onClick={() => setNezet('bolt')}>🪙 Bolt</button>
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

      <GameFooter />
    </AppContainer>
  );
}

export default App;
