<template>
    <PrivateLayout>
      <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Criar Nova Promoção</h1>
        <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label for="nome" class="block text-gray-700 font-bold mb-2">Nome da Promoção:</label>
              <input type="text" id="nome" v-model="promocao.nome" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
            </div>
            
            <div class="mb-4">
              <label for="descricao" class="block text-gray-700 font-bold mb-2">Descrição:</label>
              <textarea id="descricao" v-model="promocao.descricao" rows="3" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"></textarea>
            </div>
            
            <div class="mb-4">
              <label for="pizzas" class="block text-gray-700 font-bold mb-2">Pizzas Incluídas:</label>
              <select id="pizzas" v-model="promocao.pizzasIncluidas" multiple class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
                <option v-for="pizza in pizzas" :key="pizza._id" :value="pizza._id">{{ pizza.sabor }}</option>
              </select>
              <p class="text-sm text-gray-500 mt-1">Mantenha 'Ctrl' (ou 'Cmd') pressionado para selecionar múltiplas pizzas.</p>
            </div>
  
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="dataInicio" class="block text-gray-700 font-bold mb-2">Data de Início:</label>
                <input type="date" id="dataInicio" v-model="promocao.dataInicio" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
              </div>
              <div>
                <label for="dataFim" class="block text-gray-700 font-bold mb-2">Data de Fim:</label>
                <input type="date" id="dataFim" v-model="promocao.dataFim" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" required>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                Salvar Promoção
              </button>
            </div>
          </form>
        </div>
      </div>
    </PrivateLayout>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import PrivateLayout from '../components/PrivateLayout.vue';
  import axios from 'axios';
  
  const router = useRouter();
  const pizzas = ref([]);
  const promocao = ref({
    nome: '',
    descricao: '',
    pizzasIncluidas: [],
    dataInicio: '',
    dataFim: ''
  });
  
  // 🔹 Acessa a variável de ambiente diretamente
  const API_URL = import.meta.env.VITE_API_URL;
  
  const fetchPizzas = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pizzas`);
      pizzas.value = response.data;
    } catch (error) {
      console.error('Erro ao buscar pizzas:', error);
    }
  };
  
  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/api/promocoes`, promocao.value);
      alert('Promoção criada com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao criar promoção:', error);
      alert('Erro ao criar promoção. Tente novamente.');
    }
  };
  
  onMounted(() => {
    fetchPizzas();
  });
  </script>