const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../db/models/todo');
const {User} = require('./../db/models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /users/me', () => {
	it('should return user if authenticated', done => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', done => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect(res => {
				expect(res.body).toEqual({});
			})
			.end(done);
	})
});


describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = '123mb!';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect(res => {
				expect(res.headers['x-auth']).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if(err) {
					return done(err);
				}

				User.findOne({email}).then(user => {
					expect(user).toExist();
					expect(user.password).toNotBe(password);
					done();
				})
			});
	});

	it('should return validation errors if request invalid', done => {
		request(app)
			.post('/users')
			.send()
			.expect(400)
			.end(done);
	});

	it('should not create user if email in use', done => {
		request(app)
			.post('/users')
			.send({email: users[0].email, password: '123abc'})
			.expect(400)
			.end(done)
	});
});