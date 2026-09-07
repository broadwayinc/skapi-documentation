# Sending Newsletters

You can send newsletters or project newsletters to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Go to `Newsletters` page, select the email type, and the page will show the email endpoint address to send the newsletter.

:::danger Sending newsletters requires a paid plan
The Trial plan includes **0 e-mail sends per month**, and that limit is a hard stop.
A newsletter sent from a Trial project is refused before it reaches a single subscriber.
Nothing is delivered, and the address you sent it from receives a `Monthly email send limit reached. Consider upgrading your plan.` notice instead.

Upgrade the project to send newsletters:

| Plan | E-mail sends per month |
| --- | --- |
| Trial | 0 |
| Standard | 5,000 |
| Premium | 50,000, and past that billed as overage at $1.00 per 1,000 sends |

The same number is shown as **Monthly Email Sends** on your project's plan card in the Skapi dashboard.
Automated e-mails, such as the signup confirmation and the newsletter subscription confirmation, are not newsletter sends and do not count against this limit.
:::

## Sending Public Newsletters

You can send public newsletters to your users by sending your email to the endpoint email.

First, the users must subscribe to the public newsletter to receive your public newsletters:

:::code-group
```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input type="email" name="email" placeholder='your@email.com'/>
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

For more detailed information on all the parameters and options available with the [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter) method, 
please refer to the API Reference below:

### [`subscribeNewsletter(params, callbacks):Promise<string>`](/api-reference/email/README.md#subscribenewsletter)

:::warning
If the user is logged in, they will not be asked to confirm their email address.
Instead, they must have their [`email verifed`](/user-account/email-verification).
:::

## Sending Project Newsletters
  
You can send project newsletters to your users with an account. To subscribe to project newsletters the user must be logged in.
Project newsletters can be useful to send information, notifications, and other project-related emails.

First, user must subscribe to the project newsletter to receive the email.

:::warning
- User must be logged in to subscribe to your project newsletters.
- User must have their email verified to subscribe to your project newsletters.
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

The example above shows how to let your visitors subscribe to the project newsletters by calling [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter).

## Named Newsletters

Your service is not limited to a single mailing list.
You can register **named newsletter groups**, and each group keeps its own subscribers, its own sending address, and its own sent mail history.
For example, one service can run a `bunnyquery` list next to a `skapi` list, and a subscriber of one never receives the other.

A group name is 2 ~ 20 lowercase alphanumeric characters, has to contain at least one letter, and cannot be one of the reserved names: `tp`, `admin`, `public`, `authorized`, `newsletter`, `forward`, `all`, `true`, `false`, `null`.
A name that reads as a number in exponent notation, such as `1e5`, is refused as well.

Every group is registered with a `restriction`, which decides who may subscribe to it, and who may read its sent mail:

| `restriction` | Type | Who can subscribe |
| --- | --- | --- |
| `0` | Named public newsletter | Anyone. Visitors subscribe with their email address and confirm it by email, exactly like the public newsletter. |
| `1` | Named service newsletter | Any logged in user with a verified email, exactly like the project newsletter. |
| `2` ~ `99` | Named service newsletter | Logged in users with a verified email, whose access group is equal to or higher than the value. |

In short, a named **public** newsletter is open to your visitors, and a named **service** newsletter is open only to the users of your service.
That is the same difference as the one between the public newsletter and the project newsletter above, and the only thing that changes is that the list is addressed by name instead of by number.

The numeric groups are untouched by any group you register: `public` (group `0`), `authorized` (group `1`) and the access groups `2` ~ `99` keep working exactly as they do today.

### Registering a named newsletter group

Only the service owner can register a group, and a service can hold up to 20 of them.

```js
skapi.registerNewsletterGroup({
    group: 'bunnyquery',
    restriction: 0, // defaults to 0
    name: 'BunnyQuery news' // optional display label, 60 characters max
}).then(res => alert(res)); // SUCCESS: Group registered successfully.
```

:::warning
A group's name and restriction are fixed once it is registered.
Registering a name that already exists fails with `Group already exists.`, and changing a restriction means deleting the group and registering it again, which also deletes its subscribers.
:::

For more detailed information on all the parameters and options available with the [`registerNewsletterGroup()`](/api-reference/email/README.md#registernewslettergroup) method, 
please refer to the API Reference below:

### [`registerNewsletterGroup(params):Promise<string>`](/api-reference/email/README.md#registernewslettergroup)

### Subscribing to a named newsletter

Subscribing works exactly as it does for the public and the project newsletter: give the group name where you would have given `public` or `authorized`.

:::code-group
```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input type="email" name="email" placeholder='your@email.com'/>
    <input hidden name="redirect" value="https://your.domain.com/successpage"/>
    <input hidden name="group" value="bunnyquery"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    email: 'users@email.com',
    redirect: 'https://your.domain.com/successpage',
    group: 'bunnyquery'
}).then(res => alert(res));
```
:::

When the group's restriction is `0`, an anonymous subscriber receives a confirmation email and is redirected to the `redirect` url once the link is clicked, just like the public newsletter.
Named newsletters always carry an unsubscribe link at the bottom of the email.

:::warning
`email` and `redirect` are only for groups with `restriction: 0`.
To subscribe to a group with a higher restriction, the user must be logged in, must have their [`email verified`](/user-account/email-verification), and their access group must be equal to or higher than the group's restriction.
Otherwise the request fails with `Access denied. Your access group is insufficient to subscribe to group "bunnyquery".`
:::

[`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription), [`unsubscribeNewsletter()`](/api-reference/email/README.md#unsubscribenewsletter) and [`getNewsletters()`](/api-reference/email/README.md#getnewsletters) all take a group name in the same place:

```js
skapi.getNewsletterSubscription({ group: 'bunnyquery' }).then(subs => {
    // subscriptions of the 'bunnyquery' group
});

skapi.unsubscribeNewsletter({ group: 'bunnyquery' }).then(res => {
    // user is unsubscribed from the 'bunnyquery' newsletter
});

skapi.getNewsletters({ searchFor: 'timestamp', value: Date.now(), condition: '<', group: 'bunnyquery' }).then(newsletters => {
    // newsletters.list is an array of newsletters sent to the 'bunnyquery' group
});
```

### Getting the sending address of a named newsletter

A named group has an endpoint address of its own, carrying the group name in the middle:

```
xxxxxxxxxxxxxxxxxxxx-bunnyquery-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Call [`newsletterGroupEndpoint()`](/api-reference/email/README.md#newslettergroupendpoint) to list every named group of your service with its endpoint address and its subscriber count.
Only the service owner can call it.

```js
skapi.newsletterGroupEndpoint().then(res => {
    // res.groups is an array of the named newsletter groups
    /*
    [{
        group: 'bunnyquery', // Name of the group
        restriction: 0, // Access group required to subscribe
        name: 'BunnyQuery news', // Display label of the group
        subscribers: 1204, // Number of subscribers of the group
        endpoint: 'xxxxxxxxxxxxxxxxxxxx-bunnyquery-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com' // Address to send the newsletter to
    }]
    */
})
```

Send your email to that address, and it goes out to every subscriber of that group.

:::warning
The newsletter has to be sent **from your service's email address**.
An email that reaches the endpoint from any other address is refused, so knowing the address is not enough to send a newsletter as your service.
`endpoint` comes back as an empty string when your service has no sender email set.
:::

### Deleting a named newsletter group

```js
skapi.deleteNewsletterGroup({
    group: 'bunnyquery'
}).then(res => alert(res)); // SUCCESS: Group has been deleted along with 1204 subscription(s).
```

:::warning
Deleting a group deletes every subscription of that group with it.
Those subscribers are gone for good, and registering the same name again starts from an empty list.
A group with a very large number of subscribers may take more than one call: the response tells you how many subscriptions were removed, and the group is only gone once the call succeeds.
:::

### Subscriber limit

Subscribers are counted per service, across every newsletter group together, named and numeric.

| Plan | Subscribers |
| --- | --- |
| Standard | 5,000 |
| Premium | 50,000 |

On the Standard plan, a subscription past the limit is refused with `Newsletter subscriber limit reached. Consider upgrading your plan.`

On the Premium plan the excess is metered instead of stopped: new subscribers keep being accepted, and the subscribers past the limit are billed as overage, currently $1.00 per 1,000 subscribers-month.

A Trial project can still collect subscribers, and the subscribe and confirmation flow works normally.
It just cannot send a newsletter to them, so the limit above applies from the plan you send on.

## Checking if the user is subscribed to the project newsletters

You can let the user check if they have subscribed to the project newsletters by calling [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription).

[`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription) may resolve either to a bare array of subscriptions or to a `DatabaseResponse` object (with a `.list` property) when the response is paginated. Normalize the result before checking its length:

```js
skapi.getNewsletterSubscription({
    group: 'authorized'
}).then(subs => {
    const list = Array.isArray(subs) ? subs : subs.list;
    if (list.length) {
        // user is subscribed to the project newsletter
    }
    else {
        // no subscription
    }
})
```

## Unsubscribing from the project newsletters

You can let the user unsubscribe from the project newsletters by calling [`unsubscribeNewsletter()`](/api-reference/email/README.md#unsubscribenewsletter).

```js
skapi.unsubscribeNewsletter({
    group: 'authorized'
}).then(res => {
    // user is unsubscribed from the project newsletter
})
```

## Fetching Sent Emails

You can fetch sent emails from the database by calling [`getNewsletters()`](/api-reference/email/README.md#getnewsletters).
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
        delivered: number; // Number of users the newsletter was delivered to
    }  
    */
})
```

For more detailed information on all the parameters and options available with the [`getNewsletters()`](/api-reference/email/README.md#getnewsletters) method, 
please refer to the API Reference below:

### [`getNewsletters(params, options?): Promise<DatabaseResponse<Newsletter>>`](/api-reference/email/README.md#getnewsletters)

### Fetching Sent Emails with Conditions

You can fetch sent emails from the database with conditions by calling [`getNewsletters()`](/api-reference/email/README.md#getnewsletters).

Below is an example of fetching project newsletters that are sent to the project users before 24 hours ago in descending order.

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
        delivered: number; // Number of users the newsletter was delivered to
    }  
    */
})
```