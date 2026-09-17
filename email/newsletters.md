# Sending Newsletters

You can send public newsletters or Service Email to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Go to `Newsletters` page, select the tab (`Newsletter`, `Service Email` or a named group), and the page will show the email endpoint address to send the newsletter.

:::danger Newsletters require a paid plan
On the Trial plan, newsletters are turned off: subscribing is refused, and sending is refused.
The Trial plan includes **0 e-mail sends per month** and **0 newsletter subscribers**, and both limits are hard stops.
A newsletter sent from a Trial project is refused before it reaches a single subscriber.
Nothing is delivered, and the address you sent it from receives a `Newsletters are not available on this plan. Consider upgrading your plan.` notice instead.

Upgrade the project to send newsletters:

| Plan | E-mail sends per month |
| --- | --- |
| Trial | 0 |
| Standard | 5,000 |
| Premium | 50,000, and past that billed as overage at $1.00 per 1,000 sends |

The same number is shown as **Monthly Email Sends** on your project's plan card in the Skapi dashboard.
Automated e-mails, such as the signup confirmation and the newsletter subscription confirmation, are not newsletter sends and do not count against this limit.
On the Standard plan, a send past the monthly limit is refused with `Monthly email send limit reached. Consider upgrading your plan.` instead.
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

## Sending Service Email

Service Email (group `1`, `authorized`) is the mailing list for your users with an account. To subscribe to Service Email the user must be logged in.
Service Email can be useful to send information, notifications, and other project-related emails.

First, user must subscribe to Service Email to receive the email.

:::warning
- User must be logged in to subscribe to your Service Email.
- User must have their email verified to subscribe to your Service Email.
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

The example above shows how to let your users subscribe to Service Email by calling [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter).

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
| `1` | Named service newsletter | Any logged in user with a verified email, exactly like Service Email. |
| `2` ~ `99` | Named service newsletter | Logged in users with a verified email, whose access group is equal to or higher than the value. |

In short, a named **public** newsletter is open to your visitors, and a named **service** newsletter is open only to the users of your service.
That is the same difference as the one between the public newsletter and Service Email above, and the only thing that changes is that the list is addressed by name instead of by number.

The numeric groups are untouched by any group you register: `public` (group `0`), `authorized` (group `1`) and the access groups `2` ~ `99` keep working exactly as they do today.

### Registering a named newsletter group

Only the project owner and admins in access group `99` can register a group, and a service can hold up to 20 of them. Every other account, admins in access groups `90` ~ `98` included, gets `No access.`

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

Subscribing works exactly as it does for the public newsletter and Service Email: give the group name where you would have given `public` or `authorized`.

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
Only the project owner and admins in access group `99` can call it, like the other named group methods.

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

Only the project owner and admins in access group `99` can delete a group.

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
| Trial | 0 |
| Standard | 5,000 |
| Premium | 50,000 |

On the Trial plan the limit is 0, so every subscription is refused with `Newsletter subscriptions are not available on this plan. Consider upgrading your plan.`

On the Standard plan, a subscription past the limit is refused with `Newsletter subscriber limit reached. Consider upgrading your plan.`

On the Premium plan the excess is metered instead of stopped: new subscribers keep being accepted, and the subscribers past the limit are billed as overage, currently $1.00 per 1,000 subscribers-month.

Subscribers a project already has are kept when it moves to the Trial plan, but no newsletter can be sent to them until it is on a paid plan again.

### Email storage

Sent newsletters are stored, and they count against the plan's email storage limit: none on Trial, 1 GB on Standard and 5 GB on Premium.

On the Standard plan, exceeding email storage deletes the oldest newsletters to reclaim space, and the project is never suspended for it.
The Trial plan never deletes. It includes no email storage, so a Trial project is suspended once its stored newsletters go past 10 MB, the same way it is suspended for database or file storage.
On the Premium plan nothing is deleted and the excess is billed as overage.

A project that moves to the Trial plan with sent newsletters still stored can therefore be suspended on the day it moves, so delete them before the paid period ends.
See [Plans and Limits](/introduction/plans.md) for what a suspended project can and cannot do.

## Checking if the user is subscribed to Service Email

You can let the user check if they have subscribed to Service Email by calling [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription).

[`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription) may resolve either to a bare array of subscriptions or to a `DatabaseResponse` object (with a `.list` property) when the response is paginated. Normalize the result before checking its length:

```js
skapi.getNewsletterSubscription({
    group: 'authorized'
}).then(subs => {
    const list = Array.isArray(subs) ? subs : subs.list;
    if (list.length) {
        // user is subscribed to Service Email
    }
    else {
        // no subscription
    }
})
```

### Who can read the subscriber list

The **whole subscriber list** of a newsletter is available to the **project owner** and to **admins** (access groups `90` ~ `99`).

The project owner can open the `Newsletters` page of the Skapi dashboard, select the newsletter, and click `[View]` on the Subscribers row.
The list is sorted by e-mail address, and the search bar finds the subscribers whose e-mail address **starts with** what you type: `john` finds `john@example.com` and `johnny@example.org`, but not `bigjohn@example.com`.

An admin gets the same list by calling [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription) with a `group` and no `user_id`.
The result is sorted by e-mail address and paginated like any `DatabaseResponse`:

```js
// signed in as an admin (access group 90 ~ 99)
skapi.getNewsletterSubscription({
    group: 'public'
}, { limit: 100 }).then(res => {
    const list = Array.isArray(res) ? res : res.list;
    // subscribers of the public newsletter
    // in access groups 90 ~ 98 a row comes back masked, with a token beside the mask:
    // { timestamp: 1000, group: 0, active: true,
    //   subscribed_email: "j**@**.com",
    //   subscriber_token: "2eUY7PRYvgv3sTKMoO2BuupbnS2o_6jDlU2p2o95lxXvgQsTpSFN4c5zfBfS" }
    if (!Array.isArray(res) && !res.endOfList) {
        // call again with { fetchMore: true } for the next page
    }
})
```

Every other user gets **their own** subscriptions from the same call and cannot list the subscribers of a newsletter.

:::warning Admins in access groups 90 ~ 98 read masked addresses
The subscriber list of a group returns every `subscribed_email` **masked**, as `j**@**.com`, to an admin in access groups `90` ~ `98`.
The **project owner**, **Skapi staff** and admins in access group **`99`** read the addresses in full, so grant access group `99` only to accounts you trust with every subscriber address. Every user reading their own subscriptions reads their own address in full.

**A masked address is not an address.** You cannot send mail to it, and it is not unique: `john@example.com` and `jane@example.com` both come back as `j**@**.com`. Never key a list, a `Set`, a selection or a distinct count on it.

**`subscriber_token` is what tells two masked rows apart.** Every masked row of a group listing carries one, beside the masked address. It is **stable**, so the same subscriber gives the same token on every call and on every page, and it is **distinct**, so two different addresses never give the same one. Key your rows on it, and your list stops losing the subscribers the mask reads alike.

The token is opaque: it is not a readable address, your code cannot turn it back into one, and it is not something to display or to mail. It is **scoped** to the project, the project owner and the newsletter group, so the same subscriber carries a different token in another group, and a token from one group or project means nothing in another. Its length varies with the address, so keep it as a plain string.
A caller who reads addresses in full gets **no** `subscriber_token` at all: the property is simply absent from the row.

**Paging works normally, but hand the cursor back unchanged.** For an admin in access groups `90` ~ `98` the `startKey` of a page comes back sealed, as `{ seal: '...' }` instead of the database's own key, because the raw key names the last row of the page with its address in full. Ordering, page size, `endOfList` and `{ fetchMore: true }` are unchanged, and `fetchMore` replays the sealed cursor for you.
If you pass a `startKey` yourself, pass back **exactly** the object the previous page returned. Rebuilding it, editing it, adding a key to it, or carrying it to another project, group or account is refused with `INVALID_PARAMETER` and `"startKey" does not belong to this request.`

Reading **another user's own subscriptions** by `user_id` is masked for admins in access groups `90` ~ `98` as well, as it always has been. That call answers with one subscriber's rows and no cursor, so it carries no `subscriber_token`: there is nothing to tell apart. See [Newsletters, subscribers and notifications](/admin/permissions.md#newsletters-subscribers-and-notifications).
:::

An admin can also pass another user's `user_id` to read that user's own subscriptions, masked in access groups `90` ~ `98`. Everyone else gets `No access.` for a `user_id` that is not their own.
An admin reading their **own** subscriptions passes their own `user_id`, which comes back unmasked, because a `group` with no `user_id` is the group listing for any admin.

#### Searching subscribers by e-mail

Pass `email` together with `group` to get only the subscribers whose e-mail address **starts with** that text, the same search the dashboard runs.
`john` finds `john@example.com` and `johnny@example.org`, but not `bigjohn@example.com`.
The text is trimmed and matched in lowercase, the results come back sorted by e-mail address, and they page with `fetchMore` like the full list.

The search belongs to the **project owner**, **Skapi staff** and admins in access group **`99`**, the three that read addresses in full:

```js
// signed in as the project owner, as Skapi staff, or as an admin in access group 99
skapi.getNewsletterSubscription({
    group: 'public',
    email: 'john'
}, { limit: 100 }).then(res => {
    const list = Array.isArray(res) ? res : res.list;
    // subscribers of the public newsletter whose e-mail address starts with "john"
    if (!Array.isArray(res) && !res.endOfList) {
        // call again with { fetchMore: true } for more matches
    }
})
```

`email` works on the numeric groups and on [named newsletters](#named-newsletters) alike.
It requires `group`, and it cannot be combined with `user_id`.

:::danger The e-mail search is closed to admins in access groups 90 ~ 98
The search matches the **stored** address, never the mask, so an open search hands back a masked address one letter at a time: ask for `j`, then `jo`, then `joh`, and each answer says whether the guess was right. That is exactly the caller the mask exists for, so the search is refused for them, before anything is queried:

```ts
{
    code: "INVALID_REQUEST";
    message: "No access.";
}
```

It is the same refusal an account that is not an admin already gets for `email`, so nothing new has to be handled in your code.
An admin below access group `99` who needs to find a subscriber pages the group listing instead, and keeps track of the row with its `subscriber_token`.
:::

## Unsubscribing from Service Email

You can let the user unsubscribe from Service Email by calling [`unsubscribeNewsletter()`](/api-reference/email/README.md#unsubscribenewsletter).

```js
skapi.unsubscribeNewsletter({
    group: 'authorized'
}).then(res => {
    // user is unsubscribed from Service Email
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

Below is an example of fetching Service Email sent to the project users before 24 hours ago in descending order.

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