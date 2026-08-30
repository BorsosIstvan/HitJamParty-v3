import React from 'react'; // Már nem kell a useState importálás ide!

// A zárójelben fogadjuk a fentről érkező adatokat: isPlaying és onToggle
function PlayPauseButton({ isPlaying, onToggle }) {
  return (
    // Kattintáskor meghívjuk a fentről kapott onToggle függvényt
    <button className="hitjam-btn" onClick={onToggle}>
      
      {isPlaying ? (
        <>
          <span>⏸</span>
          <span>Pause</span>
        </>
      ) : (
        <>
          <span>▶</span>
          <span>Play</span>
        </>
      )}

    </button>
  );
}

export default PlayPauseButton;
