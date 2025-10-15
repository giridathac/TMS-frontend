// src/services/seva.service.js - Updated version with entity ID resolution similar to events
import axios from 'axios'

class SevaService {

  /**
   * Get all sevas for the current entity (temple) - matches /entity-sevas route
   * @param {Object} params - Query parameters for filtering (seva_type, search, page, limit)
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getSevas(params = {}) {
    try {
      // Get entity ID using the same resolution logic as events
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log(`Fetching sevas for entity ID: ${entityId}, tenant ID: ${tenantId}`);
      
      // Store entity ID in localStorage for future use
      if (entityId) {
        localStorage.setItem('current_entity_id', entityId);
      }
      
      // Build URL with entity filtering - similar to events pattern
      const url = entityId ? `/sevas/entity-sevas?entity_id=${entityId}` : '/sevas/entity-sevas';
      
      // Include proper headers with current tenant and entity ID
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      };
      
      console.log(`Requesting sevas from: ${url} with headers:`, headers);
      console.log('Requesting sevas with params:', params);
      
      // Merge entity_id into params for backend filtering
      const requestParams = {
        ...params,
        entity_id: entityId
      };
      
      const response = await axios.get(url, { 
        ...headers,
        params: requestParams 
      });
      
      console.log('Seva response:', response.data);
      
      return {
        success: true,
        data: response.data?.sevas || [],
        total: response.data?.total || 0,
        pagination: response.data?.pagination || {}
      }
    } catch (error) {
      console.error('Error fetching sevas:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get all sevas for devotees - matches / route with devotee middleware
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>} Seva list with pagination
   */
  async getDevoteeSevas(params = {}) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log('Requesting devotee sevas with params:', params);
      console.log(`Devotee sevas for entity ID: ${entityId}, tenant ID: ${tenantId}`);
      
      // Build URL with entity filtering for devotees
      const url = entityId ? `/sevas?entity_id=${entityId}` : '/sevas';
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      };
      
      // Merge entity_id into params
      const requestParams = {
        ...params,
        entity_id: entityId
      };
      
      const response = await axios.get(url, { 
        ...headers,
        params: requestParams 
      });
      
      console.log('Devotee seva response:', response.data);
      
      return {
        success: true,
        data: response.data?.sevas || [],
        pagination: response.data?.pagination || {}
      }
    } catch (error) {
      console.error('Error fetching devotee sevas:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sevas',
        data: []
      }
    }
  }

  /**
   * Get seva by ID - matches /:id route
   * @param {string} sevaId - Seva ID
   * @returns {Promise<Object>} Seva details
   */
  async getSevaById(sevaId) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      };
      
      console.log(`Fetching seva ${sevaId} for entity ID: ${entityId}`);
      const response = await axios.get(`v1/sevas/${sevaId}`, headers);
      
      return {
        success: true,
        data: response.data || null
      }
    } catch (error) {
      console.error('Error fetching seva:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch seva details',
        data: null
      }
    }
  }

  /**
   * Get booking counts - matches /booking-counts route
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingCounts() {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log(`Fetching booking counts for entity ID: ${entityId}, tenant ID: ${tenantId}`);
      
      // Build URL with entity filtering
      const url = entityId ? `/sevas/booking-counts?entity_id=${entityId}` : '/sevas/booking-counts';
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Entity-ID': entityId
        }
      };
      
      const response = await axios.get(url, headers);
      
      console.log('Booking counts response:', response.data);
      return {
        success: true,
        data: response.data || {}
      }
    } catch (error) {
      console.error('Error fetching booking counts:', error)
      // Don't throw error for stats, return empty stats like events
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking counts',
        data: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      }
    }
  }

  /**
   * Create a new seva - matches POST / route
   * @param {Object} sevaData - Seva data to create
   * @returns {Promise<Object>} Creation response
   */
  async createSeva(sevaData) {
    try {
      // Use the same entity ID resolution logic as events
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      if (!entityId) {
        throw new Error('No entity ID available for seva creation');
      }

      // Prepare the data with proper entity ID - similar to event creation
      const apiData = {
        name: sevaData.name,
        seva_type: sevaData.seva_type || sevaData.sevaType,
        description: sevaData.description || '',
        price: sevaData.price || 0,
        date: sevaData.date || sevaData.seva_date,
        start_time: sevaData.start_time || sevaData.startTime,
        end_time: sevaData.end_time || sevaData.endTime,
        duration: sevaData.duration || 30,
        max_bookings_per_day: sevaData.max_bookings_per_day || sevaData.maxBookingsPerDay || 10,
        entity_id: parseInt(entityId) // Ensure it's stored as integer
      };

      console.log('Creating seva with data:', apiData);
      console.log('Entity ID being used:', entityId);
      
      // Use headers to ensure proper entity context
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      const response = await axios.post('/sevas', apiData, headers);
      console.log('Seva created successfully:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Seva created successfully'
      }
    } catch (error) {
      console.error('Error creating seva:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Update seva - matches PUT /:id route
   * @param {string} sevaId - Seva ID to update
   * @param {Object} sevaData - Updated seva data
   * @returns {Promise<Object>} Update response
   */
  async updateSeva(sevaId, sevaData) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      // Prepare API data - similar to event update
      const apiData = {
        name: sevaData.name,
        seva_type: sevaData.seva_type || sevaData.sevaType,
        description: sevaData.description || '',
        price: sevaData.price || 0,
        date: sevaData.date || sevaData.seva_date,
        start_time: sevaData.start_time || sevaData.startTime,
        end_time: sevaData.end_time || sevaData.endTime,
        duration: sevaData.duration || 30,
        max_bookings_per_day: sevaData.max_bookings_per_day || sevaData.maxBookingsPerDay || 10,
        status: sevaData.status
      };

      // Include entity ID in headers for context
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };

      console.log('Updating seva with ID:', sevaId, 'Data:', apiData);
      console.log('Entity ID context:', entityId);
      
      const response = await axios.put(`/sevas/${sevaId}`, apiData, headers);
      
      return {
        success: true,
        data: response.data,
        message: 'Seva updated successfully',
        wasUpdate: true,
        id: sevaId
      }
    } catch (error) {
      console.error('Error updating seva:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update seva',
        errors: error.response?.data?.errors || {}
      }
    }
  }

  /**
   * Delete seva - HARD DELETE, not just inactive - matches DELETE /:id route
   * @param {string} sevaId - Seva ID to delete permanently
   * @returns {Promise<Object>} Delete response
   */
  async deleteSeva(sevaId) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log('Permanently deleting seva with ID:', sevaId);
      console.log('Entity context:', entityId);
      
      // Include entity context in headers - similar to events
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId,
          'X-Force-Delete': 'true' // Additional header approach
        }
      };
      
      // Use DELETE method with force parameter to ensure hard delete
      const response = await axios.delete(`/sevas/${sevaId}`, {
        ...headers,
        params: { 
          force: true, // Add force parameter to ensure hard delete
          permanent: true // Additional flag to ensure permanent deletion
        }
      });
      
      console.log('Delete response:', response.data);
      
      return {
        success: true,
        message: 'Seva permanently deleted successfully',
        id: sevaId
      }
    } catch (error) {
      console.error('Error deleting seva:', error);
      console.error('Delete error details:', error.response?.data);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Seva not found or already deleted'
        }
      } else if (error.response?.status === 409) {
        return {
          success: false,
          error: 'Cannot delete seva - it has existing bookings. Please contact administrator.'
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to permanently delete seva'
      }
    }
  }

  /**
   * Alternative method for soft delete (set as inactive) if needed
   * @param {string} sevaId - Seva ID to deactivate
   * @returns {Promise<Object>} Deactivate response
   */
  async deactivateSeva(sevaId) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log('Deactivating seva with ID:', sevaId);
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      const response = await axios.patch(`/sevas/${sevaId}/deactivate`, {}, headers);
      
      return {
        success: true,
        data: response.data,
        message: 'Seva deactivated successfully'
      }
    } catch (error) {
      console.error('Error deactivating seva:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to deactivate seva'
      }
    }
  }

  /**
   * Book a seva - matches POST /bookings route (devotee only)
   * @param {number} sevaId - Seva ID to book
   * @returns {Promise<Object>} Booking response
   */
  async bookSeva(sevaId) {
    const payload = { seva_id: sevaId };

    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      console.log(`Booking seva ${sevaId} for entity ${entityId}`);
      const response = await axios.post('/sevas/bookings', payload, headers);

      return {
        success: true,
        data: response.data,
        message: 'Seva booked successfully'
      };
    } catch (error) {
      console.error('Error booking seva:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to book seva'
      };
    }
  }

  /**
   * Get user's seva bookings - matches GET /my-bookings route (devotee only)
   * @returns {Promise<Object>} User's booking history
   */
  async getMyBookings() {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      console.log(`Fetching my bookings for entity ${entityId}`);
      const response = await axios.get('/sevas/my-bookings', headers);
      
      return {
        success: true,
        data: response.data?.bookings || []
      };
    } catch (error) {
      console.error('Error fetching my bookings:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking history',
        data: []
      };
    }
  }

  /**
   * Get entity bookings - matches GET /entity-bookings route (temple admin)
   * @param {string} entityId - Optional entity ID to filter bookings
   * @returns {Promise<Object>} Entity bookings with pagination
   */
  async getEntityBookings(entityId) {
    try {
      // Use provided entityId or get from resolution logic
      const resolvedEntityId = entityId || this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log(`Fetching entity bookings for entity ID: ${resolvedEntityId}, tenant ID: ${tenantId}`);
      
      // Build URL with entity filtering - similar to events pattern
      const url = resolvedEntityId ? 
        `/sevas/entity-bookings?entity_id=${resolvedEntityId}` : 
        '/sevas/entity-bookings';
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': resolvedEntityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      console.log(`Requesting entity bookings from: ${url} with headers:`, headers);
      const response = await axios.get(url, headers);
      
      console.log('Entity bookings response:', response.data);
      return {
        success: true,
        data: response.data.bookings || [], 
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error fetching entity bookings:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch bookings',
        data: []
      }
    }
  }

  /**
   * Get booking by ID - matches GET /bookings/:id route (temple admin)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      console.log(`Fetching booking ${bookingId} for entity ${entityId}`);
      const response = await axios.get(`/sevas/bookings/${bookingId}`, headers);
      
      return {
        success: true,
        data: response.data || null
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch booking details',
        data: null
      }
    }
  }

  /**
   * Update booking status - matches PATCH /bookings/:id/status route (temple admin)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (approved, rejected, completed, etc.)
   * @returns {Promise<Object>} Status update response
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      const headers = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'X-Entity-ID': entityId,
          'X-Tenant-ID': tenantId
        }
      };
      
      console.log(`Updating booking ${bookingId} status to ${status} for entity ${entityId}`);
      const response = await axios.patch(`/sevas/bookings/${bookingId}/status`, 
        { status }, 
        headers
      );
      
      return {
        success: true,
        data: response.data,
        message: `Booking ${status} successfully`
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update booking status'
      }
    }
  }

  // ===========================
  // Helper method to get current entity ID using the same logic as events
  // ===========================
  getCurrentEntityId() {
    // Priority 1: Check URL path for entity ID
    const currentPath = window.location.pathname;
    const entityMatch = currentPath.match(/\/entity\/(\d+)/);
    if (entityMatch) {
      const entityId = entityMatch[1];
      console.log(`Entity ID from URL path: ${entityId}`);
      return entityId;
    }

    // Priority 2: Check localStorage
    const storedEntityId = localStorage.getItem('current_entity_id');
    if (storedEntityId && storedEntityId !== 'null' && storedEntityId !== 'undefined') {
      console.log(`Entity ID from localStorage: ${storedEntityId}`);
      return storedEntityId;
    }

    // Priority 3: For role-based fallback, try to get from user info
    const userInfo = this.getUserInfo();
    if (userInfo) {
      switch (userInfo.role) {
        case 'templeadmin':
          if (userInfo.entityId) {
            console.log(`TempleAdmin entity ID: ${userInfo.entityId}`);
            return userInfo.entityId.toString();
          }
          break;
        
        case 'standarduser':
        case 'monitoringuser':
          if (userInfo.assignedTenantId) {
            console.log(`StandardUser/MonitoringUser assigned tenant ID: ${userInfo.assignedTenantId}`);
            return userInfo.assignedTenantId.toString();
          }
          break;
      }
    }

    console.warn('Could not resolve entity ID for seva service');
    return null;
  }

  // Helper method to get user info from localStorage or token
  getUserInfo() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          userId: payload.user_id,
          role: payload.role || payload.role_name,
          entityId: payload.entity_id,
          assignedTenantId: payload.assigned_tenant_id
        };
      }
    } catch (error) {
      console.warn('Error parsing user info from token:', error);
    }
    return null;
  }

  // Handle errors similar to event service
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }

  /**
   * Helper method to save booking to localStorage (for UI simulation)
   * @private
   * @param {number} sevaId - Seva ID to save
   */
  _saveBookingToLocalStorage(sevaId) {
    try {
      // Get existing bookings
      const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
      
      // Add this booking if not already present
      if (!existingBookings.some(b => b.seva_id === sevaId)) {
        existingBookings.push({
          id: Math.floor(Math.random() * 1000),
          seva_id: sevaId,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('user_bookings', JSON.stringify(existingBookings));
      }
    } catch (e) {
      console.error('Error saving booking to localStorage:', e);
    }
  }
}

// Export singleton instance
export const sevaService = new SevaService()
export default sevaService