import React, { useEffect, useState, useMemo, useRef } from "react";
import { Card, Title, Text, Grid, Badge, Button } from "@tremor/react";
import {
  ArrowLeft,
  Wallet,
  ShoppingBag,
  Users,
  Download,
  Calendar,
  X,
  Check,
} from "lucide-react";
import {
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  isSameDay,
  startOfDay,
  endOfDay,
  isValid,
  parse,
} from "date-fns";
import { supabase } from "../services/supabase";
import { exportToExcel } from "../utils/exportToExcel";

// --- TEMA LIMPO E SÓLIDO ---
const THEME = {
  bg: "bg-[#000D23]",
  card: "bg-[#051e47]",
  colors: { primary: "sky", secondary: "orange" },
};

const DEFAULT_RANGE = {
  from: startOfDay(subDays(new Date(), 29)),
  to: endOfDay(new Date()),
};

// --- HELPERS (datas digitadas) ---
function parseBRDate(value) {
  if (!value) return undefined;

  const raw = String(value).trim();

  // aceita "ddMMyyyy" (8 dígitos)
  const onlyDigits = raw.replace(/\D/g, "");
  let v = raw;

  if (onlyDigits.length === 8) {
    v = `${onlyDigits.slice(0, 2)}/${onlyDigits.slice(2, 4)}/${onlyDigits.slice(4, 8)}`;
  }

  const formats = ["dd/MM/yyyy", "d/M/yyyy", "d/MM/yyyy", "dd/M/yyyy"];

  for (const f of formats) {
    const d = parse(v, f, new Date());
    if (isValid(d)) return d;
  }

  return undefined;
}

function sanitizeTypingDate(value) {
  // deixa digitar livremente, só bloqueia caracteres ruins e limita tamanho
  return (value || "").replace(/[^\d/]/g, "").slice(0, 10);
}

function normalizeTypedDate(value) {
  if (!value) return "";
  const raw = String(value).trim();

  // se veio só números e tiver 8 dígitos, normaliza para dd/MM/yyyy
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  // se já tem /, só retorna (mantém edição livre)
  return raw.slice(0, 10);
}

function normalizeRange(range) {
  if (!range) return { from: undefined, to: undefined };

  let from = range.from;
  let to = range.to;

  if (from && !isValid(from)) from = undefined;
  if (to && !isValid(to)) to = undefined;

  return {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  };
}

// --- FORMATADORES ---
const currencyFormatter = (number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number || 0,
  );

// --- COMPONENTES VISUAIS ---
const KpiCard = ({ title, value, icon, color, subtext }) => {
  const IconComponent = icon;
  const iconColor =
    color === "orange"
      ? "text-orange-500"
      : color === "emerald"
        ? "text-emerald-500"
        : "text-sky-500";
  const iconBg =
    color === "orange"
      ? "bg-orange-500/10"
      : color === "emerald"
        ? "bg-emerald-500/10"
        : "bg-sky-500/10";

  return (
    <div
      className={`relative p-6 rounded-2xl border border-white/5 shadow-sm ${THEME.card} flex flex-col justify-between h-full`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-all">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
          <IconComponent size={24} />
        </div>
      </div>

      {subtext && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              color === "orange"
                ? "bg-orange-500"
                : color === "emerald"
                  ? "bg-emerald-500"
                  : "bg-sky-500"
            }`}
          />
          <p className="text-xs text-slate-400 font-medium">{subtext}</p>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function DashboardAdmin({ onNavigate }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState(DEFAULT_RANGE);

  // Inputs digitáveis (sem mini-calendário)
  const [startText, setStartText] = useState(
    DEFAULT_RANGE?.from ? format(DEFAULT_RANGE.from, "dd/MM/yyyy") : "",
  );
  const [endText, setEndText] = useState(
    DEFAULT_RANGE?.to ? format(DEFAULT_RANGE.to, "dd/MM/yyyy") : "",
  );
  const [startInvalid, setStartInvalid] = useState(false);
  const [endInvalid, setEndInvalid] = useState(false);

  const [datesFocused, setDatesFocused] = useState(false);

  const [hideApplyUntilEdit, setHideApplyUntilEdit] = useState(false);

  const currentStart = dateRange?.from
    ? format(dateRange.from, "dd/MM/yyyy")
    : "";
  const currentEnd = dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "";

  // se o usuário digitou algo diferente do que está aplicado no filtro
  const datesDirty = startText !== currentStart || endText !== currentEnd;

  // valida para habilitar o ✔
  const startParsed = parseBRDate(normalizeTypedDate(startText));
  const endParsed = parseBRDate(normalizeTypedDate(endText));

  const canApply =
    (!startText || !!startParsed) &&
    (!endText || !!endParsed) &&
    // opcional: evita aplicar só com 1 char
    (startText.length === 0 || startText.length >= 6) &&
    (endText.length === 0 || endText.length >= 6);

  const showApply = (datesFocused || datesDirty) && !hideApplyUntilEdit;

  const startRef = useRef(null);
  const endRef = useRef(null);

  // evita aplicar duas vezes quando a gente dá blur programático
  const skipNextBlurApply = useRef(false);

  const blurDateInputs = () => {
    startRef.current?.blur();
    endRef.current?.blur();
    // segurança: se foco estiver no botão ✔
    if (document?.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const applyFromButton = () => {
    const s = normalizeTypedDate(startText);
    const e = normalizeTypedDate(endText);
    setStartText(s);
    setEndText(e);

    skipNextBlurApply.current = true;
    applyTypedRange(s, e);

    setHideApplyUntilEdit(true); // ✅ some após clicar
    setDatesFocused(false);

    requestAnimationFrame(() => blurDateInputs()); // dá blur nos inputs após aplicar, para evitar confusão
  };

  // Atualiza dateRange e sincroniza inputs SEM useEffect
  const setRangeAndSyncInputs = (nextRange) => {
    const norm = normalizeRange(nextRange);

    setDateRange(norm);

    if (!norm?.from && !norm?.to) {
      setStartText("");
      setEndText("");
    } else {
      setStartText(norm?.from ? format(norm.from, "dd/MM/yyyy") : "");
      setEndText(norm?.to ? format(norm.to, "dd/MM/yyyy") : "");
    }

    setStartInvalid(false);
    setEndInvalid(false);
  };

  const setQuickDate = (type) => {
    const today = new Date();
    let from;
    let to = today;

    switch (type) {
      case "today":
        from = today;
        to = today;
        break;
      case "7d":
        from = subDays(today, 6);
        to = today;
        break;
      case "30d":
        from = subDays(today, 29);
        to = today;
        break;
      case "month":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "6m":
        from = subDays(today, 179);
        to = today;
        break;
      case "all":
        setRangeAndSyncInputs({ from: undefined, to: undefined });
        return;
      default:
        return;
    }

    setRangeAndSyncInputs({ from, to });
  };

  const applyTypedRange = (nextStartText, nextEndText) => {
    const start = parseBRDate(nextStartText);
    const end = parseBRDate(nextEndText);

    setStartInvalid(!!nextStartText && !start);
    setEndInvalid(!!nextEndText && !end);

    // Ambos vazios => Todos
    if (!nextStartText && !nextEndText) {
      setRangeAndSyncInputs({ from: undefined, to: undefined });
      return;
    }

    // Só início => 1 dia
    if (start && !end && !nextEndText) {
      setRangeAndSyncInputs({ from: start, to: start });
      return;
    }

    // Só fim => 1 dia
    if (!start && end && !nextStartText) {
      setRangeAndSyncInputs({ from: end, to: end });
      return;
    }

    // Ambos válidos
    if (start && end) {
      const from = start <= end ? start : end;
      const to = start <= end ? end : start;
      setRangeAndSyncInputs({ from, to });
    }
  };

  const activePreset = useMemo(() => {
    const { from, to } = dateRange || {};
    if (!from && !to) return "all";
    if (!from || !to) return null;

    const today = new Date();
    if (isSameDay(from, today) && isSameDay(to, today)) return "today";
    if (isSameDay(from, subDays(today, 6)) && isSameDay(to, today)) return "7d";
    if (isSameDay(from, subDays(today, 29)) && isSameDay(to, today))
      return "30d";
    if (
      isSameDay(from, startOfMonth(today)) &&
      isSameDay(to, endOfMonth(today))
    )
      return "month";
    if (isSameDay(from, subDays(today, 179)) && isSameDay(to, today))
      return "6m";

    return null;
  }, [dateRange]);

  useEffect(() => {
    async function fetchData() {
      const { data: result } = await supabase
        .from("view_dashboard_mestre")
        .select("*");
      if (result) setRawData(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  const data = useMemo(() => {
    const defaultData = {
      totalFaturamento: 0,
      totalPedidos: 0,
      totalUsuarios: 0,
      filtered: [],
    };
    if (!rawData || !rawData.length) return defaultData;

    const filtered = rawData
      .filter((item) => {
        const start = dateRange?.from;
        if (!start) return true;

        const end = dateRange?.to ?? endOfDay(start);
        const d = new Date(item.data_venda);

        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda));

    const totalFaturamento = filtered.reduce(
      (acc, c) => acc + (parseFloat(c.valor_total_item) || 0),
      0,
    );
    const totalPedidos = new Set(filtered.map((d) => d.id_pedido)).size;
    const totalUsuarios = new Set(
      filtered.map((d) => d.cliente?.trim().toLowerCase()).filter(Boolean),
    ).size;

    return { totalFaturamento, totalPedidos, totalUsuarios, filtered };
  }, [dateRange, rawData]);

  const handleDownloadExcel = async () => {
    await exportToExcel({
      filtered: data.filtered,
      kpis: {
        faturamento: data.totalFaturamento,
        pedidos: data.totalPedidos,
        usuarios: data.totalUsuarios,
      },
      dateRange,
    });
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${THEME.bg} flex items-center justify-center`}
      >
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${THEME.bg} text-white p-4 sm:p-6 lg:p-10 font-sans selection:bg-sky-500/30 pb-20 overflow-x-hidden`}
    >
      <header className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onNavigate("admin")}
            aria-label="Voltar para Admin"
            className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 shadow-sm backdrop-blur-xl transition
                 hover:bg-white/[0.06] hover:text-white
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Estatísticas de Vendas
              </h1>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Dashboard executivo
              </span>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Analise performance por período e acompanhe tendências.
            </p>
          </div>
        </div>

        <div className="w-full xl:w-auto">
          {/* Ajuste na barra de filtros: flex-col no mobile, md:flex-row e wrap para não quebrar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-lg backdrop-blur-xl md:flex-row md:flex-wrap lg:flex-nowrap items-stretch md:items-center">
            {/* Presets */}
            <div
              role="tablist"
              aria-label="Períodos rápidos"
              className="flex flex-wrap items-center gap-1 rounded-xl bg-black/20 p-1 md:flex-nowrap"
            >
              {[
                { label: "Hoje", key: "today" },
                { label: "7 dias", key: "7d" },
                { label: "30 dias", key: "30d" },
                { label: "Este mês", key: "month" },
                { label: "6 meses", key: "6m" },
                { label: "Todos", key: "all" },
              ].map((btn) => {
                const active = activePreset === btn.key;
                return (
                  <button
                    key={btn.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setQuickDate(btn.key)}
                    className={[
                      "px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap flex-1 md:flex-none text-center",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
                      active
                        ? "bg-sky-500 text-white shadow-sm"
                        : "text-slate-300/80 hover:text-white hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>

            {/* Datas digitáveis */}
            <div
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-3 py-2
             focus-within:ring-2 focus-within:ring-sky-500/40"
              onFocusCapture={() => setDatesFocused(true)}
              onBlurCapture={() => setDatesFocused(false)}
            >
              <Calendar size={18} className="shrink-0 text-slate-300/70" />

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-[16px] flex-1">
                  <label className="sr-only">Data início</label>
                  <input
                    ref={startRef}
                    value={startText}
                    onChange={(e) => {
                      setHideApplyUntilEdit(false);
                      setStartText(sanitizeTypingDate(e.target.value));
                    }}
                    onBlur={() => {
                      const s = normalizeTypedDate(startText);
                      const ed = normalizeTypedDate(endText);
                      setStartText(s);
                      setEndText(ed);

                      if (skipNextBlurApply.current) {
                        skipNextBlurApply.current = false;
                        return;
                      }
                      applyTypedRange(s, ed);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyFromButton();
                      }
                    }}
                    inputMode="numeric"
                    placeholder="Início (dd/mm/aaaa)"
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-sm text-white placeholder:text-slate-400",
                      "bg-white/[0.03] border-white/10 outline-none",
                      "focus:ring-2 focus:ring-sky-500/40",
                      startInvalid ? "border-rose-500/60" : "",
                    ].join(" ")}
                  />
                </div>

                <span className="hidden sm:block text-slate-400/60">—</span>

                <div className="min-w-[16px] flex-1">
                  <label className="sr-only">Data fim</label>
                  <input
                    ref={endRef}
                    value={endText}
                    onChange={(e) => {
                      setHideApplyUntilEdit(false);
                      setEndText(sanitizeTypingDate(e.target.value));
                    }}
                    onBlur={() => {
                      const s = normalizeTypedDate(startText);
                      const ed = normalizeTypedDate(endText);
                      setStartText(s);
                      setEndText(ed);

                      if (skipNextBlurApply.current) {
                        skipNextBlurApply.current = false;
                        return;
                      }
                      applyTypedRange(s, ed);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyFromButton();
                      }
                    }}
                    inputMode="numeric"
                    placeholder="Fim (dd/mm/aaaa)"
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-sm text-white placeholder:text-slate-400",
                      "bg-white/[0.03] border-white/10 outline-none",
                      "focus:ring-2 focus:ring-sky-500/40",
                      endInvalid ? "border-rose-500/60" : "",
                    ].join(" ")}
                  />
                </div>
              </div>

              {/* ✔ Aplicar */}
              {showApply && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={applyFromButton}
                  disabled={!canApply}
                  aria-label="Aplicar período"
                  className={[
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition",
                    "border-emerald-500/25 bg-emerald-500/15 text-emerald-200",
                    "hover:bg-emerald-500/25 hover:text-emerald-100",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/15",
                  ].join(" ")}
                  title="Aplicar período"
                >
                  <Check size={16} />
                </button>
              )}

              {/* Limpar */}
              {(dateRange?.from || startText || endText) && (
                <button
                  onClick={() => setQuickDate("all")}
                  aria-label="Limpar período"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300/70 transition
                 hover:bg-white/[0.06] hover:text-white
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* KPI GRID - Ajustado para ser responsivo (1 coluna no mobile, 2 tablet, 3 PC) */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-8">
        <KpiCard
          title="Pedidos Realizados"
          value={data.totalPedidos}
          icon={ShoppingBag}
          color="sky"
          subtext="Volumes gerados"
        />
        <KpiCard
          title="Usuários Únicos"
          value={data.totalUsuarios}
          icon={Users}
          color="emerald"
          subtext="Clientes distintos"
        />
        <KpiCard
          title="Faturamento Total"
          value={currencyFormatter(data.totalFaturamento)}
          icon={Wallet}
          color="orange"
          subtext="Receita no período"
        />
      </Grid>

      {/* RELATÓRIO / TABELA */}
      <Card
        className={`${THEME.card} border-white/5 ring-0 rounded-2xl shadow-lg overflow-hidden p-0 mb-8 w-full`}
      >
        <div className="p-4 sm:p-6 pb-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title className="text-white">Relatório Detalhado de Vendas</Title>
            <Text className="text-slate-400 text-xs sm:text-sm">
              Listagem completa dos itens vendidos no período.
            </Text>
          </div>
          <Button
            icon={Download}
            color="emerald"
            onClick={handleDownloadExcel}
            disabled={!data?.filtered?.length}
            className="w-full sm:w-auto"
          >
            Exportar Excel
          </Button>
        </div>

        {/* Wrapper de Scroll Horizontal com min-w para a tabela não espremer */}
        <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto bg-[#000D23]/50 rounded-b-2xl border-t border-white/10">
          <table className="w-full min-w-[900px] text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-[#0a275c] z-10 shadow-md">
              <tr>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Data
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Cliente
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Produto
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Coleção
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap">
                  Qtd
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Situação
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                  Pagamento
                </th>
                <th className="border border-white/10 px-3 py-2 text-slate-300 font-semibold text-xs uppercase tracking-wider text-right whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.filtered?.length > 0 ? (
                data.filtered.map((item, index) => (
                  <tr
                    key={`${item.id_pedido}-${index}`}
                    className="hover:bg-white/10 transition-colors group"
                  >
                    <td className="border border-white/10 px-3 py-1.5 text-slate-400 whitespace-nowrap">
                      {format(new Date(item.data_venda), "dd/MM/yy HH:mm")}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-white font-medium whitespace-nowrap truncate max-w-[150px]">
                      {item.cliente || "Consumidor"}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-slate-300 min-w-[200px]">
                      {item.produto}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-slate-400">
                      {item.colecao || "-"}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-sky-400 text-center font-mono font-bold bg-sky-500/5 group-hover:bg-transparent transition-colors">
                      {item.quantidade}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 whitespace-nowrap">
                      <Badge
                        size="xs"
                        color={
                          ["paid", "concluído", "pronto_retirada"].includes(
                            item.status,
                          )
                            ? "emerald"
                            : [
                                  "pending",
                                  "aguardando_comprovante",
                                  "em_produção",
                                ].includes(item.status)
                              ? "amber"
                              : "rose"
                        }
                      >
                        {item.status === "paid"
                          ? "Pago"
                          : item.status === "pending"
                            ? "Pendente"
                            : item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-slate-400 capitalize">
                      {item.pagamento === "credit_card"
                        ? "Cartão"
                        : item.pagamento === "pickup"
                          ? "Retirada"
                          : item.pagamento || "-"}
                    </td>
                    <td className="border border-white/10 px-3 py-1.5 text-right text-emerald-400 font-mono font-medium whitespace-nowrap bg-emerald-500/5 group-hover:bg-transparent transition-colors">
                      {currencyFormatter(
                        parseFloat(item.valor_total_item) || 0,
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-white/10 text-center py-16 text-slate-500"
                  >
                    Nenhum pedido encontrado neste período.
                  </td>
                </tr>
              )}
            </tbody>
            {/* --- NOVA LINHA DE TOTAIS --- */}
            {data?.filtered?.length > 0 && (
              <tfoot className="sticky bottom-0 bg-[#051e47] z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
                <tr>
                  <td
                    colSpan={4}
                    className="border border-white/10 px-3 py-3 text-right text-slate-300 font-bold uppercase tracking-wider text-xs whitespace-nowrap"
                  >
                    Totais do Período:
                  </td>
                  <td className="border border-white/10 px-3 py-3 text-sky-400 text-center font-mono font-bold text-base bg-sky-500/10">
                    {data.filtered.reduce(
                      (acc, curr) => acc + (Number(curr.quantidade) || 0),
                      0,
                    )}
                  </td>
                  <td
                    colSpan={2}
                    className="border border-white/10 px-3 py-3 bg-[#0a275c]/50"
                  ></td>
                  <td className="border border-white/10 px-3 py-3 text-right text-emerald-400 font-mono font-bold text-base bg-emerald-500/10 whitespace-nowrap">
                    {currencyFormatter(
                      data.filtered.reduce(
                        (acc, curr) =>
                          acc + (Number(curr.valor_total_item) || 0),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}