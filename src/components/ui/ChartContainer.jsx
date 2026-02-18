import React from "react";
import DarkCard from "./DarkCard";

export default function ChartContainer({ title, subtitle, icon: Icon, iconColor, headerContent, children, className = "" }) {
  return (
    <DarkCard className={`flex flex-col h-full min-h-[420px] ${className}`}>
      {/* Cabeçalho do Gráfico */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className={iconColor || "text-white"} />}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {headerContent}
      </div>

      {/* Área do Gráfico */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </DarkCard>
  );
}