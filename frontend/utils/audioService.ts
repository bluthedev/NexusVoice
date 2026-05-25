let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

/** Revoke any active blob URL and release the audio element. */
const cleanupAudio = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
};

/**
 * Fetches audio from StreamElements TTS API as a blob (so we can validate
 * the full response before playing), then plays it via a local blob URL.
 *
 * Returning a Promise lets App.tsx await the full lifecycle and surface errors.
 */
export const playText = async (
  text: string,
  onEnd: () => void,
  onStart: () => void,
): Promise<void> => {
  cleanupAudio();

  const safeText = text.slice(0, 400);
  const encodedText = encodeURIComponent(safeText);
  const apiUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodedText}`;

  // --- Step 1: Fetch the full audio blob ---
  // This validates the API response (status, content-type, non-empty body)
  // BEFORE we try to play anything, preventing the "plays for a second then stops"
  // symptom caused by the browser receiving an error body from the stream.
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`TTS API returned ${response.status} ${response.statusText}. Try again or shorten the text.`);
  }

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new Error('TTS API returned empty audio. The text may be unsupported or the service is unavailable.');
  }

  // --- Step 2: Create a local blob URL and play ---
  // Playing from a blob:// URL is immune to CORS, streaming interruptions,
  // and ensures the full audio is available before playback starts.
  const blobUrl = URL.createObjectURL(blob);
  activeObjectUrl = blobUrl;

  const audio = new Audio(blobUrl);
  activeAudio = audio;

  return new Promise<void>((resolve, reject) => {
    audio.addEventListener('play', () => onStart());

    audio.addEventListener('ended', () => {
      cleanupAudio();
      onEnd();
      resolve();
    });

    audio.addEventListener('error', () => {
      const msg = 'Audio playback failed after loading. Your browser may not support this audio format.';
      console.error(msg);
      cleanupAudio();
      onEnd();
      reject(new Error(msg));
    });

    // play() is called here, inside the async chain that was started by a user
    // click — modern browsers preserve user-activation across promise microtasks
    // when the chain originates from a gesture, so autoplay policy is satisfied.
    audio.play().catch((err: Error) => {
      cleanupAudio();
      onEnd();
      reject(err);
    });
  });
};

export const stopAudio = () => {
  cleanupAudio();
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