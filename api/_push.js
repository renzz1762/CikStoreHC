// Helper Web Push CIK STORE (dipakai notif-key / notif-subscribe / notif-send).
// Penyimpanan langganan:
//   1) Upstash Redis / Vercel KV -> env UPSTASH_REDIS_REST_URL+TOKEN (atau KV_REST_API_URL+TOKEN)
//   2) File lokal (.push-data.json) -> cuma buat tes lokal
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let _wp = null;
function webpush() { return _wp || (_wp = require('web-push')); }

function redisCfg() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    return url && token ? { url, token } : null;
}
async function redisCmd(cmd) {
    const c = redisCfg();
    const r = await fetch(c.url, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd)
    });
    const j = await r.json();
    if (j.error) throw new Error('Redis: ' + j.error);
    return j.result;
}
const HASH = 'cik:push';
const redisBackend = {
    name: 'redis',
    async get(k) { const v = await redisCmd(['HGET', HASH, k]); return v ? JSON.parse(v) : null; },
    async set(k, v) { await redisCmd(['HSET', HASH, k, JSON.stringify(v)]); },
    async del(k) { await redisCmd(['HDEL', HASH, k]); },
    async keys(prefix) { const ks = (await redisCmd(['HKEYS', HASH])) || []; return ks.filter(k => k.startsWith(prefix)); }
};

const FILE = path.join(process.env.VERCEL ? require('os').tmpdir() : process.cwd(), '.push-data.json');
function readFile() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return {}; } }
const fileBackend = {
    name: 'file',
    async get(k) { return readFile()[k] || null; },
    async set(k, v) { const d = readFile(); d[k] = v; fs.writeFileSync(FILE, JSON.stringify(d)); },
    async del(k) { const d = readFile(); delete d[k]; fs.writeFileSync(FILE, JSON.stringify(d)); },
    async keys(prefix) { return Object.keys(readFile()).filter(k => k.startsWith(prefix)); }
};

async function backend() {
    if (redisCfg()) return redisBackend;
    if (process.env.VERCEL) {
        throw new Error('Penyimpanan belum disetel. Di Vercel: Storage -> Create -> Upstash Redis, lalu connect ke project ini, lalu Redeploy.');
    }
    return fileBackend;
}

// VAPID dibuat tetap dari NOTIF_SECRET (sama terus walau redeploy)
function deriveVapid(secret) {
    const priv = crypto.createHmac('sha256', String(secret)).update('cik-store-vapid-v1').digest();
    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(priv);
    const b64u = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return { publicKey: b64u(ecdh.getPublicKey()), privateKey: b64u(priv) };
}
async function getVapid(db) {
    const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
    if (pub && priv) return { publicKey: pub, privateKey: priv };
    if (process.env.NOTIF_SECRET) return deriveVapid(process.env.NOTIF_SECRET);
    let v = await db.get('vapid');
    if (!v || !v.publicKey || !v.privateKey) {
        v = webpush().generateVAPIDKeys();
        await db.set('vapid', v);
    }
    return v;
}

function subId(endpoint) { return 'sub:' + crypto.createHash('sha1').update(endpoint).digest('hex'); }
function validSub(s) {
    return s && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000 &&
        s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string' &&
        s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
}
async function saveSub(db, s) {
    await db.set(subId(s.endpoint), { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth }, at: Date.now() });
}
async function removeSub(db, endpoint) { await db.del(subId(endpoint)); }
async function listSubs(db) {
    const ks = await db.keys('sub:');
    const out = [];
    for (let i = 0; i < ks.length; i += 25) {
        const part = await Promise.all(ks.slice(i, i + 25).map(k => db.get(k).then(v => v && { key: k, sub: v }).catch(() => null)));
        part.forEach(p => { if (p) out.push(p); });
    }
    return out;
}

function parseBody(req) {
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    return b && typeof b === 'object' ? b : {};
}
function safeEqual(a, b) {
    const x = crypto.createHash('sha256').update(String(a || '')).digest();
    const y = crypto.createHash('sha256').update(String(b || '')).digest();
    return crypto.timingSafeEqual(x, y);
}

module.exports = { webpush, backend, getVapid, validSub, saveSub, removeSub, listSubs, parseBody, safeEqual, subId };
