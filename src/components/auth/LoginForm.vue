<template>
  <div class="login-form">
    <!-- Alert for errors -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span class="block sm:inline">{{ error }}</span>
      <button 
        @click="error = null" 
        class="absolute top-0 right-0 p-2"
        type="button"
      >
        <span class="text-red-700">&times;</span>
      </button>
    </div>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
      <!-- Email Input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
            :disabled="isLoading"
          />
        </div>
      </div>
      
      <!-- Password Input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="mt-1">
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password"
            :disabled="isLoading"
          />
        </div>
      </div>
      
      <!-- Remember Me Checkbox -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember_me"
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            :disabled="isLoading"
          />
          <label for="remember_me" class="ml-2 block text-sm text-gray-900">Remember me</label>
        </div>
        
        <div class="text-sm">
          <router-link 
            v-if="isCaptchaVerified"
            to="/forgot-password" 
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </router-link>
          <span 
            v-else
            class="font-medium text-gray-400 cursor-not-allowed"
            title="Complete CAPTCHA verification first"
          >
            Forgot your password?
          </span>
        </div>
      </div>

      <!-- CAPTCHA Container -->
      <div id="turnstile"></div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="isLoading || !isCaptchaVerified"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="isLoading">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </template>
          <template v-else-if="!isCaptchaVerified">
            Complete CAPTCHA to Sign in
          </template>
          <template v-else>
            Sign in
          </template>
        </button>
      </div>
      
      <!-- Register Link -->
      <div class="text-center">
        <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Don't have an account? Register
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form state
const form = ref({
  email: '',
  password: ''
})
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref(null)
const captchaToken = ref('')
const isCaptchaVerified = ref(false)
const siteKey = import.meta.env.VITE_CLOUDFLARE_CAPTCHA_KEY || ''

// Get redirect path from URL if available
const redirectPath = computed(() => route.query.redirect || '')

// Login handler
const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please enter your email and password'
    return
  }
  
  if (!isCaptchaVerified.value) {
    error.value = 'Please complete the CAPTCHA verification'
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    console.log('🔑 Starting login process...')
    
    // Only use auth store login method - no custom logic
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password,
      captchaToken: captchaToken.value
    })
    
    if (result.success) {
      console.log('✅ Login successful!')
      console.log('👤 User role:', authStore.userRole)
      console.log('📍 Redirect path from auth store:', result.redirectPath)
      
      // Always use result.redirectPath from auth store
      const targetPath = result.redirectPath
      
      console.log('🚀 Navigating to:', targetPath)
      
      // Use router.push for proper Vue Router navigation
      await router.push(targetPath)
      
      console.log('✅ Navigation completed successfully')
      
    } else {
      console.log('❌ Login failed:', result.error)
      error.value = result.error || 'Login failed'
      
      // Reset CAPTCHA on failed login
      resetCaptcha()
    }
  } catch (err) {
    console.error('💥 Login error:', err)
    
    // Better error handling based on error type
    if (err.response) {
      // Backend responded with an error
      if (err.response.status === 401) {
        error.value = 'Invalid email or password'
      } else if (err.response.status === 403) {
        error.value = 'Your account is locked or inactive'
      } else if (err.response.status >= 500) {
        error.value = 'Server error. Please try again later'
      } else {
        error.value = err.response.data?.message || err.response.data?.error || 'Login failed'
      }
    } else if (err.request) {
      // Network error
      error.value = 'Cannot connect to the server. Please check your internet connection'
    } else {
      // Other error
      error.value = err.message || 'An unexpected error occurred'
    }
    
    // Reset CAPTCHA on error
    resetCaptcha()
  } finally {
    isLoading.value = false
  }
}

// Reset CAPTCHA function
const resetCaptcha = () => {
  isCaptchaVerified.value = false
  captchaToken.value = ''
  if (window.turnstile) {
    window.turnstile.reset()
  }
}

onMounted(() => {
  if (window.turnstile) {
    window.turnstile.render(
      '#turnstile', 
      {
        sitekey: '0x4AAAAAAB5PF2XfNfEgAul2',
        callback: function(token) {
          captchaToken.value = token
          isCaptchaVerified.value = true
          console.log("✅ CAPTCHA verification successful")
        },
        'error-callback': function() {
          captchaToken.value = ''
          isCaptchaVerified.value = false
          error.value = 'CAPTCHA verification failed. Please try again.'
          console.log("❌ CAPTCHA verification failed")
        },
        'expired-callback': function() {
          captchaToken.value = ''
          isCaptchaVerified.value = false
          error.value = 'CAPTCHA expired. Please verify again.'
          console.log("⏰ CAPTCHA expired")
        }
      }
    )
  }
})

</script>

<style scoped>
.login-form {
  width: 100%;
}
</style>