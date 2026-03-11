import { format } from "date-fns";

export async function exportToExcel({
  filtered,
  kpis,
  dateRange,
  fileNamePrefix = "relatorio_vendas",
}) {
  if (!filtered?.length) return;

  const mod = await import("exceljs");
  const ExcelJS = mod.default ?? mod;

  const currencyFormatter = (number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number || 0);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema Coach";
  workbook.created = new Date();

  // ==========================================
  // MATEMÁTICA E PROCESSAMENTO DE DADOS
  // ==========================================
  const resumo = {
    colecoes: {},
    dias: {},
    pagamentos: {
      Cartão: 0,
      "Máquina/Dinheiro/Retirada": 0,
      Pix: 0,
      Outros: 0,
    },
    produtos: {},
    genero: { Mulheres: 0, Homens: 0, "Não Identificado": 0 },
  };

  const pedidosPagosSet = new Set();

  filtered.forEach((item) => {
    const qtd = Number(item.quantidade || 0);
    const cliente = String(item.cliente || "")
      .trim()
      .toLowerCase();
    const status = String(item.status || "").toLowerCase();

    if (
      status.includes("paid") ||
      status.includes("pago") ||
      status.includes("conclu") ||
      status.includes("retirada")
    ) {
      if (item.id_pedido) pedidosPagosSet.add(item.id_pedido);
    }

    const col = item.colecao || "Sem Coleção";
    resumo.colecoes[col] = (resumo.colecoes[col] || 0) + qtd;

    const dia = format(new Date(item.data_venda), "dd/MM/yyyy");
    resumo.dias[dia] = (resumo.dias[dia] || 0) + 1;

    const p = String(item.pagamento || "").toLowerCase();
    if (p.includes("credit") || p.includes("card") || p.includes("cartao"))
      resumo.pagamentos["Cartão"]++;
    else if (
      p.includes("pickup") ||
      p.includes("dinheiro") ||
      p.includes("maquina")
    )
      resumo.pagamentos["Máquina/Dinheiro/Retirada"]++;
    else if (p.includes("pix")) resumo.pagamentos["Pix"]++;
    else resumo.pagamentos["Outros"]++;

    const prod = item.produto || "Desconhecido";
    resumo.produtos[prod] = (resumo.produtos[prod] || 0) + qtd;

    if (cliente) {
      const primeiroNome = cliente.split(" ")[0];
      if (
        primeiroNome.endsWith("a") ||
        primeiroNome.endsWith("y") ||
        primeiroNome.endsWith("i") ||
        primeiroNome === "aline"
      ) {
        resumo.genero["Mulheres"]++;
      } else if (
        primeiroNome.endsWith("o") ||
        primeiroNome.endsWith("r") ||
        primeiroNome.endsWith("s") ||
        primeiroNome.endsWith("l") ||
        primeiroNome.endsWith("m")
      ) {
        resumo.genero["Homens"]++;
      } else {
        resumo.genero["Não Identificado"]++;
      }
    }
  });

  // ==========================================
  // ABA 1: VISÃO GERAL (DASHBOARD)
  // ==========================================
  const wsResumo = workbook.addWorksheet("Visão Geral", {
    properties: { tabColor: { argb: "FF007BBA" } },
    views: [{ showGridLines: false }], // Tira as linhas de grade para ficar com cara de sistema
  });

  wsResumo.columns = [
    { width: 3 }, // Espaçador A
    { width: 25 },
    { width: 15 },
    { width: 3 }, // Bloco 1
    { width: 25 },
    { width: 15 },
    { width: 3 }, // Bloco 2
    { width: 25 },
    { width: 15 },
    { width: 3 }, // Bloco 3
  ];

  // Título Aba 1
  wsResumo.mergeCells("B2:I2");
  const titleResumo = wsResumo.getCell("B2");
  titleResumo.value = "📊 RESUMO EXECUTIVO DE VENDAS";
  titleResumo.font = {
    name: "Segoe UI",
    size: 18,
    bold: true,
    color: { argb: "FF051E47" },
  };

  const fromLabel = dateRange?.from
    ? format(dateRange.from, "dd/MM/yyyy")
    : "—";
  const toLabel = dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "—";
  wsResumo.mergeCells("B3:I3");
  wsResumo.getCell("B3").value =
    `Período: ${fromLabel} até ${toLabel}   |   Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
  wsResumo.getCell("B3").font = {
    name: "Segoe UI",
    size: 10,
    italic: true,
    color: { argb: "FF64748B" },
  };

  // Desenhando KPIs na Aba 1
  const drawKpiCard = (
    colStartLetter,
    colEndLetter,
    row,
    label,
    value,
    isCurrency = false,
    accentColor = "FF007BBA",
  ) => {
    wsResumo.mergeCells(`${colStartLetter}${row}:${colEndLetter}${row}`);
    wsResumo.mergeCells(
      `${colStartLetter}${row + 1}:${colEndLetter}${row + 1}`,
    );

    const labelCell = wsResumo.getCell(`${colStartLetter}${row}`);
    const valCell = wsResumo.getCell(`${colStartLetter}${row + 1}`);

    labelCell.value = `  ${label}`;
    labelCell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: "FF94A3B8" },
    };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF051E47" },
    };

    valCell.value = isCurrency ? currencyFormatter(value) : `  ${value}`;
    if (isCurrency) valCell.value = `  ${valCell.value}`;

    valCell.font = {
      name: "Segoe UI",
      size: 18,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    valCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF051E47" },
    };
    valCell.border = {
      bottom: { style: "thick", color: { argb: accentColor } },
    };
  };

  drawKpiCard(
    "B",
    "C",
    5,
    "Faturamento Bruto",
    kpis?.faturamento ?? 0,
    true,
    "FF007BBA",
  );
  drawKpiCard(
    "E",
    "F",
    5,
    "Pedidos Totais",
    kpis?.pedidos ?? 0,
    false,
    "FF94A3B8",
  );
  drawKpiCard(
    "H",
    "I",
    5,
    "Pedidos Pagos",
    pedidosPagosSet.size,
    false,
    "FF10B981",
  );

  // Função para criar Mini Tabelas na Aba 1
  const createMiniTable = (
    startCol,
    startRow,
    titleText,
    dataObj,
    col1Name,
    col2Name,
  ) => {
    const endCol = String.fromCharCode(startCol.charCodeAt(0) + 1);

    // Título
    wsResumo.mergeCells(`${startCol}${startRow}:${endCol}${startRow}`);
    const titleCell = wsResumo.getCell(`${startCol}${startRow}`);
    titleCell.value = ` ${titleText}`;
    titleCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF007BBA" },
    };

    // Cabeçalho da tabelinha
    const h1 = wsResumo.getCell(`${startCol}${startRow + 1}`);
    const h2 = wsResumo.getCell(`${endCol}${startRow + 1}`);
    h1.value = col1Name;
    h2.value = col2Name;
    h1.font = { bold: true };
    h2.font = { bold: true };
    h1.border = { bottom: { style: "thin" } };
    h2.border = { bottom: { style: "thin" } };

    // Dados
    let r = startRow + 2;
    Object.entries(dataObj)
      .sort((a, b) => b[1] - a[1])
      .forEach(([key, val]) => {
        if (val > 0) {
          wsResumo.getCell(`${startCol}${r}`).value = key;
          wsResumo.getCell(`${endCol}${r}`).value = val;
          // Zebrado suave
          if (r % 2 === 0) {
            wsResumo.getCell(`${startCol}${r}`).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };
            wsResumo.getCell(`${endCol}${r}`).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };
          }
          r++;
        }
      });
    return r; // Retorna a última linha preenchida
  };

  // Posicionando as tabelinhas
  const maxR1 = Math.max(
    createMiniTable(
      "B",
      9,
      "Vendas por Coleção",
      resumo.colecoes,
      "Coleção",
      "Qtd",
    ),
    createMiniTable(
      "E",
      9,
      "Formas de Pagamento",
      resumo.pagamentos,
      "Método",
      "Pedidos",
    ),
    createMiniTable(
      "H",
      9,
      "Perfil de Clientes",
      resumo.genero,
      "Gênero (Estimado)",
      "Compradores",
    ),
  );

  createMiniTable(
    "B",
    maxR1 + 2,
    "Ranking de Produtos",
    resumo.produtos,
    "Produto",
    "Qtd Vendida",
  );
  createMiniTable(
    "E",
    maxR1 + 2,
    "Pedidos por Dia",
    resumo.dias,
    "Data",
    "Qtd Pedidos",
  );

  // ==========================================
  // ABA 2: BASE DE DADOS (TRANSAÇÕES)
  // ==========================================
  const wsDados = workbook.addWorksheet("Base de Dados", {
    properties: { tabColor: { argb: "FF10B981" } }, // Verde para os dados
    views: [{ state: "frozen", ySplit: 1 }], // Congela apenas o cabeçalho da tabela
  });

  // --- HELPER: formata tamanho do item (Supabase order_items) ---
  function formatSizeExcel(item) {
    if (item.is_kit === true) {
      const top = item.size_top || "-";
      const bot = item.size_bottom || "-";
      return `T:${top} / B:${bot}`;
    }
    return item.size_standard || "-";
  }

  wsDados.columns = [
    { key: "data", width: 18 },
    { key: "cliente", width: 30 },
    { key: "produto", width: 38 },
    { key: "tamanho", width: 16 },
    { key: "colecao", width: 22 },
    { key: "qtd", width: 10 },
    { key: "preco", width: 16 },
    { key: "total", width: 18 },
    { key: "pagamento", width: 16 },
    { key: "status", width: 16 },
  ];

  const rows = filtered.map((item) => [
    new Date(item.data_venda),
    item.cliente || "Consumidor",
    item.produto,
    formatSizeExcel(item),
    item.colecao || "-",
    Number(item.quantidade || 0),
    Number(item.preco_unitario || 0),
    Number(item.valor_total_item || 0),
    item.pagamento === "credit_card"
      ? "CARTÃO"
      : item.pagamento === "pickup"
        ? "RETIRADA"
        : String(item.pagamento || "-").toUpperCase(),
    item.status === "paid"
      ? "PAGO"
      : item.status === "pending"
        ? "PENDENTE"
        : String(item.status || "-")
            .replace("_", " ")
            .toUpperCase(),
  ]);

  wsDados.addTable({
    name: "TabelaVendas",
    ref: `A1`,
    headerRow: true,
    totalsRow: true,
    style: { theme: "TableStyleLight9", showRowStripes: true },
    columns: [
      { name: "Data da Venda", filterButton: true, totalsRowFunction: "count" },
      { name: "Cliente", filterButton: true, totalsRowLabel: "TOTAIS:" },
      { name: "Produto", filterButton: true },
      { name: "Tamanho", filterButton: true },
      { name: "Coleção", filterButton: true },
      { name: "Qtd", filterButton: true, totalsRowFunction: "sum" },
      { name: "Valor Unit.", filterButton: true, totalsRowFunction: "average" },
      { name: "Subtotal", filterButton: true, totalsRowFunction: "sum" },
      { name: "Pgto.", filterButton: true },
      { name: "Situação", filterButton: true },
    ],
    rows,
  });

  // Formatação das colunas de dados
  wsDados.getColumn(1).numFmt = "dd/mm/yyyy hh:mm";
  wsDados.getColumn(4).alignment = { horizontal: "center", vertical: "middle" };
  wsDados.getColumn(6).numFmt = "#,##0";
  wsDados.getColumn(7).numFmt = '"R$ "#,##0.00';
  wsDados.getColumn(8).numFmt = '"R$ "#,##0.00';

  wsDados.getColumn(6).alignment = { horizontal: "center", vertical: "middle" };
  wsDados.getColumn(7).alignment = { horizontal: "right", vertical: "middle" };
  wsDados.getColumn(8).alignment = { horizontal: "right", vertical: "middle" };
  wsDados.getColumn(9).alignment = { horizontal: "center", vertical: "middle" };
  wsDados.getColumn(10).alignment = { horizontal: "center", vertical: "middle" };

  // --- ESTILIZANDO O CABEÇALHO DA TABELA ---
  const headerRowDados = wsDados.getRow(1);
  headerRowDados.height = 24;
  headerRowDados.eachCell((cell) => {
    cell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF047857" },
    }; // Verde esmeralda escuro
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // --- ESTILIZANDO A LINHA DE TOTAIS ---
  const totalsRow = wsDados.getRow(rows.length + 2); // Pega exatamente a última linha inserida
  totalsRow.height = 24;
  totalsRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Segoe UI",
      size: 11,
      bold: true,
      color: { argb: "FF0F172A" },
    }; // Texto escuro
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD1FAE5" },
    }; // Fundo verde clarinho

    // Força o alinhamento correto nos totais
    if (colNumber === 6 || colNumber === 1)
      cell.alignment = { horizontal: "center", vertical: "middle" };
    if (colNumber === 7 || colNumber === 8)
      cell.alignment = { horizontal: "right", vertical: "middle" };
  });

  // Formatação condicional de status
  for (let r = 2; r <= rows.length + 1; r++) {
    const statusCell = wsDados.getCell(`J${r}`);
    const v = String(statusCell.value || "").toLowerCase();
    statusCell.font = { bold: true };
    if (v.includes("pago") || v.includes("conclu") || v.includes("retirada"))
      statusCell.font.color = { argb: "FF047857" };
    else if (v.includes("pend") || v.includes("aguard") || v.includes("produ"))
      statusCell.font.color = { argb: "FFB45309" };
    else statusCell.font.color = { argb: "FFB91C1C" };
  }

  // Define qual aba abre por padrão (Aba 1 - Visão Geral)
  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: 0,
      visibility: "visible",
    },
  ];

  // ==========================================
  // EXPORTAÇÃO E DOWNLOAD
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileNamePrefix}_${format(new Date(), "dd_MM_yyyy")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
