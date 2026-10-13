# Advanced Settings

You can pass additional options when initializing the `Skapi` class (see [Setting Up Your Codebase](/introduction/getting-started.md#setting-up-your-codebase)).

## new Skapi(...)

```ts
class Skapi {
  constructor(
    project_id: string, // Skapi project ID.
    options?: {
        autoLogin?: boolean;        // Default: true
        refetchServiceInfo?: boolean;// Default: false. Bypasses cached project information and fetches fresh information on every load.
        requestBatchSize?: number;  // Default: 50. Maximum number of requests processed per batch.
        encryption?: boolean | { // Default: false. Encrypts private record data in the browser. Can only be set during initialization. HTTPS is required.
            iterations?: number;             // Default: 600000. PBKDF2 cost. Minimum: 100000.
            minPasswordLength?: number;      // Default: 0 (off). Rejects passwords shorter than this value.
            persistDevice?: boolean;         // Default: true. Keeps encryption unlocked across page reloads on that device.
            recovery?: 'code' | 'none';      // Default: 'code'. Issues a one-time recovery code.
            trustPolicy?: 'tofu' | 'strict'; // Default: 'tofu'. Controls how a recipient's public key is trusted when sharing.
            withheld?: 'null' | 'sentinel';  // Default: 'null'. Specifies what `data` contains when a record cannot be decrypted.
            table?: string;                  // Default: '__skapi__keyring'. Reserved table for the user's keyring.
        };
        eventListener?: {
            onLogin?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onUserUpdate?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onBatchProcess?: (process: {
                batchToProcess: number; // Number of batches remaining
                itemsToProcess: number; // Number of items remaining
                completed: any[]; // Results completed in this batch
            }) => void;
        }
    }) {
    ...
  }
  ...
}
```

Options overview:

- `autoLogin` (boolean, default: true)
    - Automatically restores the user's session when the page loads.
    - See: [Auto Login](/authentication/login-logout.html#auto-login)

- `requestBatchSize` (number, default: 50)
    - Maximum number of requests processed in each batch.

- `encryption` (boolean | object, default: false)
    - Encrypts the `data` of records saved with `access_group: 'private'` in the browser before the data reaches the database. The contents of files attached to those records are encrypted as well.
    - **This option takes effect only when it is set during `Skapi` initialization.** There is no method for enabling encryption later. If this option is omitted, the instance saves every record's `data` as plain text for its entire lifetime.
    - Enabling encryption later does not encrypt records that were already saved as plain text.
    - Setting it to `true` uses the default settings. Pass an object to customize them:
        - `iterations` (number, default: 600000): PBKDF2 cost for deriving the key from the user's password. Minimum: 100000.
        - `minPasswordLength` (number, default: 0, off): rejects passwords shorter than this value. Because encryption strength is limited by the user's password, setting a minimum is recommended.
        - `persistDevice` (boolean, default: true): keeps encryption unlocked across page reloads on that device.
        - `recovery` ('code' | 'none', default: 'code'): issues a one-time recovery code. This is the only way to regain access to the data after a password reset.
        - `trustPolicy` ('tofu' | 'strict', default: 'tofu'): controls how a recipient's public key is trusted when a record is shared. `'strict'` requires the key to be pinned before the first share.
        - `withheld` ('null' | 'sentinel', default: 'null'): specifies what `data` contains when a record cannot be decrypted. `'sentinel'` returns a placeholder object with the reason instead of `null`.
        - `table` (string, default: '__skapi__keyring'): the reserved table for the user's keyring.
    - See: [Encrypting Private Record Data](/database/encryption.html)

- `eventListener` (callbacks for key events)
    - `onLogin(user: UserProfile | null)`
        - Fires after Skapi initializes on the initial page load, after login or logout, and when a session expires. The callback receives a `UserProfile` object when the user is logged in; otherwise, it receives `null`.
        - See: [Listening to Login/Logout Status](/authentication/login-logout.html#listening-to-login-logout-status)

    - `onUserUpdate(user: UserProfile | null)`
        - Fires after login, before logout, when a session expires, and when the user's profile is updated. The callback receives a `UserProfile` object when the user is logged in; otherwise, it receives `null`.
        - See: [Listening to User Profile Updates](/authentication/user-info.html#listening-to-user-s-profile-updates)

    - `onBatchProcess(process)`
        - Fires each time Skapi finishes processing a request batch.

Type reference: See [UserProfile](/api-reference/data-types/README.md#userprofile).
