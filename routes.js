const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./user.model");
const Task = require("./task.model");
const router = express.Router();
//  AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = authHeader;
  }
  if (!token) {
    return res.status(401).json({ msg: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
//Get users for the admin data 
// GET USERS (ADMIN ONLY)
router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const users = await User.find({
      tenantId: req.user.tenantId,
      role: "User"
    }).select("_id name email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//  REGISTER ADMIN (ONE PER TENANT)
router.post("/auth/register-admin", async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    const existingAdmin = await User.findOne({ role: "Admin", tenantId });
    if (existingAdmin) {
      return res.status(400).json({ msg: "Admin already exists for this tenant" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashed,
      tenantId,
      role: "Admin"
    });

    res.json(admin);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


//  REGISTER USER (ADMIN ONLY)
router.post("/auth/register", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      tenantId: req.user.tenantId,
      role: role === "Admin" ? "Admin" : "User"
    });

    res.json(user);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


//  LOGIN
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user._id,
        tenantId: user.tenantId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
  token,
  role: user.role,
  name: user.name
});

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// CREATE TASK (ADMIN ONLY)
router.post("/tasks", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Only admin can create tasks" });
    }

    const { title, description, assignedTo } = req.body;

    // Ensure assigned user belongs to same tenant
    const user = await User.findOne({
      _id: assignedTo,
      tenantId: req.user.tenantId
    });

    if (!user) {
      return res.status(400).json({ msg: "User not in same tenant" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      tenantId: req.user.tenantId,
      status: "Pending"
    });

    res.json(task);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


// GET TASKS (RBAC + TENANT)
router.get("/tasks", auth, async (req, res) => {
  try {
    let query = { tenantId: req.user.tenantId };

    if (req.user.role === "User") {
      query.assignedTo = req.user.userId;
    }

    const tasks = await Task.find(query);

    res.json(tasks);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
router.put("/tasks/:id", auth, async (req, res) => {
    console.log("USER:", req.user);
console.log("TASK ID:", req.params.id);

const debugTask = await Task.findById(req.params.id);
console.log("DB TASK:", debugTask);
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // USER → only status
    if (req.user.role === "User") {
      if (task.assignedTo.toString() !== req.user.userId) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      task.status = req.body.status;
    }

    // ADMIN → full update
    if (req.user.role === "Admin") {
      const { title, description, assignedTo, status } = req.body;

      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (status) task.status = status;
    }
    console.log("USER:", req.user);
console.log("TASK ID:", req.params.id);

const debugTask = await Task.findById(req.params.id);
console.log("DB TASK:", debugTask);

    await task.save();

    res.json(task);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    //  Only Admin can delete
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    console.log("USER:", req.user);
    console.log("DELETE ID:", req.params.id);

    //  tenant isolation applied
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    console.log("DELETED TASK:", task);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;