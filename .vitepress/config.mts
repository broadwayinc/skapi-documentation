import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Skapi",
  description: "One Line of Code => Full Backend API",
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
          { text: 'Creating an account', link: '/authentication/create-account.md' },
          { text: 'Signup Confirmation', link: '/authentication/signup-confirmation.md' },
          { text: 'Login / Logout', link: '/authentication/login-logout.md' },
          { text: 'Forgot Password', link: '/authentication/forgot-password.md' }
        ]
      },
      {
        text: 'User Account',
        items: [
          { text: 'E-Mail verification', link: '/user-account/email-verification.md' },
          { text: 'Updating User Profile', link: '/user-account/update-account.md' },
          { text: 'Changing Password', link: '/user-account/change-password.md' },
          { text: 'Disable / Recover Account', link: '/user-account/disable-recover-account.md' },
          { text: 'Search Users', link: '/user-account/get-users.md' }
        ]
      },
      {
        text: 'Database',
        items: [
          { text: 'Creating Records', link: '/database/create.md' },
          { text: 'Fetching Records', link: '/database/fetch.md' },
          { text: 'Access Restrictions', link: '/database/access-restrictions.md' },
          { text: 'Update Record', link: '/database/update-record.md' },
          { text: 'Handling Files', link: '/database/handling-files.md' },
          { text: 'Deleting Records', link: '/database/delete-records.md' },
          { text: 'Table Information', link: '/database/table-info.md' },
          { text: 'Referencing', link: '/database/referencing.md' },
          { text: 'Indexing', link: '/database/index.md' },
          { text: 'Tags', link: '/database/tags.md' },
          { text: 'Subscription', link: '/database/subscription.md' }
        ]
      },
      {
        text: 'Realtime Connection',
        items: [
          { text: 'Connecting to Realtime', link: '/realtime/connecting.md' },
          { text: 'Sending Realtime Data', link: '/realtime/post.md' },
          { text: 'Realtime Groups', link: '/realtime/group.md' },
        ]
      },
      {
        text: 'Service Settings',
        link: '/service-settings/service-settings.md'
      },
      {
        text: 'API Bridge',
        items: [
          { text: 'Secure Post Request', link: '/api-bridge/secure-post-request.md' },
          { text: 'Client Secret Request', link: '/api-bridge/client-secret-request.md' },
        ]
      },
      {
        text: 'Complete Tutorial',
        items: [
          { text: 'Introduction', link: '/full-example/intro.md' },
          { text: 'Authentication / User Profile', link: '/full-example/auth-profile.md' },
          { text: 'Instaclone', link: '/full-example/instaclone.md' },
          { text: 'Chat Room', link: '/full-example/chatroom.md' },
          { text: 'AI Image Generator', link: '/full-example/image-generator.md' }
        ]
      },
      {
        text: 'E-Mail Service',
        items: [
          { text: 'Automated E-Mail', link: '/email/email-templates.md' },
          { text: 'Bulk Email', link: '/email/newsletters.md' }
        ]
      },
      {
        text: 'Website Hosting',
        link: '/hosting/hosting.md'
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Authentication', link: '/api-reference/authentication/README.md' },
          { text: 'User Account', link: '/api-reference/user/README.md' },
          { text: 'Database', link: '/api-reference/database/README.md' },
          { text: 'Email', link: '/api-reference/email/README.md' },
          { text: 'Realtime', link: '/api-reference/realtime/README.md' },
          { text: 'API Bridge', link: '/api-reference/api-bridge/README.md' },
          { text: 'Data Types', link: '/api-reference/data-types/README.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/broadwayinc/skapi-js' }
    ]
  }
})
