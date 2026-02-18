import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  DonutChart,
  Card,
  Title,
  Text,
  Metric,
  Grid,
  DateRangePicker,
  Flex,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
} from "@tremor/react";
import {
  ArrowLeft,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Filter,
  X,
  ChevronRight,
} from "lucide-react";
import { ptBR } from "date-fns/locale";
import { subDays, format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { supabase } from "../services/supabase";

// --- TEMA LIMPO E SÓLIDO ---
const THEME = {
  bg: "bg-[#000D23]", // Fundo Principal (Brand Navy)
  card: "bg-[#051e47]", // Fundo Card Sólido
  border: "border-[#007BBA]/20",
  activeBorder: "border-[#007BBA]",
  textSub: "text-slate-400",
  textHigh: "text-white",
  colors: {
    primary: "sky", // Ciano #007BBA
    secondary: "orange", // Laranja #FF5D00
    neutral: "slate",
  },
};

// --- FORMATADORES ---
const currencyFormatter = (number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number || 0,
  );

const compactFormatter = (number) =>
  Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number || 0);
// --- COMPONENTES VISUAIS CORRIGIDOS ---

// 1. KPI Clean (Correção do Erro: Icon)
const KpiCard = ({ title, value, icon, color, isActive, onClick, subtext }) => {
  // CORREÇÃO AQUI: Atribuição explícita para garantir que o React encontre o componente
  const IconComponent = icon;
  const isSelected = isActive;

  // Cores dinâmicas
  const iconColor = color === "orange" ? "text-orange-500" : "text-sky-500";
  const iconBg = color === "orange" ? "bg-orange-500/10" : "bg-sky-500/10";
  const borderColor = isSelected
    ? color === "orange"
      ? "border-orange-500"
      : "border-sky-500"
    : "border-white/5";

  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-200 border
        ${THEME.card} ${borderColor} hover:bg-[#0a275c]
        ${isSelected ? "shadow-[0_0_20px_rgba(0,123,186,0.15)]" : "shadow-sm"}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          {/* Usa a variável segura IconComponent */}
          <IconComponent size={24} />
        </div>
      </div>
      {subtext && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${color === "orange" ? "bg-orange-500" : "bg-sky-500"}`}
          ></span>
          <p className="text-xs text-slate-400 font-medium">{subtext}</p>
        </div>
      )}
    </div>
  );
};

// 2. Lista de Coleções
const CollectionRow = ({ item, onClick, isActive }) => (
  <div
    onClick={() => onClick(item.name)}
    className={`
      group flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition-all border border-transparent
      ${isActive ? "bg-sky-500/10 border-sky-500/30" : "hover:bg-white/5"}
    `}
  >
    <div className="flex-1 pr-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span
          className={`font-medium ${isActive ? "text-sky-400" : "text-slate-200"}`}
        >
          {item.name}
        </span>
        <span className="text-slate-400 text-xs">{item.value} vendas</span>
      </div>
      <div className="w-full h-1.5 bg-[#000D23] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-sky-400" : "bg-sky-600/60 group-hover:bg-sky-500"}`}
          style={{ width: `${item.percent}%` }}
        />
      </div>
    </div>
    <ChevronRight
      size={16}
      className={`text-slate-600 ${isActive ? "text-sky-400" : "group-hover:text-slate-400"}`}
    />
  </div>
);

// --- TOOLTIP PERSONALIZADO (FIX UI/UX) ---
const CustomTooltip = ({ payload, active, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#051e47] border border-cyan-500/50 p-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
      <p className="text-slate-300 text-xs mb-1 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        <p className="text-white font-bold text-lg font-mono">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(payload[0].value)}
        </p>
      </div>
    </div>
  );
};

export default function DashboardAdmin({ onNavigate }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const setQuickDate = (type) => {
    const today = new Date();
    let from,
      to = today;
    switch (type) {
      case "today":
        from = today;
        break;
      case "7d":
        from = subDays(today, 7);
        break;
      case "30d":
        from = subDays(today, 30);
        break;
      case "month":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      default:
        return;
    }
    setDateRange({ from, to });
  };

  const activePreset = useMemo(() => {
    const { from, to } = dateRange;
    if (!from || !to) return null;
    const today = new Date();
    if (isSameDay(from, today) && isSameDay(to, today)) return "today";
    if (isSameDay(from, subDays(today, 7))) return "7d";
    if (isSameDay(from, subDays(today, 30))) return "30d";
    if (
      isSameDay(from, startOfMonth(today)) &&
      isSameDay(to, endOfMonth(today))
    )
      return "month";
    return null;
  }, [dateRange]);

  const [activeFilter, setActiveFilter] = useState(null);

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
    // Inicialização segura
    const defaultData = {
      totalFaturamento: 0,
      totalPedidos: 0,
      ticketMedio: 0,
      chartPagamentos: [],
      chartColecoes: [],
      chartEvolucao: [],
      recentOrders: [],
    };
    if (!rawData || !rawData.length) return defaultData;

    const filtered = rawData.filter((item) => {
      if (dateRange?.from) {
        const d = new Date(item.data_venda);
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.to ? new Date(dateRange.to) : new Date();
        end.setHours(23, 59, 59, 999);
        if (d < start || d > end) return false;
      }
      if (activeFilter) {
        if (activeFilter.type === "payment") {
          let m = item.pagamento ? item.pagamento.toLowerCase() : "";
          let label = m.includes("pix")
            ? "Pix"
            : m.includes("card") || m.includes("cartao")
              ? "Máquina"
              : "Outros";
          if (label !== activeFilter.value) return false;
        }
        if (activeFilter.type === "collection") {
          if (item.colecao !== activeFilter.value) return false;
        }
      }
      return true;
    });

    const totalFaturamento = filtered.reduce(
      (acc, c) => acc + (parseFloat(c.valor_total_item) || 0),
      0,
    );
    const totalPedidos = new Set(filtered.map((d) => d.id_pedido)).size;
    const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

    const pags = filtered.reduce((acc, c) => {
      let val = parseFloat(c.valor_total_item) || 0;
      let m = c.pagamento ? c.pagamento.toLowerCase() : "";
      let label;
      if (m.includes("pix")) {
        label = "Pix";
      } else if (
        m.includes("card") ||
        m.includes("cartao") ||
        m.includes("credit")
      ) {
        label = "Máquina";
      } else if (m.includes("pickup")) {
        label = "Na Retirada"; // <--- Mudamos de 'Outros' para 'Na Retirada'
      } else {
        label = "Outros";
      }

      acc[label] = (acc[label] || 0) + val;
      return acc;
    }, {});
    const chartPagamentos = Object.keys(pags).map((name) => ({
      name,
      value: pags[name],
    }));

    const cols = filtered.reduce((acc, c) => {
      let qtd = parseInt(c.quantidade) || 0;
      if (c.colecao) acc[c.colecao] = (acc[c.colecao] || 0) + qtd;
      return acc;
    }, {});
    const maxCol = Math.max(...Object.values(cols), 1);
    const chartColecoes = Object.keys(cols)
      .map((name) => ({
        name,
        value: cols[name],
        percent: (cols[name] / maxCol) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    const evoMap = filtered.reduce((acc, c) => {
      const d = new Date(c.data_venda);
      const key = format(d, "yyyy-MM-dd");
      const label = format(d, "dd/MM");
      if (!acc[key]) acc[key] = { date: label, Vendas: 0, sortKey: key };
      acc[key].Vendas += parseFloat(c.valor_total_item) || 0;
      return acc;
    }, {});
    const chartEvolucao = Object.values(evoMap).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );

    const ordersMap = new Map();
    filtered.forEach((item) => {
      if (!ordersMap.has(item.id_pedido)) {
        ordersMap.set(item.id_pedido, {
          id: item.id_pedido,
          cliente: item.cliente,
          status: item.status,
          total: 0,
        });
      }
      ordersMap.get(item.id_pedido).total +=
        parseFloat(item.valor_total_item) || 0;
    });
    const recentOrders = Array.from(ordersMap.values()).slice(0, 6);

    return {
      totalFaturamento,
      totalPedidos,
      ticketMedio,
      chartPagamentos,
      chartColecoes,
      chartEvolucao,
      recentOrders,
    };
  }, [dateRange, rawData, activeFilter]);

  const toggleFilter = (type, value) => {
    if (activeFilter?.type === type && activeFilter?.value === value)
      setActiveFilter(null);
    else setActiveFilter({ type, value });
  };
  const clearFilters = () => setActiveFilter(null);

  if (loading)
    return (
      <div
        className={`min-h-screen ${THEME.bg} flex items-center justify-center`}
      >
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${THEME.bg} text-white p-6 lg:p-10 font-sans selection:bg-sky-500/30`}
    >
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("admin")}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Visão Geral
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs text-slate-400 font-medium">
                Atualizado em tempo real
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {activeFilter && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 rounded-lg flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
            >
              <X size={14} /> Limpar {activeFilter.value}
            </button>
          )}

          {/* CÁPSULA DE DATA */}
          <div className="flex items-center bg-[#051e47] p-1 rounded-xl border border-white/10 shadow-sm w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center gap-1 pr-2 border-r border-white/10 mr-2">
              {[
                { label: "Hoje", key: "today" },
                { label: "7D", key: "7d" },
                { label: "30D", key: "30d" },
                { label: "Mês", key: "month" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setQuickDate(btn.key)}
                  className={`
                    px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap
                    ${
                      activePreset === btn.key
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="min-w-[220px]">
              <DateRangePicker
                className="border-0 ring-0 shadow-none bg-transparent hover:bg-transparent w-full"
                value={dateRange}
                onValueChange={setDateRange}
                locale={ptBR}
                selectPlaceholder="Personalizado"
                placeholder="Selecionar data"
                enableYearNavigation={true}
                color="sky"
              />
            </div>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-8">
        <KpiCard
          title="Faturamento"
          value={compactFormatter(data.totalFaturamento)}
          icon={Wallet}
          color="cyan"
          subtext="Receita total no período"
          isActive={false}
        />
        <KpiCard
          title="Pedidos"
          value={data.totalPedidos}
          icon={ShoppingBag}
          color="blue"
          subtext="Vendas confirmadas"
        />
        <KpiCard
          title="Ticket Médio"
          value={currencyFormatter(data.ticketMedio)}
          icon={TrendingUp}
          color="orange"
          subtext="Média por venda"
        />
      </Grid>

      {/* GRÁFICOS */}
      <Grid numItems={1} numItemsLg={3} className="gap-6 mb-8">
        {/* GRÁFICO DE ÁREA (Evolução) */}
        <Card
          className={`lg:col-span-2 ${THEME.card} border-white/5 ring-0 rounded-2xl shadow-lg`}
        >
          <div className="mb-6">
            <Title className="text-white">Tendência de Vendas</Title>
            <Text className="text-slate-400">
              Evolução diária do faturamento.
            </Text>
          </div>
          <div className="h-72 w-full">
            <AreaChart
              className="h-full [&_text]:!fill-white"
              data={data.chartEvolucao}
              index="date"
              categories={["Vendas"]}
              colors={["cyan"]}
              // MUDANÇA 1: Formatter simples para o Eixo Y (evita o ",6 mil")
              valueFormatter={(number) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                  maximumFractionDigits: 0, // Remove decimais do eixo para limpar a vista
                }).format(number)
              }
              // MUDANÇA 2: Tooltip customizado (O visual Neon)
              customTooltip={CustomTooltip}
              yAxisWidth={48}
              showAnimation={true}
              // MUDANÇA 3: Ativar GridLines sutis para ajudar na leitura
              showGridLines={true}
              showLegend={false}
              curveType="monotone"
              showGradient={true}
            />
          </div>
        </Card>

        {/* DONUT (Pagamentos) - Corrigido */}
        <Card
          className={`lg:col-span-1 ${THEME.card} border-white/5 ring-0 rounded-2xl shadow-lg flex flex-col relative`}
        >
          <div className="flex justify-between items-center mb-2">
            <Title className="text-white">Pagamentos</Title>
            {activeFilter?.type === "payment" && (
              <Badge size="xs" color="sky">
                Filtrado
              </Badge>
            )}
          </div>
          <Text className="text-slate-400 text-xs mb-6">
            Distribuição por método.
          </Text>

          <div className="flex-1 flex flex-col items-center justify-center">
            <DonutChart
              // ORDEM FORÇADA: 1. Pix, 2. Máquina, 3. Outros
              data={[...data.chartPagamentos].sort((a, b) => {
                const order = { Pix: 1, Máquina: 2, Outros: 3 };
                return (order[a.name] || 99) - (order[b.name] || 99);
              })}
              category="value"
              index="name"
              valueFormatter={compactFormatter}
              // CORES SEGURAS: Amber (Laranja), Sky (Azul), Violet (Roxo)
              colors={["amber", "sky", "violet"]}
              variant="donut"
              showAnimation={true}
              className="h-48 cursor-pointer hover:opacity-80 transition-opacity [&_text]:!fill-white"
              onValueChange={(v) => toggleFilter("payment", v.name || v)}
            />

            {/* LEGENDA MANUAL (Sincronizada com as cores acima) */}
            <div className="flex gap-4 mt-6 justify-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                <span
                  className={`text-xs ${activeFilter?.value === "Na Retirada" ? "text-white font-bold" : "text-slate-400"}`}
                >
                  Na Retirada
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                <span
                  className={`text-xs ${activeFilter?.value === "Pix" ? "text-white font-bold" : "text-slate-400"}`}
                >
                  Pix
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"></div>
                <span
                  className={`text-xs ${activeFilter?.value === "Máquina" ? "text-white font-bold" : "text-slate-400"}`}
                >
                  Máquina
                </span>
              </div>
            </div>

            {/* --- TRUQUE DE SEGURANÇA (SAFELIST) --- */}
            {/* Isso força o Tailwind a incluir as cores do gráfico no CSS final */}
            <div className="hidden fill-amber-500 fill-sky-500 fill-violet-500 text-amber-500 text-sky-500 text-violet-500"></div>
          </div>
        </Card>
      </Grid>

      {/* SEÇÃO INFERIOR */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card
          className={`${THEME.card} border-white/5 ring-0 rounded-2xl shadow-lg`}
        >
          <div className="flex justify-between items-center mb-4">
            <Title className="text-white">Top Coleções</Title>
            {activeFilter?.type === "collection" && (
              <Badge size="xs" color="sky">
                {activeFilter.value}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {data.chartColecoes.map((item) => (
              <CollectionRow
                key={item.name}
                item={item}
                onClick={() => toggleFilter("collection", item.name)}
                isActive={
                  activeFilter?.type === "collection" &&
                  activeFilter.value === item.name
                }
              />
            ))}
          </div>
        </Card>

        <Card
          className={`${THEME.card} border-white/5 ring-0 rounded-2xl shadow-lg overflow-hidden p-0`}
        >
          <div className="p-6 pb-4 border-b border-white/5">
            <Title className="text-white">Últimas Transações</Title>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="border-b border-white/5">
                  <TableHeaderCell className="text-slate-500 pl-6 font-medium">
                    Cliente
                  </TableHeaderCell>
                  <TableHeaderCell className="text-slate-500 font-medium">
                    Situação
                  </TableHeaderCell>
                  <TableHeaderCell className="text-slate-500 text-right pr-6 font-medium">
                    Valor
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <TableCell className="text-slate-200 font-medium pl-6 py-4">
                        {item.cliente || "Consumidor"}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          size="xs"
                          color={
                            ["paid", "concluído"].includes(item.status)
                              ? "emerald"
                              : ["pending", "aguardando_comprovante"].includes(
                                    item.status,
                                  )
                                ? "amber"
                                : "rose"
                          }
                        >
                          {item.status === "paid"
                            ? "Pago"
                            : item.status === "pending"
                              ? "Pendente"
                              : item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-white font-mono pr-6 py-4">
                        {currencyFormatter(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-12 text-slate-500"
                    >
                      Sem dados para exibir.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
