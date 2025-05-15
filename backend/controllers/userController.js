const User = require('../models/User');

// Email regex for validation
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// @desc    Get all users with filtering
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    console.log('GET /api/users request received with query:', req.query);
    const { search, name, email, phone, place, gender, countryCode, hobbies, page = 1, limit = 10, sort } = req.query;
    
    // Build filter object - using a more explicit approach for safety
    const filter = {};
    
    // Search functionality (across multiple fields)
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Individual field filters - only add if they have values
    if (name && name.trim() !== '') filter.name = { $regex: name, $options: 'i' };
    if (email && email.trim() !== '') filter.email = { $regex: email, $options: 'i' };
    if (phone && phone.trim() !== '') filter.phone = { $regex: phone, $options: 'i' };
    if (place && place.trim() !== '') filter.place = { $regex: place, $options: 'i' };
    if (gender && gender.trim() !== '') filter.gender = gender;
    if (countryCode && countryCode.trim() !== '') filter.countryCode = countryCode;
    
    // Multi-select filter for hobbies - only if it's a non-empty array
    if (hobbies && (Array.isArray(hobbies) ? hobbies.length > 0 : hobbies.trim() !== '')) {
      const hobbyArray = Array.isArray(hobbies) ? hobbies : [hobbies];
      filter.hobbies = { $in: hobbyArray };
    }
    
    // Sorting
    const sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      // Default sort by createdAt ascending
      sortOption.createdAt = 1;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageSize = parseInt(limit);
    
    console.log('Processing GET users with filter:', JSON.stringify(filter, null, 2));
    console.log('Sort options:', sortOption);
    console.log('Pagination:', { skip, limit: pageSize });
    
    // Execute query with pagination - using separate variables for clarity
    let users = [];
    let totalUsers = 0;
    
    // Check if we're using in-memory database or MongoDB
    if (global.users !== undefined) {
      // Using in-memory database
      console.log('Using in-memory database for query');
      
      try {
        // Get all users first (unfiltered)
        const allUsers = [...global.users];
        console.log(`Total users in memory before filtering: ${allUsers.length}`);
        
        // Apply filters manually to avoid changing the global array
        const filteredUsers = allUsers.filter(user => {
          // Check each filter condition
          for (const [key, value] of Object.entries(filter)) {
            // Special case for $or operator
            if (key === '$or') {
              const orConditions = value;
              const matchesOr = orConditions.some(condition => {
                const fieldName = Object.keys(condition)[0];
                const searchValue = condition[fieldName].$regex;
                return user[fieldName] && 
                      user[fieldName].toLowerCase().includes(searchValue.toLowerCase());
              });
              if (!matchesOr) return false;
            }
            // Special case for $in operator (hobbies)
            else if (key === 'hobbies' && value.$in) {
              const matchesHobby = value.$in.some(hobby => 
                user.hobbies && user.hobbies.includes(hobby)
              );
              if (!matchesHobby) return false;
            }
            // Regular string match with regex
            else if (value.$regex) {
              if (!user[key] || !user[key].toLowerCase().includes(value.$regex.toLowerCase())) {
                return false;
              }
            }
            // Exact match
            else if (user[key] !== value) {
              return false;
            }
          }
          return true;
        });
        
        totalUsers = filteredUsers.length;
        console.log(`Filtered to ${totalUsers} users`);
        
        // Apply sorting manually
        const sortedUsers = [...filteredUsers].sort((a, b) => {
          for (const [field, direction] of Object.entries(sortOption)) {
            if (a[field] < b[field]) return direction * -1;
            if (a[field] > b[field]) return direction;
          }
          return 0;
        });
        
        // Apply pagination manually
        users = sortedUsers.slice(skip, skip + pageSize);
        
        console.log(`In-memory query returned ${users.length} users out of ${totalUsers} total`);
      } catch (inMemoryError) {
        console.error('Error during in-memory filtering:', inMemoryError);
        // Return empty results rather than crashing
        users = [];
        totalUsers = 0;
      }
    } else {
      // Using MongoDB
      try {
        console.log('Using MongoDB for query');
        
        // Use countDocuments first to get total count
        totalUsers = await User.countDocuments(filter);
        console.log(`Total matching documents: ${totalUsers}`);
        
        // Then get paginated results
        users = await User.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(pageSize)
          .lean(); // Convert to plain objects
        
        console.log(`MongoDB query returned ${users.length} users`);
      } catch (mongoError) {
        console.error('Error during MongoDB query:', mongoError);
        // Return empty results rather than crashing
        users = [];
        totalUsers = 0;
      }
    }
    
    // Respond with success regardless of results
    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: parseInt(page),
      data: users
    });
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    // Send a more detailed error response
    res.status(500).json({
      success: false,
      message: 'Server Error during user filtering',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
  try {
    console.log('Create user request received with body:', req.body);
    
    const { name, email, phone, place, gender, countryCode = '+1', hobbies } = req.body;
    
    const validationErrors = [];
    
    if (!name || name.trim() === '') {
      validationErrors.push('Name is required');
    }
    
    if (!email) {
      validationErrors.push('Email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      validationErrors.push('Please provide a valid email');
    }
    
    if (!phone) {
      validationErrors.push('Phone number is required');
    } else if (phone.replace(/\D/g, '').length < 10) {
      validationErrors.push('Phone number is too short');
    }
    
    if (!place || place.trim() === '') {
      validationErrors.push('Place is required');
    }
    
    if (!gender || gender.trim() === '') {
      validationErrors.push('Gender is required');
    }
    
    if (!hobbies || !Array.isArray(hobbies) || hobbies.length === 0) {
      validationErrors.push('At least one hobby is required');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
        field: 'email'
      });
    }
    
    const existingUserWithPhone = await User.findOne({ phone });
    if (existingUserWithPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already in use',
        field: 'phone'
      });
    }
    
    const userData = {
      name,
      email,
      phone,
      countryCode: countryCode || '+1',
      place,
      gender,
      hobbies
    };
    
    console.log('Creating user with data:', userData);
    const user = await User.create(userData);
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in createUser controller:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let errorMessage = 'Duplicate value detected';
      
      if (field === 'email') {
        errorMessage = 'Email is already in use';
      } else if (field === 'phone') {
        errorMessage = 'Phone number is already in use';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        field
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = async (req, res) => {
  try {
    console.log('Update user request received for ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const { name, email, phone, place, gender, countryCode, hobbies } = req.body;
    const userId = req.params.id;
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const validationErrors = [];
    
    if (!name || name.trim() === '') {
      validationErrors.push('Name is required');
    }
    
    if (!email) {
      validationErrors.push('Email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      validationErrors.push('Please provide a valid email');
    }
    
    if (!phone) {
      validationErrors.push('Phone number is required');
    } else if (phone.replace(/\D/g, '').length < 10) {
      validationErrors.push('Phone number is too short');
    }
    
    if (!countryCode) {
      validationErrors.push('Country code is required');
    }
    
    if (!place || place.trim() === '') {
      validationErrors.push('Place is required');
    }
    
    if (!gender || gender.trim() === '') {
      validationErrors.push('Gender is required');
    }
    
    if (!hobbies || !Array.isArray(hobbies) || hobbies.length === 0) {
      validationErrors.push('At least one hobby is required');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors
      });
    }
    
    if (email !== currentUser.email) {
      const existingUserWithEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUserWithEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user',
          field: 'email'
        });
      }
    }
    
    if (phone !== currentUser.phone || countryCode !== currentUser.countryCode) {
      const existingUserWithPhone = await User.findOne({ 
        phone, 
        _id: { $ne: userId } 
      });
      
      if (existingUserWithPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is already in use by another user',
          field: 'phone'
        });
      }
    }
    
    const updateData = {
      name,
      email,
      phone,
      countryCode,
      place,
      gender,
      hobbies
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: false }
    );
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let errorMessage = 'Duplicate value detected';
      
      if (field === 'email') {
        errorMessage = 'Email is already in use by another user';
      } else if (field === 'phone') {
        errorMessage = 'Phone number is already in use by another user';
      } else if (field === 'countryCode' && error.keyPattern.phone) {
        errorMessage = 'This phone number with this country code is already in use by another user';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        field: field
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 