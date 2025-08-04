<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type UserType } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const selectedType = ref<UserType>(null)

function selectUserType(type: UserType) {
  selectedType.value = type
}

function proceed() {
  if (selectedType.value) {
    // In a real app, this would involve proper authentication
    const mockUser = {
      id: crypto.randomUUID(),
      name: selectedType.value === 'client' ? 'Cliente Demo' : 'Instalador Demo',
      email: `${selectedType.value}@demo.com`,
      type: selectedType.value
    }
    authStore.setUser(mockUser)
    
    // Navigate to the appropriate dashboard
    if (selectedType.value === 'client') {
      router.push('/client')
    } else if (selectedType.value === 'installer') {
      router.push('/installer')
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="container">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Gestão de Ofertas de Trabalho
        </h1>
        <p class="text-gray-600">
          Selecione o tipo de utilizador para continuar
        </p>
      </div>

      <div class="space-y-4">
        <!-- Client Option -->
        <div 
          @click="selectUserType('client')"
          :class="[
            'card cursor-pointer border-2 transition-all',
            selectedType === 'client' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Cliente</h3>
              <p class="text-sm text-gray-600">
                Crie ofertas de trabalho e encontre instaladores
              </p>
            </div>
            <div class="ml-auto">
              <div 
                :class="[
                  'w-4 h-4 rounded-full border-2',
                  selectedType === 'client' 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'border-gray-300'
                ]"
              />
            </div>
          </div>
        </div>

        <!-- Installer Option -->
        <div 
          @click="selectUserType('installer')"
          :class="[
            'card cursor-pointer border-2 transition-all',
            selectedType === 'installer' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Instalador</h3>
              <p class="text-sm text-gray-600">
                Encontre trabalhos disponíveis e gerencie seus projetos
              </p>
            </div>
            <div class="ml-auto">
              <div 
                :class="[
                  'w-4 h-4 rounded-full border-2',
                  selectedType === 'installer' 
                    ? 'bg-green-600 border-green-600' 
                    : 'border-gray-300'
                ]"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <button 
          @click="proceed"
          :disabled="!selectedType"
          :class="[
            'btn w-full',
            selectedType 
              ? (selectedType === 'client' ? 'btn-primary' : 'btn-success')
              : 'btn-secondary opacity-50 cursor-not-allowed'
          ]"
        >
          Continuar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Ensure cards are highly visible */
.card {
  background: white !important;
  border: 2px solid #d1d5db !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.card:hover {
  border-color: #9ca3af !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

/* Ensure text is dark and visible */
.text-gray-900 {
  color: #111827 !important;
}

.text-gray-600 {
  color: #4b5563 !important;
}

/* Ensure icons are visible */
.text-blue-600 {
  color: #2563eb !important;
}

.text-green-600 {
  color: #16a34a !important;
}
</style>