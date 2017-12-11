/* jshint esversion: 6 */

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

const server = require('../../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/POST User Sign Up (with JWT) ', () => {
  describe('validation test', () => {
    it(
      'should return \'all fields must be filled\' when user omits name field',
      (done) => {
        chai.request(server)
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send({
            email: 'larrystone@gmai.com',
            password: 'Hac'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('all fields must be filled');
            done();
          });
      });

    it(
      'should return \'all fields must be filled\' when user omits email field',
      (done) => {
        chai.request(server)
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send({
            name: 'olaminrewaju adeoye',
            password: 'Hackasdkbf'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('all fields must be filled');
            done();
          });
      });

    it(
      'should return \'all fields must be filled\' when user omits password field',
      (done) => {
        chai.request(server)
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send({
            name: 'lasjsd isvkvs faad',
            email: 'larrystone@gmai.com',
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('all fields must be filled');
            done();
          });
      });
  });

  describe('test', () => {
    it('should create a new user and return token', (done) => {
      chai.request(server)
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .send({
          name: 'Lawal Lanre',
          email: 'larrystone@gmai.com',
          password: 'Hacknets'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.all.deep.keys('message', 'token');
          expect(res.body.message).to.equal('Signup successful. Token generated');
          done();
        });
    });

    it('should return \'Email already taken\' error when using a picked email',
      (done) => {
        chai.request(server)
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send({
            name: 'Lawal Lanre',
            email: 'larrystone@gmai.com',
            password: 'Hacknets'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(409);
            expect(res.body.message).to.equal('Email already taken!');
            done();
          });
      });
  });


  describe('/POST Login validation test', () => {
    it(
      'should return \'email or password cannot be blank\' when user omits email field',
      (done) => {
        chai.request(server)
          .post('/api/auth/login')
          .set('Accept', 'application/json')
          .send({
            email: '',
            password: 'Hackasdkbf'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('email or password cannot be blank');
            done();
          });
      });

    it(
      'should return \'email or password cannot be blank\' when user omits password field',
      (done) => {
        chai.request(server)
          .post('/api/auth/login')
          .set('Accept', 'application/json')
          .send({
            email: 'larrystone@gmai.com',
            password: ''
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body.message).to.equal('email or password cannot be blank');
            done();
          });
      });
  });

  describe('/POST Login test', () => {
    it('should return \'Incorrect username or password\' error when user is not registered', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          email: 'unknownUser@gmai.com',
          password: 'Hacknets'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.all.deep.keys('message');
          expect(res.body.message).to.equal('Incorrect username or password');
          done();
        });
    });
    it('should return \'Incorrect username or password\' error when user enters a wrong password', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          email: 'larrystone@gmai.com',
          password: 'wrongPassword'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.all.deep.keys('message');
          expect(res.body.message).to.equal('Incorrect username or password');
          done();
        });
    });
    it('should login user and return token', (done) => {
      chai.request(server)
        .post('/api/auth/login')
        .set('Accept', 'application/json')
        .send({
          email: 'larrystone@gmai.com',
          password: 'Hacknets'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.all.deep.keys('message', 'token');
          expect(res.body.message).to.equal('login successful');
          done();
        });
    });
  });

  describe('GET/ Search Users', () => {
    it('should return error if query is empty', (done) => {
      chai.request(server)
        .get('/api/search/users')
        .set('Accept', 'application/json')
        .end((err, res) => {
          res.should.be.json;
          res.body.should.be.a('object');
          res.should.have.status(400);
          res.body.should.have.property('message').equal('Nothing to search');
          done();
        });
    });

    it('should return users found', (done) => {
      chai.request(server)
        .get('/api/search/users?q=larrystone@gmai.com')
        .set('Accept', 'application/json')
        .end((err, res) => {
          res.should.be.json;
          res.body.should.be.a('object');
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('GET/ Send Invites to 11 other Users', () => {
    it('should send invites to other 11 users', (done) => {
      chai.request(server)
        .set('Accept', 'application/json')
        .post('api/users/invite', {
          gameLink: 'http:www.game.ling.com',
          emal: 'someemail@gmain.com'
        })
        .end((err, res) => {
          res.should.bd.jons
          res.should.have.status(200);
          done();
        });
    });
  });

  after((done) => {
    mongoose.connection.db.dropDatabase(done);
  });
});
