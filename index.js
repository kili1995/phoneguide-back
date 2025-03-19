const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

morgan.token('body', req => {
    return req.body ? JSON.stringify(req.body) : "";
})

morgan.token('error', (req, res) => {
    return res.statusMessage;
})

const messageMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :body :error');

app.use(messageMiddleware);

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

app.use(requestLogger);

const persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    if (!id) {
        response.status(400).end("Id should be a number");
    }
    const phone = persons.find(p => p.id === id);
    response.json(phone);
});

app.get('/info', (request, response) => {
    const now = new Date();

    response.send(`
       <p>Phonebook has info for ${persons.length} people </p>
       <br />
       <p>${now.toLocaleString()}</p>        
    `);
});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    if (!id) {
        response.status(400).end("Id should be a number");
    }
    const person = persons.find(p => p.id === id);
    if (!person) {
        response.status(404).send(`Person with id '${id}' not found`);
    }
    persons = persons.filter(p => p.id !== id);
    response.status(204).end();
});

app.post('/api/persons', (request, response) => {
    const body = request.body;
    if (!body.name) {
        response.statusMessage = "Name should has a value";
        return response.status(400).send();
    }
    if (!body.number) {
        response.statusMessage = "Number should has a value";
        return response.status(400).send();
    }

    if (persons.some(p => p.name == body.name)) {
        response.statusMessage = "Name must be unique";
        return response.status(400).send();
    }

    const newPerson = {
        name: body.name,
        number: body.number,
        id: generateId()
    };
    persons.push(newPerson);
    response.json(newPerson);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

const generateId = () => {
    const idsArray = persons.map(x => x.id);
    const maxId = persons.length != 0 ? Math.max(...idsArray) : 0;
    return maxId + 1;
}
