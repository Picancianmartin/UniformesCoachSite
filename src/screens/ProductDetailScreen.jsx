import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Ruler,
} from "lucide-react";
import SizeGuideModal from "../components/SizeGuideModal";

const ProductDetailScreen = ({ onNavigate, onAddToCart, product }) => {
  const [sizeTop, setSizeTop] = useState(null);
  const [sizeBottom, setSizeBottom] = useState(null);
  const [sizeStandard, setSizeStandard] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Refs para controle de scroll otimizado
  const scrollRef = useRef(null);
  const scrollTimeout = useRef(null);

  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG", "G1", "G2", "G3"];

  // --- LÓGICA OTIMIZADA DE SCROLL (Para não travar) ---
  const handleScroll = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setActiveImageIndex(index);
      }
    }, 50);
  };

  // --- LÓGICA DE DADOS ---
  const getAvailableSizes = (type) => {
    const isPE = product.pronta_entrega || product.is_pronta_entrega || product.is_ready;
    if (!isPE) return ALL_SIZES;
    const stockData = product.stock?.[type];
    if (!stockData) return [];
    return ALL_SIZES.filter((size) => stockData[size] && stockData[size] > 0);
  };

  const productImages = (() => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (typeof product.images === "string" && product.images.trim().length > 0)
      return product.images.split(/[,\n]/).map((img) => img.trim());
    if (product.image) return [product.image];
    return [];
  })();

  const isKit = product.category === "kit" || product.category === "kits";
  const canAdd = isKit ? sizeTop && sizeBottom : sizeStandard;

  const handleAdd = () => {
    if (!canAdd) return;
    const selectedSizes = isKit
      ? { top: sizeTop, bottom: sizeBottom }
      : { standard: sizeStandard };

    onAddToCart({ ...product, isKit, selectedSizes });
  };

  // Helper de Estilo Original
  const getSizeButtonStyle = (isSelected, isAvailable) => `
    min-w-[3rem] h-12 px-2 rounded-xl font-bold text-sm flex items-center justify-center 
    transition-all duration-200 border-2
    ${
      !isAvailable 
        ? "border-white/5 text-white/10 bg-white/5 cursor-not-allowed line-through opacity-50"
        : isSelected
          ? "border-primary text-primary shadow-[0_0_15px_rgba(0,123,186,0.4)] bg-primary/5 scale-105"
          : "border-white/10 text-white/40 hover:border-white/30 hover:text-white bg-transparent"
    }
  `;

  const optionsTop = getAvailableSizes("top");
  const optionsBottom = getAvailableSizes("bottom");
  const optionsStandard = getAvailableSizes("standard");
  const isAvailable = (size, options) => options.includes(size);

  return (
    <div className="min-h-screen bg-navy font-outfit text-white pb-24 relative">
      
      {/* --- HERO SECTION (IMAGEM ORIGINAL) --- */}
      <div className="relative h-[55vh] lg:h-[60vh] w-full lg:max-w-6xl lg:mx-auto bg-navy-light group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {productImages.length > 0 ? (
            productImages.map((img, index) => (
              <div
                key={index}
                className="w-full h-full flex-shrink-0 snap-center relative"
              >
                <img
                  src={img}
                  alt={`${product.name} ${index}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradiente original */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-90" />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-navy-light text-white/20">
              <ShoppingBag size={48} />
            </div>
          )}
        </div>

        {/* Botão Voltar Original */}
        <button
          onClick={() => onNavigate("catalog")}
          className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Indicadores */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2 z-20">
            {productImages.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full h-1.5 shadow-sm ${i === activeImageIndex ? "w-6 bg-primary" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        )}

        {/* Info Produto (Título e Preço SOBRE a imagem, como no original) */}
        <div className="absolute -bottom-px left-0 w-full p-6 z-10 pointer-events-none">
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <span className="bg-primary/20 border border-primary/30 text-primary-light text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md">
              {product.collection || "Coleção Oficial"}
            </span>
            {(product.pronta_entrega || product.is_ready) && (
              <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                <ShieldCheck size={10} /> Pronta Entrega
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-1 drop-shadow-lg">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-primary drop-shadow-md">
            R$ {Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="px-6 lg:px-8 lg:max-w-6xl lg:mx-auto pt-10 space-y-8">
        {/* --- SELETORES DE TAMANHO --- */}
        <div className="space-y-6">
          {isKit ? (
            /* --- KIT --- */
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                    Parte de Cima
                  </h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {ALL_SIZES.map((s) => {
                    const avail = isAvailable(s, optionsTop);
                    return (
                      <button
                        key={s}
                        disabled={!avail && (product.pronta_entrega || product.is_ready)} 
                        onClick={() => setSizeTop(s)}
                        className={getSizeButtonStyle(sizeTop === s, !product.pronta_entrega && !product.is_ready ? true : avail)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                    Parte de Baixo
                  </h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {ALL_SIZES.map((s) => {
                    const avail = isAvailable(s, optionsBottom);
                    return (
                      <button
                        key={s}
                        disabled={!avail && (product.pronta_entrega || product.is_ready)}
                        onClick={() => setSizeBottom(s)}
                        className={getSizeButtonStyle(sizeBottom === s, !product.pronta_entrega && !product.is_ready ? true : avail)}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* --- PEÇA ÚNICA --- */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                  Tamanho
                </h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {ALL_SIZES.map((s) => {
                  const avail = isAvailable(s, optionsStandard);
                  return (
                    <button
                      key={s}
                      disabled={!avail && (product.pronta_entrega || product.is_ready)}
                      onClick={() => setSizeStandard(s)}
                      className={getSizeButtonStyle(sizeStandard === s, !product.pronta_entrega && !product.is_ready ? true : avail)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GUIA DE MEDIDAS */}
          <button
            onClick={() => setShowSizeGuide(true)}
            className="text-[10px] text-white/40 underline flex items-center gap-1 hover:text-white transition-colors"
          >
            <Ruler size={12} /> Guia de medidas
          </button>
        </div>
      </div>

      {/* --- FOOTER FIXO --- */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-navy/95 backdrop-blur-xl border-t border-white/10 z-30 safe-area-bottom lg:pl-20">
        <div className="max-w-[428px] lg:max-w-6xl mx-auto">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`
                w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg
                ${
                  canAdd
                    ? "bg-primary hover:brightness-110 text-white shadow-primary/25 active:scale-95"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }
              `}
          >
            <ShoppingBag size={20} />
            {canAdd ? "Adicionar à Sacola" : "Selecione os tamanhos"}
          </button>
        </div>
      </div>

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />
    </div>
  );
};

export default ProductDetailScreen;