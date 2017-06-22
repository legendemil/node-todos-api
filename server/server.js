var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./db/models/todo');
var { User } = require('./db/models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then(doc => {
		res.send(doc);
	}).catch(err => {
		res.status(400).send(e);
	});
});


app.listen(3000, () => {
	console.log('Started on port 3000');
});
