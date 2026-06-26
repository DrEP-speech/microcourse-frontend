// models/Course.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, default: '' },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', index: true },
  tags: { type: [String], default: [], index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  // relationship; store order at Lesson level too
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true }],

  publishedAt: { type: Date, default: null, index: true },
  isPublished: { type: Boolean, default: false, index: true },

  // simple stats
  stats: {
    enrollmentCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
  },
});

withBaseFields(courseSchema);

courseSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Course', courseSchema);
