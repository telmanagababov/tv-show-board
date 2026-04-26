import { createRouter, createWebHistory } from 'vue-router'
import { RouteNames } from '@/shared/constants/route-names'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteNames.DASHBOARD,
      component: () => import('@/features/dashboard/DashboardView.vue'),
    },
    {
      path: '/details/:id',
      name: RouteNames.DETAILS,
      component: () => import('@/features/details/DetailsView.vue'),
      props: true,
    },
    {
      path: '/search',
      name: RouteNames.SEARCH,
      component: () => import('@/features/search/SearchView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteNames.NOT_FOUND,
      component: () => import('@/shell/NotFoundView.vue'),
    },
  ],
})

export default router
