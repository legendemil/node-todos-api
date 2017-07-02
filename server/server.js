require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./db/models/todo');
var { User } = require('./db/models/user');
var {authenticate} = require('./middleware/authenticate');

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

	let body = _.pick(req.body, ['email', 'password']);
	let newUser = new User(body);

	newUser.save().then(() => {
		return newUser.generateAuthToken();
	}).then(token => {
		res.header('x-auth', token).send(newUser);
	}).catch(e => {
		return res.status(400).send(e);
	});

});




app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});


app.listen(port, () => {
	console.log('Started on port', port);
});

module.exports = {
	app
}