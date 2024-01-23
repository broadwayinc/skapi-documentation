# Skapi Complete Tutorial

Welcome to the complete tutorial project for Skapi, featuring a web application that allows users to chat, upload posts, and comment, and even provide an AI image generating service via 3rd party API service.

This tutorial focuses on demonstrating the use of Skapi to build a full-fledged application. The emphasis is on functionality over aesthetics.

## Demo

Check out the [live demo](https://tutorial.skapi.com) of the project.

To download the source code:

```bash
git clone https://github.com/broadwayinc/skapi-tutorial.git
```

## Pre Requisites

The **service_id** and the **owner_id** values are set in `service.js` file.
Currently, the values are set to:
  - Service ID: **"ap220wfRHl9Cw2QqeFEc"**
  - Owner ID: **"f8e16604-69e4-451c-9d90-4410f801c006"**

Replace the values with your own service ID and owner ID.
You can retrieve your own service ID and owner ID from your service dashboard.

## Opening the Project

In the project directory, you will find the following files:

```
.
├─ authentication
│  ├─ change_password.html
│  ├─ create-account.html
│  ├─ email-verification.html
│  ├─ forgot-password.html
│  ├─ profile-pic.html
│  ├─ recover-account.html
│  ├─ remove-account.html
│  ├─ reset-password.html
│  └─ update-profile.html
├─ chatroom
│  └─ chatroom.html
├─ image-generator
│  └─ image-generator.html
├─ instaclone
│  └─ instaclone.html
├─ custom.css
├─ index.html
└─ service.js
```

This project does not require any build tools. Simply open the `index.html` file in your browser, and it will just work.

If you are on remote server, run the following command to host the project:

```bash
npm run start 3000
```
*The number 3000 is the port number. You can change it to any port number you want.*

You will be able to access the project at `http://[your remote server url]:3000`.

## Key Points of This Tutorial

### Built with Pure Static HTML, CSS and JavaScript

While Skapi is compatible with various frameworks, this tutorial utilizes pure static HTML, CSS, and JavaScript.
It showcases how even basic static HTML can be used with Skapi to create a complete web application.

The CSS stylings are intentionally minimalistic, yet the application remains fully responsive across different devices.

### Building a Full-Scale Application

This tutorial encompasses all aspects of heavy lifting in production-level application, including:

- Authentication
  - Account creation
  - Login/Logout functionalities
  - Account removal
  - Password reset and recovery options
  - Profile updates
  - Account recovery
  - Email verification
  - Profile picture uploads

- Instaclone (Instagram Clone) Features
  - Post creation
  - Post private posts
  - Commenting on posts
  - Liking and unliking posts
  - Tagging and searching posts by tag
  - Indexing posts by likes, comments, users
  - Post deletion

- Simple Chat Room Application
  - broadcast text message in chat room
  - Send/Receive private text message between users
  - List all users in chat room

- AI Image Generator
  - Generate images using AI with given text
  - Making a request to 3rd party API with client secret key
  
### Detailed Documentation

All the code in this tutorial is heavily commented, and the comments are written to help you understand the code and the logic behind it.

## Read Order

For easier understanding, the tutorial is written in a way that you can read the code files in the following order:

#### Main Page, Login, Logout

1. `service.js`
2. `index.html`

#### Authentication and User Profile

3. `authentication/create-account.html`
4. `authentication/forgot-password.html`
5. `authentication/reset-password.html`
6. `authentication/recover-account.html`
7. `authentication/update-profile.html`
8. `authentication/email-verification.html`
9.  `authentication/change-password.html`
10. `authentication/remove-account.html`
11. `authentication/profile-pic.html`

#### Instaclone

12. `instaclone/instaclone.html`

#### Chat Room

13. `chatroom/chatroom.html`

#### AI Image Generator

14.  `image-generator/image-generator.html`