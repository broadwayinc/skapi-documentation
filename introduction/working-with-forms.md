
# Working with HTML forms

Skapi allows you to pass an HTML `SubmitEvent` as an argument for methods that accepts `SubmitEvent`.
The `<input>` element's `name` attribute will be used as the parameter keys for the method.

Here is an example of using a `<form>` with Skapi:

```html
<form onsubmit="skapi.mock(event).then(r => console.log(r)).catch(err => alert(err.message))">
  <input name="name">
  <input name="msg">
  <input type="submit" value='Mock'>
</form>
```

Above example is equivalent to the following code:

```html
<input id="name">
<input id="msg">
<button onclick="runMock()">Mock</button>
<script>
  async function runMock() {
    let name = document.getElementById("name");
    let msg = document.getElementById("msg");

    try {
      let r = await skapi.mock({ name: name.value, msg: msg.value });
      console.log(r);
    }
    catch (err) {
      alert(err.message);
    }
  }
</script>
```

Skapi's form handling simplifies the process of handling form submissions in web applications, allowing developers to easily retrieve and process form data without the need for handling it manually.



## Using the `action` attribute in the `<form>` element

If you specify a URL in the `action` attribute of the `<form>` element, the user will be redirected to that page upon a successful request.

On the new page, you can use the `skapi.getFormResponse()` method to retrieve the resolved data from the previous page.

Example below shows how users can submit a form in `index.html`, then fetch the resolved data from a new redirected page `welcome.html`.

For this example, create two HTML files in the same directory.

```
.
├─ index.html
└─ welcome.html
```

:::code-group
```html [index.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<form onsubmit="skapi.mock(event)" action="welcome.html">
  <input name="name">
  <input name="msg">
  <input type="submit">
</form>

<script>
    // Replace 'service_id' and 'owner_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id', 'owner_id');
</script>
```

```html [welcome.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1>Welcome <span id='your_name'></span></h1>
<p id='message'></p>

<script>
    // Replace 'service_id' and 'owner_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id', 'owner_id');
    
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
Each of the pages should have the Skapi library imported and initialized.

Wheras in a single-page application, It may not be necessary to redirect users to a new page.
:::