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
          { text: 'Login/Logout', link: '/authentication/login-logout.md' },
          { text: 'Forgot Password', link: '/authentication/forgot-password.md' },
          { text: 'Full Example', link: '/authentication/full-example.md' }
        ]
      },
      {
        text: 'User Account',
        items: [
          { text: 'E-Mail verification', link: '/user-account/email-verification.md' },
          { text: 'Updating User Profile', link: '/user-account/update-account.md' },
          { text: 'Changing Password', link: '/user-account/change-password.md' },
          { text: 'Disable / Recover Account', link: '/user-account/disable-recover-account.md' },
          { text: 'Search Users', link: '/user-account/get-users.md' },
          { text: 'Full Example', link: '/user-account/full-example.md' }
        ]
      },
      {
        text: 'Database',
        items: [
          { text: 'Create / Fetch Records', link: '/database/create-fetch.md' },
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
        text: 'Full Example',
        items: [
          { text: 'Photo Sharing App', link: '/full-example/photo-sharing-app.md' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Authentication', link: 'api-reference/authentication/README.md' },
          { text: 'User Account', link: 'api-reference/user/README.md' },
          { text: 'Database', link: 'api-reference/database/README.md' },
          { text: 'Data Types', link: 'api-reference/data-types/README.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/broadwayinc/skapi-js' }
    ]
  }
})
