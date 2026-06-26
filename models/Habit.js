// models/Habit.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const entrySchema = new mongoose.Schema({
  date: { type: String, required: true }, // yyyy-mm-dd
  value: { type: Number, default: 1 },
}, { _id: false });

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  key: { type: String, required: true, trim: true, index: true }, // e.g., 'daily_login'
  entries: { type: [entrySchema], default: [] },
});

withBaseFields(habitSchema);

habitSchema.index({ user: 1, key: 1 }, { unique: true });

export default mongoose.model('Habit', habitSchema);
