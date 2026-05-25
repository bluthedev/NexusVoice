let activeAudio: HTMLAudioElement | null = null;

export const playText = (text: string, onEnd: () => void, onStart: () => void): void => {
  // Stop any currently playing audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }

  const safeText = text.slice(0, 400);
  const encodedText = encodeURIComponent(safeText);
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodedText}`;

  const audio = new Audio(url);
  activeAudio = audio;

  audio.addEventListener('play', () => {
    onStart();
  });

  audio.addEventListener('ended', () => {
    onEnd();
    if (activeAudio === audio) activeAudio = null;
  });

  audio.addEventListener('error', () => {
    console.error('Audio playback error: failed to load or play audio from StreamElements API.');
    onEnd();
    if (activeAudio === audio) activeAudio = null;
  });

  // CRITICAL FIX: Call play() DIRECTLY here — inside the synchronous user gesture
  // context (the button click). Waiting for 'canplaythrough' breaks autoplay policy
  // because that event fires asynchronously, after the browser's gesture context expires,
  // causing NotAllowedError in Chrome/Firefox/Safari.
  audio.play().catch((err: Error) => {
    console.error('Audio play() rejected:', err.message);
    onEnd();
    if (activeAudio === audio) activeAudio = null;
  });
};

export const stopAudio = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = ''; // Release the media resource
    activeAudio = null;
  }
};

export const downloadAudio = async (text: string, format: 'mp3' | 'wav' | 'mp4' = 'wav') => {
  if (!text.trim()) throw new Error("No text to download");

  // Limit text length to avoid URI Too Long errors on public APIs
  const safeText = text.slice(0, 400); 
  const encodedText = encodeURIComponent(safeText);
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodedText}`;

  let retries = 3;
  let delay = 1000;
  let response;

  while (retries > 0) {
    try {
      response = await fetch(url);
      if (response.ok) break;
      
      // Don't retry on client errors (except 429 Too Many Requests)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`Client error: ${response.status}`);
      }
    } catch (error) {
      if (retries === 1) throw error;
    }
    
    retries--;
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch audio after retries. Status: ${response?.status}`);
  }

  try {
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    // Save as requested format (though underlying might be mp3, players handle it)
    a.download = `nexus_audio_export.${format}`; 
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to generate audio file.');
  }
};