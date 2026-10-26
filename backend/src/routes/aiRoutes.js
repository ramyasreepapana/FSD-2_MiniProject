import { Router } from 'express';
import { estimateExpenses, smartSuggestions } from '../controllers/aiController.js';

const router = Router();

router.post('/estimate-expenses', estimateExpenses);
router.post('/smart-suggestions', smartSuggestions);

export default router;
