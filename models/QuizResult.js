// models/QuizResult.js
import mongoose from 'mongoose';
import { withBaseFields } from './_plugins.js';

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedValue: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },

  answers: { type: [answerSchema], default: [] },
  score: { type: Number, default: 0, index: true },
  maxScore: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null, index: true },
  passed: { type: Boolean, default: false, index: true },

  attempt: { type: Number, default: 1 }, // if you allow multiple attempts
});

withBaseFields(quizResultSchema);

// Fast lookups
quizResultSchema.index({ user: 1, quiz: 1, attempt: 1 }, { unique: true });

export default mongoose.model('QuizResult', quizResultSchema);
