// routes/habits.js
import express from 'express';
const router = express.Router();
import { recordHabit } from '../controllers/habitsController.js';

router.post('/record', recordHabit);

export default router;
