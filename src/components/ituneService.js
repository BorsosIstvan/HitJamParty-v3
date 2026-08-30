/**
 * Profi, aszinkron JSONP wrapper az iTunes API-hoz.
 * Megkerüli a CORS hibákat külső proxy szerver nélkül, 
 * tiszta React Promise-ba csomagolva az eredeti callback logikádat.
 */
export function keresniTunes(artist, title) {
  return new Promise((resolve) => {
    try {
      const schoneArtiest = artist.replace('&', ' ');
      const zoekterm = encodeURIComponent(`${schoneArtiest} ${title}`);
      
      // 1. Generálunk egy teljesen egyedi callback nevet a globális window objektumba
      const callbackName = `itunesCallback_${Math.floor(Math.random() * 100000)}`;
      
      // 2. Létrehozzuk a callback függvényt, amit az iTunes meg fog hívni
      window[callbackName] = function(data) {
        // Takarítás a háttérben (mint a te kódodban)
        const scriptElement = document.getElementById(callbackName);
        if (scriptElement) scriptElement.remove();
        delete window[callbackName];

        // Ellenőrzés és a Promise sikeres lezárása (resolve)
        if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
          const elsoTalalat = data.results[0];
          resolve({
            success: true,
            previewUrl: elsoTalalat.previewUrl,
            trackName: elsoTalalat.trackName,
            artistName: elsoTalalat.artistName
          });
        } else {
          resolve({ success: false, error: "Nem található audio ehhez a számhoz." });
        }
      };

      // 3. Dinamikus script létrehozása és beszúrása az iTunes URL-lel
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = `https://itunes.apple.com/search?term=${zoekterm}&limit=1&entity=song&callback=${callbackName}`;
      
      // Hibakezelés, ha az iTunes szervere teljesen elérhetetlen lenne
      script.onerror = () => {
        if (window[callbackName]) delete window[callbackName];
        script.remove();
        resolve({ success: false, error: "Az iTunes szervere nem érhető el." });
      };

      document.body.appendChild(script);

    } catch (error) {
      console.error("iTunes JSONP hiba:", error);
      resolve({ success: false, error: error.message });
    }
  });
}