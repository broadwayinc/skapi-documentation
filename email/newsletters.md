# Sending Newsletters

You can send public newsletters or Service Email to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Go to `Newsletters` page, select the tab (`Newsletter`, `Service Email` or a named group), and the page will show the email endpoint address to send the newsletter.

:::warning Only the project owner sends newsletters
A newsletter is sent by the **project owner**, from the **project's email address**, to the endpoint address the `Newsletters` page shows.
Admins of your project, access group `99` included, cannot send newsletters.
Mail from any other address is not processed. When that address passes the sender trust check below, Skapi replies to it that only the project owner can send newsletters.
:::

:::tip Newsletters work on every plan, Trial included
A Trial project can collect newsletter subscribers and send newsletters to them.
The Trial plan includes **50 e-mail sends per month**, **50 newsletter subscribers** and **50 MB of e-mail storage**.

A send costs one e-mail send per subscriber it is delivered to.
One newsletter to a full list of 50 subscribers therefore uses all 50 sends of a Trial project, so the Trial allowance is one full send a month.

| Plan | E-mail sends per month |
| --- | --- |
| Trial | 50 per project, and 200 per owner across all their Trial projects |
| Standard | 5,000 per project |
| Premium | 50,000 per project, and past that billed as overage at $1.00 per 1,000 sends |

The per-project number is shown as **Monthly Email Sends** on your project's plan card in the Skapi dashboard.
Automated e-mails, such as the signup confirmation and the newsletter subscription confirmation, are not newsletter sends and do not count against this limit.
On the Trial and Standard plans, a send past the monthly limit is refused with `Monthly email send limit reached. Consider upgrading your plan.`

Sending also stops on every plan once a project collects too many spam complaints, and a refused newsletter is always answered by a reply from the endpoint address. See [Sending limits](#sending-limits) below.
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
The newsletter has to be sent **from your service's email address**, by the project owner.
An email that reaches the endpoint from any other address is refused, so knowing the address is not enough to send a newsletter as your service.
`endpoint` comes back as an empty string when your service has no sender email set.
:::

:::warning Your address must pass the sender trust check
Skapi only accepts a newsletter from an address whose mail passes **SPF, DKIM and DMARC**, the checks that prove an email really comes from the address it names.
Mail that fails any of them, or comes from a domain that publishes none of them, is treated as suspicious and is not processed. Skapi replies to your address with a notice that lists each check and its result.
If you get that notice, ask your email provider, or whoever manages your domain, to check the trust settings (SPF, DKIM and DMARC) of your address, then send it again.
Addresses at the large email providers usually pass these checks already.
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
| Trial | 50 |
| Standard | 5,000 |
| Premium | 50,000 |

On the Trial and Standard plans, a subscription past the limit is refused with `Newsletter subscriber limit reached. Consider upgrading your plan.`

On the Premium plan the excess is metered instead of stopped: new subscribers keep being accepted, and the subscribers past the limit are billed as overage, currently $1.00 per 1,000 subscribers-month.

Subscribers a project already has are kept when it moves to the Trial plan, and newsletters can still be sent to them.
Only new subscriptions are refused while the count is over the Trial limit of 50.

### Sending limits

Three things can stop a newsletter, whatever plan the project is on.

**The project's own monthly sends.** Sends are counted **per recipient**, not per newsletter: one newsletter to a full list of 50 subscribers uses 50 sends. A Trial project has 50 a month, Standard 5,000, Premium 50,000 with the excess billed. Only newsletter fan-out counts. Signup confirmations, e-mail verification, template setter mail and every other system e-mail are not newsletter sends.

**The per-owner Trial cap.** On top of each Trial project's own 50 sends, one owner can send **200 newsletter mails per calendar month (UTC) in total across every Trial project they have**. The counter is the same per-recipient count, added up over all of the owner's Trial projects. Standard and Premium projects are always counted per project and have no owner cap, so moving a project to a paid plan takes it out of the shared pool.

**The complaint shutoff, on every plan.** A project stops sending newsletters when, in the current UTC month, it reaches **5 spam complaints**, or a **complaint rate of 0.5 percent** once at least 100 mails have gone out, whichever comes first. Only newsletter sending stops: the project keeps working, every other e-mail it sends keeps working, and nothing about it is suspended or deleted. The block is not lifted by an upgrade and does not clear itself at the start of the next month. Skapi staff clear it after looking at the project, so [contact Skapi](mailto:support@broadwayinc.com) if your project is blocked.

You can watch this on the `Newsletters` page of the dashboard: every sent newsletter lists its complaints, its bounces and how many subscribers it reached.

**Every refusal is answered.** When a newsletter is refused, for the complaint shutoff, for the per-owner Trial cap or for the project's own monthly sends, the sender gets a reply **from the project's newsletter endpoint address** saying which limit was reached and what to do about it: send less, upgrade the plan, or contact Skapi when it is a complaint shutoff. Nothing is delivered to your subscribers in that case, and no sends are spent.

### Email storage

Sent newsletters are stored, and they count against the plan's email storage limit: 50 MB on Trial, 1 GB on Standard and 5 GB on Premium.

On the Trial and Standard plans, exceeding email storage deletes the oldest newsletters to reclaim space, and the project is never suspended for it.
On the Premium plan nothing is deleted and the excess is billed as overage.

A project that moves to the Trial plan with more than 50 MB of sent newsletters stored is therefore not suspended for them: its oldest newsletters are deleted until the rest fits.
The Premium plan never deletes a newsletter to make room.
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

:::tip Reading every subscriber is an admin feature
Called by a user of your app, [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription) returns that user's own subscriptions only.
Listing and searching the whole subscriber list of a newsletter belongs to the project owner, from the `Newsletters` page of the Skapi dashboard, and to admins. See [Managing Newsletter Subscribers](/admin/newsletters.md).
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