const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/db/models/todo');
const { User } = require('./../server/db/models/user');

// if(!ObjectID.isValid(id)) {
// 	console.log('Id not valid');
// }

var id = '594fdd777160af32028a6171';

// Todo.find({
// 	_id: id
// }).then(todos => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then(todo => {
// 	console.log('Todo', todo);
// });

// Todo.findById(id).then(todo => {
// 	if(!todo)
// 		return console.log('Not found');
// 	console.log(todo)
// }).catch(e => {
// 	console.log(e)
// });

User.findById('594a9d05a983ae15f38b8118').then(user => {
	if(!user) 
		return console.log('User not find');
	console.log(user)
}).catch(e => {	
	console.log('Invalid Id', e);
})