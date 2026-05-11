"use client";

import { useTrainJourney } from "@/hooks/use-train-journey";
import { CHUO_LINE_STATIONS } from "@/lib/stations";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Bell, MapPin, Clock, ChevronRight, Speaker } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const journey = useTrainJourney();
  const [accentColor, setAccentColor] = useState("orange");

  const colors: Record<string, any> = {
    orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/20" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/20" },
  };

  const active = colors[accentColor];

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${active.bg}/10 blur-[120px] rounded-full animate-pulse`} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 pt-12 pb-24">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black tracking-tighter">WakeTrain</h1>
              <span className="text-yellow-400 text-xl animate-pulse">★</span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
            </p>
          </div>
          <div className="flex gap-2">
            {Object.keys(colors).map(c => (
              <button 
                key={c}
                onClick={() => setAccentColor(c)}
                className={`w-4 h-4 rounded-full ${colors[c].bg} ${accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-20'}`}
              />
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!journey.isStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">出発駅</label>
                  <select 
                    value={journey.startStation?.name || ""} 
                    onChange={(e) => {
                      const s = CHUO_LINE_STATIONS.find(st => st.name === e.target.value);
                      if (s) journey.setStartStation(s);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  >
                    <option value="" disabled>駅を選択</option>
                    {CHUO_LINE_STATIONS.map(s => <option key={s.id} value={s.name} className="bg-[#050505]">{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">目的駅</label>
                  <select 
                    value={journey.endStation?.name || ""} 
                    onChange={(e) => {
                      const s = CHUO_LINE_STATIONS.find(st => st.name === e.target.value);
                      if (s) journey.setEndStation(s);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  >
                    <option value="" disabled>目的地を選択</option>
                    {CHUO_LINE_STATIONS.map(s => <option key={s.id} value={s.name} className="bg-[#050505]">{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">発車</label>
                    <input 
                      type="time" 
                      value={journey.departureTime}
                      onChange={(e) => journey.setDepartureTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">到着</label>
                    <input 
                      type="time" 
                      value={journey.arrivalTime}
                      onChange={(e) => journey.setArrivalTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={journey.startJourney}
                  disabled={!journey.startStation || !journey.endStation || !journey.departureTime || !journey.arrivalTime}
                  className={`w-full py-6 rounded-3xl ${active.bg} text-black font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-20 shadow-xl shadow-orange-500/20`}
                >
                  監視を開始する
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex gap-4 items-center">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Bell className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-xs text-white/40 leading-relaxed font-bold">
                  目的地の一駅手前で通知を送ります。<br />
                  <span className="text-white/80">バックグラウンド維持機能</span>を有効にするため、音量を少し上げてください。
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className={`absolute -top-24 -right-24 w-48 h-48 ${active.bg}/20 rounded-full blur-[80px]`} />
                
                <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full" />
                <motion.div 
                  className={`absolute bottom-0 left-0 h-1.5 ${active.bg} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${journey.progress}%` }}
                />

                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <div className="text-4xl font-black tracking-tighter">{journey.departureTime}</div>
                    <div className="text-lg font-bold text-white/60">{journey.startStation?.name}</div>
                  </div>
                  <div className="pt-4 flex flex-col items-center">
                    <div className="bg-white/5 p-3 rounded-full border border-white/10 mb-2">
                      <ChevronRight className={`w-6 h-6 ${active.text}`} />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`text-4xl font-black tracking-tighter ${active.text}`}>{journey.arrivalTime}</div>
                    <div className="text-lg font-bold">{journey.endStation?.name}</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-10 border-y border-white/5 mb-8">
                  <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">通知予定</div>
                  <div className="text-5xl font-black tracking-tighter flex items-center gap-4">
                    <Bell className={`w-10 h-10 ${active.text} animate-bounce`} />
                    {journey.calculatedAlarmTime?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className={`mt-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black ${active.text}`}>
                    {journey.alarmStation?.name}駅 通過時
                  </div>
                </div>

                <button 
                  onClick={journey.stopJourney}
                  className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  監視を中止する
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">バックグラウンド維持中</span>
                  <div className="flex gap-0.5 items-end h-3">
                    {[0,1,2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [2, 12, 2] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                        className="w-1 bg-green-500/50 rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-white/20 font-black text-center max-w-[280px] leading-relaxed uppercase tracking-tighter">
                  この画面のままポケットに入れてください。<br />
                  無音オーディオにより、スリープ中もアラームが動作します。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {journey.isAlarmActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`w-full max-w-sm p-10 rounded-[3rem] ${active.bg} text-black text-center shadow-[0_0_100px_rgba(0,0,0,0.5)]`}
              >
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="flex justify-center mb-6"
                >
                  <Bell className="w-24 h-24" />
                </motion.div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter">もうすぐ到着！</h2>
                <p className="font-bold opacity-70 mb-10 text-lg leading-snug">
                  {journey.alarmStation?.name}駅を通過しました。<br />
                  次は目的地の{journey.endStation?.name}です。
                </p>
                <button 
                  onClick={journey.stopJourney}
                  className="w-full py-6 rounded-2xl bg-black text-white font-black text-xl hover:brightness-125 active:scale-95 transition-all"
                >
                  了解しました
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
