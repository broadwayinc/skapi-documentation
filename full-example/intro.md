# Full Examples

The full example is a plain HTML and JavaScript template that shows every Skapi feature working, one page per feature. There is no framework and no build step: each page loads `skapi-js` from a CDN, describes what it demonstrates, and runs the real thing against your project. Open a page, try it, then view its source to see how it is done.

| Example | What it demonstrates |
| --- | --- |
| [User Account](/full-example/user-account.md) | Sign up, log in, verify an email address, reset or change a password, update a profile, remove and recover an account. |
| [Newsletter](/full-example/newsletter.md) | Let visitors subscribe to your newsletter with their email address. |
| [Send Inquiry](/full-example/inquiry.md) | A contact form that sends a message to you, the project owner. |
| [Database](/full-example/database.md) | A photo gallery: upload posts with files, like, comment, subscribe to other users and query posts in different ways. |
| [Realtime Chat](/full-example/realtime.md) | Group chat and private messages over a WebSocket connection. |
| [RTC Video Chat](/full-example/webrtc.md) | Video calls and a data channel between two users with WebRTC. |

## Have your project ID ready

The demos run against **your** Skapi project: the accounts, posts and messages you create in them land in your project's users and database. Every demo page takes the project ID from its address, as `?pid=<Project ID>`.

Enter your project ID below once. It is kept in this browser, and the demo links on these pages carry it from then on. You can find the project ID on your project's page at [skapi.com](https://www.skapi.com), where the Application Examples section also offers these links with the ID already filled in.

<FullExampleDemo page="index.html" label="Open the example index" />

![The index page of the Skapi HTML template: a short introduction and a menu with one entry per feature page](/screenshots/template-index.webp)

*The index page. Every entry opens one feature page, and the project ID travels with every link.*

You can also open every page from your project's `Settings` page at [skapi.com](https://www.skapi.com): the **Application Examples** card has an **[Open]** link per page, already carrying your project ID, and a **[Download]** link for the ZIP.

![The Application Examples card on a project's Settings page, one row per example page with an Open link, and a Download row for the ZIP](/screenshots/settings-examples.webp)

*Application Examples on the Settings page.*

Pages that need a logged-in user (Database, Realtime Chat, RTC Video Chat and the account pages) send you to the login page first and bring you back afterwards. Newsletter and Send Inquiry work without an account.

## Download

Download every page of the template as one ZIP file: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip)

Unzip it, then either open a page with `?pid=<Project ID>` in the address or set the project ID in `service.js`. The files are plain HTML and JavaScript, so they run from any web server, or straight from the file system for everything except the video chat, which needs HTTPS or `localhost`.

## What is shared by every page

- `service.js` creates the `skapi` object every page uses. It reads the project ID from `?pid=`, keeps it in `sessionStorage`, adds it to every link and form action, and sends a visitor who is not logged in from the pages that need a user to `login.html` and back. Its `userReady` promise resolves to the logged-in user's profile, or `null`.
- `main.css` is one small stylesheet shared by every page.
- Each page is a short HTML file with the form or demo, a few lines of script, and comments that say which Skapi method does what.
