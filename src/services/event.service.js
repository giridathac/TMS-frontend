// src/services/event.service.js
import { apiClient } from '@/plugins/axios';
import axios from 'axios';

// Create auth header
  const createAuthHeader = () => {
    const token = localStorage.getItem('auth_token')
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  }

const eventService = {
  async getEvents() {
    try {
      // Get entity ID using the same resolution logic as middleware
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log(`Fetching events for entity ID: ${entityId}, tenant ID: ${tenantId}`);
      
      // Store entity ID in localStorage for future use
      if (entityId) {
        localStorage.setItem('current_entity_id', entityId);
      }
      
      // Build URL with entity filtering
      const url = entityId ? `/events?entity_id=${entityId}` : '/events';
      
      // Include proper headers with current tenant and entity ID
      const headers = {        
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
          //'X-Tenant-ID': tenantId,
          //'X-Entity-ID': entityId        
      };      
      
      console.log(`Requesting events from: ${url} with headers:`, headers);
      const response = await axios.get(url, {headers:headers});
      console.log("Events API response:", response.data);
      return response.data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getUpcomingEvents() {
    try {
      const entityId = this.getCurrentEntityId();
      const tenantId = localStorage.getItem('current_tenant_id');
      
      console.log(`Fetching upcoming events for entity ID: ${entityId}, tenant ID: ${tenantId}`);
      
      // Build headers object - only include headers that have values
      const headersObj = {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      };
      
      // Only add tenant and entity headers if they have values
      if (tenantId) {
        headersObj['X-Tenant-ID'] = tenantId;
      }
      
      if (entityId) {
        headersObj['X-Entity-ID'] = entityId;
      }
      
      const headers = { headers: headersObj };
      
      // Add entity_id as query parameter for backend filtering
      const url = entityId ? `/events/upcoming?entity_id=${entityId}` : '/events/upcoming';
      
      console.log(`Requesting upcoming events from: ${url} with headers:`, headers);
      const response = await axios.get(url, headers);
      
      console.log('Upcoming events API response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw this.handleError(error);
    }
  },

  async getEventById(id) {
    try {
      const response = await apiClient.event.getById(id);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getEventStats() {
    try {
      const entityId = this.getCurrentEntityId();
      
      // Build headers object properly
      const headersObj = {};
      if (entityId) {
        headersObj['X-Entity-ID'] = entityId;
      }
      
      const headers = Object.keys(headersObj).length > 0 ? { headers: headersObj } : {};
      
      const response = await apiClient.event.getStats(headers);
      return response.data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      // Don't throw error for stats, return empty stats
      return {
        total_events: 0,
        upcoming_events: 0,
        this_month_events: 0,
        total_rsvps: 0
      };
    }
  },

  async createEvent(eventData) {
    try {
      // Use the same entity ID resolution logic as the middleware
      const entityId = this.getCurrentEntityId();
      
      if (!entityId) {
        throw new Error('No entity ID available for event creation');
      }

      // Prepare the data with proper entity ID
      const apiData = {
        title: eventData.title,
        description: eventData.description || '',
        event_type: eventData.event_type || eventData.type || eventData.eventType,
        event_date: eventData.event_date || eventData.date,
        event_time: eventData.event_time || eventData.time,
        location: eventData.location || 'Temple Premises',
        is_active: eventData.isActive !== undefined ? eventData.isActive : true,
        entity_id: parseInt(entityId) // Ensure it's stored as integer
      };

      console.log('Creating event with data:', apiData);
      console.log('Entity ID being used:', entityId);
      
      // Build headers object properly
      const headersObj = {};
      if (entityId) {
        headersObj['X-Entity-ID'] = entityId;
      }
      
      const tenantId = localStorage.getItem('current_tenant_id');
      if (tenantId) {
        headersObj['X-Tenant-ID'] = tenantId;
      }
      
      const headers = Object.keys(headersObj).length > 0 ? { headers: headersObj } : {};
      
      const response = await apiClient.event.create(apiData, headers);
      console.log('Event created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw this.handleError(error);
    }
  },

  async updateEvent(id, eventData) {
    try {
      const entityId = this.getCurrentEntityId();
      
      const apiData = {
        title: eventData.title,
        description: eventData.description || '',
        event_type: eventData.event_type || eventData.type || eventData.eventType,
        event_date: eventData.event_date || eventData.date,
        event_time: eventData.event_time || eventData.time,
        location: eventData.location || 'Temple Premises',
        is_active: eventData.isActive !== undefined ? eventData.isActive : true
      };

      // Build headers object properly
      const headersObj = {};
      if (entityId) {
        headersObj['X-Entity-ID'] = entityId;
      }
      
      const headers = Object.keys(headersObj).length > 0 ? { headers: headersObj } : {};

      console.log('Updating event with data:', apiData);
      const response = await apiClient.event.update(id, apiData, headers);

      return {
        ...response.data,
        message: 'Event updated successfully',
        wasUpdate: true,
        id
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteEvent(id) {
    try {
      const response = await apiClient.event.delete(id);
      return {
        message: 'Event deleted successfully',
        id
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async registerForEvent(eventId) {
    try {
      const response = await apiClient.event.createRSVP(eventId);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async cancelRegistration(eventId) {
    try {
      console.warn('CANCEL RSVP: No endpoint exists.');
      throw new Error('RSVP cancellation not supported by backend API');
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getEventRSVPs(eventId) {
    try {
      const response = await apiClient.event.getRSVPs(eventId);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Helper method to get current entity ID using the same logic as middleware
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

    console.warn('Could not resolve entity ID');
    return null;
  },

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
  },

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
};

export default eventService;