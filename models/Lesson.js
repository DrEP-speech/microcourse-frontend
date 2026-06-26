// models/Lesson.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true, index: true },
  order: { type: Number, default: 0, index: true },

  // content pointers
  content: { type: String, default: '' }, // markdown / HTML
  videoUrl: { type: String, default: '' },
  durationSec: { type: Number, default: 0 },

  // optional attached quiz
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null, index: true },

  resources: [{
    title: String,
    url: String,
  }],
});

withBaseFields(lessonSchema);

lessonSchema.index({ course: 1, order: 1 }, { unique: false });
lessonSchema.index({ title: 'text', slug: 'text' });

export default mongoose.model('Lesson', lessonSchema);
