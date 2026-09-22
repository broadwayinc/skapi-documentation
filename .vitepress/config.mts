import { defineConfig, type HeadConfig } from 'vitepress'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import all_files from '../all_files.mjs';
import {
  ORIGIN,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  ORGANIZATION,
  NOINDEX,
  CANONICAL,
  PAGES,
  urlOf,
} from './seo-pages.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC_DIR = path.join(ROOT, 'public')

/**
 * The last and the first commit date of every markdown file, from ONE `git log`, for the
 * sitemap's <lastmod> and the pages' dateModified / datePublished. No git history (a copy
 * outside the repo, a file never committed) simply means no date.
 */
function gitDates(): Record<string, { modified: string; published: string }> {
  const dates: Record<string, { modified: string; published: string }> = {}
  try {
    const log = execFileSync('git', ['log', '--format=%x00%cI', '--name-only', '--', '*.md'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    let date = ''
    for (const line of log.split('\n')) {
      if (line.startsWith('\0')) {
        date = line.slice(1).trim()
        continue
      }
      const file = line.trim()
      if (!file || !date) continue
      // Newest commit first: the first date seen is the last change, the last one the first.
      if (!dates[file]) dates[file] = { modified: date, published: date }
      else dates[file].published = date
    }
  } catch {
    /* not a git checkout */
  }
  return dates
}
const GIT_DATES = gitDates()

/** The page's own canonical URL, or the page it duplicates. */
const canonicalOf = (rel: string) => urlOf(CANONICAL[rel] || rel)

/** Pages that are in search: everything but the noindex pages and the duplicates. */
const isIndexable = (rel: string) => !NOINDEX.has(rel) && !CANONICAL[rel]

/** JSON inside <script>: a "</script>" in any string must not end the tag. */
const jsonLd = (data: object): HeadConfig =>
  ['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')]

/** PNG width and height from the IHDR chunk, so content images reserve their space. */
function pngSize(file: string): { width: number; height: number } | null {
  try {
    const fd = fs.openSync(file, 'r')
    const buf = Buffer.alloc(24)
    fs.readSync(fd, buf, 0, 24, 0)
    fs.closeSync(fd)
    if (buf.readUInt32BE(0) !== 0x89504e47 || buf.toString('ascii', 12, 16) !== 'IHDR') return null
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  } catch {
    return null
  }
}

/**
 * docs.skapi.com is an S3 bucket behind CloudFront, and CloudFront answers a URL that
 * has no file with index.html (the home page) and status 200. Only <path>.html files
 * exist, so /database/create or /database/create/ gets the home page's bytes, and
 * VitePress then hydrates a broken mix of the home page and the doc. This runs before
 * anything else on the page and sends such a URL to the .html file that does exist,
 * keeping the query and the hash. A real .html page is left alone. The server-side
 * 301 belongs in CloudFront; this covers browsers and rendering crawlers until then.
 */
const URL_SHAPE_SCRIPT =
  '<script>(function(){var l=location,p=l.pathname;if(p.length<2||/\\.[A-Za-z0-9]+$/.test(p))return;' +
  "var q=p.replace(/\\/+$/,'');if(q)l.replace(q+'.html'+l.search+l.hash)})()</script>"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // TODO.md is a working note, not a page.
  srcExclude: ['SKAPI.md', 'skapi-docs.md', 'skapi-types.md', 'public/**/*.md', 'TODO.md'],

  lang: 'en-US',

  title: "Skapi",
  titleTemplate: ':title | ' + SITE_NAME,
  description: DEFAULT_DESCRIPTION,

  // The site is served from S3, where only <path>.html exists: keep cleanUrls off.

  // Site-wide head. Per page tags (canonical, og:url, og:title ...) come from transformPageData.
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#ffffff' }],
    ['meta', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#1b1b1f' }],
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Skapi logo' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@skapi_api' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: 'Skapi logo' }],
  ],

  sitemap: {
    hostname: ORIGIN,
    // Canonical, indexable pages only, each with the date its source last changed.
    transformItems: (items) =>
      items
        .map((item) => ({ ...item, rel: item.url === '' ? 'index.md' : item.url.replace(/\.html$/, '.md') }))
        .filter((item) => isIndexable(item.rel))
        .map(({ rel, ...item }) => ({ ...item, lastmod: GIT_DATES[rel]?.modified || item.lastmod })),
  },

  transformPageData(pageData) {
    const rel = pageData.relativePath
    const fm = pageData.frontmatter
    const seo = PAGES[rel]
    if (!seo) console.warn(`  seo: ${rel} has no entry in .vitepress/seo-pages.mjs (title, description)`)

    if (seo?.title && !fm.title) pageData.title = seo.title
    if (seo && 'titleTemplate' in seo && fm.titleTemplate === undefined) pageData.titleTemplate = seo.titleTemplate
    const description = fm.description || seo?.description || DEFAULT_DESCRIPTION
    if (/["<>&]/.test(description)) {
      throw new Error(`seo: the description of ${rel} contains " < > or &, which VitePress writes into HTML unescaped`)
    }
    pageData.description = description

    const title = pageData.title || 'Skapi'
    const url = canonicalOf(rel)
    const isHome = rel === 'index.md'
    const head: HeadConfig[] = (fm.head ??= [])

    if (NOINDEX.has(rel)) {
      head.push(['meta', { name: 'robots', content: 'noindex' }])
    } else {
      head.push(['link', { rel: 'canonical', href: url }])
    }
    head.push(
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
    )
    if (!NOINDEX.has(rel)) head.push(['meta', { property: 'og:url', content: url }])

    if (!isIndexable(rel)) return

    const website = { '@id': ORIGIN + '/#website' }
    const organization = { '@id': ORGANIZATION['@id'] }
    if (isHome) {
      head.push(jsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            ...website,
            name: SITE_NAME,
            alternateName: 'Skapi Documentation',
            url: ORIGIN + '/',
            description,
            inLanguage: 'en-US',
            publisher: organization,
          },
          ORGANIZATION,
        ],
      }))
      return
    }

    const dates = GIT_DATES[rel]
    head.push(jsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          '@id': url + '#article',
          headline: title,
          description,
          url,
          mainEntityOfPage: url,
          image: OG_IMAGE,
          inLanguage: 'en-US',
          ...(dates ? { datePublished: dates.published, dateModified: dates.modified } : {}),
          author: organization,
          publisher: organization,
          isPartOf: website,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: ORIGIN + '/' },
            { '@type': 'ListItem', position: 2, name: title, item: url },
          ],
        },
        ORGANIZATION,
      ],
    }))
  },

  // The static 404.html: VitePress gives it no page data to transform.
  transformHead({ page }) {
    if (page === '404.md') return [['meta', { name: 'robots', content: 'noindex' }]]
  },

  transformHtml(html, file) {
    const charset = '<meta charset="utf-8">'
    if (!html.includes(charset)) console.warn(`  seo: no ${charset} in ${file}, the URL shape script was not added`)
    return html.replace(charset, charset + '\n    ' + URL_SHAPE_SCRIPT)
  },

  markdown: {
    image: { lazyLoading: true },
    config(md) {
      // width and height on images from public/, so the page does not shift as they load.
      const image = md.renderer.rules.image!
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const src = token.attrGet('src')
        if (src && src.startsWith('/') && !token.attrGet('width')) {
          const size = pngSize(path.join(PUBLIC_DIR, decodeURIComponent(src.split(/[?#]/)[0])))
          if (size) {
            token.attrSet('width', String(size.width))
            token.attrSet('height', String(size.height))
          }
        }
        return image(tokens, idx, options, env, self)
      }
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo-sml.png',

    sidebar: [
      ...all_files
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/broadwayinc/skapi-js' }
    ]
  },
  vite: {
    server: {
      allowedHosts: ['seoul.broadwayinc.computer', 'us.broadwayinc.computer', 'us-dev.broadwayinc.computer'],
    }
  }
})
