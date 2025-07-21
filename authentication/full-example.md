# Skapi HTML Authentication Template

This is a plain HTML template for Skapi's authentication features.

This template packs all the authentication features you can use in your HTML application:

- Signup
- Signup email verification
- Login
- Forgot password
- Change password
- Update account profile
- Remove account
- Recover account

## Download

Download the full project [Here](https://github.com/broadwayinc/skapi-auth-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/broadwayinc/skapi-auth-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3300`


:::danger Important!

Replace the `SERVICE_ID` and `OWNER_ID` value to your own service in `service.js`

Currently the service is running on **Trial Mode**.

**All the user data will be deleted every 14 days.**

You can get your own service ID from [Skapi](https://www.skapi.com)

:::