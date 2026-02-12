import React from "react";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";

const DesktopSidebar = ({ active, onNavigate, cartCount = 0 }) => {
  const items = [
    { id: "home", icon: Home, label: "Início" },
    { id: "catalog", icon: LayoutGrid, label: "Catálogo" },
    { id: "cart", icon: ShoppingBag, label: "Sacola" },
    { id: "account", icon: User, label: "Conta" },
  ];

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-20 z-50 flex-col items-center py-8 bg-navy/95 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Logo / Brand Mark */}
      <div className="w-11 h-11 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm mb-10 shadow-neon">
        C
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-4">
        {items.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5
                transition-all duration-300 group
                ${isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_20px_rgba(0,123,186,0.15)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }
              `}
              aria-label={item.label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-9 bg-primary rounded-r-full shadow-[0_0_16px_rgba(0,123,186,0.6)]" />
              )}

              <div className="relative">
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                />

                {/* Cart badge */}
                {item.id === "cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-navy shadow-sm">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] tracking-wide transition-all duration-300 ${
                  isActive ? "font-bold opacity-100" : "font-medium opacity-60"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
