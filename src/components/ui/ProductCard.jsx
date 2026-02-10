import React, { useState, useRef, useMemo } from "react";
import { Plus, ShoppingBag } from "lucide-react";

const ProductCard = ({ product, onClick }) => {
  // Recebendo 'product' e 'onClick'
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef(null);

  // --- 1. LÓGICA DE DADOS BLINDADA ---
  const name = product.name || product.nome || "Produto sem nome";
  const price = product.price || product.preco || 0;
  const collection = product.collection || product.colecao || "Coleção Oficial";

  // Verifica Pronta Entrega (checa várias possibilidades de nome de coluna)
  const isProntaEntrega =
    product.is_ready === true ||
    product.pronta_entrega === true ||
    product.stock_status === "ready";

  // Verifica Categoria (Se o banco falhar, tenta achar "Kit" no nome do produto)
  const categoryRaw = (
    product.category ||
    product.categoria ||
    ""
  ).toLowerCase();
  const nameLower = name.toLowerCase();

  const isKit =
    categoryRaw.includes("kit") ||
    categoryRaw.includes("conjunto") ||
    nameLower.includes("kit ") || // Procura "Kit" no nome
    nameLower.includes("conjunto");

  const isPecaUnica =
    categoryRaw === "unit" ||
    categoryRaw === "peça" ||
    categoryRaw === "peca" ||
    categoryRaw === "avulso";

  // --- 2. LÓGICA DE IMAGEM (CARROSSEL) ---
  const images = useMemo(() => {
    const mainImage = product.image || product.img;
    const gallery = product.images || [];

    if (!mainImage && gallery.length === 0) return [];

    if (mainImage) {
      const combined = [
        mainImage,
        ...gallery.filter((img) => img !== mainImage),
      ];
      // Se tiver só 1 foto, repete ela para manter o visual bonito (opcional)
      return combined.length === 1 ? Array(3).fill(combined[0]) : combined;
    }
    return gallery;
  }, [product.image, product.img, product.images]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      setActiveImage(index);
    }
  };

  return (
    <div className="bg-navy-light rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-full group animate-fade-in relative">
      {/* --- ÁREA DA IMAGEM --- */}
      <div className="relative aspect-[4/5] bg-navy">
        {/* Scroll das Imagens */}
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
                onClick={() => onClick && onClick(product)}
              >
                <img
                  src={img}
                  alt={`${name} ${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60" />
              </div>
            ))
          ) : (
            <div
              onClick={() => onClick && onClick(product)}
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

        {/* --- BADGES / TAGS CORRIGIDAS --- */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20 items-start pointer-events-none">
          {/* TAG DE STATUS (Sempre mostra uma) */}
          {isProntaEntrega ? (
            <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-2 py-1 rounded shadow-md border border-white/10">
              Pronta Entrega
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase bg-blue-600/90 backdrop-blur-md text-white px-2 py-1 rounded shadow-md border border-white/10">
              Encomenda
            </span>
          )}

          {/* TAG DE TIPO (Kit ou Peça) */}
          {isKit && (
            <span className="top-2 right-0 text-[6px] font-bold uppercase bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10 shadow-sm">
              Kit / Conjunto
            </span>
          )}

          {isPecaUnica && (
            <span className="text-[6px] font-bold uppercase bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10 shadow-sm">
              Peça Única
            </span>
          )}
        </div>
      </div>

      {/* --- INFO DO PRODUTO --- */}
      <div className="p-4 flex flex-col flex-1 relative bg-navy-light">
        <div
          onClick={() => onClick && onClick(product)}
          className="cursor-pointer flex-1"
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
              {name}
            </h3>
          </div>

          <p className="text-xs text-white/50 mb-3 line-clamp-1">
            Coleção: <span className="text-white/70">{collection}</span>
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-base font-bold text-primary">
              R$ {Number(price).toFixed(0)}
            </span>
          </div>

          <button
            onClick={() => onClick && onClick(product)}
            className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
