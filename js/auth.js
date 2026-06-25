// js/auth.js
import { supabaseClient, State } from './config.js';
import { UI, Actions } from './ui.js';
import { CommentsManager } from './comments.js';

const prepareAvatarUpload = async (file) => {
    const originalExtension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fallback = {
        body: file,
        extension: originalExtension === 'jpeg' ? 'jpg' : originalExtension,
        contentType: file.type || undefined
    };
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type.toLowerCase())) {
        return fallback;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
        const image = await new Promise((resolve, reject) => {
            const candidate = new Image();
            candidate.onload = () => resolve(candidate);
            candidate.onerror = () => reject(new Error('The selected avatar could not be decoded.'));
            candidate.src = objectUrl;
        });
        const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: file.type === 'image/png' });
        if (!context) return fallback;
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
        if (!blob || (scale === 1 && blob.size >= file.size)) return fallback;
        return { body: blob, extension: 'webp', contentType: 'image/webp' };
    } catch (error) {
        console.warn('Avatar optimization skipped; uploading the original file.', error);
        return fallback;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};

const getAuthRedirectUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    url.pathname = url.pathname.endsWith('/')
        ? url.pathname
        : url.pathname.replace(/\/[^/]*$/, '/');
    return url.toString();
};

const getPendingSubscriptionAuthReturn = () => {
    try {
        const raw = localStorage.getItem('aether-pages-prod-bridge-v1');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return parsed?.pendingAuthReturn === 'subscription' || parsed?.pendingAuthAction === 'connect-patreon';
    } catch (error) {
        console.warn('Unable to inspect subscription auth return state.', error);
        return false;
    }
};

const clearPendingSubscriptionAuthReturn = () => {
    try {
        const raw = localStorage.getItem('aether-pages-prod-bridge-v1');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        parsed.pendingAuthReturn = '';
        localStorage.setItem('aether-pages-prod-bridge-v1', JSON.stringify(parsed));
    } catch (error) {
        console.warn('Unable to clear subscription auth return state.', error);
    }
};

const getSubscriptionUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '#/vault';
    url.search = '';
    const base = url.pathname.endsWith('/') ? url.pathname : url.pathname.replace(/\/[^/]*$/, '/');
    url.pathname = `${base}subscription.html`;
    return url.toString();
};

const OAUTH_URL_KEYS = [
    'code', 'state', 'error', 'error_code', 'error_description', 'sub_auth', 'sub_route',
    'access_token', 'refresh_token', 'expires_at', 'expires_in', 'provider_token', 'provider_refresh_token', 'token_type'
];

const mergeOAuthParams = (target, raw) => {
    if (!raw) return;
    const cleaned = raw.replace(/^[/#?&]+/, '');
    if (!cleaned || !/[=&]/.test(cleaned)) return;
    const parsed = new URLSearchParams(cleaned);
    for (const [key, value] of parsed.entries()) {
        if (!target.has(key)) target.set(key, value);
    }
};

const collectOAuthCallbackParams = () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (url.hash) {
        const rawHash = url.hash.slice(1);
        if (rawHash.includes('?')) mergeOAuthParams(params, rawHash.slice(rawHash.indexOf('?') + 1));
        if (rawHash.includes('#')) mergeOAuthParams(params, rawHash.slice(rawHash.lastIndexOf('#') + 1));
        const marker = rawHash.match(/(?:^|[?#&])(code|access_token|refresh_token|error|error_code|error_description|sub_auth|sub_route)=/);
        if (marker) mergeOAuthParams(params, rawHash.slice(marker.index).replace(/^[?#&]/, ''));
    }
    return params;
};

const cleanAuthCallbackUrl = () => {
    const url = new URL(window.location.href);
    OAUTH_URL_KEYS.forEach(key => url.searchParams.delete(key));
    if (url.hash) {
        let raw = url.hash.slice(1);
        const marker = raw.match(/(?:^|[?#&])(code|access_token|refresh_token|expires_at|expires_in|provider_token|provider_refresh_token|token_type|state|error|error_code|error_description|sub_auth|sub_route)=/);
        const cutPoints = [raw.indexOf('?'), raw.indexOf('#'), marker ? marker.index : -1].filter(index => index >= 0);
        if (cutPoints.length) raw = raw.slice(0, Math.min(...cutPoints));
        raw = raw.replace(/[?#&]+$/, '');
        url.hash = raw ? `#${raw.startsWith('/') ? raw : `/${raw}`}` : '';
    }
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
};

const consumeOAuthCallback = async () => {
    const params = collectOAuthCallbackParams();
    const callbackError = params.get('error_description') || params.get('error') || params.get('error_code');
    if (callbackError) {
        cleanAuthCallbackUrl();
        throw new Error(callbackError);
    }
    const shouldReturnToSubscription = getPendingSubscriptionAuthReturn() || params.get('sub_auth') === 'google';
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken && supabaseClient.auth.setSession) {
        const { data, error } = await supabaseClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
        cleanAuthCallbackUrl();
        if (shouldReturnToSubscription) {
            clearPendingSubscriptionAuthReturn();
            window.location.replace(getSubscriptionUrl());
        }
        return data?.session || null;
    }
    const code = params.get('code');
    if (!code || !supabaseClient.auth.exchangeCodeForSession) return null;
    const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
    if (error) throw error;
    cleanAuthCallbackUrl();
    if (shouldReturnToSubscription) {
        clearPendingSubscriptionAuthReturn();
        window.location.replace(getSubscriptionUrl());
        return data?.session || null;
    }
    return data?.session || null;
};

export const UserAuth = {
    user: null,
    profile: null,
    mode: 'signin',

    init: async () => {
        const callbackSession = await consumeOAuthCallback();
        const { data: { session } } = await supabaseClient.auth.getSession();
        const activeSession = callbackSession || session;
        if (activeSession) {
            await UserAuth.fetchProfile(activeSession.user);
        } else {
            UI.initAuthLink(null);
            UI.initAdminLink();
            if (State.showR18) {
                State.showR18 = false;
                localStorage.setItem('show_r18', 'false');
                Actions.updateR18ToggleButtons();
            }
        }

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await UserAuth.fetchProfile(session.user);
                UI.closeAuthModal();
                CommentsManager.refreshRenderedThreads();
            } else if (event === 'SIGNED_OUT') {
                UserAuth.user = null;
                UserAuth.profile = null;
                UI.initAuthLink(null);
                UI.initAdminLink();
                UI.closeProfileModal();
                CommentsManager.refreshRenderedThreads();

                if (State.showR18) {
                    State.showR18 = false;
                    localStorage.setItem('show_r18', 'false');
                    Actions.updateR18ToggleButtons();
                    if (document.querySelector('.archive-landing')) {
                        window.Router.handle();
                    } else if (document.getElementById('latest-gallery-grid')) {
                        Actions.renderLatestGalleryGrid();
                    } else if (document.getElementById('gallery-grid')) {
                        Actions.renderGalleryGrid();
                    }
                }
            }
        });
    },

    fetchProfile: async (user) => {
        UserAuth.user = user;
        
        let data = null;
        let error = null;
        const maxRetries = 5;
        const baseDelay = 300; // ms base delay for exponential backoff

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const res = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            data = res.data;
            error = res.error;

            if (!error && data) {
                break;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`Profile sync lag detected. Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!error && data) {
            UserAuth.profile = data;
            UI.initAuthLink(data);
            UI.initAdminLink();
        } else {
            console.error("Profile synchronization failed after all retries.", error);
            UserAuth.profile = null;
            UI.initAuthLink(null);
            UI.initAdminLink();
        }
    },

    toggleMode: () => {
        UserAuth.mode = UserAuth.mode === 'signin' ? 'signup' : 'signin';
        document.getElementById('auth-title').textContent = UserAuth.mode === 'signin' ? 'Enter the Archives' : 'Join the Archives';
        document.getElementById('auth-submit-btn').textContent = UserAuth.mode === 'signin' ? 'Sign In' : 'Sign Up';
        document.getElementById('auth-switch-btn').textContent = UserAuth.mode === 'signin' ? 'New to the Archives? Sign up here.' : 'Already have access? Sign in here.';
        document.getElementById('auth-error').textContent = '';
    },

    handleSubmit: async () => {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const errorEl = document.getElementById('auth-error');

        if (!email || !password) {
            errorEl.textContent = 'Please fill in all fields.';
            return;
        }

        errorEl.textContent = 'Processing...';
        errorEl.style.color = '#fff';

        try {
            let result;
            if (UserAuth.mode === 'signup') {
                result = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getAuthRedirectUrl()
                    }
                });
                if (result.data?.user && result.data?.user?.identities?.length === 0) {
                    throw new Error('This email is already registered. Please sign in.');
                }
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            if (result.error) throw result.error;

            errorEl.style.color = 'var(--success-color)';
            errorEl.textContent = 'Success!';
        } catch (err) {
            errorEl.style.color = 'var(--danger-color)';
            errorEl.textContent = err.message;
        }
    },

    signOut: async () => {
        await supabaseClient.auth.signOut();
    },

    uploadAvatar: async (fileInput) => {
        if (!UserAuth.user || !fileInput.files || !fileInput.files[0]) return;
        
        const statusEl = document.getElementById('avatar-upload-status');
        const file = fileInput.files[0];
        
        statusEl.style.color = '#fff';
        statusEl.textContent = 'Optimizing...';
        
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        const previewImg = document.getElementById('profile-avatar-preview');
        const releasePreviewUrl = () => URL.revokeObjectURL(previewUrl);
        previewImg.onload = releasePreviewUrl;
        previewImg.onerror = releasePreviewUrl;
        previewImg.dataset.imageUrl = previewUrl;
        previewImg.src = previewUrl;

        try {
            const payload = await prepareAvatarUpload(file);
            const fileName = `${UserAuth.user.id}-${Date.now()}.${payload.extension}`;
            statusEl.textContent = 'Uploading...';

            const { error: uploadError } = await supabaseClient.storage
                .from('Reader')
                .upload(fileName, payload.body, {
                    cacheControl: '31536000',
                    contentType: payload.contentType,
                    upsert: false
                });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabaseClient.storage
                .from('Reader')
                .getPublicUrl(fileName);
            const avatarUrl = publicUrlData.publicUrl;
            document.getElementById('profile-avatar').value = avatarUrl;

            const { error: updateError } = await supabaseClient
                .from('profiles')
                .update({
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', UserAuth.user.id);
            if (updateError) throw updateError;

            statusEl.style.color = 'var(--success-color)';
            statusEl.textContent = 'Avatar updated!';
            UserAuth.profile.avatar_url = avatarUrl;
            UI.initAuthLink(UserAuth.profile);
            CommentsManager.refreshRenderedThreads();
            setTimeout(() => statusEl.textContent = '', 2000);
        } catch (error) {
            statusEl.style.color = 'var(--danger-color)';
            statusEl.textContent = 'Failed: ' + error.message;
        } finally {
            fileInput.value = '';
        }
    },

    saveProfile: async () => {
        if (!UserAuth.user) return;

        const msgEl = document.getElementById('profile-msg');
        const name = document.getElementById('profile-name').value.trim();
        const avatar = document.getElementById('profile-avatar').value.trim();
        const bio = document.getElementById('profile-bio').value.trim();

        msgEl.style.color = '#fff';
        msgEl.textContent = 'Saving...';

        const updates = {
            display_name: name,
            avatar_url: avatar,
            bio: bio,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', UserAuth.user.id);

        if (error) {
            msgEl.style.color = 'var(--danger-color)';
            msgEl.textContent = error.message;
        } else {
            msgEl.style.color = 'var(--success-color)';
            msgEl.textContent = 'Profile updated successfully!';
            UserAuth.profile = { ...UserAuth.profile, ...updates };
            UI.initAuthLink(UserAuth.profile);
            CommentsManager.refreshRenderedThreads();
            setTimeout(() => UI.closeProfileModal(), 1500);
        }
    }
};
