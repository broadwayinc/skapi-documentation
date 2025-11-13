# Utilities

Skapi provides several utility functions used throughout the library.

These include:

- `MD5`: MD5 hasher
- `generateRandom`: Random string generator
- `toBase62`: Number to Base62 string converter
- `fromBase62`: Base62 string to number converter
- `extractFormData`: Extracts form values as a JavaScript object
- `terminatePendingRequests`: Terminates pending requests
- `request`: Skapi's HTTP request helper

## MD5 Hasher
Computes the MD5 hash of a string.

Example:
```js
let md5String = skapi.util.md5.hash("string to hash"); // outputs string
```

## Random String Generator

Generates a random string of the specified length.

Example (6 characters):
```js
let randomString = skapi.util.generateRandom(6); // outputs string
```

## Number to Base62 String Converter

Converts a number to its Base62 string representation.
```js
let base62String = skapi.util.toBase62(1234); // outputs string
```

## Base62 String to Number

Converts a Base62 string back to a number.
```js
let numberFromBase62 = skapi.util.fromBase62("xxxx"); // outputs number
```

## Extract Form Values as a JavaScript Object

Pass a `FormData` instance, a `SubmitEvent`, or a form element to `skapi.util.extractFormData()` to get a plain JavaScript object of the form values.

```ts
extractFormData(
    form: FormData | HTMLFormElement | SubmitEvent | { [key: string]: any } | number | string | boolean | null,
    options?: {
        nullIfEmpty?: boolean,
        ignoreEmpty?: boolean,
    },
    callback?: (name: string, value: any) => any
): { data: any, files: { name: string, file: File }[] }
```

Example usage:

```html
<form onsubmit="
    event.preventDefault();
    console.log(skapi.util.extractFormData(event).data);
">
  <input name="hello" placeholder="Say Hi">
  <input type="submit">
</form>
```

The above example is equivalent to the following code:

```html
<input id="hello" placeholder="Say Hi">
<button onclick="run()">Submit</button>
<script>
  function run() {
    console.log({
        hello: document.getElementById("hello").value
    })
  }
</script>
```

When a submit event is passed, the method automatically converts form input values into key–value pairs. Each input `name` becomes the object key; the value depends on the input type.

### Nested Values and Arrays

You can create nested values and arrays by using the `[]` syntax in the `name` attribute.
The resolved structure depends on input types.

If the key inside `[]` is a number, Skapi resolves the value as an array.

```html
<form id="my_form" onsubmit="event.preventDefault(); console.log(skapi.util.extractFormData(event).data);">
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
    <input type="submit">
</form>
```

Or pass the form element directly:

```js
let form = document.getElementById("my_form");
console.log(skapi.util.extractFormData(form).data);
```

The examples above resolve to:

```ts
{
  user: {
    name: string,
    age?: number,
    skills?: "JavaScript" | "Python",
    ide?: "Vim" | "Emacs" | ("Vim" | "Emacs")[]
  },
  check: boolean[]
}
```

Skapi structures user input based on input type and name pattern:
- Number inputs become numbers.
- Radio inputs resolve to the selected value.
- Checkbox inputs resolve to booleans, or to the value string if one is specified.
- Multiple inputs sharing the same name (without `[]`) are converted into an array when appropriate.