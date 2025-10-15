// src/services/donation.service.js
import api from '@/plugins/axios'
import axios from 'axios'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { logout } = useAuth()
const { showToast } = useToast()

export const donationService = {
  // Create a new donation (initiate payment process) - UPDATED: Entity-based
  async createDonation(donationData) {
    try {
      console.log('Creating donation with data:', donationData)
      
      // NEW: Get entity ID using the same resolution logic as events
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      if (!entityId) {
        throw new Error('No entity ID available for donation creation')
      }
      
      console.log(`Creating donation for entity ID: ${entityId}, tenant ID: ${tenantId}`)
      
      // Map frontend field names to backend expected field names (PascalCase)
      const payload = {
        Amount: Number(donationData.amount),
        DonationType: donationData.donationType || donationData.type || donationData.donation_type,
        Note: donationData.note || donationData.purpose || '',
      }

      // Add optional fields if provided
      if (donationData.referenceID) {
        payload.ReferenceID = donationData.referenceID
      }

      console.log('Sending donation payload:', payload)

      // NEW: Include proper headers with current tenant and entity ID
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }

      // NEW: Use entity-based URL structure like events
      const url = `/donations?entity_id=${entityId}`
      const response = await axios.post(url, payload, headers)

      console.log('Create donation response:', response.data)
      console.log('Full response structure:', JSON.stringify(response.data, null, 2))
      
      // Return the response data - let the calling component handle structure variations
      return response.data
    } catch (error) {
      console.error('Error creating donation:', error)
      
      if (error.response?.status === 401) {
        showToast('Please login to make a donation', 'error')
        logout()
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.error || 'Invalid donation data'
        showToast(errorMsg, 'error')
        console.error('Validation error:', errorMsg)
      } else {
        showToast('Failed to create donation', 'error')
      }
      throw error
    }
  },

  // Verify payment after successful Razorpay transaction - UNCHANGED
  async verifyDonation(paymentData) {
    try {
      console.log('Verifying donation with payment data:', paymentData)
      
      // Map payment data to backend expected format (matching Go struct JSON tags)
      const payload = {
        paymentID: paymentData.razorpay_payment_id || paymentData.paymentID,
        orderID: paymentData.razorpay_order_id || paymentData.orderID,
        razorpaySig: paymentData.razorpay_signature || paymentData.razorpaySig,
      }

      console.log('Sending verification payload:', payload)

      const response = await api.post('/donations/verify', payload)
      console.log('Verify donation response:', response.data)
      console.log('Verification response structure:', JSON.stringify(response.data, null, 2))
      
      return response.data
    } catch (error) {
      console.error('Error verifying donation:', error)
      if (error.response?.status === 400) {
        showToast('Payment verification failed', 'error')
      } else {
        showToast('Failed to verify donation', 'error')
      }
      throw error
    }
  },

  // Get my donations (user's own donations) - UPDATED: Entity-based filtering
  async getMyDonations() {
    try {
      console.log('Calling getMyDonations API...')
      
      // NEW: Get entity ID and include in request
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      console.log(`Fetching my donations for entity ID: ${entityId}, tenant ID: ${tenantId}`)
      
      // NEW: Build URL and headers with entity filtering
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const url = entityId ? `/donations/my?entity_id=${entityId}` : '/donations/my'
      const response = await axios.get(url, headers)
      
      console.log('My donations raw response:', response)
      console.log('My donations response data:', response.data)

      // Handle different response structures
      if (response.data && response.data.success) {
        const donations = response.data.data || []
        console.log('Extracted donations from successful response:', donations)
        return donations
      } else if (Array.isArray(response.data)) {
        console.log('Response data is array:', response.data)
        return response.data
      } else if (response.data && response.data.data) {
        console.log('Response has data property:', response.data.data)
        return response.data.data
      } else {
        console.log('Fallback: returning data or empty array')
        return response.data || []
      }
    } catch (error) {
      console.error('Error fetching my donations:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view your donations', 'error')
        logout()
      } else if (error.response?.status === 404) {
        console.warn('My donations endpoint not found - this is expected if not implemented yet')
        // Return empty array for 404, don't show error toast
        return []
      } else {
        showToast('Failed to load your donations', 'error')
      }
      throw error
    }
  },

  // Get recent donations for the current user - UPDATED: Entity-based
  async getMyRecentDonations() {
    try {
      console.log('Calling getMyRecentDonations API...')
      
      // NEW: Get entity ID and include in request
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      console.log(`Fetching my recent donations for entity ID: ${entityId}, tenant ID: ${tenantId}`)
      
      // NEW: Build headers with entity context
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const url = entityId ? `/donations/recent?entity_id=${entityId}` : '/donations/recent'
      const response = await axios.get(url, headers)
      
      console.log('Recent donations raw response:', response)
      console.log('Recent donations response data:', response.data)

      // Handle the response structure from your backend
      if (response.data && response.data.recent_donations && Array.isArray(response.data.recent_donations)) {
        const recentDonations = response.data.recent_donations.map(donation => ({
          // Map backend field names to frontend expected names
          id: donation.id || donation.ID || Math.random(),
          amount: donation.amount || donation.Amount,
          donation_type: donation.donation_type || donation.DonationType,
          donationType: donation.donation_type || donation.DonationType,
          type: donation.donation_type || donation.DonationType,
          method: donation.method || donation.Method,
          status: donation.status || donation.Status,
          date: donation.donated_at || donation.DonatedAt || donation.date,
          donation_date: donation.donated_at || donation.DonatedAt,
          donated_at: donation.donated_at || donation.DonatedAt,
          note: donation.note || donation.Note || donation.purpose
        }))
        
        console.log('Mapped recent donations:', recentDonations)
        return recentDonations
      } else if (Array.isArray(response.data)) {
        // Handle direct array response
        return response.data.map(donation => ({
          id: donation.id || donation.ID || Math.random(),
          amount: donation.amount || donation.Amount,
          donation_type: donation.donation_type || donation.DonationType,
          donationType: donation.donation_type || donation.DonationType,
          type: donation.donation_type || donation.DonationType,
          method: donation.method || donation.Method,
          status: donation.status || donation.Status,
          date: donation.donated_at || donation.DonatedAt || donation.date,
          donation_date: donation.donated_at || donation.DonatedAt,
          donated_at: donation.donated_at || donation.DonatedAt,
          note: donation.note || donation.Note || donation.purpose
        }))
      } else {
        console.warn('Unexpected response format for recent donations:', response.data)
        return []
      }
    } catch (error) {
      console.error('Error fetching recent donations:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view your recent donations', 'error')
        logout()
      } else if (error.response?.status === 404) {
        console.warn('Recent donations endpoint not found')
        return []
      } else {
        showToast('Failed to load recent donations', 'error')
      }
      return []
    }
  },

  // Get donation dashboard stats for entity admin - UPDATED: Entity-based
  async getDonationStats() {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      console.log(`Fetching donation stats for entity ID: ${entityId}, tenant ID: ${tenantId}`)
      
      // NEW: Include entity context in headers
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const url = entityId ? `/donations/dashboard?entity_id=${entityId}` : '/donations/dashboard'
      const response = await axios.get(url, headers)
      
      console.log('Dashboard stats response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching donation stats:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view statistics', 'error')
      } else if (error.response?.status === 401) {
        showToast('Please login to view statistics', 'error')
        logout()
      } else {
        showToast('Failed to load statistics', 'error')
      }
      throw error
    }
  },

  // Get recent donations for dashboard - UPDATED: Entity-based
  async getRecentDonations(limit = 5) {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      // NEW: Build entity-aware request
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      // First try to get recent donations from the specific endpoint
      try {
        const url = entityId ? `/donations/recent?entity_id=${entityId}&limit=${limit}` : `/donations/recent?limit=${limit}`
        const recentResponse = await axios.get(url, headers)
        
        if (recentResponse.data && recentResponse.data.recent_donations) {
          return recentResponse.data.recent_donations.slice(0, limit)
        }
      } catch (recentError) {
        console.warn('Recent donations endpoint failed, falling back to general endpoint:', recentError)
      }

      // Fallback to the general donations endpoint with limit
      const fallbackUrl = entityId ? `/donations?entity_id=${entityId}&limit=${limit}&page=1` : `/donations?limit=${limit}&page=1`
      const response = await axios.get(fallbackUrl, headers)
      
      console.log('Recent donations response:', response.data)
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching recent donations:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view recent donations', 'error')
      } else {
        showToast('Failed to load recent donations', 'error')
      }
      throw error
    }
  },

  // Get all donations with pagination and filtering - UPDATED: Entity-based
  async getDonations(filters = {}) {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      console.log(`Fetching donations for entity ID: ${entityId}, tenant ID: ${tenantId}`)
      
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        // NEW: Include entity_id in query parameters
        ...(entityId ? { entity_id: entityId } : {}),
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.type && filters.type !== 'all' ? { type: filters.type } : {}),
        ...(filters.method && filters.method !== 'all' ? { method: filters.method } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.min !== undefined && filters.min !== null && filters.min !== '' ? { min: filters.min } : {}),
        ...(filters.max !== undefined && filters.max !== null && filters.max !== '' ? { max: filters.max } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.dateRange && filters.dateRange !== 'all' ? { dateRange: filters.dateRange } : {}),
      }

      // NEW: Include entity headers
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }

      console.log('Fetching donations with params:', params)
      const response = await axios.get('/donations/', { params, ...headers })

      console.log('Get donations response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching donations:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view donations', 'error')
        logout()
      } else if (error.response?.status === 404) {
        showToast('Donation endpoint not found', 'error')
      } else if (error.response?.status === 401) {
        showToast('Please login to view donations', 'error')
        logout()
      } else {
        showToast('Failed to load donations', 'error')
      }
      throw error
    }
  },

  // Get donation dashboard data - UPDATED: Entity-based
  async getDashboard() {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const url = entityId ? `/donations/dashboard?entity_id=${entityId}` : '/donations/dashboard'
      const response = await axios.get(url, headers)
      
      console.log('Dashboard data response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching donation dashboard:', error)
      if (error.response?.status === 401) {
        showToast('Please login to view dashboard', 'error')
        logout()
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to view dashboard', 'error')
      } else {
        showToast('Failed to load dashboard data', 'error')
      }
      throw error
    }
  },

  // Get top donors - UPDATED: Entity-based
  async getTopDonors(limit = 5) {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const params = { 
        limit,
        ...(entityId ? { entity_id: entityId } : {})
      }
      
      const response = await axios.get('/donations/top-donors', { params, ...headers })
      console.log('Top donors response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching top donors:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view top donors', 'error')
      } else {
        showToast('Failed to load top donors', 'error')
      }
      throw error
    }
  },

  // Get donation analytics - UPDATED: Entity-based
  async getAnalytics(days = 30) {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      const params = { 
        days,
        ...(entityId ? { entity_id: entityId } : {})
      }
      
      const response = await axios.get('/donations/analytics', { params, ...headers })
      console.log('Analytics response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to view analytics', 'error')
      } else {
        showToast('Failed to load analytics', 'error')
      }
      throw error
    }
  },

  // Generate donation receipt - UPDATED: Entity-based
  async generateReceipt(donationId) {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }
      
      // NEW: Include entity context in URL if needed
      const url = entityId ? `/donations/${donationId}/receipt?entity_id=${entityId}` : `/donations/${donationId}/receipt`
      const response = await axios.get(url, headers)
      
      console.log('Receipt response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error generating receipt:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to generate receipts', 'error')
      } else if (error.response?.status === 404) {
        showToast('Donation not found', 'error')
      } else {
        showToast('Failed to generate receipt', 'error')
      }
      throw error
    }
  },

  // Export donations - UPDATED: Entity-based
  async exportDonations(filters = {}, format = 'csv') {
    try {
      const entityId = this.getCurrentEntityId()
      const tenantId = localStorage.getItem('current_tenant_id')
      
      const params = {
        format,
        // NEW: Include entity_id in export params
        ...(entityId ? { entity_id: entityId } : {}),
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.type && filters.type !== 'all' ? { type: filters.type } : {}),
        ...(filters.method && filters.method !== 'all' ? { method: filters.method } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
      }

      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      }

      const response = await axios.get('/donations/export', {
        params,
        ...headers,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `donations_export_${new Date().toISOString().slice(0, 10)}.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return response.data
    } catch (error) {
      console.error('Error exporting donations:', error)
      if (error.response?.status === 403) {
        showToast('You do not have permission to export donations', 'error')
      } else {
        showToast('Failed to export donations', 'error')
      }
      throw error
    }
  },

  // NEW: Helper method to get current entity ID - SAME LOGIC AS EVENTS
  getCurrentEntityId() {
    // Priority 1: Check URL path for entity ID
    const currentPath = window.location.pathname
    const entityMatch = currentPath.match(/\/entity\/(\d+)/)
    if (entityMatch) {
      const entityId = entityMatch[1]
      console.log(`Entity ID from URL path: ${entityId}`)
      return entityId
    }

    // Priority 2: Check localStorage
    const storedEntityId = localStorage.getItem('current_entity_id')
    if (storedEntityId && storedEntityId !== 'null' && storedEntityId !== 'undefined') {
      console.log(`Entity ID from localStorage: ${storedEntityId}`)
      return storedEntityId
    }

    // Priority 3: For role-based fallback, try to get from user info
    const userInfo = this.getUserInfo()
    if (userInfo) {
      switch (userInfo.role) {
        case 'templeadmin':
          if (userInfo.entityId) {
            console.log(`TempleAdmin entity ID: ${userInfo.entityId}`)
            return userInfo.entityId.toString()
          }
          break
        
        case 'standarduser':
        case 'monitoringuser':
          if (userInfo.assignedTenantId) {
            console.log(`StandardUser/MonitoringUser assigned tenant ID: ${userInfo.assignedTenantId}`)
            return userInfo.assignedTenantId.toString()
          }
          break
      }
    }

    console.warn('Could not resolve entity ID')
    return null
  },

  // NEW: Helper method to get user info from localStorage or token - SAME AS EVENTS
  getUserInfo() {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
          userId: payload.user_id,
          role: payload.role || payload.role_name,
          entityId: payload.entity_id,
          assignedTenantId: payload.assigned_tenant_id
        }
      }
    } catch (error) {
      console.warn('Error parsing user info from token:', error)
    }
    return null
  },

  // Donation types for dropdowns and filters - UNCHANGED
  getDonationTypes() {
    return [
      { value: 'general', label: 'General Donation' },
      { value: 'seva', label: 'Seva Donation' },
      { value: 'festival', label: 'Festival Donation' },
      { value: 'construction', label: 'Construction Fund' },
      { value: 'annadanam', label: 'Annadanam' },
      { value: 'education', label: 'Education Fund' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'temple_maintenance', label: 'Temple Maintenance' },
      { value: 'event', label: 'Event Donation' },
    ]
  },
}

export default donationService