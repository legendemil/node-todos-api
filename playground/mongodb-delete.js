const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if(err) {
		return console.log('Unable to connect to MongoDB server');
	};
	console.log('Connected to MongoDB server');
	
	// db.collection('Todos').deleteMany({
	// 	text: 'Eat lunch'
	// }).then(res => {
	// 	console.log(res);
	// });

	// db.collection('Todos').deleteOne({
	// 	text: 'Eat lunch'
	// }).then(res => {
	// 	console.log(res)
	// });

	// db.collection('Todos').findOneAndDelete({
	// 	completed: false
	// }).then(res => {
	// 	console.log(res)
	// });

	// db.collection('Users').deleteMany({
	// 	location: 'Lublin'
	// }).then(res => {
	// 	console.log(res)
	// });

	db.collection('Users').findOneAndDelete({
		_id: ObjectID('594945e091fcdacd0aa50070')
	}).then(res => {
		console.log(res);
	})
	// db.close();
});