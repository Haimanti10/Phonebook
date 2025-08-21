require("dotenv").config();
const express = require("express"); // Import Express
const Person = require("./models/person"); // Import the Note model
const http = require("http");
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

/*let persons = [
  {
    name: "Reshma",
    number: "9474144092",
    id: "1",
  },
  {
    name: "Rupesh",
    number: "943410020",
    id: "2",
  },
  {
    name: "Aditi",
    number: "8320594593",
    id: "3",
  },
  {
    name: "Hia",
    number: "1234567899",
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

// ✅ Get all persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});
// ✅ Info page (count + time)
app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    const time = new Date();
    response.send(
      `<p> Phonebook has info for ${count} people
    <p> ${time} </p>`
    );
  });
});
// ✅ Get one person by ID
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.send(person);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});
// ✅ Delete a person by ID
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});
// ✅ Update person’s number
app.put("/api/persons/:id", (request, response, next) => {
  const { number } = request.body;
  Person.findByIdAndUpdate(
    request.params.id,
    { number },
    { new: true, runValidators: true }
  )
    .then((updatedPerson) => {
      if (!updatedPerson) {
        return response.status(404).json({ error: "Person not found" });
      }
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});
// ✅ Add a new person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number is missing" });
  }
  //✅Check if a person with the same name already exists

  Person.findOne({ name: body.name }).then((existingPerson) => {
    if (existingPerson) {
      console.log(
        `Name ${body.name} already exists in the phonebook. 
        Updating number instead.`
      );
      //✅updating the number if the name already exists
      return Person.findByIdAndUpdate(
        existingPerson._id,
        { number: body.number },
        { new: true, runValidators: true }
      )
        .then((updatedPerson) => {
          console.log(
            `Updated ${updatedPerson.name} number to ${updatedPerson.number}`
          );
          response.json(updatedPerson);
        })
        .catch((error) => next(error));
    }
    const newperson = new Person({
      name: body.name,
      number: body.number,
    });
    newperson
      .save()
      .then((result) => {
        console.log(
          `Added ${result.name} number ${result.number} to phonebook`
        );
        response.json(result);
      })
      .catch((error) => {
        console.error("Error saving person:", error);
        response.status(500).json({ error: "Failed to save person" });
      });
  });
});

// ✅ Serve frontend build
app.use(express.static("dist"));
//✅ Handle unknown endpoints
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};
app.use(unknownEndpoint); // ✅handler of requests with unknown endpoint
// ✅ Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error); // Pass the error to the next middleware
};
app.use(errorHandler); //✅ handler of requests with result to errors
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
