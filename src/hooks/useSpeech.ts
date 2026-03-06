'use client';

import { useState, useEffect, useCallback } from 'react';
import { speak, isMuted, setMuted as setMutedPlatform, isSpeechSupported } from '@/lib/platform';

export function useSpeech() {
  const [muted, setMutedState] = useState(true);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    setMutedState(isMuted());
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMutedPlatform(next);
  }, [muted]);

  const say = useCallback((text: string) => {
    speak(text);
  }, []);

  return { muted, toggleMute, say, supported };
}