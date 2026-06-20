type Env = {
  GITHUB_APP_ID: string;
  GITHUB_INSTALLATION_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_LABELS?: string;
  ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET?: string;
};

type FeedbackPayload = {
  title?: unknown;
  message?: unknown;
  contact?: unknown;
  turnstileToken?: unknown;
  app?: unknown;
};

type AppEnvironment = {
  appVersion?: string;
  platform?: string;
  cli?: {
    installed?: boolean;
    managed?: boolean;
    activeKind?: string;
  };
  runtime?: {
    available?: boolean;
    opencliVersion?: string | null;
    runtimeKind?: string;
  };
  browserBridge?: {
    chromeDetected?: boolean;
    chromeVersion?: string | null;
    daemonRunning?: boolean;
    extensionConnected?: boolean;
    extensionVersion?: string | null;
    profilesConnected?: number;
  };
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const recentSubmissions = new Map<string, number>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (new URL(request.url).pathname !== '/api/feedback') {
      return json({ ok: false, error: 'not_found' }, 404, cors);
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405, cors);
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ ok: false, error: 'origin_not_allowed' }, 403, cors);
    }

    const clientId = clientIdentifier(request);
    const rateLimit = checkBestEffortRateLimit(clientId);
    if (!rateLimit.ok) {
      return json({ ok: false, error: 'rate_limited', retryAfterSeconds: rateLimit.retryAfterSeconds }, 429, cors);
    }

    let payload: FeedbackPayload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400, cors);
    }

    const parsed = parseFeedback(payload);
    if (!parsed.ok) {
      return json({ ok: false, error: parsed.error }, 400, cors);
    }

    if (!hasGitHubAppConfig(env)) {
      console.error('feedback worker missing GitHub App config');
      return json({ ok: false, error: 'server_not_configured' }, 500, cors);
    }

    if (env.TURNSTILE_SECRET) {
      const token = typeof payload.turnstileToken === 'string' ? payload.turnstileToken : '';
      const turnstile = await verifyTurnstile(env.TURNSTILE_SECRET, token, clientId);
      if (!turnstile) {
        return json({ ok: false, error: 'turnstile_failed' }, 403, cors);
      }
    }

    try {
      await createGitHubIssue(env, parsed.title, parsed.message, parsed.contact, parsed.app);
      rememberSubmission(clientId);
      return json({ ok: true }, 200, cors);
    } catch (error) {
      console.error('feedback issue creation failed', error);
      return json({ ok: false, error: 'github_issue_failed' }, 502, cors);
    }
  },
};

function parseFeedback(payload: FeedbackPayload):
  | { ok: true; title: string; message: string; contact: string; app: AppEnvironment | null }
  | { ok: false; error: string } {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const contact = typeof payload.contact === 'string' ? payload.contact.trim() : '';

  if (message.length < 5) return { ok: false, error: 'message_too_short' };
  if (message.length > 3000) return { ok: false, error: 'message_too_long' };
  if (title.length > 120) return { ok: false, error: 'title_too_long' };
  if (contact.length > 160) return { ok: false, error: 'contact_too_long' };

  return {
    ok: true,
    title,
    message,
    contact,
    app: sanitizeAppEnvironment(payload.app),
  };
}

function hasGitHubAppConfig(env: Env): boolean {
  return Boolean(env.GITHUB_APP_ID && env.GITHUB_INSTALLATION_ID && env.GITHUB_APP_PRIVATE_KEY);
}

function sanitizeAppEnvironment(value: unknown): AppEnvironment | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as AppEnvironment;
  return {
    appVersion: asShortString(raw.appVersion),
    platform: asShortString(raw.platform),
    cli: raw.cli && typeof raw.cli === 'object'
      ? {
          installed: asBoolean(raw.cli.installed),
          managed: asBoolean(raw.cli.managed),
          activeKind: asShortString(raw.cli.activeKind),
        }
      : undefined,
    runtime: raw.runtime && typeof raw.runtime === 'object'
      ? {
          available: asBoolean(raw.runtime.available),
          opencliVersion: asShortString(raw.runtime.opencliVersion),
          runtimeKind: asShortString(raw.runtime.runtimeKind),
        }
      : undefined,
    browserBridge: raw.browserBridge && typeof raw.browserBridge === 'object'
      ? {
          chromeDetected: asBoolean(raw.browserBridge.chromeDetected),
          chromeVersion: asShortString(raw.browserBridge.chromeVersion),
          daemonRunning: asBoolean(raw.browserBridge.daemonRunning),
          extensionConnected: asBoolean(raw.browserBridge.extensionConnected),
          extensionVersion: asShortString(raw.browserBridge.extensionVersion),
          profilesConnected: asNumber(raw.browserBridge.profilesConnected),
        }
      : undefined,
  };
}

function asShortString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 160);
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

async function createGitHubIssue(
  env: Env,
  rawTitle: string,
  message: string,
  contact: string,
  app: AppEnvironment | null,
): Promise<{ html_url: string; number: number }> {
  const owner = env.GITHUB_OWNER || 'jackwener';
  const repo = env.GITHUB_REPO || 'OpenCLI-App';
  const title = `[Feedback] ${shortLine(rawTitle || message, 'OpenCLIApp feedback')}`;
  const body = buildIssueBody(message, contact, app);
  const token = await createInstallationToken(env);
  const labels = parseLabels(env.GITHUB_LABELS);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({
      title,
      body,
      ...(labels.length > 0 ? { labels } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub issue API failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function buildIssueBody(message: string, contact: string, app: AppEnvironment | null): string {
  const environmentLines = app
    ? [
        `- OpenCLIApp: ${app.appVersion || 'unknown'}`,
        `- Platform: ${app.platform || 'unknown'}`,
        `- CLI: ${app.cli?.installed === true ? 'installed' : 'missing'}${app.cli?.managed === true ? ', managed' : ''}${app.cli?.activeKind ? `, ${app.cli.activeKind}` : ''}`,
        `- Runtime: ${app.runtime?.available === true ? app.runtime.opencliVersion || app.runtime.runtimeKind || 'available' : 'unavailable'}`,
        `- Chrome: ${app.browserBridge?.chromeDetected === true ? app.browserBridge.chromeVersion || 'detected' : 'missing'}`,
        `- Browser bridge: daemon=${app.browserBridge?.daemonRunning === true ? 'running' : 'offline'}, extension=${app.browserBridge?.extensionConnected === true ? app.browserBridge.extensionVersion || 'connected' : 'disconnected'}, profiles=${app.browserBridge?.profilesConnected ?? 0}`,
      ]
    : ['- OpenCLIApp: unknown'];

  return [
    '## Feedback',
    '',
    message,
    '',
    ...(contact ? ['## Contact', '', contact, ''] : []),
    '## Environment',
    '',
    ...environmentLines,
    '',
    '_Submitted from OpenCLIApp feedback form._',
  ].join('\n');
}

async function createInstallationToken(env: Env): Promise<string> {
  const jwt = await createGitHubAppJwt(env);
  const response = await fetch(`https://api.github.com/app/installations/${env.GITHUB_INSTALLATION_ID}/access_tokens`, {
    method: 'POST',
    headers: githubHeaders(jwt),
  });

  if (!response.ok) {
    throw new Error(`GitHub installation token API failed: ${response.status} ${await response.text()}`);
  }

  const data: { token?: string } = await response.json();
  if (!data.token) throw new Error('GitHub installation token response omitted token');
  return data.token;
}

async function createGitHubAppJwt(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncodeJson({ alg: 'RS256', typ: 'JWT' });
  const payload = base64UrlEncodeJson({
    iat: now - 60,
    exp: now + 9 * 60,
    iss: env.GITHUB_APP_ID,
  });
  const unsigned = `${header}.${payload}`;
  const key = await importPrivateKey(env.GITHUB_APP_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const { der, format } = decodePemPrivateKey(pem);
  const raw = format === 'pkcs1' ? wrapRsaPrivateKeyPkcs1ToPkcs8(der) : der;
  return crypto.subtle.importKey(
    'pkcs8',
    toArrayBuffer(raw),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function decodePemPrivateKey(pem: string): { der: Uint8Array; format: 'pkcs8' | 'pkcs1' } {
  const normalized = pem.replace(/\\n/g, '\n').trim();
  const pkcs8 = extractPemBody(normalized, 'PRIVATE KEY');
  if (pkcs8) return { der: base64ToBytes(pkcs8), format: 'pkcs8' };
  const pkcs1 = extractPemBody(normalized, 'RSA PRIVATE KEY');
  if (pkcs1) return { der: base64ToBytes(pkcs1), format: 'pkcs1' };
  throw new Error('GitHub App private key must be a PEM PRIVATE KEY or RSA PRIVATE KEY');
}

function extractPemBody(pem: string, label: string): string | null {
  const begin = `-----BEGIN ${label}-----`;
  const end = `-----END ${label}-----`;
  const beginIndex = pem.indexOf(begin);
  const endIndex = pem.indexOf(end);
  if (beginIndex === -1 || endIndex === -1 || endIndex <= beginIndex) return null;
  return pem.slice(beginIndex + begin.length, endIndex).replace(/\s+/g, '');
}

function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function wrapRsaPrivateKeyPkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const rsaEncryptionAlgorithm = new Uint8Array([
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00,
  ]);
  const privateKey = der(0x04, pkcs1);
  return der(0x30, concat(version, rsaEncryptionAlgorithm, privateKey));
}

function der(tag: number, body: Uint8Array): Uint8Array {
  return concat(new Uint8Array([tag]), derLength(body.length), body);
}

function derLength(length: number): Uint8Array {
  if (length < 0x80) return new Uint8Array([length]);
  const bytes: number[] = [];
  let remaining = length;
  while (remaining > 0) {
    bytes.unshift(remaining & 0xff);
    remaining >>= 8;
  }
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function concat(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function verifyTurnstile(secret: string, token: string, remoteIp: string): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', remoteIp);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  if (!response.ok) return false;
  const data: { success?: boolean } = await response.json();
  return data.success === true;
}

function githubHeaders(token: string): HeadersInit {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'user-agent': 'OpenCLIApp-Feedback-Worker',
    'x-github-api-version': '2022-11-28',
  };
}

function parseLabels(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((label) => label.trim()).filter(Boolean).slice(0, 5);
}

function shortLine(value: string, fallback: string): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  if (!compact) return fallback;
  return compact.length > 90 ? `${compact.slice(0, 87)}...` : compact;
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get('origin');
  const allowed = allowedOrigins(env);
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('origin');
  return !origin || allowedOrigins(env).includes(origin);
}

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function checkBestEffortRateLimit(clientId: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const previous = recentSubmissions.get(clientId) ?? 0;
  const cooldownMs = 5 * 60 * 1000;
  if (now - previous < cooldownMs) {
    return { ok: false, retryAfterSeconds: Math.ceil((cooldownMs - (now - previous)) / 1000) };
  }
  return { ok: true };
}

function rememberSubmission(clientId: string): void {
  const now = Date.now();
  recentSubmissions.set(clientId, now);
  for (const [key, timestamp] of recentSubmissions) {
    if (now - timestamp > 10 * 60 * 1000) recentSubmissions.delete(key);
  }
}

function clientIdentifier(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...headers,
    },
  });
}

function base64UrlEncodeJson(value: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
