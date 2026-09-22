import DefaultTheme from 'vitepress/theme'
import { inBrowser, useData } from 'vitepress'
import { defineComponent, h, watchEffect } from 'vue'

/**
 * CloudFront answers any URL that has no file with index.html and status 200, so a
 * mistyped or removed page is a "soft 404": the browser shows VitePress's not-found state,
 * but a crawler gets a 200 and the home page's canonical URL, title card and structured
 * data. While the not-found state is showing, this takes the home page's per-page tags
 * out of the head and adds robots noindex, so a rendering crawler does not index the URL.
 * The real fix, a 404 status, is a CloudFront setting.
 *
 * The robots tag is marked so that only the one added here is ever removed again: a page
 * that is noindex by its own head (SYSTEM.md) keeps its tag.
 */
const MARK = 'data-not-found'

/** The per-page head tags transformPageData adds (see .vitepress/config.mts). */
const PAGE_TAGS = [
  'link[rel="canonical"]',
  'meta[property="og:url"]',
  'meta[property="og:type"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'script[type="application/ld+json"]',
].join(',')

function markNotFound(notFound: boolean) {
  const head = document.head
  let robots = head.querySelector(`meta[${MARK}]`)
  if (!notFound) {
    robots?.remove()
    return
  }
  head.querySelectorAll(PAGE_TAGS).forEach((el) => el.remove())
  if (!robots) {
    robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    robots.setAttribute('content', 'noindex')
    robots.setAttribute(MARK, '')
    head.appendChild(robots)
  }
}

const Layout = defineComponent({
  name: 'SkapiDocsLayout',
  setup(_, { slots }) {
    const { page } = useData()
    // Runs after VitePress's own head update for the same route change, which was set up first.
    if (inBrowser) watchEffect(() => markNotFound(!!page.value.isNotFound))
    return () => h(DefaultTheme.Layout, null, slots)
  },
})

export default {
  extends: DefaultTheme,
  Layout,
}
