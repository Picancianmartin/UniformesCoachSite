import React, { useState } from "react";
import { supabase } from "../services/supabase";
import {
  ArrowLeft,
  User,
  Phone,
  CheckSquare,
  Loader,
  Mail,
  Lock,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Toast from "../components/Toast";

const SignupScreen = ({ onNavigate, onLogin, user, cartLength }) => {
  const [activeTab, setActiveTab] = useState("client");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // TOAST STATE
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // ERROR STATE (Controla as bordas vermelhas)
  const [errors, setErrors] = useState({});

  const [clientData, setClientData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
  });

  // --- HELPER: Limpa o erro ao digitar ---
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  // --- HELPER: Estilos Condicionais (Normal vs Erro) ---
  const getInputClasses = (hasError, isRedTheme = false) => `
    w-full h-14 bg-navy-light/50 rounded-xl pl-12 pr-4 transition-all outline-none border
    ${
      hasError
        ? "border-red-500 text-red-100 placeholder-red-300/50 animate-shake" // Estilo de ERRO
        : `border-white/10 text-white placeholder-white/30 focus:bg-white/5 ${isRedTheme ? "focus:border-red-400/50" : "focus:border-primary/50"}` // Estilo NORMAL
    }
  `;

  const getIconClass = (hasError, isRedTheme = false) => `
    absolute left-4 top-4 transition-colors
    ${
      hasError
        ? "text-red-500"
        : `text-white/30 group-focus-within:${isRedTheme ? "text-red-400" : "text-primary"}`
    }
  `;

  // Função do Toast
  const showFeedback = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // --- LÓGICA DO CLIENTE (OTIMIZADA - INSTANTÂNEA) ---
  const handleClientSubmit = () => {
    // 1. Validação
    const newErrors = {};
    if (!clientData.name.trim()) newErrors.name = true;

    // Limpa o telefone para validar o tamanho real (sem máscara)
    const phoneDigits = clientData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return showFeedback("Preencha nome e WhatsApp corretamente!", "warning");
    }

    // 2. Preparação dos dados
    const finalData = { ...clientData, phone: phoneDigits };

    // 3. AÇÃO IMEDIATA (Optimistic UI)
    // Liberamos o usuário AGORA, sem esperar o banco de dados
    try {
      onLogin(finalData, rememberMe);

      if (cartLength > 0) {
        onNavigate("payment");
      } else {
        onNavigate("account");
      }

      // 4. SALVA NO BANCO EM SEGUNDO PLANO (Fire & Forget)
      // O código continua rodando aqui "nas costas" enquanto o usuário navega
      supabase
        .from("clients")
        .upsert(
          { name: finalData.name, phone: finalData.phone },
          { onConflict: "phone" },
        )
        .then(({ error }) => {
          if (error)
            console.error(
              "Erro silencioso ao salvar cliente (delay Supabase):",
              error,
            );
        });
    } catch (error) {
      console.error("Erro local:", error);
      showFeedback("Erro ao entrar no app.", "error");
    }
  };

  const formatPhone = (value) => {
    // 1. Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // 2. Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, "($1) $2") // (11) 9...
        .replace(/(\d{5})(\d)/, "$1-$2"); // ...99999-9999
    }

    // Limita a 11 números (com máscara ficaria gigante, então cortamos)
    return numbers
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  // --- LÓGICA DO ADMIN (MANTIDA COM AWAIT POR SEGURANÇA) ---
  const handleAdminSubmit = async () => {
    // 1. Validação Específica
    const newErrors = {};
    if (!adminData.email.trim()) newErrors.email = true;
    if (!adminData.password.trim()) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return showFeedback("Preencha e-mail e senha.", "warning");
    }

    setLoading(true); // Admin precisa de loading pois estamos verificando senha

    try {
      // AQUI PRECISA DO AWAIT: Não podemos deixar entrar sem conferir a senha!
      const { error } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password,
      });

      if (error) throw error;

      showFeedback("Login realizado com sucesso!", "success");
      setTimeout(() => onNavigate("admin"), 500);
    } catch (error) {
      console.error("Erro admin:", error);

      // Verifica se é erro de conexão/rede
      if (
        error.message.includes("Load failed") ||
        error.name === "AuthRetryableFetchError"
      ) {
        showFeedback(
          "Servidor instável. Tente novamente em alguns segundos.",
          "warning",
        );
      } else {
        // Erro de senha ou outro
        setErrors({ email: true, password: true });
        showFeedback("Credenciais inválidas.", "error");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy p-6 animate-fade-in flex flex-col font-outfit text-white relative">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        position="center"
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => onNavigate("home")}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-xl font-bold">Identificação</h1>
      </div>

      <div className="glass-panel p-6 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        {/* TABS */}
        <div className="bg-black/20 p-1 rounded-xl flex relative mb-6">
          <button
            onClick={() => {
              setActiveTab("client");
              setErrors({});
            }}
            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === "client" ? "text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}
          >
            <ShoppingBag size={16} /> Sou Cliente
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              setErrors({});
            }}
            className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === "admin" ? "text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}
          >
            <ShieldCheck size={16} /> Sou Admin
          </button>
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 ease-out ${activeTab === "admin" ? "left-[50%] translate-x-1" : "left-1"}`}
          />
        </div>

        {/* === CLIENTE FORM === */}
        {activeTab === "client" && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Olá! 👋</h2>
              <p className="text-sm text-white/50">
                Informe seus dados para acompanhar seu pedido.
              </p>
            </div>

            {/* Input Nome */}
            <div>
              <label
                className={`text-xs font-bold uppercase ml-1 mb-2 block ${errors.name ? "text-red-400" : "text-white/40"}`}
              >
                Nome Completo
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className={getInputClasses(errors.name, false)}
                  placeholder="Ex: Ana Silva"
                  value={clientData.name}
                  onChange={(e) => {
                    setClientData({ ...clientData, name: e.target.value });
                    clearError("name");
                  }}
                />
                <User className={getIconClass(errors.name, false)} size={20} />
              </div>
            </div>

            {/* Input Telefone */}
            <div>
              <label
                className={`text-xs font-bold uppercase ml-1 mb-2 block ${errors.phone ? "text-red-400" : "text-white/40"}`}
              >
                WhatsApp
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  maxLength={15}
                  className={getInputClasses(errors.phone, false)}
                  placeholder="(15) 99999-9999"
                  value={clientData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setClientData({ ...clientData, phone: formatted });

                    // Limpa o erro se tiver digitado algo válido (pelo menos 14 chars: (xx) xxxxx-xxxx)
                    if (formatted.replace(/\D/g, "").length >= 10)
                      clearError("phone");
                  }}
                />
                <Phone
                  className={getIconClass(errors.phone, false)}
                  size={20}
                />
              </div>
            </div>

            <div
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${rememberMe ? "bg-primary border-primary" : "border-white/30"}`}
              >
                {rememberMe && <CheckSquare size={14} className="text-white" />}
              </div>
              <p className="text-xs text-white/80 select-none">
                Lembrar meus dados neste dispositivo.
              </p>
            </div>

            <button
              onClick={handleClientSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4 flex items-center justify-center"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : cartLength > 0 ? (
                "Continuar para Pagamento"
              ) : (
                "Acessar Minha Conta"
              )}
            </button>
          </div>
        )}

        {/* === ADMIN FORM === */}
        {activeTab === "admin" && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-red-400">
                Acesso Restrito 🔒
              </h2>
              <p className="text-sm text-white/50">
                Área exclusiva para gerenciamento da loja.
              </p>
            </div>

            {/* Input Email */}
            <div>
              <label
                className={`text-xs font-bold uppercase ml-1 mb-2 block ${errors.email ? "text-red-400" : "text-white/40"}`}
              >
                E-mail Admin
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className={getInputClasses(errors.email, true)}
                  placeholder="email@loja.com"
                  value={adminData.email}
                  onChange={(e) => {
                    setAdminData({ ...adminData, email: e.target.value });
                    clearError("email");
                  }}
                />
                <Mail className={getIconClass(errors.email, true)} size={20} />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label
                className={`text-xs font-bold uppercase ml-1 mb-2 block ${errors.password ? "text-red-400" : "text-white/40"}`}
              >
                Senha
              </label>
              <div className="relative group">
                <input
                  type="password"
                  className={getInputClasses(errors.password, true)}
                  placeholder="••••••••"
                  value={adminData.password}
                  onChange={(e) => {
                    setAdminData({ ...adminData, password: e.target.value });
                    clearError("password");
                  }}
                />
                <Lock
                  className={getIconClass(errors.password, true)}
                  size={20}
                />
              </div>
            </div>

            <button
              onClick={handleAdminSubmit}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} /> Acessar Painel
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupScreen;
