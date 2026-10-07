// The documentation as AI agents read it. Run before every vitepress dev/build (package.json).
//
// Writes into public/, which VitePress copies to the site root, so every file below is served
// raw from docs.skapi.com (a .md under public/ is a download, not a page: srcExclude in config):
//
//   SKAPI.md         the starting point: SYSTEM.md with the documentation map and the SDK method
//                    index, every entry linking to a page under /md/. Small on purpose: the tools
//                    load it on every turn (CLAUDE.md, AGENTS.md ...), and Codex reads at most
//                    32 KiB of AGENTS.md, so PROMPT_MAX_BYTES fails the build past 30,000 bytes.
//   md/<key>.md      one raw markdown file per page of the site, sidebar or not, cross-links as
//                    absolute /md/ urls. The agent reads the page a feature needs, when it needs
//                    it, and reaches a page that is not on the sidebar through the links on the
//                    pages that are (the map in SKAPI.md is the sidebar, nothing more).
//   SKAPI-full.md    the same prompt and every page in one file, for tools that index a single
//                    document. Links stay inside the file.
//   llms.txt         the list of all of the above (https://llmstxt.org).
//
// A page written for the website links to other pages by path ("/database/create.md#x") and
// to its own headings by fragment ("#x"). Inside a bundle the paths are gone and "#errors"
// exists on a dozen pages; in a per-page file the fragment must survive a hop to another
// file. So every output uses the same ids:
//
//   - every page gets an id:                      doc-database-create
//   - every heading that is linked to gets one:   doc-database-create-errors
//   - a link to a page IN the set becomes "#id" in a bundle, and
//     "https://docs.skapi.com/md/<key>.md#id" in a per-page file
//   - a link to a page NOT in the set, and every image, becomes a full
//     https://docs.skapi.com/... url, because that is the only place it still exists
//   - external urls, and everything inside code, are left exactly as written
//
// Heading ids are only written where a link needs one. There are ~650 headings and an id
// costs tokens on every read, for an anchor nothing points at. The method entries of the API
// reference always get one, because the method index links to each of them.
import fs from 'fs';
import path from 'path';
import all_files, { method_ref, full_examples, api_reference, version_history, deprecated } from './all_files.mjs';
import { PAGES, DEFAULT_DESCRIPTION, NOINDEX } from './.vitepress/seo-pages.mjs';

const DOCS_ORIGIN = 'https://docs.skapi.com';
const OUT_DIR = './public';
const PAGES_DIR = 'md';
const PROMPT_FILE = 'SKAPI.md';
const FULL_FILE = 'SKAPI-full.md';
/** Written by earlier versions of this script; removed so a stale copy is never served. */
const RETIRED_FILES = ['skapi-docs.md', 'skapi-types.md'];
const PROMPT_MAX_BYTES = 30000;
const DEMO_BASE = 'https://cdn.broadwayinc.com/temp/v2/';
const PROMPT_DOWNLOADS = './.vitepress/theme/AgentPromptDownloads.vue';

/* ────────────────────────────── the sidebar as lists ────────────────────────────── */

function linksOf(tree) {
    let links = [];
    let walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (!node || typeof node !== 'object') return;
        if (typeof node.link === 'string') links.push(node.link);
        if (node.items) walk(node.items);
    };
    walk(tree);
    return links;
}

/** Folders that hold no documentation page. */
const NOT_PAGES = new Set(['node_modules', 'public', '.vitepress', '.claude', '.git']);
/** Files that are markdown but not a page of the documentation. */
const NOT_A_PAGE = new Set(['/SYSTEM.md', '/TODO.md']);

/**
 * Every markdown page of the site, as site paths ('/database/create.md'), sidebar or not. The
 * md/ set is built from this list, so a link from a sidebar page to a page that is not on the
 * sidebar still lands on a raw file, not on the website.
 */
function sitePages(dir = '.') {
    let out = [];
    for (let entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!NOT_PAGES.has(entry.name) && !entry.name.startsWith('.')) out.push(...sitePages(path.posix.join(dir, entry.name)));
        } else if (/\.md$/i.test(entry.name)) {
            let sitePath = '/' + path.posix.relative('.', path.posix.join(dir, entry.name));
            if (!NOT_A_PAGE.has(sitePath)) out.push(sitePath);
        }
    }
    return out.sort();
}

/** '/api-reference/email/README.md' -> 'api-reference/email', '/database/create.html' -> 'database/create' */
function pageKey(sitePath) {
    return sitePath
        .replace(/^\/+/, '')
        .replace(/\.(md|html)$/i, '')
        .replace(/\/(README|index)$/i, '')
        .replace(/\/+$/, '');
}

function pageId(key) {
    return 'doc-' + key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** The url of a page's raw markdown file. */
function pageUrl(key) {
    return `${DOCS_ORIGIN}/${PAGES_DIR}/${key}.md`;
}

/* ────────────────────────────── markdown helpers ────────────────────────────── */

/** The heading slug VitePress gives a heading (@mdit-vue/shared slugify), so a "#fragment" written for the site resolves here. */
function slugifyHeading(str) {
    return str
        .normalize('NFKD')
        .replace(/[\u0300-\u036F]/g, '')
        .replace(/[\u0000-\u001f]/g, '')
        .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/^(\d)/, '_$1')
        .toLowerCase();
}

/** The text a heading is slugged from: its plain text and the content of its code spans, without markup. */
function headingText(raw) {
    let codes = [];
    let text = raw
        .replace(/\s+#+\s*$/, '')
        .replace(/(`+)(.+?)\1/g, (m, ticks, code) => {
            codes.push(code.trim());
            return `\u0000${codes.length - 1}\u0000`;
        })
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\\([\\`*_{}[\]()#+\-.!|<>~])/g, '$1')
        .replace(/(\*\*|__|~~)(.+?)\1/g, '$2')
        .replace(/(^|[^\w*])[*_]([^*_]+)[*_](?=[^\w*]|$)/g, '$1$2')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    return text.replace(/\u0000(\d+)\u0000/g, (m, i) => codes[+i]);
}

/** Calls onLine(line, index) for every line that is NOT inside a fenced code block. */
function eachProseLine(lines, onLine) {
    let fence = null;
    lines.forEach((line, i) => {
        let m = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
        if (fence) {
            if (m && m[1][0] === fence[0] && m[1].length >= fence.length && !m[2].trim()) fence = null;
            return;
        }
        if (m) {
            fence = m[1];
            return;
        }
        onLine(line, i);
    });
}

/** A page's frontmatter (`title:`, `description:` ...) is for the website, not for a bundle. */
function stripFrontmatter(text) {
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
}

/**
 * The prompt file names the dashboard and the docs page offer, read from the component that
 * renders them, so the list exists once. Fails the build if the component changes shape.
 */
function promptPlatforms() {
    let src = fs.readFileSync(PROMPT_DOWNLOADS, 'utf-8');
    let out = [];
    for (let m of src.matchAll(/name:\s*'([^']+)',\s*filename:\s*'([^']+)'/g)) out.push({ name: m[1], filename: m[2] });
    if (!out.length) throw new Error(`${PROMPT_DOWNLOADS}: no { name, filename } entries found`);
    return out;
}

/**
 * The Vue components a page may hold are rendered for the website only. Written out as
 * plain markdown here, so the agent reads what the visitor sees:
 *   <FullExampleDemo page="x.html" label="..." />   the demo link with the project id to fill in
 *   <AgentPromptDownloads />                        the prompt file under each tool's name
 * Any other self-closing capitalised tag is reported, since it would reach the agent as a bare tag.
 */
function renderComponents(text, sitePath, report) {
    let lines = text.split(/\r?\n/);
    eachProseLine(lines, (line, i) => {
        let out = line.replace(/<FullExampleDemo\b([^>]*)\/>/g, (m, attrs) => {
            let page = (attrs.match(/\bpage="([^"]+)"/) || [])[1];
            let label = (attrs.match(/\blabel="([^"]+)"/) || [])[1] || 'Open the demo';
            if (!page) {
                report.warnings.push(`${sitePath}: <FullExampleDemo> without a page`);
                return '';
            }
            return `${label}: \`${DEMO_BASE}${page}?pid=<Project ID>\` (put your project ID in place of \`<Project ID>\`).`;
        });
        out = out.replace(/<AgentPromptDownloads\b[^>]*\/>/g, () =>
            promptPlatforms().map((p) => `- ${p.name}: save it as \`${p.filename}\``).join('\n')
        );
        let stray = out.match(/<([A-Z][A-Za-z]+)\b[^>]*\/>/);
        if (stray) report.warnings.push(`${sitePath}: component <${stray[1]}> is not rendered for agents`);
        lines[i] = out;
    });
    return lines.join('\n');
}

/* ────────────────────────────── pages ────────────────────────────── */

function loadPage(sitePath, report, text) {
    let key = pageKey(sitePath);
    let raw = text === undefined ? fs.readFileSync('.' + sitePath, 'utf-8') : text;
    let lines = renderComponents(stripFrontmatter(raw), sitePath, report).split(/\r?\n/);
    let headings = [];      // { line, slug, level, text }
    let taken = {};
    eachProseLine(lines, (line, i) => {
        let m = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (!m) return;
        let text = headingText(m[2]);
        let base = slugifyHeading(text);
        let slug = base;
        for (let n = 1; taken[slug]; n++) slug = `${base}-${n}`;
        taken[slug] = true;
        headings.push({ line: i, slug, level: m[1].length, text });
    });
    return { sitePath, key, id: pageId(key), lines, headings, slugs: taken };
}

/** '#api-reference' in SYSTEM.md is the bundle's API reference section; see REFERENCE. */
const REFERENCE = { title: api_reference[0].text, id: slugifyHeading(api_reference[0].text) };

/** Every "## method" entry of a reference page gets an id in every output: the method index links to it. */
function isMethodEntry(page, h) {
    return page.key.startsWith('api-reference/') && h.level === 2;
}

/**
 * Rewrites every link of every page for an output holding exactly `pages`, then writes the ids
 * those links need. `mode` is 'bundle' (the pages follow each other in one file, a link to
 * another page is "#id") or 'file' (each page is its own file under /md/, a link to another
 * page is that file's url). Sets p.out on each page.
 */
function buildPages(pages, report, mode) {
    let byKey = {};
    let idOwner = {};
    for (let p of pages) {
        if (p.key) byKey[p.key.toLowerCase()] = p;
        p.out = p.lines.slice();
        p.wanted = new Set();
        for (let h of p.headings) if (isMethodEntry(p, h)) p.wanted.add(h.slug);
    }

    // SYSTEM.md has no page id: its headings are the file's own, so their slug is their id.
    let idOf = (page, frag) => (page.id ? `${page.id}-${frag}` : frag);
    let hrefOf = (page, frag) => {
        if (mode === 'bundle' || !page.key) return `#${frag ? idOf(page, frag) : page.id}`;
        return pageUrl(page.key) + (frag ? `#${idOf(page, frag)}` : '');
    };

    let fragmentOf = (page, hash) => {
        if (!hash) return null;
        let frag;
        try { frag = decodeURIComponent(hash); } catch (err) { frag = hash; }
        frag = frag.toLowerCase();
        return page.slugs[frag] ? frag : null;
    };

    let resolve = (page, target) => {
        // A page written with the site's full address ("https://docs.skapi.com/x.html#y") is
        // the same page as "/x.md#y": when that path is a page of this set, resolve it like a
        // site link, so the agent is sent to the raw file and not to the website. Any other
        // absolute url (a raw file under /md/, SKAPI-full.md, an image) is left as written.
        if (target.startsWith(DOCS_ORIGIN + '/')) {
            let sitePath = target.slice(DOCS_ORIGIN.length).split('#')[0];
            if (!byKey[pageKey(sitePath).toLowerCase()]) return null;
            target = target.slice(DOCS_ORIGIN.length);
        }
        if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return null;   // external: as is

        let [rawPath, hash = ''] = target.split('#');
        if (!rawPath) {
            // "#x": a heading of the page the link is written on. SYSTEM.md opens the bundle,
            // so from there it is also how the API reference section is reached.
            if (!page.id && mode === 'bundle' && hash.toLowerCase() === REFERENCE.id) return `#${REFERENCE.id}`;
            let frag = fragmentOf(page, hash);
            if (!frag) {
                report.warnings.push(`${page.sitePath}: "#${hash}" is not a heading of this page`);
                return page.id ? hrefOf(page) : null;
            }
            page.wanted.add(frag);
            return '#' + idOf(page, frag);
        }

        let sitePath = rawPath.startsWith('/')
            ? path.posix.normalize(rawPath)
            : path.posix.normalize(path.posix.join('/', path.posix.dirname(page.sitePath), rawPath));
        let ext = path.posix.extname(sitePath).toLowerCase();

        if (ext && ext !== '.md' && ext !== '.html') {
            return DOCS_ORIGIN + sitePath;                                                   // an image or a download
        }

        let dest = byKey[pageKey(sitePath).toLowerCase()];
        if (!dest) {
            // Not in this output, so the website is the only place it can be read.
            report.external++;
            let url = sitePath.endsWith('/') ? sitePath : sitePath.replace(/\.(md|html)$/i, '') + '.html';
            return DOCS_ORIGIN + url + (hash ? '#' + hash : '');
        }

        report.internal++;
        if (!hash) return hrefOf(dest);
        let frag = fragmentOf(dest, hash);
        if (!frag) {
            report.warnings.push(`${page.sitePath}: "${target}" names a heading that ${dest.sitePath} does not have`);
            return hrefOf(dest);
        }
        dest.wanted.add(frag);
        return hrefOf(dest, frag);
    };

    for (let p of pages) {
        eachProseLine(p.lines, (line, i) => {
            if (!line.includes('](')) return;
            // Code spans are left alone: split them out, rewrite only what is between them.
            p.out[i] = line.split(/(`+[^`]*`+)/).map((part, n) => {
                if (n % 2) return part;
                return part.replace(/\]\((\s*)([^)\s]+)((?:\s+"[^"]*")?\s*)\)/g, (m, lead, target, title) => {
                    let to = resolve(p, target);
                    return to === null ? m : `](${lead}${to}${title})`;
                });
            }).join('');
        });
    }

    // The ids. At the end of the heading line, so the heading still reads, and still greps, as itself.
    for (let p of pages) {
        let ids = {};
        if (p.id && p.headings.length) ids[p.headings[0].line] = [p.id];
        for (let h of p.headings) {
            if (p.wanted.has(h.slug)) (ids[h.line] = ids[h.line] || []).push(idOf(p, h.slug));
        }
        for (let line in ids) {
            for (let id of ids[line]) {
                if (idOwner[id]) report.warnings.push(`id "${id}" is used by both ${idOwner[id]} and ${p.sitePath}`);
                idOwner[id] = p.sitePath;
                report.ids++;
            }
            p.out[line] = p.out[line].replace(/\s+$/, '') + ' ' + ids[line].map((id) => `<a id="${id}"></a>`).join('');
        }
        if (p.id && !p.headings.length) p.out.unshift(`<a id="${p.id}"></a>`, '');
    }

    return pages;
}

/** Page separators and runs of blank lines are layout for a person. An agent pays for each. */
function compact(text) {
    return text.replace(/<br>/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '') + '\n';
}

function joinPages(pages) {
    return pages.filter((p) => p.key).map((p) => '\n\n' + p.out.join('\n') + '\n\n').join('');
}

/* ────────────────────────────── the generated sections of SYSTEM.md ────────────────────────────── */

/**
 * The table of contents SYSTEM.md carries in place of <!-- DOCUMENTATION_MAP -->: the website's
 * sidebar, as is. In a bundle each entry is "#id"; in the prompt each is the page's url.
 */
function documentationMap(pages, mode) {
    let byKey = Object.fromEntries(pages.map((p) => [p.key, p]));
    let href = (link) => {
        let p = byKey[pageKey(link)];
        if (!p) throw new Error(`documentation map: ${link} is not a loaded page`);
        return mode === 'bundle' ? `#${p.id}` : pageUrl(p.key);
    };
    let out = [];
    let walk = (nodes, depth) => {
        for (let node of nodes) {
            let label = node.link ? `[${node.text}](${href(node.link)})` : node.text;
            out.push(`${'  '.repeat(depth)}- ${label}`);
            if (node.items) walk(node.items, depth + 1);
        }
    };
    walk(method_ref, 0);
    walk([full_examples], 0);
    if (mode === 'bundle') {
        out.push(`- [${REFERENCE.title}](#${REFERENCE.id})`);
        walk(api_reference[0].items, 1);
    } else {
        walk(api_reference, 0);
    }
    walk([version_history, deprecated], 0);
    return out.join('\n');
}

/**
 * The index SYSTEM.md carries in place of <!-- METHOD_INDEX -->: every "## method" of the
 * reference pages, grouped by page, each linking to its entry. Names only: the reference entries
 * open with a signature, not a summary, and the names say what they do. The agent learns what
 * exists and where it is documented without carrying the bodies; rule 2 sends it to the entry
 * before it writes the call. The data types are listed by name with one link to their page.
 */
function methodIndex(pages, mode) {
    let out = [];
    for (let item of api_reference[0].items) {
        let page = pages.find((p) => p.key === pageKey(item.link));
        if (!page) throw new Error(`method index: ${item.link} is not a loaded page`);
        let entries = page.headings.filter((h) => h.level === 2);
        if (!entries.length) continue;
        let pageHref = mode === 'bundle' ? `#${page.id}` : pageUrl(page.key);
        let entryHref = (h) => (mode === 'bundle' ? '' : pageUrl(page.key)) + `#${page.id}-${h.slug}`;
        let isTypes = page.key.endsWith('data-types');
        out.push(`### ${isTypes ? 'Data Types' : item.text} ([page](${pageHref}))`);
        if (isTypes) {
            out.push(entries.map((h) => `\`${h.text}\``).join(', '));
            continue;
        }
        out.push(entries.map((h) => `[${h.text}()](${entryHref(h)})`).join(', '));
    }
    return out.join('\n');
}

/* ────────────────────────────── llms.txt ────────────────────────────── */

/** The text of a page's first "# " heading, which is what VitePress titles the page. */
function h1Of(page) {
    let h = page.headings.find((h) => h.level === 1);
    return h ? h.text : null;
}

/**
 * public/llms.txt (https://llmstxt.org): the documentation as a list an AI agent can read.
 * The prompt first, then the bundles, then every sidebar page as its raw markdown url with the
 * title and description from .vitepress/seo-pages.mjs.
 */
function llmsTxt(pages, others) {
    let byKey = Object.fromEntries([...pages, ...others].map((p) => [p.key, p]));
    let pageLine = (link) => {
        let page = byKey[pageKey(link)];
        let rel = link.replace(/^\/+/, '');
        let seo = PAGES[rel] || {};
        let title = seo.title || (page && h1Of(page)) || rel;
        return `- [${title}](${pageUrl(page.key)})` + (seo.description ? `: ${seo.description}` : '');
    };
    let out = [
        '# Skapi Docs',
        '',
        '> ' + DEFAULT_DESCRIPTION,
        '',
        'Skapi is a serverless backend API for web applications. Sign up at https://www.skapi.com, create a project, '
        + 'and connect a plain HTML page, a single-page app or Node.js to it with the skapi-js library and the project ID.',
        '',
        'Every page below is raw markdown. The same page is at the same path with .html instead of /md/ and .md, for a browser.',
        '',
        '## Start here',
        '',
        `- [SKAPI.md](${DOCS_ORIGIN}/${PROMPT_FILE}): the prompt for AI coding agents. Rules, the documentation map and the index of every SDK method, each linking to its page below. Read this one first, then the pages a task needs.`,
        '',
        '## The whole documentation in one file',
        '',
        `- [SKAPI-full.md](${DOCS_ORIGIN}/${FULL_FILE}): the prompt and every page in one markdown file, for tools that index a single document. Too large for a chat context.`,
    ];
    let optional = [];
    for (let node of all_files) {
        if (node.items) {
            out.push('', `## ${node.text}`, '', ...node.items.map((i) => pageLine(i.link)));
        } else if (/^\/(versionlog|deprecated)\//.test(node.link)) {
            optional.push(pageLine(node.link));
        } else {
            out.push('', `## ${node.text}`, '', pageLine(node.link));
        }
    }
    if (optional.length) out.push('', '## Optional', '', ...optional);
    // Pages the sidebar does not list, except the redirect stubs and the unlinked copies that
    // seo-pages.mjs keeps out of search: those exist only so an old address still lands.
    let more = others.filter((p) => !NOINDEX.has(p.sitePath.replace(/^\//, ''))).map((p) => pageLine(p.sitePath));
    if (more.length) out.push('', '## Other pages', '', ...more);
    out.push('');
    return out.join('\n');
}

/* ────────────────────────────── guards ────────────────────────────── */

/**
 * Every /md/ link in the prompt must land: the file exists, and the fragment is an id in it.
 * A broken link here is a page the agent is told to read and cannot.
 */
function checkPromptLinks(prompt, written) {
    let errors = [];
    let re = new RegExp(`\\]\\(${DOCS_ORIGIN.replace(/[.]/g, '\\.')}/${PAGES_DIR}/([^)#\\s]+)\\.md(?:#([^)\\s]+))?\\)`, 'g');
    let count = 0;
    for (let m of prompt.matchAll(re)) {
        count++;
        let text = written[m[1]];
        if (text === undefined) { errors.push(`${m[1]}.md is linked but not written`); continue; }
        if (m[2] && !text.includes(`<a id="${m[2]}"></a>`)) errors.push(`${m[1]}.md has no id "${m[2]}"`);
    }
    return { count, errors };
}

/* ────────────────────────────── build ────────────────────────────── */

function build() {
    let report = { internal: 0, external: 0, ids: 0, warnings: [], skipped: [] };
    let load = (tree) => linksOf(tree).map((link) => loadPage(link, report));
    let fresh = () => ({
        guides: load([method_ref, full_examples, version_history, deprecated]),
        types: load(api_reference),
    });
    let system = (mode, pages) => {
        let text = fs.readFileSync('./SYSTEM.md', 'utf-8')
            .replace('<!-- DOCUMENTATION_MAP -->', documentationMap(pages, mode))
            .replace('<!-- METHOD_INDEX -->', methodIndex(pages, mode));
        let page = loadPage('/SYSTEM.md', report, text);
        page.key = page.id = '';
        return page;
    };

    fs.mkdirSync(path.join(OUT_DIR, PAGES_DIR), { recursive: true });
    for (let stale of fs.readdirSync(path.join(OUT_DIR, PAGES_DIR))) {
        fs.rmSync(path.join(OUT_DIR, PAGES_DIR, stale), { recursive: true, force: true });
    }
    // Earlier builds wrote the bundles next to this script, and two bundles nobody read.
    for (let old of [PROMPT_FILE, ...RETIRED_FILES]) fs.rmSync(old, { force: true });
    for (let old of RETIRED_FILES) fs.rmSync(path.join(OUT_DIR, old), { force: true });

    // The per-page files and the prompt: one set holding EVERY page of the site, file mode, so
    // every cross-link is a url. The sidebar pages come first, in the map's order, then the pages
    // the sidebar does not list (introductions, project settings, redirect stubs), which the
    // agent reaches through links.
    let quiet = { internal: 0, external: 0, ids: 0, warnings: [] };
    let files = fresh();
    let sidebar = [...files.guides, ...files.types];
    let listed = new Set(sidebar.map((p) => p.key));
    let others = sitePages().filter((sp) => !listed.has(pageKey(sp))).map((sp) => loadPage(sp, report));
    // A page whose whole content is frontmatter (the site's home page: a hero and feature tiles
    // VitePress renders from `layout: home`) has no body once the frontmatter is gone. Nothing
    // for an agent to read, so no raw file is written and llms.txt does not list it.
    let empty = others.filter((p) => !p.lines.some((l) => l.trim()));
    others = others.filter((p) => !empty.includes(p));
    for (let p of empty) report.skipped.push(`${p.sitePath}: no body besides frontmatter, not written`);
    let all = [...sidebar, ...others];
    let prompt = system('file', sidebar);
    buildPages([prompt, ...all], report, 'file');
    let written = {};
    for (let p of all) {
        let file = path.join(OUT_DIR, PAGES_DIR, p.key + '.md');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        written[p.key] = compact(p.out.join('\n'));
        fs.writeFileSync(file, written[p.key]);
    }
    let promptText = compact(prompt.out.join('\n'));
    fs.writeFileSync(path.join(OUT_DIR, PROMPT_FILE), promptText);

    // The one-file bundle: its own set, loaded fresh, so every link resolves to an id inside it.
    let full = fresh();
    let fullAll = [...full.guides, ...full.types];
    let fullSystem = system('bundle', fullAll);
    buildPages([fullSystem, ...fullAll], quiet, 'bundle');
    let fullText = fullSystem.out.join('\n')
        + joinPages(full.guides)
        + `\n\n# ${REFERENCE.title} <a id="${REFERENCE.id}"></a>\n\n` + joinPages(full.types);
    fs.writeFileSync(path.join(OUT_DIR, FULL_FILE), compact(fullText));

    fs.writeFileSync(path.join(OUT_DIR, 'llms.txt'), llmsTxt(sidebar, others));

    // Guards.
    let bytes = Buffer.byteLength(promptText);
    let links = checkPromptLinks(promptText, written);
    let failures = [...links.errors];
    if (bytes > PROMPT_MAX_BYTES) failures.push(`${PROMPT_FILE} is ${bytes} bytes; the limit is ${PROMPT_MAX_BYTES} (Codex reads 32 KiB of AGENTS.md)`);
    if (links.count < sidebar.length) failures.push(`${PROMPT_FILE} links ${links.count} pages; the map alone must link all ${sidebar.length} sidebar pages`);

    console.log(
        `Generated ${PROMPT_FILE} (${bytes} bytes, ${links.count} page links), ${all.length} pages under ${PAGES_DIR}/ (${others.length} not on the sidebar), `
        + `${FULL_FILE} and llms.txt in ${OUT_DIR}/: `
        + `${report.internal} links kept inside the set on ${report.ids} ids, ${report.external} links to pages outside it sent to ${DOCS_ORIGIN}.`
    );
    for (let w of [...new Set(report.warnings)]) console.warn('  link warning:', w);
    for (let w of report.skipped) console.log('  skipped:', w);
    if (failures.length) {
        for (let f of failures) console.error('  FAILED:', f);
        process.exit(1);
    }
}

build();
