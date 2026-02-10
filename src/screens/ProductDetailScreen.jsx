import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Ruler,
  Share2, // Adicionei ícone de compartilhar para equilibrar o header
} from "lucide-react";
import SizeGuideModal from "../components/SizeGuideModal";

const ProductDetailScreen = ({ onNavigate, onAddToCart, product }) => {
  const [sizeTop, setSizeTop] = useState(null);
  const [sizeBottom, setSizeBottom] = useState(null);
  const [sizeStandard, setSizeStandard] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef(null);

  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG", "G1", "G2", "G3"];

  // --- LÓGICA DE ESTOQUE ---
  const getAvailableSizes = (type) => {
    const isPE =
      product.pronta_entrega || product.is_pronta_entrega || product.is_ready;
    if (!isPE) return ALL_SIZES;

    const stockData = product.stock?.[type];
    if (!stockData) return [];

    return ALL_SIZES.filter((size) => stockData[size] && stockData[size] > 0);
  };

  // --- LÓGICA DE IMAGENS ---
  const productImages = (() => {
    if (Array.isArray(product.images) && product.images.length > 0)
      return product.images;
    if (typeof product.images === "string" && product.images.trim().length > 0)
      return product.images.split(/[,\n]/).map((img) => img.trim());
    if (product.image) return [product.image];
    return [];
  })();

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActiveImageIndex(index);
    }
  };

  const isKit = product.category === "kit" || product.category === "kits";
  const canAdd = isKit ? sizeTop && sizeBottom : sizeStandard;

  const handleAdd = () => {
    if (!canAdd) return;
    const selectedSizes = isKit
      ? { top: sizeTop, bottom: sizeBottom }
      : { standard: sizeStandard };

    onAddToCart({
      ...product,
      isKit: isKit,
      selectedSizes: selectedSizes,
    });
  };

  // Helper de Estilo dos Botões
  // Adicionei feedback visual para tamanhos indisponíveis (riscado/opaco)
  const getSizeButtonStyle = (isSelected, isAvailable) => `
    min-w-[3.5rem] h-12 rounded-xl font-bold text-sm flex items-center justify-center 
    transition-all duration-300 border
    ${
      !isAvailable
        ? "border-white/5 text-white/10 bg-white/5 cursor-not-allowed line-through opacity-50"
        : isSelected
        ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-105"
        : "border-white/10 text-white/60 hover:border-white/30 hover:text-white bg-navy-light/50"
    }
  `;

  const optionsTop = getAvailableSizes("top");
  const optionsBottom = getAvailableSizes("bottom");
  const optionsStandard = getAvailableSizes("standard");
  const isAvailable = (size, options) => options.includes(size);

  return (
    // Z-INDEX ALTO (z-50) e BG OPACADO: Isso garante que essa tela cubra o Footer Global
    <div className="fixed inset-0 z-50 bg-navy font-outfit text-white overflow-y-auto animate-fade-in no-scrollbar">
      
      {/* --- HEADER FLUTUANTE --- */}
      <div className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => onNavigate("catalog")}
          className="w-10 h-10 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all pointer-events-auto shadow-lg active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex gap-3 pointer-events-auto">
            
            
        </div>
      </div>

      {/* --- ÁREA DA IMAGEM --- */}
      <div className="relative h-[55vh] w-full bg-navy-light">
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
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-navy-light text-white/20">
              <ShoppingBag size={48} />
            </div>
          )}
        </div>

        {/* Indicadores (Dots) */}
        {productImages.length > 1 && (
          <div className="absolute bottom-8 left-0 w-full flex justify-center gap-2 z-20">
            {productImages.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full h-1.5 shadow-sm ${
                  i === activeImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- CONTEÚDO (SHEET) --- */}
      {/* Design moderno: sobe por cima da imagem com bordas arredondadas */}
      <div className="relative -mt-6 bg-navy rounded-t-[2.5rem] border-t border-white/10 px-6 pt-8 pb-40 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] min-h-[50vh]">
        
        {/* "Puxador" visual */}
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />

        {/* --- TÍTULO E PREÇO --- */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {product.collection || "Coleção Oficial"}
            </span>
            {(product.pronta_entrega || product.is_ready) && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck size={10} /> Pronta Entrega
              </span>
            )}
          </div>

          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {product.name}
            </h1>
            <div className="shrink-0 pt-1">
              <p className="text-2xl font-bold text-primary whitespace-nowrap">
                R$ {Number(product.price).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/5 mb-8" />

        {/* --- SELETORES DE TAMANHO --- */}
        <div className="space-y-8">
          {isKit ? (
            <>
              {/* TOP */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white/90">
                    Parte de Cima
                  </h3>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] text-white/50 underline flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Ruler size={12} /> Medidas
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {ALL_SIZES.map((s) => {
                    const avail = isAvailable(s, optionsTop);
                    // Se for encomenda, mostra tudo. Se for pronta entrega e não tiver, mostra riscado.
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

              {/* BOTTOM */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white/90">
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
            /* PEÇA ÚNICA */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white/90">
                  Selecione o Tamanho
                </h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[10px] text-white/50 underline flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Ruler size={12} /> Guia de medidas
                </button>
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
        </div>
      </div>

      {/* --- ACTION FOOTER (FIXO) --- */}
      {/* Esse footer é exclusivo desta tela e fica fixo no fundo */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-navy/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center gap-6">
          
          {/* Total (Esquerda) */}
          <div className="flex flex-col shrink-0">
             <span className="text-xs text-white/50 mb-0.5 uppercase tracking-wide">
               Total
             </span>
             <span className="text-2xl font-bold text-white">
               R$ {Number(product.price).toFixed(0)}
             </span>
          </div>

          {/* Botão (Direita) */}
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`
              flex-1 h-14 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/25 active:scale-95 transition-all
              ${!canAdd && "opacity-50 cursor-not-allowed bg-white/10 text-white/30 shadow-none hover:bg-white/10"}
            `}
          >
            <ShoppingBag size={20} />
            {canAdd ? "Adicionar" : "Selecione"}
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