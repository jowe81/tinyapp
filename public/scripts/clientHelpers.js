//clientHelpers.js: class with client-side helper functions

class ClientHelpers {

  //Take in jQuery object, and location
  constructor(jQ, location) {
    this.jQ = jQ;
    this.location = location;
  }

  //Return URL parameter param or false
  urlParam(param) {
    const urlParams = new URLSearchParams(this.location.search);
    for (const [key, value] of urlParams) {
      if (key === param) {
        return value;
      }
    }
    return false;
  }

  //Focus UI field input with selector selector and position cursor at end
  cursorToEndOfInput(selector) {
    const inputField = this.jQ(selector);
    const value = inputField.val();
    //If changing the value after focusing the field, the cursor will go to the end
    inputField.focus().val('').val(value);
  }

  textToClipboard(inputField) {
    console.log(inputField);
    //Selet text in field
    inputField.select();
    //Copy
    navigator.clipboard.writeText(inputField.value);
  }

}