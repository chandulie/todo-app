const express = require('express')
const { randomUUID } = require('crypto')
const fs = require('fs')
const path = require('path')
const cors = require('cors');
const app = express()


app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(cors());
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'tasks.json')

function readTasks() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return { tasks: [] }
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2))
}

app.get('/', (req, res) => {
  res.render("index")
})

app.get('/api/tasks', (req, res) => {
  const tasks = readTasks()
  res.json(tasks)
})

app.post('/api/tasks', (req, res) => {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Content-Type must be application/json'
    })
  }
  console.log(req.body)
  let { name, category, priority, date } = req.body

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid task name' });
  }

  if (category !== "0" && category !== "1") {
    return res.status(400).json({ error: 'Category must be 0 or 1' });
  }

  if (category === "0") {
    category = 0;
  }

  if (category === "1") {
    category = 1;
  }

  const tasks = readTasks()
  const newTask = {
    id: randomUUID(),
    name,
    category,
    priority: priority || 1,
    ...(date && { date }),
  }

  tasks.tasks.push(newTask)
  saveTasks(tasks)
  res.status(201).json({ message: 'Task saved' })
})

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks()
  const taskId = req.params.id
  
  const updatedTasks = tasks.tasks.filter(task => task.id !== taskId);
  
  if (updatedTasks.length === tasks.tasks.length) {
    return res.status(404).json({ error: 'Task not found' })
  }

  saveTasks({ tasks: updatedTasks })
  res.json({ message: 'Task deleted' })
})

app.put('/api/tasks/:id', (req, res) => {
  if (!req.is('application/json')) {
    return res.status(415).json({
      error: 'Content-Type must be application/json'
    })
  }

  const tasks = readTasks()
  const taskId = req.params.id

  const taskToUpdate = tasks.tasks.find(task => task.id === taskId)

  if (!taskToUpdate) {
    return res.status(404).json({ error: 'Task not found' })
  }

  Object.assign(taskToUpdate, req.body)
  saveTasks(tasks)
  res.json({ message: 'Task updated' })
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})