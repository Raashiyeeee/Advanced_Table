import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import Select from 'react-select';
import { FaPlus, FaFilter, FaTimes } from 'react-icons/fa';

// Sample hobbies options for the multi-select
const hobbiesOptions = [
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'coding', label: 'Coding' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'art', label: 'Art' },
  { value: 'photography', label: 'Photography' }
];

// Gender options for the select box
const genderOptions = [
  { value: '', label: 'All Genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

// Country code options for the select box
const countryCodeOptions = [
  { value: '', label: 'All Countries' },
  { value: '+1', label: '+1 (US/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+91', label: '+91 (India)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+27', label: '+27 (South Africa)' }
];

const FilterBar = ({ filters, onFilterChange, onShowForm }) => {
  // Local state for filters
  const [localFilters, setLocalFilters] = useState(filters);
  // State to control visibility of advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Handle general search input
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setLocalFilters(prev => ({ ...prev, search: value }));
  };
  
  // Handle changes to specific filter fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle change for the select input (gender, countryCode)
  const handleSelectChange = (selectedOption, { name }) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      [name]: selectedOption ? selectedOption.value : '' 
    }));
  };
  
  // Handle change for the multi-select input (hobbies)
  const handleMultiSelectChange = (selectedOptions, { name }) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : [] 
    }));
  };
  
  // Apply filters when form is submitted
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const resetFilters = {
      search: '',
      name: '',
      email: '',
      phone: '',
      countryCode: '',
      place: '',
      gender: '',
      hobbies: []
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  return (
    <Card className="mb-4 filter-section">
      <Card.Body>
        <Form onSubmit={handleSubmit} autoComplete="off">
          {/* Main search bar */}
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  name="search"
                  value={localFilters.search}
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <FaFilter className="me-1" />
                {showAdvanced ? 'Hide Filters' : 'Advanced Filters'}
              </Button>
              <Button 
                variant="primary" 
                className="me-2"
                onClick={onShowForm}
              >
                <FaPlus className="me-1" />
                Add User
              </Button>
              <Button 
                type="submit" 
                variant="success"
                className="me-2"
              >
                Apply Filters
              </Button>
              <Button 
                type="button" 
                variant="danger"
                onClick={handleClearFilters}
              >
                <FaTimes className="me-1" />
                Clear
              </Button>
            </Col>
          </Row>
          
          {/* Advanced filters section */}
          {showAdvanced && (
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Filter by name"
                    name="name"
                    value={localFilters.name}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Filter by email"
                    name="email"
                    value={localFilters.email}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Country Code</Form.Label>
                  <Select
                    isClearable
                    name="countryCode"
                    value={countryCodeOptions.find(option => option.value === localFilters.countryCode) || null}
                    options={countryCodeOptions}
                    onChange={(selected, action) => handleSelectChange(selected, action)}
                    className="filter-select"
                    placeholder="Select country code..."
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Filter by phone"
                    name="phone"
                    value={localFilters.phone}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Place</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Filter by place"
                    name="place"
                    value={localFilters.place}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Select
                    isClearable
                    name="gender"
                    value={genderOptions.find(option => option.value === localFilters.gender) || null}
                    options={genderOptions}
                    onChange={(selected, action) => handleSelectChange(selected, action)}
                    className="filter-select"
                    placeholder="Select gender..."
                  />
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Hobbies</Form.Label>
                  <Select
                    isMulti
                    name="hobbies"
                    value={hobbiesOptions.filter(option => 
                      localFilters.hobbies.includes(option.value)
                    )}
                    options={hobbiesOptions}
                    onChange={(selected, action) => handleMultiSelectChange(selected, action)}
                    className="filter-select"
                    placeholder="Select hobbies..."
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FilterBar; 