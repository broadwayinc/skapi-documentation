
# Working with HTML forms

Skapi's form handling simplifies the process of handling form submissions in web applications, allowing developers to easily retrieve and process form data without the need for handling it manually.

You can pass `SubmitEvent` to the first argument of the Skapi methods.

Here is an example of using a `<form>` with Skapi:

```html
<form onsubmit="skapi.mock(event).then(r => alert(r.hello)).catch(err => alert(err.message))">
  <input name="hello" placeholder="Say Hi">
  <input type="submit" value="Mock">
</form>
```

Above example is equivalent to the following code:

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

## Nested values and arrays

You can pass nested values and arrays by using the `[]` syntax in the `name` attribute.
Depending on the input type, the resolved data will be structured accordingly.

```html
<form onsubmit="skapi.mock(event).then(r => console.log(r))">
    <input name="user[name]" placeholder="Name"><br>
    <input name="user[age]" type="number" placeholder="Age"><br>
    Skills:<br>
    <input name="user[skills]" type="radio" value="JavaScript"> JavaScript<br>
    <input name="user[skills]" type="radio" value="Python"> Python<br>
    IDE:<br>
    <input name="user[ide][]" type="checkbox" value="Vim">Vim<br>
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

As you can see, Skapi provides convenient form data handling by structuring user input data based on the input type and the `name` attribute.
Number inputs will be resolved as numbers, radio inputs will be resolved as chosen value, and checkbox inputs will be resolved as boolean or string if value is given.
If multiple inputs share the same name with out using `[]` syntax, Skapi will try to convert the values in to an array.


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