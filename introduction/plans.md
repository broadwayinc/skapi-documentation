# Plans and Limits

Every project runs on one of three plans.
The Skapi dashboard shows the Trial plan as **Free**; this documentation uses the name **Trial**, which is what the API and the plan card call it.
The limits below are per project.

| | Trial | Standard | Premium |
| --- | --- | --- | --- |
| Price | Free | $19 per month | $89 per month |
| User accounts | 50 | 50,000 | 100,000 |
| Database storage | 500 MB | 3 GB | 10 GB |
| File storage, pooled | 1 GB | 120 GB | 600 GB |
| Email storage | 50 MB | 1 GB | 5 GB |
| E-mail sends per month | 50 | 5,000 | 50,000 |
| Newsletter subscribers | 50 | 5,000 | 50,000 |
| Bandwidth per month | 10 GB | 100 GB | 400 GB |
| Past a limit | Stop | Stop | Billed as overage |

One Trial limit is counted per owner rather than per project: across every Trial project one owner has, 200 newsletter mails per calendar month, on top of each project's own 50.
Standard and Premium are always counted per project and have no owner cap.

File storage is one pooled figure covering your web hosting, your record file attachments and your AI indexed files.

A Trial project never expires and needs no card.

## Trial and Standard: hard stop

The Trial and Standard plans stop at their limits instead of billing you for the excess.

- New signups past the user limit are refused.
- Record writes past the database storage limit are refused.
- File uploads past the file storage limit are refused.
- Newsletter sends past the monthly limit are refused, and so are subscriptions past the subscriber limit. One newsletter costs one send per subscriber it goes to, so one send to a full Trial list of 50 subscribers uses all 50 monthly sends. A Trial project is also refused once its owner has used the 200 newsletter mails a month their Trial projects share.
- When database storage or file storage goes over the plan limit, the project is suspended. Email storage never suspends a project: the oldest newsletters are deleted to make room instead.

Writes stop at the limit, so a project normally never gets far past one.
A project that is over a storage limit anyway, for example because it moved to a smaller plan, is suspended.

## Suspended projects

While a project is suspended, its end users cannot use it.
API requests, sign in, signups, file links and hosted pages are refused, and the API answers `SERVICE_DISABLED: The service is suspended.`

You keep access in the Skapi dashboard.
You can open the project, list its records, its files, its hosting files and its newsletters, and delete any of them.
Other settings are locked until the project is back to normal.

A suspended project returns to normal on its own as soon as its stored data is back under every limit of its plan.
Nothing has to be clicked, and the dashboard has a **Check again** button while you wait.
Subscribing to, or upgrading to, a plan that holds the project's data also brings it back.
Enabling a suspended project from the dashboard is refused with `Cannot enable a suspended service. Delete data until storage is under the plan limits, or upgrade the plan.`

A project that is still suspended 30 days later is permanently deleted, with all of its data.
A project with an active subscription is never deleted: it stays suspended until its data fits.

We e-mail the project owner when a project is suspended, and again at least 7 days before it would be deleted.
The dashboard shows which limits are over, by how much, the earliest date the project could be deleted, and a link to the page where that data can be deleted.

## Premium: overage

The Premium plan has no hard stop.
Past an included limit the excess is metered and added to your next invoice, and nothing is ever refused or suspended for going over.

| Metric | Rate past the included limit |
| --- | --- |
| File storage | $0.05 per GB-month |
| Database storage | $0.50 per GB-month |
| Email storage | $0.10 per GB-month |
| E-mail sends | $1.00 per 1,000 |
| Newsletter subscribers | $1.00 per 1,000 subscribers-month |
| Bandwidth | $0.12 per GB, not billed yet |
| Monthly active users | Free |

Storage overage is time weighted rather than a high water mark, so a project that sits over a limit for two days pays for two days and not for the month.

## Bandwidth

Every plan includes a monthly bandwidth allowance, counted from CDN and storage access logs and reset at the start of each UTC month.
Your project's current figure is on its plan card in the dashboard.

Bandwidth is metered but not enforced yet.
Requests past the allowance are still served, and Premium bandwidth past the allowance is not billed.
Both will be announced before either is switched on.
When enforcement is on, a Trial or Standard project past its allowance gets `EXCEED_LIMIT: Service has exceeded monthly bandwidth limit.` on downloads and hosted pages until the next month starts.
A project is never suspended for bandwidth, and Premium is never refused.

## Email storage

Newsletters you send are stored, and they count against the plan's email storage limit.

On the Trial and Standard plans, exceeding email storage deletes the oldest newsletters to reclaim space, and the project is never suspended for it.
Trial includes 50 MB and Standard 1 GB.
On the Premium plan nothing is ever deleted and the excess is billed.

See [Sending Newsletters](/email/newsletters.md) for the send and subscriber limits.

## Newsletter complaints

On every plan, a project stops sending newsletters when, in the current UTC month, it reaches 5 spam complaints, or a complaint rate of 0.5 percent once at least 100 mails have gone out, whichever comes first.

Only newsletter sending stops.
The project keeps working, its automated e-mails keep going out, and nothing about it is suspended or deleted.
An upgrade does not lift the block and it does not clear itself when the month rolls over: Skapi staff clear it after looking at the project, so contact us if yours is blocked.

Whenever a newsletter is refused, for this, for the per-owner Trial cap or for the project's own monthly sends, the sender gets a reply from the project's newsletter endpoint address saying which limit was reached.

## Cancelling and failed payments

Cancelling a paid plan keeps that plan until the end of the billing period.
The project then moves to the Trial plan.
The cancellation alone never suspends it; it is suspended only if it holds more than Trial allows on that day, and the cancel dialog in the dashboard tells you beforehand if it does.

If a payment fails, the paid plan stays in place while the payment provider retries the charge.
Only when every payment retry has failed does the project move to the Trial plan.

## Large record data

Record `data` larger than 32 KB is stored as a file in your project's file storage instead of in the database, and it counts toward file storage rather than database storage.

The SDK puts it back together for you, so `record.data` still comes back whole.
