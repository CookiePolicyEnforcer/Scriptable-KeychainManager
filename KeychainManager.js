/*
 * This script provides an easy and secure way to manage accounts in the Scriptable keychain
 * through a user-friendly login UI.
 *
 * Simply copy and paste the entire code into your own script and change SCRIPT_ID to something unique
 * (e.g., the name of your script).
 *
 * Example:
 *   const credentials = await new KeychainManager().getCredentials()
 *   log(credentials)    // credentials = {user:'username', pass:'password'}
 *
 * Author: CookiePolicyEnforcer
 * Date: April 2023
 */

const SCRIPT_ID = 'script_name' // Used to store credentials -> change to something unique
const REMEMBER_ENABLED = true   // true = show "remember login"-alert -> login window will be skipped next time

class KeychainManager {
  // Launches login UI and returns credentials-object {user:'username', pass:'password'}
  // or returns undefined if user presses "cancel" or if there is an error
  async getCredentials() {
    if (REMEMBER_ENABLED
      && Keychain.contains(SCRIPT_ID + 'rememberUser')
      && Keychain.contains(SCRIPT_ID + 'rememberPass')
    ) {
      return {
        user: Keychain.get(SCRIPT_ID + 'rememberUser'),
        pass: Keychain.get(SCRIPT_ID + 'rememberPass')
      }
    }
    if (!REMEMBER_ENABLED) {
      this.forgetCredentials()
    }

    let credentials = await new LoginAlert()

    // if credentials are wrong -> show login-alert again
    while (
      credentials != undefined
      && !('new' in credentials)
      && !this.credentialsExist(credentials.user, credentials.pass)
    ) {
      credentials = await new LoginAlert('Error', 'Wrong username or password')
    }

    if (credentials != undefined) {
      // if user presses 'register-button' -> safe credentials if they don't exist
      if ('new' in credentials) {
        if (this.credentialsExist(credentials.user, credentials.pass)) {
          await new DecisionAlert(
            'Error while registering',
            'This account already exists',
            'OK'
          )
          return undefined
        }
        this.saveCredentials(credentials.user, credentials.pass)
        let accept = await new DecisionAlert(
          'New Account registered',
          'Your credentials have been stored in the keychain',
          'OK',
          'Cancel'
        )
        // if user presses "Cancel"-button -> delete credentials
        if (!accept) {
          this.deleteCredentials(credentials.user, credentials.pass)
          return undefined
        }
      }
      // if remember is enabled + user presses "Yes"-button -> remember credentials
      if (REMEMBER_ENABLED) {
        let remember = await new DecisionAlert(
          'Remember your Login?',
          '',
          'Yes',
          'No'
        )
        if (remember) {
          this.rememberCredentials(credentials.user, credentials.pass)
        }
      }
    }

    return credentials
  }

  // Returns true if credentials exist in keychain
  credentialsExist(user, pass) {
    try {
      return user === Keychain.get(SCRIPT_ID + user) && pass === Keychain.get(SCRIPT_ID + user + pass)
    } catch (err) {
      return false
    }
  }

  // Saves credentials in keychain using a secure key
  // Already existing credentials will be overwritten
  saveCredentials(user, pass) {
    Keychain.set(SCRIPT_ID + user, user)
    Keychain.set(SCRIPT_ID + user + pass, pass)
  }

  // Saves credentials in keychain using an insecure key
  // Will be used if REMEMBER_ENABLED = true
  rememberCredentials(user, pass) {
    Keychain.set(SCRIPT_ID + 'rememberUser', user)
    Keychain.set(SCRIPT_ID + 'rememberPass', pass)
  }

  // Deletes the credentials saved with rememberCredentials(), so they can't be used to bypass the login UI
  // Returns true if credentials were deleted successfully
  forgetCredentials() {
    try {
      Keychain.remove(SCRIPT_ID + 'rememberUser')
      Keychain.remove(SCRIPT_ID + 'rememberPass')
    } catch (err) {
      return false
    }
    return true
  }

  // Returns true if credentials were deleted successfully
  deleteCredentials (user, pass) {
    try {
      Keychain.remove(SCRIPT_ID + user)
      Keychain.remove(SCRIPT_ID + user + pass)
    } catch (err) {
      return false
    }
    return true
  }
}

// Shows a login-alert with username and password text-fields
// Returns a promise with the entered credentials if pressed "login" or undefined if pressed "cancel"
class LoginAlert {
  constructor(title, message) {
    this.alert = new Alert()

    if (title != undefined) {
      this.alert.title = title
    } else {
      this.alert.title = 'Login'
    }
    if (message != undefined) {
      this.alert.message = message
    } else {
      this.alert.message = 'Enter your username and password'
    }

    this.alert.addTextField('username', '')
    this.alert.addSecureTextField('password', '')
    this.alert.addAction('Login')
    this.alert.addAction('Register')
    this.alert.addCancelAction('Cancel')

    return this.alert.present().then((action) => {
      // pressed login button -> return credentials
      if (action == 0) {
        return (this.getValues())
      }
      // pressed register button -> return credentials + new = true
      else if (action == 1) {
        let credentials = this.getValues()
        credentials.new = true
        return credentials
      }
      // pressed cancel button -> return undefined
      else {
        return undefined
      }
    })
  }

  getValues() {
    let username = this.alert.textFieldValue(0)
    let password = this.alert.textFieldValue(1)
    return { user: username, pass: password }
  }
}

// Shows an alert with yes and no buttons. Returns a promise with true if pressed "yes" or false if pressed "no"
// If no text is passed, it will show an alert with only an "OK"-button
class DecisionAlert {
  constructor (title, message, yes_text, no_text) {
    this.alert = new Alert()

    if (title == undefined || message == undefined) {
      throw new Error('Undefined title or message')
    }
    this.alert.title = title
    this.alert.message = message

    if (yes_text != undefined) {
      this.alert.addAction(yes_text)
    }
    if (no_text != undefined) {
      this.alert.addCancelAction(no_text)
    }
    if (yes_text == undefined && no_text == undefined) {
      this.alert.addAction('OK')
    }

    return this.alert.present().then((action) => {
      // pressed yes button -> return true
      if (action == 0) {
        return true
      }
      // pressed no button -> return false
      else {
        return false
      }
    })
  }
}
