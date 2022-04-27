const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const userTable = require('../models/userModel')


// @desc      Create a User...
// @route     POST /api/users
// @access    Public.
const createUser = asyncHandler(async (req, res) => {
  //Check that everything is filled out in its enterity
  const { username, password, role} = req.body
  if (!username || !password) {
    res.status(400)
    throw new Error('Please fill out all of the required fields')
  }

  //Check if the username is already taken

  const checkUser = await userTable.findOne({username})

  //If username is taken, throw an error stating such
  if(checkUser) {
    res.status(400)
    throw new Error('User already exists!')
  }

  //Hashing the password using bcrypt
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create a new user
  const newUser = await userTable.create({
    username,
    password: hashedPassword,
    role,
  })

  //Check if new user was created successfully, if so, return the username + id from the database, else return an error with an error message.
  //Now also calls the generateToken function created below & passed in the user ID generated from mongoDB as the "id" variable needed. 
  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      username: newUser.username,
      token: generateToken(newUser._id),
      role: newUser.role
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc      Login to user profile
// @route     POST /api/users/login
// @access    Public.
const loginToUser = asyncHandler(async (req, res) => {
  //Assigns the username & password to the variables from the request 
  const {username, password} = req.body

  //Const assigns the user data from the table to the variable named user
  const user = await userTable.findOne({username})

  //If the user exists within the table, then atempts to compare the hased password with the password stored in the database under the users entry.
  //Now also calls the generateToken function created below & passed in the user ID generated from mongoDB as the "id" variable needed. 
  if(user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      username: user.username,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc      Get user profile
// @route     GET /api/users/profile
// @access    Private.
const whoAmI = asyncHandler(async (req, res) => {
  const {_id, username, role} = await userTable.findById(req.user.id)

  res.status(200).json({
    id: _id,
    username,
    role
  })
})

// Generates a JWT to act as an "authentication" method for requests
// Takes the ID generated by mongoDB as the ID of the user as they will be the same
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_Secret, {
    expiresIn: '30d',
  })
}

module.exports = {
  createUser,
  loginToUser,
  currentUser: whoAmI
}