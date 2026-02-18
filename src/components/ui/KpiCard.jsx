import React from "react";
import DarkCard from "./DarkCard"; // Certifique-se que o DarkCard existe nessa pasta
import { TrendingUp } from "lucide-react";

export default function KpiCard({ title, value, icon: Icon, color, trend }) {
  return (
    <DarkCard className="group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        {/* Ícone com fundo colorido */}
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 border border-white/5`}>
          {Icon && <Icon size={22} className={color.replace('bg-', 'text-')} />}
        </div>
        
        {/* Tag de Tendência (ex: +12%) */}
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/20">
            <TrendingUp size={12} /> {trend}
          </span>
        )}
      </div>
      
      {/* Textos */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
      </div>
    </DarkCard>
  );
}