import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';

import router from './router';
import './api/interceptors';

const app = createApp(App); // Crea la instancia de la aplicación

app.use(router); // Usa el enrutador en la instancia de la aplicación

app.mount('#app'); // Monta la aplicación en el elemento con el id 'app'