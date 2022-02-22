const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.some(user => user.username === username);

  if(!userExists)
    return response.status(404).json({ error: 'User not exists' })

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);

  if(userExists)
    return response.status(400).json({ error: 'Username alread exists' });

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser)

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(currentUser => currentUser.username === username);

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { title, deadline } = request.body;

  const user = users.find(currentUser => currentUser.username === username);

  const newTask = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(newTask)

  return response.status(201).json(newTask);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.find(currentUser => currentUser.username == username);

  const taskIndex = user.todos.findIndex(task => task.id == id);

  if(taskIndex === -1)
    return response.status(404).json({ error: 'Task not exists' })

  const updatedTask = {
    ...user.todos[taskIndex],
    title,
    deadline: new Date(deadline)
  }

  user.todos[taskIndex] = updatedTask;

  return response.status(200).json(updatedTask);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(currentUser => currentUser.username === username);
  const user = users[userIndex];

  const taskIndex = user.todos.findIndex(task => task.id == id);

  if(taskIndex === -1)
    return response.status(404).json({ error: 'Task not exists' })

  const updatedTask = {
    ...user.todos[taskIndex],
    done: true
  }

  user.todos[taskIndex] = updatedTask;

  return response.status(200).json(updatedTask);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(currentUser => currentUser.username === username);

  const taskExists = user.todos.find(task => task.id === id);

  if(!taskExists)
    return response.status(404).json({ error: 'Task not exists' })

  user.todos = user.todos.filter(todo => todo.id !== id);

  return response.status(204).end();
});

module.exports = app;