# What is a database?

A database is storage for your web application's data.

That data can be simple values (such as comments, likes, or ratings) or files (such as images, documents, and videos). It should be stored securely, read efficiently, and indexed in a way that makes searching and organizing easy.

With Skapi, you can store anything from small JSON objects to large binary files up to 5 TB per file. Skapi handles security, indexing, and file storage for you.

Files are served through a CDN, and access is controlled by the access group set by the uploader.

Skapi's database is user-centric, which means frontend developers can configure schema behavior and security rules directly.

With this approach, you can get started quickly without complex setup or rigid schema definitions.

In this section, you will learn how to store and retrieve data, and how Skapi's indexing system helps you search it efficiently.