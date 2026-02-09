import React, { useState } from "react";
import { X, Ruler } from "lucide-react";

const SizeGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("masculino"); // 'masculino' ou 'feminino'

  if (!isOpen) return null;

  // Dados extraídos da sua imagem
  const data = {
    masculino: [
      { size: "PP", comp: 66, torax: 47.5, manga: 20.5 },
      { size: "P",  comp: 68, torax: 50,   manga: 21.5 },
      { size: "M",  comp: 70, torax: 53,   manga: 22 },
      { size: "G",  comp: 72, torax: 56,   manga: 23 },
      { size: "GG", comp: 74, torax: 58.5, manga: 24 },
      { size: "G1", comp: 76, torax: 60,   manga: 25 },
      { size: "G2", comp: 78, torax: 63,   manga: 25 },
      { size: "G3", comp: 80, torax: 66,   manga: 25.5 },
    ],
    feminino: [
      { size: "PP", comp: 57, torax: 40,   manga: 12 },
      { size: "P",  comp: 59, torax: 43,   manga: 13 },
      { size: "M",  comp: 61, torax: 46,   manga: 13 },
      { size: "G",  comp: 63, torax: 49,   manga: 13 },
      { size: "GG", comp: 65, torax: 52,   manga: 13.5 },
      { size: "G1", comp: 67, torax: 55,   manga: 14 },
      { size: "G2", comp: 69, torax: 57,   manga: 14 },
      { size: "G3", comp: 70, torax: 60,   manga: 14 },
    ]
  };

  const currentData = activeTab === "masculino" ? data.masculino : data.feminino;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
               <Ruler size={16} />
            </div>
            <h3 className="text-lg font-bold text-white">Guia de Medidas</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex p-2 gap-2 bg-black/20">
           <button 
             onClick={() => setActiveTab("masculino")}
             className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "masculino" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:bg-white/5"}`}
           >
             Masculina
           </button>
           <button 
             onClick={() => setActiveTab("feminino")}
             className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "feminino" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:bg-white/5"}`}
           >
             Baby Look Fem.
           </button>
        </div>

        {/* Tabela com Scroll */}
        <div className="overflow-y-auto p-4 flex-1">
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-white/60 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-3 text-center">Tam.</th>
                  <th className="px-3 py-3 text-center">Comp.</th>
                  <th className="px-3 py-3 text-center">Tórax</th>
                  <th className="px-3 py-3 text-center">Manga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.map((row) => (
                  <tr key={row.size} className="hover:bg-white/5 transition-colors text-white/80">
                    <td className="px-3 py-3 text-center font-bold text-white bg-white/5">{row.size}</td>
                    <td className="px-3 py-3 text-center">{row.comp}</td>
                    <td className="px-3 py-3 text-center">{row.torax}</td>
                    <td className="px-3 py-3 text-center">{row.manga}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-white/40 mt-4 text-center">
            * Medidas em centímetros (cm). Pode haver pequena variação.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SizeGuideModal;