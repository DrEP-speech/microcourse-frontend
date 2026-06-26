// models/Notification.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const notificationSchema = new mongoose.Schema({
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, default: 'general', index: true }, // e.g., 'badge_awarded', 'course_update'
  title: { type: String, required: true },
  body: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },

  readAt: { type: Date, default: null, index: true },
  sentAt: { type: Date, default: Date.now, index: true },
});

withBaseFields(notificationSchema);

export default mongoose.model('Notification', notificationSchema);
