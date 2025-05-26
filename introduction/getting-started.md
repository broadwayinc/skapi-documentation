[Full API Documentation Download](https://broadwayinc.com/aidocs/SKAPIDOC.md)

<br>

# Getting Started

Welcome to Skapi, this guide will walk you through importing the Skapi library into your project, creating a service, and connecting your application to your Skapi server.


## 1. Create a service

1. Signup for an account at [skapi.com](https://www.skapi.com/signup).
2. Login and go to [My Services](https://www.skapi.com/my-services) page.
3. Enter your new service name and click 'Create'.

## 2. Initialize the Skapi library

Skapi is compatible with both vanilla HTML and webpack-based projects (ex. Vue, React, Angular... etc).
You need to import the library using the `<script>` tag or install via npm.

### For HTML projects

For vanilla HTML projects, import Skapi in the script tag, and initialize the library.

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id', 'owner_id');
</script>
```

### For SPA projects

To use Skapi in a SPA projects (such as Vue, React, or Angular), you can install skapi-js via npm.

```sh
$ npm i skapi-js
```

Then, import the library into your main JavaScript file.

```javascript
// main.js
import { Skapi } from 'skapi-js';
const skapi = new Skapi('service_id', 'owner_id');

export { skapi }

// Now you can import skapi from anywhere in your project.
```

::: warning
Be sure to replace `'service_id'` and `'owner_id'` in `new Skapi()` with the actual values of your service.
:::


## 3. Get connection info

When the client has successfully connected to the Skapi server, the [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) method will return the connection information.

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
        user_locale: "Connected user's country code",
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
        user_locale: "Connected user's country code",
        version: 'x.x.x' // Skapi library version
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::