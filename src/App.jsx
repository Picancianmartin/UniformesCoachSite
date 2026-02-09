import React, { useState, useEffect } from "react";
import "./styles/index.css";
import { supabase } from "./services/supabase";
import BottomNav from "./components/BottomNav";

// Componentes e Telas
import Toast from "./components/Toast";
import HomeScreen from "./screens/HomeScreen";
import CatalogScreen from "./screens/CatalogScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import CartScreen from "./screens/CartScreen";
import SignupScreen from "./screens/SignupScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";
import AccountScreen from "./screens/AccountScreen";
import AdminScreen from "./screens/AdminScreen";
import Footer from "./components/ui/Footer";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [toast, setToast] = useState({ show: false, message: "", icon: "" });
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    // 1. Função para verificar a sessão atual
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Verifica se existe usuário E se o email é o do admin
      // (Ou você pode verificar session.user.user_metadata.role === 'admin')
      const isUserAdmin = session?.user?.email === "admin@loja.com"; // Exemplo simples

      setIsAdmin(isUserAdmin);
    };

    checkSession();

    // 3. Opcional: Escutar mudanças (login/logout) em tempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isUserAdmin = session?.user?.email === "admin@loja.com";
        setIsAdmin(isUserAdmin);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Estados Globais
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState({ name: "", phone: "" });
  const [orders, setOrders] = useState([]);

  // --- 1. Funções Utilitárias ---
  const showToast = (message, icon = "✓") => {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast({ show: false, message: "", icon: "" }), 3000);
  };

  // --- NOVO: PERSISTÊNCIA (LEMBRAR USUÁRIO) ---

  // A. Ao abrir o app, tenta ler o usuário salvo
  useEffect(() => {
    const savedUser = localStorage.getItem("coach_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // B. Função de Login (Salva na memória)
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("coach_user", JSON.stringify(userData));
    // Opcional: mostrar toast de boas-vindas
    showToast(`Bem-vindo, ${userData.name.split(" ")[0]}!`, "👋");
  };

  // --- A. LOGOUT DO CLIENTE (Apenas app) ---
  const handleClientLogout = () => {
    // 1. Limpa dados visuais
    setUser({ name: "", phone: "" });
    setCart([]);
    setOrders([]);

    // 2. Remove apenas a memória do cliente
    localStorage.removeItem("coach_user");

    // 3. Navega para home (SEM recarregar a página, SEM deslogar Admin)
    showToast("Você saiu da sua conta.", "info");
    setScreen("home");
  };

  // --- B. LOGOUT DO ADMIN (Apenas Supabase) ---
  const handleAdminLogout = async () => {
    // 1. Desloga a sessão segura do Supabase
    await supabase.auth.signOut();

    // 2. Opcional: Limpa o usuário comum também para garantir
    localStorage.removeItem("coach_user");

    // 3. Força o recarregamento total da página (Segurança Máxima)
    window.location.href = "/";
  };

  // --- 2. Lógica Supabase (Busca e Salva) ---
  const fetchMyOrders = async (phone) => {
    if (!phone) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return data;
  };

  useEffect(() => {
    if (user.phone) {
      fetchMyOrders(user.phone).then((data) => setOrders(data || []));
    } else {
      setOrders([]);
    }
  }, [user.phone]);

  // --- VERSÃO DE DEPURAÇÃO (DEBUG) ---
  const handleConfirmOrder = async (orderData) => {
    console.log("=== INICIANDO SALVAMENTO ===");
    console.log("Dados recebidos:", orderData);

    try {
      // 1. SALVAR A CAPA DO PEDIDO
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            // Verifique se os nomes das colunas no Supabase são EXATAMENTE estes:
            display_id: orderData.displayId,
            customer_name: orderData.customer.name,
            customer_phone: orderData.customer.phone,
            total: parseFloat(orderData.total), // Garante que é número
            status: orderData.status,
            payment_method: orderData.paymentMethod,
          },
        ])
        .select()
        .single();

      if (orderError) {
        alert(
          "ERRO AO CRIAR PEDIDO (CAPA): " +
            orderError.message +
            "\nDetalhes: " +
            orderError.details,
        );
        console.error("Erro Order:", orderError);
        throw orderError;
      }

      console.log(">>> Pedido criado com sucesso. ID:", order.id);

      // 2. PREPARAR OS ITENS
      // Aqui tratamos erros comuns de JavaScript (undefined/null)
      const itemsToInsert = orderData.items.map((item) => {
        // Log para ver cada item sendo processado
        console.log("Processando item:", item);

        return {
          order_id: order.id, // TEM QUE SER 'order_id'
          product_name: item.name || "Item", // TEM QUE SER 'product_name' (não 'name')
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          is_kit: item.isKit === true,

          // Tratamento para evitar 'undefined'
          size_top: item.isKit ? item.selectedSizes?.top || null : null,
          size_bottom: item.isKit ? item.selectedSizes?.bottom || null : null,
          size_standard: !item.isKit
            ? item.selectedSizes?.standard || null
            : null,
        };
      });

      console.log(">>> Tentando inserir itens:", itemsToInsert);

      // 3. SALVAR OS ITENS
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items") // <--- VERIFIQUE SE O NOME DA TABELA ESTÁ CERTO
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        // AQUI ESTÁ O ERRO QUE VOCÊ PRECISA VER
        alert(
          "ERRO NOS ITENS: " +
            itemsError.message +
            "\nVerifique as colunas no Supabase!",
        );
        console.error("Erro Items:", itemsError);

        // Opcional: Apagar o pedido "capa" se os itens falharem, para não ficar lixo
        await supabase.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      console.log(">>> Sucesso Total!", itemsData);

      // Atualiza a lista visual
      if (user.phone) {
        fetchMyOrders(user.phone).then(setOrders);
      }

      return order.id;
    } catch (error) {
      console.error("CRASH:", error);
      // Não damos throw aqui para não travar o app, mas o alert acima já avisou
    }
  };

  // --- 3. Funções de Carrinho ---

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setScreen("product");
  };

  const handleAddToCart = (item) => {
    const newItem = {
      ...item,
      cartId: Date.now(),
      quantity: 1,
      price: Number(item.price),
    };
    setCart((prev) => [...prev, newItem]);
    showToast(`${item.name} adicionado!`, "🛍️");
    setTimeout(() => setScreen("catalog"), 500);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleUpdateQty = (cartId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          const currentQty = Number(item.quantity) || 1;
          const newQty = Math.max(1, currentQty + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  // --- 4. Roteamento de Telas ---
  const screens = {
    home: <HomeScreen onNavigate={setScreen} cartItems={cart} />,

    catalog: (
      <CatalogScreen
        onNavigate={setScreen}
        onSelectProduct={handleProductSelect}
        cartItems={cart}
      />
    ),

    product: (
      <ProductDetailScreen
        onNavigate={setScreen}
        onAddToCart={handleAddToCart}
        product={selectedProduct}
        cartItems={cart}
      />
    ),

    cart: (
      <CartScreen
        onNavigate={setScreen}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQty={handleUpdateQty}
        user={user}
      />
    ),

    signup: (
      <SignupScreen
        onNavigate={setScreen}
        onLogin={handleLogin} // <--- Alterado para usar a nova função
        user={user}
        cartLength={cart.length}
      />
    ),

    payment: (
      <PaymentScreen
        onNavigate={setScreen}
        cartItems={cart}
        user={user}
        onClearCart={() => setCart([])}
        onConfirmOrder={handleConfirmOrder}
      />
    ),

    confirmation: <ConfirmationScreen onNavigate={setScreen} />,

    account: (
      <AccountScreen
        onNavigate={setScreen}
        user={user}
        orders={orders}
        onLogout={handleClientLogout} // <--- Alterado para usar a nova função
        isAdmin={isAdmin}
      />
    ),

    admin: <AdminScreen onNavigate={setScreen} onLogout={handleAdminLogout} />,
  };

  return (
    <div className="min-h-screen bg-navy font-outfit text-white overflow-x-hidden relative">
      {/* Background Animado Global */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-secondary/10 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-[428px] mx-auto min-h-screen">
        <Toast show={toast.show} message={toast.message} icon={toast.icon} />
        {screens[screen]}
      </div>

      {screen !== "signup" &&
        screen !== "admin" &&
        screen !== "product" &&
        screen !== "cart" && (
          <BottomNav
            active={screen === "product" ? "catalog" : screen}
            onNavigate={setScreen}
            cartCount={cart.length}
          />
        )}
      <Footer
        brandName="UniformeCoach"
        portfolioUrl="https://seusite.com/cases/uniformecoach"
        creditName="Pietra Cancian"
        showCredit={true}
      />
    </div>
  );
}
