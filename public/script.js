const API_URL = "http://localhost:3000/relatorios";

// Faturamento por Dia
fetch(`${API_URL}/vendas-por-dia`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(d => d.data);
    const valores = data.map(d => d.total_vendas);

    new Chart(document.getElementById("chartVendasDia"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Faturamento (R$)",
          data: valores,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.3
        }]
      }
    });
  });

// Vendas por Forma de Pagamento
fetch(`${API_URL}/vendas-por-pagamento`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(d => d.forma_pagamento);
    const valores = data.map(d => d.total_vendas);

    new Chart(document.getElementById("chartPagamento"), {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: valores,
          backgroundColor: ["#2196F3", "#FF9800", "#4CAF50", "#E91E63", "#9C27B0"]
        }]
      }
    });
  });

// Resumo Geral
fetch(`${API_URL}/resumo`)
  .then(res => res.json())
  .then(data => {
    const resumoEl = document.getElementById("resumo");
    resumoEl.innerHTML = `
      <li><strong>Quantidade de Vendas:</strong> ${data.quantidade_vendas}</li>
      <li><strong>Faturamento Total:</strong> R$ ${parseFloat(data.faturamento_total).toFixed(2)}</li>
      <li><strong>Ticket Médio:</strong> R$ ${parseFloat(data.ticket_medio).toFixed(2)}</li>
    `;
  });
