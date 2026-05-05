const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Task data
let tasks = [
  { id: 1, title: 'Wake up', completed: false },
  { id: 2, title: 'Drink water', completed: false },
  { id: 3, title: 'Learn Node.js', completed: false }
];

let nextId = 4;

// ============ ROOT ============
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task API is running!',
    endpoints: {
      GET: '/tasks, /tasks/:id, /health, /stats',
      POST: '/tasks',
      PUT: '/tasks/:id',
      DELETE: '/tasks/:id'
    }
  });
});

// ============ GET all tasks ============
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// ============ GET single task ============
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// ============ POST create task ============
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const newTask = {
    id: nextId++,
    title: title,
    completed: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ============ PUT update entire task ============
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  if (!title || completed === undefined) {
    return res.status(400).json({ error: 'Title and completed are required' });
  }
  
  tasks[taskIndex] = { id, title, completed };
  res.json(tasks[taskIndex]);
});

// ============ DELETE task ============
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskExists = tasks.find(t => t.id === id);
  
  if (!taskExists) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks = tasks.filter(t => t.id !== id);
  res.json({ message: 'Task deleted successfully' });
});

// ============ HEALTH check ============
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    tasksCount: tasks.length
  });
});

// ============ STATS ============
app.get('/stats', (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  
  res.json({
    total,
    completed,
    pending: total - completed,
    completionRate: total === 0 ? '0%' : `${Math.round((completed/total)*100)}%`
  });
});

// ============ 404 handler ============
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    available: ['/', '/tasks', '/tasks/:id', '/health', '/stats']
  });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});