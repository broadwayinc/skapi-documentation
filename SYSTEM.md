# Instructions

Build a complete web application using **static HTML files**, with all backend functionality powered by **Skapi**.

If you are using a **SPA framework** (e.g., React, Vue, Svelte, etc.), you **must**:

1. Import the Skapi JavaScript library in the main `index.html` of the project.
2. Initialize the `Skapi` class there.

```html
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
  const skapi = new Skapi("SERVICE_ID", "OWNERS_ID");
</script>
```

- SERVICE_ID and OWNERS_ID must be replaced with the actual values I provide.
- In SPA projects, the Skapi instance must be accessible as window.skapi.

# Requirements

## Backend Integration

- Use only the Skapi API to implement all backend features.
  - Refer to the Skapi API documentation: https://docs.skapi.com/skapi.md
  - If the skapi.md file is given, refer that instead.
- When working with Skapi methods, always check parameter and return types in the Skapi Data Types documentation: https://docs.skapi.com/skapi-types.md
  - If the skapi-types.md file is given, refer that instead.

**Important:**
Before implementing backend features, read the relevant Skapi API documentation carefully.
If the documentation file is large, read it in manageable chunks

If `SERVICE_ID` and `OWNERS_ID` are not provided, ask for them before proceeding.

## Implementing 3rd Party APIs

If the application needs to call 3rd-party APIs that require secret keys:

1. If the client secret key name configured in Skapi is not provided, ask for it before proceeding.
2. Confirm whether the client secret is public or private:
   - **Public:** User login is not required
   - **Private:** User login is required before use
3. Use `skapi.clientSecretRequest()` with the provided secret key name to make requests to 3rd party APIs.
4. If I seem unsure, instruct me to review the Skapi documentation for this feature:
https://docs.skapi.com/api-bridge/client-secret-request.html

## Coding Guidelines

- Always pass HTML form `onsubmit` events directly to the Skapi API method if the method takes `SubmitEvent` as the first argument. Note that not all Skapi API methods accept `SubmitEvent` as an argument.
- Always verify data types and structure from the documentation when using the Skapi API.
- Use defensive programming practices when accessing data fetched from the database.
- Handle potential `null`/`undefined` values and implement proper error handling.
- When using `postRecord()` or `getRecords()`:
   - Follow the special-character rules for `index`, `tags`, and `table` parameters.
   - `table` names, `tags`, and `index` names must not contain any special characters or whitespace except: [ \ ] ^ _ ` : ; < = > ? @
   - `index` names may contain a period (`.`), which is used for compound index names. Periods are not allowed in `table` names, `tags`, or non-compound `index` names.

## When Building with Plain HTML

### Page Routing and Navigation

- The starting page must be `index.html`.
- Ensure all form `action` attributes and links point to the correct pages so the app works when opened locally (e.g., via the `file://` protocol).

### Authentication and Initialization

- Every HTML page must initialize the `skapi-js` library on load.
- Implement a check for the user’s login state on each page.
- Redirect unauthenticated users away from any restricted pages.
