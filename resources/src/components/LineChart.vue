<template>
  <div class="container">
    <div class="filters">
      <input type="date" v-model="inicio" />
      <input type="date" v-model="fim" />
      <button @click="carregarTotal">Atualizar</button>
    </div>

    <div class="total-card" v-if="total !== null">
      <h2>Total de Vendas</h2>
      <p class="valor">R$ {{ total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const inicio = ref(null)
const fim = ref(null)
const total = ref(null)

const API_VENDAS_MENSAL = import.meta.env.VITE_API_URL + '/vendas/mensal'

async function carregarTotal() {
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

    total.value = vendasData.reduce((acc, item) => acc + item.total, 0)
  } catch (error) {
    console.error('Erro ao carregar total de vendas:', error)
  }
}

onMounted(() => {
  carregarTotal()
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
}

.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filters input,
.filters button {
  padding: 0.5rem 0.8rem;
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

.total-card {
  background-color: #f3f4f6;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.total-card h2 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #374151;
}

.valor {
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
}
</style>
