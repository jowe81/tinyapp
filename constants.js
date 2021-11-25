const constants = {

  PORT: 8080,

  //Minimum password length required for user registration
  MIN_PASSWORD_LENGTH: 6,

  //Length for auto-generated random IDs
  ID_LENGTH: 6,

  //Salt rounds for hashing
  SALT_ROUNDS: 10,

  FLASH_MESSAGES: {

    //Messages related to login/logout
    LOGIN: {
      WELCOME: "Welcome! TinyApp lets you shorten and store URLs. Register or login to begin.",
      WELCOME_BACK: "Welcome back! Login to view and store your URLs.",
      GOODBYE: "You logged out successfully. Goodbye!",
    },

    //Messages related to creating new short-URLs
    NEW_URL: {
      NOTHING_ENTERED: "Looks like you did not enter anything - please enter a valid URL to shorten.",
      BAD_URL: "You entered an invalid URL. Please try again.",
    }
    
  }
};

module.exports = constants;