let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

/** Stop and clean up any currently active audio + blob URL. */
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
 * Calls the backend /tts endpoint (Google Cloud Neural2 TTS) and returns
 * the audio as a Blob. The backend handles authentication so no API key
 * is needed on the frontend.
 */
const fetchAudioBlob = async (text: string): Promise<Blob> => {
  const safeText = text.slice(0, 5000);

  const response = await fetch('/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: safeText }),
  });

  if (!response.ok) {
    // Try to extract a human-readable error from the backend JSON body
    let errorMsg = `TTS request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error ?? errorMsg;
    } catch { /* ignore parse failures */ }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error('The TTS service returned empty audio. Please try again.');
  }

  return blob;
};

/**
 * Synthesizes `text` via Google Cloud TTS on the backend, then plays it
 * using an HTML5 Audio element backed by a local blob URL.
 *
 * Returns a Promise that resolves when playback ends, or rejects on error.
 * The caller (App.tsx) awaits this to drive loading/playing/error states.
 */
export const playText = async (
  text: string,
  onEnd: () => void,
  onStart: () => void,
): Promise<void> => {
  cleanupAudio();

  // Fetch the full audio blob from the backend before touching the Audio API.
  // This validates the response and avoids the "plays for a second then stops"
  // problem caused by streaming cross-origin URLs into HTMLAudioElement.
  const blob = await fetchAudioBlob(text);

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
      const msg = 'Audio playback failed after loading.';
      console.error(msg);
      cleanupAudio();
      onEnd();
      reject(new Error(msg));
    });

    // play() is called here inside the async chain started by the user's click.
    // Modern browsers preserve user-activation across microtasks, so autoplay
    // policy is satisfied even though we awaited the fetch above.
    audio.play().catch((err: Error) => {
      cleanupAudio();
      onEnd();
      reject(err);
    });
  });
};

/** Immediately stop any active playback and release resources. */
export const stopAudio = () => {
  cleanupAudio();
};

/**
 * Synthesizes `text` via the backend and triggers a browser download.
 * Supports 'mp3', 'wav', and 'mp4' file extensions (all backed by MP3 audio).
 */
export const downloadAudio = async (
  text: string,
  format: 'mp3' | 'wav' | 'mp4' = 'mp3',
): Promise<void> => {
  if (!text.trim()) throw new Error('No text to convert.');

  const blob = await fetchAudioBlob(text);
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = downloadUrl;
  a.download = `nexus_audio_export.${format}`;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
};