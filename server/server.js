var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./db/models/todo');
var { User } = require('./db/models/user');

var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then(doc => {
		res.send(doc);
	}).catch(err => {
		res.status(400).send(err);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}).catch((err) => {
		res.status(400).send(err);
	});
});

app.get('/todos/:id', (req, res) => {
	var { id } = req.params;
	
	if(!ObjectID.isValid(id))
		return res.status(404).send();

	Todo.findById(id).then(todo => {
		if(!todo)
			return res.status(404).send();
		res.send({
			todo
		});
	}).catch(e => {
		res.status(400).send();
	});

});

app.delete('/todos/:id', (req, res) => {
	let { id } = req.params;

	if(!ObjectID.isValid(id))
		return res.status(404).send();

	Todo.findByIdAndRemove(id).then(todo => {
		if(todo)
			return res.status(200).send({todo});
		req.status(404).send();
	}).catch(e => {
		res.status(404).send();
	});

});


app.listen(port, () => {
	console.log('Started on port', port);
});

module.exports = {
	app
}