require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const Person = require("./models/person");

app.use(cors());
app.use(express.static("dist"));

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).json({ error: "Person not found" });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  return Math.floor(Math.random() * 100000);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or number is missing",
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
