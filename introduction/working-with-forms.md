
# Working with HTML Forms

Skapi can handle HTML `onsubmit` events directly by passing the `SubmitEvent` as the first argument to Skapi methods.

This makes form handling much simpler. You can process and send form data without manually reading each field.

In this example, we use [`skapi.mock()`](/api-reference/connection/README.md#mock) to send a request and receive a response.

Here is an example of using a `<form>` with Skapi:

```html
<form onsubmit="skapi.mock(event).then(r => alert(r.hello)).catch(err => alert(err.message))">
  <input name="hello" placeholder="Say Hi">
  <input type="submit" value="Mock">
</form>
```

This is equivalent to writing the following code manually:

```html
<input id="hello" placeholder="Say Hi">
<button onclick="runMock()">Mock</button>
<script>
  async function runMock() {
    let helloMsg = document.getElementById("hello").value;

    try {
      let r = await skapi.mock({ hello: helloMsg });
      alert(r.hello);
    }
    catch (err) {
      alert(err.message);
    }
  }
</script>
```

When a form submit event is passed as the first argument to a Skapi method, Skapi automatically converts form input values into JavaScript key-value data. The input `name` becomes the key, and the value is resolved based on the input type.

## Nested Values and Arrays

You can create nested values and arrays by using the `[]` syntax in the `name` attribute.
The resolved data structure will depend on the input type.

If the key inside `[]` is a number, Skapi resolves the value as an array.

```html
<form onsubmit="skapi.mock(event).then(r => console.log(r))">
    <input name="user[name]" placeholder="Name"><br>
    <input name="user[age]" type="number" placeholder="Age"><br>
    Skills:<br>
    <input name="user[skills]" type="radio" value="JavaScript"> JavaScript<br>
    <input name="user[skills]" type="radio" value="Python"> Python<br>
    IDE:<br>
    <input name="user[ide]" type="checkbox" value="Vim">Vim<br>
    <input name="user[ide]" type="checkbox" value="Emacs">Emacs<br>
    Check:
    <input name="check[]" type="checkbox">
    <input name="check[]" type="checkbox">
    <br>
    <input type="submit" value='Mock'>
</form>
```

The above example will resolve to the following structure:

```ts
{
  user: {
    name: string,
    age?: number,
    skills?: "JavaScript" | "Python",
    ide?: "Vim" | "Emacs" | <"Vim" | "Emacs">[]
  },
  check: boolean[]
}
```

Skapi automatically structures user input based on input type and the `name` attribute.

Number inputs are resolved as numbers, radio inputs are resolved as the selected value, and checkbox inputs are resolved as boolean values or strings if a value is specified.

When multiple inputs share the same name without `[]`, Skapi attempts to convert the values into an array.


## Using Input Elements, Textarea, and Select Elements

Skapi also works with individual input elements, including text, number, radio, checkbox, textarea, and select elements.

```html
<input name="my_message" id="message_input">
<button onclick="skapi.mock(document.getElementById('message_input'))
  .then(r => alert(r.my_message))">Mock</button>
```

In this example, we use the `id` attribute to reference the input element and pass it directly to a Skapi method.

This approach is useful when you want to handle a single field instead of a full form.


## Using the `action` Attribute in the `<form>` Element

When you set a URL in a form's `action` attribute, the user is redirected to that page after a successful request.

On the destination page, use [`skapi.getFormResponse()`](/api-reference/connection/README.md#getformresponse) to retrieve the resolved data from the previous page.

The example below shows how to submit a form in `index.html` and read the resolved data in `welcome.html`.

For this example, create these two HTML files in the same directory.

```
.
├─ index.html
└─ welcome.html
```

:::code-group
```html [index.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    // Replace 'service_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id');
</script>

<form onsubmit="skapi.mock(event)" action="welcome.html">
  <input name="name">
  <input name="msg">
  <input type="submit">
</form>

```

```html [welcome.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1>Welcome <span id='your_name'></span></h1>
<p id='message'></p>

<script>
    // Replace 'service_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id');
    
    skapi.getFormResponse()
      .then((r) => {
        // Resolved data from skapi.mock()
        your_name.innerText = r.name;
        message.innerText = r.msg;
      });
</script>
```
:::

::: tip
When building a static website, you can use the `action` attribute to redirect users to a new page after a successful request.

Each page should have the Skapi library imported and initialized.

In a single-page application, redirecting to another page is often unnecessary.
:::