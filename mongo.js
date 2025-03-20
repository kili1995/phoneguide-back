const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument');
    process.exit(1);
}

const password = process.argv[2];

const url =
    `mongodb+srv://jorgecapello1995:${password}@phoneguidecluster.brmct.mongodb.net/phoneguide?retryWrites=true&w=majority&appName=PhoneGuideCluster`;

mongoose.set('strictQuery', false)

mongoose.connect(url).then(() => {
    const personSchema = new mongoose.Schema({
        name: String,
        number: String,
    });

    const Person = mongoose.model('Person', personSchema)

    let personsToAdd = [
        { name: "Jorge Capello", number: "3564-692764" },
        { name: "Sofía Vilosio", number: "3564-649368" },
        { name: "Nora Ferreyra", number: "3564-692782" },
        { name: "Giovanna Capello", number: "3564-692767" }
    ];

    let persons = personsToAdd.map(p => new Person({ name: p.name, number: p.number }));

    return Person.insertMany(persons);
}).then(() => {
    console.log("All persons saved successfully");
}).catch(err => {
        console.error("Error:", err);
})
.finally(() => {
    mongoose.connection.close();
});