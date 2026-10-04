const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      department,
      username,
      password
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !department ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      phone,
      department,
      hospital: 'PSG Hospitals',
      username,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        department: user.department,
        hospital: user.hospital,
        username: user.username
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Registration failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        hospital: user.hospital,
        username: user.username
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Login failed'
    });
  }
};

module.exports = {
  register,
  login
};