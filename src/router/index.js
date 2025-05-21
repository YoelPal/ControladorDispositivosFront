import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import DispositivosPage from '../components/DispositivosPage.vue';
import LogsPage from '../components/LogsPage.vue';
import Login from "@/components/Login.vue";
import NuevoDispositivo from "@/components/NuevoDispositivo.vue";
import ActualizarDispositivo from "@/components/ActualizarDispositivo.vue";
import CrearUsuarioPage from "@/components/CrearUsuarioPage.vue";

const routes = [
    {
        path: '/login', component: Login
    },
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        meta: {requiresAuth: true}
    },
   {
        path: '/dispositivos',
        name: 'Dispositivos',
        component: DispositivosPage,
        meta: {requiresAuth: true}
    },
   {
        path: '/logs',
        name: 'Logs',
        component: LogsPage,
        meta: {requiresAuth: true}
    },
    {
        path: '/nuevoDispositivo',
        name: 'NuevoDispositivo',
        component: NuevoDispositivo,
        meta: {requiresAuth:  true}
    },
    {
        path: '/actualizarDispositivo/:mac',
        name: 'ActualizarDispositivo',
        component: ActualizarDispositivo,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/crearUsuario',
        name: 'CrearUsuario',
        component: CrearUsuarioPage,
        meta: {requiresAuth: true}
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes
});
// Navigation guard
router.beforeEach((to, from, next) => {
    const token = sessionStorage.getItem('accessToken');
    if (to.meta.requiresAuth &&  (!token || token === 'null' || token === 'undefined' || token === '')) {
        next('/login');
    } else next();
});

export default router;