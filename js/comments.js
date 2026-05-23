// js/comments.js
import { supabaseClient, Utils } from './config.js';
import { UserAuth } from './auth.js';
import { UI } from './ui.js';

export const CommentsManager = {
    activeTargetId: null,
    activeTargetType: null,
    activeContext: {},
    containerPrefix: 'drawer', 

    openDrawer: async (targetId, targetType, title = 'Discussion', context = {}, prefix = 'drawer') => {
        CommentsManager.activeTargetId = targetId;
        CommentsManager.activeTargetType = targetType;
        CommentsManager.activeContext = context;
        CommentsManager.containerPrefix = prefix;
        
        if (prefix === 'drawer') {
            const drawer = document.getElementById('comments-drawer');
            if (drawer) {
                drawer.classList.add('open');
            }
            if (window.innerWidth > 900) { document.body.classList.add('drawer-open'); }
            const titleEl = document.getElementById('drawer-title');
            if (titleEl) titleEl.textContent = title;
        } else {
            const titleEl = document.getElementById(prefix + '-title');
            if (titleEl) titleEl.textContent = title;
        }

        CommentsManager.renderInput();
        await CommentsManager.loadThread();
    },

    closeDrawer: () => {
        if (CommentsManager.containerPrefix === 'drawer') {
            const drawer = document.getElementById('comments-drawer');
            if (drawer) {
                drawer.classList.remove('open');
            }
            document.body.classList.remove('drawer-open');
        }
        CommentsManager.activeTargetId = null;
        CommentsManager.activeTargetType = null;
        CommentsManager.activeContext = {};
        CommentsManager.containerPrefix = 'drawer';
    },

    renderInput: () => {
        const inputArea = document.getElementById(CommentsManager.containerPrefix + '-input-area');
        if (!inputArea) return;
        
        if (UserAuth.user && UserAuth.profile) {
            let imageHtml = '';
            if (CommentsManager.activeContext.imageUrl) {
                imageHtml = `<img src="${CommentsManager.activeContext.imageUrl}" class="comment-image-preview" alt="Referenced Image">`;
            }

            let contextLabel = '';
            if (CommentsManager.activeContext.paragraphIndex !== undefined) {
                contextLabel = `<div style="font-size:0.75rem; color:var(--accent-color); margin-bottom:0.5rem; text-transform:uppercase;">Commenting on Paragraph ${CommentsManager.activeContext.paragraphIndex + 1}</div>`;
            }

            inputArea.innerHTML = `
                <div class="comment-input-area" style="flex-direction: column;">
                    ${contextLabel}
                    ${imageHtml}
                    <div style="display: flex; gap: 1rem; width: 100%;">
                        <img src="${UserAuth.profile.avatar_url || 'https://via.placeholder.com/40'}" class="comment-avatar">
                        <div style="flex: 1;">
                            <textarea id="${CommentsManager.containerPrefix}-comment-text" class="comment-textarea" placeholder="Share your thoughts..."></textarea>
                            <div class="comment-submit-container" style="margin-top: 0.8rem;">
                                <button class="btn-large" style="padding: 0.5rem 1.5rem; font-size: 0.8rem;" onclick="CommentsManager.postComment()">Post Comment</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            inputArea.innerHTML = `
                <div class="comment-login-prompt">
                    <p style="margin-bottom: 1rem;">You must enter the Archives to join the discussion.</p>
                    <button class="btn-large" style="margin: 0 auto; padding: 0.5rem 1.5rem; font-size: 0.8rem;" onclick="UI.openAuthModal()">Sign In</button>
                </div>
            `;
        }
    },

    loadThread: async () => {
        const threadArea = document.getElementById(CommentsManager.containerPrefix + '-thread-area');
        if (!threadArea) return;
        threadArea.innerHTML = '<div style="color: #666; text-align: center;">Loading records...</div>';

        try {
            let query = supabaseClient
                .from('comments')
                .select(`
                    id, content, created_at, user_id, metadata,
                    profiles!comments_user_id_fkey ( display_name, avatar_url, role )
                `)
                .eq('target_id', CommentsManager.activeTargetId)
                .eq('target_type', CommentsManager.activeTargetType)
                .order('created_at', { ascending: true });

            if (CommentsManager.activeContext.paragraphIndex !== undefined) {
                query = query.contains('metadata', { paragraphIndex: CommentsManager.activeContext.paragraphIndex });
            }
            if (CommentsManager.containerPrefix === 'lightbox' && CommentsManager.activeContext.imageUrl) {
                query = query.contains('metadata', { imageUrl: CommentsManager.activeContext.imageUrl });
            }

            const { data: comments, error } = await query;

            if (error) throw error;

            if (!comments || comments.length === 0) {
                threadArea.innerHTML = '<div style="color: #666; text-align: center; padding: 1rem 0;">No comments found.</div>';
                return;
            }

            let html = '';
            comments.forEach((c) => {
                const author = c.profiles || {};
                const isAdmin = author.role === 'admin';
                const dateString = new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                
                let attachmentHtml = '';
                if (c.metadata && c.metadata.imageUrl && CommentsManager.containerPrefix !== 'lightbox') {
                    attachmentHtml = `<img src="${c.metadata.imageUrl}" class="comment-attachment">`;
                }

                const isOwnComment = UserAuth.user && c.user_id === UserAuth.user.id;
                let actionHtml = '';
                if (isOwnComment) {
                    actionHtml = `
                        <div class="comment-actions" style="margin-top:0.5rem; display:flex; gap:10px;">
                            <button class="btn-large" style="padding: 2px 8px; font-size: 0.7rem;" onclick="CommentsManager.editComment('${c.id}', \`${Utils.escapeHtml(c.content.replace(/\\/g, '\\\\').replace(/\`/g, '\\`'))}\`)">Edit</button>
                            <button class="btn-large" style="padding: 2px 8px; font-size: 0.7rem; background: rgba(255,0,0,0.1); color: #ff6b6b; border-color: #ff6b6b;" onclick="CommentsManager.deleteComment('${c.id}')">Delete</button>
                        </div>
                    `;
                }

                html += `
                    <div class="comment-item" id="comment-${c.id}">
                        <img src="${author.avatar_url || 'https://via.placeholder.com/40'}" class="comment-avatar">
                        <div class="comment-body" style="flex:1;">
                            <div class="comment-meta">
                                <div class="comment-author ${isAdmin ? 'admin-badge' : ''}">
                                    ${Utils.escapeHtml(author.display_name || 'Anonymous')} ${isAdmin ? '<i class="fas fa-crown" style="font-size:0.7rem; margin-left:4px;"></i>' : ''}
                                </div>
                                <div class="comment-date">${dateString}</div>
                            </div>
                            ${attachmentHtml}
                            <div class="comment-text" id="comment-text-${c.id}">${Utils.escapeHtml(c.content)}</div>
                            ${actionHtml}
                            <div id="comment-edit-area-${c.id}" style="display:none; margin-top: 0.8rem;">
                                <textarea id="comment-edit-input-${c.id}" class="comment-textarea"></textarea>
                                <div style="margin-top: 0.5rem; display:flex; gap:10px;">
                                    <button class="btn-large" style="padding: 4px 12px; font-size: 0.75rem;" onclick="CommentsManager.saveEdit('${c.id}')">Save</button>
                                    <button class="btn-large" style="padding: 4px 12px; font-size: 0.75rem; border-color: #888; color: #888;" onclick="CommentsManager.cancelEdit('${c.id}')">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            threadArea.innerHTML = html;

        } catch (err) {
            console.error('Failed to load comments:', err);
            threadArea.innerHTML = '<div style="color: var(--danger-color); text-align: center;">Failed to load discussions.</div>';
        }
    },

    postComment: async () => {
        const inputEl = document.getElementById(CommentsManager.containerPrefix + '-comment-text');
        const content = inputEl ? inputEl.value.trim() : '';

        if (!content) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const metadata = {};
            if (CommentsManager.activeContext.paragraphIndex !== undefined) {
                metadata.paragraphIndex = CommentsManager.activeContext.paragraphIndex;
            }
            if (CommentsManager.activeContext.imageUrl) {
                metadata.imageUrl = CommentsManager.activeContext.imageUrl;
            }

            const { error } = await supabaseClient
                .from('comments')
                .insert({
                    user_id: UserAuth.user.id,
                    target_id: CommentsManager.activeTargetId,
                    target_type: CommentsManager.activeTargetType,
                    content: content,
                    metadata: metadata
                });

            if (error) throw error;

            if (inputEl) inputEl.value = '';
            await CommentsManager.loadThread();
        } catch (err) {
            console.error('Post error:', err);
            alert('Failed to post comment. Please try again.');
        }
    },

    refreshRenderedThreads: () => {
        if (CommentsManager.activeTargetId) {
            CommentsManager.renderInput();
        }
    },

    editComment: (id, currentContent) => {
        const textEl = document.getElementById(`comment-text-${id}`);
        if (textEl) textEl.style.display = 'none';
        const actionEls = document.querySelector(`#comment-${id} .comment-actions`);
        if (actionEls) actionEls.style.display = 'none';
        
        const editArea = document.getElementById(`comment-edit-area-${id}`);
        if (editArea) editArea.style.display = 'block';
        const editInput = document.getElementById(`comment-edit-input-${id}`);
        if (editInput) editInput.value = currentContent;
    },

    cancelEdit: (id) => {
        const textEl = document.getElementById(`comment-text-${id}`);
        if (textEl) textEl.style.display = 'block';
        const actionEls = document.querySelector(`#comment-${id} .comment-actions`);
        if (actionEls) actionEls.style.display = 'flex';
        
        const editArea = document.getElementById(`comment-edit-area-${id}`);
        if (editArea) editArea.style.display = 'none';
    },

    saveEdit: async (id) => {
        const editInput = document.getElementById(`comment-edit-input-${id}`);
        const newContent = editInput ? editInput.value.trim() : '';
        if (!newContent) { alert('Comment cannot be empty.'); return; }
        
        try {
            const { error } = await supabaseClient
                .from('comments')
                .update({ content: newContent })
                .eq('id', id);

            if (error) throw error;
            await CommentsManager.loadThread();
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to update comment.');
        }
    },

    deleteComment: async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            const { error } = await supabaseClient
                .from('comments')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await CommentsManager.loadThread();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete comment.');
        }
    }
};
