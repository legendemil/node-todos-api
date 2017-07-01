require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./db/models/todo');
var { User } = require('./db/models/user');

var app = express();

var port = process.env.PORT;

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

app.patch('/todos/:id', (req, res) => {
	let { id } = req.params;
	let body = _.pick(req.body, ['text', 'completed']);

	if(!ObjectID.isValid(id))
		return res.status(404).send();

	if(_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, { $set: body}, {new: true}).then(todo => {
		if(!todo)
			return res.status(404).send();

		res.send({todo});
	}).catch(e => {
		res.status(400).send();
	});
});


app.post('/users', (req, res) => {
	// add user
		// if goes well
			// return user
	let user = _.pick(req.body, ['email', 'password', 'tokens']);
	let newUser = new User(user);

	newUser.save().then(user => {
		if(!user)
			return res.status(400).send();
		res.status(200).send({user});
	}).catch(e => {
		return res.status(400).send();
	});

});


app.listen(port, () => {
	console.log('Started on port', port);
});

module.exports = {
	app
}