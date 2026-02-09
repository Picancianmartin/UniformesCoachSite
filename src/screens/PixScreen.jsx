import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const PixScreen = ({ onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-32">
      <Header title="Pagamento PIX" showBack onBack={() => onNavigate('payment')} />
      
      <div className="p-5">
        <h2 className="text-2xl font-bold text-center mb-6">Escaneie o QR Code</h2>
        
        <div className="w-60 h-60 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center text-[180px]">⬛</div>

        <p className="text-center text-sm text-white/70 mb-5">Ou copie o código PIX abaixo</p>

        <div className="glass-card p-4 mb-3 font-mono text-xs break-all text-white/90">
          00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540574.005802BR5925Coach David Sousa6009SOROCABA62070503***6304A1B2
        </div>

        <button onClick={copyCode} className="btn-secondary w-full flex items-center justify-center gap-2">
          📋 {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
        </button>

        <div className="glass-card p-5 text-center mt-8">
          <div className="text-5xl mb-3 animate-pulse">⏳</div>
          <div className="font-semibold mb-1">Aguardando pagamento...</div>
          <div className="text-sm text-white/70">O pagamento será confirmado automaticamente</div>
        </div>

        <button 
          onClick={() => onNavigate('confirmation')} 
          className="btn-secondary w-full mt-4"
        >
          Simular Pagamento Confirmado
        </button>
      </div>
    </div>
  );
};

export default PixScreen;