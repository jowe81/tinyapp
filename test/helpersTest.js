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

describe("helpers.verifyURL", () => {

  const testURL = "http://www.lighthouselabs.ca";
  it(`returns ${testURL} when given ${testURL} as input`, () => {
    assert.equal(helpers.verifyURL(testURL), testURL);
  });

  const testURL0 = "www.lighthouselabs.ca";
  const testURL0Verified = "http://www.lighthouselabs.ca";
  it(`returns ${testURL0Verified} when given ${testURL0} as input`, () => {
    assert.equal(helpers.verifyURL(testURL0), testURL0Verified);
  });

  const testURL2 = "http://www.we-are-online.com/hello/1/morning.html";
  it(`returns ${testURL2} when given ${testURL2} as input`, () => {
    assert.equal(helpers.verifyURL(testURL2), testURL2);
  });

  const testURL3 = "HTTP://WWW.GETTHETIME.COM/time.html?timezone=DST";
  const testURL3Verified = testURL3;
  it(`returns ${testURL3Verified} when given ${testURL3} as input`, () => {
    assert.equal(helpers.verifyURL(testURL3), testURL3Verified);
  });

  const testURL4 = "http://www.lighthouselabs.ca:/path";
  const testURL4Verified = testURL4;
  it(`returns ${testURL4Verified} when given ${testURL4} as input`, () => {
    assert.equal(helpers.verifyURL(testURL4), testURL4Verified);
  });

  const testURL5 = "http://cnn.com/";
  const testURL5Verified = "http://cnn.com/";
  it(`returns ${testURL5Verified} when given ${testURL5} as input`, () => {
    assert.equal(helpers.verifyURL(testURL5), testURL5Verified);
  });

  const testURL6 = "http:/cnn.com";
  const testURL6Verified = "http://cnn.com";
  it(`returns ${testURL6Verified} when given ${testURL6} as input`, () => {
    assert.equal(helpers.verifyURL(testURL6), testURL6Verified);
  });

  const badURLs = ["http://cnn.", "http://extra.c", "nytimes.", "(604) 123-4567", "54*(&%S"];

  for (let url of badURLs) {
    it(`returns false when given ${url} as input`, () => {
      assert.equal(helpers.verifyURL(url), false);
    });
  }

});