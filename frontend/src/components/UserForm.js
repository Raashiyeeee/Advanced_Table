import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { userApi } from '../api';

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
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

// Country code options
const countryCodeOptions = [
  { value: '+1', label: '+1 (US/Canada)', pattern: '###-###-####', example: '555-123-4567', maxDigits: 10 },
  { value: '+44', label: '+44 (UK)', pattern: '#### ### ####', example: '7911 123 456', maxDigits: 10 },
  { value: '+91', label: '+91 (India)', pattern: '##### #####', example: '98765 43210', maxDigits: 10 },
  { value: '+61', label: '+61 (Australia)', pattern: '### ### ###', example: '412 345 678', maxDigits: 9 },
  { value: '+49', label: '+49 (Germany)', pattern: '### #######', example: '170 1234567', maxDigits: 10 },
  { value: '+33', label: '+33 (France)', pattern: '# ## ## ## ##', example: '6 12 34 56 78', maxDigits: 9 },
  { value: '+81', label: '+81 (Japan)', pattern: '## #### ####', example: '90 1234 5678', maxDigits: 10 },
  { value: '+86', label: '+86 (China)', pattern: '### #### ####', example: '139 1234 5678', maxDigits: 11 },
  { value: '+55', label: '+55 (Brazil)', pattern: '## #####-####', example: '11 98765-4321', maxDigits: 11 },
  { value: '+27', label: '+27 (South Africa)', pattern: '## ### ####', example: '82 123 4567', maxDigits: 9 },
];

// Email regex pattern for validation
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  countryCode: '+1',
  place: '',
  gender: '',
  hobbies: []
};

const UserForm = ({ show, onHide, onSuccess, user = null }) => {
  // State for form data
  const [formData, setFormData] = useState(user || initialFormState);
  // State for form validation
  const [validated, setValidated] = useState(false);
  // State for loading during form submission
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  // State for selected country code
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countryCodeOptions.find(option => option.value === (user?.countryCode || '+1')) || countryCodeOptions[0]
  );
  // State for custom gender options
  const [customGenderOptions, setCustomGenderOptions] = useState([...genderOptions]);
  // State for custom hobby options
  const [customHobbiesOptions, setCustomHobbiesOptions] = useState([...hobbiesOptions]);
  
  // Log when country code changes
  useEffect(() => {
    console.log('DEBUG - selectedCountryCode changed:', selectedCountryCode);
  }, [selectedCountryCode]);
  
  // Reset the form when the modal is shown
  useEffect(() => {
    if (show) {
      // Only reset if we're not editing an existing user
      if (!user || !user._id) {
        setFormData(initialFormState);
        setSelectedCountryCode(countryCodeOptions[0]);
        setValidated(false);
        setValidationErrors({});
        setError(null);
      }
    }
  }, [show, user]);
  
  // Update form when user data changes (for editing)
  useEffect(() => {
    if (user && user._id) {
      console.log('DEBUG - Loading user for edit:', user);
      console.log('DEBUG - Original country code:', user.countryCode);
      
      // Set the correct country code first
      const exactCountryCodeMatch = countryCodeOptions.find(
        option => option.value === user.countryCode
      );
      
      if (!exactCountryCodeMatch) {
        console.warn(`DEBUG - Could not find an exact match for country code ${user.countryCode}, falling back to default`);
      }
      
      const userCountryCode = exactCountryCodeMatch || countryCodeOptions[0];
      
      console.log('DEBUG - Setting country code to:', userCountryCode);
      setSelectedCountryCode(userCountryCode);
      
      // Now populate form with user data, potentially truncating phone number
      // to match the selected country code's max digits
      const phone = user.phone || '';
      const sanitizedPhone = phone.replace(/\D/g, '');
      const truncatedPhone = sanitizedPhone.length > userCountryCode.maxDigits
        ? sanitizedPhone.substring(0, userCountryCode.maxDigits)
        : sanitizedPhone;
      
      setFormData({
        ...user,
        phone: truncatedPhone,
        countryCode: userCountryCode.value, // Explicitly set the countryCode in formData
        // Ensure hobbies is an array
        hobbies: user.hobbies || []
      });
      
      // Clear validation state
      setValidated(false);
      setValidationErrors({});
      setError(null);
      
      // Add any custom hobbies to the options
      if (user.hobbies && Array.isArray(user.hobbies)) {
        const newHobbies = user.hobbies.filter(hobby => 
          !customHobbiesOptions.some(option => option.value === hobby)
        ).map(hobby => ({ value: hobby, label: hobby.charAt(0).toUpperCase() + hobby.slice(1) }));
        
        if (newHobbies.length > 0) {
          setCustomHobbiesOptions(prev => [...prev, ...newHobbies]);
        }
      }
      
      // Add custom gender if not in list
      if (user.gender && !customGenderOptions.some(option => option.value === user.gender)) {
        const newGender = { 
          value: user.gender, 
          label: user.gender.charAt(0).toUpperCase() + user.gender.slice(1) 
        };
        setCustomGenderOptions(prev => [...prev, newGender]);
      }
    }
  }, [user]);
  
  // Validate email separately for better feedback
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return null;
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation based on field
    if (name === 'name') {
      if (!value || value.trim() === '') {
        setValidationErrors(prev => ({...prev, name: 'Name is required'}));
      } else {
        setValidationErrors(prev => ({...prev, name: null}));
      }
    } else if (name === 'email') {
      const emailError = validateEmail(value);
      setValidationErrors(prev => ({...prev, email: emailError}));
    } else if (name === 'place') {
      if (!value || value.trim() === '') {
        setValidationErrors(prev => ({...prev, place: 'Place is required'}));
      } else {
        setValidationErrors(prev => ({...prev, place: null}));
      }
    }
  };
  
  // Handle select inputs (gender) with validation
  const handleSelectChange = (selectedOption, { name }) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: selectedOption ? selectedOption.value : '' 
    }));
    
    // Real-time validation
    if (name === 'gender') {
      if (!selectedOption) {
        setValidationErrors(prev => ({...prev, gender: 'Gender is required'}));
      } else {
        setValidationErrors(prev => ({...prev, gender: null}));
      }
    }
  };

  // Handle country code selection
  const handleCountryCodeChange = (selectedOption) => {
    console.log('DEBUG - Country code changed to:', selectedOption);
    setSelectedCountryCode(selectedOption);
    
    // If there's a phone number, check if it needs to be truncated 
    // for the new country code format
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      // Truncate if longer than the new country's max digits
      const truncatedPhone = digits.length > selectedOption.maxDigits
        ? digits.substring(0, selectedOption.maxDigits)
        : digits;
        
      console.log('DEBUG - Updating form data with new country code:', selectedOption.value);
      
      setFormData(prev => ({ 
        ...prev, 
        countryCode: selectedOption.value,
        phone: truncatedPhone
      }));
      
      // Update validation based on the new country code
      validatePhoneForCountry(truncatedPhone, selectedOption);
    } else {
      // Just update the country code
      console.log('DEBUG - Updating form data with new country code (no phone):', selectedOption.value);
      
      setFormData(prev => ({ 
        ...prev, 
        countryCode: selectedOption.value
      }));
    }
  };
  
  // Add a function to validate phone number for selected country
  const validatePhoneForCountry = (phoneDigits, countryCode = selectedCountryCode) => {
    // Remove non-digits
    const digits = phoneDigits.replace(/\D/g, '');
    
    if (!digits || digits.length === 0) {
      setValidationErrors(prev => ({...prev, phone: 'Phone number is required'}));
      return false;
    } else if (digits.length < Math.min(10, countryCode.maxDigits)) {
      setValidationErrors(prev => ({...prev, phone: 'Phone number must have at least 10 digits or match the country format'}));
      return false;
    } else if (digits.length > countryCode.maxDigits) {
      setValidationErrors(prev => ({...prev, phone: `Phone number cannot exceed ${countryCode.maxDigits} digits for ${countryCode.label}`}));
      return false;
    } else {
      setValidationErrors(prev => ({...prev, phone: null}));
      return true;
    }
  };
  
  // Format phone number based on country pattern
  const formatPhoneNumber = (input, pattern) => {
    if (!input) return '';
    
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // If no digits, return empty string
    if (digitsOnly.length === 0) return '';
    
    // Replace # in the pattern with digits
    let formattedNumber = pattern;
    let digitIndex = 0;
    
    for (let i = 0; i < formattedNumber.length && digitIndex < digitsOnly.length; i++) {
      if (formattedNumber[i] === '#') {
        formattedNumber = formattedNumber.substring(0, i) + 
                         digitsOnly[digitIndex++] + 
                         formattedNumber.substring(i + 1);
      }
    }
    
    // If there are remaining placeholders, replace them with underscores
    formattedNumber = formattedNumber.replace(/#/g, '_');
    
    return formattedNumber;
  };
  
  // Keep track of the last raw phone input for better backspace handling
  const [lastPhoneInput, setLastPhoneInput] = useState('');
  
  // Handle phone number input with formatting and validation
  const handlePhoneInput = (e) => {
    const { value } = e.target;
    
    // For empty input, just clear the field
    if (value === '' || value.trim() === '') {
      setFormData(prev => ({ ...prev, phone: '' }));
      setLastPhoneInput('');
      setValidationErrors(prev => ({...prev, phone: 'Phone number is required'}));
      return;
    }
    
    // Extract digits only from the current input
    const currentDigits = value.replace(/\D/g, '');
    
    // Logic for handling backspace more naturally
    // If current digits are less than last input, it's likely a backspace/delete operation
    if (currentDigits.length < lastPhoneInput.length) {
      // Use the current digits to update state
      setFormData(prev => ({ ...prev, phone: currentDigits }));
      setLastPhoneInput(currentDigits);
    } else {
      // Normal input - just add new digits
      setFormData(prev => ({ ...prev, phone: currentDigits }));
      setLastPhoneInput(currentDigits);
    }
    
    // Real-time validation for phone
    if (!currentDigits || currentDigits.length === 0) {
      setValidationErrors(prev => ({...prev, phone: 'Phone number is required'}));
    } else if (currentDigits.length < 10) {
      setValidationErrors(prev => ({...prev, phone: 'Phone number must have at least 10 digits'}));
    } else {
      setValidationErrors(prev => ({...prev, phone: null}));
    }
  };
  
  // Handle direct keyboard input for phone number field
  const handleDirectPhoneInput = (e) => {
    // Allow special keys like backspace, delete, arrow keys, etc.
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedKeys.includes(e.key)) {
      return; // Allow these keys
    }
    
    // Block non-digit input
    if (!/^\d$/.test(e.key)) {
      e.preventDefault(); // Prevent non-digit characters
    }
    
    // Limit input length (adjust as needed)
    if (formData.phone && formData.phone.length >= 15 && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };
  
  // Handle backspace key specifically to provide better backspace functionality
  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') {
      // If there's no text selection, handle backspace manually
      if (e.target.selectionStart === e.target.selectionEnd) {
        const selectionStart = e.target.selectionStart;
        if (selectionStart > 0) {
          // Remove one digit from the underlying raw phone number
          const newPhone = formData.phone.slice(0, -1);
          setFormData(prev => ({ ...prev, phone: newPhone }));
          setLastPhoneInput(newPhone);
          // Allow the default behavior as well, which will update the formatted display
        }
      }
    }
    
    // Call the regular key handler for all keys
    handleDirectPhoneInput(e);
  };
  
  // Update useEffect to initialize lastPhoneInput when the form data changes
  useEffect(() => {
    if (user && user._id) {
      setLastPhoneInput(user.phone || '');
    } else {
      setLastPhoneInput('');
    }
  }, [user]);
  
  // Handle multi-select inputs with creation capability (hobbies)
  const handleMultiSelectChange = (selectedOptions, { name }) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : [] 
    }));
    
    // Real-time validation for hobbies
    if (name === 'hobbies') {
      if (!selectedOptions || selectedOptions.length === 0) {
        setValidationErrors(prev => ({...prev, hobbies: 'At least one hobby is required'}));
      } else {
        setValidationErrors(prev => ({...prev, hobbies: null}));
      }
    }
  };
  
  // Handle creation of new options in creatable selects
  const handleCreateOption = (inputValue, selectName) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    
    if (selectName === 'gender') {
      setCustomGenderOptions(prev => [...prev, newOption]);
      setFormData(prev => ({ ...prev, gender: newOption.value }));
    } else if (selectName === 'hobbies') {
      setCustomHobbiesOptions(prev => [...prev, newOption]);
      setFormData(prev => ({ 
        ...prev, 
        hobbies: [...prev.hobbies, newOption.value] 
      }));
    }
  };
  
  // Custom validation function
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }
    
    // Phone validation
    if (!formData.phone || formData.phone.replace(/\D/g, '').length === 0) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < Math.min(10, selectedCountryCode.maxDigits)) {
      errors.phone = 'Phone number must have at least 10 digits or match the country format';
    } else if (formData.phone.replace(/\D/g, '').length > selectedCountryCode.maxDigits) {
      errors.phone = `Phone number cannot exceed ${selectedCountryCode.maxDigits} digits for ${selectedCountryCode.label}`;
    }
    
    // Place validation
    if (!formData.place || formData.place.trim() === '') {
      errors.place = 'Place is required';
    }
    
    // Gender validation
    if (!formData.gender || formData.gender.trim() === '') {
      errors.gender = 'Gender is required';
    }
    
    // Hobbies validation
    if (!formData.hobbies || !Array.isArray(formData.hobbies) || formData.hobbies.length === 0) {
      errors.hobbies = 'At least one hobby is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Add useEffect to enforce validation when Submit button is clicked
  useEffect(() => {
    if (validated) {
      validateForm();
    }
  }, [validated]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setValidated(true);
    
    // Validate form manually
    const isValid = validateForm();
    if (!isValid) {
      // Add visual feedback by scrolling to the first error
      const firstErrorField = document.querySelector('.is-invalid, .invalid-feedback');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Instead of using object spread for all formData which can have issues,
      // explicitly create the userData object with the correct country code
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''), // Store only digits
        countryCode: selectedCountryCode.value,  // Always use the currently selected country code
        place: formData.place,
        gender: formData.gender,
        hobbies: formData.hobbies
      };
      
      console.log('DEBUG - Selected country code before submit:', selectedCountryCode);
      console.log('DEBUG - User data countryCode before submit:', userData.countryCode);
      
      if (user && user._id) {
        console.log('DEBUG - Updating user with ID:', user._id);
        console.log('DEBUG - Original user countryCode:', user.countryCode);
        console.log('DEBUG - New countryCode being sent:', userData.countryCode);
        
        const updatedUser = await userApi.updateUser(user._id, userData);
        console.log('DEBUG - Updated user response:', updatedUser);
      } else {
        await userApi.createUser(userData);
      }
      
      // Reset form and close modal immediately
      setFormData(initialFormState);
      setValidationErrors({});
      setValidated(false);
      onSuccess(); // Refresh parent component
      onHide();    // Close modal
      
    } catch (error) {
      console.error('Error saving user:', error);
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        // Handle array of validation errors
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const newErrors = {};
          responseData.errors.forEach(err => {
            // Extract field name from error message if possible
            if (err.includes('Name')) newErrors.name = err;
            else if (err.includes('Email')) newErrors.email = err;
            else if (err.includes('Phone')) newErrors.phone = err;
            else if (err.includes('Place')) newErrors.place = err;
            else if (err.includes('Gender')) newErrors.gender = err;
            else if (err.includes('hobby')) newErrors.hobbies = err;
          });
          
          // If specific field errors found, set them
          if (Object.keys(newErrors).length > 0) {
            setValidationErrors(prev => ({ ...prev, ...newErrors }));
          } else {
            // Otherwise show generic error message
            setError(responseData.errors.join(', '));
          }
        } 
        // Handle single error message from server with field info
        else if (responseData.message && responseData.field) {
          // Set error for specific field
          setValidationErrors(prev => ({ 
            ...prev, 
            [responseData.field]: responseData.message 
          }));
        }
        // Handle single error message from server
        else if (responseData.message) {
          // Handle specific known errors
          if (responseData.message.includes('Email is already in use')) {
            setValidationErrors(prev => ({ 
              ...prev, 
              email: 'This email is already in use' 
            }));
          } else if (responseData.message.includes('Phone number is already in use')) {
            setValidationErrors(prev => ({ 
              ...prev, 
              phone: 'This phone number is already in use' 
            }));
          } else {
            // Generic error message
            setError(responseData.message);
          }
        } 
        // Handle server error with detailed error info
        else if (responseData.error) {
          setError(`Server Error: ${responseData.error}`);
        }
      } else {
        // For network or other errors
        setError('Unable to save user. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to reset the form
  const handleReset = () => {
    console.log('Resetting form...');
    // Reset all form data to initial state
    setFormData({...initialFormState});
    // Reset country code to default
    setSelectedCountryCode(countryCodeOptions[0]);
    // Reset validation states
    setValidated(false);
    setValidationErrors({});
    setError(null);
    // Reset last phone input
    setLastPhoneInput('');
  };
  
  // Format phone number for display
  const displayPhoneNumber = formatPhoneNumber(
    formData.phone,
    selectedCountryCode?.pattern || '###-###-####'
  );
  
  // Check if the form is valid (all required fields filled)
  const isFormValid = () => {
    const phoneDigits = formData.phone.replace(/\D/g, '');
    return (
      formData.name && 
      formData.name.trim() !== '' && 
      formData.email && 
      !validateEmail(formData.email) &&
      phoneDigits && 
      phoneDigits.length >= Math.min(10, selectedCountryCode.maxDigits) &&
      phoneDigits.length <= selectedCountryCode.maxDigits &&
      formData.place && 
      formData.place.trim() !== '' &&
      formData.gender && 
      formData.gender.trim() !== '' &&
      formData.hobbies && 
      Array.isArray(formData.hobbies) && 
      formData.hobbies.length > 0
    );
  };
  
  return (
    <Modal
      show={show}
      onHide={() => {
        // Clear form when hiding
        handleReset();
        onHide();
      }}
      backdrop="static"
      keyboard={false}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{user && user._id ? 'Edit User' : 'Add New User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <div className="mb-3">
          <small className="text-danger">* Required fields</small>
        </div>
        
        <Form noValidate validated={validated} onSubmit={handleSubmit} autoComplete="off">
          {/* Hidden fields to prevent autofill */}
          <input type="text" autoComplete="chrome-off" style={{ display: 'none' }} />
          <input type="password" autoComplete="chrome-off" style={{ display: 'none' }} />
          <input type="email" autoComplete="chrome-off" style={{ display: 'none' }} />
          <input type="tel" autoComplete="chrome-off" style={{ display: 'none' }} />
          
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.name}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                  key="name-field-unique"
                  id={"name-" + Math.random().toString(36).substring(2, 10)}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.name || 'Name is required'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.email}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                  key="email-field-unique"
                  id={"email-" + Math.random().toString(36).substring(2, 10)}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email || 'Please provide a valid email'}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Format: example@domain.com
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Phone <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ minWidth: '150px', padding: '0' }}>
                    <Select
                      options={countryCodeOptions}
                      value={selectedCountryCode}
                      onChange={handleCountryCodeChange}
                      className="country-code-select"
                      menuPlacement="auto"
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      placeholder="Select country code"
                      styles={{
                        container: (base) => ({
                          ...base,
                          width: '100%'
                        }),
                        control: (base) => ({
                          ...base,
                          borderRadius: 0,
                          border: 'none',
                          boxShadow: 'none',
                          minHeight: '38px',
                          cursor: 'pointer'
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: '0 8px'
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          color: '#495057'
                        }),
                        indicatorSeparator: () => ({
                          display: 'none'
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999
                        })
                      }}
                    />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={selectedCountryCode.example}
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      // Fixed phone input handling - simplify to just handle digit input
                      const input = e.target.value;
                      const digitsOnly = input.replace(/\D/g, '');
                      
                      // Apply max length restriction based on country code
                      const maxLength = selectedCountryCode.maxDigits;
                      const truncatedInput = digitsOnly.length > maxLength 
                        ? digitsOnly.substring(0, maxLength) 
                        : digitsOnly;
                      
                      // Update form data with the sanitized input
                      setFormData(prev => ({
                        ...prev,
                        phone: truncatedInput,
                        countryCode: selectedCountryCode.value
                      }));
                      
                      // Validate the input
                      if (!truncatedInput || truncatedInput.length === 0) {
                        setValidationErrors(prev => ({...prev, phone: 'Phone number is required'}));
                      } else if (truncatedInput.length < Math.min(10, maxLength)) {
                        setValidationErrors(prev => ({...prev, phone: `Phone number must have at least ${Math.min(10, maxLength)} digits`}));
                      } else {
                        setValidationErrors(prev => ({...prev, phone: null}));
                      }
                    }}
                    isInvalid={!!validationErrors.phone}
                    required
                    autoComplete="new-password"
                    data-form-type="other"
                    key="phone-field-unique"
                    id={"phone-" + Math.random().toString(36).substring(2, 10)}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phone || 'Phone number is required with correct format'}
                  </Form.Control.Feedback>
                </InputGroup>
                <small className="text-muted">
                  Select country code from dropdown. Enter digits only (no formatting). 
                  Maximum allowed: {selectedCountryCode.maxDigits} digits for {selectedCountryCode.label}. 
                  Example format: {selectedCountryCode.example}
                </small>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Place <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter place"
                  name="place"
                  value={formData.place}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.place}
                  required
                  autoComplete="new-password"
                  data-form-type="other"
                  key="place-field-unique"
                  id={"place-" + Math.random().toString(36).substring(2, 10)}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.place || 'Place is required'}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Gender <span className="text-danger">*</span>
                </Form.Label>
                <CreatableSelect
                  name="gender"
                  value={customGenderOptions.find(option => option.value === formData.gender) || null}
                  options={customGenderOptions}
                  onChange={(selected, action) => handleSelectChange(selected, { name: 'gender' })}
                  onCreateOption={(inputValue) => handleCreateOption(inputValue, 'gender')}
                  placeholder="Select or enter gender..."
                  className={validated && !!validationErrors.gender ? 'is-invalid' : ''}
                  formatCreateLabel={(inputValue) => `Add "${inputValue}" as a gender`}
                  menuPortalTarget={document.body} 
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999
                    }),
                    control: (base) => ({
                      ...base,
                      minHeight: '38px'
                    })
                  }}
                />
                {validated && !!validationErrors.gender && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.gender}
                  </div>
                )}
                <Form.Text className="text-muted">
                  You can type and add a custom gender
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Hobbies <span className="text-danger">*</span>
                </Form.Label>
                <CreatableSelect
                  isMulti
                  name="hobbies"
                  value={customHobbiesOptions.filter(option => 
                    formData.hobbies.includes(option.value)
                  )}
                  options={customHobbiesOptions}
                  onChange={(selected, action) => handleMultiSelectChange(selected, { name: 'hobbies' })}
                  onCreateOption={(inputValue) => handleCreateOption(inputValue, 'hobbies')}
                  placeholder="Select or enter hobbies..."
                  className={validated && !!validationErrors.hobbies ? 'is-invalid' : ''}
                  formatCreateLabel={(inputValue) => `Add "${inputValue}" as a hobby`}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999
                    }),
                    control: (base) => ({
                      ...base,
                      minHeight: '38px'
                    })
                  }}
                />
                {validated && !!validationErrors.hobbies && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.hobbies}
                  </div>
                )}
                <Form.Text className="text-muted">
                  You can type and add custom hobbies
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between mt-4">
            <div>
              <small className="text-danger">* All required fields must be filled</small>
            </div>
            <div>
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || (validated && !isFormValid())}
              >
                {loading ? 'Saving...' : 'Save User'}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserForm;