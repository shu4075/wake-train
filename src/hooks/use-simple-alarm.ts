"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { requestForToken, onMessageListener } from "@/lib/firebase";

export function useSimpleAlarm() {
  const [alarmTimeStr, setAlarmTimeStr] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  
  const notificationTriggered = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate actual Date object for the alarm
  const calculatedAlarmTime = useCallback(() => {
    if (!alarmTimeStr) return null;
    const [h, m] = alarmTimeStr.split(":").map(Number);
    const now = new Date();
    const alarmDate = new Date(now);
    alarmDate.setHours(h, m, 0, 0);
    // If the time is in the past, assume it's for tomorrow
    if (alarmDate.getTime() < now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    return alarmDate;
  }, [alarmTimeStr]);

  // Wake Lock for sleep prevention
  const requestWakeLock = useCallback(async () => {
    if (typeof window !== "undefined" && "wakeLock" in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        setIsWakeLockActive(true);
      } catch (err) {
        console.error("Wake Lock failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (isStarted) requestWakeLock();
    const handleVisibilityChange = () => {
      if (isStarted && document.visibilityState === "visible") requestWakeLock();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStarted, requestWakeLock]);

  // Audio and FCM setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const silent = new Audio();
      silent.loop = true;
      silent.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
      silentAudioRef.current = silent;

      const alarm = new Audio();
      alarm.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
      alarmAudioRef.current = alarm;

      // Request FCM Token
      requestForToken().then((token) => {
        if (token) setFcmToken(token);
      });

      // Listen for foreground FCM messages
      onMessageListener().then((payload: any) => {
        console.log("Foreground message received: ", payload);
        triggerAlarm();
      });
    }
  }, []);

  const triggerAlarm = useCallback(async () => {
    if (notificationTriggered.current) return;
    notificationTriggered.current = true;
    setIsAlarmActive(true);

    if (alarmAudioRef.current) {
      alarmAudioRef.current.play().catch(e => console.error("Alarm audio failed:", e));
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("⏰ 時間です！", {
          body: `設定した時間（${alarmTimeStr}）になりました。`,
          requireInteraction: true,
        });
      }
    }
  }, [alarmTimeStr]);

  // Local timer tick (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const alarmDate = calculatedAlarmTime();
      if (isStarted && alarmDate) {
        const now = new Date();
        if (now >= alarmDate && !notificationTriggered.current) {
          triggerAlarm();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, calculatedAlarmTime, triggerAlarm]);

  const startAlarm = useCallback(async () => {
    const alarmDate = calculatedAlarmTime();
    if (!alarmDate) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }
    
    setIsAlarmActive(false);
    notificationTriggered.current = false;
    setIsStarted(true);
    
    // Start silent audio
    if (silentAudioRef.current) {
      silentAudioRef.current.play().catch(e => console.error("Audio error:", e));
    }

    // Schedule background notification on server via FCM/Redis
    if (fcmToken) {
      try {
        await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: fcmToken,
            alarmTime: alarmDate.getTime(),
            title: "⏰ 時間です！",
            body: `設定した時間（${alarmTimeStr}）になりました。`,
          }),
        });
        console.log("Alarm scheduled on server via FCM for", alarmDate);
      } catch (err) {
        console.error("Failed to schedule alarm on server:", err);
      }
    }
  }, [calculatedAlarmTime, fcmToken, alarmTimeStr]);

  const stopAlarm = useCallback(() => {
    setIsStarted(false);
    setIsAlarmActive(false);
    notificationTriggered.current = false;
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current.currentTime = 0;
    }
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  }, []);

  const testNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }
    if (alarmAudioRef.current) {
      alarmAudioRef.current.play().catch(e => console.error("Test playback failed:", e));
      setTimeout(() => {
        alarmAudioRef.current?.pause();
        if (alarmAudioRef.current) alarmAudioRef.current.currentTime = 0;
      }, 2000);
    }
  };

  return {
    alarmTimeStr,
    setAlarmTimeStr,
    isStarted,
    isAlarmActive,
    startAlarm,
    stopAlarm,
    testNotification,
    isWakeLockActive,
    fcmToken,
    calculatedAlarmTime,
  };
}
