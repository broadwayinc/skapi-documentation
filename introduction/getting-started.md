
# Getting Started

Skapi is a serverless backend API for web applications.

To build a full-stack web application, create a project and connect it to your HTML or JavaScript code.


## Creating a Project

1. Sign up for an account at [skapi.com](https://www.skapi.com/signup).
2. Log in, create a new project. Give your project a name, choose a region, and click Create.

:::tip For BunnyQuery users
BunnyQuery projects are fully compatible with Skapi. Your project will appear in both your BunnyQuery and Skapi project lists.
:::

### For HTML Projects

For a vanilla HTML project, load Skapi with a script tag and initialize the library as shown below.
Add the Skapi script and initialize the `Skapi` class in the `<head>` of each page that uses Skapi.
Use your Skapi project's exact Project ID when initializing the library.

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    // Replace "<Project ID>" with your actual project ID
    const skapi = new Skapi("<Project ID>");
</script>
```

:::warning Replace the placeholder
`<Project ID>` is a placeholder, including the angle brackets.

Replace the entire placeholder with your actual Project ID from the Skapi dashboard. For example:

```js
const skapi = new Skapi("abc123defg456hij78-9klmnop012qrstu345vwxyz");
```

Every example in this documentation uses the same `"<Project ID>"` placeholder. Replace it wherever you copy an example.

If you run code that still has the placeholder, Skapi asks for your Project ID instead of stopping: a web browser shows a prompt, and Node.js asks in the terminal. Nothing is sent until you answer, and calls made in the meantime wait for it. The ID you enter is kept for the session (until the browser tab is closed, or until the Node.js process exits) and is used again wherever the placeholder appears. Where nobody can answer, such as a Node.js server or CI job with no terminal, Skapi throws `Project ID is required.` This is a shortcut for trying examples, so put your Project ID in your code before you publish.
:::

The Project ID uniquely identifies your Skapi project.


### For SPA Projects

To use Skapi in a single-page application (SPA) such as Vue, React, or Angular, install `skapi-js` with npm.

```sh
$ npm i skapi-js
```

Then import the library in your main JavaScript file:

```javascript
// main.js
import { Skapi } from "skapi-js";
const skapi = new Skapi("<Project ID>");

export { skapi }

// You can now import skapi from anywhere in your project.
```

### For TypeScript Projects

Skapi includes TypeScript support, so you can import the `Skapi` class and related types.

```typescript
import { Skapi } from 'skapi-js';
import type { RecordData, DatabaseResponse } from 'skapi-js';

const skapi = new Skapi("<Project ID>");
let databaseRecords: DatabaseResponse<RecordData>;
```

### Node.js (CommonJS)

To use Skapi in Node.js (CommonJS), import the library as shown below:

```javascript
const { Skapi } = require('skapi-js');
const skapi = new Skapi("<Project ID>");
```

### Node.js (ESM)

```javascript
import { Skapi } from 'skapi-js';
const skapi = new Skapi("<Project ID>");
```

> **Note:** When running Skapi in Node.js, browser-specific features such as WebSocket, WebRTC, and Notifications are unavailable.



## Get Connection Information

After your client connects to Skapi, call [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) to retrieve information about the connection.

::: code-group
```html [HTML]
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("<Project ID>");
</script>
<script>
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        project_id: "Public ID of the connected project",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user's user agent",
        user_location: "Connected user's country code",
        service_name: "Your project name",
        service_description: "Your project description",
        version: 'x.x.x', // Skapi library version
        ai_agent: "AI agent instructions configured for the project",
        conf: {
            freeze_database: boolean, // The database is read-only
            prevent_signup: boolean, // Sign-up is blocked
            prevent_inquiry: boolean, // Inquiries are blocked
            prevent_anonymous: boolean // Anonymous users cannot write to the database
        }
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
</script>
```

```javascript [SPA]
import { skapi } from '../location/of/your/main.js';
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        project_id: "Public ID of the connected project",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user's user agent",
        user_location: "Connected user's country code",
        service_name: "Your project name",
        service_description: "Your project description",
        version: 'x.x.x', // Skapi library version
        ai_agent: "AI agent instructions configured for the project",
        conf: {
            freeze_database: boolean, // The database is read-only
            prevent_signup: boolean, // Sign-up is blocked
            prevent_inquiry: boolean, // Inquiries are blocked
            prevent_anonymous: boolean // Anonymous users cannot write to the database
        }
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::


## Advanced Settings

You can pass additional options when initializing the `Skapi` class.

### new Skapi(...)

```ts
class Skapi {
  constructor(
    project_id: string, // Skapi project ID.
    options?: {
        autoLogin?: boolean;        // Default: true
        refetchServiceInfo?: boolean;// Default: false. Bypasses cached project information and fetches fresh information on every load.
        requestBatchSize?: number;  // Default: 30. Maximum number of requests processed per batch.
        encryption?: boolean | { // Default: false. Encrypts private record data in the browser. Can only be set during initialization. HTTPS is required.
            iterations?: number;             // Default: 600000. PBKDF2 cost. Minimum: 100000.
            minPasswordLength?: number;      // Default: 0 (off). Rejects passwords shorter than this value.
            persistDevice?: boolean;         // Default: true. Keeps encryption unlocked across page reloads on that device.
            recovery?: 'code' | 'none';      // Default: 'code'. Issues a one-time recovery code.
            trustPolicy?: 'tofu' | 'strict'; // Default: 'tofu'. Controls how a recipient's public key is trusted when sharing.
            withheld?: 'null' | 'sentinel';  // Default: 'null'. Specifies what `data` contains when a record cannot be decrypted.
            table?: string;                  // Default: '__skapi__keyring'. Reserved table for the user's keyring.
        };
        eventListener?: {
            onLogin?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onUserUpdate?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onBatchProcess?: (process: {
                batchToProcess: number; // Number of batches remaining
                itemsToProcess: number; // Number of items remaining
                completed: any[]; // Results completed in this batch
            }) => void;
        }
    }) {
    ...
  }
  ...
}
```

Options overview:

- `autoLogin` (boolean, default: true)
    - Automatically restores the user's session when the page loads.
    - See: [Auto Login](/authentication/login-logout.html#auto-login)

- `requestBatchSize` (number, default: 30)
    - Maximum number of requests processed in each batch.

- `encryption` (boolean | object, default: false)
    - Encrypts the `data` of records saved with `access_group: 'private'` in the browser before the data reaches the database. The contents of files attached to those records are encrypted as well.
    - **This option takes effect only when it is set during `Skapi` initialization.** There is no method for enabling encryption later. If this option is omitted, the instance saves every record's `data` as plain text for its entire lifetime.
    - Enabling encryption later does not encrypt records that were already saved as plain text.
    - Setting it to `true` uses the default settings. Pass an object to customize them:
        - `iterations` (number, default: 600000): PBKDF2 cost for deriving the key from the user's password. Minimum: 100000.
        - `minPasswordLength` (number, default: 0, off): rejects passwords shorter than this value. Because encryption strength is limited by the user's password, setting a minimum is recommended.
        - `persistDevice` (boolean, default: true): keeps encryption unlocked across page reloads on that device.
        - `recovery` ('code' | 'none', default: 'code'): issues a one-time recovery code. This is the only way to regain access to the data after a password reset.
        - `trustPolicy` ('tofu' | 'strict', default: 'tofu'): controls how a recipient's public key is trusted when a record is shared. `'strict'` requires the key to be pinned before the first share.
        - `withheld` ('null' | 'sentinel', default: 'null'): specifies what `data` contains when a record cannot be decrypted. `'sentinel'` returns a placeholder object with the reason instead of `null`.
        - `table` (string, default: '__skapi__keyring'): the reserved table for the user's keyring.
    - See: [Encrypting Private Record Data](/database/encryption.html)

- `eventListener` (callbacks for key events)
    - `onLogin(user: UserProfile | null)`
        - Fires after Skapi initializes on the initial page load, after login or logout, and when a session expires. The callback receives a `UserProfile` object when the user is logged in; otherwise, it receives `null`.
        - See: [Listening to Login/Logout Status](/authentication/login-logout.html#listening-to-login-logout-status)

    - `onUserUpdate(user: UserProfile | null)`
        - Fires after login, before logout, when a session expires, and when the user's profile is updated. The callback receives a `UserProfile` object when the user is logged in; otherwise, it receives `null`.
        - See: [Listening to User Profile Updates](/authentication/user-info.html#listening-to-user-s-profile-updates)

    - `onBatchProcess(process)`
        - Fires each time Skapi finishes processing a request batch.

Type reference: See [UserProfile](/api-reference/data-types/README.md#userprofile).