// ---------------------------------------------------------------------------------
// Search and social identity of every page: the <title>, the meta description and
// which pages stay out of search.
//
// It lives here and not in each page's frontmatter because the guide and reference
// pages are also concatenated, raw, into SKAPI.md, skapi-docs.md and skapi-types.md
// (see all_files.mjs). A page may still set `title:` or `description:` frontmatter;
// that wins over this map, and all_files.mjs strips frontmatter from the bundles.
//
// Imported by .vitepress/config.mts (head tags, sitemap) and by all_files.mjs (llms.txt),
// so it must stay plain JavaScript with no imports.
//
// Rules for a new page:
//   - add it here, or the build warns
//   - `title` only when the page's H1 is too generic to stand alone in a search result
//     (it replaces the <title>, never the visible H1). The template adds " | Skapi Docs",
//     so keep a title to 47 characters or less
//   - `description`: 110 to 160 characters, written for a person reading a search
//     result. No double quotes: VitePress writes it into content="..." unescaped
// ---------------------------------------------------------------------------------

/** The one host the docs are served from. No trailing slash. */
export const ORIGIN = 'https://docs.skapi.com';

export const SITE_NAME = 'Skapi Docs';

/** The site-wide fallback, also the home page's description. */
export const DEFAULT_DESCRIPTION =
    'Skapi documentation: add authentication, a database, file storage, realtime and email to any web app from one JavaScript library, with no backend to run.';

/** Social card, 1200x630, in public/. */
export const OG_IMAGE = ORIGIN + '/og-image.jpg';

/** The company behind Skapi, described the same way www.skapi.com describes it. */
export const ORGANIZATION = {
    '@type': 'Organization',
    '@id': 'https://www.skapi.com/#organization',
    name: 'Skapi',
    legalName: 'BROADWAYINC PTE. LTD.',
    url: 'https://www.skapi.com/',
};

/**
 * Built and published, but kept out of search and out of sitemap.xml.
 *   SYSTEM.md: the AI agent system prompt, only meaningful inside SKAPI.md
 *   admin/project-settings.md: an unlinked older copy of service-settings/service-settings.md
 */
export const NOINDEX = new Set(['SYSTEM.md', 'admin/project-settings.md']);

/**
 * Near duplicates whose canonical URL is another page. They stay indexable by that page
 * and are left out of sitemap.xml, which lists canonical URLs only.
 */
export const CANONICAL = {
    // "Basic Settings" is the first three sections of "Project Settings", word for word.
    'service-settings/additional.md': 'service-settings/service-settings.md',
};

/** 'database/create.md' -> 'https://docs.skapi.com/database/create.html', 'index.md' -> 'https://docs.skapi.com/' */
export function urlOf(relativePath) {
    return ORIGIN + '/' + relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html');
}

export const PAGES = {
    'index.md': {
        title: 'Skapi Documentation: Serverless Backend API for Web Apps',
        titleTemplate: false,
        description: DEFAULT_DESCRIPTION,
    },
    'SYSTEM.md': {
        title: 'System Prompt for AI Agents',
        description: 'The system prompt an AI coding agent reads before building with Skapi. The complete version with every guide and the API reference is SKAPI.md.',
    },

    // Introduction
    'introduction/what-is-skapi.md': {
        description: 'Skapi is a serverless backend API for web apps with authentication, a database, file storage and email included. Create a project and manage its settings.',
    },
    'introduction/getting-started.md': {
        title: 'Getting Started with Skapi',
        description: 'Get started with Skapi, the serverless backend API for web apps: create a project and connect it to plain HTML, a Vue or React app, or Node.js.',
    },
    'introduction/ai-driven.md': {
        description: 'Build with Skapi using AI coding agents such as Claude Code, OpenAI Codex and Gemini CLI: add the Skapi system prompt file to your project and start prompting.',
    },
    'introduction/working-with-forms.md': {
        description: 'Pass an HTML form submit event straight to Skapi methods to send form data without reading each field, including nested values, arrays and the form action.',
    },
    'introduction/plans.md': {
        description: 'What the Skapi Trial, Standard and Premium plans include per project, how hard stops, overage and suspension work, and what happens when you cancel.',
    },

    // Authentication
    'authentication/introduction.md': {
        description: 'What authentication is and how Skapi gives your web app a full user authentication system out of the box: signup, login, logout and account recovery.',
    },
    'authentication/create-account.md': {
        title: 'Creating a User Account',
        description: 'Let users sign up to your web app with the Skapi signup() method, log them in right after signup, and choose between e-mail and username login IDs.',
    },
    'authentication/signup-confirmation.md': {
        title: 'Signup Confirmation by E-Mail',
        description: 'Require new users to confirm their signup by e-mail in Skapi to keep fake accounts out, and resend the signup confirmation e-mail when a user asks for it.',
    },
    'authentication/login-logout.md': {
        title: 'Login and Logout',
        description: 'Log users in and out of your Skapi project with login() and logout(), keep them signed in with auto login, log out everywhere, and listen for login changes.',
    },
    'authentication/user-info.md': {
        title: 'Getting the User Profile',
        description: 'Read the logged-in user\'s profile with the Skapi getProfile() method, an OpenID-compliant JavaScript object, and listen for updates to the profile.',
    },
    'authentication/forgot-password.md': {
        title: 'Forgot Password and Password Reset',
        description: 'Let users reset a forgotten password in two steps with Skapi: request a verification code by e-mail, then set a new password with that code.',
    },
    'authentication/openid-login.md': {
        description: 'Sign users in with an OpenID identity provider such as Google through Skapi OpenID Loggers, and merge an OpenID account with an existing account.',
    },
    'authentication/full-example.md': {
        description: 'A plain HTML template with every Skapi authentication feature: signup, login, password reset, profile updates and account recovery. Download it and run it.',
    },

    // User account
    'user-account/introduction.md': {
        title: 'User Accounts',
        description: 'An overview of user account features in Skapi: let users verify their e-mail, change their password, update their profile and remove their account.',
    },
    'user-account/update-account.md': {
        description: 'Update a user\'s profile with the Skapi updateProfile() method, choose which profile attributes are public, and see which ID logs a user in.',
    },
    'user-account/email-verification.md': {
        description: 'Verify a logged-in user\'s e-mail address with the Skapi verifyEmail() method, and see what a verified e-mail address lets the user do in your app.',
    },
    'user-account/change-password.md': {
        description: 'Let logged-in users change their password with the Skapi changePassword() method by giving the current and the new password, and the length rules.',
    },
    'user-account/disable-recover-account.md': {
        title: 'Disabling and Recovering Accounts',
        description: 'Let users disable their own Skapi account and recover a disabled account later, and see how the project signup setting affects both actions.',
    },
    'user-account/get-users.md': {
        description: 'Search the users of your Skapi project with getUsers(), list them from the most recent signup, and filter them with search conditions.',
    },
    'user-account/full-example.md': {
        description: 'Full HTML example of a user account page built with Skapi, where users view and edit their profile, change their password and remove their account.',
    },

    // Database
    'database/introduction.md': {
        title: 'What is a Database?',
        description: 'What a database is, and how the Skapi database stores JSON records and files up to 5 TB each with a user-centric model, CDN delivery and indexing.',
    },
    'database/create.md': {
        description: 'Create a new record in the Skapi database with postRecord(): pass your data and a table config, and see how large record data is stored.',
    },
    'database/fetch.md': {
        description: 'Fetch records from the Skapi database with getRecords(): query a table, fetch a record by ID, and limit, page and order the results with fetchOptions.',
    },
    'database/table-info.md': {
        title: 'Database Table Information',
        description: 'List every table in your Skapi database with its record count and size using getTables(), and see who can read table information.',
    },
    'database/access-restrictions.md': {
        title: 'Record Access Restrictions',
        description: 'Control who can read your Skapi records with access groups and private records, grant and remove private access, and list private access grants.',
    },
    'database/encryption.md': {
        description: 'Encrypt the data of private Skapi records in the browser with keys derived from the user\'s password, and see exactly what is and is not protected.',
    },
    'database/unique-id.md': {
        title: 'Unique ID for Records',
        description: 'Give a Skapi record a unique ID when you post it, fetch the record by that ID later, and list the unique IDs used in your project with getUniqueId().',
    },
    'database/update-record.md': {
        description: 'Update an existing Skapi record by passing its record_id to postRecord(), and make a record read-only so it cannot be changed after posting.',
    },
    'database/handling-files.md': {
        title: 'Uploading and Handling Files',
        description: 'Upload files of any size to Skapi records with CDN delivery, track upload progress, download and remove files, and read file information.',
    },
    'database/delete-records.md': {
        description: 'Delete Skapi database records by record ID, by unique ID, or by a database query over the user\'s own records with the deleteRecords() method.',
    },
    'database/indexing.md': {
        title: 'Database Indexing',
        description: 'Index Skapi records to search them by value, condition or range, query reserved keywords and compound index names, and fetch index information.',
    },
    'database/tags.md': {
        title: 'Record Tags',
        description: 'Add tags to Skapi records as extra search metadata, query records by tag alone or together with an index, and fetch tag information with record counts.',
    },
    'database/referencing.md': {
        title: 'Referencing Records',
        description: 'Reference other records when posting to the Skapi database, fetch records by their references, and restrict who can reference a record, as in a poll.',
    },
    'database/subscription.md': {
        title: 'User Subscriptions and Feeds',
        description: 'Let users subscribe to other users in Skapi, post feed records, read their feed, list subscriptions, and block or unblock subscribers.',
    },
    'database/full-example.md': {
        description: 'A full HTML photo sharing app built on the Skapi database, with private posts, comments, likes, hashtag search, paging and feeds. Download it and run it.',
    },

    // Third-party APIs
    'api-bridge/introduction.md': {
        description: 'The Skapi API Bridge connects your project to external APIs: forwardRequest() relays requests from Skapi servers and secureRequest() calls your own API.',
    },
    'api-bridge/client-secret-request.md': {
        title: 'Using Third-Party APIs with Secret Keys',
        description: 'Connect Skapi to third-party APIs for AI, maps or payments: register secret keys, send requests with forwardRequest(), and restrict where each key goes.',
    },
    'api-bridge/forward-request.md': {
        description: 'Relay a request to any destination from Skapi servers with forwardRequest(): send a form, substitute a secret key, pick the method and read the answer.',
    },
    'api-bridge/polling-request.md': {
        title: 'Polling for Forwarded Request Results',
        description: 'forwardRequest() queues every call. Poll for the result automatically or manually, time the call, stop polling, cancel requests and check queue sizes.',
    },
    'api-bridge/streaming-request.md': {
        title: 'Streaming Third-Party API Responses',
        description: 'Stream a third-party API response through Skapi with forwardRequest() and stream: true, read it as it arrives by polling or websocket, and finalize it.',
    },
    'api-bridge/request-history.md': {
        description: 'List past forwardRequest() calls with forwardRequestHistory() to get results after a page reload, and filter them by status or queue in compact listings.',
    },
    'api-bridge/example.md': {
        title: 'OpenAI Images API Example',
        description: 'A worked example that calls the OpenAI Images API from the browser with Skapi forwardRequest(), with your OpenAI key kept on the Skapi Secret Keys page.',
    },
    'api-bridge/secure-post-request.md': {
        title: 'Secure POST Requests to Your Own API',
        description: 'Send secure POST requests to your own API with the Skapi secureRequest() method, which carries your project secret key, with Node.js and Python examples.',
    },

    // Tickets
    'tickets/introduction.md': {
        title: 'Introduction to Tickets',
        description: 'Skapi tickets are HTTP endpoints you register once and anyone can call, such as a payment webhook or a coupon link, that check a condition and run actions.',
    },
    'tickets/conditions.md': {
        title: 'Ticket Conditions and Placeholders',
        description: 'Write Skapi ticket conditions that check a request\'s signature, IP, headers, data and user, and capture values into placeholders for the actions.',
    },
    'tickets/actions.md': {
        title: 'Ticket Actions',
        description: 'Skapi ticket actions run once the condition passes: set access groups, grant private access, post records, call HTTP APIs, and chain results and errors.',
    },
    'tickets/errors.md': {
        title: 'Ticket Errors and Logs',
        description: 'The error body, error codes and stages of a Skapi ticket, what consumeTicket() rejects with, and how consumptions are logged and read in the dashboard.',
    },
    'tickets/examples.md': {
        title: 'Ticket Examples',
        description: 'Three complete Skapi tickets explained line by line: a payment webhook, a coupon link and a signed-in unlock, ready to paste into the dashboard.',
    },

    // Realtime
    'realtime/introduction.md': {
        description: 'An overview of Skapi realtime features: WebSocket data exchange, peer-to-peer WebRTC for video and large data, and notifications for web apps.',
    },
    'realtime/connecting.md': {
        description: 'Open a Skapi realtime WebSocket connection with connectRealtime() to exchange JSON data between users for chat and notifications, and close it again.',
    },
    'realtime/post.md': {
        description: 'Send JSON data to another user over the Skapi realtime connection with the postRealtime() method, and receive the realtime data other users send you.',
    },
    'realtime/group.md': {
        description: 'Send realtime data to many users at once with Skapi realtime groups: join, send to and leave a group, and list the groups and the users in each.',
    },
    'realtime/webRTC.md': {
        title: 'WebRTC Connections',
        description: 'Add peer-to-peer video, audio and data connections to your web app with Skapi WebRTC and the connectRTC() method, with the whole connection flow.',
    },
    'notification/send-notifications.md': {
        title: 'Push Notifications',
        description: 'Add web push notifications to your app with Skapi: set up a service worker, subscribe and unsubscribe users, and send notifications to them.',
    },
    'realtime/chat-example.md': {
        description: 'A complete HTML chat app built on Skapi realtime messaging, where logged-in users post and receive messages. Download the project and run it.',
    },
    'realtime/rtc-example.md': {
        description: 'A complete HTML video call app built on Skapi WebRTC, where logged-in users request and receive video calls. Download the project and run it.',
    },

    // E-mail
    'email/introduction.md': {
        description: 'An overview of the Skapi e-mail service: automated e-mails for account events, newsletters to your users, and inquiries from your visitors.',
    },
    'email/email-templates.md': {
        title: 'Automated E-Mail Templates',
        description: 'Customize the automated e-mails Skapi sends for signup, password reset, e-mail changes, invitations and newsletters, with placeholders and per call overrides.',
    },
    'email/newsletters.md': {
        description: 'Send public newsletters and Service Email to your Skapi users through an endpoint address, run named newsletter lists, and fetch the e-mails you sent.',
    },
    'email/inquiries.md': {
        description: 'Receive inquiries from your website visitors in your own inbox with the built-in Skapi e-mail service and the sendInquiry() method.',
    },

    // Admin
    'admin/intro.md': {
        description: 'An overview of Skapi admin features: what admin accounts can do in your project, what they cannot do, and what only the project owner can do.',
    },
    'admin/permissions.md': {
        description: 'The complete Skapi admin permission policy: roles, rules for acting on other accounts, records, newsletters, project settings, and every refusal message.',
    },
    'admin/invite.md': {
        description: 'Invite users to your Skapi project with inviteUser(), preset their profile, redirect after acceptance, use custom templates, and resend or cancel invitations.',
    },
    'admin/account.md': {
        title: 'Managing User Accounts as an Admin',
        description: 'Create, update, delete, block and unblock user accounts as a Skapi admin, and assign access groups to users with the grantAccess() method.',
    },
    'admin/newsletters.md': {
        description: 'How the project owner and admins read and search the newsletter subscriber lists of a Skapi project, and who is allowed to read them.',
    },
    'admin/project-settings.md': {
        description: 'The settings of a Skapi project: name, CORS, signup, inquiries, database freeze, anonymous posts and disabling, all changed by the project owner only.',
    },

    // Hosting and project settings
    'hosting/hosting.md': {
        title: 'Hosting Your Website',
        description: 'Host your website on Skapi: register a subdomain, upload your site files on the Web Hosting page, serve index.html, and set a custom 404 page.',
    },
    'service-settings/service-settings.md': {
        description: 'Configure your Skapi project settings: name, CORS, secret key, enable or disable, signup, inquiries, login requirement and database freeze.',
    },
    'service-settings/additional.md': {
        title: 'Basic Project Settings',
        description: 'The basic settings of a Skapi project: its name, the CORS list of allowed domains, and the secret key sent with secure requests to your own API.',
    },
    'service-settings/deleteservice.md': {
        title: 'Deleting a Project',
        description: 'How to delete a Skapi project from the project settings page, which plans allow it, who may delete it, and why deleting it is permanent.',
    },

    // Tutorial
    'full-example/intro.md': {
        description: 'The complete Skapi tutorial: one web app with authentication, an Instagram clone, a chat room and an AI image generator, with a live demo and the source.',
    },
    'full-example/auth-profile.md': {
        title: 'Tutorial: Authentication and User Profile',
        description: 'Tutorial walkthrough of authentication in the Skapi sample app: signup, password recovery, profile updates, e-mail verification and profile pictures.',
    },
    'full-example/instaclone.md': {
        title: 'Tutorial: Instaclone (Instagram Clone)',
        description: 'Tutorial walkthrough of Instaclone, an Instagram-like app built with the Skapi database and file storage, part of the complete Skapi tutorial.',
    },
    'full-example/chatroom.md': {
        title: 'Tutorial: Realtime Chat Room',
        description: 'Tutorial walkthrough of a realtime chat room built with Skapi WebSocket messaging, part of the complete Skapi tutorial project.',
    },
    'full-example/image-generator.md': {
        title: 'Tutorial: AI Image Generator',
        description: 'Tutorial walkthrough of an AI image generator that calls a third-party API through the Skapi API Bridge without exposing your API key.',
    },

    // Reference
    'util/introduction.md': {
        title: 'Utility Functions',
        description: 'Skapi utility functions: extract form values as an object, make HTTP requests, cancel pending requests, hash with MD5, and convert numbers to Base62.',
    },
    'api-reference/connection/README.md': {
        description: 'TypeScript reference for the Skapi connection methods getConnectionInfo(), mock() and getFormResponse(), with their parameters and return types.',
    },
    'api-reference/authentication/README.md': {
        description: 'TypeScript reference for the Skapi authentication methods: signup, login, logout, getProfile, forgotPassword, resetPassword and openIdLogin.',
    },
    'api-reference/user/README.md': {
        description: 'TypeScript reference for the Skapi user account methods: updateProfile, changePassword, verifyEmail, disableAccount, recoverAccount and getUsers.',
    },
    'api-reference/database/README.md': {
        description: 'TypeScript reference for the Skapi database methods: postRecord, getRecords, deleteRecords, getTables, getIndex, getTags, subscriptions and files.',
    },
    'api-reference/email/README.md': {
        description: 'TypeScript reference for the Skapi e-mail methods: newsletter subscriptions and groups, getNewsletters and sendInquiry, with parameters and returns.',
    },
    'api-reference/realtime/README.md': {
        description: 'TypeScript reference for the Skapi realtime methods: connectRealtime, postRealtime, joinRealtime, connectRTC and the push notification methods.',
    },
    'api-reference/api-bridge/README.md': {
        description: 'TypeScript reference for the Skapi third-party API methods: forwardRequest, forwardRequestStream, forwardRequestHistory, secureRequest and polling.',
    },
    'api-reference/admin/README.md': {
        description: 'TypeScript reference for the Skapi admin methods: inviteUser, grantAccess, createAccount, updateUserAttributes, deleteAccount, blockAccount and more.',
    },
    'api-reference/tickets/README.md': {
        description: 'TypeScript reference for the Skapi ticket methods consumeTicket, getTickets and getConsumedTickets, and the ticket condition, action and error types.',
    },
    'api-reference/data-types/README.md': {
        description: 'TypeScript definitions of the data types used across the Skapi library, such as RecordData, UserProfile, DatabaseResponse, FetchOptions and Form.',
    },
    'versionlog/versions.md': {
        title: 'skapi-js Version History',
        description: 'The release history of skapi-js, the Skapi JavaScript library: what changed in each version, from the current release back to earlier ones.',
    },
    'deprecated/deprecated.md': {
        title: 'Deprecated Methods and Options',
        description: 'Renamed methods, retired options and older request forms of Skapi and skapi-js, for maintaining code written against older names or versions.',
    },
};
