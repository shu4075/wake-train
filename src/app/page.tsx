"use client";

import { useTrainJourney } from "@/hooks/use-train-journey";
import { CHUO_LINE_STATIONS } from "@/lib/stations";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Bell, ChevronRight, Speaker } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const journey = useTrainJourney();
  const [accentColor, setAccentColor] = useState("orange");

  const colors: Record<string, any> = {
    orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/20", glow: "shadow-orange-500/20" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/20" },
    teal: { bg: "bg-teal-600", text: "text-teal-600", border: "border-teal-600/20", glow: "shadow-teal-600/20" },
  };

  const active = colors[accentColor];

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white/10 overflow-x-hidden">
      <div className="max-w-md mx-auto px-6 pt-16 pb-24">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">TrainAlarm</h1>
            <p className="text-white/40 text-lg font-medium">
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).replace('(', '（').replace(')', '）')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => journey.testNotification()}
              className="bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest px-4 py-2.5 rounded-full border border-white/10 transition-all"
            >
              TEST NOTIFY
            </button>
            <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Train className={`w-5 h-5 ${active.text}`} />
            </div>
          </div>
        </header>

        {/* Color Selectors */}
        <div className="flex justify-center gap-5 mb-12">
          {Object.keys(colors).map(c => (
            <button 
              key={c}
              onClick={() => setAccentColor(c)}
              className={`w-8 h-8 rounded-full ${colors[c].bg} ${accentColor === c ? 'ring-2 ring-white ring-offset-4 ring-offset-black' : 'opacity-40'} transition-all`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!journey.isStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
            >
              <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">出発駅</label>
                    <select 
                      value={journey.startStation?.name || ""} 
                      onChange={(e) => {
                        const s = CHUO_LINE_STATIONS.find(st => st.name === e.target.value);
                        if (s) journey.setStartStation(s);
                      }}
                      className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-black focus:outline-none focus:border-white/40 transition-all appearance-none"
                    >
                      <option value="" disabled>選択</option>
                      {CHUO_LINE_STATIONS.map(s => <option key={s.id} value={s.name} className="bg-[#111]">{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mr-1">目的駅</label>
                    <select 
                      value={journey.endStation?.name || ""} 
                      onChange={(e) => {
                        const s = CHUO_LINE_STATIONS.find(st => st.name === e.target.value);
                        if (s) journey.setEndStation(s);
                      }}
                      className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-black text-right focus:outline-none focus:border-white/40 transition-all appearance-none"
                    >
                      <option value="" disabled>選択</option>
                      {CHUO_LINE_STATIONS.map(s => <option key={s.id} value={s.name} className="bg-[#111]">{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">発車時刻</label>
                    <input 
                      type="time" 
                      value={journey.departureTime}
                      onChange={(e) => journey.setDepartureTime(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-2 text-3xl font-black focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mr-1">到着時刻</label>
                    <input 
                      type="time" 
                      value={journey.arrivalTime}
                      onChange={(e) => journey.setArrivalTime(e.target.value)}
                      className={`w-full bg-transparent border-b border-white/10 py-2 text-3xl font-black text-right ${active.text} focus:outline-none focus:border-white/40 transition-all`}
                    />
                  </div>
                </div>

                <button 
                  onClick={journey.startJourney}
                  disabled={!journey.startStation || !journey.endStation || !journey.departureTime || !journey.arrivalTime}
                  className={`w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all disabled:opacity-20 active:scale-[0.98]`}
                >
                  SET ALARM
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              {/* Main Monitoring Card */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <div className="text-5xl font-black tracking-tighter leading-none">{journey.departureTime}</div>
                    <div className="text-xl font-bold text-white/80">{journey.startStation?.name}</div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">DEPARTURE</div>
                  </div>
                  
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ChevronRight className={`w-7 h-7 text-white/40`} />
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`text-5xl font-black tracking-tighter leading-none ${active.text}`}>{journey.arrivalTime}</div>
                    <div className="text-xl font-bold text-white/80">{journey.endStation?.name}</div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">ARRIVAL</div>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full mb-10" />

                <div className="text-center space-y-6">
                  <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">ESTIMATED ALARM</div>
                  <div className="flex items-center justify-center gap-5">
                    <Bell className={`w-10 h-10 ${active.text} animate-pulse`} />
                    <div className="text-6xl font-black tracking-tighter">{journey.calculatedAlarmTime?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className={`text-sm font-black uppercase tracking-widest ${active.text}`}>
                    AT {journey.alarmStation?.name} STATION
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full mt-10 mb-10" />

                <button 
                  onClick={journey.stopJourney}
                  className="w-full py-5 rounded-3xl bg-transparent border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  CANCEL ALARM
                </button>

                <motion.div 
                  className={`absolute bottom-0 left-0 h-1 ${active.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${journey.progress}%` }}
                />
              </div>

              {/* Status Footer */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">MONITORING JOURNEY</span>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${active.text}`}>SLEEP PREVENTION ACTIVE</span>
                </div>

                {journey.fcmToken ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">バックグラウンドプッシュ待機中</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">プッシュ通知の設定中...</span>
                  </div>
                )}

                <div className="text-center space-y-1">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter leading-relaxed">
                    KEEP THIS TAB OPEN FOR THE MOST RELIABLE ALARM.
                  </p>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter leading-relaxed">
                    BACKGROUND NOTIFICATIONS MAY BE DELAYED BY THE OS.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
