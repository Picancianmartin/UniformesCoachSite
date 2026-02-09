import React from 'react';

const ProductCard = ({ produto, onClick }) => {
  // Tratamento de segurança para evitar o erro se o dado faltar
  const price = produto.price || produto.preco || 0;
  const name = produto.name || produto.nome || "Produto sem nome";
  const image = produto.image || produto.img || "https://placehold.co/400x500/1a1a1a/white?text=Sem+Imagem";
  const tags = produto.tags || [];
  const collection = produto.collection || produto.colecao || "";

  return (
    <div 
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-all hover:border-primary/50 group relative"
    >
      {/* Imagem com Aspect Ratio fixo */}
      <div className="aspect-[4/5] relative bg-navy-light w-full">
         <img 
           src={image} 
           alt={name} 
           className="w-full h-full object-cover" 
           loading="lazy"
         />
         
         {/* Tag de Destaque (se houver) */}
         {tags.length > 0 && (
            <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-white border border-white/10 shadow-sm">
                {tags[0]}
            </span>
         )}
      </div>
      
      {/* Informações */}
      <div className="p-3">
         <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight min-h-[2.5em]">
            {name}
         </h3>
         
         <div className="flex justify-between items-end mt-2">
           <div>
             <p className="text-[10px] text-white/40 capitalize">
                {collection.replace('_', ' ')}
             </p>
             <p className="text-primary font-bold text-base">
                R$ {Number(price).toFixed(2).replace('.', ',')}
             </p>
           </div>
           
           {/* Botão "+" Visual */}
           <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 group-hover:bg-primary group-hover:text-white transition-colors">
             +
           </div>
         </div>
      </div>
    </div>
  );
};

export default ProductCard;