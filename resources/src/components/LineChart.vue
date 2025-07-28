<template>
  <div class="chart-container">
    <div class="filters">
      <input type="date" v-model="inicio" />
      <input type="date" v-model="fim" />
      <button @click="carregarDadosGrafico">Atualizar</button>
    </div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

// Referência do canvas
const chart = ref(null)
let chartInstance = null

// Filtros de data
const inicio = ref('2025-01-01')
const fim = ref('2025-06-30')

// URL da API
const API_VENDAS_MENSAL = import.meta.env.VITE_API_URL + '/vendas/mensal'

// Função para buscar e desenhar o gráfico
async function carregarDadosGrafico() {
  try {
    const params = {}
    if (inicio.value) params.dataInicio = inicio.value
    if (fim.value) params.dataFim = fim.value

    const response = await axios.get(API_VENDAS_MENSAL, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    const vendasData = response.data
    console.log('Dados recebidos:', vendasData)

    const labels = vendasData.map(item => `${item.mes} ${item.ano}`)
    const dataValues = vendasData.map(item => item.total)

    if (chartInstance) chartInstance.destroy()

    chartInstance = new Chart(chart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Vendas',
          data: dataValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `R$ ${value.toLocaleString()}`
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: context => `R$ ${context.parsed.y.toLocaleString()}`
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Erro ao carregar dados do gráfico:', error)
  }
}

// Carrega o gráfico ao montar
onMounted(() => {
  carregarDadosGrafico()
})

// Destroi o gráfico ao desmontar o componente
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
  max-width: 900px;
  margin: 0 auto;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filters input,
.filters button {
  padding: 0.4rem 0.8rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.filters button {
  background-color: #10b981;
  color: white;
  border: none;
  cursor: pointer;
}

.filters button:hover {
  background-color: #0e9e6e;
}

@media (max-width: 600px) {
  .chart-container {
    height: 250px;
  }
}
</style>
