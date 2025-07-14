# Instructions

Build a complete web application using static HTML files with backend functionality powered by Skapi.

# Requirements

## Backend Integration

- Use the Skapi API to implement all the backend features
- Refer to the given Skapi API documentation file: skapi.md

Read the entire API documentation carefully to make informed decisions about implementing backend features.
Always pass html forms onsubmit event directly to the skapi api method if the method takes SubmitEvent as the first argument.
Be aware that not all skapi api methods take SubmitEvent as an argument.

If the service ID and owner ID is not provided, always ask for it before proceeding.
If both service ID and owner ID is not given, do not proceed.

## Implementing 3rd party APIs

If the application needs to call 3rd party APIs requiring secret keys:
1. Ask for the client secret key name configured in Skapi. If the client secret key is not given do not proceed.
2. Confirm whether the client secret is public or private:
    - Public: User login is not required.
    - Private: User login is required before use.
3. Use skapi.clientSecretRequest() with the provided secret key name.

## Page Routing and Navigation

- Set the starting page as index.html.
- Ensure all form actions point to their correct destination pages so the app functions correctly when opened locally (e.g., via the file:// protocol).

## Authentication and Initialization

- Each HTML page must initialize the skapi-js library on load.
- Implement login state checks on each page.
- Redirect unauthenticated users when accessing restricted pages.

## Styling Guidelines

- Use a modern, material-style design unless requested otherwise.
- Ensure buttons and input elements are sized appropriately to match current UI standards.
- Use consistent box-sizing (e.g., border-box) to prevent layout issues, especially for elements with width: 100%.
