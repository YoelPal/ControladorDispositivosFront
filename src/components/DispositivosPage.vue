<template>
  <div class="dispositivos-page">
    <h1>Gestión de Dispositivos</h1>

    <div class="actions">
      <router-link to="/NuevoDispositivo">
        <button>Crear Nuevo</button>
      </router-link>
      <button @click="borrarDispositivosSeleccionados">Borrar Seleccionados</button>
      <button @click="addIps">Añadir Ips automáticamente</button>
    </div>

    <div class="search-filters">
      <input type="text" v-model="searchMac" placeholder="Buscar por MAC">
      <input type="text" v-model="searchSede" placeholder="Buscar por Sede">
      <select v-model="searchTipo">
        <option value="">Todos los Tipos</option>
        <option value="Pc">Pc</option>
        <option value="Movil">Movil</option>
        <option value="Router">Router</option>
        <option value="Ap">Ap</option>
        <option value="Switch">Switch</option>
        <option value="Tablet">Tablet</option>
      </select>
    </div>

    <table class="mi-tabla">
      <thead>
      <tr>
        <th><input type="checkbox" :checked="todosSeleccionados" @change="seleccionarTodos"/></th>
        <th>Mac_address</th>
        <th>Sede</th>
        <th>Fabricante</th>
        <th>Modelo</th>
        <th>Propietario</th>
        <th>IPs</th>
        <th v-if="!searchTipo">Tipo Dispositivo</th>
        <th v-if="searchTipo === 'Pc'">Sistema Operativo</th>
        <th v-if="searchTipo === 'Pc'">RAM</th>
        <th v-if="searchTipo === 'Pc'">CPU</th>
        <th v-if="searchTipo === 'Router'">Ancho de Banda</th>
        <th v-if="searchTipo === 'Router'">Velocidad</th>
        <th v-if="searchTipo === 'Switch'">Puertos</th>
        <th v-if="searchTipo === 'Switch'">Velocidad</th>
        <th v-if="searchTipo === 'Ap'">Banda</th>
        <th v-if="searchTipo === 'Ap'">Estándar Wifi</th>
        <th v-if="searchTipo === 'Tablet'">Tamaño</th>
        <th v-if="searchTipo === 'Movil'">Tamaño</th>
      </tr>
      </thead>
      <tbody>

        <tr v-for="dispositivo in paginatedDispositivos" :key="dispositivo.macAddress">
          <td>
            <input type="checkbox" :value="dispositivo.macAddress" v-model="dispositivosSeleccionados"/>
          </td>
          <td>
            {{ dispositivo.macAddress }}
          </td>
          <td>
            {{ dispositivo.sede }}
          </td>
          <td>
            {{ dispositivo.fabricante }}
          </td>
          <td>
            {{ dispositivo.modelo }}
          </td>
          <td>
            {{ dispositivo.propietario }}
          </td>
          <td>
            <ul v-if="dispositivo.ips && dispositivo.ips.length > 0" class="ips-list">
              <li v-for="ipObject in dispositivo.ips" :key="ipObject.id">{{ ipObject.ipAddress }}</li>
            </ul>
            <span v-else>-</span>
          </td>
          <td v-if="!searchTipo">
            {{ dispositivo.tipoDispositivo }}
          </td>
          <td v-if="searchTipo === 'Pc'">{{ dispositivo.sistemaOperativo }}</td>
          <td v-if="searchTipo === 'Pc'">{{ dispositivo.ram }}</td>
          <td v-if="searchTipo === 'Pc'">{{ dispositivo.cpu }}</td>
          <td v-if="searchTipo === 'Router'">{{ dispositivo.anchoBanda }}</td>
          <td v-if="searchTipo === 'Router'">{{ dispositivo.velocidad }}</td>
          <td v-if="searchTipo === 'Switch'">{{ dispositivo.puertos }}</td>
          <td v-if="searchTipo === 'Switch'">{{ dispositivo.velocidad }}</td>
          <td v-if="searchTipo === 'Ap'">{{ dispositivo.banda }}</td>
          <td v-if="searchTipo === 'Ap'">{{ dispositivo.estandarWifi }}</td>
          <td v-if="searchTipo === 'Tablet'">{{ dispositivo.tamanyo }}</td>
          <td v-if="searchTipo === 'Movil'">{{ dispositivo.tamanyo }}</td>
          <td class="actions">
            <router-link :to="{ name:'ActualizarDispositivo', params: {mac:dispositivo.macAddress}}">
              <button>Ver/Editar ✎</button>
            </router-link>
          </td>
        </tr>

      </tbody>
    </table>
    <div class="actions">
      <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
    </div>
    <div class="search-filters">
      <label>Ir a la página: </label>
      <input
          type="number"
          v-model.number="goToPageInput"
          min="1"
          :max="totalPages"
          @keydown.enter="goToPage"
      >
      <button @click="goToPage">Ir</button>
    </div>
    <div class="search-filters">
      <select v-model.number="perPage">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
      <label>por página</label>
    </div>

  </div>
  <p v-if="error">Error: {{ error.message }}</p>
</template>

<script>
import api from "@/api/api.js";
import {useRouter} from 'vue-router';

export default {
  name: 'DispositivosPage',
  setup() {
    const router = useRouter();
  },
  data() {
    return {
      paginatedDispositivos: [],
      dispositivosSeleccionados: [],
      searchMac: '',
      searchSede: '',
      searchTipo: '',
      loading: false,
      error: null,
      currentPage: 1,
      perPage: 10,
      goToPageInput: null,
      totalPages: 1,
    };
  },
  mounted() {
    this.cargarDispositivos();
  },
  watch: {
    // Cuando cambian filtros o tamaño, recargar desde la página 1
    searchMac: 'onFilterChange',
    searchSede: 'onFilterChange',
    searchTipo: 'onFilterChange',
    perPage: 'onFilterChange',
  },
  computed: {
    todosSeleccionados() {
      return this.paginatedDispositivos.length > 0
          && this.paginatedDispositivos.every(d =>
              this.dispositivosSeleccionados.includes(d.macAddress)
          );
    }
  },
  methods: {
    onFilterChange() {
      this.currentPage = 1;
      this.cargarDispositivos();
    },
    async cargarDispositivos() {
      this.loading = true;
      this.error = null;
      try {
        let url = '/dispositivos/paginated';
        if (this.searchTipo !== "") {
          url = `/${this.searchTipo.toLowerCase()}/paginated`;
        }
        const params = {
          page: this.currentPage - 1,
          size: this.perPage,
          ...(this.searchMac && {macAddress: this.searchMac}),
          ...(this.searchSede && {sede: this.searchSede}),

        };
        try {
          const {data} = await api.get(url, {params});
          console.log('>> PAGINATION DATA', data);
          const {content, page} = data;
          this.paginatedDispositivos = content;
          this.perPage = page.size;
          this.totalPages = page.totalPages;
          this.currentPage = page.number + 1;
        } catch (e) {
          this.error = e;
          console.error("Error al cargar los dispositivos.", e);
        }
      }finally {
        this.loading = false;
      }
    },

      prevPage()
      {
        if (this.currentPage > 1) this.currentPage--;
        this.cargarDispositivos();
      }
    ,
      nextPage()
      {
        if (this.currentPage < this.totalPages) this.currentPage++;
        this.cargarDispositivos();
      }
    ,
      seleccionarTodos(event)
      {
        if (event.target.checked) {
          this.dispositivosSeleccionados = this.paginatedDispositivos.map(d => d.macAddress);
        } else {
          this.dispositivosSeleccionados = [];
        }
      }
    ,
      goToPage()
      {
        if (this.goToPageInput !== null && this.goToPageInput >= 1 && this.goToPageInput <= this.totalPages) {
          this.currentPage = this.goToPageInput;
          this.cargarDispositivos();
          this.goToPageInput = null; // Limpiar el input después de ir a la página
        } else if (this.goToPageInput !== null) {
          alert(`Por favor, ingresa un número de página entre 1 y ${this.totalPages}.`);
          this.goToPageInput = null; // Limpiar el input en caso de valor inválido
        }
      }
    ,

      async borrarDispositivosSeleccionados()
      {
        if (confirm('¿Estás seguro de que quieres borrar los dispositivos seleccionados?')) {
          try {
            await Promise.all(
                this.dispositivosSeleccionados.map(mac =>
                    api.delete(`/dispositivos/${mac}`))
            );
            this.paginatedDispositivos = this.paginatedDispositivos.filter(dispositivo => !this.dispositivosSeleccionados.includes(dispositivo.macAddress));
            this.dispositivosSeleccionados = []; // Limpiar la selección
          } catch (e) {
            this.error = e;
            console.error("Error al borrar dispositivos", e);
          }
        }
      },
    async addIps() {
      if (!confirm('¿Estás seguro de que quieres actualizar las IPs con los logs guardados?')) {
        return;
      }
      try {

        const token = sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Token no encontrado, debes iniciar sesión de nuevo.');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        await api.put('/MacAddressProvider/addips', null, config);


        alert('¡IPs actualizadas correctamente!');


        await this.cargarDispositivos();

      } catch (e) {
        this.error = e;
        console.error("Error al actualizar las IPs", e);
      }
    },
    },
  };
</script>

<style scoped>
.dispositivos-page {
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.actions {
  margin-bottom: 20px;
}

.actions select {
  padding: 10px 15px;
  font-size: 1em;
  margin-right: 10px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  transition: background-color 0.3s ease;
}

.actions button {
  padding: 10px 15px;
  font-size: 1em;
  margin-right: 10px;
  margin-left: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  transition: background-color 0.3s ease;
}

.actions button:hover {
  background-color: #e0e0e0;
}

.search-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-filters input,
.search-filters select {
  padding: 8px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-filters button {
  padding: 8px 12px;
  font-size: 0.9em;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
}

.dispositivo-item input[type="checkbox"] {
  margin-right: 10px;
}

.dispositivo-item strong {
  margin-right: 5px;
}

.dispositivo-item button {
  padding: 8px 12px;
  font-size: 0.9em;
  margin-left: auto;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
}

.dispositivo-item button:hover {
  background-color: #ccc;
}

.mi-tabla {
  font-family: sans-serif;
  margin: 20px;
  width: 90%;

}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  font-size: 1.1em;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  font-size: 1.1em;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.ips-list {
  list-style-type: none;
  padding-left: 0; /* Resetear el padding del ul */
}

.ips-list li {
  padding-left: 0.5em;
}
</style>