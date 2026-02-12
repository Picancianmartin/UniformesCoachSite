import React, { useState, useEffect, useMemo } from "react";
import { Search, PackageOpen, Zap } from "lucide-react";
import { supabase } from "../services/supabase";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import logoAzul from "../assets/logodavidD.png";
import ProductCard from "../components/ui/ProductCard";

const CatalogScreen = ({ onNavigate, onSelectProduct, cartItems = [] }) => {
  // Estado Unificado de Filtro (Botões)
  const [activeFilter, setActiveFilter] = useState({
    type: "reset",
    value: "todos",
  });

  // Estado da Busca (Texto)
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. LISTA DE FILTROS (Botões Superiores) ---
  const allFilters = useMemo(() => {
    const fixedFilters = [
      { id: "todos", label: "Tudo", type: "reset" },
      {
        id: "pronta",
        label: "Pronta Entrega",
        type: "status",
        icon: <Zap size={12} fill="currentColor" />,
      },
      { id: "kit", label: "Kits", type: "category" },
      { id: "unit", label: "Peças", type: "category" },
    ];

    const collectionFilters = products
      .map((p) => p.collection)
      .filter((c) => c && c.trim() !== "")
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .map((c) => ({ id: c, label: c, type: "collection" }));

    return [...fixedFilters, ...collectionFilters];
  }, [products]);

  // --- 2. LÓGICA DE FILTRAGEM ---
  const checkStockVisibility = (product) => {
    if (!product.pronta_entrega && !product.is_pronta_entrega) return true;
    if (!product.stock) return false;
    const categories = Object.values(product.stock);
    for (const cat of categories) {
      const quantities = Object.values(cat);
      if (quantities.some((q) => q > 0)) return true;
    }
    return false;
  };

  const filteredProducts = products.filter((product) => {
    // A. Verifica Estoque
    if (!checkStockVisibility(product)) return false;

    // B. Prepara dados (Normalização para busca)
    const pName = (product.name || "").toLowerCase();
    const pCategory = (product.category || "").toLowerCase();
    const pCollection = (product.collection || "").toLowerCase();

    // Definições auxiliares
    const isReady =
      product.pronta_entrega || product.is_pronta_entrega || product.is_ready;
    const isKit =
      pCategory.includes("kit") ||
      pCategory.includes("conjunto") ||
      pName.includes("kit ");

    // C. Lógica do Filtro de Botões (Clique)
    let matchesFilter = false;

    if (activeFilter.type === "reset") matchesFilter = true;
    else if (activeFilter.type === "status" && activeFilter.value === "pronta")
      matchesFilter = isReady;
    else if (activeFilter.type === "category" && activeFilter.value === "kit")
      matchesFilter = isKit;
    else if (activeFilter.type === "category" && activeFilter.value === "unit")
      matchesFilter = !isKit;
    else if (activeFilter.type === "collection")
      matchesFilter = product.collection === activeFilter.value;

    // D. LÓGICA DA BARRA DE BUSCA (Texto) - INTELIGENTE
    const term = searchTerm.toLowerCase();

    // Cria um texto "virtual" contendo todas as informações do produto + palavras chaves extras
    const searchableText = `
      ${pName} 
      ${pCategory} 
      ${pCollection} 
      ${isReady ? "pronta entrega ready" : ""} 
      ${isKit ? "kit conjunto kits conjuntos" : "peça unitaria avulsa"} 
    `.toLowerCase();

    const matchesSearch = searchTerm === "" || searchableText.includes(term);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-navy pb-24 lg:pb-8 font-outfit text-white">
      <Header
        title="Catálogo"
        showCart
        cartCount={cartItems.length}
        onCart={() => onNavigate("cart")}
        showBack={false}
        logoSrc={logoAzul}
        logoSize="h-12 w-auto ml-1.5"
        onNavigate={onNavigate}
      />

      <div className="pt-24 px-5 lg:px-8 lg:max-w-7xl lg:mx-auto space-y-6">
        {/* --- BARRA DE BUSCA --- */}
        <div className="flex gap-3 animate-fade-in">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nome, coleção, conjunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-navy-light/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-navy-light transition-all placeholder:text-white/30"
            />
          </div>
        </div>

        {/* --- LISTA UNIFICADA DE FILTROS --- */}
        <div className="p-1 flex gap-2 overflow-x-auto pb-2 no-scrollbar animate-slide-up mask-gradient-right">
          {allFilters.map((filter) => {
            const isActive =
              activeFilter.value === filter.id &&
              activeFilter.type === filter.type;
            return (
              <button
                key={`${filter.type}-${filter.id}`}
                onClick={() => {
                  setActiveFilter({ type: filter.type, value: filter.id });
                  setSearchTerm(""); // Limpa a busca ao clicar num botão
                }}
                className={`
                  px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border flex items-center gap-2
                  ${
                    isActive
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white"
                  }
                `}
              >
                {filter.icon && <span>{filter.icon}</span>}
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* --- GRID DE PRODUTOS --- */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-navy-light rounded-2xl h-[300px] border border-white/5 animate-pulse relative overflow-hidden"
                >
                  <div className="h-2/3 bg-white/5 w-full"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 opacity-50 flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <PackageOpen size={24} className="text-white/40" />
              </div>
              <p>Nenhum produto encontrado.</p>
              <button
                onClick={() => {
                  setActiveFilter({ type: "reset", value: "todos" });
                  setSearchTerm("");
                }}
                className="mt-4 text-primary text-sm font-bold hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-slide-up">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onSelectProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav
        active="catalog"
        onNavigate={onNavigate}
        cartCount={cartItems.length}
      />
    </div>
  );
};

export default CatalogScreen;
