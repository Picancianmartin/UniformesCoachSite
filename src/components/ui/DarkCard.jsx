import React from "react";

export default function DarkCard({ children, className = "" }) {
  return (
    <div 
      className={`bg-[#1e293b] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm ${className}`}
    >
      {/* Luz de topo para dar volume 3D */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
      
      {/* Conteúdo */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}