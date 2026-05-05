//1.cd chapter-2
//2.npm run dev
// or cd chapter-2 && npm run dev
// To verify I am in the right path:
// pwd                           # Shows current path (should end with \chapter-2)
//ls (or dir on Windows)        # Should show your package.json file


const express = require("express");
const app = express();
app.use(express.json());

// Our simple task list
let tasks = [
  { id: 1, task: "Wake up" },
  { id: 2, task: "Drink water" },
  { id: 3, task: "Learn Node.js" },
];

// 1. See all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// 2. Add a new task
app.post("/tasks", (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    task: req.body.task,
  };
  tasks.push(newTask);
  res.json(newTask);
});

// 3. Delete a task
app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter((t) => t.id !== parseInt(req.params.id));
  res.json({ message: "Task deleted!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));

