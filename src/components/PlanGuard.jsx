import { Lock } from "lucide-react";

export default function PlanGuard({ userPlan, requiredPlan, children }) {
  const levels = { start: 1, growth: 2, premium: 3 };
  const userLevel = levels[userPlan] || 1;
  const requiredLevel = levels[requiredPlan];

  // SE BLOQUEADO:
  if (userLevel < requiredLevel) {
    return (
      <div className="relative w-full h-full min-h-[350px] bg-[#1e293b] rounded-3xl overflow-hidden border border-white/5 group">
        
        {/* UX: Gráfico Falso no fundo (Skeleton) para dar desejo */}
        <div className="absolute inset-0 p-8 opacity-10 pointer-events-none flex flex-col justify-end gap-4 blur-sm">
             <div className="flex items-end justify-between h-32 gap-2">
                <div className="w-full bg-indigo-500 h-[40%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500 h-[70%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500 h-[50%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500 h-[90%] rounded-t-lg"></div>
                <div className="w-full bg-indigo-500 h-[60%] rounded-t-lg"></div>
             </div>
             <div className="h-4 w-1/3 bg-white/20 rounded-full"></div>
        </div>
        
        {/* O Cadeado e o Botão (Chamada para Ação) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/60 backdrop-blur-[4px]">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 mb-5 shadow-2xl animate-float">
            <Lock size={28} className="text-indigo-400" />
          </div>
          
          <h3 className="font-bold text-white text-lg mb-1 tracking-tight">
            Recurso {requiredPlan.toUpperCase()}
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-[220px] text-center leading-relaxed">
            Desbloqueie métricas estratégicas para escalar suas vendas.
          </p>
          
          <button className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 border border-indigo-400/20 hover:scale-105 active:scale-95">
            Fazer Upgrade
          </button>
        </div>
      </div>
    );
  }

  // SE LIBERADO:
  return children;
}