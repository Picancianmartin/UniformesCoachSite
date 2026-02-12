import React from "react";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import defaultLogo from "../assets/logodavid.png";

const Header = ({
  title,
  showBack,
  onBack,
  showCart,
  cartCount = 0,
  onCart,
  showAccount,
  onAccount,
  onNavigate,
  user,
  logoSrc,
  showLogo,
  // DEFINA AQUI O TAMANHO PADRÃO GERAL (Caso você esqueça de passar na tela)
  logoSize = "h-16 w-auto",
}) => {
  const finalLogo = logoSrc || defaultLogo;

  // Avatar logic: initials or "C"
  const getAvatarText = () => {
    const name = user?.name?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return "C";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-navy/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300 lg:pl-24">
      <div className="max-w-[428px] lg:max-w-5xl mx-auto px-5 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* --- ESQUERDA (Voltar ou Logo Padrão) --- */}
        <div className="flex justify-start items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Voltar"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button
              onClick={() => onNavigate && onNavigate("home")}
              className="flex items-center gap-3 cursor-pointer"
              aria-label="Ir para Home"
            >
              {finalLogo ? (
                <img
                  src={finalLogo}
                  alt="Logo Coach"
                  className={`${logoSize} object-contain`}
                />
              ) : (
                <div className="text-lg font-bold tracking-widest text-white uppercase leading-none">
                  COACH DAVID
                </div>
              )}
            </button>
          )}
        </div>

        {/* --- CENTRO (Título + Logo Opcional) --- */}
        <div className="flex justify-center items-center gap-2">
          {showLogo && (
            <img
              src={finalLogo}
              alt="Logo Centro"
              className={`${logoSize} object-contain`}
            />
          )}

          {title && (
            <h1 className="text-sm lg:text-base font-bold text-white/90 uppercase tracking-wider truncate max-w-[150px] lg:max-w-none text-center">
              {title}
            </h1>
          )}
        </div>

        {/* --- DIREITA (Ações) --- */}
        <div className="flex justify-end items-center gap-2">
          {/* Botão Carrinho */}
          {showCart && (
            <button
              onClick={onCart}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all relative"
              aria-label="Carrinho"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-2 right-1.5 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-navy animate-bounce-short">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Avatar / Perfil */}
          {showAccount && (
            <button
              onClick={onAccount}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-[13px] font-bold hover:bg-white/20 active:scale-95 transition-all"
              aria-label="Minha Conta"
            >
              {getAvatarText()}
            </button>
          )}
          
        </div>
      </div>
    </header>
  );
};

export default Header;
