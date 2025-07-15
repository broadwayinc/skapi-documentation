# Instructions

Build a complete web application using static HTML files with backend functionality powered by Skapi.

# Requirements

## Backend Integration

- Use the Skapi API to implement all backend features
- Refer to the provided Skapi API documentation file: skapi.md. If the documentation file is not provided, use the following URL for Skapi API documentation: https://docs.skapi.com/skapi.md.

Read the entire API documentation carefully to make informed decisions about implementing backend features.

If the service ID and owner ID are not provided, always ask for them before proceeding. Also inform me to the following URL for more information: https://docs.skapi.com/introduction/getting-started.html


## Implementing 3rd Party APIs

If the application needs to call 3rd party APIs requiring secret keys:

1. If the client secret key name configured in Skapi is not provided, always ask for them before proceeding. Also inform me to the following URL for more information: https://docs.skapi.com/api-bridge/client-secret-request.html.
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

- Use a modern, material-style design unless specific design requirements are provided.
- Ensure buttons and input elements are sized appropriately to match current UI standards.
- Use consistent box-sizing (e.g., `border-box`) to prevent layout issues, especially for elements with `width: 100%`.
