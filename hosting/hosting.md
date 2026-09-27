# Hosting your website

Skapi hosts the files of a static website under a subdomain of `skapi.com`, served over HTTPS through a CDN. Upload the files, and they are online.

Everything about hosting is done on your project's pages at [skapi.com](https://www.skapi.com), by the **project owner's Skapi account**:

- The address, the subdomain your site is served on, is registered, changed and removed on the project's **Settings** page.
- The files, the 404 page and the CDN are managed on the project's **Web Hosting** page.

## Registering your subdomain

Before you upload files, the project needs a subdomain. Open the project's **Settings** page and click **Register** in the **Web Hosting** card. The **Web Hosting** page itself sends you there while the project has no address.

The dialog checks the name as you type and lets you register it once it is available. A subdomain is 5 to 32 characters long and can use lowercase letters, digits and hyphens. It cannot start or end with a hyphen, or have two hyphens in a row. Your site is then served at `https://<name>.skapi.com`.

Since every website is hosted under `skapi.com`, names that could pass as an official page are reserved and cannot be registered:

- Skapi's own addresses and brand, such as `tutorial` or `skapi-support`.
- Sign-in, payment, support and notice pages, such as `checkout`, `password-reset` or `secure-login`.
- Names of banks, payment services and other brands that are impersonated for logins, such as `paypal` or `mybank-verify`, and any brand next to a sign-in or support word, such as `netflix-login`.

A brand used for a project of your own, such as `netflix-clone` or `kakao-map-demo`, can be registered.

A new address takes a few minutes to go live. Until then the card says that it is being set up, and the **Web Hosting** page cannot list files yet.

### Changing or removing the address

**Change** in the **Web Hosting** card moves the site to a new name. The old address is released and the new one set up, which again takes a few minutes; the file list is unavailable while the change is in process, and the name cannot be changed again until it is done.

**Remove** releases the address. The site stops being served there, and the files stay in storage, so registering a new name serves them again.

:::warning The subdomain is a project setting
Registering a subdomain, moving it and dropping it belong to the **project owner's Skapi account**. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of the project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
:::

:::danger A temporarily banned subdomain
Skapi can temporarily ban a subdomain, for example one reported for abuse. While it is banned the site is offline, the **Web Hosting** page says that the address has been suspended, and the subdomain of the project cannot be changed or removed: every request is refused with `INVALID_REQUEST` and `Current subdomain "<name>" is temporarily banned.` The name stays reserved to the project during the ban.
:::

## Uploading your website files

On the **Web Hosting** page, click **Upload Files**, use the folder icon next to it to upload a whole folder, or drag files or folders onto the file list. On a phone, tap the list to pick files.

Folders are kept: a file uploaded as `css/style.css` is served at `https://<name>.skapi.com/css/style.css`. The list shows one folder at a time; the path above it leads back up, and a folder row shows how many items it holds and their size.

A file uploaded to a path that already exists replaces the old file. Select files or folders to download them as a ZIP file or to delete them. A folder is deleted with everything inside it, and a delete cannot be undone.

:::info
- Only the **project owner** can upload and delete hosted files. Admins of the project cannot, access group `99` included.
- A file name cannot start with `#`: that character marks a folder in the file list, and the upload is refused.
- Hosted files count toward your plan's [file storage](/introduction/plans.md), together with record files and cloud files. The **Storage in Use** row on the page shows how much your site takes.
:::

:::danger
Since the files are hosted publicly, **DO NOT** upload any sensitive files in your hosting page.
:::

## index.html

The `index.html` file in the root of your site is served at `https://<name>.skapi.com/`, so it is the page a visitor gets for the address itself.

## Setting the 404 page

The **404 Page** row on the **Web Hosting** page names the file that answers when a visitor opens an address that does not exist on your site. Click **Upload** and pick an HTML file: it is uploaded to the root of your site and set as the 404 page. **Replace** uploads another file in its place, and **Remove** clears the setting; the file itself stays in the list.

Choosing it is a project setting, so only the **project owner's Skapi account** can, and an admin is refused with `Only the project owner can change project settings.`

:::danger
If you are using an **SPA framework** such as Vue, React, or Angular, **YOU MUST** set your **`index.html`** as the 404 page, so every route of your app is answered by it.
:::

## The CDN

Your files are served through a CDN. A new file is served as soon as it is uploaded. When you overwrite or delete a file, the CDN can keep serving the old copy for a while, and the **CDN** row on the **Web Hosting** page then says **Needs refresh**. Click **Refresh** to republish every file: it takes a few minutes, uploads and deletes are paused until it finishes, and the row reads **Up to date** when it is done.
