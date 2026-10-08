// The published skapi-js version, read from the npm registry once per build, so every
// `skapi-js@latest` a code example writes (the CDN script tag, mostly) is published as the
// release it loads today. The sources keep `@latest`, which is still right when read raw, and
// a build that cannot reach the registry keeps it too.

const REGISTRY = 'https://registry.npmjs.org/skapi-js/latest';
const LATEST = /skapi-js@latest\b/g;
let cached;

export async function skapiVersion() {
    if (cached !== undefined) return cached;
    try {
        let res = await fetch(REGISTRY, { signal: AbortSignal.timeout(10000) });
        let v = res.ok ? (await res.json()).version : null;
        cached = typeof v === 'string' && /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(v) ? v : null;
    } catch {
        cached = null;
    }
    if (!cached) console.warn('  skapi-js version: the npm registry did not answer, code examples keep "skapi-js@latest"');
    return cached;
}

/** `text` with every `skapi-js@latest` written as `skapi-js@<version>`; unchanged without one. */
export function withVersion(text, version) {
    return version && typeof text === 'string' ? text.replace(LATEST, `skapi-js@${version}`) : text;
}
