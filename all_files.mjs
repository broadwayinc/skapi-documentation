import jsoncrawler from 'jsoncrawler';
console.log('jsonCrawler', jsoncrawler);


let api_reference = [
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

let working_with_ai = { text: 'Working with AI Agents', link: '/introduction/ai-driven.md' };

let method_ref = [
    {
        text: 'Introduction',
        items: [
            // { text: 'What is Skapi?', link: '/introduction/what-is-skapi.md' },
            { text: 'Getting Started', link: '/introduction/getting-started.md' },
            { text: 'Working with HTML forms', link: '/introduction/working-with-forms.md' }
        ]
    },
    {
        text: 'Authentication',
        items: [
            // { text: 'What is Authentication?', link: '/authentication/introduction.md' },
            { text: 'Creating an account', link: '/authentication/create-account.md' },
            { text: 'Signup Confirmation', link: '/authentication/signup-confirmation.md' },
            { text: 'Login / Logout', link: '/authentication/login-logout.md' },
            { text: 'User Profile', link: '/authentication/user-info.md' },
            { text: 'Forgot Password', link: '/authentication/forgot-password.md' },
            { text: 'OpenID Login', link: '/authentication/openid-login.md' },
        ]
    },
    {
        text: 'User Account',
        items: [
            { text: 'Updating User Profile', link: '/user-account/update-account.md' },
            { text: 'Email verification', link: '/user-account/email-verification.md' },
            { text: 'Changing Password', link: '/user-account/change-password.md' },
            { text: 'Disable / Recover Account', link: '/user-account/disable-recover-account.md' },
            { text: 'Searching Users', link: '/user-account/get-users.md' },
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
            { text: 'Notifications', link: '/notification/send-notifications.md' }
        ]
    },
    {
        text: 'Full Example: Websocket Chat',
        items: [
            { text: 'HTML', link: '/realtime/chat-example.md' },
        ]
    },
    {
        text: 'Full Example: Video Call',
        items: [
            { text: 'HTML', link: '/realtime/rtc-example.md' },
        ]
    },
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
            { text: 'Newsletter Subscribers', link: '/admin/newsletters.md' },
            { text: 'Plans and Limits', link: '/introduction/plans.md' }
        ]
    },
    {
        text: 'Website Hosting',
        link: '/hosting/hosting.md'
    }
];

let all_files = [
    ...method_ref,
    api_reference[0],
    {
        text: 'Version History',
        link: '/versionlog/versions.md'
    },
    {
        text: 'Deprecated',
        link: '/deprecated/deprecated.md'
    },

    {
        // An absolute url on purpose: VitePress rewrites a site link ending in .md to .html,
        // and /SKAPI.html does not exist. SKAPI.md is served as the raw markdown file.
        text: 'One Pager',
        link: 'https://docs.skapi.com/SKAPI.md'
    }
]

// ---------------------------------------------------------------------------------
// Single file bundles
//
//   skapi-docs.md   every guide page (method_ref)
//   skapi-types.md  every API reference page (api_reference)
//   SKAPI.md        SYSTEM.md + both of the above: the one file an AI agent reads
//
// A page written for the website links to other pages by path ("/database/create.md#x")
// and to its own headings by fragment ("#x"). Neither means anything once 66 pages are
// one file: the paths are gone, and "#errors" exists on a dozen pages. So inside a bundle:
//
//   - every page gets an id:                      doc-database-create
//   - every heading that is linked to gets one:   doc-database-create-errors
//   - a link to a page IN the bundle becomes that id, a "#x" link becomes its own page's
//   - a link to a page NOT in the bundle, and every image, becomes a full
//     https://docs.skapi.com/... url, because that is the only place it still exists
//   - external urls, and everything inside code, are left exactly as written
//
// Heading ids are only written where a link needs one. There are ~650 headings and an id
// costs tokens on every read of the file, for an anchor nothing points at.
// ---------------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { PAGES, DEFAULT_DESCRIPTION } from './.vitepress/seo-pages.mjs';

const DOCS_ORIGIN = 'https://docs.skapi.com';

function linksOf(tree) {
    let links = [];
    jsoncrawler(tree).forEach((item) => {
        if (item.key === 'link') links.push(item.value);
    });
    return links;
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

/**
 * In SKAPI.md the guides simply follow SYSTEM.md, starting at Getting Started, which SYSTEM.md
 * links to like any other page. The API reference is the one part with a heading of its own,
 * and its id is the slug any markdown renderer gives that heading, so SYSTEM.md links to
 * "#api-reference" the way it would link to any heading of its own file.
 */
const REFERENCE = { title: api_reference[0].text, id: slugifyHeading(api_reference[0].text) };

/** A page's frontmatter (`title:`, `description:` ...) is for the website, not for a bundle. */
function stripFrontmatter(text) {
    return text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '');
}

function loadPage(sitePath, text) {
    let key = pageKey(sitePath);
    let lines = stripFrontmatter(text === undefined ? fs.readFileSync('.' + sitePath, 'utf-8') : text).split(/\r?\n/);
    let headings = [];      // { line, slug }
    let taken = {};
    eachProseLine(lines, (line, i) => {
        let m = line.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (!m) return;
        let base = slugifyHeading(headingText(m[2]));
        let slug = base;
        for (let n = 1; taken[slug]; n++) slug = `${base}-${n}`;
        taken[slug] = true;
        headings.push({ line: i, slug });
    });
    return { sitePath, key, id: pageId(key), lines, headings, slugs: taken };
}

/**
 * Rewrites every link of every page for a bundle holding exactly `pages`, then writes the
 * ids those links need. Returns the pages' text, joined.
 */
function buildBundle(pages, report) {
    let byKey = {};
    let idOwner = {};
    for (let p of pages) {
        if (p.key) byKey[p.key.toLowerCase()] = p;
        p.out = p.lines.slice();
        p.wanted = new Set();
    }

    let sectionIds = [REFERENCE.id];
    // SYSTEM.md has no page id: its headings are the file's own, so their slug is their id.
    let idOf = (page, frag) => (page.id ? `${page.id}-${frag}` : frag);

    let fragmentOf = (page, hash) => {
        if (!hash) return null;
        let frag;
        try { frag = decodeURIComponent(hash); } catch (err) { frag = hash; }
        frag = frag.toLowerCase();
        return page.slugs[frag] ? frag : null;
    };

    let resolve = (page, target) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return null;   // external: as is

        let [rawPath, hash = ''] = target.split('#');
        if (!rawPath) {
            // "#x": a heading of the page the link is written on. SYSTEM.md opens the file,
            // so from there it is also how the API reference section is reached.
            if (!page.id && sectionIds.includes(hash.toLowerCase())) return `#${hash.toLowerCase()}`;
            let frag = fragmentOf(page, hash);
            if (!frag) {
                report.warnings.push(`${page.sitePath}: "#${hash}" is not a heading of this page`);
                return page.id ? `#${page.id}` : null;
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
            // Not in this file, so the website is the only place it can be read.
            report.external++;
            let url = sitePath.endsWith('/') ? sitePath : sitePath.replace(/\.(md|html)$/i, '') + '.html';
            return DOCS_ORIGIN + url + (hash ? '#' + hash : '');
        }

        report.internal++;
        if (!hash) return `#${dest.id}`;
        let frag = fragmentOf(dest, hash);
        if (!frag) {
            report.warnings.push(`${page.sitePath}: "${target}" names a heading that ${dest.sitePath} does not have`);
            return `#${dest.id}`;
        }
        dest.wanted.add(frag);
        return '#' + idOf(dest, frag);
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

function joinPages(pages) {
    return pages.filter((p) => p.key).map((p) => '\n\n' + p.out.join('\n') + '\n\n<br>\n\n').join('');
}

/** The table of contents SYSTEM.md carries in place of <!-- DOCUMENTATION_MAP -->. */
function documentationMap() {
    let out = [];
    let walk = (nodes, depth) => {
        for (let node of nodes) {
            let label = node.link ? `[${node.text}](${node.link})` : node.text;
            out.push(`${'  '.repeat(depth)}- ${label}`);
            if (node.items) walk(node.items, depth + 1);
        }
    };
    // The website's sidebar, as is: every guide group, then the API reference.
    walk(method_ref, 0);
    out.push(`- [${REFERENCE.title}](#${REFERENCE.id})`);
    walk(api_reference[0].items, 1);
    return out.join('\n');
}

function build() {
    let report = { internal: 0, external: 0, ids: 0, warnings: [] };
    let load = (tree) => linksOf(tree).map((link) => {
        try {
            return loadPage(link);
        } catch (err) {
            console.error(`Error reading file .${link}:`, err.message);
            return null;
        }
    }).filter(Boolean);

    // The two part bundles. A guide that links to the API reference leaves skapi-docs.md,
    // so there it is a website url; in SKAPI.md the same link stays inside the file.
    let quiet = { internal: 0, external: 0, ids: 0, warnings: [] };
    fs.writeFileSync('skapi-docs.md', joinPages(buildBundle(load(method_ref), quiet)));
    fs.writeFileSync('skapi-types.md', joinPages(buildBundle(load(api_reference), { ...quiet, warnings: [] })));

    let system = loadPage('/SYSTEM.md', fs.readFileSync('./SYSTEM.md', 'utf-8').replace('<!-- DOCUMENTATION_MAP -->', documentationMap()));
    system.key = system.id = '';
    let docs = load(method_ref);
    let types = load(api_reference);
    buildBundle([system, ...docs, ...types], report);

    let skapi = system.out.join('\n')
        + joinPages(docs)
        + `\n\n# ${REFERENCE.title} <a id="${REFERENCE.id}"></a>\n\n` + joinPages(types);

    // Blank lines and the <br> page separators are layout for a person. An agent pays for each.
    skapi = skapi.replace(/^\s*[\r\n]/gm, '').replace(/<br>/gm, '');

    fs.writeFileSync('SKAPI.md', skapi);
    fs.mkdirSync('./public', { recursive: true });
    fs.copyFileSync('./SKAPI.md', './public/SKAPI.md');

    console.log(
        `Generated SKAPI.md: ${docs.length + types.length} pages, ${report.internal} links kept inside the file on ${report.ids} ids, `
        + `${report.external} links to pages outside it sent to ${DOCS_ORIGIN}.`
    );
    for (let w of report.warnings) console.warn('  link warning:', w);
}

/** The text of a page's first "# " heading, which is what VitePress titles the page. */
function h1Of(sitePath) {
    try {
        let found = null;
        eachProseLine(stripFrontmatter(fs.readFileSync('.' + sitePath, 'utf-8')).split(/\r?\n/), (line) => {
            let m = !found && line.match(/^ {0,3}#[ \t]+(.*)$/);
            if (m) found = headingText(m[1]).trim();
        });
        return found;
    } catch (err) {
        return null;
    }
}

/**
 * public/llms.txt (https://llmstxt.org): the documentation as a list an AI agent can read.
 * The one-file bundles first, then every sidebar page as its absolute .html url, with the
 * title and description from .vitepress/seo-pages.mjs. Generated, like public/SKAPI.md.
 */
function writeLlmsTxt(sidebar) {
    let pageLine = (link) => {
        let rel = link.replace(/^\/+/, '');
        let seo = PAGES[rel] || {};
        let title = seo.title || h1Of(link) || rel;
        let url = DOCS_ORIGIN + '/' + rel.replace(/\.md$/i, '.html');
        return `- [${title}](${url})` + (seo.description ? `: ${seo.description}` : '');
    };
    let isSitePage = (link) => link && !/^[a-z][a-z0-9+.-]*:/i.test(link);

    let out = [
        '# Skapi Docs',
        '',
        '> ' + DEFAULT_DESCRIPTION,
        '',
        'Skapi is a serverless backend API for web applications. Sign up at https://www.skapi.com, create a project, '
        + 'and connect a plain HTML page, a single-page app or Node.js to it with the skapi-js library and the project ID.',
        '',
        '## The whole documentation in one file',
        '',
        `- [SKAPI.md](${DOCS_ORIGIN}/SKAPI.md): the system prompt for AI agents, every guide and the full API reference in one markdown file. Read this one to build with Skapi.`,
        `- [skapi-docs.md](${DOCS_ORIGIN}/skapi-docs.md): every guide page in one markdown file`,
        `- [skapi-types.md](${DOCS_ORIGIN}/skapi-types.md): the API reference in one markdown file`,
    ];
    let optional = [];
    for (let node of sidebar) {
        if (node.items) {
            out.push('', `## ${node.text}`, '', ...node.items.filter((i) => isSitePage(i.link)).map((i) => pageLine(i.link)));
        } else if (isSitePage(node.link)) {
            if (/^\/(versionlog|deprecated)\//.test(node.link)) optional.push(pageLine(node.link));
            else out.push('', `## ${node.text}`, '', pageLine(node.link));
        }
    }
    if (optional.length) out.push('', '## Optional', '', ...optional);
    out.push('');

    fs.mkdirSync('./public', { recursive: true });
    fs.writeFileSync('./public/llms.txt', out.join('\n'));
}

build();

all_files[0].items.splice(1, 0, working_with_ai);

writeLlmsTxt(all_files);

export default all_files;