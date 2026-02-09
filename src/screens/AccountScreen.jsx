import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import {
  Package,
  User,
  LogOut,
  ChevronRight,
  LogIn,
  ShieldCheck,
  X,
  Calendar,
  Clock,
  CreditCard,
  ShoppingBag,
  MapPin,
  Copy,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Truck,
  Hammer,
  Hourglass,
  RefreshCw,
  Box,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import logoAzul from "../assets/logodavidD.png"; // Imagem do "N" azul para o logo central

const AccountScreen = ({ onNavigate, user, onLogout, isAdmin }) => {
  console.log("=== DEBUG CONTA ===");
  console.log("Sou Admin?", isAdmin);
  console.log("Dados Usuário:", user);
  console.log("===================");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const userPhone = user?.phone;
  const isLoggedIn = !!userPhone || isAdmin;

  // --- 1. BUSCA CORRIGIDA (LÊ O JSON DIRETO) ---
  const fetchMyOrders = useCallback(async () => {
    if (!userPhone) return;

    setLoading(true);

    // MUDANÇA AQUI: Removemos o join com order_items e pegamos tudo (*)
    // O Supabase vai trazer a coluna 'items' (JSON) automaticamente.
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", userPhone)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
    } else {
      setMyOrders(data || []);
    }
    setLoading(false);
  }, [userPhone]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhone]);

  // --- 2. HELPERS DE VISUALIZAÇÃO ---

  // Função inteligente para achar o nome do produto no JSON ou Tabela
  const getItemName = (item) => {
    // Tenta todas as variações possíveis de nome que podem estar salvas
    return item.product_name || item.name || item.title || "Produto sem nome";
  };

  const getDaysRemaining = (createdAt) => {
    if (!createdAt) return 30;
    const created = new Date(createdAt);
    const deadline = new Date(created);
    deadline.setDate(created.getDate() + 30);

    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusConfig = (order) => {
    const s = order.status ? order.status.toLowerCase() : "";

    if (s.includes("retirada")) {
      return {
        label: "Pronto p/ Retirada", // O texto que aparece na TAG
        color: "text-cyan-400", // Cor do texto (Azul Ciano)
        bg: "bg-cyan-500/10", // Fundo da tag
        border: "border-cyan-500/20",
        icon: <MapPin size={16} />, // Ícone (Importe o MapPin do lucide-react)
      };
    }

    if (
      s.includes("concluído") ||
      s.includes("entregue") ||
      s.includes("finalizado")
    ) {
      return {
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        icon: <CheckCircle size={14} />,
        label: "Concluído",
      };
    }

    if (s.includes("retirada pendente") || s.includes("pronto")) {
      return {
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        icon: <MapPin size={14} />,
        label: "Retirada Pendente",
      };
    }

    if (s.includes("separação")) {
      return {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        icon: <Box size={14} />,
        label: "Em Separação",
      };
    }

    if (s.includes("produção") || s.includes("fabricação")) {
      const daysLeft = getDaysRemaining(order.created_at);
      return {
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        icon: <Hammer size={14} />,
        label: daysLeft > 0 ? `Retira em ${daysLeft} dias` : "Finalizando",
      };
    }

    if (s.includes("pagamento") || s.includes("aguardando")) {
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        icon: <Hourglass size={14} />,
        label: "Aguardando Pagamento",
      };
    }

    if (s.includes("cancelado")) {
      return {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: <AlertCircle size={14} />,
        label: "Cancelado",
      };
    }

    return {
      color: "text-white/50",
      bg: "bg-white/5",
      border: "border-white/10",
      icon: <Package size={14} />,
      label: order.status || "Processando",
    };
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "-";
  const formatTime = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
  const formatMoney = (val) =>
    Number(val || 0)
      .toFixed(2)
      .replace(".", ",");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Código copiado!");
  };

  const openSupport = (order) => {
    const id = order.id ? order.id.toString().slice(0, 8).toUpperCase() : "???";
    const msg = `Olá! Preciso de ajuda com o pedido #${id}.`;
    window.open(
      `https://wa.me/551591762066?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-navy pb-24 animate-fade-in font-outfit text-white relative">
      {/* HEADER */}
      <div className="pt-6 px-6 pb-6 border-b border-white/5 bg-navy/80 backdrop-blur-xl sticky top-0 z-20 flex justify-between items-center">
        <div>
          {/* AQUI: Adicionei uma div flex para alinhar o logo com o título */}
          <div className="flex items-center align-middle gap-3">
            <img
              src={logoAzul}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
            <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
          </div>

          <p className="text-white/50 text-sm text-center">
            {isLoggedIn
              ? `Olá, ${user.name ? user.name.split(" ")[0] : "Cliente"}!`
              : "Identifique-se"}
          </p>
        </div>

        {isLoggedIn && (
          <button
            onClick={fetchMyOrders}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors border border-white/5"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      <div className="px-6 space-y-8 mt-6">
        {/* LOGIN CARD */}
        {!isLoggedIn ? (
          <button
            onClick={() => onNavigate("signup")}
            className="w-full glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all active:scale-[0.98] border border-primary/30 shadow-lg shadow-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <LogIn size={24} />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-lg text-white">
                  Entrar ou Cadastrar
                </h2>
                <p className="text-white/50 text-xs">
                  Acompanhe seus pedidos em tempo real
                </p>
              </div>
            </div>
            <ChevronRight className="text-white/30 group-hover:text-primary transition-colors" />
          </button>
        ) : (
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden space-y-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-primary/20 transform rotate-3">
                {/* LÓGICA DO ÍCONE: Se tiver nome, usa a inicial. Se for Admin, usa 'A'. Senão, ícone padrão */}
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : isAdmin ? (
                  "A"
                ) : (
                  <User />
                )}
              </div>
              <div>
                {/* LÓGICA DO NOME: Mostra nome do cliente OU "Administrador" */}
                <h2 className="font-bold text-xl text-white">
                  {user?.name || (isAdmin ? "Administrador" : "Cliente")}
                </h2>

                {/* LÓGICA DO TELEFONE: Mostra telefone OU aviso de restrito */}
                <p className="text-white/50 text-xs font-mono bg-white/5 px-2 py-1 rounded inline-block mt-1">
                  {user?.phone || (isAdmin ? "Acesso Restrito" : "")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onLogout}
                // ADICIONEI: col-span-2 se NÃO for admin (para o botão ocupar tudo sozinho)
                className={`py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all ${!isAdmin ? "col-span-2" : ""}`}
              >
                <LogOut size={16} /> Sair
              </button>

              {/* BOTÃO ADMIN: Só aparece se isAdmin for verdadeiro */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate("admin")}
                  className="py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-primary hover:bg-primary/10 hover:border-primary/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck size={16} /> Painel
                </button>
              )}
            </div>
          </div>
        )}

        {/* LISTA DE PEDIDOS */}
        <div>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Seus Pedidos
            </h3>
            {isLoggedIn && myOrders.length > 0 && (
              <span className="text-[10px] text-white/30">
                {myOrders.length} pedidos
              </span>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-white/10 bg-white/5">
              <Package size={48} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/40 text-sm mb-4">
                Faça login para ver seu histórico.
              </p>
              <button
                onClick={() => onNavigate("signup")}
                className="text-primary text-xs font-bold uppercase hover:underline"
              >
                Fazer Login
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Atualizando pedidos...</p>
            </div>
          ) : !myOrders || myOrders.length === 0 ? (
            <div className="text-center py-12 opacity-50 bg-white/5 rounded-3xl border border-white/5">
              <ShoppingBag size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm">Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const statusInfo = getStatusConfig(order);
                const orderIdShort =
                  order.display_id ||
                  (order.id
                    ? order.id.toString().slice(0, 6).toUpperCase()
                    : "???");

                // Garante que items é um array, mesmo que o JSON venha nulo
                const itemsList = Array.isArray(order.items) ? order.items : [];

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="glass-panel p-5 rounded-3xl transition-all active:scale-[0.98] hover:bg-white/5 border border-white/5 cursor-pointer group relative overflow-hidden"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusInfo.bg.replace("/10", "")} opacity-50`}
                    />

                    {/* Cabeçalho */}
                    <div className="flex justify-between items-start mb-4 pl-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-white tracking-wider">
                            #{orderIdShort}
                          </span>
                          <div
                            className={`w-2 h-2 rounded-full ${statusInfo.bg.replace("/10", "/20")} animate-pulse`}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/50">
                          <span>{formatDate(order.created_at)}</span>
                          <span>•</span>
                          <span>{formatTime(order.created_at)}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border flex items-center gap-1.5 ${statusInfo.color} ${statusInfo.bg} ${statusInfo.border}`}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>

                    {/* Itens (Preview) */}
                    <div className="pl-3 mb-4">
                      <div className="flex -space-x-2 overflow-hidden py-1">
                        {itemsList.slice(0, 4).map((item, idx) => {
                          const safeName = getItemName(item);
                          return (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full bg-navy-light border border-white/10 flex items-center justify-center text-[10px] text-white/50 relative z-0"
                            >
                              {item.isKit ? "K" : safeName.charAt(0)}
                            </div>
                          );
                        })}
                        {itemsList.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white z-10">
                            +{itemsList.length - 4}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-2 truncate">
                        {itemsList.length} itens:{" "}
                        {itemsList.map(getItemName).join(", ")}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pl-3 pt-3 border-t border-white/5">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                        Total
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">
                          R$ {formatMoney(order.total)}
                        </span>
                        <div className="bg-white/5 p-1.5 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-white/30">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DETALHES --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrder(null)}
          ></div>

          <div className="bg-[#0f172a] border-t sm:border border-white/10 w-full max-w-md sm:rounded-3xl rounded-t-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative z-10 animate-slide-up">
            <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
                  Detalhes do Pedido
                </p>
                <div
                  className="flex items-center gap-2"
                  onClick={() =>
                    copyToClipboard(
                      selectedOrder.display_id || selectedOrder.id,
                    )
                  }
                >
                  <h3 className="text-2xl font-bold text-white font-mono">
                    #
                    {selectedOrder.display_id ||
                      (selectedOrder.id
                        ? selectedOrder.id.toString().slice(0, 8).toUpperCase()
                        : "???")}
                  </h3>
                  <Copy
                    size={14}
                    className="text-primary cursor-pointer hover:scale-110 transition-transform"
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 flex-1">
              {(() => {
                const status = getStatusConfig(selectedOrder);
                return (
                  <div
                    className={`p-4 rounded-2xl border ${status.border} ${status.bg} flex items-center gap-4`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${status.bg.replace("/10", "/20")} flex items-center justify-center ${status.color}`}
                    >
                      {status.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${status.color}`}>
                        {status.label}
                      </p>
                      <p className="text-[10px] text-white/50">
                        Atualizado em {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold">
                    Data
                  </p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar size={14} className="text-white/30" />{" "}
                    {formatDate(selectedOrder.created_at)}
                  </p>
                  <p className="text-xs text-white/50 pl-6">
                    {formatTime(selectedOrder.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-bold">
                    Pagamento
                  </p>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard size={14} className="text-white/30" />
                    {selectedOrder.payment_method?.includes("pix")
                      ? "Pix"
                      : "Cartão/Outro"}
                  </p>
                  <p className="text-xs text-white/50 pl-6">
                    R$ {formatMoney(selectedOrder.total)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShoppingBag size={14} /> Itens (
                  {Array.isArray(selectedOrder.items)
                    ? selectedOrder.items.length
                    : 0}
                  )
                </h4>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                      >
                        <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-white/20 border border-white/5 flex-shrink-0 overflow-hidden relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-white truncate pr-2">
                              {getItemName(item)}
                            </p>
                            <p className="text-sm font-bold text-white">
                              R${" "}
                              {formatMoney(
                                (item.price || 0) * (item.quantity || 1),
                              )}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-bold border border-white/5">
                              Qtd: {item.quantity}
                            </span>

                            {item.isKit ? (
                              <>
                                <span className="text-[10px] bg-navy-light px-2 py-0.5 rounded text-white/50 border border-white/5">
                                  Top:{" "}
                                  {item.selectedSizes?.top || item.size_top}
                                </span>
                                <span className="text-[10px] bg-navy-light px-2 py-0.5 rounded text-white/50 border border-white/5">
                                  Bot:{" "}
                                  {item.selectedSizes?.bottom ||
                                    item.size_bottom}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] bg-navy-light px-2 py-0.5 rounded text-white/50 border border-white/5">
                                Tam:{" "}
                                {item.selectedSizes?.standard ||
                                  item.size_standard ||
                                  "Único"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="h-10"></div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#0f172a] pb-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-white/50">Valor Total</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {formatMoney(selectedOrder.total)}
                </p>
              </div>
              <button
                onClick={() => openSupport(selectedOrder)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <HelpCircle size={18} className="text-white/60" />
                Ajuda com este pedido
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="account" onNavigate={onNavigate} />
    </div>
  );
};

export default AccountScreen;
