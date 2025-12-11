# Hosting your website

Skapi provides a straight forward hosting service for your website.
You can host your website with Skapi by simply uploading your website files in your `Web Hosting` page.

## Registering Your Subdomain

Before you upload your website files, you must register a subdomain for your website.
Go to `Web Hosting` page. If the service does not have a subdomain, it will ask you to make one.

<!-- 
![subdomain register](/hosting.png)
 -->

## Uploading Your Website Files

Once you have registered your subdomain, you can upload your website files by drag and dropping your files in the file section which is at the bottom section of your `Web Hosting` page.

When the files are uploaded, all the files will be hosted in your subdomain.
For example, if you registered `mywebsite` as your subdomain, and have uploaded a file named `yourfile.ext`, the file will be hosted publicly in `https://mywebsite.skapi.com/yourfile.ext`.

:::info
- When you overwrite a file with the same name, the file will be replaced with the new file.
- When overwriting or deleting a file, please allow couple of minutes for CDN to update it's cache.
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

:::danger
If you are using **SPA framework** such as Vue, React, or Angular, **YOU MUST** set the 404 page to your **`index.html`** file.
:::

