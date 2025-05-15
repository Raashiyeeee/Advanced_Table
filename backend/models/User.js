const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
    default: '+1',
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    unique: true
  },
  hobbies: {
    type: [String],
    required: [true, 'At least one hobby is required'],
    validate: {
      validator: function(arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'Please select at least one hobby'
    }
  },
  place: {
    type: String,
    required: [true, 'Place is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    trim: true
  }
}, {
  timestamps: true
});

UserSchema.index({ countryCode: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema); 