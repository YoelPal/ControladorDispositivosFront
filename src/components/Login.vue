<template>
  <div class="login-container">
    <h1 class="login-title">Iniciar Sesión</h1>
    <form class="login-form" @submit.prevent="login">
      <input v-model="nombre" placeholder="Usuario" class="login-input" />
      <input v-model="password" type="password" placeholder="Contraseña" class="login-input" />
      <button type="submit" class="login-button">Entrar</button>
    </form>
  </div>
</template>

<script>
import api from '../api/api';

export default {
  data() {
    return { nombre: '', password: '' };
  },
  methods: {
    async login() {
      try {
        const { data } = await api.post('/auth/login', {
          nombre: this.nombre,
          password: this.password
        });


        const accessToken = data.tokenResponse;
        const refreshToken = data.refreshToken;
        if (!accessToken) throw new Error('JWT no fue retornado');
        if (!refreshToken) throw new Error('RefreshToken no fue retornado');
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        this.$router.push('/');
      } catch (e) {
        console.error('Login error:', e);
        alert(e.response?.data?.message || e.message || 'Error en login');
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Ajusta según tus necesidades */
  background-color: #f4f4f4;
  font-family: sans-serif;
}

.login-title {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.login-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 300px;
}

.login-input {
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

.login-button {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #0056b3;
}
</style>