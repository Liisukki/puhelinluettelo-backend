require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

// Tervehdysreitti
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// Näytä kaikki henkilöt tietokannasta
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

// Näytä yksittäinen henkilö ID:n perusteella
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Poista henkilö ID:n perusteella
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Lisää uusi henkilö tietokantaan
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

// Näytä tietokannan info
app.get("/info", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const numberOfPersons = persons.length;
      const currentDate = new Date();

      response.send(`
        <p>Phonebook has info for ${numberOfPersons} people</p>
        <p>${currentDate}</p>
      `);
    })
    .catch((error) => next(error));
});

// Virheenkäsittelijä
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "Malformatted ID" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
