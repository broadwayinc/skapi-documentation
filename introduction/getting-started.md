# Getting Started

Welcome to Skapi! This guide will walk you through the essential steps to get started: creating a service, importing the Skapi library into your project, and establishing a connection between your application and the Skapi server.


## 1. Create a Service

1. Sign up for an account at [skapi.com](https://www.skapi.com/signup).
2. Log in and navigate to the [My Services](https://www.skapi.com/my-services) page.
3. Click on **Create New Service**

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
    const skapi = new Skapi('service_id', 'owner_id');
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
import { Skapi } from 'skapi-js';
const skapi = new Skapi('service_id', 'owner_id');

export { skapi }

// You can now import skapi from anywhere in your project.
```

::: warning
Make sure to replace `'service_id'` and `'owner_id'` in `new Skapi()` with the actual values from your service.
:::


## 3. Get Connection Information

When your client has successfully connected to the Skapi server, you can use the [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) method to retrieve connection information.

::: code-group
```html [HTML]
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id', 'owner_id');
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