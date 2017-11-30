/* jshint esversion: 6 */

let chai = require('chai'),
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
  after((done) => {
    mongoose.connection.db.dropDatabase(done);
  });
});
