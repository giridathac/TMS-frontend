<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
    <!-- Header -->
    <div class="bg-indigo-600">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-3 font-heading">Find Your Spiritual Home</h1>
          <p class="text-indigo-100 text-base md:text-lg font-light font-sans">
            Begin your spiritual journey by joining an approved temple.
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Section -->
      <div class="bg-white rounded-xl shadow-lg border border-indigo-100 p-5 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div class="flex-1">
            <label for="search" class="block text-sm font-semibold text-indigo-900 mb-2 font-side">
              Find Your Temple
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search by temple name, city, or state..."
                class="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2 font-side">State</label>
              <select
                v-model="selectedState"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px] appearance-none"
              >
                <option value="">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-900 mb-2 font-side">Type</label>
              <select
                v-model="selectedCategory"
                class="px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-indigo-800 min-w-[140px] appearance-none"
              >
                <option value="">All Types</option>
                <option value="traditional">Traditional</option>
                <option value="modern">Modern</option>
                <option value="heritage">Heritage</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
        <p class="text-indigo-600 font-medium mt-4">Discovering sacred spaces...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTemples.length === 0 && !loading" class="text-center py-12 bg-white rounded-xl shadow-lg">
        <div class="max-w-md mx-auto px-6">
          <svg class="h-12 w-12 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="text-xl font-bold text-indigo-900 mb-3 font-heading">No Temples Found</h3>
          <p class="text-indigo-700 mb-6 font-side">
            We couldn't find any temples matching your criteria. Please try different search terms.
          </p>
          <button 
            @click="resetFilters" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Temple Results -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="temple in filteredTemples"
          :key="temple.id || temple.ID"
          class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <!-- Temple Header -->
          <div class="h-28 bg-gray-50 border-b border-gray-100 flex items-center justify-center">
            <div class="bg-white rounded-full p-3 shadow-sm border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
          </div>

          <!-- Temple Info -->
          <div class="p-5">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-lg font-bold text-gray-900 font-heading flex-1">{{ temple.name || temple.Name }}</h3>
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs font-semibold ml-2',
                  isTempleActive(temple) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ isTempleActive(temple) ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-700 font-side">
                <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {{ temple.city || temple.City || 'Unknown' }}, {{ temple.state || temple.State || 'Unknown' }}
              </div>
              
              <div v-if="temple.category || temple.templeType || temple.TempleType" class="flex items-center text-sm text-gray-700 font-side">
                <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="px-2 py-0.5 bg-gray-100 rounded-md text-gray-700 text-xs font-medium">
                  {{ temple.category || temple.templeType || temple.TempleType }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <p v-if="temple.description || temple.Description" class="text-sm text-gray-600 mb-4 line-clamp-2 font-side">
              {{ temple.description || temple.Description }}
            </p>

            <!-- Join Button / Go to Dashboard / Inactive State -->
            <div v-if="!isTempleActive(temple)" class="w-full bg-gray-100 text-gray-600 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center cursor-not-allowed">
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Temple Inactive
            </div>
            <button
              v-else-if="isTempleJoined(temple.id || temple.ID)"
              @click="goToDashboard(temple)"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Go to Dashboard
            </button>
            <button
              v-else
              @click="selectTemple(temple)"
              :disabled="joiningTemple === (temple.id || temple.ID)"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="joiningTemple === (temple.id || temple.ID)" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Joining...
              </div>
              <span v-else>Join Temple</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        @click.stop
      >
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-100 mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-indigo-900 mb-2 font-heading">
            Join {{ selectedTemple?.name || selectedTemple?.Name }}?
          </h3>
          <p class="text-indigo-700 mb-6 font-side">
            You're about to join {{ selectedTemple?.name || selectedTemple?.Name }} as a devotee. 
            You'll be able to book sevas, make donations, and participate in temple events.
          </p>
          
          <!-- SUCCESS CONFIRMATION -->
          <div v-if="joinSuccess" class="mb-6">
            <div class="bg-green-50 text-green-800 p-4 rounded-lg mb-4">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Successfully joined temple!
            </div>
            <p class="text-gray-700 mb-4">What would you like to do next?</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="navigateToProfileCreation"
                class="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Complete Profile
              </button>
              <button
                @click="navigateToDashboard"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
          
          <!-- INITIAL CONFIRMATION -->
          <div v-else class="flex flex-col sm:flex-row gap-3">
            <button
              @click="closeModal"
              class="flex-1 bg-white hover:bg-gray-50 text-indigo-700 font-medium py-2 px-4 rounded-lg border border-indigo-200 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmJoinTemple"
              :disabled="isJoining"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isJoining" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Joining...
              </span>
              <span v-else>Join Temple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import api from '@/plugins/axios'
import templeService from '@/services/temple.service'

const router = useRouter()
const { showToast } = useToast()
const { user } = useAuth()

// Reactive data
const searchQuery = ref('')
const selectedState = ref('')
const selectedCategory = ref('')
const loading = ref(true)
const joiningTemple = ref(null)
const showConfirmModal = ref(false)
const isJoining = ref(false)
const selectedTemple = ref(null)
const temples = ref([])
const joinedTemples = ref([])
const joinSuccess = ref(false)

// Check if a temple is active
const isTempleActive = (temple) => {
  // Check various possible field names for active status
  const isActive = temple.is_active ?? temple.isActive ?? temple.active ?? temple.Active ?? true
  return isActive === true || isActive === 'true' || isActive === 1 || isActive === '1'
}

// CRITICAL: Fetch user's memberships from backend
const fetchUserMemberships = async () => {
  try {
    console.log('Fetching user memberships from backend...')
    
    const response = await api.get('/memberships')
    console.log('Memberships response:', response)
    
    let memberships = response.data || response
    
    // Handle different response structures
    if (!Array.isArray(memberships)) {
      if (memberships.data && Array.isArray(memberships.data)) {
        memberships = memberships.data
      } else if (memberships.memberships && Array.isArray(memberships.memberships)) {
        memberships = memberships.memberships
      } else if (memberships.items && Array.isArray(memberships.items)) {
        memberships = memberships.items
      } else {
        memberships = []
      }
    }
    
    // Extract entity IDs from memberships and normalize to strings
    const entityIds = memberships
      .map(m => m.entity_id || m.entityId || m.temple_id || m.templeId)
      .filter(id => id != null)
      .map(id => String(id))
    
    console.log('User joined temple IDs from backend:', entityIds)
    
    joinedTemples.value = entityIds
    saveJoinedTemples()
    
    return entityIds
  } catch (error) {
    console.error('Error fetching user memberships:', error)
    // Fallback to localStorage if API fails
    loadJoinedTemples()
    return joinedTemples.value
  }
}

// Load joined temples from localStorage (fallback)
const loadJoinedTemples = () => {
  try {
    const storedJoinedTemples = localStorage.getItem('devoteeJoinedTemples')
    if (storedJoinedTemples) {
      const parsed = JSON.parse(storedJoinedTemples)
      joinedTemples.value = Array.isArray(parsed) ? parsed.map(id => String(id)) : []
      console.log('Loaded joined temples from localStorage:', joinedTemples.value)
    }
    
    const currentEntityId = localStorage.getItem('selectedEntityId') || 
                           localStorage.getItem('current_entity_id') ||
                           localStorage.getItem('current_tenant_id')
    
    if (currentEntityId && !joinedTemples.value.includes(String(currentEntityId))) {
      joinedTemples.value.push(String(currentEntityId))
      saveJoinedTemples()
    }
  } catch (error) {
    console.error('Error loading joined temples from localStorage:', error)
    joinedTemples.value = []
  }
}

// Save joined temples to localStorage
const saveJoinedTemples = () => {
  try {
    const normalizedTemples = joinedTemples.value.map(id => String(id))
    localStorage.setItem('devoteeJoinedTemples', JSON.stringify(normalizedTemples))
    console.log('Saved joined temples to localStorage:', normalizedTemples)
  } catch (error) {
    console.error('Error saving joined temples to localStorage:', error)
  }
}

// Check if a temple is already joined
const isTempleJoined = (templeId) => {
  if (!templeId) return false
  const normalizedId = String(templeId)
  const isJoined = joinedTemples.value.includes(normalizedId)
  return isJoined
}

// Go to dashboard directly for already joined temples
const goToDashboard = (temple) => {
  try {
    const templeId = temple.id || temple.ID
    
    if (!templeId) {
      console.error('Cannot navigate to dashboard: No temple ID available')
      showToast('Temple information is missing.', 'error')
      return
    }
    
    // Check if temple is still active
    if (!isTempleActive(temple)) {
      showToast('This temple is currently inactive. Access has been restricted.', 'error')
      return
    }
    
    console.log('Navigating to dashboard for temple ID:', templeId)
    saveAllTempleIds(templeId, temple)
    window.location.href = `/entity/${templeId}/devotee/dashboard`
  } catch (error) {
    console.error('Error navigating to dashboard:', error)
    showToast('Navigation error. Please try again.', 'error')
  }
}

// Computed
const filteredTemples = computed(() => {
  if (!temples.value) return []
  
  let filtered = temples.value.filter(temple => 
    temple.status === 'approved' || 
    temple.status === 'APPROVED' || 
    temple.Status === 'approved' ||
    temple.Status === 'APPROVED' ||
    !temple.status
  )
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple => {
      const name = (temple.name || temple.Name || '').toLowerCase()
      const city = (temple.city || temple.City || '').toLowerCase()
      const state = (temple.state || temple.State || '').toLowerCase()
      
      return name.includes(query) || city.includes(query) || state.includes(query)
    })
  }
  
  if (selectedState.value) {
    filtered = filtered.filter(temple => 
      (temple.state || temple.State) === selectedState.value
    )
  }
  
  if (selectedCategory.value) {
    filtered = filtered.filter(temple => 
      (temple.category || temple.templeType || temple.TempleType) === selectedCategory.value
    )
  }
  
  return filtered
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  selectedState.value = ''
  selectedCategory.value = ''
}

const selectTemple = (temple) => {
  // Check if temple is active before allowing selection
  if (!isTempleActive(temple)) {
    showToast('This temple is currently inactive and cannot accept new members.', 'error')
    return
  }
  
  selectedTemple.value = temple
  showConfirmModal.value = true
  joinSuccess.value = false
}

const closeModal = () => {
  showConfirmModal.value = false
  joinSuccess.value = false
  selectedTemple.value = null
}

const confirmJoinTemple = async () => {
  if (!selectedTemple.value) return
  
  const templeId = selectedTemple.value.id || selectedTemple.value.ID
  isJoining.value = true
  joiningTemple.value = templeId
  
  try {
    console.log(`Joining temple with ID: ${templeId}`)
    
    // Make actual API call
    await api.post('/memberships', { entity_id: templeId })
    console.log('Successfully joined temple via API')
    
    // Update local state
    const normalizedId = String(templeId)
    if (!joinedTemples.value.includes(normalizedId)) {
      joinedTemples.value.push(normalizedId)
      saveJoinedTemples()
    }
    
    saveAllTempleIds(templeId, selectedTemple.value)
    joinSuccess.value = true
    showToast('Successfully joined temple!', 'success')
  } catch (error) {
    console.error('Error joining temple:', error)
    
    // Fallback for development
    if (error.message.includes('Network Error') || error.response?.status === 404) {
      console.log('Using localStorage fallback for development')
      const normalizedId = String(templeId)
      if (!joinedTemples.value.includes(normalizedId)) {
        joinedTemples.value.push(normalizedId)
        saveJoinedTemples()
      }
      saveAllTempleIds(templeId, selectedTemple.value)
      joinSuccess.value = true
      showToast('Successfully joined temple! (Development mode)', 'success')
    } else {
      showToast('Failed to join temple. Please try again.', 'error')
      closeModal()
    }
  } finally {
    isJoining.value = false
    joiningTemple.value = null
  }
}

const saveAllTempleIds = (templeId, templeData = null) => {
  if (!templeId) return
  
  const temple = templeData || selectedTemple.value
  const templeName = temple?.name || temple?.Name || 'Selected Temple'
  const idString = String(templeId)
  
  console.log('Saving temple ID to all localStorage keys:', idString)
  
  localStorage.setItem('selectedEntityId', idString)
  localStorage.setItem('current_entity_id', idString)
  localStorage.setItem('current_tenant_id', idString)
  localStorage.setItem('selectedTempleName', templeName)
  
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
    userData.current_entity = {
      id: templeId,
      name: templeName
    }
    userData.entityId = templeId
    localStorage.setItem('user_data', JSON.stringify(userData))
  } catch (err) {
    console.error('Error updating user data in localStorage:', err)
  }
}

const navigateToProfileCreation = () => {
  try {
    const templeId = selectedTemple.value?.id || selectedTemple.value?.ID
    
    if (!templeId) {
      console.error('Cannot navigate to profile creation: No temple ID available')
      showToast('Temple information is missing. Please try rejoining the temple.', 'error')
      return
    }
    
    saveAllTempleIds(templeId, selectedTemple.value)
    window.location.href = `/entity/${templeId}/devotee/profile/create`
  } catch (error) {
    console.error('Error navigating to profile creation:', error)
    showToast('Navigation error. Please try again.', 'error')
  }
}

const navigateToDashboard = () => {
  try {
    const templeId = selectedTemple.value?.id || selectedTemple.value?.ID
    
    if (!templeId) {
      console.error('Cannot navigate to dashboard: No temple ID available')
      showToast('Temple information is missing. Please try rejoining the temple.', 'error')
      return
    }
    
    saveAllTempleIds(templeId, selectedTemple.value)
    window.location.href = `/entity/${templeId}/devotee/dashboard`
  } catch (error) {
    console.error('Error navigating to dashboard:', error)
    showToast('Navigation error. Please try again.', 'error')
  }
}

const fetchTemples = async () => {
  loading.value = true
  
  try {
    console.log('Fetching temples from API')
    const templeData = await templeService.getTemples()
    console.log('Temples fetched from API:', templeData)
    
    temples.value = templeData || []
    console.log(`Successfully processed ${temples.value.length} temples`)
  } catch (error) {
    console.error('Error fetching temple data:', error)
    showToast('Error loading temples. Please try again later.', 'error')
    temples.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Component mounted - Loading data...')
  
  // CRITICAL: First fetch user's memberships from backend
  await fetchUserMemberships()
  
  // Then fetch available temples
  await fetchTemples()
})
</script>