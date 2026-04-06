
# Getting Started

After creating your service in Skapi, connect it to your frontend.

Your frontend is the part users see, such as pages, buttons, and forms. It can be plain HTML or a JavaScript framework like Vue or React.

Skapi works with vanilla HTML and modern JavaScript frameworks (for example Vue, React, and Angular).

To use Skapi, import the library and initialize it with your service ID.

### For HTML Projects

For vanilla HTML projects, import Skapi using a script tag and initialize the library as shown below.
Initialize the Skapi class in the HTML `<head>` of each page that uses Skapi.
When you initialize the class, use the exact service ID from your Skapi dashboard.

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id');
</script>
```

::: tip NOTE
Replace `'service_id'` with your actual service ID from your Skapi dashboard after you create a service.

Example format: `'xxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxx'`
:::

### For SPA Projects

To use Skapi in a Single Page Application (SPA) such as Vue, React, or Angular, install `skapi-js` with npm.

```sh
$ npm i skapi-js
```

Then import the library in your main JavaScript file:

```javascript
// main.js
import { Skapi } from "skapi-js";
const skapi = new Skapi('service_id');

export { skapi }

// You can now import skapi from anywhere in your project.
```

### For TypeScript Projects

Skapi includes TypeScript support, so you can import both the class and related types.

```typescript
import { Skapi } from 'skapi-js';
import type { RecordData, DatabaseResponse } from 'skapi-js';

const skapi = new Skapi('service_id');
let databaseRecords: DatabaseResponse<RecordData>;
```

### Node.js (CommonJS)

To use Skapi in Node.js (CommonJS), import the library as shown below:

```javascript
const { Skapi } = require('skapi-js');
const skapi = new Skapi('service_id');
```

### Node.js (ESM)

```javascript
import { Skapi } from 'skapi-js';
const skapi = new Skapi('service_id');
```

> **Note:** When running Skapi in Node.js, browser-specific features such as WebSocket, WebRTC, and Notifications are not available.



## Get Connection Information

After your client connects to Skapi, call [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) to retrieve connection details.

::: code-group
```html [HTML]
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id');
</script>
<script>
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        service_name: "Your Service Name",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user agent",
        user_location: "Connected user's country code",
        version: 'x.x.x' // Skapi library version
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
        service_name: "Your Service Name",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user agent",
        user_location: "Connected user's country code",
        version: 'x.x.x' // Skapi library version
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::


## Advanced Settings

You can pass additional options when initializing the Skapi class.

### new Skapi(...)

```ts
class Skapi {
  constructor(
    service: string, // Skapi service ID
    options?: {
        autoLogin?: boolean;        // Default: true
        requestBatchSize?: number;  // Default: 30. Maximum number of requests processed per batch.
        eventListener?: {
            onLogin?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onUserUpdate?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onBatchProcess?: (process: {
                batchToProcess: number; // Number of batches left to process
                itemsToProcess: number; // Number of items left to process
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
    - Automatically restores the user's session on page load.
    - See: [Auto Login](/authentication/login-logout.html#auto-login)

- `requestBatchSize` (number, default: 30)
    - Maximum number of requests processed per batch.

- `eventListener` (callbacks for key events)
    - `onLogin(user: UserProfile | null)`
        - Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a `UserProfile` object if the user is logged in; otherwise, it receives `null`.
        - See: [Listening to Login/Logout Status](/authentication/login-logout.html#listening-to-login-logout-status)

    - `onUserUpdate(user: UserProfile | null)`
        - Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a `UserProfile` object if the user is logged in; otherwise, it receives `null`.
        - See: [Listening to User Profile Updates](/authentication/user-info.html#listening-to-user-s-profile-updates)

    - `onBatchProcess(process)`
        - Fires each time Skapi completes processing a request batch.

Type reference: See [UserProfile](/api-reference/data-types/README.md#userprofile).