import { Request, Response } from 'express';
import { Task } from '../model/task.js';
import { TaskRepository } from '../repository/task.repository.js';
import bedrockService from '../service/aiService.js';

const taskRepository = new TaskRepository();

interface CreateTaskWithAIRequest {
  naturalLanguageInput: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

export const createTaskWithAI = async (
  req: Request<{}, {}, CreateTaskWithAIRequest>,
  res: Response
): Promise<void> => {
  try {
    const { naturalLanguageInput } = req.body;

    if (!naturalLanguageInput || naturalLanguageInput.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Natural language input is required',
      });
      return;
    }

    // Call AWS Bedrock to parse the natural language input
    console.log('Processing natural language input:', naturalLanguageInput);
    const taskData = await bedrockService.parseNaturalLanguageTask(
      naturalLanguageInput
    );

    console.log('AI extracted task data:', taskData);

    // Create the task in the database
    const task: Task = await taskRepository.create({
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
    });

    res.status(201).json({
      success: true,
      task,
      originalInput: naturalLanguageInput,
      aiExtracted: taskData,
    });
  } catch (error) {
    console.error('Error creating task with AI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task with AI',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createTask = async (
  req: Request<{}, {}, CreateTaskRequest>,
  res: Response
): Promise<void> => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    if (!title) {
      res.status(400).json({
        success: false,
        error: 'Title is required',
      });
      return;
    }

    const task: Task = await taskRepository.create({
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
      status: status || 'TODO',
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tasks: Task[] = await taskRepository.findAll();
    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTaskById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const task: Task | null = await taskRepository.findById(Number(id));

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateTask = async (
  req: Request<{ id: string }, {}, Partial<CreateTaskRequest>>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task: Task | null = await taskRepository.update(Number(id), updates);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const task: Task | null = await taskRepository.findById(Number(id));

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    const deleted = await taskRepository.delete(Number(id));

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      task,
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTasksByStatus = async (
  req: Request<{ status: string }>,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.params;
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

    if (!validStatuses.includes(status.toUpperCase())) {
      res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
      return;
    }

    const tasks: Task[] = await taskRepository.findByStatus(
      status.toUpperCase() as 'TODO' | 'IN_PROGRESS' | 'DONE'
    );

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};