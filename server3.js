//1.cd chapter-2
//2.npm run dev3
// or cd chapter-2 && npm run dev
// To verify I am in the right path:
// pwd                           # Shows current path (should end with \chapter-2)
//ls (or dir on Windows)        # Should show your package.json file

const express = require("express");
const app = express();
app.use(express.json());

// More realistic task database
let tasks = [
  {
    id: 1,
    title: "Wake up",
    completed: false,
    priority: "high",
    createdAt: "2026-05-05T08:00:00Z",
  },
  {
    id: 2,
    title: "Drink water",
    completed: true,
    priority: "medium",
    createdAt: "2026-05-05T08:30:00Z",
  },
  {
    id: 3,
    title: "Learn Node.js",
    completed: false,
    priority: "high",
    createdAt: "2026-05-05T09:00:00Z",
  },
];

let nextId = 4;

// ============ ROOT ENDPOINT ============
app.get("/", (req, res) => {
  res.json({
    message: "🎯 Task Manager API",
    version: "2.0",
    documentation: "https://github.com/your-repo",
    endpoints: {
      "GET /tasks": "Get all tasks",
      "GET /tasks/:id": "Get a specific task",
      "GET /tasks?completed=true": "Filter tasks by status",
      "POST /tasks": "Create a new task",
      "PUT /tasks/:id": "Update an entire task",
      "PATCH /tasks/:id": "Update part of a task",
      "DELETE /tasks/:id": "Delete a task",
      "DELETE /tasks": "Delete ALL tasks (dangerous!)",
    },
  });
});

// ============ GET ALL TASKS (with filtering) ============
app.get("/tasks", (req, res) => {
  let filteredTasks = [...tasks];

  // Filter by completion status: /tasks?completed=true
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === "true";
    filteredTasks = filteredTasks.filter(
      (task) => task.completed === isCompleted,
    );
  }

  // Filter by priority: /tasks?priority=high
  if (req.query.priority) {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === req.query.priority,
    );
  }

  res.json({
    count: filteredTasks.length,
    total: tasks.length,
    tasks: filteredTasks,
  });
});

// ============ GET SINGLE TASK ============
app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      error: "Task not found",
      message: `No task with id ${id} exists`,
    });
  }

  res.json(task);
});

// ============ CREATE NEW TASK ============
app.post("/tasks", (req, res) => {
  const { title, priority = "medium" } = req.body;

  // Validation
  if (!title) {
    return res.status(400).json({
      error: "Bad Request",
      message: "title is required",
    });
  }

  const newTask = {
    id: nextId++,
    title: title,
    completed: false,
    priority: priority,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  // 201 = Created (more specific than 200)
  res.status(201).json({
    message: "Task created successfully",
    task: newTask,
  });
});

// ============ UPDATE ENTIRE TASK (PUT) ============
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed, priority } = req.body;
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Validation
  if (!title || completed === undefined || !priority) {
    return res.status(400).json({
      error: "Bad Request",
      message: "title, completed, and priority are all required for PUT",
    });
  }

  // Complete replacement
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    completed,
    priority,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    message: "Task completely updated",
    task: tasks[taskIndex],
  });
});

// ============ PARTIAL UPDATE (PATCH) ============
app.patch("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Partial update - only change what's provided
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    message: "Task partially updated",
    task: tasks[taskIndex],
  });
});

// ============ DELETE SINGLE TASK ============
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskExists = tasks.find((t) => t.id === id);

  if (!taskExists) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks = tasks.filter((t) => t.id !== id);

  res.json({
    message: "Task deleted successfully",
    deletedTask: taskExists,
  });
});

// ============ DELETE ALL TASKS (DANGEROUS - needs confirmation) ============
app.delete("/tasks", (req, res) => {
  const confirm = req.query.confirm === "yes";

  if (!confirm) {
    return res.status(400).json({
      error: "Confirmation required",
      message: "Add ?confirm=yes to delete ALL tasks",
    });
  }

  const deletedCount = tasks.length;
  tasks = [];

  res.json({
    message: "All tasks deleted",
    count: deletedCount,
  });
});

// ============ STATISTICS ENDPOINT ============
app.get("/stats", (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === "high").length;

  res.json({
    total,
    completed,
    pending,
    completionRate:
      total === 0 ? 0 : `${((completed / total) * 100).toFixed(1)}%`,
    highPriority,
    priorities: {
      high: highPriority,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    },
  });
});

// ============ HEALTH CHECK ============
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    tasksCount: tasks.length,
  });
});

// ============ 404 Handler for undefined routes ============
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      "GET /",
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "PATCH /tasks/:id",
      "DELETE /tasks/:id",
      "DELETE /tasks?confirm=yes",
      "GET /stats",
      "GET /health",
    ],
  });
});

// ============ START SERVER ============
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try these URLs in your browser:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/tasks`);
  console.log(`   - http://localhost:${PORT}/tasks?completed=true`);
  console.log(`   - http://localhost:${PORT}/tasks/1`);
  console.log(`   - http://localhost:${PORT}/stats`);
  console.log(`   - http://localhost:${PORT}/health`);
});
