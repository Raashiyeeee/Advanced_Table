const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

console.log('Attempting to connect to MongoDB...');

(async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    
    console.log('Using in-memory storage for development');
    
    global.users = [];
    global.userIdCounter = 1;
    
    global.resetDatabase = function() {
      global.users = [];
      global.userIdCounter = 1;
      console.log('In-memory database has been reset');
    };
    
    const User = require('./models/User');
    
    console.log('Setting up enhanced in-memory data storage...');
    
    User.find = async function(filter = {}) {
      console.log('In-memory find called with filter:', filter);
      
      let result = global.users.map(user => ({...user}));
      console.log(`Total users in memory: ${result.length}`);
      
      if (filter.$or && Array.isArray(filter.$or)) {
        result = result.filter(user => {
          return filter.$or.some(condition => {
            const field = Object.keys(condition)[0];
            const value = condition[field].$regex || condition[field];
            return String(user[field]).toLowerCase().includes(String(value).toLowerCase());
          });
        });
      }
      
      for (const [field, condition] of Object.entries(filter)) {
        if (field === '$or') continue;
        
        if (condition.$regex) {
          result = result.filter(user => 
            user[field] && String(user[field]).toLowerCase().includes(String(condition.$regex).toLowerCase())
          );
        } else if (condition.$in && Array.isArray(condition.$in)) {
          result = result.filter(user => {
            const userValues = Array.isArray(user[field]) ? user[field] : [user[field]];
            return condition.$in.some(val => userValues.includes(val));
          });
        } else if (typeof condition === 'object' && condition.$ne) {
          result = result.filter(user => user[field] !== condition.$ne);
        } else if (typeof condition !== 'object') {
          result = result.filter(user => user[field] === condition);
        }
      }
      
      console.log(`In-memory filter returned ${result.length} users`);
      return result;
    };
    
    User.find.sort = function(sortCriteria) {
      console.log('Sorting in-memory results:', sortCriteria);
      const result = this;
      
      if (Array.isArray(result) && sortCriteria) {
        return result.sort((a, b) => {
          for (const [field, direction] of Object.entries(sortCriteria)) {
            const aVal = a[field];
            const bVal = b[field];
            
            if (aVal < bVal) return direction === 1 ? -1 : 1;
            if (aVal > bVal) return direction === 1 ? 1 : -1;
          }
          return 0;
        });
      }
      
      return result;
    };
    
    User.find.sort.skip = function(skipCount) {
      console.log('Skipping in-memory results:', skipCount);
      const result = this;
      if (Array.isArray(result) && skipCount) {
        return result.slice(skipCount);
      }
      return result;
    };
    
    User.find.sort.skip.limit = function(limitCount) {
      console.log('Limiting in-memory results:', limitCount);
      const result = this;
      if (Array.isArray(result) && limitCount) {
        return result.slice(0, limitCount);
      }
      return result;
    };
    
    User.findById = async function(id) {
      return global.users.find(user => user._id === id);
    };
    
    User.create = async function(userData) {
      console.log('Creating user with data:', JSON.stringify(userData));
      
      if (!userData.countryCode) {
        userData.countryCode = '+1';
      }
      
      console.log('Using country code:', userData.countryCode);
      
      const newUser = {
        ...userData,
        _id: String(global.userIdCounter++),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      global.users.push(newUser);
      console.log('User created:', JSON.stringify(newUser));
      
      return newUser;
    };
    
    User.findByIdAndUpdate = async function(id, updates) {
      const index = global.users.findIndex(user => user._id === id);
      if (index === -1) return null;
      
      console.log('Original user:', JSON.stringify(global.users[index]));
      console.log('Updates being applied:', JSON.stringify(updates));
      
      const updatedUser = {
        _id: global.users[index]._id,
        name: updates.name || global.users[index].name,
        email: updates.email || global.users[index].email,
        phone: updates.phone || global.users[index].phone,
        countryCode: updates.countryCode || global.users[index].countryCode,
        place: updates.place || global.users[index].place,
        gender: updates.gender || global.users[index].gender,
        hobbies: updates.hobbies || global.users[index].hobbies,
        createdAt: global.users[index].createdAt,
        updatedAt: new Date()
      };
      
      console.log('Explicitly set country code:', updatedUser.countryCode);
      
      global.users[index] = updatedUser;
      
      return global.users[index];
    };
    
    User.findByIdAndDelete = async function(id) {
      const index = global.users.findIndex(user => user._id === id);
      if (index === -1) return null;
      
      const deletedUser = global.users[index];
      global.users.splice(index, 1);
      return deletedUser;
    };
    
    User.countDocuments = async function(filter = {}) {
      if (Object.keys(filter).length === 0) {
        return global.users.length;
      }
      
      const filteredUsers = await User.find(filter);
      return filteredUsers.length;
    };
    
    User.findOne = async function(filter) {
      let result = global.users.map(user => ({...user}));
      
      if (filter.email) {
        return result.find(user => user.email === filter.email);
      }
      
      if (filter.phone) {
        return result.find(user => user.phone === filter.phone);
      }
      
      if (filter.email && filter._id && filter._id.$ne) {
        return result.find(user => 
          user.email === filter.email && user._id !== filter._id.$ne
        );
      }
      
      if (filter.phone && filter._id && filter._id.$ne) {
        return result.find(user => 
          user.phone === filter.phone && user._id !== filter._id.$ne
        );
      }
      
      return null;
    };
    
    console.log('Enhanced in-memory data store initialized successfully');
  }
})();

const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 