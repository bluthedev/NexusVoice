export const playText = (text: string, onEnd: () => void, onStart: () => void) => {
  if (!window.speechSynthesis) {
    alert("Your browser does not support Speech Synthesis.");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || 
                         voices.find(v => v.lang.includes('en-GB')) || 
                         voices[0];
                         
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  utterance.rate = 0.9; // Slightly slower for better comprehension
  utterance.pitch = 1;
  
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.error("Speech synthesis error", e);
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopAudio = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const downloadAudio = async (text: string, format: 'mp3' | 'wav' = 'wav') => {
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