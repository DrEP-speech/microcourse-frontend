import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookies.js";

/**
 * Build a signed JWT for a user.
 */
function buildTokenForUser(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const userId = user._id || user.id;

  return jwt.sign(
    {
      id: userId ? String(userId) : undefined,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * POST /api/auth/signup
 */
export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const jwtToken = buildTokenForUser(user);
    setAuthCookie(res, jwtToken);

    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (err) {
    if (next) {
      return next(err);
    }
    return res
      .status(500)
      .json({ success: false, message: "Signup failed", error: err.message });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const jwtToken = buildTokenForUser(user);
    setAuthCookie(res, jwtToken);

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (err) {
    if (next) {
      return next(err);
    }
    return res
      .status(500)
      .json({ success: false, message: "Login failed", error: err.message });
  }
}

/**
 * POST /api/auth/logout
 */
export function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ success: true });
}

/**
 * GET /api/auth/me
 */
export function getMe(req, res) {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  return res.json({ success: true, user: req.user });
}

export default {
  signup,
  login,
  logout,
  getMe,
};
