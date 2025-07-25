<template>
  <div class="clientes">
    <h2>Lista de Clientes</h2>

    <table v-if="clientes.length" border="1">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefone</th>
          <th>Endereço</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente.id">
          <td>{{ cliente.nome }}</td>
          <td>{{ cliente.telefone }}</td>
          <td>
            {{ cliente.endereco.rua }}, {{ cliente.endereco.numero }} -
            {{ cliente.endereco.bairro }}, {{ cliente.endereco.cidade }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Nenhum cliente encontrado</p>
  </div>
</template>

<script>
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL+"/clientes"
export default {
  name: 'ListaClientes',
  data() {
    return {
      clientes: [],
    }
  },
  mounted() {
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('Usuário não autenticado')
      return
    }

    axios
      .get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        this.clientes = response.data
      })
      .catch((error) => {
        console.error('Erro ao buscar clientes:', error)
      })
  },
}
</script>
