/* =====================================================================
   AETHER PAGES \u2014 Application logic (vanilla JS, no backend)
   Hash router, state store, access-state resolver, all views, sheets.
   ===================================================================== */
(function () {
"use strict";

/* ============ safe storage (sandbox-proof) ============ */
const MemStore = (() => { const m = new Map(); return { getItem:k=>m.has(k)?m[k.slice?k:k]:undefined, setItem:(k,v)=>{m.set(k,v)}, removeItem:k=>m.delete(k) }; })();
function getStore(){ try { if (window.localStorage) return window.localStorage; } catch(e){} return MemStore; }
const LS = getStore();

/* ============ data refs ============ */
const D = window.DATA;
const byId = (id) => { for (const s of D.STORIES){ const c = s.chapters.find(c=>c.id===id); if (c) return { ch:c, story:s, index:s.chapters.indexOf(c) }; } return null; };
const bySlug = slug => D.STORIES.find(s=>s.slug===slug) || D.STORIES.find(s=>s.id===slug);
const now = () => Date.now();

/* ============ persona / access model ============ */
const PERSONA_ACCESS = {
  anon:       { level:0, signedIn:false },
  "no-access":{ level:0, signedIn:true },
  patron:     { level:1, signedIn:true, provider:"Patreon", tier:"Aether Member", since:"2025-03-12" },
  archivist:  { level:2, signedIn:true, provider:"Patreon", tier:"Archivist Tier", since:"2024-11-02" },
  "key-holder":{ level:0, signedIn:true, hasKey:true },
  lapsed:     { level:0, signedIn:true, provider:"Patreon", tier:"Aether Member", expired:true, prevLevel:1 },
  pending:    { level:0, signedIn:true, provider:"Patreon", pending:true, pendingLevel:1 },
  "no-tier":  { level:0, signedIn:true, provider:"Patreon", noTier:true }
};

/* ============ store ============ */
const defaultStore = () => ({
  personaId: "anon",
  email: "",
  progress: {
    "go-3": { pct:62, scene:"the orchard rang \u2014 a single clear note", storyId:"glass-orchard", updatedAt: now()-3600000 },
    "nc-1": { pct:100, scene:"streets that aren't there", storyId:"night-cartographer", updatedAt: now()-86400000 },
    "as-1": { pct:34, scene:"the morning audit", storyId:"ash-saints", updatedAt: now()-7200000 }
  },
  history: [
    { chapterId:"go-3", storyId:"glass-orchard", title:"What the Mulberry Knew", when:"1h ago", kind:"read" },
    { chapterId:"as-1", storyId:"ash-saints", title:"Prayer Log: Cycle 4471", when:"2h ago", kind:"read" },
    { chapterId:"go-4", storyId:"glass-orchard", title:"The First Remembering", when:"Yesterday", kind:"preview" },
    { chapterId:"nc-1", storyId:"night-cartographer", title:"Streets That Aren't There", when:"Yesterday", kind:"completed" }
  ],
  bookmarks: [
    { chapterId:"go-1", storyId:"glass-orchard", label:"The key was warm with remembered heat", when:"Yesterday" },
    { chapterId:"nc-2", storyId:"night-cartographer", label:"Three nights, she said", when:"2 days ago" }
  ],
  quotes: D.QUOTES_SEED.map(q=>({...q})),
  notes: {},
  followed: ["glass-orchard","meridian-gate","ash-saints"],
  readMarked: { "mk-1":true, "nc-3":true, "nc-1":true },
  comments: {
    "go-1": [
      { id:"c1", para:null, name:"Wren", text:"That first line is going to live in my head. 'Attended to it from the outside' \u2014 devastating.", time:"2d ago", color:"#c75b6b" },
      { id:"c2", para:6, name:"Halric", text:"The detail about the key being warm with remembered heat \u2014 chef's kiss.", time:"1d ago", color:"#5bb8c9" }
    ],
    "nc-1": [
      { id:"c3", para:null, name:"Moth", text:"A complete story I can actually finish. Thank you for these.", time:"3d ago", color:"#9a7ed1" }
    ]
  },
  notifs: D.NOTIFICATIONS_SEED.map(n=>({...n})),
  reactions: {},
  grantedKey: false,
  redeemedKeys: [],
  settings: {
    readerTheme:"aether", fontScale:1, lineHeight:1.78, margin:1,
    preset:"none", showImages:true, showParaComments:true, showProgress:true,
    showReactions:true, spoilerSafe:false,
    bgMode: "story", // "story" | "gradient" | "solid"
    bgBlur: true,    // true | false
    bgImageUrl: "default" // "default" | URL string
  },
  filters: { q:"", chips:[] },
  theme: "aether"
});
let store;
function loadStore(){
  try {
    const raw = LS.getItem("aether-pages-prod-bridge-v1");
    store = raw ? Object.assign(defaultStore(), JSON.parse(raw)) : defaultStore();
  } catch(e){
    store = defaultStore();
  }
  if(!store.settings) store.settings = defaultStore().settings;
  if(!store.settings.bgMode) store.settings.bgMode = "story";
  if(store.settings.bgBlur === undefined) store.settings.bgBlur = true;
  if(!store.settings.bgImageUrl) store.settings.bgImageUrl = "default";
}
function saveStore(){ try { LS.setItem("aether-pages-prod-bridge-v1", JSON.stringify(store)); } catch(e){} }
loadStore();

/* ============ Supabase auth bridge (temporary until full module split) ============ */
const SUPABASE_URL = "https://gdivyqfhgashkqcqqnas.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pumorCjNkGt1RV_Ygfq30A_IFtVz_Lt";
let sbClient = null;
const authState = { user:null, session:null, profile:null, entitlements:[], ready:false, error:null };
function getSupabase(){
  if (sbClient) return sbClient;
  if (!window.supabase || !window.supabase.createClient) return null;
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: "pkce" }
  });
  return sbClient;
}
function activeEntitlements(){
  return (authState.entitlements || []).filter(e => e && (e.status === "active" || e.is_active === true));
}
function entitlementLevel(){
  const active = activeEntitlements();
  if (!active.length) return 0;
  const names = active.map(e => String(e.tier_name || e.name || e.tier || e.required_tier_name || "").toLowerCase());
  if (names.some(n => n.includes("archivist"))) return 2;
  return 1;
}
function accountLabel(){
  return authState.profile?.display_name || authState.profile?.username || authState.user?.email || store.email || "Guest";
}
function isAdmin(){ return authState.profile?.role === "admin"; }
async function refreshProfile(){
  const client = getSupabase();
  if (!client || !authState.user) { authState.profile = null; return null; }
  try {
    const { data, error } = await client.from("profiles").select("id, username, display_name, avatar_url, role").eq("id", authState.user.id).single();
    if (error) throw error;
    authState.profile = data || null;
  } catch (err) {
    console.warn("Unable to load reader profile", err);
    authState.profile = null;
  }
  return authState.profile;
}
function persona(){
  if (!authState.user) return Object.assign({}, PERSONA_ACCESS.anon);
  const level = entitlementLevel();
  if (level > 0) return { level, signedIn:true, provider:"Supabase", tier: level > 1 ? "Archivist Tier" : "Aether Member", since:"" };
  if (store.grantedKey) return Object.assign({}, PERSONA_ACCESS["key-holder"], { signedIn:true });
  if (store.providerPending) return Object.assign({}, PERSONA_ACCESS.pending, { signedIn:true });
  return Object.assign({}, PERSONA_ACCESS["no-access"], { signedIn:true });
}
async function refreshEntitlements(){
  const client = getSupabase();
  if (!client || !authState.user) { authState.entitlements = []; return []; }
  try {
    const { data, error } = await client.rpc("get_my_entitlements");
    if (error) throw error;
    authState.entitlements = Array.isArray(data) ? data : [];
  } catch (err) {
    try {
      const { data, error } = await client.from("user_entitlements").select("*, reader_access_tiers(name, slug)").eq("user_id", authState.user.id);
      if (error) throw error;
      authState.entitlements = (data || []).map(row => ({ ...row, tier_name: row.reader_access_tiers?.name || row.tier_name }));
    } catch (fallbackErr) {
      authState.entitlements = [];
      authState.error = fallbackErr;
    }
  }
  return authState.entitlements;
}
const OAUTH_URL_KEYS = [
  "code", "state", "error", "error_code", "error_description", "sub_auth", "sub_route",
  "access_token", "refresh_token", "expires_at", "expires_in", "provider_token", "provider_refresh_token", "token_type"
];
function mergeOAuthParams(target, raw){
  if (!raw) return;
  const cleaned = raw.replace(/^[/#?&]+/, "");
  if (!cleaned || !/[=&]/.test(cleaned)) return;
  const parsed = new URLSearchParams(cleaned);
  for (const [key, value] of parsed.entries()) {
    if (!target.has(key)) target.set(key, value);
  }
}
function oauthCallbackParams(){
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (!url.hash) return params;
  const rawHash = url.hash.slice(1);
  if (rawHash.includes("?")) mergeOAuthParams(params, rawHash.slice(rawHash.indexOf("?") + 1));
  if (rawHash.includes("#")) mergeOAuthParams(params, rawHash.slice(rawHash.lastIndexOf("#") + 1));
  const marker = rawHash.match(/(?:^|[?#&])(code|access_token|refresh_token|error|error_code|error_description|sub_auth|sub_route)=/);
  if (marker) mergeOAuthParams(params, rawHash.slice(marker.index).replace(/^[?#&]/, ""));
  return params;
}
function cleanHashRoute(hash, fallbackRoute = "vault"){
  const fallback = `#/${String(fallbackRoute || "vault").replace(/^\/?#?\/?/, "")}`;
  if (!hash || hash === "#") return fallback;
  let raw = hash.slice(1);
  const marker = raw.match(/(?:^|[?#&])(code|access_token|refresh_token|expires_at|expires_in|provider_token|provider_refresh_token|token_type|state|error|error_code|error_description|sub_auth|sub_route)=/);
  const cutPoints = [raw.indexOf("?"), raw.indexOf("#"), marker ? marker.index : -1].filter(index => index >= 0);
  if (cutPoints.length) raw = raw.slice(0, Math.min(...cutPoints));
  raw = raw.replace(/[?#&]+$/, "");
  if (!raw || OAUTH_URL_KEYS.some(key => raw.startsWith(`${key}=`))) return fallback;
  return raw.startsWith("#") ? raw : `#${raw.startsWith("/") ? raw : `/${raw}`}`;
}
function cleanOAuthCallbackUrl(){
  const url = new URL(window.location.href);
  const routeTarget = url.searchParams.get("sub_route") || oauthCallbackParams().get("sub_route") || "vault";
  OAUTH_URL_KEYS.forEach(key => url.searchParams.delete(key));
  url.hash = cleanHashRoute(url.hash, routeTarget);
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}
async function consumeOAuthCallback(client){
  const params = oauthCallbackParams();
  const callbackError = params.get("error_description") || params.get("error") || params.get("error_code");
  if (callbackError) {
    cleanOAuthCallbackUrl();
    throw new Error(callbackError);
  }
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken && client.auth.setSession) {
    const { data, error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw error;
    cleanOAuthCallbackUrl();
    return data?.session || null;
  }
  const code = params.get("code");
  if (!code) return null;
  if (!client.auth.exchangeCodeForSession) return null;
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
  cleanOAuthCallbackUrl();
  return data?.session || null;
}
async function initAuth(){
  const client = getSupabase();
  if (!client) { authState.ready = true; authState.error = new Error("Supabase client unavailable"); return; }
  try {
    const callbackSession = await consumeOAuthCallback(client);
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    authState.session = callbackSession || data?.session || null;
    authState.user = authState.session?.user || null;
    store.email = authState.user?.email || "";
    await refreshProfile();
    await refreshEntitlements();
    if (authState.user && store.pendingAuthAction === "connect-patreon") {
      store.pendingAuthAction = "";
      saveStore();
      setTimeout(() => connectPatreonGo(), 450);
    }
    client.auth.onAuthStateChange(async (_event, session) => {
      authState.session = session || null;
      authState.user = session?.user || null;
      store.email = authState.user?.email || "";
      await refreshProfile();
      await refreshEntitlements();
      const pendingAction = authState.user ? store.pendingAuthAction : "";
      if (pendingAction === "connect-patreon") store.pendingAuthAction = "";
      saveStore();
      render();
      if (pendingAction === "connect-patreon") setTimeout(() => connectPatreonGo(), 450);
    });
  } catch (err) {
    authState.error = err;
    console.error("Aether Pages auth bridge failed:", err);
  } finally {
    authState.ready = true;
  }
}
async function signInWithPassword(email, password){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  authState.session = data?.session || null;
  authState.user = data?.user || authState.session?.user || null;
  store.email = authState.user?.email || email;
  await refreshProfile();
  await refreshEntitlements();
  saveStore();
  return authState.user;
}
async function signUpWithPassword(email, password){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const redirect = window.location.href.split("#")[0];
  const { data, error } = await client.auth.signUp({ email, password, options:{ emailRedirectTo: redirect } });
  if (error) throw error;
  authState.user = data?.user || null;
  store.email = email;
  saveStore();
  return data;
}
function subscriptionRedirectTo(){
  if (!window.location.origin || window.location.origin === "null" || window.location.protocol === "file:") {
    throw new Error("Google sign-in needs the page served over http/https, not opened as a file.");
  }
  const url = new URL(window.location.href);
  url.hash = "";
  url.search = "";
  if (!/\/subscription\.html$/i.test(url.pathname)) {
    const base = url.pathname.endsWith("/") ? url.pathname : url.pathname.replace(/\/[^/]*$/, "/");
    url.pathname = `${base}subscription.html`;
  }
  url.searchParams.set("sub_auth", "google");
  url.searchParams.set("sub_route", "vault");
  return url.toString();
}
async function signInWithGoogle(nextAction = ""){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  if (nextAction) store.pendingAuthAction = nextAction;
  store.pendingAuthReturn = "subscription";
  const redirectTo = subscriptionRedirectTo();
  saveStore();
  toast("Opening Google sign-in", "Redirecting through Supabase Auth...", {icon:"external", ms:2200});
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: { prompt: "select_account" }
    }
  });
  if (error) {
    store.pendingAuthAction = "";
    saveStore();
    throw error;
  }
  if (data?.url) window.location.assign(data.url);
  return data;
}
async function signOutReader(){
  const client = getSupabase();
  if (!client) return;
  const { error } = await client.auth.signOut();
  if (error) throw error;
  authState.user = null;
  authState.session = null;
  authState.entitlements = [];
  authState.profile = null;
  store.email = "";
  store.providerPending = false;
  store.pendingAuthAction = "";
  store.pendingAuthReturn = "";
  saveStore();
}
async function syncProviderEntitlements(){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  if (!authState.user) throw new Error("Sign in before syncing access.");
  const { data, error } = await client.functions.invoke("sync-provider-entitlements", { body:{ provider:"patreon" } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  store.providerPending = false;
  await refreshEntitlements();
  await loadBackendLibrary({ force:true });
  saveStore();
  return data;
}
async function requestPatreonOAuth(){
  const client = getSupabase();
  if (!client) throw new Error("Supabase client unavailable.");
  const returnTo = `${window.location.origin}${window.location.pathname}#/vault`;
  const { data, error } = await client.functions.invoke("patreon-oauth-start", { body:{ returnTo } });
  if (error) throw error;
  const url = data?.url || data?.authorization_url || data?.redirect_url;
  if (!url) throw new Error(data?.message || "Patreon connection is not configured yet.");
  window.location.href = url;
}

/* ============ Supabase story/catalog bridge ============ */
const backendState = { loaded:false, loading:false, error:null, usingFixtures:true };
const fixtureStories = Array.isArray(D.STORIES) ? D.STORIES.map(s => ({ ...s, chapters:(s.chapters||[]).map(c=>({ ...c })) })) : [];
function estimateReadTime(row){
  const words = Number(row.word_count || row.words || 0);
  return Math.max(1, Math.round(words / 220)) || 6;
}
function colorPair(row, index){
  const accents = ["#c75b6b", "#d4b06a", "#5bb8c9", "#9a7ed1", "#8fb98a", "#e08a4a"];
  const accent = row.theme_color || row.accent_color || row.accent || accents[index % accents.length];
  return { accent, accent2: row.secondary_color || row.accent2 || accent };
}
function normalizeBackendStory(row, index){
  const colors = colorPair(row, index);
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title || "Untitled story",
    author: row.author || row.author_name || "Abstracto Tales",
    tagline: row.short_description || row.tagline || row.subtitle || "Open the member chapter shelf.",
    premise: row.synopsis || row.description || row.short_description || "",
    recapSafe: row.short_description || row.synopsis || "",
    genre: row.genre || row.category || "Serial fiction",
    status: row.status || "ongoing",
    motif: row.motif || "arcs",
    tags: Array.isArray(row.tags) ? row.tags : [],
    arc: row.arc || "Member archive",
    cover_image_url: row.cover_image_url || row.cover_url || "",
    background_image_url: row.background_image_url || "",
    accent: colors.accent,
    accent2: colors.accent2,
    cast: [],
    glossary: [],
    chapters: [],
    backend: true
  };
}
function backendStateToAether(row){
  if (row.can_read && row.access_state !== "free") return "unlocked";
  if (row.access_state === "free") return "free";
  if (row.access_state === "early_access") return row.preview_text ? "preview" : "early";
  if (row.access_state === "key_locked") return "key";
  if (row.preview_text) return "preview";
  return "locked";
}
function textToBlocks(value){
  const raw = String(value || "").trim();
  if (!raw) return [];
  const withoutImports = raw.replace(/<!--([\s\S]*?)-->/g, "");
  if (/<\/?(p|div|br|h[1-6]|li|blockquote)\b/i.test(withoutImports)) {
    const container = document.createElement("div");
    container.innerHTML = withoutImports;
    const nodes = Array.from(container.querySelectorAll("p, li, blockquote, h1, h2, h3, h4, h5, h6"));
    const blocks = nodes.map(node => ({ t:"p", v: esc(node.textContent || "") })).filter(b => b.v.trim());
    if (blocks.length) return blocks;
    const text = (container.textContent || "").trim();
    return text ? text.split(/\n{2,}/).map(part => ({ t:"p", v: esc(part.trim()) })).filter(b=>b.v) : [];
  }
  return withoutImports.split(/\n{2,}|\r?\n/).map(part => ({ t:"p", v: esc(part.trim()) })).filter(b => b.v);
}
function normalizeBackendChapter(row, story){
  const state = backendStateToAether(row);
  const preview = row.preview_text ? textToBlocks(row.preview_text) : [];
  return {
    id: row.id,
    backend: true,
    story_id: row.story_id || story.id,
    n: Number(row.chapter_order || row.order_index || row.chapter_number || 0) || (story.chapters.length + 1),
    arc: row.arc || story.arc || "Member archive",
    title: row.title || "Untitled chapter",
    state,
    tier: row.required_tier_name || row.required_tier_slug || "Aether Member",
    required_tier_id: row.required_tier_id || null,
    required_tier_name: row.required_tier_name || "",
    publicDate: row.public_release_at || row.public_release_date || "",
    readTime: estimateReadTime(row),
    excerpt: row.preview_text || "",
    preview,
    content: null,
    can_read_backend: !!row.can_read,
    access_state_backend: row.access_state || state,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
function buildBackendUpdates(stories){
  const rows = [];
  stories.forEach(story => (story.chapters || []).forEach(ch => {
    rows.push({
      id:`be-${ch.id}`,
      when: ch.publicDate ? fmtDate(ch.publicDate) : "Latest",
      kind: ch.state === "free" ? "public-unlock" : ch.state === "early" ? "early" : ch.state === "preview" ? "member-drop" : "note",
      story: story.slug,
      chapter: ch.id,
      title: ch.title,
      note: ch.state === "free" ? "Published for all readers." : ch.state === "unlocked" ? "Available through your current access." : "Member access required."
    });
  }));
  return rows.slice(-12).reverse();
}
function isMockId(id) {
  if (!id) return false;
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
}
function purgeMockStoreData() {
  if (backendState.usingFixtures) return;
  if (store.progress) {
    for (const k in store.progress) {
      if (isMockId(k)) delete store.progress[k];
    }
  }
  if (store.history) {
    store.history = store.history.filter(h => h && h.chapterId && !isMockId(h.chapterId));
  }
  if (store.bookmarks) {
    store.bookmarks = store.bookmarks.filter(b => b && b.chapterId && !isMockId(b.chapterId));
  }
  if (store.quotes) {
    store.quotes = store.quotes.filter(q => q && q.chapterId && !isMockId(q.chapterId));
  }
  if (store.followed) {
    store.followed = store.followed.filter(id => !isMockId(id));
  }
  if (store.readMarked) {
    for (const k in store.readMarked) {
      if (isMockId(k)) delete store.readMarked[k];
    }
  }
}
function syncRealNotifications() {
  if (backendState.usingFixtures) return;
  if (!store.dismissedNotifs) store.dismissedNotifs = [];
  const realNotifs = [];
  (D.UPDATES || []).forEach(up => {
    const chId = up.chapter;
    if (!chId || store.dismissedNotifs.includes(chId)) return;
    const found = byId(chId);
    if (!found) return;
    const isRead = !!store.readMarked[chId];
    realNotifs.push({
      id: chId,
      t: found.story.title,
      d: `New chapter: ${found.ch.title}`,
      k: "chapter",
      time: up.when || "Just now",
      read: isRead,
      story: found.story.slug,
      chapter: chId
    });
  });
  const P = persona();
  if (P.signedIn && P.provider === "Patreon" && P.tier) {
    if (!store.dismissedNotifs.includes("patreon-sync")) {
      realNotifs.unshift({
        id: "patreon-sync",
        t: "Patreon Connection Active",
        d: `Successfully synced tier: ${P.tier}`,
        k: "access",
        time: "Synced",
        read: true
      });
    }
  }
  store.notifs = realNotifs;
}

async function loadBackendLibrary(options = {}){
  const client = getSupabase();
  if (!client || backendState.loading) return false;
  if (options.force) backendState.loaded = false;
  backendState.loading = true;
  backendState.error = null;
  try {
    const { data: storyRows, error: storyError } = await client
      .from("stories")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending:false });
    if (storyError) throw storyError;
    const stories = (storyRows || []).map(normalizeBackendStory);

    await Promise.all(stories.map(async (story) => {
      // 1. Fetch chapters (RPC or fallback)
      const fetchChapters = async () => {
        try {
          const { data, error } = await client.rpc("get_chapter_catalog", { target_story_id: story.id });
          if (error) throw error;
          story.chapters = (data || []).map(row => normalizeBackendChapter(row, story));
        } catch (catalogErr) {
          console.warn("Catalog RPC unavailable for subscription story; using direct published chapter metadata fallback", story.slug, catalogErr);
          try {
            const { data: fallbackChapters, error: fallbackError } = await client
              .from("chapters")
              .select("id, story_id, title, chapter_order, word_count, is_published, created_at, updated_at")
              .eq("story_id", story.id)
              .eq("is_published", true)
              .order("chapter_order", { ascending:true });
            if (fallbackError) throw fallbackError;
            story.chapters = (fallbackChapters || []).map(row => normalizeBackendChapter({
              ...row,
              access_state:"free",
              can_read:true,
              preview_text:""
            }, story));
            story.catalogFallback = true;
          } catch (fallbackErr) {
            console.warn("Direct chapter metadata fallback failed", story.slug, fallbackErr);
            story.chapters = [];
          }
        }
      };

      // 2. Fetch characters (cast)
      const fetchCast = async () => {
        try {
          const { data, error } = await client
            .from("characters")
            .select("*")
            .eq("story_id", story.id)
            .order("sort_order", { ascending:true });
          if (error) throw error;
          story.cast = (data || []).map(c => ({
            id: c.id,
            n: c.name,
            r: c.role_title || "",
            bio: c.biography || "",
            img: c.profile_image_url || ""
          }));
        } catch (err) {
          console.warn("Cast load failed for", story.slug, err);
          story.cast = [];
        }
      };

      // 3. Fetch lore entries (glossary)
      const fetchGlossary = async () => {
        try {
          const { data, error } = await client
            .from("lore_entries")
            .select("*")
            .eq("story_id", story.id)
            .order("sort_order", { ascending:true });
          if (error) throw error;
          story.glossary = (data || []).map(l => ({
            t: l.title,
            d: l.description || "",
            img: l.image_url || ""
          }));
        } catch (err) {
          console.warn("Lore load failed for", story.slug, err);
          story.glossary = [];
        }
      };

      // 4. Fetch timeline events
      const fetchTimeline = async () => {
        try {
          const { data, error } = await client
            .from("timeline_events")
            .select("*")
            .eq("story_id", story.id)
            .order("event_order", { ascending:true });
          if (error) throw error;
          story.timeline = data || [];
        } catch (err) {
          console.warn("Timeline load failed for", story.slug, err);
          story.timeline = [];
        }
      };

      // 5. Fetch wallpapers
      const fetchWallpapers = async () => {
        try {
          const { data, error } = await client
            .from("story_wallpapers")
            .select("*")
            .eq("story_id", story.id)
            .order("sort_order", { ascending:true });
          if (error) throw error;
          story.wallpapers = (data || []).map(wp => ({
            id: wp.id,
            name: wp.title || "Wallpaper",
            image_url: wp.image_url
          }));
        } catch (err) {
          console.warn("Wallpapers load failed for", story.slug, err);
          story.wallpapers = [];
        }
      };

      await Promise.all([fetchChapters(), fetchCast(), fetchGlossary(), fetchTimeline(), fetchWallpapers()]);
    }));

    const withChapters = stories.filter(story => story.chapters.length);
    if (withChapters.length) {
      D.STORIES = withChapters;
      D.UPDATES = buildBackendUpdates(withChapters);
      D.PRIMARY_SLUG = withChapters[0].slug;
      D.FEATURED_SLUGS = withChapters.slice(0, 2).map(story => story.slug);
      backendState.usingFixtures = false;
      backendState.loaded = true;
      purgeMockStoreData();
      syncRealNotifications();
      saveStore();
      return true;
    }
    backendState.error = new Error("No published backend stories with catalog rows were found; keeping local fixtures.");
    return false;
  } catch (err) {
    backendState.error = err;
    console.warn("Aether Pages backend library load failed; keeping fixtures.", err);
    D.STORIES = fixtureStories.map(story => ({ ...story, chapters:(story.chapters||[]).map(ch=>({ ...ch })) }));
    backendState.usingFixtures = true;
    return false;
  } finally {
    backendState.loading = false;
  }
}
async function loadReaderChapterIntoFixture(chapterId){
  const client = getSupabase();
  const found = byId(chapterId);
  if (!client || !found || !found.ch.backend) return false;
  if (found.ch.content || found.ch.contentLoading) return !!found.ch.content;
  found.ch.contentLoading = true;
  found.ch.contentError = null;
  try {
    const { data, error } = await client.rpc("get_reader_chapter", { target_chapter_id: chapterId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.can_read || !row.content) throw new Error("This chapter is still locked for this account.");
    found.ch.content = textToBlocks(row.content);
    found.ch.state = row.access_state === "free" ? "free" : "unlocked";
    found.ch.can_read_backend = true;
    return true;
  } catch (err) {
    const message = err?.message || "Unable to load chapter content.";
    found.ch.contentError = message;
    return false;
  } finally {
    found.ch.contentLoading = false;
  }
}

/* ============ site themes ============ */
const THEMES = [
  { id:"aether", name:"Aether", dot:"linear-gradient(135deg,#1a1d28,#d4b06a)" },
  { id:"ember", name:"Ember", dot:"linear-gradient(135deg,#241711,#e08a4a)" },
  { id:"frost", name:"Frost", dot:"linear-gradient(135deg,#14212b,#6fb6c9)" },
  { id:"midnight", name:"Midnight Ink", dot:"linear-gradient(135deg,#161324,#9a7ed1)" },
  { id:"sage", name:"Sage", dot:"linear-gradient(135deg,#161e14,#8fb98a)" },
  { id:"parchment", name:"Parchment", dot:"linear-gradient(135deg,#efe8d8,#9a6b3f)" }
];
function applyTheme(){ document.documentElement.setAttribute("data-theme", store.theme || "aether"); }
function setTheme(id){ store.theme = id; saveStore(); applyTheme(); }
applyTheme();

/* ============ access-state resolver ============ */
function chapterResolved(ch) {
  const P = persona();
  if (ch.state === "free") return { state:"free", isEarly:false };
  if (ch.state === "unavailable") return { state:"unavailable" };
  if (ch.state === "key") return { state: (P.hasKey || store.grantedKey) ? "unlocked" : "key", isEarly:false };
  const isArch = ch.tier === "Archivist Tier";
  const need = isArch ? 2 : 1;
  // active access covers it
  if (P.level >= need) return { state:"unlocked", isEarly: ch.state==="early" };
  // sync pending (will unlock member-tier content)
  if (P.pending) {
    if (need <= (P.pendingLevel||0)) return { state:"pending" };
    return { state: gateDisplay(ch) };
  }
  // expired (previously held this access)
  if (P.expired) {
    if (need <= (P.prevLevel||0)) return { state:"expired", isEarly: ch.state==="early" };
    return { state: gateDisplay(ch) };
  }
  // Patreon linked but no qualifying tier
  if (P.noTier) return { state: gateDisplay(ch), noTier: ch.state!=="preview" };
  // anonymous / signed-in-no-access / key-holder without this tier
  return { state: gateDisplay(ch), isEarly: ch.state==="early" };
}
// maps an intrinsic chapter gate to what a reader WITHOUT access should see
function gateDisplay(ch){
  if (ch.state === "preview") return "preview";
  if (ch.state === "early") return "early";
  if (ch.state === "locked") return "locked";
  // base "unlocked" means member-tier gated \u2014 never expose as readable without access
  return "locked";
}
function reasonFor(ch, r) {
  if (r.state === "pending") return "Verifying your access with Patreon \u2014 usually a moment.";
  if (r.state === "expired") return "Your Aether Member access has expired. Renew to continue.";
  if (r.noTier) return "Your Patreon tier does not include Aether Pages access.";
  if (r.state === "key") return "Redeem an access key to read this chapter.";
  return D.KEY_REASONS[ch.id] || "";
}
function isReadable(r){ return r.state==="free" || r.state==="unlocked"; }
function hasImages(ch){ const c = ch.content||ch.preview||[]; return c.some(b=>b.t==="img"); }

/* ============ icons ============ */
const I = {
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9.5 20v-5h5v5"/></svg>`,
  library:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="m16 5 4 1-3 14-4-1z"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>`,
  feed:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  shelf:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16M4 4h5a2 2 0 0 1 2 2v14M20 4v16M20 4h-5a2 2 0 0 0-2 2"/></svg>`,
  vault:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8v1.5M12 14.5V16M8 12h1.5M14.5 12H16"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  star:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3 6.8.7-5 4.7 1.4 6.7L12 17.8 5.9 20.4l1.4-6.7-5-4.7 6.8-.7z"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  lock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  lockOpen:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-1.5"/></svg>`,
  eye:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  hourglass:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12M6 21h12M7 3c0 4 5 5 5 9s-5 5-5 9M17 3c0 4-5 5-5 9s5 5 5 9"/></svg>`,
  key:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2-2M14 14l2-2"/></svg>`,
  sync:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>`,
  alert:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 6"/></svg>`,
  checkCirc:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></svg>`,
  open:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h7M4 6v12M4 18h7M14 4l6 8-6 8"/></svg>`,
  chevR:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  chevL:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>`,
  aa:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18 8 6l4 12M5.5 14h5M14 18l3-9 3 9M15 15h4"/></svg>`,
  play:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></svg>`,
  heart:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21Z"/></svg>`,
  msg:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4z"/></svg>`,
  quote:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 6c-3 1-5 4-5 8v4h6v-6H6c0-2 1-4 3-5zm10 0c-3 1-5 4-5 8v4h6v-6h-4c0-2 1-4 3-5z"/></svg>`,
  bookmark:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`,
  bookmarkFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z"/></svg>`,
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>`,
  door:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4a1 1 0 0 1 1-1h9l4 3v15"/><path d="M5 21h14M9 11h2"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>`,
  layers:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>`,
  orbit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/></svg>`,
  fire:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-1 4-1 6 0 1 1 2 2 2 0-2 1-2 1-2 2 2 3 4 3 6a5 5 0 0 1-10 0c0-3 2-4 2-6 0-1 1-4 3-6Z"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
  mail:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`,
  gift:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9S9 3 6.5 5 9 9 12 9Zm0 0s3-6 5.5-4S15 9 12 9Z"/></svg>`,
  spark:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z"/></svg>`,
  external:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`,
  copy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  map:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 6-2 6 2 6-2v12l-6 2-6-2-6 2z"/><path d="M9 5v14M15 7v14"/></svg>`,
  help:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.2 9.5a3 3 0 0 1 5.2 1.5c.3 2-2.4 2.3-2.4 4"/><path d="M12 17.5v.5"/></svg>`,
  grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>`,
  cog:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`,
  flame:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4c1 2 0 3 0 4s1 2 2 2 1-3 1-3c2 2 4 4 4 7a5 5 0 0 1-10 0c0-3 2-5 3-10Z"/></svg>`,
  tear:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/></svg>`,
  overview:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="11" rx="1.5"/><rect x="3" y="17" width="8" height="4" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/></svg>`,
  palette:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .9-1.5 2-1.5h2c2.2 0 4-1.8 4-4 0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor"/><circle cx="16.5" cy="11" r="1.1" fill="currentColor"/></svg>`,
  trending:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></svg>`
};
function icon(n, cls){ return `<span class="${cls||''}">${I[n]||""}</span>`; }

/* ============ cover art generator ============ */
function coverArt(s){
  if (s && s.cover_image_url) {
    return `<img class="cover-art" src="${s.cover_image_url}" alt="${esc(s.title)}" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;" />`;
  }
  const a=s.accent, a2=s.accent2, dark="#0b0a10";
  const motifs = {
    shards:`<g opacity=".9">${poly(400,200,120,6,a2,.5)}${poly(300,260,80,5,a,.45)}${poly(500,160,90,6,a,.4)}${poly(360,330,70,5,a2,.35)}<g stroke="${a2}" stroke-opacity=".25" fill="none" stroke-width="1">${[...Array(7)].map((_,i)=>`<path d="M${120+i*70} 460 L${200+i*40} 0"/>`).join("")}</g></g>`,
    arcs:`<g fill="none" stroke="${a2}" stroke-opacity=".5" stroke-width="2"><circle cx="400" cy="460" r="140"/><circle cx="400" cy="460" r="200" stroke-opacity=".3"/><circle cx="400" cy="460" r="270" stroke-opacity=".18"/></g><circle cx="400" cy="120" r="60" fill="${a}" opacity=".6"/><g stroke="${a2}" stroke-width="2" stroke-opacity=".6"><path d="M400 320 V460"/></g>`,
    orbit:`<g fill="none" stroke="${a2}" stroke-opacity=".4" stroke-width="2"><ellipse cx="400" cy="240" rx="260" ry="90" transform="rotate(-18 400 240)"/></g><circle cx="400" cy="240" r="86" fill="${a}" opacity=".75"/><circle cx="610" cy="180" r="14" fill="${a2}"/><circle cx="180" cy="300" r="8" fill="${a2}" opacity=".7"/><g fill="${a2}" opacity=".8">${[...Array(40)].map(()=>{const x=Math.random()*800,y=Math.random()*480,r=Math.random()*1.4;return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`;}).join("")}</g>`,
    map:`<g stroke="${a2}" stroke-opacity=".5" fill="none" stroke-width="1.6">${[...Array(6)].map((_,i)=>`<path d="M${60+i*10} ${120+i*40} C ${260} ${90+i*30}, ${420} ${200+i*20}, ${620+i*10} ${140+i*40}"/>`).join("")}<path d="M120 380 C 300 320, 460 400, 700 340" stroke-opacity=".4"/></g><g fill="${a2}"><circle cx="280" cy="180" r="4"/><circle cx="520" cy="300" r="4"/><circle cx="640" cy="160" r="4"/></g>`,
    key:`<g stroke="${a2}" stroke-width="3" fill="none" stroke-opacity=".55"><circle cx="400" cy="180" r="70"/><circle cx="400" cy="180" r="30" fill="${a}" fill-opacity=".5" stroke="none"/><path d="M400 250 V400 M400 340h40 M400 370h30"/></g><g stroke="${a2}" stroke-opacity=".2" stroke-width="1">${[...Array(8)].map((_,i)=>`<path d="M${400} ${180} L${400+Math.cos(i)*120|0} ${180+Math.sin(i)*120|0}"/>`).join("")}</g>`
  };
  function poly(cx,cy,r,n,fill,op){ const pts=[...Array(n)].map((_,i)=>{const ang=(i/n)*Math.PI*2 - Math.PI/2; return `${cx+Math.cos(ang)*r},${cy+Math.sin(ang)*r}`;}).join(" "); return `<polygon points="${pts}" fill="${fill}" opacity="${op||.4}"/>`; }
  return `<svg class="cover-art" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="cg-${s.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${a}" stop-opacity=".25"/></linearGradient>
    <radialGradient id="cgR-${s.id}" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${a}" stop-opacity=".3"/><stop offset="1" stop-color="${dark}" stop-opacity="0"/></radialGradient></defs>
    <rect width="800" height="480" fill="${dark}"/><rect width="800" height="480" fill="url(#cg-${s.id})"/><rect width="800" height="480" fill="url(#cgR-${s.id})"/>
    ${motifs[s.motif]||motifs.arcs}
    <rect width="800" height="480" fill="url(#vg-${s.id})"/>
    <defs><linearGradient id="vg-${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark}" stop-opacity="0"/><stop offset=".7" stop-color="${dark}" stop-opacity=".2"/><stop offset="1" stop-color="${dark}" stop-opacity=".6"/></linearGradient></defs>
  </svg>`;
}

/* ============ UI primitives ============ */
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function badge(kind, text){ return `<span class="badge ${kind||""}">${text}</span>`; }
function chip(label, act, active, svg){ return `<button class="chip ${active?"active":""}" ${act?`data-${act}`:""}>${svg?`<span class="ic">${I[svg]||""}</span>`:""}<span>${label}</span></button>`; }
function storyAccentVars(s){ return `--s:${s.accent};--s2:${s.accent2};--s-soft:${hexA(s.accent,0.14)};--accent:${s.accent};--accent-2:${s.accent2};`; }
function hexA(hex,a){ const h=hex.replace("#","");const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return `rgba(${r},${g},${b},${a})`; }

function accessTag(r){
  const map = {
    free:["free","Free",I.open,"Read now"],
    unlocked:["unlocked","Unlocked",I.checkCirc,"Read now"],
    preview:["preview","Preview",I.eye,"Preview"],
    early:["early","Early Access",I.hourglass,"Early access"],
    locked:["locked","Locked",I.lock,"Unlock"],
    key:["key","Key",I.key,"Redeem key"],
    pending:["pending","Syncing",I.sync,"Verifying"],
    expired:["expired","Expired",I.lock,"Renew"],
    unavailable:["error","Unavailable",I.alert,"Unavailable"]
  };
  const m = map[r.state] || map.locked;
  return m;
}
function axInline(r){ const m=accessTag(r); return `<span class="ax ${m[0]}"><span class="ic">${m[2]}</span>${m[1]}</span>`; }

function progressBar(pct){ return `<div class="bar"><i style="width:${Math.min(100,Math.max(0,pct))}%"></i></div>`; }
function ring(pct){ return `<div class="ring" style="--p:${pct}"><span>${pct}%</span></div>`; }

function commentCount(chId){ const c=store.comments[chId]||[]; return c.length; }
function paraComments(chId, p){ return (store.comments[chId]||[]).filter(c=>c.para===p); }

function ctaFor(ch, r, story, opts){
  opts = opts||{};
  const cid = ch.id;
  if (r.state === "free" || r.state === "unlocked") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''} story" data-read="${cid}">${I.play}Read</span>`;
  if (r.state === "preview") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-preview="${cid}">${I.eye}Preview</span>`;
  if (r.state === "early") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.hourglass}Early access</span>`;
  if (r.state === "pending") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.sync}Verifying</span>`;
  if (r.state === "expired") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.lockOpen}Renew</span>`;
  if (r.state === "key") return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.key}Redeem key</span>`;
  if (r.state === "unavailable") return `<span class="btn sm" style="opacity:0.45;pointer-events:none">Unavailable</span>`;
  return `<span class="btn ${opts.small?'sm':''} ${opts.block?'block':''}" data-lock="${cid}">${I.lockOpen}Unlock</span>`;
}

/* ============ shared partials ============ */
function brandMark(){ return `<svg class="mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7cd97"/><stop offset="1" stop-color="#d4b06a"/></linearGradient></defs><path d="M16 2 4 9v8c0 6 5 10 12 13 7-3 12-7 12-13V9z" fill="url(#bm)" opacity=".18" stroke="#d4b06a" stroke-width="1.2"/><path d="M16 8 9 12v5c0 4 3 7 7 9 4-2 7-5 7-9v-5z" fill="none" stroke="#e7cd97" stroke-width="1.4"/><path d="M16 11v10M12 16h8" stroke="#d4b06a" stroke-width="1.2" stroke-linecap="round"/></svg>`; }

function topbar(){
  const P = persona();
  const state = P.expired?"expired":P.pending?"pending":(P.noTier||P.level===0&&P.signedIn)?"none":P.level>0?"active":"anon";
  const label = !P.signedIn?"Not signed in":P.expired?"Access expired":P.pending?"Sync pending":P.noTier?"No access":P.tier?("Active \u00b7 "+P.tier):"Signed in";
  const unread = store.notifs.filter(n=>!n.read).length;
  return `<header class="topbar">
    <a class="brand" href="#/" data-nav="/">${brandMark()}<span><span class="serif">Aether Pages</span><small>Member Reader</small></span></a>
    <span class="spacer"></span>
    <button class="access-chip" data-state="${state}" data-nav="/vault"><span class="pulse"></span>${label}</button>
    ${isAdmin()?`<a class="tb-btn" href="admin.html" aria-label="Admin CMS">${I.shield}</a>`:""}
    <button class="tb-btn" data-nav="/notifications" aria-label="Notifications">${I.bell}${unread?`<span class="dot"></span>`:""}</button>
    <button class="tb-btn" data-sheet="persona" aria-label="Account and access">${I.user}</button>
  </header>`;
}
function bottomnav(active){
  const items=[["home","/","Home"],["library","/library","Library"],["feed","/updates","Updates"],["shelf","/my-shelf","Shelf"],["vault","/vault","Vault"]];
  return `<nav class="bottomnav">${items.map(([ic,path,lbl])=>`<a href="#${path}" data-nav="${path}" class="${active===ic?'active':''}">${I[ic]}<span>${lbl}</span></a>`).join("")}</nav>`;
}
function sidenav(active){
  const items=[["home","/","Home"],["library","/library","Library"],["feed","/updates","Updates"],["shelf","/my-shelf","Shelf"],["vault","/vault","Vault"]];
  return `<nav class="sidenav">${items.map(([ic,path,lbl])=>`<a href="#${path}" data-nav="${path}" class="${active===ic?'active':''}">${I[ic]}<span>${lbl}</span></a>`).join("")}<div class="spacer"></div><a href="#" onclick="return false" data-sheet="settings">${I.aa}<span>Prefs</span></a><a href="#" onclick="return false" data-sheet="persona">${I.user}<span>Account</span></a></nav>`;
}
function announcement(){
  return `<div class="announce"><span class="ic">${I.info}</span><div class="t"><b>Patreon sync is running smoothly</b><span>New early-access chapters are live. Public releases this week are noted in the calendar.</span></div></div>`;
}

/* ============ sheets ============ */
let currentSheet = null;
function openSheet(builder, opts){
  opts = opts||{};
  closeSheet(true);
  const scrim = document.querySelector(".scrim") || (()=>{const d=document.createElement("div");d.className="scrim";document.body.appendChild(d);return d;})();
  const sheet = document.querySelector(".sheet") || (()=>{const d=document.createElement("div");d.className="sheet";document.body.appendChild(d);return d;})();
  sheet.innerHTML = `<span class="grip"></span>${builder()}`;
  document.body.classList.add("has-sheet");
  requestAnimationFrame(()=>{ scrim.classList.add("open"); sheet.classList.add("open"); });
  currentSheet = { builder, opts };
  if (opts.onMount) requestAnimationFrame(()=>opts.onMount(sheet));
}
function closeSheet(silent){
  const scrim = document.querySelector(".scrim"), sheet = document.querySelector(".sheet");
  if (scrim) scrim.classList.remove("open");
  if (sheet) sheet.classList.remove("open");
  document.body.classList.remove("has-sheet");
  currentSheet = null;
}

/* ============ toasts ============ */
function toast(title, sub, opts){
  opts = opts||{};
  const wrap = document.querySelector(".toasts") || (()=>{const d=document.createElement("div");d.className="toasts";document.body.appendChild(d);return d;})();
  const t = document.createElement("div"); t.className="toast";
  const ic = opts.kind||"good";
  t.innerHTML = `<span class="ic ${ic==='good'?'good':ic==='bad'?'bad':''}">${opts.icon?I[opts.icon]:I.check}</span><div class="txt"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</div>${opts.action?`<button class="act" data-toast-action="${opts.action.act}">${esc(opts.action.label)}</button>`:""}`;
  wrap.appendChild(t);
  requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); }, opts.ms||4200);
}

/* ============ router ============ */
let route = { name:"home", params:{} };
function parseHash(){
  const raw = location.hash.replace(/^#\/?/, "");
  const p = raw.split("/").filter(Boolean);
  const r = { name:"home", params:{} };
  if (!p.length) return r;
  if (p[0]==="library") r.name="library";
  else if (p[0]==="updates") r.name="updates";
  else if (p[0]==="calendar") r.name="calendar";
  else if (p[0]==="collections"){ r.name = p[1]?"collection":"collections"; r.params.slug=p[1]; }
  else if (p[0]==="vault") r.name="vault";
  else if (p[0]==="my-shelf") r.name="shelf";
  else if (p[0]==="bookmarks") r.name="bookmarks";
  else if (p[0]==="quotes") r.name="quotes";
  else if (p[0]==="history") r.name="history";
  else if (p[0]==="notifications") r.name="notifications";
  else if (p[0]==="benefits") r.name="benefits";
  else if (p[0]==="onboarding") r.name="onboarding";
  else if (p[0]==="help") r.name="help";
  else if (p[0]==="support"){ r.name = { "check-access":"checkAccess","wrong-account":"wrongAccount","contact":"contact" }[p[1]] || "help"; }
  else if (p[0]==="story"){ r.params.slug=p[1]; r.name = { chapters:"chapters", recap:"recap", extras:"extras", updates:"storyUpdates" }[p[2]] || "story"; }
  else if (p[0]==="read"){ r.params.id=p[1]; r.name="read"; }
  else if (p[0]==="studio"){
    r.name = { chapters:"studioChapters", access:"studioAccess", announcements:"studioAnnouncements", media:"studioMedia", analytics:"studioAnalytics", settings:"studioSettings" }[p[1]] || "studioOverview";
  }
  return r;
}
function nav(path){ if(path===location.hash||( "#"+path)===location.hash){ render(); } else { location.hash = path; } }

function render(){
  route = parseHash();
  const main = document.getElementById("main");
  const inReader = route.name === "read";
  const inStudio = /^studio/.test(route.name);
  document.body.classList.toggle("in-reader", inReader);
  document.body.classList.toggle("in-studio", inStudio);
  if (inReader) {
    document.body.setAttribute("data-reader-theme", store.settings.readerTheme);
  } else {
    document.body.removeAttribute("data-reader-theme");
  }
  const isStoryRoute = ["story", "chapters", "recap", "extras", "storyUpdates", "read"].includes(route.name);
  if (!isStoryRoute) {
    clearStoryAccent();
  }
  const view = VIEWS[route.name] || VIEWS.home;
  const html = (inStudio && !isAdmin()) ? adminGate() : view();
  const apply = ()=>{
    if (inReader){
      main.innerHTML = html;
    } else if (inStudio){
      main.innerHTML = `<div class="vt studio-body">${html}</div>`;
    } else {
      main.innerHTML = `<div class="vt">${html}</div>`;
    }
    if (inStudio && isAdmin()){ ensureStudioChrome(); }
    else if (!inReader){ ensureChrome(); }
    afterRender();
    if (window.scrollTo) { try { window.scrollTo(0,0); } catch(e){} }
  };
  const reduce = store.settings.preset==="none" ? false : false; // respect media query via CSS mostly
  if (document.startViewTransition && !prefersReducedMotion()){
    document.startViewTransition(apply);
  } else apply();
}
function adminGate(){
  return `<div class="empty" style="padding-top:90px"><div class="em">${I.shield}</div><h3>Admin access required</h3><p>The author studio is only visible to profiles with the <code>admin</code> role. Use the main admin CMS for production access controls.</p>${authState.user?`<a class="btn story" href="admin.html">${I.external}Open admin CMS</a>`:`<button class="btn story" data-sheet="persona">${I.user}Sign in</button>`}<button class="btn ghost" data-nav="/">Back to reader</button></div>`;
}
function prefersReducedMotion(){ return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

let chromeBuilt = false;
function ensureChrome(){
  const app = document.getElementById("app");
  // remove studio chrome if present (leaving studio)
  const studioTopEl = document.querySelector(".studio-top");
  if (studioTopEl) studioTopEl.remove();
  document.body.classList.remove("in-studio");
  if (!document.querySelector(".topbar")){ const tb=document.createElement("header"); tb.innerHTML=""; }
  // rebuild chrome each render to update access chip / notif dot
  let topEl = document.querySelector(".topbar");
  if (!topEl){ topEl=document.createElement("header"); app.insertBefore(topEl, document.getElementById("main")); }
  topEl.outerHTML = topbar();
  let navEl = document.querySelector(".bottomnav");
  if (!navEl){ navEl=document.createElement("nav"); app.appendChild(navEl); }
  const active = {home:"home",library:"library",updates:"feed",shelf:"shelf",vault:"vault"}[route.name] || "";
  navEl.outerHTML = bottomnav(active);
  let sideEl = document.querySelector(".sidenav");
  if (!sideEl){ sideEl=document.createElement("nav"); app.insertBefore(sideEl, document.getElementById("main")); }
  sideEl.outerHTML = sidenav(active);
  chromeBuilt = true;
}
function ensureStudioChrome(){
  const app = document.getElementById("app");
  const tb=document.querySelector(".topbar"); if(tb) tb.remove();
  const nv=document.querySelector(".bottomnav"); if(nv) nv.remove();
  const sd=document.querySelector(".sidenav"); if(sd) sd.remove();
  let st = document.querySelector(".studio-top");
  if(!st){ st=document.createElement("header"); st.className="studio-top"; app.insertBefore(st, document.getElementById("main")); }
  st.outerHTML = studioTop();
}
function studioTop(){
  const active = { studioOverview:"", studioChapters:"chapters", studioAccess:"access", studioAnnouncements:"announcements", studioMedia:"media", studioAnalytics:"analytics", studioSettings:"settings" }[route.name];
  const nav=[
    ["","Overview","overview"],["chapters","Chapters","book"],["access","Access","vault"],
    ["announcements","Posts","msg"],["media","Media","spark"],["analytics","Stats","grid"],["settings","Settings","cog"]
  ];
  return `<div class="studio-top">
    <div class="st-row">
      <a class="brand" href="#/studio" data-nav="/studio">${brandMark()}<span class="btxt"><span class="serif">Aether Studio</span><small>Author CMS</small></span></a>
      <span class="exit"><button class="btn sm ghost" data-nav="/">${I.chevL}Exit to reader</button></span>
    </div>
    <nav class="studio-nav">${nav.map(([p,l,ic])=>`<a href="#/studio${p?'/'+p:''}" data-nav="/studio${p?'/'+p:''}" class="${active===p?'active':''}">${I[ic]}<span>${l}</span></a>`).join("")}</nav>
  </div>`;
}

/* ============ views registry ============ */
const VIEWS = {};

/* ============ small helpers ============ */
function fmtDate(iso){ if(!iso) return ""; const m=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const d=new Date(iso); return m[d.getMonth()]+" "+d.getDate(); }
function daysUntil(iso){ if(!iso) return null; const d=new Date(iso); const t=new Date("2026-06-24"); return Math.max(0, Math.round((d-t)/86400000)); }
function applyBgSettings() {
  if (!document.body) return;
  const bgMode = store.settings.bgMode || "story";
  const bgBlur = store.settings.bgBlur !== false;
  document.body.setAttribute("data-bg-mode", bgMode);
  document.body.setAttribute("data-bg-blur", bgBlur ? "true" : "false");
}
function getActiveStory() {
  if (route.name === "read" && currentChapter) {
    return currentChapter.story;
  }
  if (route.params && route.params.slug) {
    return bySlug(route.params.slug);
  }
  return D.STORIES && D.STORIES[0];
}
function wallpaperSwatches(story) {
  if (!story) return "";
  const wallpapers = story.wallpapers || [];
  const activeWp = store.settings.bgImageUrl || "default";
  const defaultCoverUrl = story.cover_image_url || "";
  
  let html = `<div class="wp-swatches">`;
  
  // 1. Default Cover
  html += `
    <button class="wp-swatch ${activeWp === 'default' ? 'active' : ''}" data-set-bg-url="default" aria-label="Story Cover">
      <div class="wp-thumb" style="background-image: url('${defaultCoverUrl}')"></div>
      <span class="nm">Story Cover</span>
      <span class="ck">${I.check}</span>
    </button>
  `;
  
  // 2. Wallpapers
  wallpapers.forEach((wp, idx) => {
    html += `
      <button class="wp-swatch ${activeWp === wp.image_url ? 'active' : ''}" data-set-bg-url="${wp.image_url}" aria-label="${wp.name}">
        <div class="wp-thumb" style="background-image: url('${wp.image_url}')"></div>
        <span class="nm">${wp.name || 'Wallpaper ' + (idx + 1)}</span>
        <span class="ck">${I.check}</span>
      </button>
    `;
  });
  
  html += `</div>`;
  return html;
}
function setStoryAccent(s){
  document.documentElement.style.setProperty("--s", s.accent);
  document.documentElement.style.setProperty("--s2", s.accent2);
  document.documentElement.style.setProperty("--s-soft", hexA(s.accent,0.14));
  document.documentElement.style.setProperty("--accent", s.accent);
  document.documentElement.style.setProperty("--accent-2", s.accent2);
  const bg = document.getElementById("global-bg");
  if (bg) {
    const selectedWp = store.settings.bgImageUrl;
    const bgUrl = (selectedWp && selectedWp !== "default") ? selectedWp : (s.background_image_url || s.cover_image_url || "");
    if (bgUrl) {
      bg.style.backgroundImage = `url('${bgUrl}')`;
      bg.style.opacity = "1";
      document.body.classList.add("has-story-bg");
    } else {
      bg.style.backgroundImage = "";
      bg.style.opacity = "0";
      document.body.classList.remove("has-story-bg");
    }
  }
}
function clearStoryAccent(){
  document.documentElement.style.removeProperty("--s");
  document.documentElement.style.removeProperty("--s2");
  document.documentElement.style.removeProperty("--s-soft");
  document.documentElement.style.removeProperty("--accent");
  document.documentElement.style.removeProperty("--accent-2");
  const bg = document.getElementById("global-bg");
  if (bg) {
    const firstStory = D.STORIES && D.STORIES[0];
    const selectedWp = store.settings.bgImageUrl;
    const bgUrl = (selectedWp && selectedWp !== "default") ? selectedWp : (firstStory ? (firstStory.background_image_url || firstStory.cover_image_url) : "");
    if (bgUrl) {
      bg.style.backgroundImage = `url('${bgUrl}')`;
      bg.style.opacity = "0.7";
      document.body.classList.add("has-story-bg");
    } else {
      bg.style.backgroundImage = "";
      bg.style.opacity = "0";
      document.body.classList.remove("has-story-bg");
    }
  }
}
function meta(items){ return items.filter(Boolean).map(x=>`<span class="mi">${x}</span>`).join(""); }
function countReadable(){ let n=0; D.STORIES.forEach(s=>s.chapters.forEach(c=>{ if(isReadable(chapterResolved(c))) n++; })); return n; }
function activeReads(){ return Object.entries(store.progress).map(([id,p])=>{ const f=byId(id); return f?{...f, prog:p}:null; }).filter(Boolean).sort((a,b)=>b.prog.updatedAt-a.prog.updatedAt); }
function totalComments(){ return Object.values(store.comments).reduce((s,a)=>s+a.length,0); }

/* ============ shared card builders ============ */
function storyCard(s){
  const r = s.chapters.map(chapterResolved);
  const memberOnly = r.every(x=>x.state!=="free") && s.chapters.some(c=>c.state!=="free");
  const freeBadge = s.chapters.some(c=>c.state==="free");
  const prog = s.chapters.map(c=>store.progress[c.id]).filter(Boolean);
  const lastUpd = Math.max(0,...s.chapters.map((c,i)=>i));
  return `<a class="story-card" href="#/story/${s.slug}" data-nav="/story/${s.slug}" style="${storyAccentVars(s)}">
    <div class="cover">${coverArt(s)}${memberOnly?`<span class="ribbon">Member</span>`:""}${prog.length?`<div class="progress-pip">${progressBar(prog[0].pct)}</div>`:""}</div>
    <div class="meta"><h3>${s.title}</h3><div class="by">${s.author} \u00b7 ${s.genre}</div></div>
  </a>`;
}
function storyCardWide(s){
  const r = s.chapters.map(chapterResolved);
  const prog = store.progress[s.chapters[0].id] || store.progress[s.chapters.find(c=>store.progress[c.id])?.id];
  return `<a class="card tinted" href="#/story/${s.slug}" data-nav="/story/${s.slug}" style="${storyAccentVars(s)};display:flex;gap:13px;align-items:center;">
    <div style="width:54px;height:72px;border-radius:8px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(s)}</div>
    <div style="min-width:0;flex:1"><div style="font-family:var(--serif);font-weight:600">${s.title}</div><div class="faint" style="font-size:.74rem">${s.genre} \u00b7 ${s.status}</div></div>
  </a>`;
}

/* ============ HOME ============ */
VIEWS.home = function(){
  const P = persona();
  const reads = activeReads();
  const tonights = reads.find(r=>r.prog.pct>0 && r.prog.pct<100) || reads[0];
  const hour = new Date().getHours();
  const greet = hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const name = P.signedIn? "reader" : "traveller";

  // access banner
  let banner = "";
  if (P.expired) banner = accessBanner("expired","Your Aether Member access has expired","Some chapters are now locked. Renew to continue reading \u2014 a short grace window may still apply.","/vault","Renew access");
  else if (P.pending) banner = accessBanner("pending","We're verifying your access","Your Patreon connection is syncing. This usually takes a moment \u2014 we'll update automatically.","/support/check-access","Check status");
  else if (P.noTier) banner = accessBanner("none","Your Patreon tier doesn't include access","You're connected, but your current tier doesn't unlock Aether Pages.","/benefits","See what unlocks");
  else if (!P.signedIn) banner = accessBanner("anon","Browsing as a guest","Read free chapters and previews freely. Connect Patreon or redeem a key to unlock the rest.","/vault","Activate access");

  return `
  ${announcement()}
  ${banner}
  <div class="between" style="margin-bottom:6px">
    <div><h1 class="page-title">${greet}, ${name}.</h1><p class="page-sub">The archive is quiet tonight. ${countReadable()} chapters await you.</p></div>
    <div class="faint" style="text-align:right;font-size:.72rem;line-height:1.5"><div style="font-family:var(--serif);color:var(--accent-2);font-size:.9rem">Archive Presence</div>5 evenings this month \u00b7 12 chapters read</div>
  </div>

  <div class="home-cols">
   <div>
    ${tonights?`<div class="section">
      <div class="section-head"><div><div class="eyebrow">Tonight's Reading</div></div></div>
      <div class="card tinted" style="${storyAccentVars(tonights.story)};display:flex;gap:14px;align-items:center">
        <div style="width:62px;height:84px;border-radius:9px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(tonights.story)}</div>
        <div style="flex:1;min-width:0">
          <div class="faint" style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase">Continue \u00b7 ${tonights.story.title}</div>
          <div style="font-family:var(--serif);font-weight:600;font-size:1.05rem;margin:2px 0">${tonights.ch.title}</div>
          <div class="faint" style="font-size:.78rem;margin-bottom:8px">${tonights.ch.readTime-2} min left \u00b7 you stopped near \u201c${tonights.prog.scene}\u201d</div>
          ${progressBar(tonights.prog.pct)}
        </div>
        <button class="btn story sm" data-read="${tonights.ch.id}">${I.play}Resume</button>
      </div>
    </div>`:""}

    <div class="section">
      <div class="section-head"><h2>Continue your threads</h2><a class="section-link" data-nav="/my-shelf">My shelf ${I.chevR}</a></div>
      <div class="lane stagger">
        ${reads.slice(0,6).map(({ch,story,prog})=>{
          const r=chapterResolved(ch); const next = story.chapters[story.chapters.indexOf(ch)+1]; const nr = next?chapterResolved(next):null;
          return `<button class="card" style="width:230px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}">
            <div class="faint" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em">${story.title}</div>
            <div style="font-family:var(--serif);font-weight:600;margin:2px 0 6px">${ch.title}</div>
            ${progressBar(prog.pct)}
            <div class="between" style="margin-top:8px"><span class="faint" style="font-size:.72rem">${prog.pct<100?prog.pct+'%':'Completed'}</span>${nr?`<span class="faint" style="font-size:.68rem">Next: ${accessTag(nr)[1]}</span>`:""}</div>
          </button>`;
        }).join("")}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Latest in the archive</h2><a class="section-link" data-nav="/updates">All updates ${I.chevR}</a></div>
      <div class="col-flex">
        ${D.UPDATES.slice(0,4).map(u=>updateRow(u)).join("")}
      </div>
    </div>
   </div>

   <div>
    ${memberArchivePanel()}
    <div class="section">
      <div class="section-head"><h2>Newly available to you</h2></div>
      <div class="card" style="padding:14px">
        ${D.UPDATES.filter(u=>u.kind==="newly-available"||u.kind==="public-unlock").map(u=>`<div class="between" style="padding:6px 0"><div><div style="font-size:.86rem;font-weight:600">${u.title}</div><div class="faint" style="font-size:.72rem">${u.note}</div></div>${u.chapter?`<button class="btn sm story" data-read="${u.chapter}">Read</button>`:""}</div>`).join("")}
      </div>
    </div>
    <div class="section">
      <div class="section-head"><h2>Because you read\u2026</h2></div>
      <div class="col-flex">
        ${D.STORIES.slice(1, 3).map(storyCardWide).join("") || `<p class="faint" style="font-size:.8rem">More recommendations will appear as the backend library grows.</p>`}
      </div>
      <p class="faint" style="font-size:.74rem;margin-top:8px">Read <em>The Night Cartographer</em>? Try these atmospheric completions.</p>
    </div>
   </div>
  </div>

  <div class="section">
    <div class="section-head"><h2>Collections</h2><a class="section-link" data-nav="/collections">Browse all ${I.chevR}</a></div>
    <div class="chips scroll">${D.COLLECTIONS.slice(0,8).map(c=>`<a class="chip" href="#/collections/${c.slug}" data-nav="/collections/${c.slug}">${I[c.icon]||I.book}<span>${c.name}</span></a>`).join("")}</div>
  </div>
  `;
};
function accessBanner(kind,title,sub,link,label){
  const col = {expired:"bad",pending:"warn",none:"muted",anon:"info"}[kind];
  return `<div class="card" style="margin-bottom:14px;display:flex;gap:13px;align-items:center;border-color:color-mix(in srgb,var(--${col==='bad'?'bad':col==='warn'?'warn':col==='info'?'info':'text-faint'}) 30%,var(--border));background:linear-gradient(160deg,color-mix(in srgb,var(--${col==='bad'?'bad':col==='warn'?'warn':col==='info'?'info':'text-faint'}) 8%,var(--surface)),var(--surface))">
    <span class="ax ${col==='bad'?'expired':col==='warn'?'pending':col==='info'?'preview':'locked'}" style="font-size:1.4rem"><span class="ic" style="width:26px;height:26px">${kind==='expired'?I.lock:kind==='pending'?I.sync:kind==='anon'?I.info:I.alert}</span></span>
    <div style="flex:1;min-width:0"><div style="font-weight:700;font-family:var(--serif)">${title}</div><div class="faint" style="font-size:.8rem;margin-top:1px">${sub}</div></div>
    <button class="btn sm" data-nav="${link}">${label}</button>
  </div>`;
}
function memberArchivePanel(){
  const P=persona();
  const illus = D.STORIES.reduce((n,s)=>n+s.chapters.filter(hasImages).length,0);
  return `<div class="card tinted" style="margin-bottom:6px">
    <div class="between" style="margin-bottom:12px"><div class="eyebrow">Member Archive</div>${P.signedIn?badge("gold",P.tier||"Signed in"):badge("", "Guest")}</div>
    <div class="stat-grid">
      <div class="stat"><div class="n">${countReadable()}</div><div class="l">Readable now</div></div>
      <div class="stat"><div class="n">${totalComments()}</div><div class="l">Reader notes</div></div>
      <div class="stat"><div class="n">${illus}</div><div class="l">Illustrated</div></div>
      <div class="stat"><div class="n">${store.followed.length}</div><div class="l">Following</div></div>
    </div>
    <div class="quicklinks" style="margin-top:14px">
      <a data-nav="/my-shelf">${I.shelf}<span>My Shelf</span><small>Threads &amp; quotes</small></a>
      <a data-nav="/benefits">${I.spark}<span>Benefits</span><small>What access unlocks</small></a>
      <a data-nav="/support/check-access">${I.shield}<span>Access Check</span><small>Verify access</small></a>
      <a data-nav="/calendar">${I.calendar}<span>This Week</span><small>Releases</small></a>
    </div>
  </div>`;
}
function updateRow(u){
  const s=bySlug(u.story); if(!s) return "";
  const kindLabel={early:"Early access","public-unlock":"Public release","newly-available":"Newly unlocked","member-drop":"Member drop",note:"Author note",schedule:"Schedule",campaign:"Key campaign"}[u.kind]||"Update";
  const kColor={early:"early","public-unlock":"free","newly-available":"gold","member-drop":"key",note:"",schedule:"",campaign:"key"}[u.kind]||"";
  return `<div class="row" ${u.chapter?`data-read="${u.chapter}"`:`data-nav="/story/${s.slug}/updates"`}>
    <span class="ic-col" style="color:var(--${kColor||'text-dim'})">${u.chapter?I.feed:I.msg}</span>
    <span class="body"><span class="t"><span class="tt">${u.title}</span>${badge(kColor,kindLabel)}</span>
    <span class="sub">${meta([`<i>${I.clock}</i>${u.when}`,s.title,u.note])}</span></span>
    <span class="cta">${u.chapter?`<button class="btn sm" data-read="${u.chapter}">Read</button>`:`<span class="faint">${I.chevR}</span>`}</span>
  </div>`;
}

/* ============ LIBRARY ============ */
VIEWS.library = function(){
  const q=store.filters.q||""; const chips=store.filters.chips||[];
  const timeFilters=[["under10","Under 10 min"],["10-20","10\u201320 min"],["binge","Bingeable"]];
  const stateFilters=[["readable","Readable now"],["free","Free starts"],["preview","Previews"],["early","Early access"],["member","Member"],["key","Key content"]];
  const statusFilters=[["ongoing","Ongoing"],["completed","Completed"]];
  function matches(s){
    if(q){ const t=(s.title+" "+s.author+" "+s.genre+" "+s.tags.join(" ")).toLowerCase(); if(!t.includes(q.toLowerCase())) return false; }
    if(chips.includes("ongoing")&&s.status!=="ongoing") return false;
    if(chips.includes("completed")&&s.status!=="completed") return false;
    if(chips.includes("free")&&!s.chapters.some(c=>c.state==="free")) return false;
    if(chips.includes("member")&&!s.chapters.some(c=>c.tier)) return false;
    if(chips.includes("early")&&!s.chapters.some(c=>c.state==="early")) return false;
    if(chips.includes("preview")&&!s.chapters.some(c=>c.state==="preview")) return false;
    if(chips.includes("key")&&!s.chapters.some(c=>c.state==="key")) return false;
    if(chips.includes("readable")&&!s.chapters.some(c=>isReadable(chapterResolved(c)))) return false;
    if(chips.includes("under10")&&!s.chapters.some(c=>c.readTime<10)) return false;
    if(chips.includes("10-20")&&!s.chapters.some(c=>c.readTime>=10&&c.readTime<=20)) return false;
    return true;
  }
  const list=D.STORIES.filter(matches);
  return `
  <h1 class="page-title">The Library</h1>
  <p class="page-sub">${D.STORIES.length} stories across fantasy, gothic, and the far future.</p>
  <div style="position:relative;margin:6px 0 14px">
    <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-faint);display:flex">${I.search}</span>
    <input id="lib-search" class="pill-input" style="text-align:left;padding-left:42px" placeholder="Search stories, authors, genres\u2026" value="${esc(q)}">
  </div>
  <div class="chips scroll" style="margin-bottom:8px">${stateFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}${statusFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}</div>
  <div class="chips scroll" style="margin-bottom:18px">${timeFilters.map(([k,l])=>chip(l,"filter="+k,chips.includes(k))).join("")}<a class="chip" data-nav="/collections">${I.layers}<span>Collections</span></a></div>
  <div class="section-head"><h2>${chips.length||q?"Results":"All stories"}</h2><span class="faint" style="font-size:.78rem">${list.length} shown</span></div>
  ${list.length?`<div class="grid-stories stagger">${list.map(storyCard).join("")}</div>`:`<div class="empty"><div class="em">ðŸ“š</div><h3>No stories match</h3><p>Try clearing a filter or searching for something broader.</p><button class="btn" data-act="clear-filters">Clear filters</button></div>`}
  <div class="section"><div class="section-head"><h2>Pinned to My Shelf</h2></div><div class="lane">${store.followed.map(id=>{const s=bySlug(id);return s?storyCard(s):"";}).join("")}</div></div>
  `;
};

/* ============ STORY HUB ============ */
VIEWS.story = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story");
  setStoryAccent(s);
  const r=s.chapters.map(chapterResolved);
  const readCount=s.chapters.filter((c,i)=>store.readMarked[c.id]|| (store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
  const total=s.chapters.length;
  const pct=Math.round(readCount/total*100);
  const nextUnread=s.chapters.find(c=>!(store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)));
  const latestEarly=s.chapters.find(c=>c.state==="early");
  const followed=store.followed.includes(s.id);
  const firstFree=s.chapters.find(c=>c.state==="free");
  const lastRead=activeReads().find(x=>x.story.id===s.id);
  const startCh = lastRead?.ch.id || (firstFree?.id) || s.chapters[0].id;
  const startR = chapterResolved(byId(startCh).ch);

  let castHtml = "";
  if (s.cast && s.cast.length > 0) {
    castHtml = `
    <div class="section">
      <div class="section-head"><h2>Cast</h2></div>
      <div class="cast-grid">
        ${s.cast.map(c => {
          const charUrl = c.id ? `index.html#gallery/${s.slug}/${c.id}` : `index.html#gallery/${s.slug}`;
          const imgHtml = c.img
            ? `<img src="${c.img}" alt="${esc(c.n)}" />`
            : `<div class="cast-fallback">${esc((c.n||"?")[0].toUpperCase())}</div>`;
          return `<a class="cast-tile" href="${charUrl}" target="_blank">
            ${imgHtml}
            <div class="cast-label">
              ${esc(c.n)}
              ${c.r ? `<div class="cast-role">${esc(c.r)}</div>` : ""}
            </div>
          </a>`;
        }).join("")}
      </div>
    </div>`;
  }

  let glossaryHtml = "";
  if (s.glossary && s.glossary.length > 0) {
    glossaryHtml = `
    <div class="section">
      <div class="section-head"><h2>Lore</h2></div>
      <div class="glossary-grid">
        ${s.glossary.map(g => {
          const imgHtml = g.img
            ? `<img src="${g.img}" alt="${esc(g.t)}" />`
            : `<div class="glossary-fallback">${I.book||"\u{1F4D6}"}</div>`;
          return `<div class="glossary-tile">
            ${imgHtml}
            <div class="glossary-label">${esc(g.t)}</div>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  }

  let timelineHtml = "";
  if (s.timeline && s.timeline.length > 0) {
    const timelineUrl = `index.html#timeline/${s.slug}`;
    timelineHtml = `
    <div class="section">
      <div class="section-head"><h2>Timeline</h2></div>
      <a class="timeline-cta" href="${timelineUrl}" target="_blank">
        <div class="timeline-cta-icon">${I.list||""}</div>
        <div class="timeline-cta-body">
          <div class="timeline-cta-title">Story Timeline</div>
          <div class="timeline-cta-sub">${s.timeline.length} events \u00b7 Open in the main reader for the full chronicle</div>
        </div>
        <span class="faint">${I.external||""}</span>
      </a>
    </div>`;
  }

  const coverUrl = s.cover_image_url || "";
  return `
  <div class="hero" style="${storyAccentVars(s)}">
    <div class="book-hero-cover">
      <img src="${coverUrl}" alt="${esc(s.title)}" />
    </div>
    <div class="book-hero-details">
      <div class="book-hero-meta">${s.genre} \u00b7 ${s.status}</div>
      <h1>${s.title}</h1>
      <div class="book-hero-author">by ${s.author}</div>
      <div class="tags" style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px;">${s.tags.map(t=>badge("",t)).join("")}</div>
      <div class="book-hero-tagline" style="margin:0;">${s.tagline || ""}</div>
    </div>
  </div>

  <div class="sticky-cta"><button class="btn primary block" data-read="${startCh}">${lastRead?(I.play+"Continue \u2014 "+lastRead.ch.title):"Start reading"}</button></div>

  <div class="card tinted" style="margin-bottom:14px">
    <div class="between" style="margin-bottom:12px"><div><div class="eyebrow">Your progress</div><div style="font-family:var(--serif);font-size:1.1rem;font-weight:600;margin-top:2px">${readCount} / ${total} chapters read</div></div>${ring(pct)}</div>
    <div class="faint" style="font-size:.8rem;line-height:1.6">
      ${nextUnread?`Next unread: <b style="color:var(--text)">${nextUnread.title}</b> \u00b7 `:""}${latestEarly?`Latest: <b style="color:var(--early)">${latestEarly.title}</b> (early access) \u00b7 `:""}${s.chapters.filter(c=>!isReadable(chapterResolved(c))).length} locked for you.
    </div>
  </div>

  <div class="section-head"><h2>Where should I start?</h2></div>
  <div class="quicklinks" style="margin-bottom:18px">
    <a data-read="${firstFree?.id||s.chapters[0].id}">${I.play}<span>Chapter 1</span><small>From the beginning</small></a>
    <a data-read="${startCh}">${I.book}<span>Continue</span><small>${lastRead?lastRead.ch.title:"Where you left off"}</small></a>
    <a data-nav="/story/${s.slug}/recap">${I.list}<span>Recap</span><small>Catch up first</small></a>
    <a data-nav="/story/${s.slug}/extras">${I.spark}<span>Extras</span><small>Bonus materials</small></a>
  </div>

  <div class="section">
    <div class="section-head"><h2>Latest chapters</h2><a class="section-link" data-nav="/story/${s.slug}/chapters">Full shelf ${I.chevR}</a></div>
    <div class="col-flex">${s.chapters.slice(-3).reverse().map(c=>chapterRow(c,s)).join("")}</div>
  </div>

  <div class="section">
    <div class="between"><div class="section-head" style="margin:0"><h2>Follow this story</h2></div><button class="btn sm ${followed?'':'story'}" data-follow="${s.id}">${followed?I.checkCirc+"Following":I.plus+"Follow"}</button></div>
    <p class="faint" style="font-size:.78rem;margin-top:-4px">${followed?"We'll notify you when new chapters unlock for you.":"Get notified when new chapters unlock for your access."}</p>
  </div>

  ${castHtml}
  ${glossaryHtml}
  ${timelineHtml}

  <div class="section">
    <div class="card" style="display:flex;gap:12px;align-items:center">
      <span class="faint">${I.external}</span>
      <div style="flex:1"><div style="font-weight:600;font-size:.88rem">Explore in the main archive</div><div class="faint" style="font-size:.76rem">Deep lore, maps, timelines &amp; galleries on Abstracto Tales.</div></div>
      <button class="btn sm ghost" data-act="external-archive">${I.external}</button>
    </div>
  </div>
  `;
};

/* ============ CHAPTER SHELF ============ */
VIEWS.chapters = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story");
  setStoryAccent(s);
  const view = store.filters.shelfView || "comfortable";
  // group by arc
  const arcs={}; s.chapters.forEach(c=>{ (arcs[c.arc]=arcs[c.arc]||[]).push(c); });
  const renderRow = c => chapterRow(c,s);
  return `
  <div class="between" style="margin-bottom:6px"><a class="section-link" data-nav="/story/${s.slug}" style="display:inline-flex;align-items:center;gap:4px;color:var(--text-dim)">${I.chevL}<span>${s.title}</span></a></div>
  <h1 class="page-title">Chapter Shelf</h1>
  <p class="page-sub">${s.chapters.length} chapters \u00b7 ${s.chapters.filter(c=>isReadable(chapterResolved(c))).length} readable for you now</p>
  <div class="seg story" style="margin:6px 0 18px">
    <button class="${view==='comfortable'?'active':''}" data-shelf-view="comfortable">Comfortable</button>
    <button class="${view==='compact'?'active':''}" data-shelf-view="compact">Compact</button>
    <button class="${view==='arc'?'active':''}" data-shelf-view="arc">By arc</button>
  </div>
  ${view==="arc"? Object.entries(arcs).map(([arc,chs])=>{
    const rd=chs.filter(c=>store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
    const lk=chs.filter(c=>!isReadable(chapterResolved(c))).length;
    return `<div class="arc"><div class="arc-head"><h3>${arc}</h3><div class="arc-bar">${progressBar(rd/chs.length*100)}</div><span class="arc-meta">${rd}/${chs.length}${lk?` \u00b7 ${lk} locked`:""}</span></div><div class="col-flex">${chs.map(renderRow).join("")}</div></div>`;
  }).join("") : `<div class="col-flex">${s.chapters.map(renderRow).join("")}</div>`}
  `;
};
function chapterRow(ch, story){
  const r=chapterResolved(ch);
  const prog=store.progress[ch.id];
  const read = store.readMarked[ch.id] || (prog&&prog.pct>=100);
  const now_ = prog && prog.pct>0 && prog.pct<100;
  const cmt = commentCount(ch.id);
  const illus = hasImages(ch);
  const tag=accessTag(r);
  const act = isReadable(r)?`data-read="${ch.id}"`:(r.state==='preview'?`data-preview="${ch.id}"`:`data-lock="${ch.id}"`);
  const compact = (store.filters.shelfView==="compact");
  return `<div class="row ${read?'read':''} ${now_?'now':''}" style="${story?storyAccentVars(story):''}" ${act}>
    <span class="num">${read?'<span style="color:var(--good)">'+I.check+'</span>':ch.n}</span>
    <span class="body">
      <span class="t"><span class="tt">${ch.title}</span>${r.isEarly?badge('early','Early'):''}${illus?badge('illus','Illus'):''}${ch.state==='key'?badge('key','Key'):''}</span>
      <span class="sub">${meta([axInline(r),`<i>${I.clock}</i>${ch.readTime} min`,cmt?`<i>${I.msg}</i>${cmt}`:"",ch.publicDate?`<i>${I.calendar}</i>Public ${fmtDate(ch.publicDate)}`:""])}</span>
      ${(!compact && reasonFor(ch,r))?`<span class="reason">${reasonFor(ch,r)}</span>`:""}
    </span>
    <span class="cta">${ctaFor(ch,r,story,{small:true})}</span>
  </div>`;
}

/* ============ READER ============ */
let currentChapter = null;
VIEWS.read = function(){
  const found = byId(route.params.id);
  if(!found) return notFound("Chapter");
  const {ch, story, index} = found; currentChapter = found;
  setStoryAccent(story);
  const r = chapterResolved(ch);
  if (r.state === "preview") return readerPreview(ch, story, index, r);
  if (!isReadable(r)) return readerLocked(ch, story, index, r);
  if (ch.backend && !ch.content) {
    if (!ch.contentLoading) loadReaderChapterIntoFixture(ch.id).then(() => render());
    const message = ch.contentError || "Loading secure chapter text from Supabase...";
    return readerShell(`theme-${store.settings.readerTheme} preset-${store.settings.preset}`, `<div class="reader-loading">${ch.contentError?`<div class="em" style="font-size:2rem;color:var(--bad);margin-bottom:8px">${I.alert}</div>`:`<div class="reader-spinner"></div>`}<h3>${ch.contentError?"Chapter unavailable":"Opening secure chapter"}</h3><p>${esc(message)}</p>${ch.contentError?`<button class="btn sm story" data-lock="${ch.id}">${I.lockOpen}Check access</button>`:""}</div>`);
  }
  return readerFull(ch, story, index, r);
};
function readerShell(themeClass, inner, settings){
  const st = store.settings;
  const fs = (1.12*st.fontScale).toFixed(3)+"rem";
  return `<div class="reader ${themeClass}" id="reader" style="--fs:${fs};--lh:${st.lineHeight}">
    <div class="reader-progress"><i id="rprog" style="width:0%"></i></div>
    <header class="reader-top" id="rtop">
      <button class="rback" data-nav="/story/${currentChapter.story.slug}/chapters" aria-label="Back">${I.chevL}</button>
      <div class="ctx"><div class="s">${currentChapter.story.title} \u00b7 Ch ${currentChapter.ch.n}</div><div class="c">${currentChapter.ch.title}</div></div>
      <button class="rset" data-sheet="settings" aria-label="Reader settings">${I.aa}</button>
    </header>
    <div class="reader-stage" id="rstage">${inner}</div>
    ${readerBar()}
  </div>`;
}
function readerBar(){
  const ch=currentChapter.ch; const id=ch.id;
  const bk = store.bookmarks.find(b=>b.chapterId===id);
  const cmt = commentCount(id);
  return `<div class="reader-bar" id="rbar">
    <button data-sheet="settings" aria-label="Settings">${I.aa}</button>
    <button data-act="reader-prev" aria-label="Previous">${I.chevL}</button>
    <button data-act="reader-next" aria-label="Next">${I.chevR}</button>
    <button data-act="reader-bookmark" class="${bk?'active':''}" aria-label="Bookmark">${bk?I.bookmarkFill:I.bookmark}</button>
    <button data-act="reader-comments" aria-label="Comments">${I.msg}${cmt?`<span class="mini">${cmt}</span>`:""}</button>
    <button data-sheet="context" aria-label="More">${I.list}</button>
  </div>`;
}
function renderBlocks(blocks, chId){
  return blocks.map((b,i)=>{
    if(b.t==="scene") return `<div class="scene">âœ¦ âœ¦ âœ¦</div>`;
    if(b.t==="img") return `<figure data-fig="${b.fig}" style="cursor:pointer">${D.FIG[b.fig]||""}<figcaption>${b.cap||""}</figcaption></figure>`;
    if(b.t==="p"){
      const pc = paraComments(chId,i);
      return `<p class="para" data-p="${i}">${b.v}<span class="pchip ${pc.length?'has':''}" data-para="${i}">${pc.length||'+'}</span></p>`;
    }
    return "";
  }).join("");
}
function readerFull(ch, story, index, r){
  const st=store.settings;
  const themeClass=`theme-${st.readerTheme} preset-${st.preset} ${st.showImages?'':'no-img'} ${st.showParaComments?'':'no-pchip'} ${st.focusMode?'focus':''}`;
  const blocks = ch.content || ch.preview || (ch.excerpt ? [{t:"p",v:ch.excerpt}] : [{t:"p",v:"The full text of this chapter will appear here once it is published."}]);
  const next = story.chapters[index+1];
  const nr = next?chapterResolved(next):null;
  return readerShell(themeClass, `
    <h1 class="ch-title">${ch.title}</h1>
    <div class="ch-by">${story.title} \u00b7 Chapter ${ch.n} \u00b7 ${ch.readTime} min \u00b7 ${r.isEarly?'Early access until '+fmtDate(ch.publicDate):'Unlocked'}</div>
    ${ch.arc?`<div class="faint" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;margin-bottom:24px">${ch.arc}</div>`:""}
    <div class="prose" id="prose">${renderBlocks(blocks, ch.id)}</div>
    ${endOfChapter(ch, story, next, nr)}
    ${commentsBlock(ch.id)}
  `);
}
function readerPreview(ch, story, index, r){
  const st=store.settings;
  const themeClass=`theme-${st.readerTheme} preset-${st.preset}`;
  return readerShell(themeClass, `
    <div class="badge preview" style="margin-bottom:14px">${I.eye}Preview</div>
    <h1 class="ch-title">${ch.title}</h1>
    <div class="ch-by">${story.title} \u00b7 Chapter ${ch.n} \u00b7 preview \u00b7 ${ch.tier||"Aether Member"} to unlock full chapter</div>
    <div class="prose" id="prose">${renderBlocks(ch.preview||[], ch.id)}</div>
    <div class="preview-wall" style="${storyAccentVars(story)}">
      <div class="top"></div>
      <div class="inner">
        <h3>You've reached the end of the preview</h3>
        <p>Unlock the full chapter \u2014 and ${countReadable()} others \u2014 to continue ${story.title}. The complete text loads only after access is verified; nothing is hidden behind a blur.</p>
        <div class="col-flex" style="gap:9px;max-width:340px;margin:0 auto">
          <button class="btn story block" data-lock="${ch.id}">${I.lockOpen}Unlock with ${ch.tier||"Aether Member"}</button>
          <button class="btn ghost block" data-sheet="redeem">${I.key}Redeem an access key</button>
          ${ch.publicDate?`<div class="faint" style="font-size:.76rem">Or wait for the public release on <b style="color:var(--text)">${fmtDate(ch.publicDate)}</b> (in ${daysUntil(ch.publicDate)} days).</div>`:""}
        </div>
      </div>
    </div>
  `);
}
function readerLocked(ch, story, index, r){
  return `<div class="locked-fallback" style="${storyAccentVars(story)}">
    <div class="emblem" style="width:84px;height:84px">${r.state==='expired'?I.lockOpen:r.state==='pending'?I.sync:r.state==='key'?I.key:I.lock}</div>
    <h1>${ch.title}</h1>
    <div class="sub">${story.title} \u00b7 Chapter ${ch.n}</div>
    <div class="card" style="max-width:420px;margin:0 auto 18px;text-align:left">
      <div class="ax ${accessTag(r)[0]}" style="font-size:1rem;margin-bottom:8px"><span class="ic" style="width:20px;height:20px">${accessTag(r)[2]}</span>${accessTag(r)[1]}</div>
      <p class="muted" style="font-size:.86rem;margin:0 0 4px">${reasonFor(ch,r)}</p>
      <p class="faint" style="font-size:.76rem;margin:0">The full text for this chapter is never sent to your browser until access is verified server-side.</p>
    </div>
    <div class="col-flex" style="gap:9px;max-width:340px;margin:0 auto">
      ${ch.state==='preview'?`<button class="btn story block" data-preview="${ch.id}">${I.eye}Read the preview</button>`:""}
      <button class="btn ${ch.state==='preview'?'ghost':'story'} block" data-lock="${ch.id}">${I.lockOpen}${r.state==='expired'?'Renew access':'Unlock options'}</button>
      <button class="btn ghost block" data-act="expected-access">${I.help}Expected this to be unlocked?</button>
      <button class="btn ghost" data-nav="/story/${story.slug}/chapters">${I.list}Back to shelf</button>
    </div>
  </div>`;
}
function endOfChapter(ch, story, next, nr){
  const st=store.settings;
  const reac = REACTIONS; const mine = store.reactions[ch.id]?.picked;
  return `<div class="eoc">
    <div class="done"><div class="orn">âœ¦</div><p>Chapter complete</p></div>
    ${st.showReactions?`<div class="faint center" style="font-size:.74rem;margin-bottom:10px">How did this chapter land?</div>
    <div class="reactions">${reac.map(rk=>{const n=(REACTION_SEED[ch.id]?.[rk.k]||0)+(mine===rk.k?1:0);return `<button class="react ${mine===rk.k?'picked':''}" data-react="${rk.k}"><span class="e">${rk.e}</span><span class="n">${n}</span></button>`;}).join("")}</div>`:""}
    <div class="between" style="max-width:420px;margin:0 auto 18px">
      <button class="btn sm ghost" data-act="reader-bookmark">${I.bookmark}Bookmark</button>
      <button class="btn sm ghost" data-act="reader-savequote">${I.quote}Save quote</button>
      <button class="btn sm ghost" data-act="reader-markread">${store.readMarked[ch.id]?I.check:'âœ“'}Mark read</button>
    </div>
    <div class="card tinted" style="max-width:440px;margin:0 auto">
      ${next?`<div class="between"><div style="min-width:0"><div class="faint" style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em">Next chapter</div><div style="font-family:var(--serif);font-weight:600;margin-top:2px">${next.title}</div><div class="faint" style="font-size:.74rem;margin-top:2px">${axInline(nr)} \u00b7 ${next.readTime} min</div></div>${isReadable(nr)?`<button class="btn sm story" data-read="${next.id}">${I.play}Read</button>`:`<button class="btn sm" data-lock="${next.id}">${accessTag(nr)[3]}</button>`}</div>`
      :`<div class="center"><div class="faint" style="font-size:.74rem">You've reached the latest chapter.</div><button class="btn sm" data-nav="/story/${story.slug}/chapters" style="margin-top:8px">${I.list}Back to shelf</button></div>`}
    </div>
  </div>`;
}
const REACTIONS=[{k:"heart",e:"â¤ï¸",l:"Love"},{k:"gasp",e:"\ud83d\ude2e",l:"Gasp"},{k:"theory",e:"\ud83d\udca1",l:"Theory"},{k:"tear",e:"\ud83d\ude22",l:"Tears"},{k:"next",e:"\ud83d\udd25",l:"Need next"}];
const REACTION_SEED={"go-1":{heart:42,gasp:18,theory:9,tear:6,next:23},"nc-1":{heart:31,gasp:7,theory:4,tear:12,next:5},"go-3":{heart:28,gasp:14,theory:11,tear:9,next:19},"as-1":{heart:19,gasp:6,theory:22,tear:3,next:8}};

function commentsBlock(chId){
  const list = (store.comments[chId]||[]).filter(c=>c.para===null||c.para===undefined);
  return `<div class="comments" id="cmtblock">
    <div class="section-head"><h2>Reader notes</h2><span class="faint" style="font-size:.74rem">${(store.comments[chId]||[]).length} total</span></div>
    <form class="cmt-form" data-cmt-form="${chId}"><input name="name" placeholder="Your name" style="max-width:130px"><input name="text" placeholder="Add a note about this chapter\u2026" required><button class="btn sm story" type="submit">${I.msg}Post</button></form>
    <div>${list.slice().reverse().map(c=>commentHTML(c)).join("")||`<p class="faint" style="font-size:.82rem">Be the first to leave a note.</p>`}</div>
  </div>`;
}
function commentHTML(c){ return `<div class="cmt"><div class="ava" style="background:${c.color||'var(--accent)'}">${esc((c.name||"R").slice(0,1).toUpperCase())}</div><div class="body"><div class="who">${esc(c.name||"Reader")} <time>${esc(c.time||"just now")}</time></div><p>${esc(c.text)}</p></div></div>`; }

/* ============ RECAP ============ */
VIEWS.recap = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Story Recap</h1>
  <p class="page-sub">Spoiler-controlled. Choose how much you want remembered.</p>
  <div class="card tinted" style="margin:14px 0"><div class="eyebrow">Spoiler-free premise</div><p class="muted" style="font-family:var(--serif);font-size:1rem;line-height:1.7;margin:8px 0 0">${s.recapSafe}</p></div>
  <div class="section"><div class="section-head"><h2>Up to your last read chapter</h2></div><div class="card"><p class="muted" style="font-family:var(--serif);line-height:1.7">So far: ${s.premise} You've reached the point where ${s.chapters[2].title.toLowerCase()} \u2014 and the next beat turns on what the orchard has been keeping. (This recap is generated up to your current progress and avoids anything you haven't read.)</p></div></div>
  <div class="section"><div class="section-head"><h2>Full season recap <span class="badge" style="margin-left:6px">Spoilers</span></h2></div><div class="card"><p class="muted" style="font-family:var(--serif);line-height:1.7">${s.premise} In the full arc, the protagonist learns that ${s.cast[0].n.toLowerCase()}'s inheritance was no accident \u2014 and that the orchard has been waiting, patiently, for exactly this reader to arrive.</p></div></div>
  <button class="btn story block" data-read="${s.chapters[0].id}">${I.play}Start / continue reading</button>`;
};

/* ============ EXTRAS ============ */
VIEWS.extras = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  const extras=[
    {t:"Author's Note",d:"Vesper Maren on writing the orchard's first arc.",icon:"msg",state:"unlocked"},
    {t:"Deleted Scene: The Lawyer's Walk Home",d:"What the lawyer did after handing over the key.",icon:"book",state:"unlocked"},
    {t:"Alternate POV: The Bell-Ringer",d:"Chapter 2 from inside the bell tower.",icon:"eye",state:"member"},
    {t:"Lore Appendix: The Geography of Lychford",d:"Maps-lite, readable in the reader.",icon:"map",state:"member"},
    {t:"Art Drop: Cover Concepts",d:"Early cover sketches and palette tests.",icon:"spark",state:"archivist"},
    {t:"Early Draft: Chapter 1 (Beta)",d:"The first draft, before edits.",icon:"layers",state:"key"}
  ];
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Bonus Materials</h1>
  <p class="page-sub">Author notes, deleted scenes, lore, and art \u2014 member &amp; key-holder extras.</p>
  <div class="col-flex stagger">${extras.map(e=>{
    const r = e.state==="unlocked"?{state:"unlocked"}:e.state==="member"?{state:persona().level>=1?"unlocked":"locked"}:e.state==="archivist"?{state:persona().level>=2?"unlocked":"locked"}:{state:"key"};
    const readable = isReadable(r);
    return `<div class="card" style="display:flex;gap:13px;align-items:center"><span class="ax ${r.state}" style="font-size:1.3rem"><span class="ic" style="width:26px;height:26px">${I[e.icon]}</span></span><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-weight:600">${e.t}</div><div class="faint" style="font-size:.78rem">${e.d}</div></div>${readable?`<button class="btn sm story" data-act="extra-open">${I.play}Open</button>`:`<button class="btn sm" data-lock="${s.chapters.find(c=>c.state==='key')?.id||s.chapters[0].id}">${accessTag(r)[3]}</button>`}</div>`;
  }).join("")}</div>`;
};

/* ============ STORY UPDATES ============ */
VIEWS.storyUpdates = function(){
  const s=bySlug(route.params.slug); if(!s) return notFound("Story"); setStoryAccent(s);
  const items=D.UPDATES.filter(u=>u.story===s.id);
  return `<a class="section-link" data-nav="/story/${s.slug}" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}${s.title}</a>
  <h1 class="page-title">Story Updates</h1>
  <p class="page-sub">Releases, notes &amp; schedule for this story.</p>
  <div class="timeline">${(items.length?items:D.UPDATES.slice(0,3)).map(u=>`<div class="tl-item"><div class="when">${u.when}</div><div class="what">${u.title}</div><div class="faint" style="font-size:.78rem">${u.note}</div></div>`).join("")}</div>`;
};

/* ============ UPDATES FEED ============ */
VIEWS.updates = function(){
  const groups={};
  D.UPDATES.forEach(u=>{ (groups[u.when]=groups[u.when]||[]).push(u); });
  return `<h1 class="page-title">Updates</h1><p class="page-sub">Everything new across the archive, access-aware.</p>
  <div class="chips scroll" style="margin:8px 0 18px"><a class="chip active">${I.feed}<span>All</span></a><a class="chip" data-nav="/calendar">${I.calendar}<span>Calendar</span></a></div>
  ${Object.entries(groups).map(([g,items])=>`<div class="section"><div class="section-head"><h2>${g}</h2></div><div class="col-flex">${items.map(updateRow).join("")}</div></div>`).join("")}`;
};

/* ============ CALENDAR ============ */
VIEWS.calendar = function(){
  return `<h1 class="page-title">Release Calendar</h1><p class="page-sub">This week in the archive \u2014 member drops &amp; public unlocks.</p>
  <div class="card tinted" style="margin-bottom:18px"><div class="between"><div><div class="eyebrow">Following</div><div style="font-family:var(--serif);margin-top:2px">${store.followed.length} stories</div></div><button class="btn sm" data-nav="/library">Manage</button></div></div>
  ${D.CALENDAR.map(day=>`<div class="section"><div class="section-head"><div><h2>${day.day}</h2><div class="faint" style="font-size:.74rem">${day.dow}</div></div></div><div class="col-flex">${day.items.map(it=>{const s=bySlug(it.s);const kColor={early:"early",public:"free",drop:"key",key:"key"}[it.k]||"";return `<div class="row" data-read="${s.chapters[0].id}"><span class="ic-col" style="color:var(--${kColor||'text-dim'})">${I[it.k==='early'?'hourglass':it.k==='public'?'sun':it.k==='drop'?'gift':'key']}</span><span class="body"><span class="t"><span class="tt">${it.c}</span>${badge(kColor,{early:"Early",public:"Public",drop:"Drop",key:"Key"}[it.k])}</span><span class="sub">${meta([`<i>${I.clock}</i>${it.t}`,s.title])}</span></span><span class="cta"><span class="faint">${I.chevR}</span></span></div>`;}).join("")}</div></div>`).join("")}`;
};

/* ============ COLLECTIONS ============ */
VIEWS.collections = function(){ return `<h1 class="page-title">Collections</h1><p class="page-sub">Editor-curated shelves to find your next read.</p><div class="grid-stories stagger" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${D.COLLECTIONS.map(c=>`<a class="card" data-nav="/collections/${c.slug}" style="text-align:left;display:flex;flex-direction:column;gap:9px;min-height:120px;justify-content:center"><span class="ax preview" style="font-size:1.5rem"><span class="ic" style="width:28px;height:28px">${I[c.icon]||I.book}</span></span><div><div style="font-family:var(--serif);font-weight:600">${c.name}</div><div class="faint" style="font-size:.76rem;margin-top:2px">${c.desc}</div></div></a>`).join("")}</div>`; };
VIEWS.collection = function(){
  const c=D.COLLECTIONS.find(x=>x.slug===route.params.slug); if(!c) return notFound("Collection");
  const q=c.query;
  const list=D.STORIES.filter(s=>{
    if(q.free) return s.chapters.some(ch=>ch.state==="free");
    if(q.state==="early") return s.chapters.some(ch=>ch.state==="early");
    if(q.state==="preview") return s.chapters.some(ch=>ch.state==="preview");
    if(q.status) return s.status===q.status;
    if(q.genre) return s.genre===q.genre;
    if(q.member) return s.chapters.some(ch=>ch.tier);
    return true;
  });
  return `<a class="section-link" data-nav="/collections" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Collections</a>
  <h1 class="page-title">${c.name}</h1><p class="page-sub">${c.desc}</p>
  <div class="grid-stories stagger" style="margin-top:14px">${list.map(storyCard).join("")}</div>`;
};

/* ============ VAULT ============ */
VIEWS.vault = function(){
  const P=persona();
  const readable=countReadable();
  const early=D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>c.state==="early").length,0);
  const locked=D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>!isReadable(chapterResolved(c))&&c.state!=="unavailable").length,0);
  const state = P.expired?"expired":P.pending?"pending":P.noTier?"none":P.level>0?"active":"none";
  const stateLabel={active:"Active",expired:"Expired",pending:"Syncing",none:"No access"}[state];
  const providerConnected = P.provider && !P.expired && !P.pending && !P.noTier;
  return `
  <h1 class="page-title">The Vault</h1>
  <p class="page-sub">One place for every kind of access. Patreon, keys, grants \u2014 all just \u201caccess.\u201d</p>
  <div class="card tinted" style="margin:14px 0;display:flex;gap:14px;align-items:center">
    <span class="ax ${state==='active'?'unlocked':state==='expired'?'expired':state==='pending'?'pending':'locked'}" style="font-size:1.6rem"><span class="ic" style="width:30px;height:30px">${state==='active'?I.checkCirc:state==='expired'?I.lock:state==='pending'?I.sync:I.lock}</span></span>
    <div style="flex:1"><div class="eyebrow">Current access</div><div style="font-family:var(--serif);font-size:1.3rem;font-weight:700">${stateLabel}</div><div class="faint" style="font-size:.8rem">${P.tier?("via "+P.provider+" \u00b7 "+P.tier):P.signedIn?"Signed in, no active access":"Browsing as guest"}</div></div>
  </div>

  <div class="section"><div class="section-head"><h2>What your access unlocks</h2></div>
    <div class="stat-grid"><div class="stat"><div class="n">${readable}</div><div class="l">Readable chapters</div></div><div class="stat"><div class="n">${early}</div><div class="l">Early access</div></div><div class="stat"><div class="n">${D.STORIES.reduce((n,s)=>n+s.chapters.filter(c=>hasImages(c)).length,0)}</div><div class="l">Illustrated</div></div><div class="stat"><div class="n">${locked}</div><div class="l">Still locked</div></div></div>
  </div>

  <div class="section"><div class="section-head"><h2>Providers</h2></div>
    <div class="col-flex">
      ${providerCard("Patreon","patreon",providerConnected,P.tier||null,P.since)}
      ${providerCard("Ko-fi","kofi",false,null,null,"Coming soon")}
      ${providerCard("Discord","discord",false,null,null,"Coming soon")}
      ${providerCard("PayPal","paypal",false,null,null,"Coming soon")}
    </div>
  </div>

  <div class="section"><div class="section-head"><h2>Redeem an access key</h2></div>
    <div class="card">
      <p class="muted" style="font-size:.84rem;margin:0 0 12px">Beta readers, reviewers, gifts &amp; campaigns use keys. Enter one to attach access to your account.</p>
      <div style="display:flex;gap:9px"><input id="key-input" class="pill-input" style="text-align:left;flex:1" placeholder="XXXX-XXXX-XXXX-XXXX"><button class="btn story" data-sheet="redeem">${I.key}Redeem</button></div>
      <p class="faint" style="font-size:.72rem;margin-top:8px">Try the demo key <span class="kbd">AETHER-ARC2-2026</span></p>
    </div>
    ${store.redeemedKeys.length?`<div class="card" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:8px">Redeemed keys</div>${store.redeemedKeys.map(k=>`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.86rem;font-weight:600">${k.label}</div><div class="faint" style="font-size:.72rem;font-family:var(--ui);letter-spacing:.08em">${maskKey(k.code)}</div></div><span class="badge key">${I.key}Active</span></div>`).join("")}</div>`:""}
  </div>

  <div class="section"><div class="section-head"><h2>Access timeline</h2></div>
    <div class="card"><div class="timeline">
      <div class="tl-item"><div class="when">Just now</div><div class="what">3 chapters unlocked after Patreon sync</div></div>
      <div class="tl-item"><div class="when">2 days ago</div><div class="what">Patreon connection verified</div></div>
      <div class="tl-item warn"><div class="when">3 days ago</div><div class="what">Access renewed for the month</div></div>
      ${store.redeemedKeys.length?`<div class="tl-item"><div class="when">Last week</div><div class="what">Access key redeemed</div></div>`:""}
      <div class="tl-item"><div class="when">2025-03-12</div><div class="what">Patreon first connected</div></div>
    </div></div>
  </div>

  <div class="section"><div class="section-head"><h2>Troubleshoot &amp; verify</h2></div>
    <div class="quicklinks">
      <a data-nav="/support/check-access">${I.shield}<span>Health Check</span><small>Verify your access</small></a>
      <a data-nav="/support/wrong-account">${I.user}<span>Wrong account?</span><small>Recovery assistant</small></a>
      <a data-nav="/benefits">${I.spark}<span>Benefits</span><small>What's included</small></a>
      <a data-nav="/help">${I.info}<span>Help Center</span><small>Access glossary</small></a>
    </div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center;margin-top:8px"><span class="faint">${I.cog}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Account access</div><div class="faint" style="font-size:.74rem">Supabase auth and Patreon sync will replace the temporary local access model in the backend integration phase.</div></div><button class="btn sm" data-nav="/vault">Access hub</button></div>
  `;
};
function providerCard(name, key, connected, tier, since, note){
  return `<div class="card" style="display:flex;gap:13px;align-items:center">
    <span style="width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:var(--surface-2);font-weight:700;font-size:.7rem;letter-spacing:.04em">${name.slice(0,2)}</span>
    <div style="flex:1;min-width:0"><div style="font-weight:600">${name}</div><div class="faint" style="font-size:.76rem">${connected?(tier||"Connected")+(since?" \u00b7 since "+fmtDate(since):""):(note||"Not connected")}</div></div>
    ${connected?`<span class="badge free">${I.check}Connected</span>`:`<button class="btn sm ${key==='patreon'?'story':''}" ${key==='patreon'?'data-sheet="connect-patreon"':'disabled'}>${note?'Soon':'Connect'}</button>`}
  </div>`;
}
function maskKey(c){ if(c.length<=4) return c; return "\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-\u2022\u2022\u2022\u2022-"+c.slice(-4); }

/* ============ MY SHELF ============ */
VIEWS.shelf = function(){
  const reads=activeReads();
  return `<h1 class="page-title">My Shelf</h1><p class="page-sub">Your threads, saved things, and reader preferences.</p>
  <div class="section"><div class="section-head"><h2>Continue your threads</h2></div><div class="lane">${reads.map(({ch,story,prog})=>`<button class="card" style="width:210px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}"><div class="faint" style="font-size:.68rem;text-transform:uppercase">${story.title}</div><div style="font-family:var(--serif);font-weight:600;margin:2px 0 8px">${ch.title}</div>${progressBar(prog.pct)}<div class="faint" style="font-size:.7rem;margin-top:6px">Resume at: ${prog.scene}</div></button>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Followed</h2></div><div class="lane">${store.followed.map(id=>{const s=bySlug(id);return s?storyCard(s):"";}).join("")}</div></div>
  <div class="quicklinks" style="margin:14px 0">
    <a data-nav="/bookmarks">${I.bookmark}<span>Bookmarks</span><small>${store.bookmarks.length} saved</small></a>
    <a data-nav="/quotes">${I.quote}<span>Saved quotes</span><small>${store.quotes.length} lines</small></a>
    <a data-nav="/history">${I.clock}<span>History</span><small>Recently read</small></a>
    <a data-sheet="settings">${I.aa}<span>Preferences</span><small>Reader settings</small></a>
  </div>
  <div class="section"><div class="section-head"><h2>Preview trail</h2></div>
    <div class="card"><p class="muted" style="font-size:.84rem;margin:0 0 10px">Chapters you've previewed but not yet unlocked.</p>${store.history.filter(h=>h.kind==="preview").map(h=>{const f=byId(h.chapterId);return f?`<div class="between" style="padding:6px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.86rem;font-weight:600">${h.title}</div><div class="faint" style="font-size:.72rem">${f.story.title}</div></div><button class="btn sm" data-lock="${h.chapterId}">${I.lockOpen}Unlock</button></div>`:"";}).join("")||`<p class="faint" style="font-size:.8rem">No active previews.</p>`}</div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center"><span class="faint">${I.download}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Offline queue</div><div class="faint" style="font-size:.74rem">Save chapters for transit reading while your access is active. Expires with access.</div></div><button class="btn sm ghost" data-act="offline-queue">Manage</button></div>
  `;
};
VIEWS.bookmarks = function(){ return `<h1 class="page-title">Bookmarks</h1><p class="page-sub">${store.bookmarks.length} saved places across your reading.</p><div class="col-flex stagger">${store.bookmarks.map(b=>{const f=byId(b.chapterId);return `<div class="card" style="display:flex;gap:13px;align-items:center;${f?storyAccentVars(f.story):''}"><span class="ax unlocked" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${I.bookmarkFill}</span></span><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-style:italic">"${b.label}"</div><div class="faint" style="font-size:.74rem">${f?f.story.title+" \u00b7 "+f.ch.title:""} \u00b7 ${b.when}</div></div>${f?`<button class="btn sm story" data-read="${b.chapterId}">${I.play}Open</button>`:""}</div>`;}).join("")||emptyState("bookmark","No bookmarks yet","Save a place while reading with the bookmark button.")}</div>`; };
VIEWS.quotes = function(){ return `<h1 class="page-title">Saved Quotes</h1><p class="page-sub">${store.quotes.length} lines worth keeping.</p><div class="col-flex stagger">${store.quotes.map(q=>{const f=byId(q.chapterId);return `<div class="card tinted" style="${f?storyAccentVars(f.story):''}"><div style="display:flex;gap:10px"><span style="font-size:1.6rem;color:var(--s);line-height:.8">${I.quote}</span><div><p style="font-family:var(--serif);font-size:1rem;line-height:1.6;margin:0">${q.text}</p><div class="faint" style="font-size:.74rem;margin-top:8px">${f?f.story.title:""} \u00b7 saved ${q.when}</div></div></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn sm ghost" data-copy="${esc(q.text)}">${I.copy}Copy</button><button class="btn sm ghost" data-quote-card="${q.id}">${I.spark}Share card</button></div></div>`;}).join("")||emptyState("quote","No quotes saved","Highlight text while reading to save a line.")}</div>`; };
VIEWS.history = function(){ return `<h1 class="page-title">Reading History</h1><p class="page-sub">Your private chronicle.</p><div class="timeline">${[...store.history].map(h=>{const f=byId(h.chapterId);return `<div class="tl-item"><div class="when">${h.when}</div><div class="what">${h.kind==='preview'?'Previewed':h.kind==='completed'?'Completed':'Read'}: ${h.title}</div><div class="faint" style="font-size:.78rem">${f?f.story.title:""}</div></div>`;}).join("")}</div>`; };

/* ============ NOTIFICATIONS ============ */
VIEWS.notifications = function(){
  const items=store.notifs;
  const kIcon={access:I.vault,chapter:I.bell};
  return `<div class="between"><div><h1 class="page-title">Notifications</h1><p class="page-sub">${items.filter(n=>!n.read).length} unread</p></div><button class="btn sm ghost" data-act="notif-prefs">${I.cog}Preferences</button></div>
  <div class="chips scroll" style="margin:8px 0 16px">
    <button class="chip active" data-act="simulate-notif">${I.plus}<span>Simulate notice</span></button>
    <button class="btn sm ghost" data-act="mark-all-read">Mark all read</button>
    ${items.length?`<button class="btn sm ghost" data-act="clear-all-notifs">${I.x}Clear all</button>`:""}
  </div>
  <div class="col-flex stagger">
    ${items.map(n=>{
      const f = n.chapter ? byId(n.chapter) : (n.story ? { story: bySlug(n.story) } : null);
      const s = f?.story;
      const accentStyle = s ? storyAccentVars(s) : "";
      return `
      <div class="card" style="position:relative; display:flex; gap:12px; align-items:flex-start; ${n.read?'opacity:.65':''}; ${accentStyle}">
        <span style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--surface-2);color:var(--accent);flex:0 0 auto">${kIcon[n.k]||I.bell}</span>
        <div style="flex:1;min-width:0;padding-right:24px">
          <div style="font-weight:600;font-size:.9rem">${esc(n.t)}</div>
          <div class="faint" style="font-size:.8rem;margin-top:1px">${esc(n.d)}</div>
          <div class="faint" style="font-size:.7rem;margin-top:4px">${esc(n.time)}</div>
          ${n.chapter?`<span class="btn sm story" style="margin-top:10px" data-read="${n.chapter}">Open chapter</span>`:""}
        </div>
        <button class="tb-btn" style="position:absolute; top:10px; right:10px; width:28px; height:28px; display:grid; place-items:center" data-dismiss="${n.id}" aria-label="Dismiss">${I.x}</button>
      </div>
      `;
    }).join("") || emptyState("bell","No notifications","All caught up!")}
  </div>`;
};

/* ============ BENEFITS ============ */
VIEWS.benefits = function(){
  const b=[{i:"hourglass",t:"Early access",d:"Read new chapters before public release."},{i:"book",t:"Member chapters",d:"Exclusive chapters not available on the public archive."},{i:"spark",t:"Bonus materials",d:"Author notes, deleted scenes, lore & art drops."},{i:"layers",t:"Complete seasons",d:"Binge finished stories start to end."},{i:"eye",t:"Previews",d:"Sample locked chapters before deciding."},{i:"msg",t:"Supporter notes",d:"Author notes attached to releases."}];
  return `<h1 class="page-title">Membership Benefits</h1><p class="page-sub">What Aether Member access unlocks \u2014 clearly.</p>
  <div class="grid-stories" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:14px">${b.map(x=>`<div class="benefit-card"><span class="ic">${I[x.i]}</span><div><h4>${x.t}</h4><p>${x.d}</p></div></div>`).join("")}</div>
  <div class="section"><div class="section-head"><h2>Your milestones</h2></div><div class="col-flex">${D.MILESTONES.map(m=>`<div class="card" style="display:flex;gap:12px;align-items:center;${m.held?'':'opacity:.5'}"><span class="ax ${m.held?'unlocked':'locked'}" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${m.held?I.checkCirc:I.lock}</span></span><div style="flex:1"><div style="font-family:var(--serif);font-weight:600">${m.t}</div><div class="faint" style="font-size:.76rem">${m.d}</div></div>${m.held?badge("gold","Earned"):badge("","Locked")}</div>`).join("")}</div></div>
  <div class="card tinted" style="text-align:center"><div style="font-family:var(--serif);font-size:1.05rem;margin-bottom:8px">Want to unlock the archive?</div><button class="btn primary" data-sheet="connect-patreon">${I.vault}Connect Patreon</button></div>`;
};

/* ============ ONBOARDING ============ */
VIEWS.onboarding = function(){
  return `<h1 class="page-title">Welcome to Aether Pages</h1><p class="page-sub">A quiet reading lounge for members of the archive.</p>
  <div class="section"><div class="section-head"><h2>Choose your first door</h2></div>
    <div class="quicklinks">
      <a data-nav="/collections/dark-fantasy">${I.moon}<span>Gothic fantasy</span><small>Atmospheric &amp; slow-burn</small></a>
      <a data-nav="/collections/scifi">${I.orbit}<span>Sci-fi mystery</span><small>Colonies &amp; orbitals</small></a>
      <a data-nav="/collections/complete-seasons">${I.check}<span>A complete story</span><small>Finish in one sitting</small></a>
      <a data-nav="/collections/short-reads">${I.clock}<span>Only 10 minutes</span><small>Quick reads</small></a>
    </div>
  </div>
  <div class="section"><div class="section-head"><h2>How it works</h2></div>
    <div class="col-flex">
      ${[[I.library,"Browse the Library","Free chapters and previews, no account needed."],[I.book,"Read comfortably","Adjust type, theme & layout to your taste."],[I.vault,"Activate access","Connect Patreon or redeem a key to unlock more."],[I.shelf,"Continue anywhere","Your place, bookmarks & quotes follow you."]].map(([ic,t,d])=>`<div class="card" style="display:flex;gap:13px;align-items:center"><span class="ax unlocked" style="font-size:1.3rem"><span class="ic" style="width:24px;height:24px">${ic}</span></span><div><div style="font-weight:600">${t}</div><div class="faint" style="font-size:.78rem">${d}</div></div></div>`).join("")}
    </div>
  </div>
  <button class="btn primary block" data-nav="/">Enter the archive</button>`;
};

/* ============ HELP ============ */
VIEWS.help = function(){
  const q=[["Why are chapters locked?","Some chapters are member-only, early-access, or key-locked. Free chapters are always open."],["How does Patreon sync work?","When you connect Patreon, we verify your membership. This usually takes a moment; the app checks automatically."],["Why might a key fail?","Keys can be expired, already redeemed, at max use, or mistyped. Each has a clear message."],["What does expired access mean?","Your membership or key is no longer active. Renew to restore the chapters it unlocked."],["Wrong account?","If you signed in differently before, access may be on another account. Use the Wrong Account assistant."]];
  return `<h1 class="page-title">Help Center</h1><p class="page-sub">Self-service recovery & explanations.</p>
  <div class="quicklinks" style="margin:14px 0">
    <a data-nav="/support/check-access">${I.shield}<span>Access Check</span><small>Diagnose now</small></a>
    <a data-nav="/support/wrong-account">${I.user}<span>Wrong account?</span><small>Recovery flow</small></a>
    <a data-nav="/support/contact">${I.mail}<span>Contact support</span><small>With context packet</small></a>
  </div>
  <div class="section"><div class="section-head"><h2>Access-state glossary</h2></div><div class="col-flex">${D.GLOSSARY_STATES.map(g=>`<div class="card" style="display:flex;gap:12px;align-items:center"><span class="ax ${g.color==='good'?'free':g.color}" style="font-size:1.2rem"><span class="ic" style="width:22px;height:22px">${I[g.icon]}</span></span><div style="flex:1"><div style="font-weight:600;font-size:.9rem">${g.label}</div><div class="faint" style="font-size:.78rem">${g.d}</div></div></div>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Common questions</h2></div><div class="col-flex">${q.map(([t,a])=>`<details class="card" style="padding:0"><summary style="padding:14px 16px;cursor:pointer;font-weight:600;font-size:.9rem;list-style:none;display:flex;justify-content:space-between;align-items:center">${t}${I.chevR}</summary><div style="padding:0 16px 14px" class="muted" >${a}</div></details>`).join("")}</div></div>
  <div class="section"><div class="section-head"><h2>Features explained</h2></div><div class="col-flex">
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.eye} Previews</div><p class="muted" style="font-size:.82rem;margin:0">Previews show real opening text. The rest of the chapter is never sent to your browser until access is verified \u2014 no fake blur.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.msg} Paragraph &amp; chapter comments</div><p class="muted" style="font-size:.82rem;margin:0">Tap a paragraph chip to note a specific line, or leave a chapter note at the end. Toggle chips in reader settings.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.spark} Illustrated chapters</div><p class="muted" style="font-size:.82rem;margin:0">Some chapters include inline figures. Hide them in reader settings if you prefer pure text.</p></div>
    <div class="card"><div style="font-weight:600;margin-bottom:4px">${I.alert} Unavailable chapters</div><p class="muted" style="font-size:.82rem;margin:0">Occasionally a chapter is being revised. It returns \u2014 try again later, or contact support.</p></div>
  </div></div>`;
};

/* ============ SUPPORT ============ */
VIEWS.checkAccess = function(){
  const P=persona();
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Access Health Check</h1><p class="page-sub">A guided check of your access \u2014 no jargon.</p>
  <div class="card tinted" style="margin:14px 0"><div class="between"><div><div class="eyebrow">Signed-in account</div><div style="font-family:var(--serif);font-weight:600">${P.signedIn?store.email:"Not signed in"}</div></div>${P.signedIn?badge("free",I.check+"Verified"):badge("","Guest")}</div></div>
  <div class="timeline">
    <div class="tl-item"><div class="when">Step 1</div><div class="what">Account verified</div><div class="faint" style="font-size:.78rem">${P.signedIn?"You're signed in.":"Sign in to continue."}</div></div>
    <div class="tl-item ${P.provider?'':'warn'}"><div class="when">Step 2</div><div class="what">Provider: ${P.provider||"none connected"}</div><div class="faint" style="font-size:.78rem">${P.provider?"Connected.":"Connect Patreon or redeem a key."}</div></div>
    <div class="tl-item ${P.pending?'warn':''}"><div class="when">Step 3</div><div class="what">${P.pending?"Sync in progress":"Last sync: just now"}</div><div class="faint" style="font-size:.78rem">${P.pending?"Verifying your tier \u2014 automatic.":"Access is up to date."}</div></div>
    <div class="tl-item ${P.level>0||store.grantedKey?'':'bad'}"><div class="when">Step 4</div><div class="what">${P.tier||"Tier"} ${P.noTier?"(not qualifying)":""}</div><div class="faint" style="font-size:.78rem">${P.level>0?"Qualifies for Aether Pages.":P.noTier?"This tier doesn't include access.":"No active tier."}</div></div>
  </div>
  <div class="col-flex" style="margin-top:14px">
    ${P.provider?`<button class="btn ghost" data-act="resync">${I.sync}Re-run sync</button>`:`<button class="btn story" data-sheet="connect-patreon">${I.vault}Connect Patreon</button>`}
    <button class="btn ghost" data-sheet="redeem">${I.key}Try a key instead</button>
    <button class="btn ghost" data-nav="/support/wrong-account">${I.user}Not seeing your access?</button>
  </div>`;
};
VIEWS.wrongAccount = function(){
  const steps=["Are you signed into the same Aether Pages account you used before? Check your email in the Vault.","Is your connected Patreon the right one? Patreon links via the Patreon API, not by matching emails.","Try reconnecting Patreon from the Vault.","Or redeem your access key again \u2014 it binds to this account.","Still stuck? Send a support packet with one tap."];
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Wrong Account Assistant</h1><p class="page-sub">Access on a different account? Let's recover it.</p>
  <div class="timeline">${steps.map((s,i)=>`<div class="tl-item"><div class="when">Step ${i+1}</div><div class="what">${s}</div></div>`).join("")}</div>
  <div class="col-flex" style="margin-top:14px"><button class="btn story" data-sheet="connect-patreon">${I.vault}Reconnect Patreon</button><button class="btn ghost" data-sheet="redeem">${I.key}Redeem key</button><button class="btn ghost" data-nav="/support/contact">${I.mail}Send support packet</button></div>`;
};
VIEWS.contact = function(){
  const P=persona();
  const pkt=["Account: "+(P.signedIn?store.email:"(not signed in)"),"Access: "+(P.tier||P.expired?"expired":P.pending?"sync pending":P.noTier?"no qualifying tier":"none"),"Provider: "+(P.provider||"none"),"Last sync: just now","Masked key suffix: "+(store.redeemedKeys[0]?"\u2026"+store.redeemedKeys[0].code.slice(-4):"none")];
  return `<a class="section-link" data-nav="/help" style="color:var(--text-dim);display:inline-flex;gap:4px;align-items:center">${I.chevL}Help</a>
  <h1 class="page-title">Contact Support</h1><p class="page-sub">We'll attach a context packet so you don't have to explain everything.</p>
  <div class="card" style="margin:14px 0"><div class="eyebrow" style="margin-bottom:8px">Auto-attached packet (no secrets)</div><div style="font-family:var(--ui);font-size:.78rem;line-height:1.8">${pkt.map(p=>`<div>${esc(p)}</div>`).join("")}</div></div>
  <form data-contact-form><div class="col-flex"><input class="pill-input" style="text-align:left" name="subject" placeholder="Subject"><textarea name="msg" rows="4" style="background:var(--surface);border:1px solid var(--border-2);border-radius:var(--radius-sm);padding:13px;font-size:.9rem" placeholder="What's going on?"></textarea><button class="btn story" type="submit">${I.mail}Send to support</button></div></form>
  <div class="card" style="margin-top:14px;display:flex;gap:11px;align-items:center"><span class="faint">${I.msg}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Prefer real-time?</div><div class="faint" style="font-size:.74rem">The archive Discord has a #aether-pages-help channel.</div></div><button class="btn sm ghost" data-act="external-discord">${I.external}</button></div>`;
};

function notFound(what){ return `<div class="empty" style="padding-top:80px"><div class="em">ðŸ•Šï¸</div><h3>${what} not found</h3><p>This may have moved or been archived.</p><button class="btn" data-nav="/">Back home</button></div>`; }
function emptyState(ic,title,sub){ return `<div class="empty"><div class="em">${ {bookmark:"ðŸ”–",quote:"â"}[ic]||"ðŸ“­" }</div><h3>${title}</h3><p>${sub}</p></div>`; }

/* ============ SHEETS (builders) ============ */
function sheetSettings(){
  const st=store.settings;
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Settings</h2><p class="sheet-sub">Theme &amp; reading comfort. Saved to this device.</p>
  <div class="set-group"><label>Site theme</label>${themeSwatches()}</div>
  <div class="set-group"><label>Reader lighting</label><div class="seg">${["aether","twilight","parchment"].map(t=>`<button class="${st.readerTheme===t?'active':''}" data-set-theme="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}</div></div>
  <div class="set-group"><label>Reading preset</label><div class="seg">${[["none","Default"],["focus","Focus"],["bedtime","Bedtime"],["dyslexia","Dyslexia"],["compact","Compact"]].map(([k,l])=>`<button class="${st.preset===k?'active':''}" data-set-preset="${k}">${l}</button>`).join("")}</div></div>
  <div class="set-group"><label>Background mode</label><div class="seg">${[["story","Artwork"],["gradient","Ambient"],["solid","Solid"]].map(([k,l])=>`<button class="${st.bgMode===k?'active':''}" data-set-bg-mode="${k}">${l}</button>`).join("")}</div></div>
  ${st.bgMode==='story'?`
  <div class="set-group">
    ${toggleRow("bgBlur","Blur background","Blurs and dims the cover background",st.bgBlur)}
  </div>
  <div class="set-group">
    <label>Background artwork</label>
    ${wallpaperSwatches(getActiveStory())}
  </div>
  `:""}
  <div class="set-group"><label>Font size <span class="faint" style="float:right">${Math.round(st.fontScale*100)}%</span></label><input type="range" class="range" min="0.8" max="1.4" step="0.05" value="${st.fontScale}" data-set-range="fontScale"></div>
  <div class="set-group"><label>Line height <span class="faint" style="float:right">${st.lineHeight.toFixed(2)}</span></label><input type="range" class="range" min="1.5" max="2.1" step="0.02" value="${st.lineHeight}" data-set-range="lineHeight"></div>
  <div class="set-group"><label>Comfort</label>
    ${toggleRow("showImages","Reader images","Inline figures in chapters",st.showImages)}
    ${toggleRow("showParaComments","Paragraph comments","Show comment chips on paragraphs",st.showParaComments)}
    ${toggleRow("showProgress","Progress bar","Show reading progress",st.showProgress)}
    ${toggleRow("showReactions","Chapter reactions","Show reaction buttons at chapter end",st.showReactions)}
    ${toggleRow("spoilerSafe","Spoiler safety","Hide titles/descriptions of unread chapters",st.spoilerSafe)}
    ${toggleRow("focusMode","Focus mode","Hide UI until you tap the page",st.focusMode)}
  </div>`;
}
function toggleRow(key,title,sub,on){ return `<div class="toggle-row"><div class="lbl">${title}<small>${sub}</small></div><button class="switch ${on?'on':''}" data-toggle="${key}" aria-label="${title}"></button></div>`; }

function sheetPersona(){
  const P=persona();
  const active = activeEntitlements();
  const signedIn = !!authState.user;
  const status = signedIn ? (active.length ? `${active.length} active entitlement${active.length===1?"":"s"}` : "Signed in, no active member entitlement") : "Guest reader";
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Account</h2>
  <div class="card tinted" style="margin-bottom:14px;display:flex;gap:12px;align-items:center"><span style="width:42px;height:42px;border-radius:50%;background:var(--accent-soft);display:grid;place-items:center;color:var(--accent)">${I.user}</span><div style="flex:1;min-width:0"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis">${esc(accountLabel())}</div><div class="faint" style="font-size:.76rem">${esc(P.tier || status)}</div></div>${signedIn?`<button class="btn sm ghost" data-act="reader-signout">Sign out</button>`:""}</div>
  <div class="quicklinks" style="margin-bottom:16px"><a data-nav="/vault">${I.vault}<span>Vault</span><small>Manage access</small></a><a data-nav="/my-shelf">${I.shelf}<span>My Shelf</span><small>Your library</small></a><a data-sheet="settings">${I.aa}<span>Preferences</span><small>Reader</small></a>${isAdmin()?`<a href="admin.html"><span>${I.shield}</span><span>Admin CMS</span><small>Production controls</small></a><a data-nav="/studio/access">${I.overview}<span>Studio Access</span><small>Preview console</small></a>`:""}</div>
  ${signedIn?`<div class="card" style="margin-bottom:14px"><div class="eyebrow" style="margin-bottom:7px">Entitlements</div>${active.length?active.map(e=>`<div class="between" style="gap:10px;padding:6px 0"><span style="font-weight:600;font-size:.86rem">${esc(e.tier_name || e.name || e.tier || "Reader access")}</span><span class="badge free">active</span></div>`).join(""):`<p class="faint" style="font-size:.8rem;margin:0">No active entitlement returned yet. Connect Patreon or redeem an access key.</p>`}</div>`:`<div class="card" style="margin-bottom:14px"><div class="eyebrow" style="margin-bottom:8px">Continue</div><div class="col-flex"><button class="btn story block" type="button" data-act="google-signin">${I.external}Continue with Google</button><div class="faint" style="font-size:.74rem;text-align:center">or use email</div><form data-auth-form="signin"><div class="col-flex"><input class="pill-input" name="email" type="email" autocomplete="email" placeholder="reader@example.com" style="text-align:left"><input class="pill-input" name="password" type="password" autocomplete="current-password" placeholder="Password" style="text-align:left"><div class="faint" data-auth-status style="font-size:.76rem;min-height:1em"></div><button class="btn ghost block" type="submit">${I.user}Sign in with email</button><button class="btn ghost block" type="button" data-act="show-signup">Create email account</button></div></form></div></div>`}
  <div class="card" style="margin-top:8px"><div style="font-weight:600;font-size:.86rem">Backend bridge status</div><div class="faint" style="font-size:.74rem;margin-top:4px">Supabase auth, catalog RPCs, chapter RPCs, and entitlement checks are active. Use admin.html for real tier/key/grant management.</div></div>`;
}
function sheetSignup(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Save your library</h2><p class="sheet-sub">Use Google for the fastest setup, or create an email login for key redemption, Patreon linking, and future cross-device shelf sync.</p>
  <div class="card" style="margin-bottom:12px"><button class="btn story block" type="button" data-act="google-signin">${I.external}Continue with Google</button></div>
  <form data-auth-form="signup" class="card"><div class="col-flex"><input class="pill-input" name="email" type="email" autocomplete="email" placeholder="reader@example.com" style="text-align:left"><input class="pill-input" name="password" type="password" autocomplete="new-password" placeholder="Password" style="text-align:left"><div class="faint" data-auth-status style="font-size:.76rem;min-height:1em"></div><button class="btn ghost block" type="submit">${I.user}Create email login</button><button class="btn ghost block" type="button" data-sheet="persona">Back to sign in</button></div></form>`;
}
function sheetLock(chId){
  const f=byId(chId); if(!f) return "<p>Not found.</p>"; const {ch,story}=f; const r=chapterResolved(ch);
  return `<span class="close-x" data-act="close-sheet">${I.x}</span>
  <div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><span class="ax ${accessTag(r)[0]}" style="font-size:1.5rem"><span class="ic" style="width:28px;height:28px">${accessTag(r)[2]}</span></span><div><h2>${ch.title}</h2><div class="sheet-sub" style="margin:0">${story.title} \u00b7 Chapter ${ch.n}</div></div></div>
  <div class="card" style="margin-bottom:14px"><p class="muted" style="font-size:.86rem;margin:0">${reasonFor(ch,r)}</p></div>
  <div class="col-flex" style="gap:9px">
    ${ch.state==='preview'?`<button class="btn story block" data-preview="${ch.id}" data-act="close-sheet">${I.eye}Read the preview</button>`:""}
    ${r.state==='expired'?`<button class="btn story block" data-sheet="connect-patreon">${I.sync}Renew via Patreon</button>`:`<button class="btn ${ch.state==='preview'?'ghost':'story'} block" data-sheet="connect-patreon">${I.vault}Connect Patreon</button>`}
    <button class="btn ghost block" data-sheet="redeem">${I.key}Redeem an access key</button>
    <a class="btn ghost block" data-nav="/benefits">${I.spark}See what access unlocks</a>
    <a class="btn ghost block" data-nav="/support/check-access">${I.shield}Why is this locked?</a>
  </div>`;
}
function sheetRedeem(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Redeem an access key</h2><p class="sheet-sub">Keys unlock beta, reviewer, gift &amp; campaign content. Access binds to your account.</p>
  <form data-redeem-form><div class="col-flex"><input id="key-input-sheet" class="pill-input" name="key" style="text-align:left;letter-spacing:.1em" placeholder="XXXX-XXXX-XXXX-XXXX" autocomplete="off"><div id="key-error" class="faint" style="font-size:.76rem;min-height:1em"></div><button class="btn story block" type="submit">${I.key}Redeem key</button></div></form>
  <div class="card" style="margin-top:14px"><div class="eyebrow" style="margin-bottom:6px">Temporary local test keys</div><div class="faint" style="font-size:.76rem;line-height:1.7"><div><span class="kbd">AETHER-ARC2-2026</span> \u2014 Arc II preview</div><div><span class="kbd">REVIEWER-2026</span> \u2014 reviewer liturgy</div><div><span class="kbd">WRONG-KEY-9999</span> \u2014 see an error</div></div></div>`;
}
function sheetConnectPatreon(){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Activate with Patreon</h2><p class="sheet-sub">Patreon proves membership; your Aether login saves the library, keys, progress, and provider links.</p>
  <div class="card" style="margin-bottom:14px"><div class="between"><div><div style="font-weight:600">One smooth flow</div><div class="faint" style="font-size:.78rem">${authState.user?"We will send you to Patreon, then sync your tier back here.":"Continue with Google first, then we will automatically send you to Patreon to activate access."}</div></div>${I.vault}</div></div>
  <div class="col-flex" style="gap:9px">${authState.user?`<button class="btn story block" data-act="connect-patreon-go">${I.vault}Continue with Patreon</button>`:`<button class="btn story block" data-act="google-then-patreon">${I.external}Continue with Google, then Patreon</button><button class="btn ghost block" data-sheet="persona">${I.user}Use email instead</button>`}<button class="btn ghost block" data-sheet="redeem">${I.key}I have a key instead</button><a class="btn ghost block" data-nav="/support/wrong-account">${I.user}Wrong account?</a></div>
  <p class="faint" style="font-size:.72rem;margin-top:12px">Under the hood, Supabase remains the account that owns progress and entitlements; Patreon is linked as the payment/access provider.</p>`;
}
function sheetContext(){
  const f=currentChapter; if(!f) return "<p>Open a chapter first.</p>"; const {ch,story,index}=f;
  const prog=store.progress[ch.id];
  const next=story.chapters[index+1]; const nr=next?chapterResolved(next):null;
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>${ch.title}</h2><div class="sheet-sub">${story.title} \u00b7 Chapter ${ch.n} \u00b7 ${ch.arc||""}</div>
  <div class="card" style="margin-bottom:12px">${prog?`<div class="between"><span class="faint" style="font-size:.78rem">Progress</span><span style="font-size:.8rem;font-weight:600">${prog.pct}%</span></div>${progressBar(prog.pct)}`:`<p class="faint" style="font-size:.8rem;margin:0">Not started. Est. ${ch.readTime} min read.</p>`}</div>
  <div class="col-flex" style="gap:8px">
    <button class="btn ghost block" data-act="reader-bookmark">${I.bookmark}${store.bookmarks.find(b=>b.chapterId===ch.id)?'Remove bookmark':'Bookmark chapter'}</button>
    <button class="btn ghost block" data-act="reader-savequote">${I.quote}Save a quote</button>
    <button class="btn ghost block" data-act="reader-markread">${store.readMarked[ch.id]?I.check+'Marked read':'Mark as read'}</button>
    <button class="btn ghost block" data-act="offline-queue">${I.download}Save for offline</button>
    <a class="btn ghost block" data-nav="/story/${story.slug}/recap">${I.list}Read recap</a>
    <a class="btn ghost block" data-nav="/story/${story.slug}/extras">${I.spark}Bonus materials</a>
    ${next?`<div class="card" style="margin-top:4px"><div class="between"><div><div class="faint" style="font-size:.7rem;text-transform:uppercase">Next</div><div style="font-family:var(--serif);font-weight:600">${next.title}</div><div class="faint" style="font-size:.74rem">${axInline(nr)}</div></div>${isReadable(nr)?`<button class="btn sm story" data-read="${next.id}">${I.play}Go</button>`:`<button class="btn sm" data-lock="${next.id}">${accessTag(nr)[3]}</button>`}</div></div>`:""}
  </div>`;
}
function sheetParaComments(chId, p){
  const list=paraComments(chId,p);
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><h2>Paragraph note</h2><div class="sheet-sub">${list.length} note${list.length===1?'':'s'} on this paragraph</div>
  <div style="margin-bottom:14px">${list.map(commentHTML).join("")||`<p class="faint" style="font-size:.82rem">No notes yet.</p>`}</div>
  <form data-para-form="${chId}" data-para-index="${p}"><div class="col-flex"><input name="name" placeholder="Your name" style="max-width:140px"><input name="text" placeholder="Add a note on this paragraph\u2026" required><button class="btn sm story" type="submit">${I.msg}Post</button></div></form>`;
}
function sheetImage(fig, cap){
  return `<span class="close-x" data-act="close-sheet">${I.x}</span><div style="border-radius:var(--radius);overflow:hidden;border:1px solid var(--border)">${D.FIG[fig]||""}</div><p class="muted center" style="font-size:.82rem;margin-top:10px;font-style:italic">${cap||""}</p>`;
}

/* ============ ACTIONS ============ */
function toggleFollow(id){ const i=store.followed.indexOf(id); if(i>=0) store.followed.splice(i,1); else store.followed.push(id); saveStore(); toast(store.followed.includes(id)?"Following":"Unfollowed", null, {icon: store.followed.includes(id)?'checkCirc':'bell'}); render(); }
function setReaction(chId,k){ const cur=store.reactions[chId]?.picked; store.reactions[chId]={picked: cur===k?null:k}; saveStore(); renderReaderOnly(); }
function toggleBookmark(){ const f=currentChapter; if(!f) return; const id=f.ch.id; const i=store.bookmarks.findIndex(b=>b.chapterId===id); if(i>=0){ store.bookmarks.splice(i,1); toast("Bookmark removed"); } else { store.bookmarks.unshift({chapterId:id, storyId:f.story.id, label:"A passage in "+f.ch.title, when:"just now"}); toast("Bookmarked", f.ch.title, {icon:'bookmarkFill'}); } saveStore(); updateReaderBar(); }
function toggleMarkRead(){ const f=currentChapter; if(!f) return; const id=f.ch.id; store.readMarked[id]=!store.readMarked[id]; saveStore(); if(store.readMarked[id]){ const exists=store.history.find(h=>h.chapterId===id&&h.kind==='completed'); if(!exists) store.history.unshift({chapterId:id, storyId:f.story.id, title:f.ch.title, when:"just now", kind:"completed"}); saveStore(); toast("Marked as read"); } updateReaderBar(); }
function saveQuote(){ const sel=window.getSelection(); const text=sel?sel.toString().trim():""; if(text.length<4){ toast("Select some text first","Highlight a line in the chapter, then save.",{kind:"bad",icon:"quote",ms:3000}); return; } const f=currentChapter; store.quotes.unshift({id:"q"+now(), chapterId:f.ch.id, story:f.story.id, text, when:"just now"}); saveStore(); sel.removeAllRanges(); toast("Quote saved", text.slice(0,50)+(text.length>50?"\u2026":""), {icon:"quoteFill" in I?"quote":"quote"}); }
function rememberReturn(){ if(currentChapter) store.pendingReturn=currentChapter.ch.id; saveStore(); }
async function connectPatreonGo(){
  if (!authState.user){ await signInWithGoogle("connect-patreon"); return; }
  try {
    const btnMsg = "Starting Patreon connection";
    toast(btnMsg, "Redirecting through secure OAuth...", {icon:"sync", ms:3000});
    store.providerPending = true;
    saveStore();
    await requestPatreonOAuth();
  } catch (err) {
    store.providerPending = false;
    saveStore();
    toast("Patreon not ready", err.message || "The OAuth Edge Function needs configuration.", {icon:"alert", kind:"bad", ms:6500});
    render();
  }
}
async function redeemKey(code){
  code=(code||"").trim().toUpperCase();
  const err=document.getElementById("key-error");
  if(!code){ if(err)err.textContent=""; return false; }
  if(!authState.user){ if(err){err.style.color="var(--bad)";err.textContent="Sign in before redeeming a key.";} openSheet(sheetPersona); return false; }
  const client = getSupabase();
  if (client) {
    try {
      if(err){err.style.color="var(--text-dim)";err.textContent="Redeeming against Supabase...";}
      const { error } = await client.rpc("redeem_access_key", { submitted_code: code });
      if (error) throw error;
      await refreshEntitlements();
      const ret=store.pendingReturn;
      closeSheet();
      toast("Access key redeemed", "Your entitlements have been refreshed.", {icon:"key", ms:5500, action: ret?{act:"return:"+ret, label:"Return to chapter"}:null});
      render();
      return true;
    } catch (rpcErr) {
      if(err){err.style.color="var(--warn)";err.textContent=rpcErr.message || "Backend key redemption is not available yet.";}
      return false;
    }
  }
  if(err){err.style.color="var(--bad)";err.textContent="Supabase is unavailable; key redemption cannot run.";}
  return false;
}
function copyText(t){ try{ navigator.clipboard&&navigator.clipboard.writeText(t); }catch(e){ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(_){} ta.remove(); } toast("Copied to clipboard"); }

/* ============ reader-only re-render (keep scroll) ============ */
function renderReaderOnly(){ if(route.name!=="read"||!currentChapter) return;
  document.body.setAttribute("data-reader-theme", store.settings.readerTheme);
  const v=VIEWS.read(); const tmp=document.createElement("div"); tmp.innerHTML=v;
  const newReader=tmp.querySelector("#reader"); const cur=document.getElementById("reader");
  if(newReader&&cur){ cur.className=newReader.className; cur.style.cssText=newReader.style.cssText; }
  const newStage=tmp.querySelector("#rstage"); const stage=document.getElementById("rstage");
  if(newStage&&stage) stage.innerHTML=newStage.innerHTML;
  const prog=document.getElementById("rprog"); if(prog) prog.style.display=store.settings.showProgress?"":"none";
  updateReaderBar();
}
function updateReaderBar(){ const bar=document.getElementById("rbar"); if(!bar) return; const f=currentChapter; const bk=store.bookmarks.find(b=>b.chapterId===f.ch.id); const btns=bar.querySelectorAll("button"); if(btns[3]) btns[3].innerHTML=bk?I.bookmarkFill:I.bookmark, btns[3].classList.toggle("active",!!bk); }

/* ============ after-render hooks ============ */
let lastScroll=0;
function afterRender(){
  const isReader = route.name==="read";
  if (!isReader){
    // home search etc handled globally
  }
  if (isReader){ setupReader(); }
}
function setupReader(){
  const stage=document.getElementById("rstage");
  const top=document.getElementById("rtop");
  const prog=document.getElementById("rprog");
  const settings=store.settings;
  if(!settings.showProgress && prog) prog.style.display="none";
  // record read open in history
  if(currentChapter){ const id=currentChapter.ch.id; const exists=store.history.find(h=>h.chapterId===id); if(!exists){ store.history.unshift({chapterId:id, storyId:currentChapter.story.id, title:currentChapter.ch.title, when:"just now", kind: chapterResolved(currentChapter.ch).state==="preview"?"preview":"read"}); store.history=store.history.slice(0,12); saveStore(); } }
  // progress + autohide top
  function onScroll(){
    const sc=window.scrollY; const max=document.body.scrollHeight-window.innerHeight; const pct=max>0?Math.min(100,sc/max*100):0;
    if(prog) prog.style.width=pct+"%";
    if(top){ if(sc>lastScroll+8 && sc>120){ top.classList.add("hidden"); } else if(sc<lastScroll-8){ top.classList.remove("hidden"); } }
    lastScroll=sc;
    // save progress at ~ every change of 5%
    if(currentChapter && Math.abs(pct-(store.progress[currentChapter.ch.id]?.pct||0))>4){ store.progress[currentChapter.ch.id]={pct:Math.round(pct), scene: currentChapter.ch.title, storyId:currentChapter.story.id, updatedAt:now()}; saveStore(); }
  }
  window.removeEventListener("scroll", readerScrollHandler);
  readerScrollHandler=onScroll;
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
  // tap zones
  if(stage && !stage.dataset.wired){ stage.dataset.wired="1"; stage.addEventListener("click",(e)=>{
    if(e.target.closest("button,a,figure,.pchip,.react,input,textarea,.cmt-form")) return;
    const x=e.clientX/window.innerWidth;
    if(settings.focusMode){ document.getElementById("reader").classList.toggle("ui-on"); return; }
    if(x<0.28){ goReaderChapter(-1); } else if(x>0.72){ goReaderChapter(1); } else { top&&top.classList.toggle("hidden"); }
  }); }
}
let readerScrollHandler=null;
function goReaderChapter(dir){
  if(!currentChapter) return; const f=currentChapter; const idx=f.story.chapters.indexOf(f.ch); const nxt=f.story.chapters[idx+dir]; if(!nxt){ toast(dir>0?"You're at the latest chapter":"You're at the first chapter",null,{kind:"bad",icon:"alert",ms:2200}); return; }
  const r=chapterResolved(nxt);
  if(isReadable(r)){ nav("/read/"+nxt.id); } else if(r.state==="preview"){ nav("/read/"+nxt.id); } else { rememberReturn(); openSheet(()=>sheetLock(nxt.id)); }
}

/* ============ global listeners ============ */
function handleAttr(el, name, val){
  // returns true if handled
}
function delegate(){
  document.addEventListener("click",(e)=>{
    const t=e.target.closest("[data-nav],[data-read],[data-preview],[data-lock],[data-sheet],[data-follow],[data-react],[data-persona],[data-toggle],[data-filter],[data-act],[data-toast-action],[data-dismiss],[data-fig],[data-para],[data-copy],[data-set-theme],[data-set-preset],[data-shelf-view],[data-quote-card],[data-site-theme],[data-studio-state],[data-set-bg-mode],[data-set-bg-url]");
    if(!t) return;
    if (t.dataset.siteTheme!=null){ setTheme(t.dataset.siteTheme); openSheet(currentSheet?currentSheet.builder:sheetSettings, currentSheet?currentSheet.opts:null); toast("Theme: "+(THEMES.find(x=>x.id===t.dataset.siteTheme)?.name), null, {icon:"palette"}); return; }
    if (t.dataset.studioState!=null){ const p=t.closest(".state-pills"); if(p) p.querySelectorAll(".state-pill").forEach(b=>b.classList.remove("active")); t.classList.add("active"); toast("Access state set", "Chapter will be "+t.textContent.trim()+" on publish.", {icon:"lock"}); return; }
    if (t.dataset.nav!=null){ e.preventDefault(); nav(t.dataset.nav); return; }
    if (t.dataset.read!=null){ e.preventDefault(); nav("/read/"+t.dataset.read); return; }
    if (t.dataset.preview!=null){ e.preventDefault(); nav("/read/"+t.dataset.preview); return; }
    if (t.dataset.lock!=null){ e.preventDefault(); rememberReturn(); openSheet(()=>sheetLock(t.dataset.lock)); return; }
    if (t.dataset.sheet!=null){ e.preventDefault(); const sh=t.dataset.sheet; const builders={settings:sheetSettings,persona:sheetPersona,signup:sheetSignup,redeem:sheetRedeem,"connect-patreon":sheetConnectPatreon,context:sheetContext}; if(sh==="context"&&!currentChapter){ toast("Open a chapter first",null,{kind:"bad",icon:"alert"}); return; } openSheet(builders[sh]||sheetSettings); return; }
    if (t.dataset.follow!=null){ toggleFollow(t.dataset.follow); return; }
    if (t.dataset.react!=null){ if(currentChapter) setReaction(currentChapter.ch.id, t.dataset.react); return; }
    if (t.dataset.persona!=null){ store.personaId=t.dataset.persona; saveStore(); closeSheet(); toast("Viewing as "+(D.PERSONAS.find(p=>p.id===t.dataset.persona)?.label),null,{icon:"user"}); render(); return; }
    if (t.dataset.filter!=null){ const k=t.dataset.filter; const i=store.filters.chips.indexOf(k); if(i>=0) store.filters.chips.splice(i,1); else store.filters.chips.push(k); saveStore(); renderHeaderless(); return; }
    if (t.dataset.toggle!=null){ store.settings[t.dataset.toggle]=!store.settings[t.dataset.toggle]; saveStore(); applyBgSettings(); if(currentSheet){ openSheet(currentSheet.builder, currentSheet.opts); } if(route.name==="read") renderReaderOnly(); return; }
    if (t.dataset.setBgMode!=null){ store.settings.bgMode=t.dataset.setBgMode; saveStore(); applyBgSettings(); if(currentSheet){ openSheet(currentSheet.builder, currentSheet.opts); } return; }
    if (t.dataset.setBgUrl!=null){ store.settings.bgImageUrl=t.dataset.setBgUrl; saveStore(); setStoryAccent(getActiveStory()); if(currentSheet){ openSheet(currentSheet.builder, currentSheet.opts); } return; }
    if (t.dataset.shelfView!=null){ store.filters.shelfView=t.dataset.shelfView; saveStore(); render(); return; }
    if (t.dataset.setTheme!=null){ store.settings.readerTheme=t.dataset.setTheme; saveStore(); openSheet(currentSheet.builder,currentSheet.opts); renderReaderOnly(); return; }
    if (t.dataset.setPreset!=null){ store.settings.preset=t.dataset.setPreset; if(t.dataset.setPreset==="dyslexia"){/*keep*/} saveStore(); openSheet(currentSheet.builder,currentSheet.opts); renderReaderOnly(); return; }
    if (t.dataset.fig!=null){ openSheet(()=>sheetImage(t.dataset.fig, t.closest("figure")?.querySelector("figcaption")?.textContent)); return; }
    if (t.dataset.para!=null && currentChapter){ openSheet(()=>sheetParaComments(currentChapter.ch.id, parseInt(t.dataset.para))); return; }
    if (t.dataset.copy!=null){ copyText(t.dataset.copy); return; }
    if (t.dataset.quoteCard!=null){ toast("Quote card ready","Copied as a shareable card.",{icon:"spark"}); return; }
    if (t.dataset.dismiss!=null){
      if (!store.dismissedNotifs) store.dismissedNotifs = [];
      store.dismissedNotifs.push(t.dataset.dismiss);
      store.notifs=store.notifs.filter(n=>n.id!==t.dataset.dismiss);
      saveStore();
      render();
      return;
    }
    if (t.dataset.toastAction!=null){ const a=t.dataset.toastAction; if(a.startsWith("return:")){ store.pendingReturn=null; saveStore(); nav("/read/"+a.split(":")[1]); } return; }
    if (t.dataset.act!=null){ e.preventDefault(); e.stopPropagation(); handleAct(t.dataset.act, t); return; }
  });
  document.addEventListener("input",(e)=>{
    const t=e.target;
    if(t.id==="lib-search"){ store.filters.q=t.value; renderHeaderless(); return; }
    if(t.dataset && t.dataset.setRange){ store.settings[t.dataset.setRange]=parseFloat(t.value); saveStore(); const lbl=t.closest(".set-group")?.querySelector("label .faint"); if(lbl){ lbl.textContent = t.dataset.setRange==="fontScale"? Math.round(t.value*100)+"%" : parseFloat(t.value).toFixed(2); } renderReaderOnly(); }
  });
  document.addEventListener("submit", async (e)=>{
    const f=e.target;
    if(f.dataset.cmtForm!=null){ e.preventDefault(); const name=(f.querySelector("[name=name]")?.value||"Reader").trim()||"Reader"; const text=f.querySelector("[name=text]").value.trim(); if(!text) return; const chId=f.dataset.cmtForm; (store.comments[chId]=store.comments[chId]||[]).push({id:"c"+now(),para:null,name,text,time:"just now",color:"#d4b06a"}); saveStore(); renderReaderOnly(); toast("Note posted",null,{icon:"msg"}); return; }
    if(f.dataset.paraForm!=null){ e.preventDefault(); const name=(f.querySelector("[name=name]")?.value||"Reader").trim()||"Reader"; const text=f.querySelector("[name=text]").value.trim(); if(!text) return; const chId=f.dataset.paraForm; const p=parseInt(f.dataset.paraIndex); (store.comments[chId]=store.comments[chId]||[]).push({id:"c"+now(),para:p,name,text,time:"just now",color:"#5bb8c9"}); saveStore(); closeSheet(); renderReaderOnly(); toast("Paragraph note added",null,{icon:"msg"}); return; }
    if(f.dataset.redeemForm!=null){ e.preventDefault(); const v=f.querySelector("[name=key]").value; const ok=await redeemKey(v); if(ok===false){ /* error shown */ } return; }

    if(f.dataset.authForm!=null){
      e.preventDefault();
      const status=f.querySelector("[data-auth-status]");
      const email=(f.querySelector("[name=email]")?.value||"").trim();
      const password=f.querySelector("[name=password]")?.value||"";
      if(!email || !password){ if(status){ status.style.color="var(--bad)"; status.textContent="Email and password are required."; } return; }
      try {
        if(status){ status.style.color="var(--text-dim)"; status.textContent=f.dataset.authForm==="signup"?"Creating account...":"Signing in..."; }
        if(f.dataset.authForm==="signup") await signUpWithPassword(email, password);
        else await signInWithPassword(email, password);
        closeSheet();
        toast(f.dataset.authForm==="signup"?"Account created":"Signed in", "Reader account is connected.", {icon:"checkCirc", ms:4500});
        render();
      } catch (err) {
        if(status){ status.style.color="var(--bad)"; status.textContent=err.message || "Authentication failed."; }
      }
      return;
    }
    if(f.dataset.contactForm!=null){ e.preventDefault(); f.reset(); toast("Support message sent","We'll reply by email.",{icon:"mail",ms:5000}); return; }
  });
  // selection for quote saving
  document.addEventListener("mouseup",()=>{ if(route.name!=="read") return; const sel=window.getSelection(); const text=sel?sel.toString().trim():""; const prose=document.getElementById("prose"); if(text.length>3 && prose && prose.contains(sel.anchorNode)){ ensureQuoteFab(true); } else { ensureQuoteFab(false); } });
  document.addEventListener("touchend",()=>{ if(route.name!=="read") return; setTimeout(()=>{ const sel=window.getSelection(); const text=sel?sel.toString().trim():""; ensureQuoteFab(text.length>3); },250); });
}
function renderHeaderless(){ // re-render only main for library search without losing focus
  const main=document.getElementById("main"); const view=VIEWS[route.name]||VIEWS.home; const html=view(); const inp=document.activeElement; const caret=inp&&inp.id==="lib-search"? inp.selectionStart : null; main.innerHTML=`<div class="vt">${html}</div>`; afterRender(); const newInp=document.getElementById("lib-search"); if(newInp&&caret!=null){ newInp.focus(); newInp.setSelectionRange(caret,caret); } }
let quoteFab=null;
function ensureQuoteFab(show){ if(show){ if(quoteFab) return; quoteFab=document.createElement("button"); quoteFab.className="btn story sm"; quoteFab.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--nav-h)+70px + env(safe-area-inset-bottom));z-index:75;box-shadow:var(--shadow-lg)"; quoteFab.innerHTML=I.quote+"Save quote"; quoteFab.onclick=()=>{ saveQuote(); ensureQuoteFab(false); }; document.body.appendChild(quoteFab); requestAnimationFrame(()=>quoteFab.style.opacity="1"); } else if(quoteFab){ quoteFab.remove(); quoteFab=null; } }

function handleAct(act, el){
  switch(act){
    case "close-sheet": closeSheet(); break;
    case "clear-filters": store.filters={q:"",chips:[]}; saveStore(); render(); break;
    case "toggle": { /* handled by data-toggle */ break; }
    case "connect-patreon-go": connectPatreonGo(); break;
    case "google-signin": signInWithGoogle().catch(err=>toast("Google sign-in failed", err.message || "Unable to start Google OAuth.", {icon:"alert", kind:"bad"})); break;
    case "google-then-patreon": signInWithGoogle("connect-patreon").catch(err=>toast("Google sign-in failed", err.message || "Unable to start Google OAuth.", {icon:"alert", kind:"bad"})); break;
    case "show-signup": openSheet(sheetSignup); break;
    case "reader-signout": signOutReader().then(()=>{ closeSheet(); toast("Signed out", null, {icon:"user"}); render(); }).catch(err=>toast("Sign out failed", err.message, {icon:"alert", kind:"bad"})); break;
    case "resync": syncProviderEntitlements().then((data)=>{ const grants = Number(data?.grants || 0); toast("Sync complete", grants ? `${grants} Patreon entitlement${grants===1?"":"s"} active.` : "Patreon linked, but no mapped tier was found.", {icon:"checkCirc", ms:4000}); render(); }).catch(err=>toast("Sync failed", err.message || "Unable to refresh provider entitlements.", {icon:"alert", kind:"bad"})); break;
    case "expected-access": rememberReturn(); openSheet(sheetContext?sheetContext:()=>sheetLock(currentChapter?.ch.id)); break;
    case "reader-prev": goReaderChapter(-1); break;
    case "reader-next": goReaderChapter(1); break;
    case "reader-bookmark": toggleBookmark(); break;
    case "reader-markread": toggleMarkRead(); break;
    case "reader-savequote": saveQuote(); break;
    case "reader-comments": { const c=document.getElementById("cmtblock"); if(c){ c.scrollIntoView({behavior:"smooth"}); } break; }
    case "offline-queue": toast("Saved for offline","Available while your access is active (concept).",{icon:"download",ms:4000}); break;
    case "extra-open": toast("Opening bonus material","Author note \u00b7 reader format.",{icon:"spark"}); break;
    case "external-archive": toast("Opening Abstracto Tales","The main archive opens in a new tab (concept).",{icon:"external",ms:3500}); break;
    case "external-discord": toast("Opening Discord","#aether-pages-help (concept).",{icon:"msg"}); break;
    case "simulate-notif": { const n={id:"n"+now(),t:"New chapter available",d:"A new early-access chapter just dropped.",k:"chapter",time:"just now",read:false,story:"glass-orchard",chapter:"go-5"}; store.notifs.unshift(n); saveStore(); render(); toast("Notice added",null,{icon:"bell"}); break; }
    case "mark-all-read": store.notifs.forEach(n=>n.read=true); saveStore(); render(); break;
    case "clear-all-notifs": store.notifs=[]; saveStore(); render(); break;
    case "notif-prefs": toast("Notification preferences","Manage email & push in account settings (concept).",{icon:"cog",ms:3500}); break;
    case "studio-publish": toast("Published","Chapter is live for readers with access.",{icon:"checkCirc",ms:4000}); break;
    case "studio-save-draft": toast("Draft saved","Auto-saved to your drafts.",{icon:"book"}); break;
    case "studio-schedule": toast("Scheduled","Post queued for its release time.",{icon:"calendar"}); break;
    case "studio-new-chapter": case "studio-new-post": case "studio-new-campaign": case "studio-upload": toast("Opening composer","This would open the full editor (concept).",{icon:"plus"}); break;
    case "studio-edit": toast("Opening editor","Edit details in the full studio (concept).",{icon:"cog"}); break;
    case "studio-preview": toast("Preview","Showing how readers will see this chapter.",{icon:"eye"}); break;
    case "studio-grant": toast("Manual grant","Access granted to this reader.",{icon:"gift"}); break;
    case "studio-approve": toast("Comment approved","Now visible to readers.",{icon:"check"}); render(); break;
    case "studio-hide": toast("Comment hidden","Removed from reader view.",{icon:"x",kind:"bad"}); render(); break;
    case "studio-media-open": toast("Asset details","Manage attachments & visibility (concept).",{icon:"spark"}); break;
    case "studio-post": toast("Opening post","Full announcement in the reader (concept).",{icon:"msg"}); break;
    default: break;
  }
}

/* ============ AETHER STUDIO (author CMS) views ============ */
VIEWS.studioOverview = function(){
  const o=D.STUDIO.overview, a=D.STUDIO.analytics;
  const max=Math.max(...a.readsByDay);
  return `<h1 class="page-title">Studio Overview</h1><p class="page-sub">Your archive at a glance \u2014 subscribers, reads, and what needs your attention.</p>
  <div class="kpis" style="margin:14px 0 18px">
    <div class="kpi"><div class="lbl">Subscribers</div><div class="val">${o.subscribers.toLocaleString()}</div><div class="delta up">${I.trending} ${o.subsDelta}</div></div>
    <div class="kpi"><div class="lbl">Reads (30d)</div><div class="val">${o.reads30.toLocaleString()}</div><div class="delta up">${o.readsDelta}</div></div>
    <div class="kpi"><div class="lbl">Drafts</div><div class="val">${o.drafts}</div><div class="delta">${o.draftsDelta}</div></div>
    <div class="kpi"><div class="lbl">Scheduled</div><div class="val">${o.scheduled}</div><div class="delta">${o.scheduledDelta}</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Reads this fortnight</h2></div>
    <div class="card"><div class="bars">${a.readsByDay.map(v=>`<i style="height:${Math.round(v/max*100)}%"></i>`).join("")}</div>
    <div class="faint" style="font-size:.72rem;margin-top:8px">Peak day: ${max} reads \u00b7 strongest in the evenings.</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Quick actions</h2></div>
    <div class="quicklinks">
      <a data-nav="/studio/chapters">${I.plus}<span>New chapter</span><small>Draft &amp; publish</small></a>
      <a data-nav="/studio/announcements">${I.msg}<span>Post update</span><small>Announce</small></a>
      <a data-nav="/studio/access">${I.key}<span>Create key</span><small>Campaign</small></a>
      <a data-nav="/studio/media">${I.spark}<span>Upload art</span><small>Illustration</small></a>
    </div>
  </div>
  <div class="section"><div class="section-head"><h2>Needs attention</h2></div>
    <div class="col-flex">
      <div class="mgr-row"><span class="mi-ic" style="color:var(--warn)">${I.alert}</span><div class="mi-body"><div class="mi-t">1 flagged comment</div><div class="mi-s">Reported spoiler in "Inheritance of Glass" \u2014 review in Analytics.</div></div><div class="mi-acts"><button class="btn sm" data-nav="/studio/analytics">Review</button></div></div>
      <div class="mgr-row"><span class="mi-ic" style="color:var(--info)">${I.sync}</span><div class="mi-body"><div class="mi-t">1 sync pending</div><div class="mi-s">Pell R. \u2014 Patreon connection verifying.</div></div><div class="mi-acts"><button class="btn sm" data-nav="/studio/access">Members</button></div></div>
      <div class="mgr-row"><span class="mi-ic" style="color:var(--accent)">${I.book}</span><div class="mi-body"><div class="mi-t">Draft ready: "The Third Bell"</div><div class="mi-s">2,140 words \u00b7 Arc II opening.</div></div><div class="mi-acts"><button class="btn sm story" data-act="studio-publish">Publish</button></div></div>
    </div>
  </div>`;
};
VIEWS.studioChapters = function(){
  const all = D.FEATURED_SLUGS.flatMap(slug=>{ const s=bySlug(slug); return s.chapters.map(c=>({c,s})); }).concat(
    D.STORIES.filter(s=>!D.FEATURED_SLUGS.includes(s.slug)).flatMap(s=>s.chapters.map(c=>({c,s})))
  );
  const states=[["free","Free"],["preview","Preview"],["early","Early"],["member","Member"],["key","Key"],["unavailable","Hold"]];
  return `<div class="between"><div><h1 class="page-title">Chapters</h1><p class="page-sub">Draft, set access state, and schedule releases.</p></div><button class="btn story sm" data-act="studio-new-chapter">${I.plus}New chapter</button></div>
  <div class="card composer" style="margin:12px 0 18px">
    <div class="eyebrow" style="margin-bottom:8px">Quick publish</div>
    <input type="text" placeholder="Chapter title\u2026">
    <div class="state-pills" style="margin:10px 0">${states.map(([k,l],i)=>`<button class="state-pill ${i===3?'active':''}" data-studio-state="${k}">${l}</button>`).join("")}</div>
    <textarea placeholder="Paste or write the chapter draft\u2026"></textarea>
    <div class="between" style="margin-top:10px"><span class="faint" style="font-size:.76rem">Auto-saves as you type.</span><div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="studio-save-draft">${I.book}Save draft</button><button class="btn sm story" data-act="studio-publish">${I.play}Publish</button></div></div>
  </div>
  <div class="section"><div class="section-head"><h2>All chapters</h2><span class="faint" style="font-size:.78rem">${all.length} total</span></div>
    ${all.map(({c,s})=>{
      const st = c.state==='free'?'free':c.state==='preview'?'preview':c.state==='early'?'early':c.state==='key'?'key':c.state==='unavailable'?'unavailable':'member';
      const stColor={free:'free',preview:'preview',early:'early',member:'unlocked',key:'key',unavailable:'error'}[st];
      return `<div class="mgr-row"><span class="mi-ic" style="color:var(--${stColor==='unlocked'?'accent-2':stColor})">${I[st==='free'?'open':st==='early'?'hourglass':st==='key'?'key':st==='preview'?'eye':st==='unavailable'?'alert':'lock']}</span>
        <div class="mi-body"><div class="mi-t"><span>${c.title}</span>${badge(stColor==='unlocked'?'gold':stColor, st)}${c.publicDate?badge('early','Public '+fmtDate(c.publicDate)):''}</div><div class="mi-s">${s.title} \u00b7 Ch ${c.n} \u00b7 ${c.readTime} min \u00b7 ${c.arc||''}</div></div>
        <div class="mi-acts"><button class="btn sm" data-act="studio-edit">${I.cog}State</button><button class="btn sm ghost" data-act="studio-preview">${I.eye}Preview</button></div></div>`;
    }).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Drafts</h2></div>
    ${D.STUDIO.drafts.map(d=>`<div class="mgr-row"><span class="mi-ic">${I.book}</span><div class="mi-body"><div class="mi-t"><span>${d.title}</span>${badge(d.status==='review'?'':'', d.status)}</div><div class="mi-s">${d.book} \u00b7 ${d.words.toLocaleString()} words \u00b7 ${d.note}</div></div><div class="mi-acts"><button class="btn sm story" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioAccess = function(){
  return `<h1 class="page-title">Access &amp; Members</h1><p class="page-sub">Tiers, key campaigns, members and manual grants.</p>
  <div class="section"><div class="section-head"><h2>Tiers</h2></div>
    ${D.STUDIO.tiers.map(t=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--accent)">${I.vault}</span><div class="mi-body"><div class="mi-t"><span>${t.name}</span>${badge('gold',t.price)}${badge('',t.members+' members')}</div><div class="mi-s">${t.unlocks}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Key campaigns</h2><button class="btn sm story" data-act="studio-new-campaign">${I.plus}New campaign</button></div>
    ${D.STUDIO.campaigns.map(c=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--key)">${I.key}</span><div class="mi-body"><div class="mi-t"><span>${c.name}</span>${badge(c.state==='active'?'key':'', c.state)}${badge('',c.used+'/'+c.issued+' used')}</div><div class="mi-s"><span class="kbd">${c.code}</span> \u00b7 ${c.scope} \u00b7 expires ${c.expires}</div></div><div class="mi-acts"><button class="btn sm" data-copy="${c.code}">${I.copy}Copy</button></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Members</h2><span class="faint" style="font-size:.78rem">${D.STUDIO.members.length} shown</span></div>
    ${D.STUDIO.members.map(m=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${m.status==='active'?'good':m.status==='lapsed'?'bad':'warn'})">${I.user}</span><div class="mi-body"><div class="mi-t"><span>${m.name}</span>${badge(m.status==='active'?'free':m.status==='lapsed'?'':'', m.status)}${badge('',m.tier)}</div><div class="mi-s">since ${m.since} \u00b7 via ${m.source}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-grant">${I.gift}Grant</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioAnnouncements = function(){
  return `<div class="between"><div><h1 class="page-title">Posts &amp; Announcements</h1><p class="page-sub">Updates readers see on Home and in notifications.</p></div><button class="btn story sm" data-act="studio-new-post">${I.plus}New post</button></div>
  <div class="card composer" style="margin:12px 0 18px">
    <div class="eyebrow" style="margin-bottom:8px">Compose announcement</div>
    <input type="text" placeholder="Headline\u2026">
    <textarea placeholder="What should readers know?" style="margin-top:10px"></textarea>
    <div class="between" style="margin-top:10px"><div class="chips"><button class="chip active">All readers</button><button class="chip">Aether Member</button><button class="chip">Archivist</button></div><div style="display:flex;gap:8px"><button class="btn sm ghost" data-act="studio-schedule">${I.calendar}Schedule</button><button class="btn sm story" data-act="studio-publish">${I.play}Publish now</button></div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Scheduled &amp; live</h2></div>
    ${D.STUDIO.announcements.map(a=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${a.state==='live'?'good':'info'})">${I.msg}</span><div class="mi-body"><div class="mi-t"><span>${a.title}</span>${badge(a.state==='live'?'free':'', a.state)}</div><div class="mi-s">${a.body} \u00b7 ${a.target} \u00b7 ${a.when}</div></div><div class="mi-acts"><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioMedia = function(){
  return `<div class="between"><div><h1 class="page-title">Media &amp; Artwork</h1><p class="page-sub">Illustrations, cover concepts and art drops.</p></div><button class="btn story sm" data-act="studio-upload">${I.download}Upload</button></div>
  <div class="section"><div class="section-head"><h2>Gallery</h2><span class="faint" style="font-size:.78rem">${D.STUDIO.media.length} assets</span></div>
    <div class="media-grid">${D.STUDIO.media.map(m=>`<div class="media-cell" data-act="studio-media-open">${D.FIG[m.fig]||''}<span class="tag">${m.used?m.attached:'Unassigned'}</span></div>`).join("")}</div>
  </div>
  <div class="card" style="margin-top:14px"><div class="between"><div><div style="font-weight:600;font-size:.88rem">${I.external} Art lives in the main archive</div><div class="faint" style="font-size:.76rem">Full galleries, maps and high-res assets are managed on Abstracto Tales.</div></div><button class="btn sm ghost" data-act="external-archive">${I.external}Open</button></div></div>`;
};
VIEWS.studioAnalytics = function(){
  const a=D.STUDIO.analytics; const max=Math.max(...a.readsByDay);
  return `<h1 class="page-title">Analytics</h1><p class="page-sub">How readers move through your archive.</p>
  <div class="kpis" style="margin:14px 0 18px">
    <div class="kpi"><div class="lbl">Followers</div><div class="val">${D.STUDIO.overview.followers.toLocaleString()}</div><div class="delta up">${D.STUDIO.overview.followersDelta}</div></div>
    <div class="kpi"><div class="lbl">Avg completion</div><div class="val">84%</div><div class="delta up">+3%</div></div>
    <div class="kpi"><div class="lbl">Comments</div><div class="val">${totalComments()+124}</div><div class="delta">7 pending</div></div>
    <div class="kpi"><div class="lbl">Retention</div><div class="val">${a.retention.latest}%</div><div class="delta down">to latest</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Reads over time</h2></div>
    <div class="card"><div class="bars">${a.readsByDay.map(v=>`<i style="height:${Math.round(v/max*100)}%"></i>`).join("")}</div></div>
  </div>
  <div class="section"><div class="section-head"><h2>Top chapters</h2></div>
    ${a.topChapters.map((c,i)=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--accent);font-family:var(--serif);font-weight:700">${i+1}</span><div class="mi-body"><div class="mi-t"><span>${c.t}</span>${badge('',c.react)}</div><div class="mi-s">${c.reads.toLocaleString()} reads \u00b7 ${c.completion}% completion</div></div></div>`).join("")}
  </div>
  <div class="section"><div class="section-head"><h2>Reactions</h2></div>
    <div class="card">${a.reactions.map(r=>`<div class="between" style="padding:6px 0"><span style="font-size:1.2rem">${r.e}</span><div style="flex:1;margin:0 12px">${progressBar(Math.round(r.n/a.reactions[0].n*100))}</div><span class="faint" style="font-size:.78rem">${r.n}</span></div>`).join("")}</div>
  </div>
  <div class="section"><div class="section-head"><h2>Comment moderation</h2><span class="badge" style="align-self:center">${a.commentsQueue.filter(c=>c.flagged).length} flagged</span></div>
    ${a.commentsQueue.map(c=>`<div class="mgr-row"><span class="mi-ic" style="color:var(--${c.flagged?'bad':'text-dim'})">${c.flagged?I.alert:I.msg}</span><div class="mi-body"><div class="mi-t"><span>${c.who}</span>${badge('',c.ch)}${c.flagged?badge('','Flagged'):''}</div><div class="mi-s">${c.text}</div></div><div class="mi-acts"><button class="btn sm" data-act="studio-approve">${I.check}Approve</button><button class="btn sm ghost" data-act="studio-hide">${I.x}Hide</button></div></div>`).join("")}
  </div>`;
};
VIEWS.studioSettings = function(){
  const s=bySlug(D.PRIMARY_SLUG);
  return `<h1 class="page-title">Studio Settings</h1><p class="page-sub">Book identity, branding and defaults.</p>
  <div class="section"><div class="section-head"><h2>Primary book</h2></div>
    <div class="card tinted" style="${storyAccentVars(s)};display:flex;gap:13px;align-items:center"><div style="width:54px;height:72px;border-radius:8px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(s)}</div><div style="flex:1"><div style="font-family:var(--serif);font-weight:600">${s.title}</div><div class="faint" style="font-size:.76rem">${s.author} \u00b7 ${s.genre}</div></div><button class="btn sm ghost" data-act="studio-edit">${I.cog}Edit</button></div>
  </div>
  <div class="section"><div class="section-head"><h2>Branding accent</h2></div>
    <div class="card"><div class="state-pills">${["#c75b6b","#d4b06a","#5bb8c9","#9a7ed1","#8fb98a","#e08a4a"].map((col,i)=>`<button class="state-pill ${i===0?'active':''}" style="background:${col};border-color:${col};color:#fff;padding:0 18px"></button>`).join("")}</div><p class="faint" style="font-size:.76rem;margin-top:10px">This book's accent tints covers, progress and the reader when readers enter it.</p></div>
  </div>
  <div class="section"><div class="section-head"><h2>Defaults</h2></div>
    <div class="card">
      ${toggleRow("studioDefaultEarly","New chapters default to Early Access","Public release 14 days later",true)}
      ${toggleRow("studioCommentsOn","Comments on by default","Readers can leave notes",true)}
      ${toggleRow("studioAutoSync","Auto-sync Patreon hourly","Keeps entitlements fresh",true)}
    </div>
  </div>
  <div class="card" style="display:flex;gap:11px;align-items:center"><span class="faint">${I.external}</span><div style="flex:1"><div style="font-weight:600;font-size:.86rem">Connect the main archive</div><div class="faint" style="font-size:.74rem">Sync deep lore & galleries from Abstracto Tales.</div></div><button class="btn sm ghost" data-act="external-archive">${I.external}Connect</button></div>`;
};
/* ============ HOME (override: book-centered living feed) ============ */
VIEWS.home = function(){
  const P = persona();
  const reads = activeReads();
  const primary = bySlug(D.PRIMARY_SLUG);
  const secondary = D.FEATURED_SLUGS.map(bySlug).filter(s=>s && s.slug!==primary.slug)[0];
  const shorter = D.STORIES.filter(s=>!D.FEATURED_SLUGS.includes(s.slug));
  let banner = "";
  if (P.expired) banner = accessBanner("expired","Your Aether Member access has expired","Some chapters are now locked. Renew to continue reading.","/vault","Renew access");
  else if (P.pending) banner = accessBanner("pending","We're verifying your access","Your Patreon connection is syncing \u2014 we'll update automatically.","/support/check-access","Check status");
  else if (P.noTier) banner = accessBanner("none","Your Patreon tier doesn't include access","You're connected, but your tier doesn't unlock Aether Pages.","/benefits","See what unlocks");
  else if (!P.signedIn) banner = accessBanner("anon","Browsing as a guest","Read free chapters and previews. Connect Patreon or redeem a key to unlock more.","/vault","Activate access");
  const lastRead = activeReads().find(x=>x.story.id===primary.id);
  const pRead = primary.chapters.filter(c=>store.readMarked[c.id]||(store.progress[c.id]&&store.progress[c.id].pct>=100)).length;
  const pPct = Math.round(pRead/primary.chapters.length*100);
  const latestCh = primary.chapters[primary.chapters.length-1];
  const startCh = lastRead?.ch.id || primary.chapters.find(c=>c.state==="free")?.id || primary.chapters[0].id;
  return `
  ${announcement()}
  ${banner}
  <div class="area-switch" style="margin:0 0 14px"><button class="active">${I.book}Reader</button>${isAdmin()?`<button data-nav="/studio/access">${I.overview}Author Studio</button><a class="btn sm ghost" href="admin.html">${I.shield}Admin CMS</a>`:""}</div>
  ${bookHero(primary, { startCh, lastRead, pPct, pRead, latestCh })}
  <div class="home-cols">
   <div style="min-width:0">
    <div class="section"><div class="section-head"><h2>What's new \u2014 ${primary.title}</h2><a class="section-link" data-nav="/story/${primary.slug}/updates">All ${I.chevR}</a></div><div class="feed stagger">${buildBookFeed(primary)}</div></div>
    ${reads.length?`<div class="section"><div class="section-head"><h2>Continue reading</h2><a class="section-link" data-nav="/my-shelf">My shelf ${I.chevR}</a></div><div class="lane stagger">${reads.slice(0,6).map(({ch,story,prog})=>{const next=story.chapters[story.chapters.indexOf(ch)+1];const nr=next?chapterResolved(next):null;return `<button class="card" style="width:220px;text-align:left;${storyAccentVars(story)}" data-read="${ch.id}"><div class="faint" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em">${story.title}</div><div style="font-family:var(--serif);font-weight:600;margin:2px 0 6px">${ch.title}</div>${progressBar(prog.pct)}<div class="between" style="margin-top:8px"><span class="faint" style="font-size:.72rem">${prog.pct<100?prog.pct+'%':'Done'}</span>${nr?`<span class="faint" style="font-size:.68rem">Next: ${accessTag(nr)[1]}</span>`:""}</div></button>`;}).join("")}</div></div>`:""}
    <div class="section"><div class="section-head"><h2>This week's releases</h2><a class="section-link" data-nav="/calendar">Calendar ${I.chevR}</a></div><div class="sched">${D.CALENDAR.slice(0,4).map(day=>`<div class="sched-card"><div class="dow">${day.day}</div><div class="dt">${(day.items[0]?.c||day.dow).split('\u2014')[0].trim()}</div>${day.items.map(it=>`<div class="dl">${it.t} \u00b7 ${it.k}</div>`).join("")}</div>`).join("")}</div></div>
   </div>
   <div style="min-width:0">
    ${secondary?`<div class="section"><div class="section-head"><h2>Also reading</h2></div><a class="card tinted" data-nav="/story/${secondary.slug}" style="${storyAccentVars(secondary)};display:block"><div style="display:flex;gap:13px;align-items:center"><div style="width:58px;height:78px;border-radius:9px;overflow:hidden;flex:0 0 auto;border:1px solid var(--border)">${coverArt(secondary)}</div><div style="min-width:0;flex:1"><div style="font-family:var(--serif);font-weight:600;font-size:1.05rem">${secondary.title}</div><div class="faint" style="font-size:.76rem;margin-top:2px">${secondary.author} \u00b7 ${secondary.genre}</div><div class="faint" style="font-size:.74rem;margin-top:6px">${secondary.tagline}</div></div></div><button class="btn sm story" style="margin-top:12px;width:100%">${I.book}Open story</button></a></div>`:""}
    ${memberArchivePanel()}
    <div class="section"><div class="section-head"><h2>Shorter works</h2></div><p class="faint" style="font-size:.76rem;margin:-4px 0 8px">Novellas, prequels &amp; bonus pieces beyond the main serials.</p><div class="lane">${shorter.map(storyCard).join("")}</div></div>
   </div>
  </div>
  <div class="section"><div class="section-head"><h2>Browse by collection</h2><a class="section-link" data-nav="/collections">All ${I.chevR}</a></div><div class="chips scroll">${D.COLLECTIONS.slice(0,8).map(c=>`<a class="chip" href="#/collections/${c.slug}" data-nav="/collections/${c.slug}">${I[c.icon]||I.book}<span>${c.name}</span></a>`).join("")}</div></div>
  <p class="faint center" style="font-size:.74rem;margin-top:18px">Deep lore, maps &amp; galleries live in the main author archive. <button class="btn sm ghost" data-act="external-archive" style="margin-left:6px">${I.external}Open Abstracto Tales</button></p>`;
};
function bookHero(s, o){
  const r = chapterResolved(o.latestCh);
  const coverUrl = s.cover_image_url || "";
  return `<div class="book-hero" style="${storyAccentVars(s)}">
    <div class="book-hero-cover">
      <img src="${coverUrl}" alt="${esc(s.title)}" />
    </div>
    <div class="book-hero-details">
      <div class="book-hero-meta">${s.genre} \u00b7 ${s.status} \u00b7 ${s.arc}</div>
      <h1>${s.title}</h1>
      <div class="book-hero-author">by ${s.author}</div>
      <div class="book-hero-tagline">${s.tagline || ""}</div>
      
      <div class="progress-line">
        <div class="between" style="margin-bottom:6px">
          <span class="faint" style="font-size:.76rem">${o.pRead} / ${s.chapters.length} chapters read</span>
          <span class="faint" style="font-size:.76rem">${o.pPct}%</span>
        </div>
        ${progressBar(o.pPct)}
      </div>
      
      <div class="cta-row" style="margin-top:16px;">
        <button class="btn primary" data-read="${o.startCh}">${o.lastRead ? I.play + "Continue \u2014 " + o.lastRead.ch.title : I.play + "Start reading"}</button>
        <a class="btn ghost sm" data-nav="/story/${s.slug}/chapters">${I.list}Shelf</a>
        <a class="btn ghost sm" data-nav="/story/${s.slug}/recap">${I.info}Recap</a>
        <a class="btn ghost sm" data-nav="/story/${s.slug}/extras">${I.spark}Extras</a>
      </div>
      
      <div class="between" style="margin-top:14px">
        <span class="faint" style="font-size:.74rem">Latest: <b style="color:var(--text)">${o.latestCh.title}</b> \u00b7 ${axInline(r)}</span>
        ${o.latestCh.publicDate ? `<span class="badge early">${I.hourglass}Public ${fmtDate(o.latestCh.publicDate)}</span>` : ""}
      </div>
    </div>
  </div>`;
}
function buildBookFeed(s){
  const items = [];
  s.chapters.slice(-3).reverse().forEach(c=>{const r=chapterResolved(c);items.push({icon:I.play,color:"var(--accent)",tone:"accent",title:`New chapter \u2014 ${c.title}`,desc:`Chapter ${c.n} \u00b7 ${c.readTime} min${c.state==='early'?' \u00b7 early access for members':''}`,meta:[c.arc,isReadable(r)?"Readable now":accessTag(r)[1]],act:`data-read="${c.id}"`,cta:isReadable(r)?"Read":accessTag(r)[3]});});
  D.STUDIO.announcements.slice(0,2).forEach(a=>{items.push({icon:I.msg,color:"var(--info)",tone:"info",title:a.title,desc:a.body,meta:[a.target,a.when],act:`data-act="studio-post"`,cta:"View"});});
  D.STUDIO.media.filter(m=>m.used>0).slice(0,1).forEach(m=>{items.push({icon:I.spark,color:"var(--key)",tone:"key",thumb:m.fig,title:`New artwork \u2014 ${m.title}`,desc:`Illustration added to ${m.attached}.`,meta:["Art drop","Today"],act:`data-act="studio-post"`,cta:"See"});});
  return items.map(it=>`<button class="feed-item" ${it.act||""}>${it.thumb?`<span class="fthumb">${D.FIG[it.thumb]||""}</span>`:`<span class="fico" style="background:color-mix(in srgb,${it.color} 16%, transparent);color:${it.color}">${it.icon}</span>`}<span class="fbody"><span class="ftop"><span class="ft">${it.title}</span></span><span class="fd">${it.desc}</span><span class="fmeta">${(it.meta||[]).map(m=>`<span>${m}</span>`).join("")}</span></span><span class="btn sm ${it.tone==='accent'?'story':''}" style="flex:0 0 auto">${it.cta}</span></button>`).join("");
}

function themeSwatches(){
  return `<div class="theme-swatches">${THEMES.map(t=>`<button class="swatch ${store.theme===t.id?'active':''}" data-site-theme="${t.id}"><span class="dot" style="background:${t.dot}"></span><span class="nm">${t.name}</span><span class="ck">${I.check}</span></button>`).join("")}</div>`;
}

/* ============ init ============ */
function init(){
  // containers
  if(!document.querySelector(".scrim")){ const d=document.createElement("div"); d.className="scrim"; document.body.appendChild(d); }
  if(!document.querySelector(".toasts")){ const d=document.createElement("div"); d.className="toasts"; document.body.appendChild(d); }
  document.querySelector(".scrim").addEventListener("click",()=>closeSheet());
  delegate();
  applyBgSettings();
  window.addEventListener("hashchange", render);
  render();
  initAuth().then(async ()=>{ await loadBackendLibrary(); saveStore(); render(); }).catch(err=>console.error("Auth bridge init failed", err));
  // welcome toast for first bridge load
  if(!LS.getItem("aether-welcomed")){ LS.setItem("aether-welcomed","1"); setTimeout(()=>toast("Welcome to Aether Pages","This production shell now uses the Aether Pages concept UI; backend wiring comes next.",{icon:"spark",ms:6500}),900); }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();

})();
