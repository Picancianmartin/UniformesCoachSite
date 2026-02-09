import React from 'react';
import { TrendingUp, ShoppingBag, Layers, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const AdminDashboard = ({ orders = [], onNavigateToTab }) => {
  
  // --- 1. CÁLCULOS DE PEDIDOS (A Nova Lógica) ---
  
  // Ignoramos pedidos cancelados para não sujar a estatística
  const validOrders = orders.filter(o => o.status !== 'Cancelado');
  
  const totalOrders = validOrders.length;
  
  // Pedidos Concluídos (Consideramos 'Entregue' como finalizado)
  const completedOrders = validOrders.filter(o => o.status === 'Entregue').length;
  
  // Pedidos em Aberto (Tudo que não foi entregue ainda)
  const openOrdersCount = totalOrders - completedOrders;

  // Porcentagem de Eficiência (Quantos % já foram entregues)
  const percentage = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // --- 2. CÁLCULOS FINANCEIROS (Para os cards menores) ---
  const totalRevenue = orders
    .filter(o => o.status === 'Pago' || o.status === 'Entregue')
    .reduce((acc, order) => acc + (Number(order.total) || 0), 0);
  
  // Itens na fila de produção (status exato 'Em Produção')
  let productionItemsCount = 0;
  orders.forEach(order => {
    if (order.status === 'Em Produção') {
      order.items.forEach(item => productionItemsCount += (item.quantity || 0));
    }
  });

  // --- CONFIGURAÇÃO VISUAL DO ANEL ---
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* --- SEÇÃO 1: O ANEL DE FLUXO DE PEDIDOS --- */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center relative overflow-hidden border border-white/10">
        
        {/* Cabeçalho do Card */}
        <div className="w-full flex justify-between items-start mb-4 z-10">
           <div>
             <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Fluxo de Entregas</h3>
             <p className="text-xs text-white/30">Total: {totalOrders} pedidos válidos</p>
           </div>
           {/* Ícone muda de cor se tiver muita coisa em aberto */}
           <div className={`p-2 rounded-lg ${openOrdersCount > 5 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
             {openOrdersCount > 5 ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
           </div>
        </div>

        {/* O Gráfico Circular (SVG) */}
        <div className="relative w-48 h-48 flex items-center justify-center z-10">
           <svg className="w-full h-full transform -rotate-90">
             {/* Fundo do anel */}
             <circle
               cx="50%" cy="50%" r={radius}
               stroke="currentColor" strokeWidth="12" fill="transparent"
               className="text-white/5"
             />
             {/* Progresso */}
             <circle
               cx="50%" cy="50%" r={radius}
               stroke="url(#gradient)" strokeWidth="12" fill="transparent"
               strokeDasharray={circumference}
               strokeDashoffset={strokeDashoffset}
               strokeLinecap="round"
               className="transition-all duration-1000 ease-out"
             />
             <defs>
               <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#007BBA" />   {/* Azul */}
                 <stop offset="100%" stopColor="#00D233" /> {/* Verde */}
               </linearGradient>
             </defs>
           </svg>
           
           {/* Texto Central (Porcentagem) */}
           <div className="absolute text-center">
             <span className="block text-4xl font-bold text-white">
                {Math.round(percentage)}%
             </span>
             <span className="text-[10px] text-white/40 uppercase font-bold">Concluído</span>
           </div>
        </div>

        {/* Texto Inferior (O Foco: Pedidos em Aberto) */}
        <div className="mt-4 text-center z-10">
           <p className="text-3xl font-bold text-white">
             {openOrdersCount}
           </p>
           <p className="text-xs text-orange-400 font-bold uppercase tracking-wide flex items-center gap-1 justify-center">
             <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
             Pedidos em Aberto
           </p>
        </div>

        {/* Efeito de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
      </div>

      {/* --- SEÇÃO 2: CARDS FINANCEIROS E PRODUÇÃO --- */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Card Faturamento (Agora ficou menor, já que o foco é pedido) */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <TrendingUp size={18} />
              </div>
           </div>
           <p className="text-xl font-bold text-white truncate">R$ {totalRevenue.toFixed(0)}</p>
           <p className="text-[10px] text-white/50 font-bold uppercase">Caixa (Pago)</p>
        </div>

        {/* Card Produção */}
        <div 
          onClick={() => onNavigateToTab('production')}
          className="glass-panel p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer active:scale-95"
        >
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Layers size={18} />
              </div>
              <ArrowRight size={14} className="text-white/20" />
           </div>
           <p className="text-xl font-bold text-white">{productionItemsCount}</p>
           <p className="text-[10px] text-white/50 font-bold uppercase">Peças na Fila</p>
        </div>
      </div>

      {/* --- SEÇÃO 3: ÚLTIMOS PEDIDOS --- */}
      <div>
        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Recentes</h3>
        <div className="space-y-3">
          {orders.slice(0, 3).map(order => (
             <div key={order.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${order.status === 'Entregue' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/50'}`}>
                      {order.customer_name.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-white/40">{order.status}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-primary">R$ {Number(order.total).toFixed(0)}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;