import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Play, Square, Download, Settings, Volume2, Loader2, FileAudio } from 'lucide-react';
import { extractTextFromFile } from './utils/fileService';
import { playText, stopAudio, downloadAudio } from './utils/audioService';
import { Loading3D } from './components/Loading3D';
import { GlowingCard } from './components/GlowingCard';

function App() {
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure audio stops when component unmounts
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setText('');
    stopAudio();
    setIsPlaying(false);

    try {
      // Simulate a slight delay for the 3D loading effect to be visible
      await new Promise(resolve => setTimeout(resolve, 1500));
      const extractedText = await extractTextFromFile(file);
      setText(extractedText);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setText('');
    stopAudio();
    setIsPlaying(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const extractedText = await extractTextFromFile(file);
      setText(extractedText);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handlePlay = () => {
    if (!text) return;
    playText(
      text, 
      () => setIsPlaying(false), // onEnd
      () => setIsPlaying(true)   // onStart
    );
  };

  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
  };

  const handleDownload = async (format: 'mp3' | 'wav' | 'mp4') => {
    if (!text) return;
    setIsDownloading(true);
    setError(null);
    try {
      await downloadAudio(text, format);
    } catch (err: any) {
      setError(err.message || 'Failed to download audio.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full p-6 border-b border-gray-800 bg-black/20 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Volume2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">
              NexusVoice
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> System Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Editor */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Upload Zone */}
          <GlowingCard glowColor="cyan" className="relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div 
              className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative z-10"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.pdf" 
                className="hidden" 
              />
              <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <UploadCloud className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Initialize Data Transfer</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Drag & drop your <span className="text-cyan-400">.txt</span> or <span className="text-purple-400">.pdf</span> files here, or click to browse local storage.
              </p>
            </div>
          </GlowingCard>

          {/* Text Editor / Preview */}
          <GlowingCard glowColor="purple" className="flex-grow flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Extracted Content
              </h3>
              <span className="text-xs text-gray-500 font-mono">{text.length} chars</span>
            </div>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Awaiting data input..."
              className="flex-grow w-full bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none font-mono text-sm leading-relaxed custom-scrollbar"
              disabled={isProcessing}
            />
          </GlowingCard>
        </div>

        {/* Right Column: Processing & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 3D Visualizer / Loader */}
          <GlowingCard glowColor="cyan" className="p-1">
            {isProcessing ? (
              <Loading3D text="Extracting Neural Patterns..." />
            ) : isPlaying ? (
              <Loading3D text="Synthesizing Audio Stream..." />
            ) : (
              <div className="w-full h-64 rounded-xl bg-black/40 border border-gray-800 flex flex-col items-center justify-center text-gray-600">
                <Volume2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-mono text-sm">Awaiting Audio Synthesis</p>
              </div>
            )}
          </GlowingCard>

          {/* Playback Controls */}
          <GlowingCard glowColor="purple">
            <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Synthesis Controls
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={handlePlay}
                disabled={!text || isProcessing || isPlaying}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                <span className="font-semibold">Initialize</span>
              </button>
              
              <button
                onClick={handleStop}
                disabled={!isPlaying}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-5 h-5" />
                <span className="font-semibold">Terminate</span>
              </button>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4">Export Audio Matrix</h4>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleDownload('mp4')}
                  disabled={!text || isProcessing || isDownloading}
                  className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                    <span>Export as MP4 (Audio)</span>
                  </div>
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> : <Download className="w-5 h-5 text-gray-500 group-hover:text-purple-400" />}
                </button>
                
                <button
                  onClick={() => handleDownload('wav')}
                  disabled={!text || isProcessing || isDownloading}
                  className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                    <span>Export as WAV</span>
                  </div>
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : <Download className="w-5 h-5 text-gray-500 group-hover:text-cyan-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                * Export utilizes external neural processing. Max 400 chars per request.
              </p>
            </div>
          </GlowingCard>
        </div>
      </main>
    </div>
  );
}

export default App;