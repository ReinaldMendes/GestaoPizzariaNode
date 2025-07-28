<template>
  <div class="clientes">
    <h2>Lista de Clientes</h2>

    <div v-if="clientes.length" class="clientes-table-wrapper">
      <table class="clientes-table">
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
    </div>

    <p v-else>Nenhum cliente encontrado</p>
  </div>
</template>

<script>
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL + "/clientes"
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

<style scoped>
.clientes {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  font-family: Arial, sans-serif;
}

h2 {
  margin-bottom: 1rem;
  color: #0c7c59;
}

.clientes-table-wrapper {
  overflow-x: auto;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.clientes-table th,
.clientes-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.clientes-table th {
  background-color: #0c7c59;
  color: white;
  font-weight: bold;
}

.clientes-table tr:hover {
  background-color: #f5f5f5;
}

p {
  color: #555;
  font-style: italic;
}

/* Responsividade */

@media (max-width: 768px) {
  .clientes {
    padding: 1rem;
  }

  .clientes-table {
    display: block;
    white-space: nowrap;
  }
}
</style>
