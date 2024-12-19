const express = require("express");
const app = express();
require("dotenv").config();

const Person = require("./models/person");
app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// POST route for creating a new person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or number is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error)); // Mongoosen validointivirheet käsitellään tässä
});

// PUT route for updating an existing person
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  const id = request.params.id;

  const person = { name, number };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error)); // Virheiden käsittely
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        response.status(204).end();
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error)); // Virheiden käsittely
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error)); // Virheiden käsittely
});

app.get("/info", (request, response) => {
  Person.countDocuments()
    .then((count) => {
      const currentDate = new Date();
      const info = `
        <p>Phonebook has info for ${count} people</p>
        <p>${currentDate}</p>
      `;
      response.send(info);
    })
    .catch((error) => next(error)); // Virheiden käsittely
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
