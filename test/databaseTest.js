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




//******************** Analytics Database functions *******************

describe("database.getVisits", () => {

  const testPath = "/urls";
  const testVisitor = "testVisitorID";

  it(`returns an empty array for a page that hasn't been visited by a given visitor`, () => {
    assert.deepEqual(database.getVisits(testPath, testVisitor), []);
  });

  //Implicitly does some testing for registerVisit() as well
  it(`returns only visit objects for visits page visits by a given visitor`, () => {
    database.registerVisit(testPath, testVisitor);
    database.registerVisit(testPath, "otherVisitor");
    database.registerVisit(testPath, testVisitor);
    const visits = database.getVisits(testPath, testVisitor);
    assert.equal(visits.length, 2);
  });

});

describe("database.uniqueVisitorsCount", () => {

  const testPath = "/some/page";
  const testVisitor = "testVisitorID";

  it(`returns 0 for a page that has never been visited`, () => {
    assert.equal(database.uniqueVisitorsCount(testPath), 0);
  });
  
  //Implicitly does some testing for getUniqueVisitors() as well
  it(`returns # of unique visitors for a given page`, () => {
    database.registerVisit(testPath, testVisitor);
    database.registerVisit(testPath, "otherVisitor");
    database.registerVisit(testPath, "otherVisitor2");
    database.registerVisit(testPath, testVisitor);
    assert.equal(database.uniqueVisitorsCount(testPath), 3);
  });

});

describe("database.getAnalytics", () => {

  const testPath = "/some/other/page/yet";
  const testVisitor = "anotherTestVisitorID";

  it(`returns a properly initiated object for a page that has not been visited`, () => {
    const analytics = database.getAnalytics("/some/path");
    assert.isObject(analytics);
    assert.equal(analytics.uniqueVisitorsCount, 0);
    assert.equal(analytics.totalVisits, 0);
    assert.isArray(analytics.visits);
    assert.equal(analytics.visits.length, 0);
  });

  it(`returns visit data for a given page`, () => {
    database.registerVisit(testPath, testVisitor);
    database.registerVisit(testPath, "otherVisitor3");
    database.registerVisit(testPath, "otherVisitor3");
    database.registerVisit(testPath, testVisitor);

    const analytics = database.getAnalytics(testPath);
    assert.isObject(analytics);
    assert.equal(analytics.uniqueVisitorsCount, 2);
    assert.equal(analytics.totalVisits, 4);
    assert.isArray(analytics.visits);
    assert.equal(analytics.visits.length, 4);
  });

});