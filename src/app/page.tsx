"use client";

import { useSimpleAlarm } from "@/hooks/use-simple-alarm";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Speaker } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const alarm = useSimpleAlarm();
  const [accentColor, setAccentColor] = useState("orange");

  const colors: Record<string, any> = {
    orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/20" },
    blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500/20" },
    teal: { bg: "bg-teal-600", text: "text-teal-600", border: "border-teal-600/20" },
  };

  const active = colors[accentColor];

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white/10 overflow-x-hidden flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">SimpleAlarm</h1>
            <p className="text-white/40 text-lg font-medium">
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).replace('(', '（').replace(')', '）')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alarm.testNotification()}
              className="bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest px-4 py-2.5 rounded-full border border-white/10 transition-all"
            >
              TEST NOTIFY
            </button>
            <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Bell className={`w-5 h-5 ${active.text}`} />
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
          {!alarm.isStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-6"
            >
              <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                
                <div className="space-y-4 text-center">
                  <label className="text-[12px] font-black text-white/40 uppercase tracking-[0.2em]">通知時間（アラーム）</label>
                  <input 
                    type="time" 
                    value={alarm.alarmTimeStr}
                    onChange={(e) => alarm.setAlarmTimeStr(e.target.value)}
                    className={`w-full bg-transparent border-b-2 border-white/10 py-4 text-6xl text-center font-black ${active.text} focus:outline-none focus:border-white/40 transition-all`}
                  />
                </div>

                <button 
                  onClick={alarm.startAlarm}
                  disabled={!alarm.alarmTimeStr}
                  className={`w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-white font-black text-xl hover:bg-white/10 transition-all disabled:opacity-20 active:scale-[0.98] mt-8`}
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
                
                <div className="text-center space-y-6 mb-10">
                  <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">ALARM TIME</div>
                  <div className="flex items-center justify-center gap-5">
                    <Bell className={`w-10 h-10 ${active.text} animate-pulse`} />
                    <div className="text-6xl font-black tracking-tighter">{alarm.calculatedAlarmTime()?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full mb-10" />

                <button 
                  onClick={alarm.stopAlarm}
                  className="w-full py-5 rounded-3xl bg-transparent border border-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  CANCEL ALARM
                </button>
              </div>

              {/* Status Footer */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">MONITORING...</span>
                </div>

                {alarm.fcmToken ? (
                  <div className="bg-green-500/10 border border-green-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                    <span className={`text-[10px] font-black text-green-500 uppercase tracking-widest`}>バックグラウンドプッシュ待機中</span>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                    <span className={`text-[10px] font-black text-yellow-500 uppercase tracking-widest animate-pulse`}>プッシュ通知の設定中...</span>
                  </div>
                )}

                <div className="text-center space-y-1 mt-4">
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter leading-relaxed">
                    アプリを閉じても、時間になれば通知が届きます。
                  </p>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter leading-relaxed">
                    ※Safariから「ホーム画面に追加」している場合のみ
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal when alarm triggers */}
        <AnimatePresence>
          {alarm.isAlarmActive && (
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
                <h2 className="text-4xl font-black mb-4 tracking-tighter">時間です！</h2>
                <p className="font-bold opacity-70 mb-10 text-lg leading-snug">
                  設定した時間になりました。
                </p>
                <button 
                  onClick={alarm.stopAlarm}
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
