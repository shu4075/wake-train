"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Station, CHUO_LINE_STATIONS } from "@/lib/stations";

export function useTrainJourney() {
  const [startStation, setStartStation] = useState<Station | null>(null);
  const [endStation, setEndStation] = useState<Station | null>(null);
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const notificationTriggered = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Route calculation
  const routeStations = useMemo(() => {
    if (!startStation || !endStation) return [];
    const startIndex = CHUO_LINE_STATIONS.findIndex((s) => s.id === startStation.id);
    const endIndex = CHUO_LINE_STATIONS.findIndex((s) => s.id === endStation.id);
    
    if (startIndex < endIndex) {
      return CHUO_LINE_STATIONS.slice(startIndex, endIndex + 1);
    } else {
      return CHUO_LINE_STATIONS.slice(endIndex, startIndex + 1).reverse();
    }
  }, [startStation, endStation]);

  const alarmStation = useMemo(() => {
    if (routeStations.length < 2) return null;
    return routeStations[routeStations.length - 2];
  }, [routeStations]);

  const calculatedAlarmTime = useMemo(() => {
    if (!departureTime || !arrivalTime || !startStation || !endStation || !alarmStation) return null;

    const [depH, depM] = departureTime.split(":").map(Number);
    const [arrH, arrM] = arrivalTime.split(":").map(Number);

    const now = new Date();
    const depDate = new Date(now);
    depDate.setHours(depH, depM, 0, 0);
    const arrDate = new Date(now);
    arrDate.setHours(arrH, arrM, 0, 0);
    if (arrDate.getTime() < depDate.getTime()) arrDate.setDate(arrDate.getDate() + 1);

    const totalDurationMs = arrDate.getTime() - depDate.getTime();
    const totalDist = Math.abs(endStation.timeFromStart - startStation.timeFromStart);
    const alarmDist = Math.abs(alarmStation.timeFromStart - startStation.timeFromStart);
    const ratio = alarmDist / totalDist;

    const alarmMs = depDate.getTime() + (totalDurationMs * ratio);
    return new Date(alarmMs);
  }, [departureTime, arrivalTime, startStation, endStation, alarmStation]);

  // Wake Lock
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

  // Audio setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const silent = new Audio();
      silent.loop = true;
      silent.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
      silentAudioRef.current = silent;

      const alarm = new Audio();
      alarm.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
      alarmAudioRef.current = alarm;
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
        new Notification("🚆 もうすぐ到着です！", {
          body: `${alarmStation?.name}駅を通過しました。次は${endStation?.name}駅です。`,
          requireInteraction: true,
        });
      }
    }
  }, [alarmStation, endStation]);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      if (isStarted && calculatedAlarmTime) {
        const now = new Date();
        if (now >= calculatedAlarmTime && !notificationTriggered.current) {
          triggerAlarm();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, calculatedAlarmTime, triggerAlarm]);

  // Progress update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && departureTime && arrivalTime) {
      interval = setInterval(() => {
        const now = new Date();
        const [depH, depM] = departureTime.split(":").map(Number);
        const [arrH, arrM] = arrivalTime.split(":").map(Number);
        const depDate = new Date(now);
        depDate.setHours(depH, depM, 0, 0);
        const arrDate = new Date(now);
        arrDate.setHours(arrH, arrM, 0, 0);
        if (arrDate.getTime() < depDate.getTime()) arrDate.setDate(arrDate.getDate() + 1);
        const total = arrDate.getTime() - depDate.getTime();
        const current = now.getTime() - depDate.getTime();
        if (total > 0) {
          setProgress(Math.max(0, Math.min(100, (current / total) * 100)));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, departureTime, arrivalTime]);

  const startJourney = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      await Notification.requestPermission();
    }
    setIsAlarmActive(false);
    notificationTriggered.current = false;
    setIsStarted(true);
    if (silentAudioRef.current) {
      silentAudioRef.current.play().catch(e => console.error("Audio error:", e));
    }
  }, []);

  const stopJourney = useCallback(() => {
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

  return {
    startStation, setStartStation,
    endStation, setEndStation,
    departureTime, setDepartureTime,
    arrivalTime, setArrivalTime,
    isStarted,
    calculatedAlarmTime,
    isAlarmActive,
    startJourney,
    stopJourney,
    routeStations,
    alarmStation,
    isWakeLockActive,
    progress,
  };
}
