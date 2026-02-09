import GlassCard from '../components/ui/GlassCard'

const Home = () => {
  return (
    <div className="min-h-screen bg-navy text-white relative overflow-hidden">
      {/* Radial background "blobs" */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/topography.svg')] bg-cover" />
      </div>

      <div className="relative z-10 px-5 pt-6 pb-32">
        {/* HERO GLASS CARD */}
        <GlassCard className="text-center py-6 px-4 mb-6">
          <img src="/logo.svg" alt="Coach David Sousa" className="mx-auto mb-2 w-12" />
          <h1 className="text-2xl font-semibold">Coach David Sousa</h1>
          <p className="text-sm text-secondary mb-4">Beach Tennis Apparel</p>
          <button className="bg-primary text-white w-full py-2 rounded-xl font-medium hover:scale-95 transition">
            Encomendar Agora
          </button>
        </GlassCard>

        {/* COMO FUNCIONA */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Como Funciona</h2>
          <ul className="text-sm text-white/80 leading-relaxed space-y-1">
            <li>1. Escolha seus itens</li>
            <li>2. Pague com PIX ou na retirada</li>
            <li>3. Produção & Entrega</li>
          </ul>
        </div>

        {/* PREORDER GLASS CARD */}
        <GlassCard>
          <p className="text-sm">
            <span className="text-white/80">Pedidos abertos até </span>
            <strong className="text-white">15/05</strong>
          </p>
          <p className="text-xs mt-1">
            <span className="text-accent font-medium">Faltam 12 pedidos</span> para iniciar a produção
          </p>

          <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: '60%' }}></div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 px-6 py-3 rounded-full shadow-glass flex gap-8">
          <NavItem icon="🏠" label="Início" active />
          <NavItem icon="🛍️" label="Shop" />
          <NavItem icon="👤" label="Perfil" />
        </div>
      </div>
    </div>
  )
}

const NavItem = ({ icon, label, active }) => (
  <div className={`flex flex-col items-center text-xs ${active ? 'text-white' : 'text-white/50'}`}>
    <div className="text-lg">{icon}</div>
    <span>{label}</span>
  </div>
)

export default Home
