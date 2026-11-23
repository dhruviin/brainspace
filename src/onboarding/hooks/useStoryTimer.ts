import { useEffect } from 'react';
import { AppState } from 'react-native';

// Pause the story clock while a system sheet or another app has the foreground.
export function useStoryTimer(
  active: boolean,
  delay: number,
  callback: () => void,
) {
  useEffect(() => {
    if (!active) return;
    let remaining = delay,
      since = 0,
      timer: ReturnType<typeof setTimeout> | undefined;
    const pause = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
        remaining = Math.max(0, remaining - (Date.now() - since));
      }
    };
    const resume = () => {
      if (timer !== undefined) return;
      since = Date.now();
      timer = setTimeout(callback, remaining);
    };
    if (AppState.currentState !== 'background') resume();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resume();
      else pause();
    });
    return () => {
      pause();
      sub.remove();
    };
  }, [active, callback, delay]);
}
