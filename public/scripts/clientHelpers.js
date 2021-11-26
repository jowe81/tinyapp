//clientHelpers.js: call at the end of the footer partial

//Return URL parameter param or false
const urlParam = (param) => {
  const urlParams = new URLSearchParams(location.search);
  for (const [key, value] of urlParams) {
    if (key === param) {
      return value;
    }
  }
  return false;
};

//Focus UI field input with selector selector and position cursor at end
const cursorToEndOfInput = (selector) => {
  const inputField = $(selector);
  const value = inputField.val();
  //If changing the value after focusing the field, the cursor will go to the end
  inputField.focus().val('').val(value);
};
