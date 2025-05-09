# ridlix-games-be-test
This is a back-end example of Ridlix games token implementation. 
It's a simple Node.js server with a token request example (connection to games.ridlix.com) and serving your client.

## Authentication
All API requests require authentication using an API key. 
You will receive your API key when you sign up for a Ridlix account.

## API Key
Include your API key in the X-API-Key header for all requests:

```X-API-Key: key_20b2124905c556af9e61ee40c529133d```

## Client ID

Your client ID is required for token generation and should be included in the request body:

```{"clientId": "client_3908689ddacb5fa7", ...}```


Important Security Notes:

`Never expose your API key in client-side code. Always keep it secure on your server. Requests to the Ridlix API should always be made from your server, not directly from the client.`
