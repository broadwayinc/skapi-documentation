# What is a database?

A database is where your web application stores data.

This data can include simple values such as comments, likes, and ratings, or files such as images, documents, and videos. A good database stores data securely, retrieves it efficiently, and organizes it with indexes so it is easy to search.

With Skapi, you can store everything from small JSON objects to large binary files up to 5 TB per file. Skapi handles security, indexing, and file storage for you.

Files are served through a CDN, and access is controlled by the access group set by the uploader.

Skapi uses a user-centric database model. This means the uploader can define schema behavior and security rules before uploading data to the Skapi backend.

This approach helps you get started quickly without complex setup or rigid schema definitions.

In this section, you will learn how to store and retrieve data, and how Skapi indexing helps you query it efficiently.