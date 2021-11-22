const assert = require('chai').assert;
const helpers = require('../helpers');
const database = require('../database.js');

describe("helpers.emailExists", () => {

  const testEmail = "example@email.com";
  it(`returns false when looking for an email address that is not yet registered (${testEmail})`, () => {
    assert.isFalse(helpers.emailExists(database.users, testEmail));
  });

  it(`returns true when looking for an email address that is already registered (${testEmail})`, () => {
    database.addUser(testEmail, "somepassword");
    assert.isTrue(helpers.emailExists(database.users, testEmail));
  });

});