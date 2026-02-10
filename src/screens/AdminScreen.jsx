import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import {
  Package,
  LogOut,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Hammer,
  Box,
  MapPin,
  Truck,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Save,
  MessageCircle,
  Copy,
  RefreshCw,
  X,
  Plus,
  ShoppingBag,
  Trash2,
  Pencil,
  Layers,
  Tag,
  DollarSign,
  Loader,
  Image as ImageIcon,
} from "lucide-react";

const AdminScreen = ({ onNavigate, onLogout }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // Gerar um nome único para o arquivo para evitar sobrescrita
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pegar a URL pública
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      // 3. Atualizar o formulário com a nova URL
      setFormData({ ...formData, image: data.publicUrl });
    } catch (error) {
      alert("Erro ao subir imagem: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      // 1. Verifica se existe uma sessão real no Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // 2. Se não tiver sessão, manda para o Login imediatamente
        // (Opcional: alert("Acesso negado. Faça login como Admin."));
        onNavigate("signup");
      } else {
        // 3. Se tiver sessão, libera o acesso
        setIsAuthorized(true);
      }
    };

    checkSession();
  }, []);

  // --- ESTADOS DE PEDIDOS ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Estado para o Modal de Status
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);

  // --- ESTADOS DE PRODUTOS ---
  const [activeTab, setActiveTab] = useState("orders");
  const [products, setProducts] = useState([]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    price: "",
    image: "",
    images_text: "",
    category: "camisetas",
    description: "",
    is_pronta_entrega: false,
    stock: {},
  });

  // --- DEFINIÇÃO DE TAMANHOS ---
  const ALL_SIZES = ["PP", "P", "M", "G", "GG", "XG", "G1", "G2", "G3"];

  // --- 1. BUSCA DE PEDIDOS ---
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar pedidos:", error);
    else setOrders(data || []);
    setLoading(false);
  };

  // --- 2. FUNÇÕES DE PRODUTOS ---
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setProducts(data || []);
  };

  const handleEditClick = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      images_text:
        product.images && Array.isArray(product.images)
          ? product.images.join("\n")
          : "",
      category: product.category || "camisetas",
      description: product.description || "",
      is_pronta_entrega: product.pronta_entrega || false,
      stock: product.stock || {},
    });
    setIsEditingProduct(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      price: "",
      image: "",
      category: "camisetas",
      description: "",
      is_pronta_entrega: false,
      stock: {},
    });
    setIsEditingProduct(false);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price)
      return alert("Preencha nome e preço!");

    setLoading(true);

    const galleryArray = formData.images_text
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const productPayload = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      images: galleryArray,
      category: formData.category,
      description: formData.description,
      pronta_entrega: formData.is_pronta_entrega,
      stock: formData.stock,
    };

    let error;

    if (formData.id) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert([productPayload]);
      error = insertError;
    }

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      // Feedback visual melhor que alert
      // Idealmente usaríamos um Toast, mas o alert serve por enquanto
      alert(formData.id ? "Produto atualizado!" : "Produto criado!");
      resetForm();
      fetchProducts();
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchProducts();
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOrders();
      fetchProducts();
    }
  }, [isAuthorized]); // <--- Adicione isAuthorized na dependência

  // --- RENDERIZAÇÃO CONDICIONAL (A Barreira Visual) ---

  // ENQUANTO VERIFICA: Mostra tela de carregamento
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white animate-fade-in">
        <Loader size={40} className="animate-spin text-primary mb-4" />
        <p className="text-sm text-white/50 font-outfit">
          Verificando credenciais...
        </p>
      </div>
    );
  }

  // --- HELPERS DE ESTOQUE ---
  const updateStock = (type, size, qty) => {
    const newStock = { ...formData.stock };
    if (!newStock[type]) newStock[type] = {};

    const val = parseInt(qty);
    if (val > 0) {
      newStock[type][size] = val;
    } else {
      delete newStock[type][size];
    }
    setFormData({ ...formData, stock: newStock });
  };

  // Componente de Grade de Estoque Melhorado
  const StockInputGrid = ({ type, title }) => (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mt-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Layers size={12} />
        </div>
        <p className="text-xs text-white/70 font-bold uppercase tracking-wider">
          {title}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {ALL_SIZES.map((size) => {
          const hasStock = formData.stock?.[type]?.[size] > 0;
          return (
            <div key={size} className="flex flex-col gap-1 relative group">
              <label
                className={`text-[9px] text-center font-bold uppercase transition-colors ${hasStock ? "text-primary" : "text-white/30"}`}
              >
                {size}
              </label>
              <input
                type="number"
                min="0"
                placeholder="-"
                className={`w-full h-10 rounded-xl text-center text-sm font-bold outline-none transition-all duration-200 
                  ${
                    hasStock
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--color-primary),0.3)] border border-primary/50"
                      : "bg-black/20 text-white/40 border border-white/5 focus:border-white/30 focus:bg-white/5"
                  }`}
                value={formData.stock?.[type]?.[size] || ""}
                onChange={(e) => updateStock(type, size, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- HELPERS GERAIS ---
  const getItemName = (item) =>
    item.product_name || item.name || item.title || "Produto sem nome";

  const getStatusConfig = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("pago") || s.includes("aprovado"))
      return {
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        icon: <CheckCircle size={16} />,
        label: "Pago",
      };
    if (s.includes("produção"))
      return {
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        icon: <Hammer size={16} />,
        label: "Em Produção",
      };
    if (s.includes("separação"))
      return {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        icon: <Box size={16} />,
        label: "Em Separação",
      };
    if (s.includes("retirada"))
      return {
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        icon: <MapPin size={16} />,
        label: "Pronto p/ Retirar",
      };
    if (s.includes("aguardando"))
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        icon: <Hourglass size={16} />,
        label: "Aguardando",
      };
    if (s.includes("concluído"))
      return {
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        icon: <Truck size={16} />,
        label: "Concluído",
      };
    if (s.includes("cancelado"))
      return {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: <AlertCircle size={16} />,
        label: "Cancelado",
      };
    return {
      color: "text-white/50",
      bg: "bg-white/5",
      border: "border-white/10",
      icon: <Package size={16} />,
      label: status,
    };
  };

  const getPaymentLabel = (method) => {
    if (method === "pix" || method === "pix_manual") return "Pix";
    if (method === "credit_card" || method === "card") return "Cartão";
    return "Máquina de Cartão";
  };

  const confirmStatusUpdate = async (newStatus) => {
    if (!selectedOrderForStatus) return;
    const oldOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForStatus.id ? { ...o, status: newStatus } : o,
      ),
    );
    setStatusModalOpen(false);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrderForStatus.id);
      if (error) throw error;
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
      setOrders(oldOrders);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrderForStatus(order);
    setStatusModalOpen(true);
  };
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);
  const openWhatsApp = (phone, name, orderId) => {
    const p = phone ? phone.replace(/\D/g, "") : "";
    const msg = `Olá ${name}! Tudo bem? Estou entrando em contato sobre o seu pedido #${orderId.toString().slice(0, 6)} na Coach Store.`;
    window.open(
      `https://wa.me/55${p}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "todos") return true;
    const s = order.status ? order.status.toLowerCase() : "";
    if (filter === "pendentes")
      return s.includes("aguardando") || s.includes("pendente");
    if (filter === "producao")
      return s.includes("produção") || s.includes("separação");
    if (filter === "ativos")
      return !s.includes("concluído") && !s.includes("cancelado");
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) =>
      o.status?.toLowerCase().includes("aguardando"),
    ).length,
    revenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-navy font-outfit text-white pb-24 relative selection:bg-primary/30">
      {/* HEADER */}
      <div className="pt-8 px-6 pb-6 bg-navy/90 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5 shadow-2xl shadow-black/20">
        {/* Container Flex para alinhar Esquerda e Direita */}
        <div className="flex justify-between items-center mb-4">
          {/* GRUPO ESQUERDA: Botão Voltar + Textos */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("account")}
              title="Voltar para Loja"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors border border-white/5 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className=" text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 leading-tight">
                Painel Admin
              </h1>
              <p className="text-xs text-white/40">Gerencie sua loja</p>
            </div>
          </div>

          {/* GRUPO DIREITA: Botões de Ação */}
          <div className="flex gap-2">
            <button
              onClick={fetchOrders}
              title="Atualizar"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-colors border border-white/5"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/10"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {activeTab === "orders" && (
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Pedidos
              </p>
              <p className="text-lg font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/20">
              <p className="text-[10px] text-yellow-400/70 uppercase font-bold tracking-wider">
                Pendentes
              </p>
              <p className="text-lg font-bold text-yellow-400">
                {stats.pending}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
              <p className="text-[10px] text-primary/70 uppercase font-bold tracking-wider">
                Faturamento
              </p>
              <p className="text-sm font-bold text-primary">
                R${" "}
                {stats.revenue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ABAS (TABS) */}
      <div className="mx-6 mb-6 mt-6">
        <div className="flex p-1 bg-black/20 rounded-xl border border-white/5 relative">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all duration-300 z-10 ${activeTab === "orders" ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all duration-300 z-10 ${activeTab === "products" ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Produtos
          </button>

          {/* Fundo animado da aba ativa */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg shadow-lg shadow-primary/20 transition-transform duration-300 ${activeTab === "products" ? "translate-x-[calc(100%+4px)]" : "translate-x-1"}`}
          />
        </div>
      </div>

      <div className="px-6">
        {/* === ABA PEDIDOS === */}
        {activeTab === "orders" && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
              {[
                { id: "todos", label: "Todos" },
                { id: "pendentes", label: "Pendentes" },
                { id: "producao", label: "Produção" },
                { id: "ativos", label: "Em Aberto" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === f.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-transparent border-white/10 text-white/40 hover:bg-white/5"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Carregando...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <Package size={40} className="mx-auto mb-3 text-white/20" />
                  <p className="text-sm text-white/40">
                    Nenhum pedido encontrado.
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const isExpanded = expandedOrder === order.id;
                  const itemsList = Array.isArray(order.items)
                    ? order.items
                    : [];

                  return (
                    <div
                      key={order.id}
                      className="glass-panel rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 shadow-xl shadow-black/10"
                    >
                      <div
                        className={`p-5 flex flex-col gap-4 cursor-pointer transition-colors ${isExpanded ? "bg-white/5" : "hover:bg-white/[0.02]"}`}
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusConfig.bg.replace("/10", "/20")} ${statusConfig.color} border ${statusConfig.border}`}
                            >
                              {statusConfig.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-base leading-tight">
                                {order.customer_name}
                              </h3>
                              <div
                                className="flex items-center gap-2 mt-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(order.display_id || order.id);
                                }}
                              >
                                <span className="text-[10px] font-mono bg-black/30 px-2 py-1 rounded-md text-white/50 flex items-center gap-1 hover:text-white transition-colors border border-white/5">
                                  #
                                  {order.display_id ||
                                    order.id.toString().slice(0, 6)}{" "}
                                  <Copy size={8} />
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${statusConfig.color} ${statusConfig.bg} ${statusConfig.border}`}
                            >
                              {statusConfig.label}
                            </span>
                            <p className="text-[10px] text-white/30 mt-2">
                              {new Date(order.created_at).toLocaleDateString(
                                "pt-BR",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase font-bold mb-0.5">
                              Total
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">
                                R$ {order.total?.toFixed(2)}
                              </span>
                              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                                {getPaymentLabel(order.payment_method)}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-white/30" />
                          ) : (
                            <ChevronDown size={20} className="text-white/30" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-black/20 p-5 border-t border-white/5 animate-slide-down">
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                              onClick={() => openStatusModal(order)}
                              className="bg-primary hover:bg-primary-dark text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 border-b-4 border-primary-dark active:border-0 active:translate-y-1"
                            >
                              <RefreshCw size={14} /> Mudar Status
                            </button>
                            <button
                              onClick={() =>
                                openWhatsApp(
                                  order.customer_phone,
                                  order.customer_name,
                                  order.display_id || order.id,
                                )
                              }
                              className="bg-[#25D366] hover:bg-[#1ebc57] text-black text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20 border-b-4 border-[#128c7e] active:border-0 active:translate-y-1"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </button>
                          </div>
                          <p className="text-[10px] font-bold text-white/30 uppercase mb-3 flex items-center gap-2">
                            <Package size={12} /> Detalhes do Pedido
                          </p>
                          <div className="space-y-3">
                            {itemsList.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5"
                              >
                                <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-xs font-bold text-white/50 border border-white/5">
                                  {item.quantity}x
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-white">
                                    {getItemName(item)}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-1.5">
                                    {item.is_kit || item.isKit ? (
                                      <>
                                        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-white/60 border border-white/5">
                                          Top:{" "}
                                          {item.selectedSizes?.top ||
                                            item.size_top}
                                        </span>
                                        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-white/60 border border-white/5">
                                          Bot:{" "}
                                          {item.selectedSizes?.bottom ||
                                            item.size_bottom}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-white/60 border border-white/5">
                                        Tam:{" "}
                                        {item.selectedSizes?.standard ||
                                          item.size_standard ||
                                          "U"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10 text-center">
                            <p className="text-[10px] text-white/30 font-mono">
                              ID: {order.id}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* === ABA PRODUTOS === */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-in">
            <button
              onClick={
                isEditingProduct ? resetForm : () => setIsEditingProduct(true)
              }
              className={`w-full py-4 rounded-2xl border border-dashed border-white/20 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-primary/50 transition-all flex items-center justify-center gap-2 ${isEditingProduct ? "border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10" : ""}`}
            >
              {isEditingProduct ? <X size={20} /> : <Plus size={20} />}{" "}
              {isEditingProduct ? "Cancelar" : "Cadastrar Novo Produto"}
            </button>

            {isEditingProduct && (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 animate-slide-down shadow-2xl shadow-black/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {formData.id ? <Pencil size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {formData.id ? `Editar Produto` : "Novo Produto"}
                    </h3>
                    <p className="text-xs text-white/40">
                      Preencha os detalhes abaixo
                    </p>
                  </div>
                </div>

                {/* Inputs com Ícones */}
                <div className="relative group">
                  <Tag
                    size={16}
                    className="absolute left-3 top-3.5 text-white/30 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="Nome do Produto"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <div className="relative group flex-1">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-3.5 text-white/30 group-focus-within:text-primary transition-colors"
                    />
                    <input
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="Preço"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  <select
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="camisetas">Peça Única</option>
                    <option value="kits">Kits/Conjuntos</option>
                  </select>
                </div>

                <div className="relative group">
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <ImageIcon size={12} className="text-white/40" />
                      <span className="text-[10px] text-white/40 uppercase font-bold">
                        Imagem do Produto
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Preview e Botão de Upload */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {formData.image ? (
                            <img
                              src={formData.image}
                              className="w-full h-full object-cover"
                              alt="Preview"
                            />
                          ) : (
                            <ImageIcon size={24} className="text-white/10" />
                          )}
                        </div>

                        <label className="flex-1">
                          <div
                            className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${isUploading ? "border-primary/20 bg-primary/5" : "border-white/10 hover:border-primary/40 hover:bg-white/5"}`}
                          >
                            {isUploading ? (
                              <Loader
                                className="animate-spin text-primary"
                                size={20}
                              />
                            ) : (
                              <>
                                <Plus size={20} className="text-primary" />
                                <span className="text-xs font-bold text-white/60">
                                  Fazer Upload
                                </span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </div>

                      {/* Campo de URL Manual (Mantido para flexibilidade) */}
                      <div className="relative group">
                        <ImageIcon
                          size={14}
                          className="absolute left-3 top-3 text-white/30"
                        />
                        <input
                          className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-[10px] text-white/50 outline-none focus:border-primary/30"
                          placeholder="Ou cole a URL manualmente..."
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* --- NOVO CAMPO: GALERIA DE FOTOS --- */}
                <div className="relative group">
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <Layers size={12} className="text-white/40" />
                    <span className="text-[10px] text-white/40 uppercase font-bold">
                      Galeria (Frente, Costas, Detalhes)
                    </span>
                  </div>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50 min-h-[80px]"
                    placeholder="Cole aqui as URLs das outras fotos (uma por linha ou separadas por vírgula)..."
                    value={formData.images_text}
                    onChange={(e) =>
                      setFormData({ ...formData, images_text: e.target.value })
                    }
                  />
                </div>

                {/* Switch Pronta Entrega Melhorado */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${formData.is_pronta_entrega ? "bg-green-500/10 border-green-500/30" : "bg-black/20 border-white/10 hover:bg-white/5"}`}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      is_pronta_entrega: !formData.is_pronta_entrega,
                    })
                  }
                >
                  <div
                    className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${formData.is_pronta_entrega ? "bg-green-500" : "bg-white/10"}`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm ${formData.is_pronta_entrega ? "left-6" : "left-1"}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold transition-colors ${formData.is_pronta_entrega ? "text-green-400" : "text-white"}`}
                    >
                      Pronta Entrega
                    </p>
                    <p className="text-[10px] text-white/50">
                      Gerenciar estoque disponível.
                    </p>
                  </div>
                </div>

                {/* --- GESTÃO DE ESTOQUE --- */}
                {formData.is_pronta_entrega && (
                  <div className="animate-slide-down border-t border-white/5 pt-2">
                    {formData.category === "kits" ? (
                      <>
                        <StockInputGrid
                          title="Estoque: Parte de Cima (Top)"
                          type="top"
                        />
                        <StockInputGrid
                          title="Estoque: Parte de Baixo"
                          type="bottom"
                        />
                      </>
                    ) : (
                      <StockInputGrid
                        title="Estoque Disponível"
                        type="standard"
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20 border-b-4 border-primary-dark active:border-0 active:translate-y-1 transition-all"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}{" "}
                  {formData.id ? "Atualizar Produto" : "Salvar Produto"}
                </button>
              </div>
            )}

            <div className="space-y-3">
              {products.length === 0 && (
                <p className="text-center text-white/30 text-xs py-10">
                  Nenhum produto cadastrado.
                </p>
              )}
              {products.map((product) => {
                const stockSummary = product.stock
                  ? Object.entries(product.stock)
                      .map(([type, sizes]) => {
                        const sizeStr = Object.entries(sizes)
                          .map(([s, q]) => `${s}:${q}`)
                          .join(" ");
                        return sizeStr
                          ? `${type === "standard" ? "" : type === "top" ? "TOP" : "BOT"}: ${sizeStr}`
                          : "";
                      })
                      .filter(Boolean)
                  : [];

                return (
                  <div
                    key={product.id}
                    className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 items-center hover:bg-white/[0.07] transition-colors group"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5">
                      {product.image ? (
                        <img
                          src={product.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag size={24} className="text-white/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 self-start py-1">
                      <p className="font-bold text-white text-base truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-primary font-bold">
                        R$ {product.price}
                      </p>

                      {product.pronta_entrega && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {stockSummary.length > 0 ? (
                            stockSummary.map((s, i) => (
                              <span
                                key={i}
                                className="text-[9px] bg-white/10 border border-white/10 px-2 py-0.5 rounded text-white/60 font-mono"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-red-400">
                              Sem estoque
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="w-9 h-9 flex items-center justify-center bg-blue-500/10 rounded-xl text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all border border-blue-500/20"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-9 h-9 flex items-center justify-center bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 hover:scale-105 transition-all border border-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div
            className="absolute inset-0"
            onClick={() => setStatusModalOpen(false)}
          />
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden relative z-10 animate-slide-up shadow-2xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white">Atualizar Status</h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
              {[
                {
                  val: "Aguardando Comprovante",
                  label: "Aguardando Comprovante",
                  icon: <Hourglass size={18} />,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/20",
                },
                {
                  val: "Em Produção",
                  label: "Em Produção",
                  icon: <Hammer size={18} />,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                },
                {
                  val: "Em Separação",
                  label: "Em Separação",
                  icon: <Box size={18} />,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                },
                {
                  val: "Retirada Pendente",
                  label: "Pronto p/ Retirada",
                  icon: <MapPin size={18} />,
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                  border: "border-cyan-500/20",
                },
                {
                  val: "Concluído",
                  label: "Concluído / Entregue",
                  icon: <CheckCircle size={18} />,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                },
                {
                  val: "Cancelado",
                  label: "Cancelar Pedido",
                  icon: <AlertCircle size={18} />,
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                  border: "border-red-500/20",
                },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => confirmStatusUpdate(opt.val)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] hover:bg-white/5 text-left ${selectedOrderForStatus?.status === opt.val ? `bg-white/5 ${opt.border}` : "border-white/5"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.bg} ${opt.color}`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <p className={`font-bold ${opt.color}`}>{opt.label}</p>
                    <p className="text-[10px] text-white/40">
                      Mudar status para {opt.label}
                    </p>
                  </div>
                  {selectedOrderForStatus?.status === opt.val && (
                    <CheckCircle size={16} className="ml-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScreen;
