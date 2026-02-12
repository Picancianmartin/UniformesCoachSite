import React from "react";
import BottomNav from "../components/BottomNav";
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  Package,
  AlertCircle,
} from "lucide-react";
import Header from "../components/Header";
import logoAzul from "../assets/logodavidD.png"; // Imagem do "N" azul para o logo central

const CartScreen = ({
  onNavigate,
  cartItems,
  onRemoveItem,
  onUpdateQty,
  user,
}) => {
  // Cálculo Seguro do Total
  const total = cartItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    return acc + price * qty;
  }, 0);

  const handleCheckout = () => {
    if (user && user.name && user.phone) {
      onNavigate("payment");
    } else {
      onNavigate("signup");
    }
  };

  const formatMoney = (value) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen bg-navy font-outfit text-white relative flex flex-col">
      <Header
        title="Minha Sacola"
        logoSrc={logoAzul} // Usa a imagem do "N" azul
        logoSize="h-12 w-auto ml-1.5" // Tamanho maior para o logo no centro
        showBack={true}
        onBack={() => onNavigate("catalog")}
        showAccount
        onAccount={() => onNavigate("account")}
        onNavigate={onNavigate}
        user={user}
      />

      {/* Container com Scroll */}
      <div className="flex-1 pt-24 px-5 pb-48 lg:pb-32 lg:px-8 lg:max-w-5xl lg:mx-auto lg:w-full overflow-y-auto animate-fade-in no-scrollbar">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 opacity-60 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <ShoppingBag size={40} className="text-white/40" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sua sacola está vazia</h2>
            <p className="text-sm text-white/50 max-w-[200px] mx-auto">
              Adicione itens do catálogo para prosseguir com o pedido.
            </p>
            <button
              onClick={() => onNavigate("catalog")}
              className="mt-8 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              Ir para o Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              // -----------------------------------------------------------
              // 1. INÍCIO DA EDIÇÃO: LÓGICA DE ESTOQUE REAL
              // -----------------------------------------------------------
              let availableStock = 9999; // Infinito se for Encomenda
              const isProntaEntrega = item.pronta_entrega || item.is_ready;

              if (isProntaEntrega && item.stock) {
                if (item.isKit) {
                  // Se for Kit, pega o menor estoque entre Top e Bottom
                  const sizeTop = item.selectedSizes?.top;
                  const sizeBottom = item.selectedSizes?.bottom;
                  const stockTop = item.stock.top?.[sizeTop] || 0;
                  const stockBottom = item.stock.bottom?.[sizeBottom] || 0;

                  availableStock = Math.min(stockTop, stockBottom);
                } else {
                  // Se for Peça Única
                  const size = item.selectedSizes?.standard;
                  availableStock = item.stock.standard?.[size] || 0;
                }
              }

              // Bloqueia se atingiu o limite
              const isMaxStock =
                isProntaEntrega && item.quantity >= availableStock;
              // -----------------------------------------------------------
              // FIM DA LÓGICA
              // -----------------------------------------------------------

              return (
                <div
                  key={item.cartId}
                  className="bg-navy-light p-3 rounded-2xl flex gap-4 items-center relative border border-white/5 shadow-lg"
                >
                  {/* ... (CÓDIGO DA IMAGEM E INFO MANTÉM IGUAL) ... */}

                  {/* Imagem */}
                  <div className="w-20 h-24 bg-navy rounded-xl overflow-hidden flex-shrink-0 relative border border-white/5">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    {item.isKit && (
                      <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-[8px] font-bold text-center text-white uppercase py-1">
                        KIT
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white text-sm truncate pr-8">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="absolute top-3 right-3 text-white/20 hover:text-red-500 p-2 -mr-2 -mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.isKit ? (
                        <>
                          <span className="text-[10px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-white/60">
                            Top:{" "}
                            <b className="text-white">
                              {item.selectedSizes.top}
                            </b>
                          </span>
                          <span className="text-[10px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-white/60">
                            Bot:{" "}
                            <b className="text-white">
                              {item.selectedSizes.bottom}
                            </b>
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-white/60">
                          Tam:{" "}
                          <b className="text-white">
                            {item.selectedSizes.standard}
                          </b>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-base">
                        {formatMoney(item.price)}
                      </span>

                      <div className="flex flex-col items-end">
                        <div
                          className={`flex items-center bg-navy rounded-lg border h-8 shadow-inner transition-colors ${isMaxStock ? "border-red-500/30" : "border-white/10"}`}
                        >
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                onRemoveItem(item.cartId);
                              } else {
                                onUpdateQty(item.cartId, -1);
                              }
                            }}
                            className={`w-8 h-full flex items-center justify-center transition-colors rounded-l-lg
                              ${item.quantity === 1 ? "text-red-400 hover:text-red-500" : "text-white/60 hover:text-white"}
                            `}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 size={14} />
                            ) : (
                              <Minus size={12} />
                            )}
                          </button>

                          <span className="text-xs font-bold w-6 text-center text-white">
                            {item.quantity}
                          </span>

                          {/* 2. EDIÇÃO: BOTÃO PLUS COM BLOQUEIO */}
                          <button
                            onClick={() =>
                              !isMaxStock && onUpdateQty(item.cartId, 1)
                            }
                            disabled={isMaxStock}
                            className={`w-8 h-full flex items-center justify-center transition-colors rounded-r-lg ${
                              isMaxStock
                                ? "text-white/10 cursor-not-allowed bg-white/5"
                                : "text-white/60 hover:text-primary active:bg-white/5"
                            }`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* 3. EDIÇÃO: MENSAGEM DE AVISO */}
                        {isMaxStock && (
                          <span className="text-[9px] text-red-400 mt-1 font-bold flex items-center gap-1">
                            <AlertCircle size={8} /> Max: {availableStock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. BARRA DE TOTAL FIXA */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-navy/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:pl-20">
          <div className="max-w-[428px] lg:max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-4 px-1">
              <div>
                <p className="text-xs text-white/50 mb-0.5">Total a pagar</p>
                <p className="text-2xl font-bold text-white">
                  {formatMoney(total)}
                </p>
              </div>
              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded font-bold uppercase flex items-center gap-1">
                <Package size={10} /> Retirada Grátis
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/25 active:scale-95 transition-all"
            >
              Finalizar Compra <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 2. BOTTOM NAV (Só aparece se estiver vazio) */}
      {cartItems.length === 0 && (
        <BottomNav active="cart" onNavigate={onNavigate} cartCount={0} />
      )}
    </div>
  );
};

export default CartScreen;
