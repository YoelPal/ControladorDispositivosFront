<template>
  <div class="logs-page">
    <h1>Historial de Logs</h1>

    <div class="search-filters">
      <input type="text" v-model="searchMac" placeholder="Buscar por MAC">
      <input type="text" v-model="searchSede" placeholder="Buscar por Sede">
      <input type="checkbox" v-model="mostrarSoloNoCoincidentes" id="no-coincidentes" @change="cargarLogsConAutorizacion" >
        <label for="no-coincidentes">Mostrar Logs No Coincidentes</label>
      </div>
    <div class="actions">
      <h3>Importar Datos desde archivo</h3>
      <input class="search-filters" type="file" accept=".csv, .txt" @change="handleFileUpload">
      <button @click="uploadFile" :disabled="!selectedFile || uploading">
        {{ uploading ? 'Subiendo...' : 'Subir Archivo CSV' }}
      </button>
      <p v-if="uploadProgress > 0">Progreso: {{ uploadProgress }}%</p>
      <p v-if="uploadSuccess" class="text-green-500 mt-2">Archivo CSV subido y procesado correctamente.</p>
      <p v-if="uploadNoContent" class="text-yellow-500 mt-2">Archivo CSV recibido, pero no se encontraron datos válidos.</p>
      <p v-if="uploadError" class="text-red-500 mt-2">Error al subir el archivo: {{ uploadError }}</p>
    </div>
    <table class="mi-tabla" v-if="logs && logs.length">
      <thead>
      <tr>
        <th>ID</th>
        <th>Directorio</th>
        <th>Hostname</th>
        <th>Ip</th>
        <th>Ip_switch</th>
        <th>Mac_address</th>
        <th>Puerto</th>
        <th>Sede</th>
        <th>Timestamp</th>
        <th>Vlan</th>
      </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.id }}</td>
          <td>{{ log.directorio }}</td>
          <td>{{ log.hostname }}</td>
          <td>{{ log.ip }}</td>
          <td>{{ log.ipSwitch }}</td>
          <td>{{ log.macAddress }}</td>
          <td>{{ log.puerto }}</td>
          <td>{{ log.sede }}</td>
          <td>{{ log.timestamp }}</td>
          <td>{{ log.vlan }}</td>
          <td>
            <button @click="goToGuardarDispositivo(log.macAddress, log.sede)">
              Guardar Dispositivo
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay registros</p>
    <div class="actions">
      <button @click="prevPage" :disabled="currentPage === 1" >Anterior</button>
      <label>Página {{ currentPage }} de {{ totalPages}}</label>
      <button @click="nextPage" :disabled="currentPage === totalPages" >Siguiente</button>

    </div >
    <div class="search-filters">
      <label>Ir a la página: </label>
      <input
          type="number"
          v-model.number="goToPageInput"
          min="1"
          :max="totalPages"
          @keydown.enter="goToPage"
      >
      <button  @click="goToPage" >Ir</button>
    </div>
    <div class="search-filters">
      <select v-model.number="perPage" >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
      <span>por página</span>
    </div>
    <p v-if="error" >Error: {{ error.message }}</p>
  </div>
</template>

<script>
import api from "@/api/api.js";
import {useRouter} from 'vue-router';
export default {
  name: 'LogsPage',
  setup() {
    const router = useRouter();

    const goToGuardarDispositivo = (mac, sede) => {
      router.push({
        name: 'NuevoDispositivo',
        query: {mac: mac, sede: sede},
      });
    };
    return {router, goToGuardarDispositivo};
  },
  data() {
    return {
      logs: [],
      loading: false,
      error: null,
      currentPage: 1,
      perPage: 10,
      searchMac: '',
      searchSede: '',
      selectedFile: null,
      uploading: false,
      uploadProgress: 0,
      uploadSuccess: false,
      uploadNoContent: false,
      uploadError: null,
      goToPageInput: null,
      mostrarSoloNoCoincidentes: false,
      totalPages: 1,
    };
  },
  mounted() {
    this.fetchLogs();
  },
  watch: {
    // Cuando cambian filtros o tamaño, recargar desde la página 1
    searchMac:   'onFilterChange',
    searchSede:  'onFilterChange',
    mostrarSoloNoCoincidentes: 'onFilterChange',
    perPage:     'onFilterChange',
  },

  methods: {
    onFilterChange() {
      this.currentPage = 1;
      this.fetchLogs();
      },
    async fetchLogs() {

      this.loading = true;
      this.error = null;
      const url = '/logs/paginated';
      const params = {
        page: this.currentPage -1,
        size: this.perPage,
      ...(this.searchMac && {macAddress: this.searchMac}),
        ...(this.searchSede && {sede: this.searchSede}),
        ...(this.mostrarSoloNoCoincidentes && {noCoincidentes: true}),
      };


      try {
        const {data} = await api.get(url,{params});
        const { content, page } = data;
        this.logs = content;
        this.perPage = page.size;
        this.totalPages = page.totalPages;
        this.currentPage=page.number+1;
      } catch (e) {
        this.error = e;
        console.error("Error al cargar logs (con autorización):", e);
      } finally {
        this.loading = false;
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
      this.fetchLogs();
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
      this.fetchLogs();
    },
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.uploadSuccess = false;
      this.uploadNoContent = false;
      this.uploadError = null;
      this.uploadProgress = 0;
    },
    goToPage() {
      if (this.goToPageInput !== null && this.goToPageInput >= 1 && this.goToPageInput <= this.totalPages) {
        this.currentPage = this.goToPageInput;
        this.fetchLogs();
        this.goToPageInput = null; // Limpiar el input después de ir a la página
      } else if (this.goToPageInput !== null) {
        alert(`Por favor, ingresa un número de página entre 1 y ${this.totalPages}.`);
        this.goToPageInput = null; // Limpiar el input en caso de valor inválido
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        alert('Por favor, selecciona un archivo CSV.');
        return;
      }

      this.uploading = true;
      this.uploadProgress = 0;
      this.uploadSuccess = false;
      this.uploadNoContent = false;
      this.uploadError = null;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          },
        };

        const response = await api.post('/MacAddressProvider/parser', formData, config);
        if (response.status === 200) {
          this.uploadSuccess = true;
        } else if (response.status === 204) {
          this.uploadNoContent = true;
        }
      } catch (error) {
        this.uploadError = error.message || 'Error desconocido al subir el archivo.';
        console.error('Error al subir el archivo CSV:', error);
      } finally {
        this.uploading = false;
        this.$router.go(0);
      }
    },
  },
};
</script>

<style scoped>
.logs-page {
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
.actions span {
  margin: 0 10px; /* Añade margen izquierdo y derecho */
}

.actions button {
  padding: 10px 15px;
  font-size: 1em;
  margin-right: 5px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f0f0f0;
  transition: background-color 0.3s ease;
}
.actions button:hover {
  background-color: #e0e0e0;
}
.actions label{
  margin: 5px;
}
.dispositivo-item button {
  padding: 8px 12px;
  font-size: 0.9em;

  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;

}

.dispositivo-item button:hover {
  background-color: #ccc;
}

.actions button:hover {
  background-color: #e0e0e0;
}
.search-filters button:hover {
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
.search-filters button{
  padding: 8px 12px;
  font-size: 0.9em;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
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
  width: 98%;
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
.search-filters input[type="text"] {
  padding: 10px 15px; /* Emparejar el padding de los botones */
  font-size: 1em;
  margin-right: 10px; /* Añadir margen derecho como los botones */
  border: 1px solid #ccc;
  border-radius: 5px;
}
.search-filters input[type="checkbox"] {
  width: 1.2em; /* Ajustar el ancho del checkbox */
  height: 1.2em; /* Ajustar la altura del checkbox */
  margin-right: 5px; /* Espacio entre el checkbox y la etiqueta */
  vertical-align: center; /* Alinear verticalmente con la etiqueta */
  align-content: center;
}

.search-filters label {
  font-size: 1em; /* Ajustar el tamaño de la fuente de la etiqueta */
  vertical-align: middle; /* Alinear verticalmente con el checkbox */
  margin-right: 5px;
}

</style>