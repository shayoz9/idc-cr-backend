import express, { Router } from 'express';
import * as controller from '../controller/taskController.js';
import { validateTaskInput, validateAIInput } from '../middleware/taskValidation.middleware.js';
import { isAdmin } from '../middleware/authorize.middleware.js';

const router: Router = express.Router();

// Standard CRUD routes
router.get('/', controller.getAllTasks);
router.get('/:id', controller.getTaskById);
router.post('/', validateTaskInput, controller.createTask);
router.put('/:id', isAdmin, validateTaskInput, controller.updateTask);
router.delete('/:id', controller.deleteTask);

// Filter routes
router.get('/status/:status', controller.getTasksByStatus);

// AI-powered task creation route
router.post('/ai/create', validateAIInput, controller.createTaskWithAI);

export default router;