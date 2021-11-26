const constants = {

  PORT: 8080,

  //Minimum password length required for user registration
  MIN_PASSWORD_LENGTH: 6,

  //Length for auto-generated random generic IDs (used for short-URLs)
  ID_LENGTH: 6,

  //Length for auto-generated random user IDs
  USERID_LENGTH: 6,

  //Length for auto-generated random session IDs
  SESSIONID_LENGTH: 64,

  //Salt rounds for hashing
  SALT_ROUNDS: 10,

  FLASH_MESSAGES: {

    //Messages related to login/logout
    LOGIN: {
      WELCOME: "Welcome! TinyApp lets you shorten and store URLs. Register or login to begin.",
      WELCOME_BACK: "Welcome back! Login to view and store your URLs.",
      BAD_CREDENTIALS: {
        message: "Invalid or missing credentials. Please try again.",
        type: "alert-warning",
      },
      GOODBYE: "You logged out successfully. Goodbye!",
    },

    //Messages related to creating new short-URLs
    NEW_URL: {
      NOTHING_ENTERED: {
        message: "Looks like you did not enter anything - please enter a valid URL to shorten.",
        type: "alert-warning"
      },
      BAD_URL: {
        message: "You entered an invalid URL. Please try again.",
        type: "alert-warning",
      },
      SUCCESS: {
        message: "TinyURL created successfully.",
        type: "alert-success"
      }
    },

    //Messages related to the index page (list of URLs)
    URL_INDEX: {
      NO_RECORDS: `Looks a bit empty here. Why don't you <a href="/urls/new">add a new URL</a>?`,
    },

    //Messages related to user registration
    REGISTER: {
      WELCOME_BEFORE: "To register a TinyApp account, please enter your email address and a password (8 characters or longer)",
      WELCOME_AFTER: {
        message: "Registration successful - Welcome to TinyApp!",
        type: "alert-success",
      },
      EMAIL_INVALID: {
        message: "Invalid email address and/or password too short.",
        type: "alert-warning",
      },
      EMAIL_EXISTS: {
        message: `This email address has alread been registered. <a href="/login">Login</a> or register with a different email.`,
        type: "alert-warning",
      }

    }
    
  }
};

module.exports = constants;