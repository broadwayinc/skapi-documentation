# Hosting your website

Skapi provides a straight forward hosting service for your website.
You can host your website with Skapi by simply uploading your website files in your `Hosting` page of your service.

## Registering Your Subdomain

Before you upload your website files, you must register a subdomain for your website.
You can register a subdomain from your `Hosting` page.

![subdomain register](/hosting.png)


## Uploading Your Website Files

Once you have registered your subdomain, you can upload your website files by drag and dropping your files in the `Upload` section of your `Hosting` page.

![hosting page](/hostingpage.png)

When the files are uploaded, all the files will be hosted in your subdomain.
For example, if you registered `mywebsite` as your subdomain, and have uploaded a file named `yourfile.ext`, the file will be hosted publicly in `https://mywebsite.skapi.com/yourfile.ext`.

:::danger
Since the files are hosted publicly, **DO NOT** upload any sensitive files in your hosting page.
:::
## index.html

If you have an `index.html` file in your root level, it will be hosted in your subdomain's root directory.

![hosting uploaded](/hostuploaded.png)

Example above shows that the `index.html` file is hosted in the root directory of the subdomain.
The `index.html` will be served when the user visits `https://mywebsite.skapi.com/`.


## Setting the 404 Page

You can set the 404 page for your website from the `HTML file for 404 page` at the top section of your `Hosting` page.

This HTML file will be served when the user visits a page that does not exist in your website.

:::warning
If you are using **SPA framework** such as Vue, React, or Angular, you must set the 404 page to your `index.html` file.
:::

