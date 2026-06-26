// models/Quiz.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const optionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: { type: [optionSchema], default: [] },
  correctValue: { type: String, required: true }, // matches one option.value
  points: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', index: true },

  questions: { type: [questionSchema], default: [] },
  timeLimitSec: { type: Number, default: 0 },     // 0 = unlimited
  shuffleQuestions: { type: Boolean, default: false },
  shuffleOptions: { type: Boolean, default: false },
  passingScore: { type: Number, default: 0 },     // points needed to pass
});

withBaseFields(quizSchema);

quizSchema.index({ title: 'text' });

export default mongoose.model('Quiz', quizSchema);
