//1.cd chapter-2
//2.npm run dev
// or cd chapter-2 && npm run dev
// To verify I am in the right path:
// pwd                           # Shows current path (should end with \chapter-2)
//ls (or dir on Windows)        # Should show your package.json file

const express = require("express");
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

// GET all users
app.get("/users", (req, res) => res.json(users));

// GET one user
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
});

// POST create user
app.post("/users", (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// DELETE user
app.delete("/users/:id", (req, res) => {
  users = users.filter((u) => u.id !== parseInt(req.params.id));
  res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log("Server on port 3000"));
