import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/features/dashboard/DashboardView.vue'),
    },
    {
      path: '/show/:id',
      name: 'show-detail',
      component: () => import('@/features/show-detail/ShowDetailView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/features/search/SearchView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/shared/components/NotFoundView.vue'),
    },
  ],
})

export default router
