// models/User.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
  },
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, trim: true, default: '' },

  roles: {
    type: [String],
    enum: ['user', 'admin'],
    default: ['user'],
    index: true,
  },

  // quick relationships / profile
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge', index: true }],
  avatarUrl: { type: String, default: '' },

  // telemetry
  lastLoginAt: { type: Date, default: null },
  status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },

  // free-form preferences
  prefs: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
});

withBaseFields(userSchema, { hide: ['passwordHash'] });

// helpful indexes
userSchema.index({ name: 'text', email: 'text' });

export default mongoose.model('User', userSchema);
