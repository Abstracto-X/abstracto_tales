import { supabaseClient, SubState } from './state.js';
import { SubDB } from './db.js';
import { SubUI } from './ui.js';
import { SubRouter } from './router.js';

const getAuthRedirectUrl = () => {
    const url = new URL(window.location.href);
    url.hash = '';
    url.search = '';
    return url.toString();
};

export const SubAuth = {
    init: async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) await SubAuth.fetchProfile(session.user);
        SubAuth.syncAccountChip();

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await SubAuth.fetchProfile(session.user);
                await SubDB.getMyEntitlements();
                SubUI.closeAuthDialog();
            } else {
                SubState.user = null;
                SubState.profile = null;
                SubState.entitlements = [];
            }
            SubAuth.syncAccountChip();
            if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) SubRouter.handle();
        });
    },

    fetchProfile: async (user) => {
        SubState.user = user;
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
        if (error) {
            console.warn('Subscription profile lookup failed:', error.message || error);
            SubState.profile = { id: user.id, display_name: user.email?.split('@')[0] || 'Reader', role: 'reader' };
        } else {
            SubState.profile = data;
        }
        await SubDB.getMyEntitlements();
    },

    syncAccountChip: () => {
        const chip = document.getElementById('sub-account-chip');
        if (!chip) return;
        if (!SubState.user) {
            chip.innerHTML = '<button type="button" data-sub-open-auth>Sign in</button>';
        } else {
            const name = SubState.profile?.display_name || SubState.user.email || 'Reader';
            const active = SubState.entitlements.filter(item => item.status === 'active' || item.is_active).length;
            chip.innerHTML = `<button type="button" data-sub-route="account"><span>${name}</span><em>${active ? `${active} active grant${active > 1 ? 's' : ''}` : 'Reader'}</em></button>`;
        }
    },

    setMode: (mode) => {
        SubState.authMode = mode;
        const title = document.getElementById('sub-auth-title');
        const submit = document.getElementById('sub-auth-submit');
        const toggle = document.getElementById('sub-auth-toggle');
        const password = document.getElementById('sub-auth-password');
        if (title) title.textContent = mode === 'signup' ? 'Join the library' : 'Sign in';
        if (submit) submit.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
        if (toggle) toggle.textContent = mode === 'signup' ? 'Already have access? Sign in.' : 'Need an account? Join the library.';
        if (password) password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
        SubUI.setInlineStatus('sub-auth-message', '');
    },

    toggleMode: () => SubAuth.setMode(SubState.authMode === 'signin' ? 'signup' : 'signin'),

    handleSubmit: async () => {
        const email = document.getElementById('sub-auth-email')?.value.trim();
        const password = document.getElementById('sub-auth-password')?.value;
        if (!email || !password) {
            SubUI.setInlineStatus('sub-auth-message', 'Enter both email and password.', 'error');
            return;
        }
        try {
            SubUI.setInlineStatus('sub-auth-message', 'Checking credentials...', 'info');
            const result = SubState.authMode === 'signup'
                ? await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: getAuthRedirectUrl() } })
                : await supabaseClient.auth.signInWithPassword({ email, password });
            if (result.error) throw result.error;
            SubUI.setInlineStatus('sub-auth-message', SubState.authMode === 'signup' ? 'Check your email to confirm the account.' : 'Signed in.', 'success');
        } catch (err) {
            SubUI.setInlineStatus('sub-auth-message', err.message || 'Authentication failed.', 'error');
        }
    },

    signOut: async () => {
        await supabaseClient.auth.signOut();
        SubUI.toast('Signed out of the member library.');
    }
};
