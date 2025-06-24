# Notifications

Skapi provides methods to manage push notifications, including subscribing, unsubscribing, and sending notifications. This guide explains how to implement push notifications using Skapi from the client side.

:::danger HTTPS REQUIRED.
Notifications only works on HTTPS environment.
You need to setup a HTTPS environment when developing a notifications feature for your web application.

You can host your application in skapi.com or host from your personal servers.
:::

## Subscribing to Notifications

To receive push notifications, users must first subscribe. This requires obtaining a VAPID key and registering a service worker. It is possible to get the VAPID key by calling the method [`vapidPublicKey()`](/api-reference/realtime/README.md#vapidpublickey) and after subscribe by using the method [`subscribeNotification()`](/api-reference/realtime/README.md#subscribenotification).

### Steps:
1. Retrieve the VAPID key using [`vapidPublicKey()`](/api-reference/realtime/README.md#vapidpublickey).
2. Request notification permission from the device user.
3. Add the service worker [`sw.js`](#service-worker-sw-js) file to your environment.
4. Register a service worker and request notification permissions.
5. Subscribe to push notifications using `navigator.serviceWorker.pushManager.subscribe()`.
6. Send the subscription details to Skapi using [`subscribeNotification()`](/api-reference/realtime/README.md#subscribenotification).

### Code Example:
```js
/**
 * Converts a Base64 string into a Uint8Array, required for push subscriptions.
 * This function ensures correct padding and decoding.
 */
function urlBase64ToUint8Array(base64String) {
    // Ensure the Base64 string has the correct padding
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+") // Convert URL-safe characters back
        .replace(/_/g, "/");

    // Decode Base64 to binary
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    // Convert binary data into a Uint8Array
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
}

// Retrieve the VAPID public key from Skapi
const vapidResponse = await skapi.vapidPublicKey();
const vapid = vapidResponse.VAPIDPublicKey;

// Check if the browser supports service workers
if (!("serviceWorker" in navigator)) {
    alert("Service workers are not supported in this browser.");
    return;
}

// Request notification permission from the user
const permission = await Notification.requestPermission();
if (permission !== "granted") {
    alert("Permission not granted for notifications");
    return;
}

// Register the service worker (sw.js should handle push events)
const registration = await navigator.serviceWorker.register("/sw.js");

// Ensure the service worker is ready
await navigator.serviceWorker.ready;

// Subscribe to push notifications using the VAPID public key
const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // Ensures notifications are always visible to the user
    applicationServerKey: urlBase64ToUint8Array(vapid), // Convert VAPID key to Uint8Array
}).then(sub => sub.toJSON()); // Convert subscription object to JSON format

// Log the subscription object for debugging
console.log("Subscription object:", subscription);

// Send the subscription details to Skapi to store the user's push subscription
await skapi.subscribeNotification(subscription.endpoint, subscription.keys);
```

## Unsubscribing to Notifications

To stop receiving notifications, users need to unsubscribe by calling the method [`unsubscribenotification()`](/api-reference/realtime/README.md#unsubscribenotification) and passing the endpoint and keys as parameters. 

### Steps:
1. Retrieve the current push subscription from `navigator.serviceWorker.ready.pushManager.getSubscription()`.
2. If a subscription exists, call `unsubscribe()` on it.
3. Notify Skapi by calling [`unsubscribeNotification()`](/api-reference/realtime/README.md#unsubscribenotification).

### Code Example:
```js
// Ensure the service worker is ready before interacting with push notifications
const registration = await navigator.serviceWorker.ready;

// Retrieve the current push subscription (if it exists)
const subscription = await registration.pushManager.getSubscription();

// Check if there is an active subscription
if (!subscription) {
    console.error("No subscription found"); // Log an error if the user is not subscribed
    return;
}

// Convert the subscription object to a plain JSON format
const subscriptionJSON = subscription.toJSON();

// Unsubscribe the user from push notifications
await subscription.unsubscribe();

// Inform Skapi to remove this subscription from its records
const response = await skapi.unsubscribeNotification(subscription.endpoint, subscriptionJSON.keys);
```

## Service Worker (`sw.js`)

A service worker file (`sw.js`) is required to handle incoming push notifications and user interactions. It runs in the background, allowing notifications to be received even when the site is closed. This file must be present in your project and correctly registered; otherwise, push notifications won’t work.

### Code Example:
```js
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || "Default Title";
    const options = {
        body: data.body || "Default Body",
        icon: 'icon-192x192.png',
        badge: 'icon-192x192.png'
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    let url = event.target.location.origin;
    event.waitUntil(
        clients.openWindow(url)
    );
});
```

## Sending Notifications

You can let users use [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) to send notification to each other.
In case the recipient is not connected to realtime, you can set the `notification` argument to notify user with notification message.

```js
skapi.postRealtime(
    { msg: "Hello World!" },
    'recipient_user_id',
    { 
        title: "New Message",
        body: "Someone sent you a message!"
    }
).then(res => console.log(res));
```

If the receiver has subscribed to push notification API, they will receive the notification message that is set in `notification` argument.

Below example shows how to send notification regardless user is connected to realtime connection. By setting `always` options to `true`, notification will always be triggered or the receiver.

```js
skapi.postRealtime(
    { msg: "Hello World!" },
    'recipient_user_id',
    { 
        title: "New Message",
        body: "Someone sent you a message!",
        config: { always: true }
    }
).then(res => console.log(res));
```

## Sending Notifications (For Admins)

Admins can use the [`pushNotification()`](/api-reference/realtime/README.md#pushnotification) method to send notifications to users.
**Only admins** can use this method to send notifications to **all** users.
You can also target a specific user or multiple users by providing their IDs. If no user IDs are specified, the notification will be sent to all users who have subscribed to notifications in your system.

### Steps:
1. Call [`pushNotification()`](/api-reference/realtime/README.md#pushnotification) with the title and body.
2. Optionally, provide user IDs to send notifications to specific users.
3. If no user IDs are provided, the notification will be sent to all subscribers.

### Code Examples:
```js
skapi.pushNotification(
    { 
        title: "Hello",
        body: "Hi there!"
    }
); // Sends to all subscribers
```

```js
skapi.pushNotification(
    { 
        title: "Admin Alert",
        body: "Only for selected users"
    },
    ["user1", "user2"]
);
```
