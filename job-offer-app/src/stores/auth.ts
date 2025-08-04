import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'

export type UserType = 'client' | 'installer' | null

export interface User {
  id: string
  name: string
  email: string
  type: UserType
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const userType = computed(() => user.value?.type || null)

  function setUser(userData: User) {
    user.value = userData
    // In a real app, this would be stored in localStorage/sessionStorage
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function setUserType(type: UserType) {
    if (user.value) {
      user.value.type = type
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  function initializeAuth() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('user')
      }
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    userType,
    setUser,
    setUserType,
    logout,
    initializeAuth
  }
})