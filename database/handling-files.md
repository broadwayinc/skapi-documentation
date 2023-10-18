# Handling Files

Skapi database is integrated with Skapi's cloud storage and CDN.
This allows you to upload any size of binary files to the database without any additional setup.

## Uploading Files

To upload files, you can use the HTML form `SubmitEvent` or `FormData` that includes `FileList` object when calling the [`postRecord()`](/api-reference/database/README.md#postrecord) method.

Additionally, We can log the progress of the upload by passing a [ProgressCallback](/api-reference/data-types/README.md#progresscallback) in the `progress` parameter in the second argument of [`postRecord()`](/api-reference/database/README.md#postrecord).
This can be useful if the user is uploading files more than 4MB, you can show a progress bar.

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

## Downloading Files

To download files from the record, you can use the `getFile()` method on the [BinaryFile](/api-reference/data-types/README.md#binaryfile) object in the record. The `getFile()` method has two arguments:

`getFile()` method have two arguments:
- `dataType`: Type of ways for file to be downloaded. Can be `blob` or `base64` or `endpoint` url. By default, it will trigger download from the web browser.
- `progress`: Progress callback function. Can be useful when downloading large file as a blob and you want to show progress bar. (Will not work when download type is `endpoint` or web browser download.)

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
    fileToDownload.getFile();
});
```

:::info
Uploaded files follow the access restrictions of the record.
User must have access to the record in order to download the file.
:::


## Removing Files

To remove files, use the `remove_bin` parameter in the `config` argument of the [`postRecord()`](/api-reference/database/README.md#postrecord) method.
When updating a record, you can remove files by passing the `remove_bin` parameter as an array of [BinaryFile](/api-reference/data-types/README.md#binaryfile) objects that need to be removed from the record.

Here's an example demonstrating how you can remove files from a record:

```js
...
let fileToDelete = record.bin.picture[0]; // file object retrieved from the record.
skapi.postRecord(undefined, { record_id: 'record_id_with_file', remove_bin: [fileToDelete] });
```