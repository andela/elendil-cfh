/* jshint esversion: 6 */

/**
 * Module dependencies.
 */
const should = require('should'),
  app = require('../../server'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

// Globals
let user;

// The tests
describe('<Unit Test>', () => {
  describe('Model User:', () => {
    before((done) => {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      describe('Method Save', function () {
        it('should be able to save whithout problems', function (done) {
          user.save(function (err) {
            should.not.exist(err);
            done();
          });
        });

        it('should be able to show an error when try to save witout name', function (done) {
          user.name = '';
          user.save(function (err) {
            should.exist(err);
            done();
          });
        });
      });
    });

    it('should be able to show an error when try to save without name', (done) => {
      user.name = '';
      user.save((err) => {
        should.exist(err);
        done();
      });
    });
  });

  after((done) => {
    done();
  });
});
