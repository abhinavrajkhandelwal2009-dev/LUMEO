import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here_lumeo_2026';
const SALT_ROUNDS = 10;

const DEFAULT_PREFS = {
  highContrast: false,
  fontSize: 'normal',
  dyslexiaFont: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  defaultLanguage: 'English',
  globalMute: false,
  colorOverlay: 'none',
};

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, accessibility_prefs)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, accessibility_prefs, created_at, updated_at`,
      [name.trim(), normalizedEmail, passwordHash, JSON.stringify(DEFAULT_PREFS)]
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      error: 'Registration failed',
      message: 'An internal error occurred while creating your account.',
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password.',
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = signToken(safeUser);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      error: 'Login failed',
      message: 'An internal error occurred while signing in.',
    });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, name, email, accessibility_prefs, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile could not be located.',
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Could not retrieve user accessibility profile.',
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, accessibility_prefs } = req.body;

    const currentResult = await query(
      'SELECT id, name, email, accessibility_prefs FROM users WHERE id = $1',
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = currentResult.rows[0];
    const updatedName = name ? name.trim() : currentUser.name;
    const mergedPrefs = {
      ...(currentUser.accessibility_prefs || DEFAULT_PREFS),
      ...(accessibility_prefs || {}),
    };

    const result = await query(
      `UPDATE users SET name = $1, accessibility_prefs = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, accessibility_prefs, created_at, updated_at`,
      [updatedName, JSON.stringify(mergedPrefs), userId]
    );

    return res.status(200).json({
      message: 'Accessibility preferences updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      error: 'Profile update failed',
      message: 'Could not update accessibility preferences.',
    });
  }
}

