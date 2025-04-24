import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',

  title: "Skapi",
  description: "Serverless Backend API for HTML frontend",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-sml.png',

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/introduction/getting-started.md' },
          { text: 'Working with HTML forms', link: '/introduction/working-with-forms.md' },
        ]
      },
      {
        text: 'Authentication',
        items: [
          { text: 'Introduction', link: '/authentication/introduction.md' },
          { text: 'Creating an account', link: '/authentication/create-account.md' },
          { text: 'Signup Confirmation', link: '/authentication/signup-confirmation.md' },
          { text: 'Login / Logout', link: '/authentication/login-logout.md' },
          { text: 'Forgot Password', link: '/authentication/forgot-password.md' },
          { text: 'OpenID Login', link: '/authentication/openid-login.md' },
          // { text: 'Full Example', link: '/authentication/full-example.md' },
        ]
      },
      {
        text: 'User Account',
        items: [
          { text: 'Introduction', link: '/user-account/introduction.md' },
          { text: 'E-Mail verification', link: '/user-account/email-verification.md' },
          { text: 'Updating User Profile', link: '/user-account/update-account.md' },
          { text: 'Changing Password', link: '/user-account/change-password.md' },
          { text: 'Disable / Recover Account', link: '/user-account/disable-recover-account.md' },
          { text: 'Search Users', link: '/user-account/get-users.md' }
        ]
      },
      {
        text: 'Templates: Authentication',
        items: [
          { text: 'HTML', link: '/authentication/full-example.md' },
        ]
      },
      {
        text: 'Database',
        items: [
          { text: 'Introduction', link: '/database/introduction.md' },
          { text: 'Creating a Record', link: '/database/create.md' },
          { text: 'Fetching Records', link: '/database/fetch.md' },
          { text: 'Unique ID', link: '/database/unique-id.md' },
          { text: 'Access Restrictions', link: '/database/access-restrictions.md' },
          { text: 'Updating a Record', link: '/database/update-record.md' },
          { text: 'Handling Files', link: '/database/handling-files.md' },
          { text: 'Deleting Records', link: '/database/delete-records.md' },
          { text: 'Table Information', link: '/database/table-info.md' },
          { text: 'Indexing', link: '/database/index.md' },
          { text: 'Tags', link: '/database/tags.md' },
          { text: 'Referencing', link: '/database/referencing.md' },
          { text: 'Subscription', link: '/database/subscription.md' }
        ]
      },
      {
        text: 'Full Example: Database',
        items: [
          { text: 'HTML', link: '/database/full-example.md' },
        ]
      },
      {
        text: 'Realtime Connection',
        items: [
          { text: 'Connecting to Realtime', link: '/realtime/connecting.md' },
          { text: 'Sending Realtime Data', link: '/realtime/post.md' },
          { text: 'Realtime Groups', link: '/realtime/group.md' },
          { text: 'Notifications', link: '/notification/send-notifications.md' },
          { text: 'WebRTC', link: '/realtime/webRTC.md' },
        ]
      },
      {
        text: 'Full Example: Websocket Chat',
        items: [
          { text: 'HTML', link: '/realtime/chat-example.md' },
        ]
      },
      {
        text: 'Service Settings',
        items: [
          { text: 'Setting Toggles', link: '/service-settings/service-settings.md' },
          { text: 'Additional Settings', link: '/service-settings/additional.md' },
          { text: 'Deleting Service', link: '/service-settings/deleteservice.md' },
        ]

      },
      {
        text: 'API Bridge',
        items: [
          { text: 'Introduction', link: '/api-bridge/introduction.md' },
          { text: 'Secure Post Request', link: '/api-bridge/secure-post-request.md' },
          { text: 'Client Secret Request', link: '/api-bridge/client-secret-request.md' },
        ]
      },
      // {
      //   text: 'Complete Tutorial',
      //   items: [
      //     { text: 'Demo', link: '/full-example/intro.md' },
      //     // { text: 'Authentication / User Profile', link: '/full-example/auth-profile.md' },
      //     // { text: 'Instaclone', link: '/full-example/instaclone.md' },
      //     // { text: 'Chat Room', link: '/full-example/chatroom.md' },
      //     // { text: 'AI Image Generator', link: '/full-example/image-generator.md' }
      //   ]
      // },
      {
        text: 'E-Mail Service',
        items: [
          { text: 'Introduction', link: '/email/introduction.md' },
          { text: 'Automated E-Mail', link: '/email/email-templates.md' },
          { text: 'Bulk Email', link: '/email/newsletters.md' },
          { text: 'Receiving Inquiries', link: '/email/inquiries.md' }
        ]
      },
      {
        text: 'Admin Features',
        items: [
          { text: 'Introduction', link: '/admin/intro.md' },
          { text: 'Inviting Users', link: '/admin/invite.md' },
          { text: 'Managing Users', link: '/admin/account.md' },
        ]
      },
      {
        text: 'Website Hosting',
        link: '/hosting/hosting.md'
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Connection', link: '/api-reference/connection/README.md' },
          { text: 'Authentication', link: '/api-reference/authentication/README.md' },
          { text: 'User Account', link: '/api-reference/user/README.md' },
          { text: 'Database', link: '/api-reference/database/README.md' },
          { text: 'Email', link: '/api-reference/email/README.md' },
          { text: 'Realtime', link: '/api-reference/realtime/README.md' },
          { text: 'API Bridge', link: '/api-reference/api-bridge/README.md' },
          { text: 'Admin', link: '/api-reference/admin/README.md' },
          { text: 'Data Types', link: '/api-reference/data-types/README.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/broadwayinc/skapi-js' }
    ]
  },
  vite: {
    server: {
      allowedHosts: ['seoul.broadwayinc.computer'],
    }
  }
})
