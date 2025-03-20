require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());

app.use(express.static('dist'));

app.use(cors());

morgan.token('body', req => {
    return req.body ? JSON.stringify(req.body) : "";
})

morgan.token('error', (req, res) => {
    return res.statusMessage;
})

const messageMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :body :error');

const catchMongoDBError = (response, action, error, id = null) => {
    let message = `${action} error. ${error.message}.`;
    if(id){
        message += ` id ${id}`;
    }
    console.log(message);
    response.status(500).end();
}

app.use(messageMiddleware);

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

app.use(requestLogger);

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result);
    }).catch(error => catchMongoDBError(response, 'get all', error));
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    Person.findById(id).then((person) => {
        if(!person){
            response.status(404).end();
        }
        response.json(result);
    }).catch(error => catchMongoDBError(response, 'get by id', error, id));
});

app.get('/info', (request, response) => {
    const now = new Date();
    Person.find({}).then(result => {
        response.send(`
            <p>Phonebook has info for ${result.length} people </p>
            <br />
            <p>${now.toLocaleString()}</p>        
        `);
    }).catch(error => catchMongoDBError(response, 'get info page', error));
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    if (!id) {
        response.status(400).end("Id is required");
    }

    Person.findByIdAndDelete(id).then(result => {
        console.log('Person deleted successfuly');
        response.status(204).end();
    }).catch(error => catchMongoDBError(response, 'delete', error, id));
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
    Person.find({ name: body.name }).then(result => {
        if (result.length != 0) {
            response.statusMessage = "Name must be unique";
            return response.status(400).send();
        }

        const person = new Person({
            name: body.name,
            number: body.number
        });
        person.save().then(result => {
            console.log('Person saved successfuly');
            response.json(result);
        }).catch(error => catchMongoDBError(response, 'create', error));
    }).catch(error => catchMongoDBError(response, 'get by name', error));    
});

app.put('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const body = request.body;
    Person.findById(id).then(person => {
        if(person){
            Person.updateOne({_id: id}, {number: body.number, name: person.name}).then(result => {
                console.log("Number updated successfuly");
            }).catch(error => catchMongoDBError(response, 'update', error, id));
        }
    }).catch(error => catchMongoDBError(response, 'get by id', error, id));
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};
app.use(unknownEndpoint);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
