// js/auth.js
import { supabaseClient } from './config.js';
import { UI } from './ui.js';
import { CommentsManager } from './comments.js';

export const UserAuth = {
    user: null,
    profile: null,
    mode: 'signin',

    init: async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            await UserAuth.fetchProfile(session.user);
        } else {
            UI.initAuthLink(null);
            UI.initAdminLink();
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
                result = await supabaseClient.auth.signUp({ email, password });
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${UserAuth.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        statusEl.style.color = '#fff';
        statusEl.textContent = 'Uploading...';
        
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        const previewImg = document.getElementById('profile-avatar-preview');
        previewImg.onload = () => URL.revokeObjectURL(previewUrl);
        previewImg.src = previewUrl;
        
        // Upload to Supabase
        const { error: uploadError } = await supabaseClient.storage
            .from('Reader')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });
            
        if (uploadError) {
            statusEl.style.color = 'var(--danger-color)';
            statusEl.textContent = 'Failed: ' + uploadError.message;
            fileInput.value = ''; // Reset
            return;
        }
        
        const { data: publicUrlData } = supabaseClient.storage
            .from('Reader')
            .getPublicUrl(filePath);
            
        const avatarUrl = publicUrlData.publicUrl;
        document.getElementById('profile-avatar').value = avatarUrl;
        
        // Immediately save to profile in backend
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', UserAuth.user.id);
            
        if (updateError) {
            statusEl.style.color = 'var(--danger-color)';
            statusEl.textContent = 'Backend error: ' + updateError.message;
        } else {
            statusEl.style.color = 'var(--success-color)';
            statusEl.textContent = 'Avatar updated!';
            UserAuth.profile.avatar_url = avatarUrl;
            UI.initAuthLink(UserAuth.profile);
            CommentsManager.refreshRenderedThreads();
            setTimeout(() => statusEl.textContent = '', 2000);
        }
        fileInput.value = ''; // Reset input
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
