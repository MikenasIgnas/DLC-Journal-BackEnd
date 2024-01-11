declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_PATH:         string
      TOKEN_KEY:          string
      SMTP_ADDRESS:       string
      SMTP_PORT:          number
      SENDER_ADDRESS:     string
      RECIPIENT_ADDRESS:  string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}