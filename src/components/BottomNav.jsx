import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'; // Sugestão: LayoutGrid é mais bonito

const BottomNav = ({ active, onNavigate, cartCount = 0 }) => {
  
  const items = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'catalog', icon: LayoutGrid, label: 'Catálogo' }, // Troquei para LayoutGrid (opcional)
    { id: 'cart', icon: ShoppingBag, label: 'Sacola' },
    { id: 'account', icon: User, label: 'Conta' },
  ];

  return (
    // 'pb-safe' é vital para iPhones novos (Home Indicator)
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] lg:hidden">
      
      {/* Mudei para GRID para áreas de toque iguais e perfeitas */}
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center justify-center w-full h-full gap-1 
                transition-all duration-300 group
                ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/60'}
              `}
            >
              {/* Indicador de Luz Superior (Glow) */}
              {isActive && (
                <span className="absolute top-0 w-12 h-1 bg-primary rounded-b-full shadow-[0_2px_12px_rgba(247,103,19,0.6)] animate-fade-in" />
              )}

              {/* Container do Ícone + Badge */}
              <div className="relative p-1">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-lg' : 'group-active:scale-95'}`}
                />
                
                {/* Badge do Carrinho */}
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-[#0f172a] animate-bounce-short shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-wide transition-all duration-300 ${isActive ? 'font-bold opacity-100 translate-y-0' : 'font-medium opacity-60'}`}>
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