# Full Example: Send Inquiry

The Send Inquiry page is a contact form. What a visitor writes in it is emailed to you, the project owner. No account is needed.

<FullExampleDemo page="inquiry.html" label="Open the Send Inquiry demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

## What it demonstrates

- `inquiry.html` is one form with the visitor's name, email address, a subject and a message. The submit event is passed to [sendInquiry()](/email/inquiries.md), which reads the four fields from the form.
- The form is disabled while the request runs, and the method's result, or the error's message, is shown under it.

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
