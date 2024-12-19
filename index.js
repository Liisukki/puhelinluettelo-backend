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

  // Yleinen virhe
  return response.status(500).send({ error: "Internal Server Error" });
};

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// Get henkilö ID:n mukaan
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
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  // Poistetaan henkilö tietokannasta
  Person.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        // Poisto onnistui, palautetaan 204 No Content
        response.status(204).end();
      } else {
        // Jos henkilöä ei löydy, palautetaan 404 Not Found
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => next(error)); // Virheiden käsittely
});

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
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  const numberOfPersons = persons.length;
  const currentDate = new Date();

  const info = `
      <p>Phonebook has info for ${numberOfPersons} people</p>
      <p>${currentDate}</p>
    `;
  response.send(info);
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
