import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from "lucide-react";

const Toast = ({ show, message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(show);
    }, 0);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show && !visible) return null;

  const styles = {
    success: {
      icon: <CheckCircle2 size={22} className="text-emerald-400" />,
      borderColors: "border-emerald-500/20 ring-1 ring-emerald-500/30",
      progressBg: "bg-emerald-500",
      shadow: "shadow-lg shadow-emerald-900/20",
    },
    error: {
      icon: <XCircle size={22} className="text-red-400" />,
      borderColors: "border-red-500/20 ring-1 ring-red-500/30",
      progressBg: "bg-red-500",
      shadow: "shadow-lg shadow-red-900/20",
    },
    warning: {
      icon: <AlertTriangle size={22} className="text-amber-400" />,
      borderColors: "border-amber-500/20 ring-1 ring-amber-500/30",
      progressBg: "bg-amber-500",
      shadow: "shadow-lg shadow-amber-900/20",
    },
    info: {
      icon: <Info size={22} className="text-blue-400" />,
      borderColors: "border-blue-500/20 ring-1 ring-blue-500/30",
      progressBg: "bg-blue-400",
      shadow: "shadow-lg shadow-blue-900/20",
    },
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] 
        transition-all duration-500 
        ${/* Curva elástica para o efeito de "cair" */ ""}
        cubic-bezier(0.175, 0.885, 0.32, 1.275)
        ${
          show
            ? "translate-y-6 opacity-100"   // Desce e para a 24px (rem-6) do topo
            : "-translate-y-full opacity-0" // Sobe para fora da tela
        }`}
    >
      <div
        className={`
          relative bg-navy/95 backdrop-blur-md 
          border ${currentStyle.borderColors} 
          rounded-2xl overflow-hidden
          flex items-start text-left gap-3
          p-4 pr-10 
          min-w-[320px] max-w-[90vw] 
          ${currentStyle.shadow}
        `}
      >
        {/* Ícone */}
        <div className="shrink-0 mt-0.5">{currentStyle.icon}</div>

        {/* Mensagem */}
        <div className="flex-1">
          <p className="text-[20px] font-medium font-outfit text-white/90 leading-snug">
            {message}
          </p>
        </div>

        {/* Botão Fechar */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Barra de Progresso */}
        {show && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/20">
            <div
              className={`h-full ${currentStyle.progressBg} animate-shrink-width origin-left`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;