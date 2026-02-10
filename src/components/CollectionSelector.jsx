import React, { useState, useEffect } from "react";
import { Plus, X, Loader } from "lucide-react";
import { supabase } from "../services/supabase"; // Ajuste o caminho do seu supabase

const CollectionSelector = ({ value, onChange }) => {
  const [existingCollections, setExistingCollections] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Busca as coleções já existentes no banco ao carregar
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Busca apenas a coluna collection
        const { data, error } = await supabase
          .from("products")
          .select("collection");

        if (error) throw error;

        // Filtra duplicados e valores nulos
        const uniqueCollections = [
          ...new Set(data.map((item) => item.collection).filter((c) => c !== null && c !== "")),
        ];

        setExistingCollections(uniqueCollections);
      } catch (error) {
        console.error("Erro ao buscar coleções:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-white/80">
        Coleção
      </label>

      <div className="flex gap-2">
        {isCreatingNew ? (
          // --- MODO CRIAÇÃO (INPUT DE TEXTO) ---
          <div className="flex-1 relative animate-fade-in">
            <input
              type="text"
              placeholder="Digite o nome da nova coleção..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-12 bg-navy-light border border-primary text-white px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            {/* Botão Cancelar (X) para voltar ao Select */}
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                onChange(""); // Limpa ou reseta se quiser
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-red-400 transition-colors"
              title="Cancelar nova coleção"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          // --- MODO SELEÇÃO (DROPDOWN) ---
          <div className="flex-1 relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-12 bg-navy-light border border-white/10 text-white px-4 rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer"
              disabled={loading}
            >
              <option value="">Selecione uma coleção...</option>


              {loading ? (
                <option >Carregando...</option>

              ) : (
                existingCollections.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                  
                  
                ))
              )}
            </select>
          </div>
        )}

        {/* --- BOTÃO DE ADICIONAR (+) --- */}
        {!isCreatingNew && (
          <button
            type="button"
            onClick={() => {
              setIsCreatingNew(true);
              onChange(""); // Limpa o valor atual para digitar o novo
            }}
            className="w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20"
            title="Criar nova coleção"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
      
      {/* Feedback visual */}
      {isCreatingNew && (
        <p className="text-xs text-primary mt-1">
          * Digite o nome da nova coleção. Ela será salva ao cadastrar o produto.
        </p>
      )}
    </div>
  );
};

export default CollectionSelector;