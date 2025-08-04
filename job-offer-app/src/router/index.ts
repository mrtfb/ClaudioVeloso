import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import UserTypeSelection from '../components/UserTypeSelection.vue'
import AppLayout from '../components/AppLayout.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: UserTypeSelection
    },
    {
      path: '/app',
      component: AppLayout,
      children: [
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
          path: '/job/:jobId',
          name: 'job-details',
          component: () => import('../views/JobDetails.vue'),
          props: true
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
    }
  ]
})

// Navigation guard to ensure authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Allow access to home route (user selection) even if not authenticated
  if (to.name === 'home') {
    next()
    return
  }

  // For other routes, require authentication
  if (authStore.isAuthenticated) {
    next()
  } else {
    // If not authenticated, redirect to home
    next({ name: 'home' })
  }
})

export default router
