import { Router } from 'express';
import { healthCheck } from "../controllers/healthCheck.controller.js"

const router = Router();

router.route('/h/health').get(healthCheck);

export default router