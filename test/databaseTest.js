const assert = require('chai').assert;
const database = require('../database.js');

describe("database.urlsForUser", () => {

  const testUserID = "rndmID";
  it(`returns URL objects that belong to user (${testUserID})`, () => {
    const shortURL = database.addURL("http://test1.com", testUserID);
    const urls = database.urlsForUser(testUserID);
    assert.exists(urls[shortURL]);
  });

  it(`does not return URL objects that do not belong to user (${testUserID})`, () => {
    const shortURL = database.addURL("http://test3.co.uk", "otherUserID");
    const urls = database.urlsForUser(testUserID);
    assert.notExists(urls[shortURL]);
  });

});