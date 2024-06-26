const fs = require("fs");
const express = require('express');
const app = express();
const uuidV4 = require('uuid').v4;

app.use(express.json());

const saveTodoToFile = (todos) => {
  try {
    fs.writeFileSync('todos.json', JSON.stringify(todos));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getTodosFromFile = () => {
  try {
    const data = fs.readFileSync('todos.json');
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
    return [];
  }
};

/**
 * GET /todos - Retrieve all todo items
 * Description: Returns a list of all todo items.
 * Response: 200 OK with an array of todo items in JSON format.
 * Example: GET http://localhost:3000/todos
 */
app.get('/todos', (req, res) => {
  const todos = getTodosFromFile();
  return res.status(200).json(todos);
});

/**
 * GET /todos/:id - Retrieve a specific todo item by ID
 * Description: Returns a specific todo item identified by its ID.
 * Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
 * Example: GET http://localhost:3000/todos/123
 */
app.get('/todos/:id', (req, res) => {
  const todos = getTodosFromFile();
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  } else {
    return res.status(200).json(todo);
  }
});

/**
 * POST /todos - Create a new todo item
 * Description: Creates a new todo item.
 * Request Body: JSON object representing the todo item.
 * Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
 * Example: POST http://localhost:3000/todos
 * Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
 */
app.post('/todos', (req, res) => {
  const newTodo = {
    id: uuidV4(),
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed || false
  };

  const todos = getTodosFromFile();
  todos.push(newTodo);

  if (!saveTodoToFile(todos)) {
    return res.status(500).json({ message: "Failed to save todo" });
  }

  return res.status(201).json({ id: newTodo.id });
});

/**
 * PUT /todos/:id - Update an existing todo item by ID
 * Description: Updates an existing todo item identified by its ID.
 * Request Body: JSON object representing the updated todo item.
 * Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
 * Example: PUT http://localhost:3000/todos/123
 * Request Body: { "title": "Buy groceries", "completed": true }
 */
app.put('/todos/:id', (req, res) => {
  const todos = getTodosFromFile();
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  } else {
    todo.title = req.body.title;
    todo.description = req.body.description;
    todo.completed = req.body.completed || false;

    if (!saveTodoToFile(todos)) {
      return res.status(500).json({ message: "Failed to save todo" });
    }

    return res.status(200).json(todo);
  }
});

/**
 * DELETE /todos/:id - Delete a todo item by ID
 * Description: Deletes a todo item identified by its ID.
 * Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
 * Example: DELETE http://localhost:3000/todos/123
 */
app.delete('/todos/:id', (req, res) => {
  const todos = getTodosFromFile();
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  } else {
    todos.splice(todos.indexOf(todo), 1);

    if (!saveTodoToFile(todos)) {
      return res.status(500).json({ message: "Failed to save todo" });
    }

    return res.status(200).json({ message: "Todo deleted" });
  }
});

/**
 * For any other route not defined in the server return 404
 */
app.all("**", (req, res) => {
  return res.status(404).send();
});

// Start the server (making an function call so that it doesn't start when the testcases are running)
const port = process.env.PORT || 4000;
const appListener = app.listen(port, () => {
  console.log(`TodoServer is running on port ${port}`);
});

app.close = function () {
  appListener.close();
}

module.exports = app;

/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */

