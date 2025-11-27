# Getting Started

Welcome to Skapi! This guide will walk you through the essential steps to get started: creating a service, importing the Skapi library into your project, and establishing a connection between your application and the Skapi server.


## 1. Create a Service

1. Sign up for an account at [skapi.com](https://www.skapi.com/signup).
2. Log in and navigate to the [My Services](https://www.skapi.com/my-services) page.
3. Click on **Create** on Create a new service, create a name for your service and proceed.

## 2. Initialize the Skapi Library

Skapi is compatible with both vanilla HTML and webpack-based projects (e.g., Vue, React, Angular, etc.).
You can import the library using a `<script>` tag or install it via npm.

### For HTML Projects

For vanilla HTML projects, import Skapi using a script tag and initialize the library.
For static HTML projects, ensure that the Skapi class is initialized in the HTML header on all pages. 

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id');
</script>
```

### For SPA Projects

To use Skapi in Single Page Application (SPA) projects such as Vue, React, or Angular, install skapi-js via npm.

```sh
$ npm i skapi-js
```

Then, import the library into your main JavaScript file:

```javascript
// main.js
import { Skapi } from "skapi-js";
const skapi = new Skapi('service_id');

export { skapi }

// You can now import skapi from anywhere in your project.
```

::: warning
Replace `'service_id'` in `new Skapi()` with your actual service ID.
Format: `xxxxxxxxxxxx-xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

You can get your service ID from your service dashboard.
:::

## 3. Get Connection Information

When your client has successfully connected to the Skapi server, you can use the [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) method to retrieve connection information.

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



## 4. Advanced Settings

You can configure additional options when initializing the Skapi class.

### new Skapi(...)

```ts
class Skapi {
  constructor(
    service: string, // Skapi service ID
    owner: string,   // Skapi owner ID
    options?: {
        autoLogin?: boolean;        // Default: true
        requestBatchSize?: number;  // Default: 30. Maximum number of requests processed per batch.
        eventListener?: {
            onLogin?: (user: UserProfile | null) => void;
            onUserUpdate?: (user: UserProfile | null) => void;
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
        - Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires.
        - See: [Listening to Login/Logout Status](/authentication/login-logout.html#listening-to-login-logout-status)

    - `onUserUpdate(user: UserProfile | null)`
        - Fires when the user's profile is updated.
        - See: [Listening to User Profile Updates](/authentication/user-info.html#listening-to-user-s-profile-updates)

    - `onBatchProcess(process)`
        - Fires everytime after Skapi completes processing a request batch.

Type reference: See [UserProfile](/api-reference/data-types/README.md#userprofile).