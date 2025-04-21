# Skapi HTML Database Full Example

This is a HTML example for building photo uploading application using Skapi's database features.

This example features complex database examples such as:

- Posting an image file and description
- Post as a private data
- Posting comments
- Like button
- List post in order of most liked, most recent
- Seach post via hashtag
- Fetching more data (Pagination)

...All in a single HTML file - **welcome.html**

Users must login to post and fetch uploaded photos.

## Recommeded VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)


## Download

Download the full project [Here](https://github.com/broadwayinc/skapi-database-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/broadwayinc/skapi-database-html-template)


## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3300`

## Important!

Replace the `SERVICE_ID` and `OWNER_ID` value to your own service in `service.js`

Currently the service is running on **Trial Mode**.

**All the user data will be deleted every 14 days.**

You can get your own service ID from [Skapi](https://www.skapi.com)