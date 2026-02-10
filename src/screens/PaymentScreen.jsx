import React, { useState } from "react";
import { supabase } from "../services/supabase";
import {
  ArrowLeft,
  QrCode,
  Copy,
  Loader,
  MapPin,
  MessageCircle,
  CheckCircle,
} from "lucide-react";

const PaymentScreen = ({ onNavigate, cartItems, user, onClearCart }) => {
  const [pixPayload, setPixPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Estado do Toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // --- CONFIGURAÇÃO DO SEU PIX ---
  const PIX_KEY = import.meta.env.VITE_PIX_KEY;
  const MERCHANT_NAME = import.meta.env.VITE_MERCHANT_NAME;
  const MERCHANT_CITY = import.meta.env.VITE_MERCHANT_CITY;
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE; // Para o link do WhatsApp (sem símbolos)
  // --- FUNÇÃO FINAL: ATUALIZA STATUS E MOSTRA TOAST ---
  const handleConfirmAndExit = async () => {
    const hasCustomItems = cartItems.some(
      (item) =>
        !item.pronta_entrega && !item.is_pronta_entrega && !item.is_ready,
    );
    const newStatus = hasCustomItems ? "Em Produção" : "Retirada Pendente";

    try {
      // 1. Atualiza o status no Supabase
      if (currentOrderId) {
        await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", currentOrderId);
      }

      // ===> 2. ATUALIZA O ESTOQUE AQUI! <===
      await updateStockAfterPurchase(cartItems);

      // 3. Define a mensagem do Toast
      if (hasCustomItems) {
        setToast({
          visible: true,
          message: "Pedido em Produção! 🎨",
          subMessage:
            "Comprovante recebido. Iniciamos a confecção do seu pedido.",
        });
      } else {
        setToast({
          visible: true,
          message: "Pedido em Retirada Pendente! 📦",
          subMessage: "Comprovante recebido. Já estamos separando seus itens.",
        });
      }

      // 4. Aguarda e Redireciona
      setTimeout(() => {
        onClearCart();
        onNavigate("account");
      }, 2500);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      onClearCart();
      onNavigate("account");
    }
  };

  // --- 1. FUNÇÃO DE BAIXA NO ESTOQUE (MANTIDA) ---
  const updateStock = async (itemsToUpdate) => {
    for (const item of itemsToUpdate) {
      if (item.is_ready) {
        const sizeSold = item.isKit
          ? item.selectedSizes.standard
          : item.selectedSizes.standard;
        if (!sizeSold) continue;

        try {
          const { data: productData, error: fetchError } = await supabase
            .from("products")
            .select("available_sizes, stock_quantity")
            .eq("id", item.id)
            .single();

          if (fetchError || !productData) continue;

          const currentSizes = productData.available_sizes || [];
          const indexToRemove = currentSizes.indexOf(sizeSold);

          if (indexToRemove > -1) {
            currentSizes.splice(indexToRemove, 1);
            const newStockQty = Math.max(
              0,
              (productData.stock_quantity || 0) - 1,
            );

            await supabase
              .from("products")
              .update({
                available_sizes: currentSizes,
                stock_quantity: newStockQty,
              })
              .eq("id", item.id);
          }
        } catch (error) {
          console.error("Erro detalhado:", error);
        }
      }
    }
  };

  // --- FUNÇÃO PARA ATUALIZAR ESTOQUE ---
  const updateStockAfterPurchase = async (items) => {
    for (const item of items) {
      // Só roda se for Pronta Entrega
      if (item.pronta_entrega || item.is_pronta_entrega || item.is_ready) {
        // 1. Pega o estoque atual no banco
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (productData) {
          let currentStock = productData.stock || {};
          const qtyToRemove = parseInt(item.quantity || 1);

          // 2. Subtrai a quantidade
          if (item.category === "kit" || item.category === "kits") {
            const top = item.selectedSizes?.top;
            const bot = item.selectedSizes?.bottom;
            if (currentStock.top?.[top])
              currentStock.top[top] = Math.max(
                0,
                currentStock.top[top] - qtyToRemove,
              );
            if (currentStock.bottom?.[bot])
              currentStock.bottom[bot] = Math.max(
                0,
                currentStock.bottom[bot] - qtyToRemove,
              );
          } else {
            const std = item.selectedSizes?.standard;
            if (currentStock.standard?.[std])
              currentStock.standard[std] = Math.max(
                0,
                currentStock.standard[std] - qtyToRemove,
              );
          }

          // 3. Salva o novo estoque
          await supabase
            .from("products")
            .update({ stock: currentStock })
            .eq("id", item.id);
        }
      }
    }
  };

  // --- 2. CRIAR PEDIDO (MODIFICADO) ---
  const createOrder = async (
    paymentMethod,
    externalId = null,
    status = "Pendente",
  ) => {
    try {
      // 1. ADICIONE ESTA LINHA (Gera o ID curto):
      const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newOrder = {
        // 2. ADICIONE ESTA LINHA (Envia o ID para o banco):
        display_id: shortId,

        customer_name: user.name,
        customer_phone: user.phone,
        total: total,
        items: cartItems,
        status: status,
        payment_method: paymentMethod,
        external_payment_id: externalId,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([newOrder])
        .select()
        .single();

      if (error) throw error;

      setCurrentOrderId(data.id);
      await updateStock(cartItems);

      return data.id;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw error;
    }
  };

  const handlePixPayment = async () => {
    setLoading(true);

    try {
      // 1. BUSCA SEGURA NO BANCO OU ENV
      const { data: adminData } = await supabase
        .from("store_config")
        .select("pix_key, phone")
        .eq("id", 1)
        .maybeSingle();

      const rawKey =
        adminData?.pix_key ||
        adminData?.phone ||
        import.meta.env.VITE_PIX_KEY ||
        "";
      const merchantName = import.meta.env.VITE_MERCHANT_NAME || "David D";
      const merchantCity = import.meta.env.VITE_MERCHANT_CITY || "Sorocaba";

      if (!rawKey) {
        alert("Erro: Chave Pix não configurada.");
        setLoading(false);
        return;
      }

      // 2. TRATAMENTO DA CHAVE PIX
      let finalPixKey = rawKey.trim();
      if (!finalPixKey.includes("@")) {
        const cleanNumbers = finalPixKey.replace(/\D/g, "");
        if (cleanNumbers.length >= 10 && cleanNumbers.length <= 11) {
          finalPixKey = `+55${cleanNumbers}`;
        } else {
          finalPixKey = cleanNumbers;
        }
      }

      // --- 3. CORREÇÃO DO VALOR (AQUI ESTAVA O ERRO) ---
      // Explicação: O 'total' chegava como texto ("170.00").
      // Usamos parseFloat para forçar virar número, e replace para garantir que vírgula vire ponto.
      const numericTotal = parseFloat(String(total).replace(",", "."));

      // Verificação de segurança
      if (isNaN(numericTotal) || numericTotal <= 0) {
        throw new Error("Valor total inválido.");
      }

      // Agora sim: numericTotal é número, então .toFixed(2) funciona!
      const amountString = numericTotal.toFixed(2);

      // 4. CRIA PEDIDO
      const orderId = await createOrder(
        "pix_manual",
        {},
        "Aguardando Comprovante",
      );
      const txid = `PEDIDO${orderId.toString().replace(/\D/g, "")}`.slice(
        0,
        25,
      );

      // 5. GERA PAYLOAD
      const code = generatePixPayload(
        finalPixKey,
        merchantName,
        merchantCity,
        amountString, // <--- Envia o valor corrigido ("170.00")
        txid,
      );

      setPixPayload(code);
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Erro no pagamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO AUXILIAR PARA GERAR O PAYLOAD DO PIX (EMV) ---
  // Cole isso no FINAL do seu arquivo PaymentScreen.jsx, fora do componente principal

  function generatePixPayload(key, name, city, amount, txid) {
    const formatField = (id, value) => {
      const len = value.length.toString().padStart(2, "0");
      return `${id}${len}${value}`;
    };

    // 1. Tratamento de Strings
    const merchantName = name
      .substring(0, 25)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const merchantCity = city
      .substring(0, 15)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const txtId = txid || "***"; // Se não tiver ID, usa ***

    // 2. Montagem do Payload
    const payload = [
      formatField("00", "01"), // Payload Format Indicator
      formatField(
        "26",
        [formatField("00", "br.gov.bcb.pix"), formatField("01", key)].join(""),
      ), // Merchant Account Information
      formatField("52", "0000"), // Merchant Category Code
      formatField("53", "986"), // Transaction Currency (BRL)
      formatField("54", amount), // Transaction Amount
      formatField("58", "BR"), // Country Code
      formatField("59", merchantName), // Merchant Name
      formatField("60", merchantCity), // Merchant City
      formatField("62", formatField("05", txtId)), // Additional Data Field Template
      "6304", // CRC16 ID + Length
    ].join("");

    // 3. Cálculo do CRC16 (Polinômio 0x1021)
    const getCRC16 = (str) => {
      let crc = 0xffff;
      for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) {
            crc = (crc << 1) ^ 0x1021;
          } else {
            crc = crc << 1;
          }
        }
      }
      return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
    };

    return `${payload}${getCRC16(payload)}`;
  }
  // --- 5. ENVIAR WHATSAPP (MANTIDA) ---
  const sendProofOnWhatsApp = () => {
    const idShort = currentOrderId
      ? currentOrderId.slice(0, 8).toUpperCase()
      : "AGUARDANDO";
    const now = new Date();
    const dataHora = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    const itemsList = cartItems
      .map((item) => {
        const sizeInfo = item.isKit
          ? `(Top: ${item.selectedSizes.top} / Bot: ${item.selectedSizes.bottom})`
          : `(${item.selectedSizes.standard || "Único"})`;
        return `- ${item.quantity}x ${item.name} ${sizeInfo}`;
      })
      .join("\n");

    const message =
      `*COMPROVANTE DE PAGAMENTO* ✅\n\n` +
      `👤 *Nome:* ${user.name}\n` +
      `🔖 *Código:* #${idShort}\n` +
      `🕒 *Data:* ${dataHora}\n` +
      `💵 *Total:* R$ ${total.toFixed(2)}\n\n` +
      `📝 *Resumo:*\n${itemsList}\n\n` +
      `📸 Comprovante em anexo abaixo:
      
      
      
      `;

    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // --- 6. PAGAR RETIRADA (MANTIDA) ---
  const handlePickupPayment = async () => {
    setLoading(true);
    try {
      await createOrder("pickup", null, "Pendente");
      handleConfirmAndExit(); // Usa a mesma lógica do Toast
    } catch (error) {
      alert("Erro ao finalizar: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy p-6 animate-fade-in text-white font-outfit relative">
      {/* --- TOAST DE SUCESSO (FIXO NO TOPO) --- */}
      {toast.visible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-50 animate-slide-down">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{toast.message}</h4>
              <p className="text-xs text-white/60 leading-tight mt-0.5">
                {toast.subMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => onNavigate("cart")}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="text-xl font-bold">Pagamento</h1>
      </div>

      {!pixPayload ? (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xs text-white/40 uppercase font-bold mb-1">
              Total a Pagar
            </p>
            <p className="font-bold text-3xl text-primary">
              R$ {total.toFixed(2)}
            </p>
            <div className="h-px bg-white/10 my-3" />
            <p className="text-sm text-white/70">
              Cliente: <b className="text-white">{user.name}</b>
            </p>
          </div>

          <button
            onClick={handlePixPayment}
            disabled={loading}
            className="w-full p-5 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 text-left transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <QrCode size={24} />
              )}
            </div>
            <div>
              <p className="font-bold text-white text-lg">PIX (Copia e Cola)</p>
              <p className="text-xs text-white/50">
                Gerar código e enviar comprovante
              </p>
            </div>
          </button>

          <button
            onClick={handlePickupPayment}
            disabled={loading}
            className="w-full p-5 rounded-2xl border bg-white/5 border-white/10 hover:bg-white/10 text-left transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
              <MapPin size={24} />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Pagar na Retirada</p>
              <p className="text-xs text-white/50">Dinheiro ou Cartão</p>
            </div>
          </button>
        </div>
      ) : (
        // --- TELA DO QR CODE ---
        <div className="mt-4 max-w-md mx-auto glass-panel p-6 rounded-3xl text-center animate-slide-up bg-[#1E293B] border border-white/10 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Pagamento Pix</h2>
            <p className="text-sm text-white/60">
              Valor exato: <strong>R$ {total.toFixed(2)}</strong>
            </p>
          </div>

          <div className="w-64 h-64 bg-white rounded-2xl mx-auto mb-6 p-2 shadow-inner flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                pixPayload,
              )}`}
              alt="QR Code PIX"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6 text-left">
            <p className="text-[10px] text-white/40 uppercase font-bold mb-2">
              Pix Copia e Cola
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixPayload}
                readOnly
                className="bg-transparent text-xs text-white/70 w-full outline-none font-mono truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixPayload);
                  alert("Código copiado!");
                }}
                className="text-primary hover:text-white font-bold text-xs flex gap-1 items-center whitespace-nowrap transition-colors"
              >
                <Copy size={14} /> Copiar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* BOTÃO WHATSAPP */}
            <button
              onClick={sendProofOnWhatsApp}
              className="w-full py-3 bg-[#25D366] hover:brightness-110 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle size={18} />
              Enviar Comprovante
            </button>

            {/* BOTÃO FINALIZAR (Atualiza Status + Toast) */}
            <button
              onClick={handleConfirmAndExit}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <CheckCircle size={18} className="text-primary" />
              Já enviei, finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScreen;

// --- FUNÇÃO AUXILIAR PARA GERAR O PAYLOAD DO PIX (EMV) ---
// Cole isso no FINAL do seu arquivo PaymentScreen.jsx, fora do componente principal

function generatePixPayload(key, name, city, amount, txid) {
  const formatField = (id, value) => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  // 1. Tratamento de Strings
  const merchantName = name
    .substring(0, 25)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const merchantCity = city
    .substring(0, 15)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const txtId = txid || "***"; // Se não tiver ID, usa ***

  // 2. Montagem do Payload
  const payload = [
    formatField("00", "01"), // Payload Format Indicator
    formatField(
      "26",
      [formatField("00", "br.gov.bcb.pix"), formatField("01", key)].join(""),
    ), // Merchant Account Information
    formatField("52", "0000"), // Merchant Category Code
    formatField("53", "986"), // Transaction Currency (BRL)
    formatField("54", amount), // Transaction Amount
    formatField("58", "BR"), // Country Code
    formatField("59", merchantName), // Merchant Name
    formatField("60", merchantCity), // Merchant City
    formatField("62", formatField("05", txtId)), // Additional Data Field Template
    "6304", // CRC16 ID + Length
  ].join("");

  // 3. Cálculo do CRC16 (Polinômio 0x1021)
  const getCRC16 = (str) => {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  };

  return `${payload}${getCRC16(payload)}`;
}
