# Sending Newsletters

You can send public newsletters or Service Email to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
nl00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Every newsletter endpoint starts with `nl`, followed by the group number (`00` for Newsletter, `01` for Service Email) and the address code, with your project ID after the dot.
Endpoints in the older `xxxxxxxxxxxxxxxxxxxx-00xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com` format keep working, so a saved address does not need to be updated.

Go to `Newsletters` page, select the tab (`Newsletter`, `Service Email` or a named group), and the page will show the email endpoint address to send the newsletter.

![The Newsletters page of a Skapi project: one tab per list, the group's name as code gives it, the sending address with a Send link, monthly sends, subscribers with View and Add links, and the table of sent newsletters](/screenshots/newsletter-page.webp)

*The Newsletters page. Every list has its own sending address, its own subscriber count and its own history of sent mail.*

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

## The Newsletters page

Everything about sending happens on the `Newsletters` page of your project in the Skapi dashboard.

- **Tabs.** `Newsletter` is the public list anyone can join with an email address, `Service Email` is the list of your signed-in users, and every [named group](#named-newsletters) you create gets a tab of its own. **+ New group** creates one.
- **Send Newsletter.** The sending address of the selected list. Click the address to copy it, or click **[Send]** to open a new message to it in your mail app. Write the newsletter there, send it from your project's email address, and it goes out to every subscriber of that list with an unsubscribe link at the bottom.
- **Monthly sends.** How many sends this month have used out of the plan's allowance, and the rules that can stop a send.
- **Subscribers.** How many addresses are on this list and on all lists together. **[View]** opens the list, **[Add]** adds addresses by hand. See [Managing subscribers](#managing-subscribers).
- **Access.** On a named group's tab, who may subscribe, and **[Delete group]**.
- **Sent newsletters.** Every newsletter sent to this list with its subject, the date, and how many subscribers read it, complained about it or bounced. Select rows and use the trash icon to delete them from your email storage. Copies already delivered stay in subscribers' inboxes.

The page needs an **email alias**, the address your project sends from. Register it on your project's `Settings` page first: until then the page shows a notice and sends you there.

### Writing and sending a newsletter

A newsletter is an ordinary email. Write it in your own mail app and send it to the list's sending address:

1. Put the sending address of the list in **To**. **[Send]** on the `Newsletters` page opens a new message with it filled in.
2. Write the **subject** and the **body** as you would write any email. Formatting, links and images are delivered as they are.
3. Send it **from your project's email address**, the address your Skapi account is registered with.

![A mail compose window: From the project owner's address, To the newsletter sending address, a subject reading Spring menu is here, a short newsletter with a list of items, a link and an attached image, and a Send button](/screenshots/newsletter-compose.webp)

*Composing a newsletter. Any mail app works the same way; there is no editor to learn.*

Skapi forwards the email to every subscriber of that list, adds an unsubscribe link at the bottom, and the newsletter appears under **Sent newsletters** with its subject, the date, and how many subscribers read it, complained or bounced. A newsletter that cannot be sent is answered by a reply from the sending address that says why.

## Subscribing Users To Public Newsletters

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
Each link is signed for the address it was sent to, so it cannot be edited to unsubscribe someone else.

:::tip A ready-made subscription form
The [Newsletter example](/full-example/newsletter.md) of the full template is this form as a working page, already pointed at your project. Open it from **Application Examples** on your project's `Settings` page and link it, or copy its form into your own page.
:::

For more detailed information on all the parameters and options available with the [`subscribeNewsletter()`](/api-reference/email/README.md#subscribenewsletter) method, 
please refer to the API Reference below:

### [`subscribeNewsletter(params, callbacks):Promise<string>`](/api-reference/email/README.md#subscribenewsletter)

:::warning
If the user is logged in, they will not be asked to confirm their email address.
Instead, they must have their [`email verifed`](/user-account/email-verification).
:::

## Subscribing Users To Service Email

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

### Subscribing at signup

A user can be subscribed to a newsletter the moment they confirm their e-mail, by giving `email_subscription` to [`signup()`](/api-reference/authentication/README.md#signup).
It takes the newsletter to subscribe to:

| `email_subscription` | Subscribes the user to |
| --- | --- |
| `0` or `'public'` | The public newsletter (group `0`) |
| `1` or `'authorized'` or `true` | Service Email (group `1`) |
| The name of a named group, such as `'promo'` | That named newsletter group |
| `false` or left out | Nothing |

```js
skapi.signup(
    { email: 'user@email.com', password: 'password' },
    { signup_confirmation: true, email_subscription: 'promo' }
).then(res => alert(res));
```

The subscription is made when the user opens the signup confirmation link, which also verifies their e-mail. No separate newsletter confirmation e-mail is sent: the signup confirmation is the confirmation.

:::warning
- `signup_confirmation` is required. A user whose e-mail is never confirmed is never subscribed.
- A named group has to exist when `signup()` is called, otherwise the call fails with `Newsletter group "promo" does not exist for this service.` If the group is deleted before the user confirms, or its restriction asks for an access group the new account does not have, the user is created without the subscription.
- Only `0` and `1` are accepted as numbers. The access groups `2` ~ `99` are not newsletters a signup can choose; create a named group with that restriction instead.
:::

## Named Newsletters

Your service is not limited to a single mailing list.
You can create **named newsletter groups** on the `Newsletters` page, and each group keeps its own subscribers, its own sending address, and its own sent mail history.
For example, one service can run a `promo` list next to a `news` list, and a subscriber of one never receives the other.

A group name is 2 ~ 20 lowercase alphanumeric characters, has to contain at least one letter, and cannot be one of the reserved names: `tp`, `admin`, `public`, `authorized`, `newsletter`, `forward`, `all`, `true`, `false`, `null`.
A name that reads as a number in exponent notation, such as `1e5`, is refused as well.
`public` and `authorized` are reserved because they are the names of the two numeric groups: everywhere a group is given, including `email_subscription` at signup, `public` means group `0` and `authorized` means group `1`, so no named group can take them.

Every group is created with a `restriction`, which decides who may subscribe to it, and who may read its sent mail:

| `restriction` | In the dashboard | Type | Who can subscribe |
| --- | --- | --- | --- |
| `0` | Anyone | Named public newsletter | Anyone. Visitors subscribe with their email address and confirm it by email, exactly like the public newsletter. |
| `1` | Any signed in user | Named service newsletter | Any logged in user with a verified email, exactly like Service Email. |
| `2` ~ `99` | Access group and above | Named service newsletter | Logged in users with a verified email, whose access group is equal to or higher than the value. |

In short, a named **public** newsletter is open to your visitors, and a named **service** newsletter is open only to the users of your service.
That is the same difference as the one between the public newsletter and Service Email above, and the only thing that changes is that the list is addressed by name instead of by number.

The numeric groups are untouched by any group you create: `public` (group `0`), `authorized` (group `1`) and the access groups `2` ~ `99` keep working exactly as they do today.

### Creating a named group

Groups are created by the project owner on the `Newsletters` page. Click **+ New group**.

![The New Group dialog: a Name field, an optional Label field and a Subscribers choice of Anyone, Any signed in user or Access group and above](/screenshots/newsletter-group.webp)

*A named group: the name becomes part of its sending address, the label is what the tab shows, and Subscribers is the group's restriction.*

- **Name** is the group name described above. It becomes part of the group's sending address.
- **Label** is an optional display name, 60 characters at most, shown on the tab instead of the name.
- **Subscribers** is the restriction: **Anyone**, **Any signed in user**, or **Access group and above** with the access group number a user needs.

A service can hold up to 20 named groups.

:::warning
A group's name and restriction are fixed once it is created.
A name that already exists is refused, and changing a restriction means deleting the group and creating it again, which also deletes its subscribers.
:::

### Subscribing to a named newsletter

Subscribing works exactly as it does for the public newsletter and Service Email: give the group name where you would have given `public` or `authorized`.

:::code-group
```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input type="email" name="email" placeholder='your@email.com'/>
    <input hidden name="redirect" value="https://your.domain.com/successpage"/>
    <input hidden name="group" value="promo"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    email: 'users@email.com',
    redirect: 'https://your.domain.com/successpage',
    group: 'promo'
}).then(res => alert(res));
```
:::

When the group's restriction is `0`, an anonymous subscriber receives a confirmation email and is redirected to the `redirect` url once the link is clicked, just like the public newsletter.
Named newsletters always carry an unsubscribe link at the bottom of the email.

:::warning
`email` and `redirect` are only for groups with `restriction: 0`.
To subscribe to a group with a higher restriction, the user must be logged in, must have their [`email verified`](/user-account/email-verification), and their access group must be equal to or higher than the group's restriction.
Otherwise the request fails with `Access denied. Your access group is insufficient to subscribe to group "promo".`
:::

[`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription), [`unsubscribeNewsletter()`](/api-reference/email/README.md#unsubscribenewsletter) and [`getNewsletters()`](/api-reference/email/README.md#getnewsletters) all take a group name in the same place:

```js
skapi.getNewsletterSubscription({ group: 'promo' }).then(subs => {
    // subscriptions of the 'promo' group
});

skapi.unsubscribeNewsletter({ group: 'promo' }).then(res => {
    // user is unsubscribed from the 'promo' newsletter
});

skapi.getNewsletters({ searchFor: 'timestamp', value: Date.now(), condition: '<', group: 'promo' }).then(newsletters => {
    // newsletters.list is an array of newsletters sent to the 'promo' group
});
```

### The sending address of a named group

A named group has an endpoint address of its own, starting with `nl.` and the group name:

```
nl.promo-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

The older `xxxxxxxxxxxxxxxxxxxx-promo-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com` format keeps working too.

Select the group's tab on the `Newsletters` page. The **Send Newsletter** row shows the address, the **Subscribers** row shows how many addresses the group holds, and the **Access** row shows who may subscribe.

![A named group's tab on the Newsletters page: its name as code gives it, its own sending address, its subscriber count, an Access row reading Anyone can subscribe, and a Delete group link](/screenshots/newsletter-named-group.webp)

*A named group has its own address, its own count and an Access row.*

Send your email to that address, and it goes out to every subscriber of that group.

:::warning
The newsletter has to be sent **from your service's email address**, by the project owner.
An email that reaches the endpoint from any other address is refused, so knowing the address is not enough to send a newsletter as your service.
The address is shown once your project has an email alias.
:::

:::warning Your address must pass the sender trust check
Skapi only accepts a newsletter from an address whose mail passes **SPF, DKIM and DMARC**, the checks that prove an email really comes from the address it names.
Mail that fails any of them, or comes from a domain that publishes none of them, is treated as suspicious and is not processed. Skapi replies to your address with a notice that lists each check and its result.
If you get that notice, ask your email provider, or whoever manages your domain, to check the trust settings (SPF, DKIM and DMARC) of your address, then send it again.
Addresses at the large email providers usually pass these checks already.
:::

### Deleting a named group

Only the project owner deletes a group. On the group's tab, click **[Delete group]** on the **Access** row and confirm.

![The Delete Group confirmation: the group will be permanently deleted along with its subscribers, the newsletters sent to it and its sending address](/screenshots/newsletter-delete-group.webp)

*Deleting a group removes its subscribers, the newsletters sent to it and its sending address with it.*

:::warning
Deleting a group deletes every subscription of that group and every newsletter sent to it.
Those subscribers and that sent mail are gone for good, and creating the same name again starts from an empty list.
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

## Managing subscribers

This section is for the project owner and admins.
The users of your app only subscribe, check and unsubscribe their own address, as the sections above describe.

The project owner reads, searches and adds the subscribers of a list from the `Newsletters` page of the Skapi dashboard.
An admin reads them with [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription), and what an admin gets back depends on their access group.

### Viewing and searching subscribers

Select the list's tab and click **[View]** on the **Subscribers** row.

![The Subscribers dialog: the count for this group and for all groups, a search field, the list of addresses and Prev and Next paging](/screenshots/newsletter-subscribers.webp)

*The subscriber list of a group, sorted by e-mail address.*

The list is sorted by e-mail address and paged with **Prev** and **Next**.
The search field finds the subscribers whose e-mail address **starts with** what you type: `john` finds `john@example.com` and `johnny@example.org`, but not `bigjohn@example.com`.

![The Subscribers dialog after searching for "ana": only the addresses that start with ana are listed](/screenshots/newsletter-search.webp)

*Searching matches the start of the address.*

### Adding subscribers by hand

Not every subscriber comes through a form. To move a list from another tool, or to add customers who asked in person, click **[Add]** on the **Subscribers** row.

![The Add Subscribers dialog with three pasted addresses staged and a button reading Add 3 subscribers](/screenshots/newsletter-add.webp)

*Paste addresses, check the staged list, then add them.*

Paste the addresses, one per line or separated by commas, and click **Add to list**.
Malformed addresses are set aside and shown, duplicates are folded together, and the addresses that remain are listed so you can remove one before you click **Add**.

Addresses added this way are subscribed **right away, without a confirmation mail**, so add only people who have asked to hear from you.
Everyone else should come in through the subscription form, which confirms the address first.

The `Service Email` tab has no **[Add]**: its subscribers are your users, who subscribe and unsubscribe with their own account.

### Who can read the subscriber list

The **whole subscriber list** of a newsletter is available to the **project owner** and to **admins** (access groups `90` ~ `99`).

The project owner opens it on the `Newsletters` page, as shown above.

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

Use the token to key rows, selections and counts while you work with a listing, across its calls and pages. **Do not store it as a lasting id for a subscriber**: the platform can reissue tokens, and after that the same subscriber reads as a new token.
A caller who reads addresses in full gets **no** `subscriber_token` at all: the property is simply absent from the row.

**Paging works normally, but hand the cursor back unchanged.** For an admin in access groups `90` ~ `98` the `startKey` of a page comes back sealed, as `{ seal: '...' }` instead of the database's own key, because the raw key names the last row of the page with its address in full. Ordering, page size, `endOfList` and `{ fetchMore: true }` are unchanged, and `fetchMore` replays the sealed cursor for you.
If you pass a `startKey` yourself, pass back **exactly** the object the previous page returned. Rebuilding it, editing it, adding a key to it, or carrying it to another project, group or account is refused with `INVALID_PARAMETER` and `"startKey" does not belong to this request.`

Reading **another user's own subscriptions** by `user_id` is masked for admins in access groups `90` ~ `98` as well, as it always has been. That call answers with one subscriber's rows and no cursor, so it carries no `subscriber_token`: there is nothing to tell apart. See [Newsletters, subscribers and notifications](/admin/permissions.md#newsletters-subscribers-and-notifications).
:::

An admin can also pass another user's `user_id` to read that user's own subscriptions, masked in access groups `90` ~ `98`. Everyone else gets `No access.` for a `user_id` that is not their own.
An admin reading their **own** subscriptions passes their own `user_id`, which comes back unmasked, because a `group` with no `user_id` is the group listing for any admin.

### Searching subscribers by e-mail

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

:::tip Reading every subscriber is an owner and admin feature
Called by a user of your app, [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription) returns that user's own subscriptions only.
Listing and searching the whole subscriber list of a newsletter belongs to the project owner, from the `Newsletters` page, and to admins. See [Managing subscribers](#managing-subscribers).
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
