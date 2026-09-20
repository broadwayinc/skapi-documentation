# Managing Newsletter Subscribers

This page is for the project owner and admins.
The users of your app only subscribe, check and unsubscribe their own address, as [Sending Newsletters](/email/newsletters.md) describes.

The project owner reads and searches the subscribers of a newsletter from the `Newsletters` page of the Skapi dashboard.
An admin does it with [`getNewsletterSubscription()`](/api-reference/email/README.md#getnewslettersubscription), and what an admin gets back depends on their access group.

## Who can read the subscriber list

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

## Searching subscribers by e-mail

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

`email` works on the numeric groups and on [named newsletters](/email/newsletters.md#named-newsletters) alike.
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
