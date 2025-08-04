import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        const authStore = useAuthStore()
        if (authStore.userType === 'client') {
          return { name: 'client-dashboard' }
        } else if (authStore.userType === 'installer') {
          return { name: 'installer-dashboard' }
        }
        return { name: 'client-dashboard' }
      }
    },
    {
      path: '/client',
      name: 'client-dashboard',
      component: () => import('../views/ClientDashboard.vue')
    },
    {
      path: '/client/create-offer',
      name: 'create-offer',
      component: () => import('../views/CreateOffer.vue')
    },
    {
      path: '/installer',
      name: 'installer-dashboard',
      component: () => import('../views/InstallerDashboard.vue')
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/CalendarView.vue')
    },
    {
      path: '/work/:jobId',
      name: 'work-session',
      component: () => import('../views/WorkSession.vue'),
      props: true
    }
  ]
})

// Navigation guard to ensure authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Allow access if authenticated
  if (authStore.isAuthenticated) {
    next()
  } else {
    // If not authenticated, stay on the current route (will show user selection)
    next(false)
  }
})

export default router
