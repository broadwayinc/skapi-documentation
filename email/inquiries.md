# Receiving Inquiries

Skapi provides a built-in E-Mail service that allows you to receive inquiries from your users.

You can use [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) to let your visitors send inquiries to your e-mail.

## Sending Inquiry

:::code-group
```html [Form]
<form id="inquiry-form" onsubmit="skapi.sendInquiry(event).then(res => {
    alert(res) // 'SUCCESS: Inquiry has been sent.'
})">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    <label for="subject">Subject:</label>
    <input type="text" id="subject" name="subject" required>
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea>
    <button type="submit">Send Inquiry</button>
</form>
```

```js [JS]
let params = {
    name: 'John Doe',
    email: 'john@doe.com',
    subject: 'Inquiry',
    message: 'Hello, I have a question.'
}
skapi.sendInquiry(params).then(inquiry => {
    console.log(inquiry); // 'SUCCESS: Inquiry has been sent.'
});
```

:::warning
Inquires do not require the user to be logged in.

If you are not planning to use the [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) method,
Be sure to turn on the `Prevent Inquiry` option in the [Service Settings](/service-settings/service-settings.md) page to prevent spam.
:::