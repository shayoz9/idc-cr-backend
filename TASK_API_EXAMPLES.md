# Task API - HTTP Request Examples

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Create Task with AI
Creates a task by parsing natural language input using AWS Bedrock.

**Method:** POST  
**Endpoint:** `/tasks/ai`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "naturalLanguageInput": "Create a high priority task to fix the login bug by tomorrow"
}
```

**Successful Response (201):**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Review the project proposal",
    "description": "",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  },
  "originalInput": "Create a high priority task to fix the login bug by tomorrow",
  "aiExtracted": {
    "title": "Review the project proposal",
    "priority": "HIGH",
    "dueDate": "2026-02-20"
  }
}
```

---

### 2. Create Task Manually
Creates a new task with specified details.

**Method:** POST  
**Endpoint:** `/tasks`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the new API",
  "priority": "MEDIUM",
  "status": "TODO",
  "dueDate": "2026-02-28T00:00:00.000Z"
}
```

**Successful Response (201):**
```json
{
  "success": true,
  "task": {
    "id": 2,
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the new API",
    "status": "TODO",
    "priority": "MEDIUM",
    "dueDate": "2026-02-28T00:00:00.000Z",
    "createdAt": "2026-02-13T10:35:22.000Z",
    "updatedAt": "2026-02-13T10:35:22.000Z"
  }
}
```

**Error Response (400) - Missing Required Field:**
```json
{
  "success": false,
  "error": "Title is required"
}
```

---

### 3. Get All Tasks
Retrieves all tasks, sorted by creation date (newest first).

**Method:** GET  
**Endpoint:** `/tasks`

**Request:**
```bash
curl http://localhost:3000/api/tasks
```

**Successful Response (200):**
```json
{
  "success": true,
  "count": 2,
  "tasks": [
    {
      "id": 2,
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the new API",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2026-02-28T00:00:00.000Z",
      "createdAt": "2026-02-13T10:35:22.000Z",
      "updatedAt": "2026-02-13T10:35:22.000Z"
    },
    {
      "id": 1,
      "title": "Review the project proposal",
      "description": "",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-02-20T00:00:00.000Z",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get Task by ID
Retrieves a specific task by its ID.

**Method:** GET  
**Endpoint:** `/tasks/:id`

**Request:**
```bash
curl http://localhost:3000/api/tasks/1
```

**Successful Response (200):**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Review the project proposal",
    "description": "",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Response (404) - Task Not Found:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 5. Update Task
Updates one or more fields of an existing task.

**Method:** PUT  
**Endpoint:** `/tasks/:id`  
**Content-Type:** `application/json`

**Request Body (partial update - all fields optional):**
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "description": "Updated description for the task"
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Review the project proposal",
    "description": "Updated description for the task",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:45:15.000Z"
  }
}
```

**Error Response (404) - Task Not Found:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 6. Delete Task
Deletes a task by its ID.

**Method:** DELETE  
**Endpoint:** `/tasks/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

**Successful Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "task": {
    "id": 1,
    "title": "Review the project proposal",
    "description": "",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Error Response (404) - Task Not Found:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### 7. Get Tasks by Status
Retrieves all tasks with a specific status.

**Method:** GET  
**Endpoint:** `/tasks/status/:status`

**Valid Status Values:**
- `TODO`
- `IN_PROGRESS`
- `DONE`

**Request:**
```bash
curl http://localhost:3000/api/tasks/status/IN_PROGRESS
```

**Successful Response (200):**
```json
{
  "success": true,
  "count": 1,
  "tasks": [
    {
      "id": 1,
      "title": "Review the project proposal",
      "description": "",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2026-02-20T00:00:00.000Z",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:45:15.000Z"
    }
  ]
}
```

**Error Response (400) - Invalid Status:**
```json
{
  "success": false,
  "error": "Invalid status"
}
```

---

## Task Schema

### Allowed Values

**Status:**
- `TODO` (default)
- `IN_PROGRESS`
- `DONE`

**Priority:**
- `LOW`
- `MEDIUM` (default)
- `HIGH`

### Field Constraints

- **title**: Required, max 200 characters
- **description**: Optional, default is empty string
- **priority**: Optional, default is `MEDIUM`
- **status**: Optional, default is `TODO`
- **dueDate**: Optional, can be null

---

## Example cURL Commands

### Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the new API",
    "priority": "MEDIUM",
    "dueDate": "2026-02-28T00:00:00.000Z"
  }'
```

### Update Task
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Get All Tasks
```bash
curl http://localhost:3000/api/tasks
```

### Get Tasks by Status
```bash
curl http://localhost:3000/api/tasks/status/DONE
```

### Delete Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": "Additional error details (if applicable)"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
