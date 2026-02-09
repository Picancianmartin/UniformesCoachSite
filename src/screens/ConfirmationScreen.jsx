import React from 'react';
import { CheckCircle, Package } from 'lucide-react';

const ConfirmationScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
      
      {/* Confetti fake de fundo */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
         <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
      </div>

      <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-6 border border-success/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <CheckCircle size={48} className="text-success" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Pedido Realizado!</h1>
      <p className="text-white/60 mb-8 max-w-xs mx-auto">
        Recebemos sua encomenda. Você pode acompanhar o status na sua conta.
      </p>

      <div className="glass-panel p-6 rounded-2xl w-full max-w-sm mb-8 text-left">
        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Próximos Passos</p>
        <div className="space-y-4">
           <div className="flex gap-3">
             <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
             <p className="text-sm text-white/80">Aguarde a produção do lote.</p>
           </div>
           <div className="flex gap-3">
             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">2</div>
             <p className="text-sm text-white/80">Vamos avisar no WhatsApp quando estiver pronto.</p>
           </div>
           <div className="flex gap-3">
             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">3</div>
             <p className="text-sm text-white/80">Retire na academia.</p>
           </div>
        </div>
      </div>

      <button onClick={() => onNavigate('account')} className="btn-primary mb-3">
        Ver Meus Pedidos
      </button>
      <button onClick={() => onNavigate('home')} className="text-white/50 text-sm font-medium hover:text-white transition-colors">
        Voltar ao Início
      </button>

    </div>
  );
};

export default ConfirmationScreen;