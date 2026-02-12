import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { Lock, AlertCircle, Eye, EyeOff, Loader, ArrowLeft } from "lucide-react";
import Toast from "../components/Toast";

const ResetPasswordScreen = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showFeedback = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleReset = async () => {
    if (formData.password.length < 6) {
      return showFeedback("A senha deve ter pelo menos 6 caracteres.", "warning");
    }
    if (formData.password !== formData.confirmPassword) {
      return showFeedback("As senhas não coincidem.", "error");
    }

    setLoading(true);
    try {
      // O comando oficial do Supabase para quem entrou via link de recuperação
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      showFeedback("Senha alterada com sucesso!", "success");
      
      // Aguarda um pouco e manda para o login/admin
      setTimeout(() => {
        onNavigate("signup"); // Ou "admin" se preferir mandar direto
      }, 2000);

    } catch (error) {
      console.error(error);
      showFeedback("Erro ao atualizar senha. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy p-6 animate-fade-in flex flex-col items-center justify-center font-outfit text-white relative">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        position="top-center"
        onClose={() => setToast({ ...toast, show: false })}
      />

      <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold">Redefinir Senha</h2>
          <p className="text-sm text-white/50 mt-2">
            Crie uma nova senha segura para sua conta.
          </p>
        </div>

        <div className="space-y-4">
          {/* Nova Senha */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase ml-1 text-white/40">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-14 bg-black/20 rounded-xl pl-12 pr-12 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute left-4 top-4 text-white/30" size={20} />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-white/30 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase ml-1 text-white/40">Confirmar Senha</label>
            <div className="relative">
              <input
                type="password"
                className="w-full h-14 bg-black/20 rounded-xl pl-12 pr-4 border border-white/10 text-white placeholder-white/30 focus:border-primary/50 outline-none transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <Lock className="absolute left-4 top-4 text-white/30" size={20} />
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : "Salvar Nova Senha"}
          </button>
          
          <button 
            onClick={() => onNavigate("signup")}
            className="w-full text-center text-xs text-white/40 hover:text-white mt-4 transition-colors"
          >
            Cancelar e voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;