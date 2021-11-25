const constants = {

  PORT: 8080,

  //Minimum password length required for user registration
  MIN_PASSWORD_LENGTH: 6,

  //Length for auto-generated random IDs
  ID_LENGTH: 6,

  //Salt rounds for hashing
  SALT_ROUNDS: 10,

  FLASH_MESSAGES: {
    LOGIN: {
      WELCOME: "Welcome! TinyApp lets you shorten and store URLs. Register or login to begin.",
      WELCOME_BACK: "Welcome back! Login to view and store your URLs.",
      GOODBYE: "You logged out successfully. Goodbye!",
    },
    
  }
};

module.exports = constants;