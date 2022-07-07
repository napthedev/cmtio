# Self Hosting

Here are the steps to self-host cmtio

### Google OAuth credentials

- Go to [console.cloud.google.com/](https://console.cloud.google.com/)
- Create a new project
- Go to "API & Services" -> OAuth Content Screen
  - Enter the app name, email, and the authorized domains \| Save and continue
  - Add "auth/userinfo.email" and "auth/userinfo.profile" to the scope \| Save and continue
  - Continue to dashboard
- Press "PUBLISH APP"
- Go to Credentials
  - Create credentials -> OAuth client ID
    - Application type: "Web application"
      - Add "http://localhost:3000" to authorized javascript origins
      - Add "http://localhost:3000/api/auth/callback/google" to Authorized redirect URIs
- Copy the client id and secret and use as the env. See [.env.example](/.env.example)

### Facebook OAuth credentials

- Go to [developers.facebook.com/apps/create/](https://developers.facebook.com/apps/create/) to create an app of type "Consumer"
- Enter the app name and create the app
- Go to Settings -> Basic, copy the App ID and App Secret to the env. See [.env.example](/.env.example)
- Go to [freeprivacypolicy.com/free-privacy-policy-generator](https://www.freeprivacypolicy.com/free-privacy-policy-generator/) to create a new privacy policy and copy the URL into the Privacy Policy URL field in the Facebook settings
- Go to [freeprivacypolicy.com/free-terms-and-conditions-generator](https://www.freeprivacypolicy.com/free-terms-and-conditions-generator/) to create new terms of service and copy the URL into the Terms of Service URL field in the Facebook settings
- Go to [gdprprivacynotice.com](https://www.gdprprivacynotice.com/) to create a User data deletion policy and copy the URL into the data deletion instructions URL field in the Facebook settings
- Click add product in the sidebar
  - Click on "Setup" on Facebook login
  - Click on "Facebook Login" -> "Settings" in the left sidebar
  - Add "https://localhost:3000/api/auth/callback/facebook" to "Valid OAuth Redirect URIs"
  - Save changes
- Change App Mode in the header to "Live".

### Github OAuth credentials

- Go to [github.com/settings/apps](https://github.com/settings/apps) and create a new app
- Enter the app name, Homepage URL, and "https://localhost:3000/api/auth/callback/github" as the Callback URL
- Uncheck Active in the Webhook section
- In the "User permissions" section
  - Set "Email addresses" to "Read-only"
  - Set "Profile" to "Read and write"
- Where can this GitHub App be installed? "Any account"
- Press create GitHub app
- Press "Generate a new client secret"
- Copy the client id and secret and use them as the env. See [.env.example](/.env.example)

### Setup FaunaDB database

- Go to [dashboard.fauna.com](https://dashboard.fauna.com/) and create an account
- Press "CREATE DATABASE"
  - Enter the app name
  - Set the region group to "Classic"
- Copy and paste this command to the faunadb shell to create the collections required: [import_collections.js](/faunadb/import_collections.js)
- Copy and paste this command to the faunadb shell to create the indexes required: [import_indexes.js](/faunadb/import_indexes.js)
- Go to the "Security" tab and create a new key
  - Select role: "server"
- Copy to key to env. See [.env.example](/.env.example)

### Demo site ID

- Run the application locally
- Register a new account with Google, Facebook or GitHub
- Create a new site
- Copy the site ID to the NEXT_PUBLIC_DEMO_SITE_ID
- Restart the server and try going to http://localhost:3000/demo

### Deployment

- Just deploy to Vercel or Netlify with those environment variables
- Remember to add the URL deployed to the authorized redirect URLs in Google, Facebook and GitHub

### Question

- Try to submit an issue on the repo or contact me.
