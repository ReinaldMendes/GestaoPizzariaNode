<template>
  <PrivateLayout>
    <div class="page">
      <h1>Vendas 💰</h1>
      <p>Visualize e controle os pedidos e vendas realizadas.</p>

      <!-- Lista de Vendas -->
      <div class="vendas-list">
        <h2>Vendas Realizadas</h2>
        <ul>
          <li v-for="venda in vendas" :key="venda._id">
            Cliente: {{ venda.cliente.nome }} | Total: R$ {{ venda.total.toFixed(2) }}
          </li>
        </ul>
      </div>

      <!-- Formulário de Nova Venda -->
      <div class="nova-venda">
        <h2>Nova Venda</h2>
        <form @submit.prevent="criarVenda">
          <label>Cliente:</label>
          <select v-model="novaVenda.cliente">
            <option disabled value="">Selecione um cliente</option>
            <option v-for="cliente in clientes" :value="cliente._id" :key="cliente._id">
              {{ cliente.nome }}
            </option>
          </select>

          <label>Produtos:</label>
          <div v-for="(item, index) in novaVenda.produtos" :key="index" class="produto-item">
            <select v-model="item.produto">
              <option disabled value="">Selecione um produto</option>
              <option v-for="produto in produtos" :value="produto._id" :key="produto._id">
                {{ produto.nome }} (R$ {{ produto.preco }})
              </option>
            </select>

            <input type="number" v-model.number="item.quantidade" placeholder="Qtd" min="1" />

            <button type="button" @click="removerProduto(index)">🗑️</button>
          </div>

          <button type="button" @click="adicionarProduto">Adicionar Produto</button>

          <p><strong>Total: R$ {{ calcularTotal().toFixed(2) }}</strong></p>

          <button type="submit">Salvar Venda</button>
        </form>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PrivateLayout from '../components/PrivateLayout.vue'

const vendas = ref([])
const clientes = ref([])
const produtos = ref([])

const novaVenda = ref({
  cliente: '',
  produtos: [{ produto: '', quantidade: 1 }],
})

const fetchData = async () => {
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const [vendasRes, clientesRes, produtosRes] = await Promise.all([
    axios.get('/api/vendas', config),
    axios.get('/api/clientes', config),
    axios.get('/api/produtos', config),
  ])

  vendas.value = vendasRes.data
  clientes.value = clientesRes.data
  produtos.value = produtosRes.data
}

const adicionarProduto = () => {
  novaVenda.value.produtos.push({ produto: '', quantidade: 1 })
}

const removerProduto = (index) => {
  novaVenda.value.produtos.splice(index, 1)
}

const calcularTotal = () => {
  return novaVenda.value.produtos.reduce((total, item) => {
    const produto = produtos.value.find((p) => p._id === item.produto)
    return total + (produto?.preco || 0) * item.quantidade
  }, 0)
}

const criarVenda = async () => {
  const token = localStorage.getItem('token')
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const venda = {
    ...novaVenda.value,
    total: calcularTotal(),
  }

  await axios.post('/api/vendas', venda, config)
  await fetchData()

  // Limpa formulário
  novaVenda.value = {
    cliente: '',
    produtos: [{ produto: '', quantidade: 1 }],
  }
}

onMounted(fetchData)
</script>

<style scoped>
.page {
  padding: 2rem;
}
.vendas-list {
  margin-bottom: 2rem;
}
.nova-venda {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
}
.produto-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
