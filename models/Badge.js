// models/Badge.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const badgeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  iconUrl: { type: String, default: '' },
  points: { type: Number, default: 0 },
});

withBaseFields(badgeSchema);

badgeSchema.index({ name: 'text', description: 'text', key: 'text' });

export default mongoose.model('Badge', badgeSchema);
