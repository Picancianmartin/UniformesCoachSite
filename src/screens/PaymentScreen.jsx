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
  const PIX_KEY = "pietra_cmartin@hotmail.com";
  const MERCHANT_NAME = "Coach Store";
  const MERCHANT_CITY = "Sorocaba";
  const ADMIN_PHONE = "551591762066";

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

  // --- 2. CRIAR PEDIDO (MANTIDA) ---
  const createOrder = async (
    paymentMethod,
    externalId = null,
    status = "Pendente",
  ) => {
    try {
      const newOrder = {
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

  // --- 3. GERAR PIX (MANTIDA) ---
  const generatePixPayload = (key, name, city, amount, txid = "***") => {
    const cleanStr = (str) =>
      str
        ? str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
        : "";
    const cleanKey = (str) => (str ? str.replace(/[^\w@.-]/g, "") : "");

    const pKey = cleanKey(key);
    const pName = cleanStr(name).substring(0, 25).toUpperCase();
    const pCity = cleanStr(city).substring(0, 15).toUpperCase();
    const pTxid = cleanStr(txid)
      .substring(0, 25)
      .replace(/[^a-zA-Z0-9]/g, "");
    const pAmount = amount.toFixed(2);

    const format = (id, value) => {
      const len = value.length.toString().padStart(2, "0");
      return `${id}${len}${value}`;
    };

    let payload =
      format("00", "01") +
      format("26", format("00", "br.gov.bcb.pix") + format("01", pKey)) +
      format("52", "0000") +
      format("53", "986") +
      format("54", pAmount) +
      format("58", "BR") +
      format("59", pName) +
      format("60", pCity) +
      format("62", format("05", pTxid || "***")) +
      "6304";

    const polynomial = 0x1021;
    let crc = 0xffff;

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc = crc << 1;
        }
      }
    }

    return payload + (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  };

  // --- 4. PAGAR PIX (MANTIDA) ---
  const handlePixPayment = async () => {
    setLoading(true);
    try {
      const orderId = await createOrder(
        "pix_manual",
        null,
        "Aguardando Comprovante",
      );

      const txid = `PEDIDO${orderId.toString().slice(0, 15)}`;
      const code = generatePixPayload(
        PIX_KEY,
        MERCHANT_NAME,
        MERCHANT_CITY,
        total,
        txid,
      );

      setPixPayload(code);
    } catch (error) {
      alert("Erro ao gerar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      `📸 Comprovante em anexo abaixo:`;

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
