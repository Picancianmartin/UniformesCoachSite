import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  CreditCard,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Wind,
  Award,
  Play,
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import logodavid from "../assets/logodavid.png";

const HomeScreen = ({ onNavigate, cartItems = [] }) => {
  const [storyOpen, setStoryOpen] = useState(false);

  // // Lista de produtos (Mantida)
  // const featuredProducts = [
  //   { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", name: "Kit Pro" },
  //   { id: 2, image: "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?q=80&w=1000&auto=format&fit=crop", name: "Regata Wine" },
  //   { id: 3, image: "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?q=80&w=1000&auto=format&fit=crop", name: "Dry Fit" },
  // ];

  const brandStory = {
    intro:
      "O beach tennis foi o ponto de partida. Inspirados na leveza e na energia do esporte, criamos uma marca que traduz movimento.",
    concept:
      "A linha tracejada do logo não é aleatória: ela segue as medidas da quadra e representa as 'zonas de jogo'. Do básico à alta performance, conectamos técnica e emoção.",
    symbol:
      "O símbolo central nasce da letra hebraica 'Hei' (vida e propósito). Adaptamos sua forma para transmitir a fluidez de uma jogada vencedora.",
  };

  return (
    <div className="bg-navy min-h-screen font-outfit text-white pb-32 lg:pb-8">
      <Header
        logoSrc={logodavid}
        showCart
        cartCount={cartItems.length}
        onCart={() => onNavigate("cart")}
        showAccount
        onAccount={() => onNavigate("account")}
      />

      <div className="pt-24 px-5 lg:px-8 lg:max-w-6xl lg:mx-auto space-y-10 animate-fade-in">
        {/* --- 1. HERO SECTION: Foco na Ação --- */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 p-8 text-center group">
          {/* Efeitos de Fundo */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/30 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={10} /> Nova Coleção 2026
            </div>

            <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              FAÇA PARTE <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                DESSE TIME
              </span>
            </h1>

            <button
              onClick={() => onNavigate("catalog")}
              className="w-full lg:w-auto lg:px-12 py-3 bg-white text-navy rounded-2xl font-bold text-md hover:scale-[1.02] active:scale-95 transition-all  flex items-center justify-center gap-3"
            >
              Acessar Loja <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* --- 2. BRAND STORY: O "Porquê" (UI Melhorada) --- */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
              O DNA da Marca
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>

          <div
            onClick={() => setStoryOpen(!storyOpen)}
            className={`
    relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer
    ${storyOpen ? "bg-navy-light/30 border-primary/50" : "bg-navy-light/40 border-white/5 hover:bg-navy-light/50"}
  `}
          >
            {/* Cabeçalho do Card */}
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Activity size={24} />
                </div>
                <div
                  className={`p-2 rounded-full transition-transform duration-300 ${storyOpen ? "rotate-180 bg-white/10" : "bg-transparent"}`}
                >
                  <ChevronDown size={20} className="text-white/50" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Mais que um logo. <br />
                <span className="text-primary">Um propósito.</span>
              </h3>

              <p className="text-md text-white/70 leading-relaxed">
                {brandStory.intro}
              </p>
            </div>

            {/* Conteúdo Expandido (Com Animação) */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${storyOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="px-6 pb-8 pt-0 space-y-6">
                {/* Divisor Visual (Linha da Quadra) */}
                <div className="w-full h-0.5 bg-white/10 border-t border-dashed border-white/30 my-4" />

                {/* Seção 1: O Tracejado */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-accent">
                    <Wind size={20} />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-white mb-1">
                      A Quadra no Traço
                    </h4>
                    <p className="text-md text-white/60 leading-relaxed">
                      {brandStory.concept}
                    </p>
                  </div>
                </div>

                {/* Seção 2: O Símbolo */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-accent">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-white mb-1">
                      Símbolo "Hei"
                    </h4>
                    <p className="text-md text-white/60 leading-relaxed">
                      {brandStory.symbol}
                    </p>
                  </div>
                </div>

                {/* Botão de Fechar Sutil */}
                <div className="pt-4 flex justify-center">
                  <button className="text-[10px] uppercase font-bold text-white/30 flex items-center gap-1 hover:text-white transition-colors">
                    <ChevronUp size={12} /> Recolher História
                  </button>
                </div>
              </div>
            </div>

            {/* Efeito de Fundo quando aberto */}
          </div>
        </div>

        {/* --- 3. COMO FUNCIONA (Botões de Navegação) --- */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Shirt,
                title: "1. Escolha",
                desc: "Ir ao Catálogo",
                route: "catalog", // <--- Verifica se o nome da sua tela principal é 'catalog' ou 'home'
              },
              {
                icon: CreditCard,
                title: "2. Pague",
                desc: "Ver Carrinho",
                route: "cart",
              },
              {
                icon: CheckCircle,
                title: "3. Retire",
                desc: "Meus Pedidos",
                route: "account",
              },
            ].map((step, i) => (
              <button
                key={i}
                onClick={() => onNavigate(step.route)}
                className="group bg-white/5 rounded-2xl p-3 py-4 text-center border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 active:scale-95 cursor-pointer relative overflow-hidden"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center text-primary border border-white/10 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner">
                  <step.icon size={18} />
                </div>

                <div className="relative z-10">
                  <p className="font-bold text-xs text-white mb-1 group-hover:text-primary transition-colors">
                    {step.title}
                  </p>
                  <p className="text-[10px] text-white/40 leading-tight group-hover:text-white/60 transition-colors">
                    {step.desc}
                  </p>
                </div>

                {/* Efeito visual extra no hover (brilho suave) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            ))}
          </div>
        </div>

        
        {/* --- 4. MINI VITRINE (Visual Clean) --- */}
        <div>
          {/* <div className="flex justify-between items-end mb-5 px-1">
            <div>
               <h2 className="text-lg font-bold text-white">Destaques</h2>
               <p className="text-xs text-white/50">Os favoritos da galera</p>
            </div>
            <button
              onClick={() => onNavigate("catalog")}
              className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase hover:underline"
            >
              Ver tudo <Play size={8} className="fill-current"/>
            </button>
          </div> */}

          {/* <div className="grid grid-cols-3 gap-3">
            {featuredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onNavigate("catalog")}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-navy-light border border-white/5 active:scale-95 transition-all shadow-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-0 w-full text-center px-1">
                  <span className="text-[10px] font-bold text-white tracking-wide block">
                    {product.name}
                  </span>
                </div>
              </button>
            ))}
          </div> */}
        </div>
      </div>

      <BottomNav
        active="home"
        onNavigate={onNavigate}
        cartCount={cartItems.length}
      />
    </div>
  );
};

export default HomeScreen;
