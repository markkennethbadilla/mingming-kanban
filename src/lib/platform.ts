// Platform abstraction for web/Electron compatibility

const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

export function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }) {
  if (typeof window === 'undefined') return;

  // Check if user has muted speech
  const muted = localStorage.getItem('mingming-muted') === 'true';
  if (muted) return;

  if (isElectron && (window as any).electronAPI?.speak) {
    (window as any).electronAPI.speak(text, opts);
    return;
  }

  // Web Speech API
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = opts?.rate ?? 1.0;
    utterance.pitch = opts?.pitch ?? 1.1;
    utterance.volume = opts?.volume ?? 0.8;

    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')
    );
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }
}

export function notify(title: string, body: string, opts?: { icon?: string; tag?: string }) {
  if (typeof window === 'undefined') return;

  if (isElectron && (window as any).electronAPI?.notify) {
    (window as any).electronAPI.notify({ title, body, ...opts });
    return;
  }

  // Web Notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: opts?.icon ?? '/logo.svg', tag: opts?.tag });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isElectron) return true; // Electron always has permission
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function isMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('mingming-muted') === 'true';
}

export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mingming-muted', String(muted));
  if (muted) window.speechSynthesis?.cancel();
}