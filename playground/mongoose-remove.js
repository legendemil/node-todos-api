const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/db/models/todo');
const { User } = require('./../server/db/models/user');

// Todo.remove({}).then(res => {
// 	console.log('remove all todos');
// }).catch(e => {
// 	console.log(e);
// });

// Todo.findOneAndRemove



Todo.findByIdAndRemove('sdf').then(doc => {

}).catch(e => {

});