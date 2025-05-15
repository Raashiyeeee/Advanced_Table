import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('Connecting to backend at:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add longer timeout to give the server more time to respond
  timeout: 15000
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message || error);
    
    // Add detailed logging to help diagnose issues
    if (error.response) {
      console.error('Error response details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// User API endpoints
export const userApi = {
  // Get users with filters, sorting, and pagination
  getUsers: async (filters, sortConfig, pagination) => {
    try {
      const { search, name, email, phone, place, gender, countryCode, hobbies } = filters;
      const { field, direction } = sortConfig;
      const { currentPage, itemsPerPage } = pagination;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Add filters if they exist
      if (search) params.append('search', search);
      if (name) params.append('name', name);
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      if (place) params.append('place', place);
      if (gender) params.append('gender', gender);
      if (countryCode) params.append('countryCode', countryCode);
      
      // Add hobbies as multiple params if they exist
      if (hobbies && hobbies.length > 0) {
        hobbies.forEach(hobby => params.append('hobbies', hobby));
      }
      
      // Add sorting
      params.append('sort', `${field}:${direction}`);
      
      // Add pagination
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      console.log(`Making request to: ${API_URL}/users?${params.toString()}`);
      
      const response = await api.get(`/users?${params.toString()}`);
      console.log('Full API response:', response);
      
      // Verify expected structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Unexpected API response data format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return {
        success: response.data.success || false,
        data: response.data.data || [],
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Get a single user by ID
  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new user
  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await api.post('/users', userData);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update a user
  updateUser: async (id, userData) => {
    try {
      console.log(`Updating user ${id} with data:`, userData);
      console.log(`Country code being sent:`, userData.countryCode);
      
      const response = await api.put(`/users/${id}`, userData);
      
      console.log('User updated response:', response.data);
      if (response.data && response.data.data) {
        console.log(`Updated user country code:`, response.data.data.countryCode);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete a user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
};

export default api; 
