const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../db/models/todo');
const {User} = require('./../db/models/user');

const todos = [{
	_id: new ObjectID(),
	text: 'First test todo'
}, {
	_id: new ObjectID(),
	text: 'Second test todo',
	completed: true,
	completedAt: 333
	
}];

beforeEach(done => {

	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	})
	.then(() => done());

});

describe('POST /todos', () => {

	it('should create a new todo', (done) => {
		var text = 'Test todo text';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}

				Todo.find({text}).then(todos => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch(err => done(err));

			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end((err, res) => {
				if(err) {
					return done(err);
				}
				
				Todo.find().then(todos => {
					expect(todos.length).toBe(2);
					done();
				}).catch(err => done(err));
			});
	});

});


describe('GET /todos', () => {
	
	it('should get all todos', done => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});

});

describe('GET /todos/:id', () => {
	
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);

	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.send()
			.expect(404)
			.end(done);
	});

	it('should return 404 for non Object IDs', (done) => {
		request(app)
			.get(`/todos/123`)
			.send()
			.expect(404)
			.end(done);
	});

});

describe('DELETE /todos/:id', () => {

	it('should remove a todo', done => {
		let hexId = todos[1]._id.toHexString();

		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if(err)
					return done(err);

				Todo.findById(hexId).then(todo => {
					expect(todo).toNotExist();
					done();
				}).catch(e => done(err));
			});
	});
	
	it('should return 404 if todo not found', done => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done);
	});

	it('should return 404 if object id is invalid', done => {
		request(app)
			.delete(`/todos/123`)
			.expect(404)
			.end(done);
	});

});


describe('PATCH /todos/:id', () => {
	
	let id = todos[1]._id.toHexString();

	it('should update the todo', done => {
		let newTodo = {
			text: 'Updated todo',
			completed: true
		};		

		request(app)
			.patch(`/todos/${id}`)
			.send(newTodo)
			.expect(200)
			.expect(res => {
				let { todo } = res.body;
				expect(todo.text).toBe(newTodo.text);
				expect(todo.completed).toBe(newTodo.completed);
			}).end(done);

	});

	it('should clear completedAt when todo is not completed', done => {
		let newTodo = {
			text: 'Updated todo',
			completed: false
		};
		request(app)
			.patch(`/todos/${id}`)
			.send(newTodo)
			.expect(200)
			.expect(res => {
				expect(res.body.todo.completedAt).toBe(null);
			})
			.end(done);
	});

});

describe('POST /users', () => {

	before(done => {
		User.remove({}).then(() => done());
	});

	let user = {
		"email": "mike@gmail.com",
		"password": "zaq1@WSX",
		"tokens": [{
			"access": "auth",
			"token": "sfsdfdgfdgdfgdfgfdfdg"
		}]
	};	

	it('should return new user object on success', (done) => {
		request(app)
			.post('/users')
			.send(user)
			.expect(200)
			.expect(res => {
				let { email, password } = res.body.user;
				expect(email).toBe(user.email);
				expect(password).toBe(user.password);
			})
			.end(done);
	});

	it('should not return new user if email is not unique', done => {
		request(app)
			.post('/users')
			.send(user)
			.expect(400)
			.end(done);
	});

	it('should not return new user if the does not have specified email, password', done => {
		request(app)
			.post('/users')
			.send({})
			.expect(400)
			.end(done);
	});

});