import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import UserTable from './components/UserTable';
import FilterBar from './components/FilterBar';
import UserForm from './components/UserForm';
import { userApi } from './api'; // Import userApi for fetching user details

function App() {
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    name: '',
    email: '',
    phone: '',
    countryCode: '',
    place: '',
    gender: '',
    hobbies: []
  });
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'asc'
  });
  
  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });
  
  // State to control form modal
  const [showForm, setShowForm] = useState(false);
  
  // State to track user currently being edited (null for new user)
  const [currentUser, setCurrentUser] = useState(null);
  
  // State to track if table should reload
  const [shouldReload, setShouldReload] = useState(false);
  
  // Function to handle editing a user
  const handleEditUser = async (userId) => {
    try {
      // Fetch user details by ID
      const response = await userApi.getUser(userId);
      if (response && response.data) {
        setCurrentUser(response.data);
        setShowForm(true);
      } else {
        console.error('Failed to fetch user details for editing');
        alert('Could not load user details for editing. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching user for edit:', error);
      alert('Failed to load user details. Please try again.');
    }
  };
  
  // Function to trigger reload after form submission
  const handleFormSuccess = () => {
    console.log('DEBUG - Form submission success, triggering reload');
    // Using a callback for setShouldReload to ensure we toggle the value
    setShouldReload(prev => !prev);
    // Clear current user and hide form after successful submission
    setCurrentUser(null);
    setShowForm(false);
  };
  
  // Function to handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when filters change
  };
  
  // Function to handle sort
  const handleSort = (field) => {
    setSortConfig(prevSort => ({
      field,
      direction: 
        prevSort.field === field && prevSort.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));
  };
  
  // Function to handle pagination
  const handlePaginationChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };
  
  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Advanced Table with Filtering</h1>
        </Col>
      </Row>
      
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onShowForm={() => {
          setCurrentUser(null); // Ensure we're adding a new user
          setShowForm(true);
        }}
      />
      
      <UserTable 
        filters={filters}
        sortConfig={sortConfig}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={handlePaginationChange}
        shouldReload={shouldReload}
        onEditUser={handleEditUser}
      />
      
      <UserForm 
        show={showForm} 
        onHide={() => {
          setShowForm(false);
          setCurrentUser(null);
        }}
        onSuccess={handleFormSuccess}
        user={currentUser}
      />
    </Container>
  );
}

export default App; 