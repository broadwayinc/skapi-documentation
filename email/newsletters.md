# Sending Newsletters

You can send newsletters to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

In the `Mail` page, you can find the following endpoints at the **Newsletters** section.

## Public Newsletters

You can send public newsletters to your users by sending your email to the endpoint email.

First, the users must subscribe to the public newsletter to receive your public newsletters:

:::code-group
```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input type="email" name="email" placeholder='E-Mail address'/>
    <input hidden name="redirect" value="https://your.domain.com/successpage"/>
    <input hidden name="group" value="public"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    email: 'users@email.com',
    redirect: 'https://your.domain.com/successpage',
    group: 'public'
}).then(res => alert(res));
```
:::

The example above shows how to let your visitors subscribe to the public newsletter by calling [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter).

When the request is successful, user will receive a confirmation email to verify their email address.
User can confirm their email address by clicking the link in the email.
If the confirmation is successful, the user will be redirected to the redirect url provided in the [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter) parameter.

All the public newsletters will have unsubscribe link at the bottom of the email.
When the user clicks the unsubscribe link, they will no longer receive your public newsletters.

:::warning
If the user is logged in, they will not be asked to confirm their email address.
Instead, they must have their [`email verifed`](/user-account/email-verification).
:::

## Service Newsletters
  
You can send newsletters to your users with an account. The user with an account in your service receives the email if they have subscribed to the service newsletter.

First, user must subscribe to the service newsletter to receive the email.

:::warning
- User must be logged in to subscribe to your service newsletters.
- User must have their email verified to subscribe to your service newsletters.
:::

:::code-group

```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input hidden name="group" value="authorized"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    group: 'authorized'
}).then(res => alert(res));
```
:::

The example above shows how to let your visitors subscribe to the service newsletter by calling [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter).

### Checking user is subscribed to the service newsletter

You can let the user check if they have subscribed to the service newsletter by calling [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription).

```js
skapi.getNewsletterSubscription({
    group: 'authorized'
}).then(subs => {
    if (subs.length) {
        // user is subscribed to the service newsletter
    }
    else {
        // no subscription
    }
})
```

### Unsubscribing from the service newsletter

You can let the user unsubscribe from the service newsletter by calling [`unsubscribeNewsletter()`](/api-reference/email/README.md#unsubscribenewsletter).

```js
skapi.unsubscribeNewsletter({
    group: 'authorized'
}).then(res => {
    // user is unsubscribed from the service newsletter
})
```

## Fetching Newsletters

### [`getNewsletters(params, options?): Promise<DatabaseResponse<Newsletter>>`](/api-reference/email/README.md#getnewsletters)

You can fetch newsletters from the database by calling [`getNewsletters()`](/api-reference/email/README.md#getnewsletters).
By default, it fetches all the public newsletters from the database in descending timestamp.

In the newsletter object, the `url` is the URL of the html file of the newsletter. You can use the URL to fetch the newsletter content.

```js
skapi.getNewsletters().then(newsletters => {
    // newsletters.list is an array of newsletters
    /*
    {
        message_id: string; // Message ID of the newsletter
        timestamp: number; // Timestamp of the newsletter
        complaint: number; // Number of complaints
        read: number; // Number of reads
        subject: string; // Subject of the newsletter
        bounced: string; // Number of bounces
        url: string; // URL of the newsletter
    }  
    */
})
```

### Fetching Newsletters with conditions

You can fetch newsletters from the database with conditions by calling [`getNewsletters()`](/api-reference/email/README.md#getnewsletters).

Below is an example of fetching newsletters that are sent to the service users before 24 hours ago in descending order.

For full parameters and options, see [`getNewsletters(params, options?)`](/api-reference/email/README.md#getnewsletters).

```js
skapi.getNewsletters({
    searchFor: 'timestamp',
    value: Date.now() - 86400000, // 24 hours ago
    condition: '<',
    group: 'authorized',
}, { ascending: false }).then(newsletters => {
    // newsletters.list is an array of newsletters
    /*
    {
        message_id: string; // Message ID of the newsletter
        timestamp: number; // Timestamp of the newsletter
        complaint: number; // Number of complaints
        read: number; // Number of reads
        subject: string; // Subject of the newsletter
        bounced: string; // Number of bounces
        url: string; // URL of the newsletter
    }  
    */
})
```