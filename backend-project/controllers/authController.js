import Admin from '../models/Admin.js';
import { logActivity } from '../utils/activityLogger.js';

// Register new admin
export const register = async (req, res) => {
  try {
    const { username, password, confirmPassword, securityQuestion, securityAnswer } = req.body;

    // Validation
    if (!username || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters',
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // Create admin
    const admin = await Admin.create({
      username,
      password,
      securityQuestion,
      securityAnswer,
    });

    // Log activity
    await logActivity(admin._id, 'CREATE', 'Admin', admin._id, `Admin registered: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: error.message,
    });
  }
};

// Login admin
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled',
      });
    }

    // Set session
    req.session.adminId = admin._id;
    req.session.username = admin.username;

    // Log activity
    await logActivity(admin._id, 'LOGIN', 'Admin', admin._id, `Admin logged in: ${username}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// Logout admin
export const logout = async (req, res) => {
  try {
    const adminId = req.session.adminId;
    
    if (adminId) {
      await logActivity(adminId, 'LOGOUT', 'Admin', adminId, 'Admin logged out');
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out',
        });
      }
      
      res.clearCookie('connect.sid');
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};

// Get security question
export const getSecurityQuestion = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        securityQuestion: admin.securityQuestion,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching security question',
      error: error.message,
    });
  }
};

// Reset password using security question
export const resetPassword = async (req, res) => {
  try {
    const { username, securityAnswer, newPassword, confirmPassword } = req.body;

    if (!username || !securityAnswer || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify security answer
    const isAnswerValid = await admin.compareSecurityAnswer(securityAnswer);
    if (!isAnswerValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect security answer',
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    await logActivity(admin._id, 'UPDATE', 'Admin', admin._id, 'Password reset via security question');

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

// Get current admin (for session check)
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.adminId).select('-password -securityAnswer');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};
