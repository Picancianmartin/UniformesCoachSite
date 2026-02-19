import ExcelJS from "exceljs";

/**
 * Exporta os dados do dashboard para um arquivo Excel com formatação profissional
 * @param {Object} params - Parâmetros para exportação
 * @param {Object} params.data - Dados processados do dashboard
 * @param {Array} params.rawData - Dados brutos do Supabase
 * @param {Object} params.dateRange - Período selecionado (from, to)
 * @param {string|null} params.activeFilter - Filtro ativo (se houver)
 */
export async function exportDashboardToExcel({
  data,
  rawData,
  dateRange,
  activeFilter,
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Uniformes Coach";
  workbook.created = new Date();

  // Formatar data para o nome do arquivo
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const periodText = `${formatDate(dateRange?.from)} - ${formatDate(dateRange?.to)}`;

  // =============================================
  // ABA 1: RESUMO GERAL
  // =============================================
  const summarySheet = workbook.addWorksheet("Resumo Geral");

  // Estilo para cabeçalhos
  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF007BBA" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // Estilo para células de dados
  const dataStyle = {
    alignment: { horizontal: "center", vertical: "middle" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // Título principal
  summarySheet.mergeCells("A1:D1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = "RELATÓRIO DE VENDAS - UNIFORMES COACH";
  titleCell.font = { bold: true, size: 16, color: { argb: "FF000D23" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  summarySheet.getRow(1).height = 30;

  // Período
  summarySheet.mergeCells("A2:D2");
  const periodCell = summarySheet.getCell("A2");
  periodCell.value = `Período: ${periodText}`;
  periodCell.font = { size: 12, color: { argb: "FF666666" } };
  periodCell.alignment = { horizontal: "center" };

  // Filtro ativo (se houver)
  if (activeFilter) {
    summarySheet.mergeCells("A3:D3");
    const filterCell = summarySheet.getCell("A3");
    filterCell.value = `Filtro: ${activeFilter.type === "payment" ? "Pagamento" : "Coleção"} - ${activeFilter.value}`;
    filterCell.font = { size: 11, italic: true, color: { argb: "FF999999" } };
    filterCell.alignment = { horizontal: "center" };
  }

  // Linha vazia
  const startRow = activeFilter ? 5 : 4;

  // KPIs
  summarySheet.getCell(`A${startRow}`).value = "Indicador";
  summarySheet.getCell(`B${startRow}`).value = "Valor";
  summarySheet.getRow(startRow).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  const kpiData = [
    ["Faturamento Total", data.totalFaturamento],
    ["Total de Pedidos", data.totalPedidos],
    ["Ticket Médio", data.ticketMedio],
  ];

  kpiData.forEach((row, index) => {
    const rowNum = startRow + 1 + index;
    summarySheet.getCell(`A${rowNum}`).value = row[0];
    const valueCell = summarySheet.getCell(`B${rowNum}`);
    if (typeof row[1] === "number" && row[0] !== "Total de Pedidos") {
      valueCell.value = row[1];
      valueCell.numFmt = '"R$ "#,##0.00';
    } else {
      valueCell.value = row[1];
    }
    summarySheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  // Ajustar largura das colunas
  summarySheet.getColumn("A").width = 25;
  summarySheet.getColumn("B").width = 20;
  summarySheet.getColumn("C").width = 20;
  summarySheet.getColumn("D").width = 20;

  // =============================================
  // ABA 2: VENDAS POR PAGAMENTO
  // =============================================
  const paymentSheet = workbook.addWorksheet("Vendas por Pagamento");

  paymentSheet.getCell("A1").value = "Método de Pagamento";
  paymentSheet.getCell("B1").value = "Valor Total";
  paymentSheet.getCell("C1").value = "Percentual";
  paymentSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  const totalPagamentos = data.chartPagamentos.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  data.chartPagamentos.forEach((item, index) => {
    const rowNum = index + 2;
    paymentSheet.getCell(`A${rowNum}`).value = item.name;
    const valueCell = paymentSheet.getCell(`B${rowNum}`);
    valueCell.value = item.value;
    valueCell.numFmt = '"R$ "#,##0.00';
    const percentCell = paymentSheet.getCell(`C${rowNum}`);
    percentCell.value =
      totalPagamentos > 0 ? item.value / totalPagamentos : 0;
    percentCell.numFmt = "0.00%";
    paymentSheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  paymentSheet.getColumn("A").width = 25;
  paymentSheet.getColumn("B").width = 20;
  paymentSheet.getColumn("C").width = 15;

  // =============================================
  // ABA 3: VENDAS POR COLEÇÃO
  // =============================================
  const collectionSheet = workbook.addWorksheet("Vendas por Coleção");

  collectionSheet.getCell("A1").value = "Coleção";
  collectionSheet.getCell("B1").value = "Quantidade Vendida";
  collectionSheet.getCell("C1").value = "Percentual do Total";
  collectionSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  const totalColecoes = data.chartColecoes.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  data.chartColecoes.forEach((item, index) => {
    const rowNum = index + 2;
    collectionSheet.getCell(`A${rowNum}`).value = item.name;
    collectionSheet.getCell(`B${rowNum}`).value = item.value;
    const percentCell = collectionSheet.getCell(`C${rowNum}`);
    percentCell.value =
      totalColecoes > 0 ? item.value / totalColecoes : 0;
    percentCell.numFmt = "0.00%";
    collectionSheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  collectionSheet.getColumn("A").width = 30;
  collectionSheet.getColumn("B").width = 22;
  collectionSheet.getColumn("C").width = 20;

  // =============================================
  // ABA 4: EVOLUÇÃO DIÁRIA
  // =============================================
  const evolutionSheet = workbook.addWorksheet("Evolução Diária");

  evolutionSheet.getCell("A1").value = "Data";
  evolutionSheet.getCell("B1").value = "Faturamento";
  evolutionSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  data.chartEvolucao.forEach((item, index) => {
    const rowNum = index + 2;
    evolutionSheet.getCell(`A${rowNum}`).value = item.date;
    const valueCell = evolutionSheet.getCell(`B${rowNum}`);
    valueCell.value = item.Vendas;
    valueCell.numFmt = '"R$ "#,##0.00';
    evolutionSheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  evolutionSheet.getColumn("A").width = 15;
  evolutionSheet.getColumn("B").width = 20;

  // =============================================
  // ABA 5: ÚLTIMAS TRANSAÇÕES
  // =============================================
  const ordersSheet = workbook.addWorksheet("Últimas Transações");

  ordersSheet.getCell("A1").value = "ID Pedido";
  ordersSheet.getCell("B1").value = "Cliente";
  ordersSheet.getCell("C1").value = "Status";
  ordersSheet.getCell("D1").value = "Valor Total";
  ordersSheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  data.recentOrders.forEach((item, index) => {
    const rowNum = index + 2;
    ordersSheet.getCell(`A${rowNum}`).value = item.id || "-";
    ordersSheet.getCell(`B${rowNum}`).value = item.cliente || "Consumidor";
    ordersSheet.getCell(`C${rowNum}`).value =
      item.status === "paid"
        ? "Pago"
        : item.status === "pending"
          ? "Pendente"
          : item.status || "-";
    const valueCell = ordersSheet.getCell(`D${rowNum}`);
    valueCell.value = item.total;
    valueCell.numFmt = '"R$ "#,##0.00';
    ordersSheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  ordersSheet.getColumn("A").width = 40;
  ordersSheet.getColumn("B").width = 25;
  ordersSheet.getColumn("C").width = 15;
  ordersSheet.getColumn("D").width = 18;

  // =============================================
  // ABA 6: DADOS DETALHADOS (rawData filtrado)
  // =============================================
  const detailSheet = workbook.addWorksheet("Dados Detalhados");

  // Filtrar dados pelo período
  const filteredRawData = rawData.filter((item) => {
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

  // Cabeçalhos
  const detailHeaders = [
    "ID Pedido",
    "Cliente",
    "Produto",
    "Coleção",
    "Tamanho",
    "Quantidade",
    "Valor Unit.",
    "Valor Total",
    "Pagamento",
    "Status",
    "Data Venda",
  ];

  detailHeaders.forEach((header, colIndex) => {
    const cell = detailSheet.getCell(1, colIndex + 1);
    cell.value = header;
    Object.assign(cell, headerStyle);
  });

  // Dados
  filteredRawData.forEach((item, rowIndex) => {
    const rowNum = rowIndex + 2;
    detailSheet.getCell(rowNum, 1).value = item.id_pedido || "-";
    detailSheet.getCell(rowNum, 2).value = item.cliente || "Consumidor";
    detailSheet.getCell(rowNum, 3).value = item.produto || "-";
    detailSheet.getCell(rowNum, 4).value = item.colecao || "-";
    detailSheet.getCell(rowNum, 5).value = item.tamanho || "-";
    detailSheet.getCell(rowNum, 6).value = parseInt(item.quantidade) || 0;
    const unitCell = detailSheet.getCell(rowNum, 7);
    unitCell.value = parseFloat(item.preco_unitario) || 0;
    unitCell.numFmt = '"R$ "#,##0.00';
    const totalCell = detailSheet.getCell(rowNum, 8);
    totalCell.value = parseFloat(item.valor_total_item) || 0;
    totalCell.numFmt = '"R$ "#,##0.00';
    detailSheet.getCell(rowNum, 9).value = item.pagamento || "-";
    detailSheet.getCell(rowNum, 10).value =
      item.status === "paid"
        ? "Pago"
        : item.status === "pending"
          ? "Pendente"
          : item.status || "-";
    detailSheet.getCell(rowNum, 11).value = item.data_venda
      ? formatDate(item.data_venda)
      : "-";

    detailSheet.getRow(rowNum).eachCell((cell) => {
      Object.assign(cell, dataStyle);
    });
  });

  // Ajustar largura das colunas
  detailSheet.getColumn(1).width = 40;
  detailSheet.getColumn(2).width = 25;
  detailSheet.getColumn(3).width = 30;
  detailSheet.getColumn(4).width = 20;
  detailSheet.getColumn(5).width = 12;
  detailSheet.getColumn(6).width = 12;
  detailSheet.getColumn(7).width = 15;
  detailSheet.getColumn(8).width = 15;
  detailSheet.getColumn(9).width = 15;
  detailSheet.getColumn(10).width = 15;
  detailSheet.getColumn(11).width = 15;

  // =============================================
  // GERAR E BAIXAR O ARQUIVO
  // =============================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Criar nome do arquivo com a data atual
  const now = new Date();
  const fileName = `Relatorio_Vendas_${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}.xlsx`;

  // Criar link de download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
