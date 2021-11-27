const assert = require('chai').assert;
const database = require('../database.js');


//******************** URL Database functions *******************

describe("database.sortURLs", () => {

  it(`returns an object with sorted URLs when passed an unordered collection of URLs`, () => {
    const testUrls = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "rndmID" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "rndmID" },
    };
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "rndmID" },
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "rndmID" },
    };
    assert.deepEqual(database.sortURLs(testUrls), expectedOutput);
  });

  it(`returns a deeply equal object when passed a collection of sorted URLs`, () => {
    const testUrls = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "rndmID" },
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "rndmID" },
    };
    const expectedOutput = testUrls;
    assert.deepEqual(database.sortURLs(testUrls), expectedOutput);
  });

});

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

  it(`does not return URL objects when no user ID specified`, () => {
    const shortURL = database.addURL("http://test3.co.uk", "otherUserID");
    const urls = database.urlsForUser();
    assert.notExists(urls[shortURL]);
  });

});




//******************** User Database functions *******************

describe("database.validateUserID", () => {
  
  it(`returns true for a valid ID`, () => {
    const isValidUserID = database.validateUserID("rndmID");
    assert.strictEqual(isValidUserID, true);
  });

  it(`returns false for a non-extant ID`, () => {
    const isValidUserID = database.validateUserID("ivldID");
    assert.strictEqual(isValidUserID, false);
  });

});

describe("database.getUserByID", () => {
  
  it(`returns a user with a valid ID`, () => {
    const userID = database.getUserByID("rndmID");
    const expectedOutput = database.users["rndmID"];
    assert.strictEqual(userID, expectedOutput);
  });

  it(`returns undefined when passed an ID that's not in the database`, () => {
    const userID = database.getUserByID("ivldID");
    const expectedOutput = undefined;
    assert.strictEqual(userID, expectedOutput);
  });

});

describe("database.getUserByEmail", () => {
  
  it(`returns a user with a valid email`, () => {
    const userID = database.getUserByEmail("johannes@drweber.de");
    const expectedOutput = database.users["rndmID"];
    assert.strictEqual(userID, expectedOutput);
  });

  it(`returns undefined when passed an email that's not in the database`, () => {
    const userID = database.getUserByEmail("non.existent@email.com");
    const expectedOutput = undefined;
    assert.strictEqual(userID, expectedOutput);
  });

});

describe("database.validateUserID", () => {
  
  it(`returns true for a valid ID`, () => {
    const userID = database.validateUserID("rndmID");
    assert.strictEqual(userID, true);
  });

  it(`returns false for a non-extant ID`, () => {
    const userID = database.validateUserID("ivldID");
    const expectedOutput = false;
    assert.strictEqual(userID, expectedOutput);
  });

});

