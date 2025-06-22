# Handling Files

Skapi database is integrated with Skapi's cloud storage and CDN.
This allows you to upload any size of binary files to the database without any additional setup.

## Uploading Files

To upload files, you can use the HTML form `SubmitEvent` or `FormData` that includes `FileList` object when calling the [`postRecord()`](/api-reference/database/README.md#postrecord) method.

Additionally, We can log the progress of the upload by passing a [ProgressCallback](/api-reference/data-types/README.md#progresscallback) in the `progress` parameter in the second argument of [`postRecord()`](/api-reference/database/README.md#postrecord).
This can be useful if the user is uploading huge files, you can show a progress bar.

Here's an example demonstrating how you can upload files using Skapi:

```html
<form onsubmit="skapi.postRecord(event, { table: 'my_photos', progress: (p)=>console.log(p) })
    .then(rec=>console.log(rec))">
    <input name="description" />
    <input name="picture" multiple type="file" />
    <input type="submit" value="Submit" />
</form>
```

The `name` attribute of the `FormData` will serve as the key name of the file data.
The file(s) will be uploaded under the key name `picture` in the `bin` key of the [RecordData](/api-reference/data-types/README.md#recorddata) as shown below:
```js
// record data
{
    record_id: '...',
    ...,
    bin: {
        picture: [
            {
                access_group: 'authorized',
                filename: '...',
                url: 'https://...',
                path: '.../...',
                size: 1234,
                uploaded: 1234
                getFile: () => {...};
            },
            ...
        ]
    }
}
```

The `bin` data will contain lists of [BinaryFile](/api-reference/data-types/README.md#binaryfile) objects.
This process is handled seamlessly without any complicated file handling required.

Once the files are uploaded, Skapi serves the files using a CDN with no additional setup required.

## Progress Information

When uploading files via [`postRecord()`](/api-reference/database/README.md#postrecord) method, you can attach a [ProgressCallback](/api-reference/data-types/README.md#progresscallback) in the `progress` parameter when uploading files.
The [ProgressCallback](/api-reference/data-types/README.md#progresscallback) will trigger whenever there is a byte loaded to/from the backend.

```js
let progressCallback = (p) => {
    if(p.status === 'upload' && p.currentFile) {
        console.log(`Progress: ${p.progress}%`);
        console.log('Current uploading file:' + p.currentFile.name);
    }
}
skapi.postRecord(someData, { table: 'my_photos', progress: progressCallback })
```


## Downloading Files

To download files from the record, you can use the `getFile()` method on the [BinaryFile](/api-reference/data-types/README.md#binaryfile) object in the record.

Below is an example of how you can download a file from a record:

```js
skapi.getRecords({ record_id: 'record_id_with_file' }).then(rec => {
    let record = rec.list[0]; // record with files attached.
    
    /*
    // record
    {
        table: {
            name: 'my_photos',
            access_group: 'authorized'
        },
        record_id: '...',
        ...,
        bin: {
            picture: [
                {
                    access_group: 'authorized',
                    filename: '...',
                    url: 'https://...',
                    path: '.../...',
                    size: 1234,
                    uploaded: 1234
                    getFile: () => {...};
                },
                ...
            ]
        }
    }
    */

    let fileToDownload = record.bin.picture[0]; // get the file object from the record
    
    fileToDownload.getFile(); // browser will download the file.
});
```

:::info
Uploaded files follow the access restrictions of the record.
User must have access to the record in order to download the file.
:::

`getFile()` allows you to download the file in various ways:
- `blob`: Downloads the file as a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.
- `base64`: Downloads the file as a base64 string.
- `endpoint`: If the file access requires authentication or needs token update, you can request the a updated endpoint of the file.

If no argument is passed, the file will be downloaded from the web browser.

`getFile(dataType?: string, progress?: () => void )` method have two arguments:
- `dataType`: Type of ways for file to be downloaded. Can be `"blob"` or `"base64"` or `"endpoint"` url. By default, it will trigger download from the web browser.
- `progress`: Progress callback function. Can be useful when downloading large file as a blob and you want to show progress bar. (Will not work when download type is `endpoint` or web browser download.)

If the file has private access restriction, you must use the `endpoint` type to get the file endpoint URL.
The endpoint URL will be a signed URL that can expire after a certain amount of time.

If the file is an image or a video, you can use the url on img tag or video tag to display the file.

Below is an example of how you can get the endpoint URL of the access restricted private file (The user must have private access granted.):

```js
fileToDownload.getFile('endpoint').then(url => {
    console.log(url); // endpoint of the file. https://...
});

```

Below is an example of how you can download a file as a blob, base64 with progress callback:

```js
let progressInfo = p => {
    console.log(p); // Download progress information
};

fileToDownload.getFile('blob', progressInfo).then(b => {
    console.log(b); // Blob object of the file.
});

fileToDownload.getFile('base64', progressInfo).then(b => {
    console.log(b); // base64 string
});
```

## Removing Files

To remove files, use the `remove_bin` parameter in the `config` argument of the [`postRecord()`](/api-reference/database/README.md#postrecord) method.
When updating a record, you can remove files by passing the `remove_bin` parameter as an array of [BinaryFile](/api-reference/data-types/README.md#binaryfile) objects or the endpoint url of the file that need to be removed from the record.

Here's an example demonstrating how you can remove files from a record:

```js
...
let fileToDelete = record.bin.picture[0]; // file object retrieved from the record.
skapi.postRecord(undefined, { record_id: 'record_id_with_file', remove_bin: [fileToDelete] });
```

If you have the endpoint URL of the file, you can also just pass the URL as a string in the `remove_bin` parameter:

```js
skapi.postRecord(undefined, { record_id: 'record_id_with_file', remove_bin: ['https://...'] });
```

If you want to remove all files from the record, you can pass the `remove_bin` parameter as `null`:

```js
skapi.postRecord(undefined, { record_id: 'record_id_with_file', remove_bin: null }); // removes all files from the record.
```

## Get File Information

You can use [`getFile()`](/api-reference/database/README.md#getfile) method to get the file information just from the endpoint URL of the file.

Below is an example of how you can get the file information from the endpoint URL:

```js
let fileUrl = 'https://...';
skapi.getFile(fileUrl, { dataType: 'info' }).then(fileInfo => {
    console.log(fileInfo);
    /*
    {
        url: string,
        filename: string,
        access_group: number | 'private' | 'public' | 'authorized',
        filesize: number,
        record_id: string,
        uploader: string,
        uploaded: number,
        fileKey: string
    }
    */
});
```