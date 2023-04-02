# Scriptable KeychainManager

<p align="center">
 <img src="https://user-images.githubusercontent.com/120395252/229361503-142573da-1813-4c45-b2b3-64583b7c7829.jpeg" style= "max-height: 250px;">
 <br/>
</p>

This script provides an easy and secure way to manage accounts in the Scriptable keychain. It features a user-friendly login UI and allows users to store, retrieve, update, and delete login credentials. The login UI can be bypassed using the "remember login" function for convenience, but at the cost of security (as long as no one else has access to this script, your credentials remain secure).

## Usage
To use this script in your own Scriptable-script, simply copy and paste the entire code. Then change the `SCRIPT_ID` to something unique (e.g., the name of your script).

### Example:
```javascript
const credentials = await new KeychainManager().getCredentials()
log(credentials)    // Output: {user:'username', pass:'password'}
```
`getCredentials()` launches the login UI, which also allows registering a new account, and returns the saved credentials.
