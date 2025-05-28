<template>
  <div class="logs-page">
    <h1>Historial de Logs</h1>

    <div class="search-filters">
      <input type="text" v-model="searchMac" placeholder="Buscar por MAC">
      <input type="text" v-model="searchSede" placeholder="Buscar por Sede">
      <!--<input type="checkbox" v-model="mostrarSoloNoCoincidentes" id="no-coincidentes">
       <label for="no-coincidentes">Mostrar Logs No Coincidentes</label>-->
    </div>
    <div class="actions">
      <h3>Importar Datos desde archivo</h3>
      <input class="search-filters" type="file" accept=".csv, .txt" @change="handleFileUpload">
      <button @click="uploadFile" :disabled="!selectedFile || uploading">
        {{ uploading ? 'Subiendo...' : 'Subir Archivo                                 ' }}
      </button>
      <div v-if="uploading">
        <p>Progreso: {{ uploadProgress }}%</p>
        <p v-if="processingMessage">{{ processingMessage }}</p>
      </div>
      <p v-if="uploadSuccess && !uploadError">✅ ¡Archivo cargado con éxito!</p>
      <p v-if="uploadNoContent">ℹ️ El archivo está vacío o no contiene datos válidos.</p>
      <p v-if="uploadError" class="error">❌ Error: {{ uploadError }}</p>

    </div>
    <div class ="actions">
      <button @click="borrarLogsSeleccionados">Borrar Seleccionados</button>
      <button @click ="deleteLogsUpdated">Eliminar Logs actualizados</button>
    </div>
    <table class="mi-tabla" v-if="logs && logs.length">
      <thead>
      <tr>
        <th><input type="checkbox" :checked="todosSeleccionados" @change="seleccionarTodos"/></th>
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
        <th>Acciones</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in logs" :key="log.id">
        <td>
          <input type="checkbox" :value="log.id" v-model="logsSeleccionados"/>
        </td>
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
          <button @click="goToGuardarDispositivo(log)">
            Guardar Dispositivo
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <p v-else>No hay registros</p>
    <div class="actions">
      <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <label>Página {{ currentPage }} de {{ totalPages }}</label>
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
      <span>por página</span>
    </div>
    <p v-if="error">Error: {{ error.message }}</p>
  </div>
</template>

<script>
import api from "@/api/api.js";
import {useRouter} from 'vue-router';
import { ref, watch, onMounted, computed } from 'vue';

export default {
  name: 'LogsPage',
  setup() {
    const router = useRouter();

    const logs = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const currentPage = ref(1);
    const perPage = ref(10);
    const searchMac = ref('');
    const searchSede = ref('');
    const selectedFile = ref(null);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    const uploadSuccess = ref(false);
    const uploadNoContent = ref(false);
    const uploadError = ref(null);
    const goToPageInput = ref(null);
    const mostrarSoloNoCoincidentes = ref(false);
    const totalPages = ref(1);
    const logsSeleccionados = ref([]);
    const processingMessage = ref('');

    const mostrarNotificacion = (mac) => {
      if (Notification.permission === "granted") {
        new Notification("⚠️ MAC no registrada detectada", {
          body: `Se detectó: ${mac}`,
          icon: "/warning-icon.png", // opcional, usa un icono válido en tu proyecto
        });
      }
    };

    function showGroupedNotification(macList) {
      if (!("Notification" in window)) {
        console.warn("Este navegador no soporta notificaciones de escritorio.");
        return;
      }

      if (Notification.permission === "granted") {
        // Si el permiso está concedido, crea y muestra la notificación
        const title = "MACs no registradas detectadas";
        const body = `Se han detectado ${macList.length} MACs nuevas.\nHaz clic para revisarlas.`;
        const options = {
          body: body,
          icon: "/logo.png", // Asegúrate de que esta ruta sea accesible públicamente
          tag: "mac-alert", // TAG para agrupar notificaciones y evitar duplicadas
          renotify: false,  // No volver a notificar si ya hay una activa con este tag
        };

        const notification = new Notification(title, options);

        // 3. ¡Aquí está la clave! Asignar el manejador de eventos onclick
        notification.onclick = function () {
          console.log("Notificación clickeada. Enfocando la ventana.");
          // Lógica para lo que debe suceder cuando el usuario hace clic en la notificación.

          router.push('/logs');

          // Cierra la notificación después de que el usuario haga clic en ella
          this.close();
        };
      } else if (Notification.permission !== "denied") {
        // Si el permiso no ha sido denegado, solicita el permiso al usuario.
        // Es buena práctica solicitar el permiso en respuesta a una interacción del usuario
        // o al cargar la aplicación si es esencial.
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            console.log("Permiso de notificación otorgado. Intenta mostrar la notificación de nuevo.");
            // Si el permiso se otorga ahora, puedes intentar mostrar la notificación de nuevo
            showGroupedNotification(macList);
          } else {
            console.warn("Permiso de notificación denegado por el usuario.");
          }
        });
      } else {
        console.warn("El usuario ha denegado previamente los permisos de notificación.");
      }
    }



    const todosSeleccionados = computed(() => {
      // Si no hay logs, o si todos los logs están seleccionados
      return logs.value.length > 0 && logsSeleccionados.value.length === logs.value.length;
    });

    const deleteLogsUpdated = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        }
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        };

      const response = await api.delete('/logs/updated',config)

        if (response.status === 200 || response.status === 204) {
          alert('Logs actualizados eliminados correctamente.'); // Reemplaza con toast si lo deseas
          await fetchLogs(); // Recargar los logs
        } else {
          alert('No se eliminaron logs actualizados.'); // También puede ser un toast
        }
      } catch (err) {
        console.error('Error al eliminar logs actualizados:', err);
        alert('Error al eliminar logs actualizados.'); // Reemplazar con toast
      }
    };

    const goToGuardarDispositivo = (log) => {
      router.push({
        name: 'NuevoDispositivo',
        query: {
          mac: log.macAddress,
          sede: log.sede,
          ip: log.ip,       // pasamos la IP
          logId: log.id     // y también el ID del log
        },
      });
    };

    // Método para obtener los logs paginados desde el backend
    const fetchLogs = async () => {
      loading.value = true;
      error.value = null;

      const url = '/logs/paginated';
      const params = {
        page: currentPage.value - 1,
        size: perPage.value,
        ...(searchMac.value && {macAddress: searchMac.value}),
        ...(searchSede.value && {sede: searchSede.value}),
        ...(mostrarSoloNoCoincidentes.value && {noCoincidentes: true}),
      };

      try {
        const {data} = await api.get(url, {params});
        const {content, page} = data;
        logs.value = content;
        perPage.value = page.size;
        totalPages.value = page.totalPages;
        currentPage.value = page.number + 1;
      } catch (e) {
        error.value = e;
        console.error("Error al cargar logs:", e);
        // Aquí se usaría un toast de error
      } finally {
        loading.value = false;
      }
    };

    // Método llamado cuando cambian los filtros o el tamaño por página
    const onFilterChange = () => {
      currentPage.value = 1;
      fetchLogs();
    };

    // Métodos para navegar por la paginación
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchLogs();
      }
    };
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchLogs();
      }
    };

    // Manejar la selección de archivos para la subida manual
    const handleFileUpload = (event) => {
      selectedFile.value = event.target.files[0];
      uploadSuccess.value = false;
      uploadNoContent.value = false;
      uploadError.value = null;
      uploadProgress.value = 0;
    };

    // Ir a una página específica
    const goToPage = () => {
      if (goToPageInput.value !== null && goToPageInput.value >= 1 && goToPageInput.value <= totalPages.value) {
        currentPage.value = goToPageInput.value;
        fetchLogs();
        goToPageInput.value = null;
      } else if (goToPageInput.value !== null) {
        alert(`Por favor, ingresa un número de página entre 1 y ${totalPages.value}.`); // Reemplazar con toast
        goToPageInput.value = null;
      }
    };

    // Maneja el checkbox de "seleccionar todos"
    const seleccionarTodos = (event) => {
      if (event.target.checked) {
        logsSeleccionados.value = logs.value.map(log => log.id);
      } else {
        logsSeleccionados.value = [];
      }
    };

    // Método para borrar logs seleccionados
    const borrarLogsSeleccionados = async () => {
      if (logsSeleccionados.value.length === 0) {
        alert("Por favor, selecciona al menos un log para borrar."); // Reemplazar con toast
        return;
      }

      if (confirm('¿Estás seguro de que quieres borrar los logs seleccionados?')) { // Reemplazar con modal de confirmación
        try {
          await Promise.all(
              logsSeleccionados.value.map(id => api.delete(`/logs/${id}`)) // Asumo /logs/{id}

          );
          await fetchLogs();
          logsSeleccionados.value = [];
          alert('Logs seleccionados borrados exitosamente.'); // Reemplazar con toast
        } catch (e) {
          error.value = e;
          console.error("Error al borrar logs:", e);
          alert('Error al borrar logs. Consulta la consola para más detalles.'); // Reemplazar con toast
        }
      }
    };

    // Método de subida de archivos
    const uploadFile = async () => {
      if (!selectedFile.value) {
        alert('Por favor, selecciona un archivo CSV.'); // Reemplazar con toast
        return;
      }

      uploading.value = true;
      uploadProgress.value = 0;
      processingMessage.value = 'Procesando archivo…';
      uploadSuccess.value = false;
      uploadNoContent.value = false;
      uploadError.value = null;

      const formData = new FormData();
      formData.append('file', selectedFile.value);

      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        }
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          },
        };

        const response = await api.post('/MacAddressProvider/parser', formData, config);

        if (response.status === 204) {
          uploadNoContent.value = true;
          return;
        }

        if (response.status === 200 && response.data) {
          uploadSuccess.value = true;

          if (response.data.unregisteredMacs && response.data.unregisteredMacs.length > 0) {
            const macList = response.data.unregisteredMacs;
            const listaTexto = macList.join('\n');
            alert(`⚠️ Se detectaron MACs no registradas:\n\n${listaTexto}`); // Reemplazar con toast

            showGroupedNotification(macList);
          }

        }

          alert(response.data.message || 'Archivo procesado correctamente.'); // Reemplazar con toast

      } catch (err) { // Cambiado 'error' a 'err' para evitar conflicto con la variable reactiva 'error'
        uploadError.value = err.message || 'Error desconocido al subir el archivo.';
        console.error('Error al subir el archivo CSV:', err);
        // Reemplazar con toast
      } finally {
        uploading.value = false;

        await fetchLogs();
        selectedFile.value = null;

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
        }
      }
    };

      // --- LIFECYCLE HOOKS (antes en `mounted`) ---
      onMounted(() => {
        fetchLogs();

        if (Notification.permission !== "granted") {
          Notification.requestPermission().then(permission => {
            console.log("Permiso de notificaciones:", permission);
          });
        }
      });

      // --- WATCHERS (antes en `watch`) ---
      watch([searchMac, searchSede, mostrarSoloNoCoincidentes, perPage], onFilterChange);

      // --- RETORNO DE PROPIEDADES Y MÉTODOS PARA EL TEMPLATE ---
      return {
        // Estados
        logs, loading, error, currentPage, perPage,
        searchMac, searchSede, selectedFile, uploading, uploadProgress,
        uploadSuccess, uploadNoContent, uploadError, goToPageInput,
        mostrarSoloNoCoincidentes, totalPages, logsSeleccionados,processingMessage,

        // Computed
        todosSeleccionados,

        // Métodos
        goToGuardarDispositivo, deleteLogsUpdated, fetchLogs, onFilterChange,
        prevPage, nextPage, handleFileUpload, goToPage,
        seleccionarTodos, borrarLogsSeleccionados, uploadFile,
      };
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

.actions label {
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

.search-filters button {
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