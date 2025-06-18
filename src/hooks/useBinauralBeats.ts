import { useState, useEffect, useRef } from 'react';

export const useBinauralBeats = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(432);
  const [beatFreq, setBeatFreq] = useState(35);
  const [volume, setVolume] = useState(41);
  const leftOsc = useRef<OscillatorNode | null>(null);
  const rightOsc = useRef<OscillatorNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);

  const stopAudio = () => {
    if (leftOsc.current) {
      leftOsc.current.stop();
      leftOsc.current.disconnect();
      leftOsc.current = null;
    }
    if (rightOsc.current) {
      rightOsc.current.stop();
      rightOsc.current.disconnect();
      rightOsc.current = null;
    }
    if (masterGain.current) {
      masterGain.current.disconnect();
      masterGain.current = null;
    }
    setIsPlaying(false);
  };
  
  const startAudio = async () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return console.error('Browser does not support Web Audio API');
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    if (ctx.state !== 'running') return console.error('AudioContext failed to resume.');

    // Clean up previous instances before starting new ones
    stopAudio();

    const gainValue = (volume / 100) ** 2;
    masterGain.current = ctx.createGain();
    masterGain.current.gain.setValueAtTime(gainValue, ctx.currentTime);
    masterGain.current.connect(ctx.destination);

    const merger = ctx.createChannelMerger(2);
    merger.connect(masterGain.current);

    leftOsc.current = ctx.createOscillator();
    leftOsc.current.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    leftOsc.current.connect(merger, 0, 0);

    rightOsc.current = ctx.createOscillator();
    rightOsc.current.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);
    rightOsc.current.connect(merger, 0, 1);
    
    leftOsc.current.start();
    rightOsc.current.start();
    
    setIsPlaying(true);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    if (isPlaying && leftOsc.current && rightOsc.current && audioContextRef.current) {
      const { currentTime } = audioContextRef.current;
      leftOsc.current.frequency.setValueAtTime(baseFreq, currentTime);
      rightOsc.current.frequency.setValueAtTime(baseFreq + beatFreq, currentTime);
    }
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (isPlaying && masterGain.current && audioContextRef.current) {
      const { currentTime } = audioContextRef.current;
      masterGain.current.gain.setValueAtTime((volume / 100) ** 2, currentTime);
    }
  }, [volume]);
  
  return {
    isPlaying,
    baseFreq,
    setBaseFreq,
    beatFreq,
    setBeatFreq,
    volume,
    setVolume,
    toggleAudio
  };
};