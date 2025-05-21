<template>
  <div class="crear-usuario-page">
    <h2>Crear Nuevo Usuario</h2>

    <form @submit.prevent="crearUsuario">
      <div>
        <label>
          Email:</label>
          <input type="email" v-model="nuevoUsuario.email" required />

      </div>
      <div>
        <label>
          Nombre de Usuario:</label>
          <input type="text" v-model="nuevoUsuario.nombre" required />

      </div>
      <div>
        <label>
          Contraseña:</label>
          <input type="password" v-model="nuevoUsuario.password" required />

      </div>
      <div>
        <label>
          Rol: </label>
          <select v-model="nuevoUsuario.rol" required>
            <option disabled value="">Seleccione un rol</option>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>

      </div>
      <button type="submit">Crear Usuario</button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/api/api.js'; // Asegúrate de que la ruta a tu archivo api.js sea correcta

export default {
  name: 'CrearUsuario',
  data() {
    return {
      nuevoUsuario: {
        email: '',
        nombre: '',
        password: '',
        rol: '',
      },
      error: null,
      successMessage: null,
    };
  },
  methods: {
    async crearUsuario() {
      this.error = null;
      this.successMessage = null;
      try {
        const token = sessionStorage.getItem('accessToken'); // Asumiendo que necesitas un token para crear usuarios
        if (!token) {
          this.error = 'No estás autenticado.';
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const response = await api.post('/auth/register', this.nuevoUsuario, config);
        if (response.status === 201) {
          this.successMessage = 'Usuario creado correctamente.';
          // Opcional: Limpiar el formulario después de la creación exitosa
          this.nuevoUsuario = {email: '', nombre: '', password: '', rol: ''};
        } else {
          this.error = `Error al crear el usuario: ${response.data.message || 'Error desconocido'}`;
        }
      } catch (err) {
        // Axios envía el objeto error con err.response.status y err.response.data
        const status = err.response?.status;
        if (status === 409) {
          // mostramos el mensaje que devolvió tu backend
          this.error = err.response.data?.message || 'Ya existe un usuario con ese nombre o email.';
        } else if (status === 403) {
          this.error = 'No tienes permiso para crear usuarios.';
        } else {
          // error de red u otro
          this.error = `Error al comunicarse con el servidor: ${err.response?.data?.message || err.message}`;
        }
        console.error('Error al crear usuario:', err);
      }
    },
  }
};
</script>

<style scoped>
.crear-usuario-page {
  padding: 20px;
  font-family: sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

form {
display: flex;
  flex-direction: column; /* Mantenemos el formulario como columna */
  max-width: 400px;
  margin: 0 auto;
}

/* Estilo para cada grupo de etiqueta e input */
form > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

label {

  /* ajusta este valor al espacio que necesites para la etiqueta más larga */
  text-align: right;  /* texto de la etiqueta alineado a la derecha */

}

input[type="email"],
input[type="text"],
input[type="password"],
select {
  width: 200px; /* Ancho fijo para los inputs (ajusta según necesites) */
  padding: 8px;

  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

select {
  appearance: auto;
  background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position-x: 100%;
  background-position-y: 5px;
  padding-right: 20px;
}

button[type="submit"] {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 20px;
  transition: background-color 0.3s ease;
  align-self: center;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.success-message {
  color: green;
  margin-top: 10px;
}
</style>