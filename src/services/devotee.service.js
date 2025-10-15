// src/services/devotee.service.js
import api from '@/plugins/axios';
import router from '@/router';

// Get the auth token from localStorage with validation
const getAuthToken = () => {
  const token = localStorage.getItem('temple_auth_token') || localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ No auth token found in localStorage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    return null;
  }
  console.log('✅ Auth token found:', token.substring(0, 20) + '...');
  return token;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
};

// Clear authentication data
const clearAuth = () => {
  localStorage.removeItem('temple_auth_token');
  localStorage.removeItem('temple_user_data');
  localStorage.removeItem('temple_user_role');
  // Clear legacy keys too
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Redirect to login
const redirectToLogin = () => {
  clearAuth();
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
};

export default {
  /**
   * Get devotee profile (current user)
   */
  async getProfile() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/profiles/me');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get devotee by ID (for admin purposes)
   */
  async getDevoteeById(id) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get(`/profiles/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Create or update devotee profile
   */
  async createOrUpdateProfile(profileData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      let response;
      
      if (profileData instanceof FormData) {
        response = await api.post('/profiles', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/profiles', profileData);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update devotee profile
   */
  async updateProfile(id, profileData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      let response;
      if (profileData instanceof FormData) {
        response = await api.put('/profiles', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put('/profiles', profileData);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Join a temple
   */
  async joinTemple(entityId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.post('/memberships', {
        entity_id: entityId
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get temple memberships
   */
  async getMemberships() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/memberships');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Check if devotee has joined a specific temple
   */
  async checkTempleJoined(templeId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get(`/memberships/check/${templeId}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: { joined: false } };
      }
      throw this.handleError(error);
    }
  },

  /**
   * FIXED: Get all devotees for an entity with enhanced debugging
   */
  async getAllDevotees(entityId) {
    try {
      console.log('🔍 getAllDevotees called with entityId:', entityId);
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId) {
        console.error('❌ Entity ID is missing');
        throw new Error('Entity ID is required');
      }

      // Log current user info
      const userData = localStorage.getItem('temple_user_data') || localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('👤 Current user:', {
            id: user.id,
            email: user.email,
            role: user.role
          });
        } catch (e) {
          console.warn('⚠️ Could not parse user data');
        }
      }

      // Log current entity
      const currentEntityId = localStorage.getItem('current_entity_id');
      const currentTenantId = localStorage.getItem('current_tenant_id');
      console.log('🏛️ Current context:', {
        entityId: entityId,
        storedEntityId: currentEntityId,
        storedTenantId: currentTenantId
      });

      console.log('📡 Making request to:', `/entities/${entityId}/devotees`);
      const response = await api.get(`/entities/${entityId}/devotees`);
      
      console.log('✅ Devotees fetched successfully:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ getAllDevotees error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId: entityId
      });
      throw this.handleError(error);
    }
  },

  /**
   * FIXED: Get devotee stats for an entity with enhanced debugging
   */
  async getDevoteeStats(entityId) {
    try {
      console.log('🔍 getDevoteeStats called with entityId:', entityId);
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId) {
        console.error('❌ Entity ID is missing');
        throw new Error('Entity ID is required');
      }

      console.log('📡 Making request to:', `/entities/${entityId}/devotee-stats`);
      const response = await api.get(`/entities/${entityId}/devotee-stats`);
      
      console.log('✅ Devotee stats fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ getDevoteeStats error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId: entityId
      });
      throw this.handleError(error);
    }
  },

  /**
   * FIXED: Update devotee membership status with enhanced debugging
   */
  async updateDevoteeStatus(entityId, devoteeId, status) {
    try {
      console.log('🔍 updateDevoteeStatus called:', { entityId, devoteeId, status });
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId || !devoteeId || !status) {
        console.error('❌ Missing required parameters');
        throw new Error('Entity ID, Devotee ID, and Status are required');
      }

      console.log('📡 Making request to:', `/entities/${entityId}/devotees/${devoteeId}/status`);
      const response = await api.patch(`/entities/${entityId}/devotees/${devoteeId}/status`, {
        status: status
      });
      
      console.log('✅ Devotee status updated successfully');
      return response;
    } catch (error) {
      console.error('❌ updateDevoteeStatus error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId,
        devoteeId,
        newStatus: status
      });
      throw this.handleError(error);
    }
  },

  /**
   * Get all profiles/devotees (fallback method)
   */
  async getAllProfiles() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/profiles');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add family member to devotee profile
   */
  async addFamilyMember(profileId, familyMemberData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.post(`/profiles/${profileId}/family`, familyMemberData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update family member
   */
  async updateFamilyMember(profileId, familyMemberId, familyMemberData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.put(`/profiles/${profileId}/family/${familyMemberId}`, familyMemberData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Remove family member
   */
  async removeFamilyMember(profileId, familyMemberId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.delete(`/profiles/${profileId}/family/${familyMemberId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get dashboard data
   */
  async getDashboardData(entityId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get(`/entity/${entityId}/devotee/dashboard`);
      return response;
    } catch (error) {
      console.warn('Dashboard endpoint not available');
      throw this.handleError(error);
    }
  },

  /**
   * Search temples
   */
  async searchTemples(searchParams = {}) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/temples/search', { params: searchParams });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get recent temples
   */
  async getRecentTemples() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/temples/recent');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('🔴 401 Authentication error:', error.response?.data);
      redirectToLogin();
      return new Error('Authentication failed. Please login again.');
    }

    // Handle authorization errors with detailed info
    if (error.response?.status === 403) {
      console.error('🔴 403 Authorization error:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Access denied. You do not have permission to perform this action.';
      return new Error(errorMsg);
    }

    if (error.response?.status === 404) {
      return new Error('The requested resource was not found.');
    }

    if (error.response?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    // Extract error messages from response
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  },

  /**
   * Utility methods for authentication
   */
  isAuthenticated,
  getAuthToken,
  clearAuth,
  redirectToLogin
};