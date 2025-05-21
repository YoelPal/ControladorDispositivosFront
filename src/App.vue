<script>
import HomePage from './components/HomePage.vue';
import DispositivosPage from './components/DispositivosPage.vue';
import LogsPage from './components/LogsPage.vue';
import api from './api/api.js'
import Login from "@/components/Login.vue";

export default {
  name: 'App',
  components: {
    HomePage,
    DispositivosPage,
    LogsPage,
    Login
  },
  data() {
    return {
    };
  },
  methods:{
    logout() {
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      this.$router.push('/login');
    }
  }
};
</script>

<template>
  <div id="app">
    <nav v-if="$route.path !== '/login' ">
      <router-link to="/" active-class="router-link-active" class="nav-link">Inicio</router-link>
      <span class="nav-separator">|</span>
      <router-link to="/dispositivos" active-class="router-link-active" class="nav-link">Dispositivos</router-link>
      <span class="nav-separator">|</span>
      <router-link to="/logs" active-class="router-link-active" class="nav-link">Logs</router-link>
      <span class="nav-separator">|</span>
      <router-link to="/crearUsuario" active-class="router-link-active" class="nav-link">Crear Usuario</router-link>
      <button @click="logout" class="logout-button">
        Cerrar sesión
      </button>
    </nav>
    <router-view></router-view>
  </div>
</template>

<style scoped>
#app {
  font-family: sans-serif;
}

nav {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.nav-link {
  color: #333;
  text-decoration: none;
  margin-right: 10px;
  padding: 8px 12px;
  border-radius: 5px;
}

.nav-link:hover {
  background-color: #eee;
}

.router-link-active {
  font-weight: bold;
  background-color: #ddd;
}

.nav-separator {
  color: #ccc;
  margin: 0 10px;
}

.logout-button {
  padding: 8px 15px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-left: auto; /* Empuja el botón a la derecha */
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333;
}
</style>