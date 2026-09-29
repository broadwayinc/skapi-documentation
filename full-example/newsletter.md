# Full Example: Newsletter

The Newsletter page lets a visitor subscribe to your project's newsletter with their email address. No account is needed.

<FullExampleDemo page="newsletter.html" label="Open the Newsletter demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The Newsletter page of the template: a short explanation, an email address field and a Subscribe button](/screenshots/template-newsletter.webp)

*`newsletter.html`. One email field, and the group `public` in a hidden field.*

## What it demonstrates

- `newsletter.html` is one form with an email field and a hidden `group` field set to `public`, the newsletter for everyone. The submit event is passed straight to [subscribeNewsletter()](/email/newsletters.md): the `name` of each field is the name of the parameter.
- The method resolves to a message that the page shows to the visitor, and an error's message is shown the same way.
- You write and send the newsletters from your project's page at [skapi.com](https://www.skapi.com).

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
