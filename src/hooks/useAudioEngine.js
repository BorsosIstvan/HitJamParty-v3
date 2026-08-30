import { useState, useEffect, useRef } from 'react';
import { keresniTunes } from '../components/ituneService';

export function useAudioEngine(artist = "AC/DC", title = "Back In Black") {
  const [isPlaying, setIsPlaying] = useState(false);
  const [zeneAdat, setZeneAdat] = useState({ trackName: "Betöltés...", artistName: "" });
  const [betoltve, setBetoltve] = useState(false);
  
  const audioRef = useRef(new Audio());

  useEffect(() => {
    async function dalBetoltese() {
      setBetoltve(false);
      setIsPlaying(false);
      audioRef.current.pause();
      setZeneAdat({ trackName: "Betöltés...", artistName: "" });

      const eredmeny = await keresniTunes(artist, title);
      
      if (eredmeny.success) {
        audioRef.current.src = eredmeny.previewUrl;
        setZeneAdat({
          trackName: eredmeny.trackName,
          artistName: eredmeny.artistName
        });
        setBetoltve(true);
      } else {
        setZeneAdat({ trackName: "Nincs találat", artistName: eredmeny.error });
      }
    }
    
    dalBetoltese();
  }, [artist, title]);

  const togglePlay = () => {
    if (!betoltve) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // A motor visszaadja a nyers adatokat és a vezérlő gombot a külvilágnak
  return {
    trackName: zeneAdat.trackName,
    artistName: zeneAdat.artistName,
    isPlaying,
    togglePlay,
    betoltve
  };
}
