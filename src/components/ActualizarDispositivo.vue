<script>
import api from "@/api/api.js";
import {useRouter} from 'vue-router';

export default {
  name: 'ActualizarDispositivo',
  props: {
    mac: {
      type: String,
      required: true,
    },
  },
  setup() { // Usa setup para acceder al router
    const router = useRouter();
    return {router};
  },
  data() {
    return {
      updatedDispositivo: {
        macAddress: this.mac,
        sede: '',
        fabricante: '',
        modelo: '',
        propietario: '',
        tipoDispositivo: '',
        ips: [],
        tamanyo: null,
        velocidad: null,
        banda: null,
        estandarWifi: null,
        sistemaOperativo: null,
        ram: null,
        cpu: null,
        anchoBanda: null,
        puertos: null
      },
      error: null,
    };
  },
  mounted() {
    this.cargarDatosDispositivo();
  },

  methods: {
    async cargarDatosDispositivo() {
      this.error = null;
      try {
        const token = sessionStorage.getItem('accessToken')
        if (!token) throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const response = await api.get(`/dispositivos/${this.mac}`, config);
        this.updatedDispositivo = {...response.data, ips: response.data.ips || []};

      } catch (e) {
        this.error = e;
        console.error("Error al cargar datos del dispositivo", e);
      }
    },
    async actualizarDispositivo() {
      this.error = null;
      try {
        const token = sessionStorage.getItem('accessToken')
        if (!token) throw new Error('Token no encontrado, debe iniciar sesión de nuevo');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        const tipo = this.updatedDispositivo.tipoDispositivo.toLowerCase();
        let url;
        switch (tipo) {
          case 'pc':
            url = `/pc/${this.mac}`;
            break;
          case 'router':
            url = `/router/${this.mac}`;
            break;
          case 'movil':
            url = `/movil/${this.mac}`;
            break;
          case 'switch':
            url = `/switch/${this.mac}`;
            break;
          case 'ap':
            url = `/ap/${this.mac}`;
            break;
          case 'tablet':
            url = `/tablet/${this.mac}`;
            break;
          default:
            url = '/dispositivos';
        }

        console.log('Payload a enviar:', JSON.stringify(this.updatedDispositivo, null, 2));
        await api.put(url, this.updatedDispositivo, config);
        alert('Dispositivo actualizado correctamente')
        await this.router.push({name: 'Dispositivos'})

      } catch (e) {
        this.error = e;
        console.error("Error al actualizar el dispositivo", e);
      }
    },

    addIp() {
      this.updatedDispositivo.ips.push({ipAddress: ''});
    },
    removeIp(idx) {
      this.updatedDispositivo.ips.splice(idx, 1);
    },
  }
};
</script>

<template>
  <div class="crear-dispositivo-page">
    <h2>Actualizar Dispositivo</h2>

    <form @submit.prevent="actualizarDispositivo" class="grid-form">
      <div class="columna-izq">
        <label>
          MAC Address:
          <input v-model="updatedDispositivo.macAddress" required/>
        </label>

        <label>
          Sede:
          <input v-model="updatedDispositivo.sede" required/>
        </label>

        <label>
          Fabricante:
          <input v-model="updatedDispositivo.fabricante"/>
        </label>

        <label>
          Modelo:
          <input v-model="updatedDispositivo.modelo"/>
        </label>

        <label>
          Propietario:
          <input v-model="updatedDispositivo.propietario"/>
        </label>

        <label>
          Tipo de Dispositivo:
          <select v-model="updatedDispositivo.tipoDispositivo" disabled>
            <option disabled value="">Seleccione uno</option>
            <option>Pc</option>
            <option>Movil</option>
            <option>Router</option>
            <option>Ap</option>
            <option>Switch</option>
            <option>Tablet</option>
          </select>
        </label>

        <!-- Campos específicos según tipo -->
        <div v-if="updatedDispositivo.tipoDispositivo === 'Pc'">
          <label>
            Sistema Operativo:
            <input v-model="updatedDispositivo.sistemaOperativo"/>
          </label>
          <label>
            RAM:
            <input v-model="updatedDispositivo.ram"/>
          </label>
          <label>
            CPU:
            <input v-model="updatedDispositivo.cpu"/>
          </label>
        </div>

        <div v-if="updatedDispositivo.tipoDispositivo === 'Router'">
          <label>
            Ancho de Banda:
            <input type="number" v-model="updatedDispositivo.anchoBanda"/>
          </label>
          <label>
            Velocidad:
            <input type="number" v-model="updatedDispositivo.velocidad"/>
          </label>
        </div>

        <div v-if="updatedDispositivo.tipoDispositivo === 'Switch' ">
          <label>
            Puertos:
            <input v-model="updatedDispositivo.puertos"/>
          </label>
          <label>
            Velovidad:
            <input type="number" v-model="updatedDispositivo.velocidad"/>
          </label>
        </div>

        <div v-if="updatedDispositivo.tipoDispositivo === 'Ap' ">
          <label>
            Banda:
            <input v-model="updatedDispositivo.banda"/>
          </label>
          <label>
            Estandar Wifi
            <input type="text" v-model="updatedDispositivo.estandarWifi"/>
          </label>
        </div>

        <div v-if="updatedDispositivo.tipoDispositivo === 'Tablet' ">
          <label>
            Tamaño:
            <input type="number" v-model="updatedDispositivo.tamanyo"/>
          </label>
        </div>

        <div v-if="updatedDispositivo.tipoDispositivo === 'Movil' ">
          <label>
            Tamaño:
            <input type="number" v-model="updatedDispositivo.tamanyo"/>
          </label>
        </div>

        <button type="submit">Guardar</button>
        <p v-if="error" class="text-red-500 mt-4">Error: {{ error.message }}</p>
      </div>
      <div class="columna-der">
        <label>IPs:</label>
        <div
            v-for="(ipObj, idx) in updatedDispositivo.ips"
            :key="ipObj.id || idx"
            class="ip-row">

          <input
              v-model="updatedDispositivo.ips[idx].ipAddress"
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

form button {
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
.ip-row {
  display: flex;
  align-items: center;   /* centra verticalmente botón e input */
  gap: .5rem;            /* separación fija */
  margin-bottom: .5rem;
}

/* Este width:auto anula el width:100% global */
.ip-row input {
  flex: 1;               /* ocupa todo el espacio sobrante */
  width: auto !important;
}

/* El botón quedará a la derecha, junto al input */
.ip-row button {
  flex: 0 0 auto;        /* no crece ni se encoge */
}
</style>
