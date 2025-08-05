const http = require("http");
const express = require("express");
app.use(express.static("dist")); // Serve static files from the 'dist' directory
//This line is used to serve static files from the 'dist' directory, from frontend which is typically where the built frontend files are located in a React application.
const morgan = require("morgan"); // Import morgan for logging
const cors = require("cors"); // Import cors for handling CORS issues
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
//app.use(morgan("tiny")); // Use morgan to log requests in 'tiny' format
app.use(cors()); // Enable CORS for all routes

// Custom token to log request body for POST requests`
morgan.token("body", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : ""
);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
// Log method, URL, status, response length, response time, and body for POST requests)

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: "1",
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: "2",
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: "3",
  },
  {
    name: "Hia",
    number: "1234567890",
    id: "4",
  },
];

/*using without express: we use stringify to convert the persons array to a JSON string. 
Express handles this automatically when we use response.json() or response.send() with an object or array.
const app = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(persons));
});*/

/*app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});
app.post("/api/persons", (request, response) => {
  const newperson = request.body;
  console.log(newperson);
  console.log(request.headers);
  response.json(newperson);
});*/
app.get("/api/persons", (request, response) => {
  response.json(persons);
});
app.get("/info", (request, response) => {
  const count = persons.length;
  const time = new Date();
  response.send(
    `<p> Phonebook has info for ${count} people
    <p> ${time} </p>`
  );
});
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id == id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).json({ error: "Person not found" });
  }
});
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end(); // No content to return
});
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number is missing" });
  }
  if (persons.find((p) => p.name == body.name)) {
    return response
      .status(400)
      .json({ error: "Person with this ID already exists" });
  }
  const newperson = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1e9).toString(), // Generate a random ID as string
  };
  persons = persons.concat(newperson);
  response.json(newperson);
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
