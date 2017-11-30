/* jshint esversion: 6 */

var chai = require('chai'),
  chaiHttp = require('chai-http'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

var server = require('../../server');

var expect = chai.expect;

chai.use(chaiHttp);

describe('/POST User Sign Up (with JWT) ', () => {
  describe('validation test', () => {
    it('should return \'all fields must be filled\' when user omits name field',
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

    it('should return \'all fields must be filled\' when user omits email field',
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

    it('should return \'all fields must be filled\' when user omits password field',
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
          expect(res.body).to.have.all.deep.keys(
            'message', 'token');
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

  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });
});
