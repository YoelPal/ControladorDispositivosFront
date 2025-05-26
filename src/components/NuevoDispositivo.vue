<script>
import api from "@/api/api.js";
import router from "@/router/index.js";

export default {
  name: 'CrearDispositivoPage',
  data() {
    return {
      nuevoDispositivo: {
        macAddress: this.$route.query.mac|| '',
        sede:this.$route.query.sede|| '',
        id: this.$route.query.id || '',
        fabricante: '',
        modelo: '',
        propietario: '',
        tipoDispositivo: '',
        ips: [{ ipAddress: '' }],
        tamanyo: null,
        velocidad: null,
        banda: null,
        estandarWifi: null,
        sistemaOperativo:null,
        ram:null,
        cpu: null,
        anchoBanda:null,
        puertos:null
      },
      error: null,
      logIdOrigen: this.$route.query.logId || null, // Guarda el ID del log si viene de la URL
      borrarLogOrigen: false,
    };
  },
  created() {
    if (this.$route.query.ip) {
      if (this.nuevoDispositivo.ips.length === 0) {
        this.nuevoDispositivo.ips.push({ ipAddress: this.$route.query.ip });
      } else {
        // Si ya hay IPs (ej. el usuario añadió una), sobrescribimos la primera
        // o puedes decidir no hacer nada si ya hay una.
        this.nuevoDispositivo.ips[0].ipAddress = this.$route.query.ip;
      }
    }
  },

  methods: {
    async borrarLog(id) {
      if (!id) {
        console.error("No se puede borrar el log: ID es nulo."); // Usando console.error en vez de alert
        return false; // Indica fallo
      }
      try {
        const token = sessionStorage.getItem('accessToken')
        if (!token) throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        await api.delete(`/logs/${id}`, config);
        console.log(`Log ${id} borrado exitosamente.`); // Usando console.log en vez de alert
        return true; // Indica éxito
      } catch (e) {
        console.error(`Error al borrar log ${id}:`, e);
        // Aquí podrías usar un toast.error para el usuario
        return false; // Indica fallo
      }
    },


    async crearDispositivo() {
      this.error=null;
      if (!this.nuevoDispositivo.tipoDispositivo) {
        // Muéstralo en la UI en lugar de un alert forzado
        this.error = 'Debes seleccionar un tipo de dispositivo';
        return;
      }
      try {
        const token = sessionStorage.getItem('accessToken')
        if (!token) throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const tipo = this.nuevoDispositivo.tipoDispositivo ? this.nuevoDispositivo.tipoDispositivo.toLowerCase() : '';
        let url;
        switch (tipo) {
          case 'pc':
            url = '/pc';
            break;
          case 'router':
            url = '/router';
            break;
          case 'movil':
            url = '/movil';
            break;
          case 'switch':
            url = '/switch';
            break;
          case 'ap':
            url = '/ap';
            break;
          case 'tablet':
            url = '/tablet';
            break;
          default:
            url = '/dispositivos';
        }

        console.log('Payload a enviar:', JSON.stringify(this.nuevoDispositivo, null, 2));
        await api.post(url, this.nuevoDispositivo, config);
        console.log('Dispositivo creado correctamente');
        if (this.borrarLogOrigen && this.logIdOrigen) {
          const logBorrado = await this.borrarLog(this.logIdOrigen);
          if (logBorrado) {
            console.log('Log de origen también borrado.');
          }
        }

        await router.push('/dispositivos');
      } catch (e) {
        const status = e.response.status;
        if (status === 409){
          console.log("Error 409 data:", e.response.data);
          this.error = e.response.data || 'Ya existe un dispositivo con esa dirección MAC.';
          return
        }
        if (status === 403) {
          this.error = e.response.data || 'No tienes permiso para crear dispositivos.';
          return;
        }
        this.error = e;
        console.error("Error al crear el dispositivo", e);
      }
    },
    addIp() {
      this.nuevoDispositivo.ips.push({ipAddress: ''});
    },
    removeIp(idx) {
      this.nuevoDispositivo.ips.splice(idx, 1);
    },
  }
};
</script>


<template>
  <div class="crear-dispositivo-page">
    <h2>Crear Dispositivo</h2>

    <form @submit.prevent="crearDispositivo" class="grid-form">
      <div class="columna-izq">
        <label>
          MAC Address:
          <input v-model="nuevoDispositivo.macAddress" required/>
        </label>

        <label>
          Sede:
          <input v-model="nuevoDispositivo.sede" required/>
        </label>

        <label>
          Fabricante:
          <input v-model="nuevoDispositivo.fabricante"/>
        </label>

        <label>
          Modelo:
          <input v-model="nuevoDispositivo.modelo"/>
        </label>

        <label>
          Propietario:
          <input v-model="nuevoDispositivo.propietario"/>
        </label>

        <label>
          Tipo de Dispositivo:
          <select v-model="nuevoDispositivo.tipoDispositivo" >
            <option disabled value="">Seleccione uno</option>
            <option>Pc</option>
            <option>Movil</option>
            <option>Router</option>
            <option>Ap</option>
            <option>Switch</option>
            <option>Tablet</option>
          </select>
        </label>
        <p v-if="error" class="error">{{ error }}</p>

        <!-- Campos específicos según tipo -->
        <div v-if="nuevoDispositivo.tipoDispositivo === 'Pc'">
          <label>
            Sistema Operativo:
            <input v-model="nuevoDispositivo.sistemaOperativo"/>
          </label>
          <label>
            RAM:
            <input v-model="nuevoDispositivo.ram"/>
          </label>
          <label>
            CPU:
            <input v-model="nuevoDispositivo.cpu"/>
          </label>
        </div>

        <div v-if="nuevoDispositivo.tipoDispositivo === 'Router'">
          <label>
            Ancho de Banda:
            <input type="number" v-model="nuevoDispositivo.anchoBanda"/>
          </label>
          <label>
            Velocidad:
            <input type="number" v-model="nuevoDispositivo.velocidad"/>
          </label>
        </div>

        <div v-if="nuevoDispositivo.tipoDispositivo === 'Switch' ">
          <label>
            Puertos:
            <input v-model="nuevoDispositivo.puertos"/>
          </label>
          <label>
            Velovidad:
            <input type="number" v-model="nuevoDispositivo.velocidad"/>
          </label>
        </div>

        <div v-if="nuevoDispositivo.tipoDispositivo === 'Ap' ">
          <label>
            Banda:
            <input v-model="nuevoDispositivo.banda"/>
          </label>
          <label>
            Estandar Wifi
            <input type="text" v-model="nuevoDispositivo.estandarWifi"/>
          </label>
        </div>

        <div v-if="nuevoDispositivo.tipoDispositivo === 'Tablet' ">
          <label>
            Tamaño:
            <input type="number" v-model="nuevoDispositivo.tamanyo"/>
          </label>
        </div>

        <div v-if="nuevoDispositivo.tipoDispositivo === 'Movil' ">
          <label>
            Tamaño:
            <input type="number" v-model="nuevoDispositivo.tamanyo"/>
          </label>
        </div>
        <div v-if="logIdOrigen">
          <input type="checkbox" id="borrarLog" v-model="borrarLogOrigen">
          <label for="borrarLog">Borrar Log de Origen al Guardar</label>
        </div>

        <button type="submit">Guardar</button>
        <p v-if="error" class="text-red-500 mt-4">Error: {{ error.message }}</p>
      </div>
      <div class="columna-der">
        <label>IPs:</label>
        <div
            v-for="(ipObj, idx) in nuevoDispositivo.ips"
            :key="idx"
            class="ip-row">

          <input
              v-model="nuevoDispositivo.ips[idx].ipAddress"
              placeholder="Dirección IP"
              required/>
          <button type="button" @click="removeIp(idx)">−</button>
        </div>
        <button type="button" @click="addIp()">+ Añadir IP</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.crear-dispositivo-page {
  max-width: 600px;
  margin: auto;
}
/* Creamos un grid de dos columnas */
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
}
form label {
  display: block;
  margin-bottom: 1em;
}
form input, form select {
  width: 100%;
  padding: 8px;
}
form button{
  padding: 8px 12px;
  font-size: 1em;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
  margin-right: auto;
  margin-left: auto;
  display: block;
}
form button:hover {
  background-color: #ccc;
}
.error{

  color: red;
}
</style>
