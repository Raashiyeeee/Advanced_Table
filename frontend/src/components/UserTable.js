import React, { useState, useEffect } from 'react';
import { Table, Button, Pagination, Card, Spinner, Alert } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from 'react-icons/fa';
import { userApi } from '../api';

// Country code formatting patterns (same as in UserForm)
const countryCodePatterns = {
  '+1': { pattern: '###-###-####', example: '555-123-4567' },
  '+44': { pattern: '#### ### ####', example: '7911 123 456' },
  '+91': { pattern: '##### #####', example: '98765 43210' },
  '+61': { pattern: '### ### ###', example: '412 345 678' },
  '+49': { pattern: '### #######', example: '170 1234567' },
  '+33': { pattern: '# ## ## ## ##', example: '6 12 34 56 78' },
  '+81': { pattern: '## #### ####', example: '90 1234 5678' },
  '+86': { pattern: '### #### ####', example: '139 1234 5678' },
  '+55': { pattern: '## #####-####', example: '11 98765-4321' },
  '+27': { pattern: '## ### ####', example: '82 123 4567' },
};

const UserTable = ({ 
  filters, 
  sortConfig, 
  onSort, 
  pagination, 
  onPageChange,
  shouldReload,
  onEditUser
}) => {
  // State for users data
  const [users, setUsers] = useState([]);
  // State for pagination metadata
  const [paginationMeta, setPaginationMeta] = useState({
    totalPages: 1,
    total: 0,
    currentPage: 1
  });
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format phone number based on country code
  const formatPhoneNumber = (phone, countryCode) => {
    if (!phone) return 'N/A';
    
    // Ensure we have a valid country code
    const code = countryCode || '+1';
    console.log(`DEBUG - Formatting phone: ${phone} with country code: ${code}`);
    
    // Get formatting pattern for this country code
    const formatInfo = countryCodePatterns[code] || countryCodePatterns['+1'];
    
    // Clean phone to digits only
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Format the number
    let formattedNumber = formatInfo.pattern;
    let digitIndex = 0;
    
    for (let i = 0; i < formattedNumber.length && digitIndex < digitsOnly.length; i++) {
      if (formattedNumber[i] === '#') {
        formattedNumber = formattedNumber.substring(0, i) + 
                         digitsOnly[digitIndex++] + 
                         formattedNumber.substring(i + 1);
      }
    }
    
    // Replace any remaining # with _
    formattedNumber = formattedNumber.replace(/#/g, '_');
    
    return `${code} ${formattedNumber}`;
  };
  
  // Fetch users data with filters, sorting, and pagination
  const fetchUsers = async () => {
    try {
      console.log('Fetching users with:');
      console.log('- Filters:', filters);
      console.log('- Sorting:', sortConfig);
      console.log('- Pagination:', pagination);
      
      setLoading(true);
      setError(null);
      
      console.log('Calling API...');
      const response = await userApi.getUsers(filters, sortConfig, pagination);
      console.log('User data response received:', response);
      
      // Always set users to an array (empty if needed)
      setUsers(response.data || []);
      
      // Set pagination metadata
      setPaginationMeta({
        totalPages: response.totalPages || 1,
        total: response.total || 0,
        currentPage: response.currentPage || 1
      });
      
      // If zero users but successful response, don't show an error
      if (response.success && response.data && response.data.length === 0) {
        console.log('No users found, but API call was successful');
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      
      if (err.message && err.message.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your database connection.');
      } else if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to load users. Please try again.');
      } else {
        setError('Failed to load users. Please try again. ' + (err.message || ''));
      }
      
      // Set empty data if there's an error
      setUsers([]);
      setPaginationMeta({
        totalPages: 1,
        total: 0,
        currentPage: 1
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch users on initial load and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [filters, sortConfig.field, sortConfig.direction, pagination.currentPage, pagination.itemsPerPage, shouldReload]);
  
  // Function to handle user deletion
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(userId);
        // Refresh the user list
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };
  
  // Function to render sort icons
  const renderSortIcon = (fieldName) => {
    if (sortConfig.field !== fieldName) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="ms-1" /> : 
      <FaSortDown className="ms-1" />;
  };
  
  // Function to render pagination controls
  const renderPagination = () => {
    const { totalPages, currentPage } = paginationMeta;
    
    if (totalPages <= 1) return null;
    
    // Calculate page numbers to show (show 5 pages at a time)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start page if end page is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.First 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1}
        />
        <Pagination.Prev 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        
        {startPage > 1 && (
          <>
            <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
            {startPage > 2 && <Pagination.Ellipsis />}
          </>
        )}
        
        {pages.map(page => (
          <Pagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <Pagination.Ellipsis />}
            <Pagination.Item onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Pagination.Item>
          </>
        )}
        
        <Pagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last 
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };
  
  // Function to render table body
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </td>
        </tr>
      );
    }
    
    if (error) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-5">
            <Alert variant="danger" className="mx-3 mb-0">
              {error}
            </Alert>
          </td>
        </tr>
      );
    }
    
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center py-5">
            <Alert variant="info" className="mx-3 mb-0">
              No users found. Try adjusting your filters or add a new user.
            </Alert>
          </td>
        </tr>
      );
    }
    
    return users.map(user => (
      <tr key={user._id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{formatPhoneNumber(user.phone, user.countryCode)}</td>
        <td>{user.place}</td>
        <td>{user.gender}</td>
        <td>
          {user.hobbies && user.hobbies.length > 0 ? 
            user.hobbies.join(', ') : 
            <span className="text-muted">None</span>}
        </td>
        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="me-2"
            onClick={() => onEditUser(user._id)}
          >
            <FaEdit />
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => handleDelete(user._id)}
          >
            <FaTrash />
          </Button>
        </td>
      </tr>
    ));
  };
  
  return (
    <Card className="mt-4 shadow-sm">
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th onClick={() => onSort('name')}>
                Name {renderSortIcon('name')}
              </th>
              <th onClick={() => onSort('email')}>
                Email {renderSortIcon('email')}
              </th>
              <th onClick={() => onSort('phone')}>
                Phone {renderSortIcon('phone')}
              </th>
              <th onClick={() => onSort('place')}>
                Place {renderSortIcon('place')}
              </th>
              <th onClick={() => onSort('gender')}>
                Gender {renderSortIcon('gender')}
              </th>
              <th>Hobbies</th>
              <th onClick={() => onSort('createdAt')}>
                Created At {renderSortIcon('createdAt')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </Table>
        
        {/* Render pagination only if no error or loading */}
        {!error && !loading && users.length > 0 && renderPagination()}
      </Card.Body>
    </Card>
  );
};

export default UserTable; 