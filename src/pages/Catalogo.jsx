import ProductCard from "../components/ui/ProductCard"
import FilterChips from "../components/FilterChips"
import GlassCard from "../components/ui/GlassCard"
import { useState } from "react"

const Catalogo = () => {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    collection: null,
    type: null,
    gender: null,
    size: null,
  })

  const produtos = [
    {
      id: 1,
      nome: "Regata Feminina",
      preco: 89,
      img: "/images/regata-wine.jpg",
      tags: ["Pré-venda"],
      colecao: "wine",
      tipo: "top",
      genero: "feminino",
    },
    {
      id: 2,
      nome: "Kit Masculino",
      preco: 169,
      img: "/images/kit-preto-ciano.jpg",
      tags: ["Kit", "Mais Pedidos"],
      colecao: "black_cyan",
      tipo: "kit",
      genero: "masculino",
    },
    // ... outros produtos
  ]

  // Filtros ativos
  const filtrados = produtos.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
    const matchCollection = !filters.collection || p.colecao === filters.collection
    const matchType = !filters.type || p.tipo === filters.type
    const matchGender = !filters.gender || p.genero === filters.gender
    return matchSearch && matchCollection && matchType && matchGender
  })

  return (
    <div className="bg-navy min-h-screen text-white px-4 py-5 pb-24 relative">
      {/* Pesquisa */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/10 border border-white/20 py-2 px-4 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Filtros */}
      <FilterChips
        label="Coleção"
        options={[
          { label: "Wine", value: "wine" },
          { label: "Preto/Off", value: "black_off" },
          { label: "Preto/Ciano", value: "black_cyan" },
        ]}
        selected={filters.collection}
        onSelect={(val) => setFilters({ ...filters, collection: val })}
      />
      <FilterChips
        label="Tipo"
        options={[
          { label: "Tops", value: "top" },
          { label: "Bottoms", value: "bottom" },
          { label: "Kits", value: "kit" },
        ]}
        selected={filters.type}
        onSelect={(val) => setFilters({ ...filters, type: val })}
      />
      <FilterChips
        label="Gênero"
        options={[
          { label: "Feminino", value: "feminino" },
          { label: "Masculino", value: "masculino" },
          { label: "Unissex", value: "unissex" },
        ]}
        selected={filters.gender}
        onSelect={(val) => setFilters({ ...filters, gender: val })}
      />

      {/* Lista de Produtos */}
      <div className="grid gap-4 mt-4">
        {filtrados.length > 0 ? (
          filtrados.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))
        ) : (
          <GlassCard className="text-center text-sm text-white/60">Nenhum produto encontrado.</GlassCard>
        )}
      </div>
    </div>
  )
}

export default Catalogo
