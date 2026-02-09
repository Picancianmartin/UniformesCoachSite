import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Star,
  Heart,
  ShoppingBag,
  Loader,
} from "lucide-react";
import { supabase } from "../services/supabase";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import logoAzul from "../assets/logodavidD.png"; // Imagem do "N" azul para o logo central

// --- SUB-COMPONENTE: CARD COM CARROSSEL ---
const ProductCard = ({ product, onSelectProduct }) => {
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef(null);

  // Lógica: Se o banco tiver um array de 'images', usa ele.
  // Se não, cria um array falso repetindo a foto única 3x para simular o carrossel (Visual Demo)
  // Quando você tiver várias fotos no banco, remova o .fill e use product.images
  const images = product.images?.length
    ? product.images
    : product.image
      ? Array(3).fill(product.image)
      : [];

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActiveImage(index);
    }
  };

  return (
    <div className="bg-navy-light rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-full group animate-fade-in">
      {/* ÁREA DA IMAGEM (CARROSSEL) */}
      <div className="relative aspect-[4/5] bg-navy">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full h-full"
        >
          {images.length > 0 ? (
            images.map((img, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-center relative cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60" />
              </div>
            ))
          ) : (
            // Fallback se não tiver imagem
            <div
              onClick={() => onSelectProduct(product)}
              className="w-full h-full flex items-center justify-center text-white/20 cursor-pointer"
            >
              <ShoppingBag size={32} />
            </div>
          )}
        </div>

        {/* Indicadores (Dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`
                  h-1.5 rounded-full transition-all duration-300 shadow-sm
                  ${i === activeImage ? "w-4 bg-white" : "w-1.5 bg-white/30"}
                `}
              />
            ))}
          </div>
        )}

        {/* Badges Flutuantes */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_ready && (
            <span className="text-[9px] font-bold uppercase bg-accent text-white px-2 py-1 rounded shadow-md border border-white/10">
              Pronta Entrega
            </span>
          )}
          {product.category === "kit" && (
            <span className="text-[9px] font-bold uppercase bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">
              Conjunto/Kit
            </span>
          )}
        </div>
      </div>

      {/* INFO DO PRODUTO */}
      <div className="p-4 flex flex-col flex-1 relative bg-navy-light">
        <div
          onClick={() => onSelectProduct(product)}
          className="cursor-pointer flex-1"
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-white/50 mb-3 line-clamp-1">
            {product.collection || "Coleção Oficial"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary">
              R$ {Number(product.price).toFixed(0)}
            </span>
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const CatalogScreen = ({ onNavigate, onSelectProduct, cartItems = [] }) => {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca dados do Supabase
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

  // --- VERIFICAR ESTOQUE (NOVA FUNÇÃO) ---
  const checkStockVisibility = (product) => {
    // Se for Encomenda (NÃO é pronta entrega), mostra sempre
    if (!product.pronta_entrega && !product.is_pronta_entrega) return true;

    // Se for Pronta Entrega mas não tem dados de estoque, esconde
    if (!product.stock) return false;

    // Varre o JSON de estoque procurando algum número maior que 0
    const categories = Object.values(product.stock);
    for (const cat of categories) {
      const quantities = Object.values(cat);
      if (quantities.some((q) => q > 0)) return true;
    }

    // Se chegou aqui, tudo é 0. Esconde o produto.
    return false;
  };

  // Filtragem (Busca + Categoria)
  // --- FILTRAGEM ATUALIZADA ---
  const filteredProducts = products.filter((product) => {
    // 1. Verifica se tem estoque (se for pronta entrega)
    if (!checkStockVisibility(product)) return false;

    // 2. Filtros normais (Categoria e Busca)
    const matchesCategory =
      activeCategory === "todos" ? true : product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-navy pb-24 font-outfit text-white">
      {/* Header Padrão */}
      <Header
        title="Catálogo"
        showCart
        cartCount={cartItems.length}
        onCart={() => onNavigate("cart")}
        showBack={false} // Sem botão voltar na tela principal do catálogo
        
        logoSrc={logoAzul} // Usa a imagem do "N" azul
        logoSize="h-12 w-auto ml-1.5"
      />

      <div className="pt-24 px-5 space-y-6">
        {/* --- BARRA DE BUSCA --- */}
        <div className="flex gap-3 animate-fade-in">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar uniformes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 h-12 text-sm bg-navy-light/50 border-white/10 focus:border-primary/50"
            />
          </div>
        </div>

        {/* --- FILTROS (CATEGORIAS) --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar animate-slide-up">
          {[
            { id: "todos", label: "Todos" },
            { id: "kit", label: "Kits" },
            { id: "unit", label: "Peças" },
            // Você pode adicionar mais categorias se tiver no banco
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border
                ${
                  activeCategory === cat.id
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* --- GRID DE PRODUTOS --- */}
        <div>
          {loading ? (
            // Skeleton Loading (Premium)
            <div className="grid grid-cols-2 gap-4">
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
            // Estado Vazio
            <div className="text-center py-20 opacity-50 flex flex-col items-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-white/40" />
              </div>
              <p>Nenhum produto encontrado.</p>
              <button
                onClick={() => {
                  setActiveCategory("todos");
                  setSearchTerm("");
                }}
                className="mt-4 text-primary text-sm font-bold"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            // Lista Real
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
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
