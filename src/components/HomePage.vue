<template>
  <div class="home-page">
    <div class="hero">
      <h1>Gestión de Logs y dispositivos</h1>
      <p class="subtitle">Accede a la información de tus dispositivos y logs.</p>
    </div>
    <div class="button-container">
      <router-link to="/Dispositivos" >
        <button >Dispositivos</button>
      </router-link>
      <router-link to="/logs" class="button logs">
        <button class="fas fa-history">Logs</button>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
};
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f4f4f4;
  min-height: 80vh; /* Para que ocupe al menos la altura de la ventana */
  justify-content: center; /* Centra verticalmente el contenido */
}

.hero {
  text-align: center;
  margin-bottom: 30px;
}

.hero h1 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 10px;
}

.hero .subtitle {
  font-size: 1.1em;
  color: #666;
}

.button-container {
  display: flex;
  gap: 20px;
}

.button-container a {
  text-decoration: none; /* Elimina el subrayado de los enlaces */
}

.button-container button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ddd;
  transition: background-color 0.3s ease;
}

.button-container button:hover {
  background-color: #bbb;
}

.button-container a.logs button {
  /* Puedes añadir estilos específicos para el botón de Logs si lo deseas */
}

.button-container a.logs button.fas {
  padding-left: 10px; /* Espacio para el icono a la izquierda */
}
</style>