import { useState, useEffect, useMemo } from 'react';
import { padZero } from '../utils/formatters';

export interface CountdownResult {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(targetIso?: string, serverTimeIso?: string, onExpired?: () => void): CountdownResult {
  const drift = useMemo(() => {
    if (!serverTimeIso) return 0;
    return Date.now() - new Date(serverTimeIso).getTime();
  }, [serverTimeIso]);

  const calculateRemaining = () => {
    if (!targetIso) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', isExpired: true, formatted: '00d : 00h : 00m : 00s' };
    }

    const targetMs = new Date(targetIso).getTime();
    const currentAdjustedTime = Date.now() - drift;
    const remainingMs = targetMs - currentAdjustedTime;

    if (remainingMs <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00', isExpired: true, formatted: '00d : 00h : 00m : 00s' };
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const dStr = padZero(days);
    const hStr = padZero(hours);
    const mStr = padZero(minutes);
    const sStr = padZero(seconds);

    return {
      days: dStr,
      hours: hStr,
      minutes: mStr,
      seconds: sStr,
      isExpired: false,
      formatted: `${dStr}d : ${hStr}h : ${mStr}m : ${sStr}s`,
    };
  };

  const [state, setState] = useState<CountdownResult>(calculateRemaining);

  useEffect(() => {
    setState(calculateRemaining());

    const interval = setInterval(() => {
      const updated = calculateRemaining();
      setState(updated);
      if (updated.isExpired) {
        clearInterval(interval);
        if (onExpired) onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIso, serverTimeIso]);

  return state;
}
