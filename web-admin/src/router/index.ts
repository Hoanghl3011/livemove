import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'fleet-map',
        name: 'FleetMap',
        component: () => import('../views/FleetMap.vue'),
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
      },
      {
        path: 'drivers',
        name: 'Drivers',
        component: () => import('../views/Drivers.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/track/:id',
    name: 'CustomerTrack',
    component: () => import('../views/CustomerTrack.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Basic guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const publicRoutes = ['Login', 'CustomerTrack'];
  if (!publicRoutes.includes(to.name as string) && !token) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
