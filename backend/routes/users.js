const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.get('/reset-db', async (req, res) => {
  if (global.resetDatabase) {
    global.resetDatabase();
    console.log('In-memory database reset');
    return res.status(200).json({
      success: true,
      message: 'In-memory database has been reset'
    });
  } else {
    console.log('Reset not available, possibly using MongoDB');
    return res.status(400).json({
      success: false,
      message: 'Reset function not available (MongoDB is being used)'
    });
  }
});

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 