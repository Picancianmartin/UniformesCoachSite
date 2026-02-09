import React from "react";
import { ChevronLeft, ShoppingBag, User, Search } from "lucide-react";
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
  logoSrc,
  showLogo,
  // DEFINA AQUI O TAMANHO PADRÃO GERAL (Caso você esqueça de passar na tela)
  logoSize = "h-16 w-auto",
}) => {
  const finalLogo = logoSrc || defaultLogo;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-navy/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-[428px] mx-auto px-5 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
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
            <div className="flex items-center gap-3">
              {finalLogo ? (
                <img
                  src={finalLogo}
                  alt="Logo Coach"
                  // CORREÇÃO: Agora usa 'logoSize' aqui também (antes estava travado em h-16)
                  className={`${logoSize} object-contain`}
                />
              ) : (
                <div className="text-lg font-bold tracking-widest text-white uppercase leading-none">
                  COACH DAVID
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- CENTRO (Título + Logo Opcional) --- */}
        <div className="flex justify-center items-center gap-2">
          {showLogo && (
            <img
              src={finalLogo}
              alt="Logo Centro"
              // Usa a mesma variável para garantir consistência
              className={`${logoSize} object-contain`}
            />
          )}

          {title && (
            <h1 className="text-sm font-bold text-white/90 uppercase tracking-wider truncate max-w-[150px] text-center">
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

          {/* Botão Perfil */}
          {showAccount && (
            <button
              onClick={onAccount}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Minha Conta"
            >
              <User size={22} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
