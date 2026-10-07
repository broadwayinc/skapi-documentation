// The sidebar of the documentation site, and the page lists the agent bundles are built
// from (agent-docs.mjs). Every page an AI agent can read is one of these; a page that is
// not in a list here is not on the site's sidebar and not in the bundles.

export let api_reference = [
    {
        text: 'API Reference',
        items: [
            { text: 'Connection', link: '/api-reference/connection/README.md' },
            { text: 'Authentication', link: '/api-reference/authentication/README.md' },
            { text: 'User Account', link: '/api-reference/user/README.md' },
            { text: 'Database', link: '/api-reference/database/README.md' },
            { text: 'E-Mail', link: '/api-reference/email/README.md' },
            { text: 'Realtime', link: '/api-reference/realtime/README.md' },
            { text: 'API Bridge', link: '/api-reference/api-bridge/README.md' },
            { text: 'Admin', link: '/api-reference/admin/README.md' },
            { text: 'Tickets', link: '/api-reference/tickets/README.md' },
            { text: 'Data Types', link: '/api-reference/data-types/README.md' }
        ]
    }
]

export let method_ref = [
    {
        text: 'Introduction',
        items: [
            // { text: 'What is Skapi?', link: '/introduction/what-is-skapi.md' },
            { text: 'Getting Started', link: '/introduction/getting-started.md' },
            { text: 'Working with AI Agents', link: '/introduction/ai-driven.md' },
            { text: 'Working with HTML Forms', link: '/introduction/working-with-forms.md' }
        ]
    },
    // {
    //     text: 'Authentication',
    //     items: [
    //         // { text: 'What is Authentication?', link: '/authentication/introduction.md' },
    //         { text: 'Creating an account', link: '/authentication/create-account.md' },
    //         { text: 'Signup Confirmation', link: '/authentication/signup-confirmation.md' },
    //         { text: 'Login / Logout', link: '/authentication/login-logout.md' },
    //         { text: 'User Profile', link: '/authentication/user-info.md' },
    //         { text: 'Forgot Password', link: '/authentication/forgot-password.md' },
    //         { text: 'OpenID Login', link: '/authentication/openid-login.md' },
    //     ]
    // },
    {
        text: 'User Account',
        items: [
            { text: 'Signing Up Users', link: '/authentication/create-account.md' },
            { text: 'Signup Confirmation', link: '/authentication/signup-confirmation.md' },
            { text: 'Login / Logout', link: '/authentication/login-logout.md' },
            { text: 'User Profile', link: '/authentication/user-info.md' },
            { text: 'Forgot Password', link: '/authentication/forgot-password.md' },
            { text: 'OpenID Login', link: '/authentication/openid-login.md' },
            { text: 'Updating User Profile', link: '/user-account/update-account.md' },
            { text: 'Email Verification', link: '/user-account/email-verification.md' },
            { text: 'Changing Password', link: '/user-account/change-password.md' },
            { text: 'Disable / Recover Account', link: '/user-account/disable-recover-account.md' },
            { text: 'Searching Users', link: '/user-account/get-users.md' },
        ]
    },
    // {
    //     text: 'Templates: Authentication',
    //     items: [
    //     ]
    // },
    {
        text: 'Database',
        items: [
            // { text: 'What is a database?', link: '/database/introduction.md' },
            { text: 'Creating a Record', link: '/database/create.md' },
            { text: 'Fetching Records', link: '/database/fetch.md' },
            { text: 'Table Information', link: '/database/table-info.md' },
            { text: 'Access Restrictions', link: '/database/access-restrictions.md' },
            { text: 'Encrypting Private Data', link: '/database/encryption.md' },
            { text: 'Unique ID', link: '/database/unique-id.md' },
            { text: 'Updating a Record', link: '/database/update-record.md' },
            { text: 'Handling Files', link: '/database/handling-files.md' },
            { text: 'Deleting Records', link: '/database/delete-records.md' },
            { text: 'Indexing', link: '/database/indexing.md' },
            { text: 'Tags', link: '/database/tags.md' },
            { text: 'Referencing', link: '/database/referencing.md' },
            { text: 'Subscription', link: '/database/subscription.md' },
        ]
    },
    // {
    //     text: 'Full Example: Database',
    //     items: [
    //     ]
    // },
    {
        text: 'Using Third-Party APIs',
        items: [
            { text: 'Secret Keys', link: '/api-bridge/client-secret-request.md' },
            { text: 'Forwarding Requests', link: '/api-bridge/forward-request.md' },
            { text: 'Polling Requests', link: '/api-bridge/polling-request.md' },
            { text: 'Streaming the Response', link: '/api-bridge/streaming-request.md' },
            { text: 'Request History', link: '/api-bridge/request-history.md' },
            { text: 'OpenAI API Example', link: '/api-bridge/example.md' },
        ]
    },
    {
        text: 'Tickets',
        items: [
            { text: 'Registering a Ticket', link: '/tickets/introduction.md' },
            { text: 'Conditions and Placeholders', link: '/tickets/conditions.md' },
            { text: 'Actions', link: '/tickets/actions.md' },
            { text: 'Errors and Logs', link: '/tickets/errors.md' },
            { text: 'Examples', link: '/tickets/examples.md' },
        ]
    },
    {
        text: 'Realtime Connection',
        items: [
            // { text: 'What is Realtime Connection?', link: '/realtime/introduction.md' },
            { text: 'Connecting to Realtime', link: '/realtime/connecting.md' },
            { text: 'Sending Realtime Data', link: '/realtime/post.md' },
            { text: 'Realtime Groups', link: '/realtime/group.md' },
            { text: 'WebRTC', link: '/realtime/webRTC.md' },
            { text: 'Notifications', link: '/notification/send-notifications.md' },
        ]
    },
    // {
    //     text: 'Full Example: Websocket Chat',
    //     items: [
    //     ]
    // },
    // {
    //     text: 'Full Example: Video Call',
    //     items: [
    //     ]
    // },
    {
        text: 'Email Service',
        items: [
            // { text: 'Introduction', link: '/email/introduction.md' },
            { text: 'Automated Emails', link: '/email/email-templates.md' },
            { text: 'Sending Newsletters', link: '/email/newsletters.md' },
            { text: 'Receiving Inquiries', link: '/email/inquiries.md' }
        ]
    },
    {
        text: 'Admin Features',
        items: [
            { text: 'Introduction', link: '/admin/intro.md' },
            { text: 'Admin Permissions', link: '/admin/permissions.md' },
            // { text: 'Project Settings', link: '/admin/project-settings.md' },
            { text: 'Inviting Users', link: '/admin/invite.md' },
            { text: 'Managing Users', link: '/admin/account.md' },
            {
                text: 'Website Hosting',
                link: '/hosting/hosting.md'
            },
            { text: 'Plans and Limits', link: '/introduction/plans.md' },
        ]
    },
];

// The full example on the CDN (examples/template): one demo page per feature, hosted at
// https://cdn.broadwayinc.com/temp/v2/. The pages hold a Vue component (the demo link with
// the reader's project id); agent-docs.mjs writes that link out as plain markdown.
export let full_examples = {
    text: 'Full Examples',
    items: [
        { text: 'Introduction', link: '/full-example/intro.md' },
        { text: 'User Account', link: '/full-example/user-account.md' },
        { text: 'Newsletter', link: '/full-example/newsletter.md' },
        { text: 'Send Inquiry', link: '/full-example/inquiry.md' },
        { text: 'Database', link: '/full-example/database.md' },
        { text: 'Realtime Chat', link: '/full-example/realtime.md' },
        { text: 'RTC Video Chat', link: '/full-example/webrtc.md' },
    ]
};

export let version_history = {
    text: 'Version History',
    link: '/versionlog/versions.md'
};

export let deprecated = {
    text: 'Deprecated',
    link: '/deprecated/deprecated.md'
};

let all_files = [
    ...method_ref,
    full_examples,
    api_reference[0],
    version_history,
    deprecated,

    // {
    //     // An absolute url on purpose: VitePress rewrites a site link ending in .md to .html,
    //     // and /SKAPI.html does not exist. SKAPI.md is served as the raw markdown file.
    //     text: 'Raw Markdown',
    //     link: 'https://docs.skapi.com/SKAPI.md'
    // }
]

export default all_files;
