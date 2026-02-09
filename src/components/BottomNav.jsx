import React from 'react';
import { Home, Grid, ShoppingBag, User } from 'lucide-react';

const BottomNav = ({ active, onNavigate, cartCount = 0 }) => {
  
  const items = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'catalog', icon: Grid, label: 'Catálogo' }, // Grid representa melhor catálogo que uma camiseta
    { id: 'cart', icon: ShoppingBag, label: 'Sacola' },
    { id: 'account', icon: User, label: 'Conta' },
    
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur-xl border-t border-white/10 pb-safe pt-2">
      <div className="max-w-[428px] mx-auto flex justify-around items-end h-16 pb-2">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-300 group
                ${isActive ? 'text-primary -translate-y-1' : 'text-white/40 hover:text-white/70'}
              `}
            >
              {/* Indicador Superior (Ponto ou Linha) */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(247,103,19,0.5)] animate-fade-in" />
              )}

              {/* Ícone com Badge (apenas no carrinho) */}
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-active:scale-95'}`}
                />
                
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-navy animate-bounce-short">
                    {cartCount}
                  </span>
                )}
              </div>

              {/* Texto (Label) */}
              <span className={`text-[10px] font-medium transition-all ${isActive ? 'opacity-100 font-bold' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;