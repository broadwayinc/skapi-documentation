# API Reference: Notification

## vapidPublicKey

```ts
vapidPublicKey(): Promise<string>
```

## subscribeNotification

```ts
subscribeNotification({
    params: {
        endpoint: string; // The endpoint URL for the device to subscribe to notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the subscription.
        };
    }
}): Promise<'SUCCESS: Subscribed to receive notifications.'>
```

## unsubscribeNotification

```ts
unsubscribeNotification({
    params: {
        endpoint: string; // The endpoint URL for the device to unsubscribe from notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the unsubscription.
        };
    }
}): Promise<'SUCCESS: Unsubscribed from notifications.'>
```

## pushNotification

```ts
pushNotification({
    params: {
        {
            title: string; // The title of the notification.
            body: string; // The body content of the notification.
        },
        user_ids?: string | string[]; // Optional parameter to specify the user(s) for whom to send the notification.
    }
}): Promise<"SUCCESS: Notification sent.">
```