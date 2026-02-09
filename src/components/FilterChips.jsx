import React from 'react';

const FilterChips = ({ label, options, selected, onSelect }) => {
  return (
    <div className="py-2">
      {/* Label estilizado (Padrão App) */}
      {label && (
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 ml-1">
          {label}
        </p>
      )}

      {/* Container de Scroll:
         - 'scrollbar-hide': Remove a barra de rolagem feia (veja o CSS abaixo)
         - '-mx-4 px-4': Permite que o scroll vá até a borda da tela no mobile 
      */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mask-gradient">
        {options.map((opt) => {
          const isActive = selected === opt.value;
          
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(isActive ? null : opt.value)}
              aria-pressed={isActive}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                whitespace-nowrap active:scale-95 flex items-center gap-2
                ${isActive
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }
              `}
            >
              {/* Se quiser adicionar ícones no futuro, coloque aqui */}
              {opt.label}
              
              {/* Bolinha de "Ativo" (Opcional, mas ajuda na UX visual) */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterChips;