# Hosting your website

Skapi provides a straight forward hosting project for your website.
You can host your website with Skapi by simply uploading your website files in your `Web Hosting` page.

## Registering Your Subdomain

Before you upload your website files, you must register a subdomain for your website.
Go to `Web Hosting` page. If the project does not have a subdomain, it will ask you to make one.

A subdomain is 5 to 32 characters long and can use lowercase letters, digits and hyphens.
It cannot start or end with a hyphen, or have two hyphens in a row.

Since every website is hosted under `skapi.com`, names that could pass as an official page are reserved and cannot be registered:

- Skapi's own addresses and brand, such as `tutorial` or `skapi-support`.
- Sign-in, payment, support and notice pages, such as `checkout`, `password-reset` or `secure-login`.
- Names of banks, payment services and other brands that are impersonated for logins, such as `paypal` or `mybank-verify`, and any brand next to a sign-in or support word, such as `netflix-login`.

A brand used for a project of your own, such as `netflix-clone` or `kakao-map-demo`, can be registered.

:::warning The subdomain is a project setting
Registering a subdomain, moving it and dropping it belong to the **project owner's Skapi account**. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of the project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
Uploading and deleting the hosted **files** is different: admins do that as usual, so a project stays deployable without the owner.
:::

:::danger A temporarily banned subdomain
Skapi can temporarily ban a subdomain, for example one reported for abuse. While it is banned the site is offline, and the subdomain of the project cannot be changed or removed: every request is refused with `INVALID_REQUEST` and `Current subdomain "<name>" is temporarily banned.` The name stays reserved to the project during the ban.
:::

<!-- 
![subdomain register](/hosting.png)
 -->

## Uploading Your Website Files

Once you have registered your subdomain, you can upload your website files by drag and dropping your files in the file section which is at the bottom section of your `Web Hosting` page.

When the files are uploaded, all the files will be hosted in your subdomain.
For example, if you registered `mywebsite` as your subdomain, and have uploaded a file named `yourfile.ext`, the file will be hosted publicly in `https://mywebsite.skapi.com/yourfile.ext`.

:::info
- When you overwrite a file with the same name, the file will be replaced with the new file.
- When overwriting or deleting a file, please allow couple of minutes (15 minutes max) for CDN to update it's cache.
:::

:::danger
Since the files are hosted publicly, **DO NOT** upload any sensitive files in your hosting page.
:::
## index.html

If you have an `index.html` file in your root level, it will be hosted in your subdomain's root directory.
<!-- 
![hosting uploaded](/hostuploaded.png) -->

For example, if `index.html` file is hosted in the root directory of the subdomain.
The `index.html` will also be served when the user visits `https://mywebsite.skapi.com/`.


## Setting the 404 Page

You can set the 404 page for your website from the `404 Page` section, which is in the upper section form on your `Web Hosting` page.
This HTML file will be served when the user visits a page that does not exist in your website.

Choosing it is a project setting, so only the **project owner's Skapi account** can, and an admin is refused with `Only the project owner can change project settings.`

:::danger
If you are using **SPA framework** such as Vue, React, or Angular, **YOU MUST** set the 404 page to your **`index.html`** file.
:::

