# Instructions

Build a complete web application using static HTML files with backend functionality powered by Skapi.

# Requirements

## Backend Integration

- Use the Skapi API to implement all backend features
- Refer to the provided Skapi API documentation file: skapi.md. If the documentation file is not provided, use the following URL for Skapi API documentation: https://docs.skapi.com/skapi.md. Do not proceed if both the API documentation file is not given and public internet access is restricted.

Read the entire API documentation carefully to make informed decisions about implementing backend features.

If the service ID and owner ID are not provided, always ask for them before proceeding. Also inform the user to reference the following URL for more information: https://docs.skapi.com/introduction/getting-started.html
If both service ID and owner ID are not given, do not proceed.

## Implementing 3rd Party APIs

If the application needs to call 3rd party APIs requiring secret keys:

1. Ask for the client secret key name configured in Skapi. Also inform the user to reference the following URL for more information: https://docs.skapi.com/api-bridge/client-secret-request.html. If the client secret key is not given, do not proceed.
2. Confirm whether the client secret is public or private:
   - Public: User login is not required.
   - Private: User login is required before use.
3. Use `skapi.clientSecretRequest()` with the provided secret key name.

## Coding Guidelines

- Always pass HTML form onsubmit events directly to the Skapi API method if the method takes `SubmitEvent` as the first argument. Be aware that not all Skapi API methods take `SubmitEvent` as an argument.
- Always check the data types and structure from the documentation when using the Skapi API.
- Use defensive programming practices when accessing data fetched from the database.
- Handle potential null/undefined values and implement proper error handling.

## Page Routing and Navigation

- Set the starting page as `index.html`.
- Ensure all form actions point to their correct destination pages so the app functions correctly when opened locally (e.g., via the `file://` protocol).

## Authentication and Initialization

- Each HTML page must initialize the skapi-js library on load.
- Implement login state checks on each page.
- Redirect unauthenticated users when accessing restricted pages.

## Styling Guidelines

- Use a modern, material-style design unless requested otherwise.
- Ensure buttons and input elements are sized appropriately to match current UI standards.
- Use consistent box-sizing (e.g., `border-box`) to prevent layout issues, especially for elements with `width: 100%`.
