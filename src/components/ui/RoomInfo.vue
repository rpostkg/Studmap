<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18nStore } from '../../stores/i18n';
import { marked } from 'marked';
import { Edit2, Save, X, AlertTriangle, Bold, Italic, List, Link, Heading1, Heading2, Heading3 } from 'lucide-vue-next';

const props = defineProps<{
  roomId: string;
  roomName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const i18n = useI18nStore();
const mode = ref<'view' | 'edit'>('view');
const isLoading = ref(true);
const serverContent = ref('');
const userContent = ref('');
const originalServerContent = ref(''); // To track if server updated
const hasConflict = ref(false);
const editorRef = ref<HTMLTextAreaElement | null>(null);

const storageKey = computed(() => `room_info_${props.roomId}_${i18n.locale}`);

// Load content
const loadContent = async () => {
    isLoading.value = true;
    try {
        const baseUrl = import.meta.env.BASE_URL;
        // Ensure no double slashes if BASE_URL ends with /
        const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const url = `${prefix}rooms/${props.roomId}/info.${i18n.locale}.md`;
        
        const response = await fetch(url);
        
        let text = '';
        let isHtml = false;
        
        if (response.ok) {
            text = await response.text();
            // Robust check for HTML content (SPA fallback)
            const trimmed = text.trim().toLowerCase();
            if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
                isHtml = true;
            }
        }

        if (response.ok && !isHtml) {
            serverContent.value = text;
        } else {
            // Try fetching standard template
            try {
                const templateUrl = `${prefix}standard_template/info.${i18n.locale}.md`;
                const templateResponse = await fetch(templateUrl);
                if (templateResponse.ok) {
                     serverContent.value = await templateResponse.text();
                } else {
                     throw new Error('Template not found');
                }
            } catch {
                // Hard fallback if template fetch fails
                 serverContent.value = `# {roomName}\n\n`;
            }
        }
        
        // Apply variable replacement to server content (applies to both specific files and templates)
        serverContent.value = serverContent.value.replace(/{roomName}/g, props.roomName);

        // Check local storage
        const saved = localStorage.getItem(storageKey.value);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                userContent.value = parsed.content;
                
                // CRITICAL FIX: Conflict Detection
                // We must compare the *stored* original server content with the *current* server content.
                // If they differ, it means the server has updated since the user last saved.
                const storedOriginal = parsed.originalServer;
                
                if (storedOriginal && storedOriginal !== serverContent.value) {
                    hasConflict.value = true;
                    // We keep originalServerContent as the *stored* one so we can compare later if needed,
                    // or we can update it only when user acknowledges.
                    // Actually, for the UI to show "Update Available", we just need the flag.
                    originalServerContent.value = storedOriginal;
                } else {
                     // No conflict, sync originalServerContent to current
                     originalServerContent.value = serverContent.value;
                }
                
            } catch (e) {
                // Legacy or invalid format, reset
                userContent.value = saved; // fallback
                originalServerContent.value = serverContent.value;
            }
        } else {
            // No saved data, just show server content
            userContent.value = serverContent.value;
            originalServerContent.value = serverContent.value;
        }

    } catch (e) {
        console.error('Failed to load room info', e);
        // Fallback to template on error
        serverContent.value = `# ${props.roomName}\n\n`;
        userContent.value = serverContent.value;
        originalServerContent.value = serverContent.value;
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadContent);
watch(() => i18n.locale, loadContent);

const renderedContent = computed(() => {
    let content = mode.value === 'view' ? userContent.value : serverContent.value;
    
    // Fix image paths to include BASE_URL
    const baseUrl = import.meta.env.BASE_URL;
    const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    // Replace absolute paths /... with prefix...
    // Example: ![alt](/rooms/img.png) -> ![alt](/studmap/rooms/img.png)
    content = content.replace(/!\[([^\]]*)\]\(\/([^)]*)\)/g, (match, alt, path) => {
        // If path already starts with the prefix (excluding leading slash), don't add it again?
        // Simpler: just prepend prefix.
        // Remove leading slash from path if it exists to clean up
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `![${alt}](${prefix}${cleanPath})`;
    });

    return marked(content); 
});

const save = () => {
    // When saving, we update the stored originalServerContent to match the CURRENT server content.
    // This "acknowledges" the current server state as the base for this new edit.
    localStorage.setItem(storageKey.value, JSON.stringify({
        content: userContent.value,
        originalServerContent: serverContent.value 
    }));
    originalServerContent.value = serverContent.value;
    hasConflict.value = false;
    mode.value = 'view';
};

const cancel = () => {
    // Revert to saved or server
    const saved = localStorage.getItem(storageKey.value);
    if(saved) {
         try {
            const parsed = JSON.parse(saved);
            userContent.value = parsed.content;
         } catch {
             userContent.value = saved;
         }
    } else {
        userContent.value = serverContent.value;
    }
    mode.value = 'view';
}

const acceptServerUpdate = () => {
    userContent.value = serverContent.value;
    originalServerContent.value = serverContent.value; 
    save(); // This will overwrite user's custom notes with server's new version
};

const keepMyVersion = () => {
    // Just update the base reference so the warning goes away
    originalServerContent.value = serverContent.value; // Important: Acknowledge the update
    
    // Update storage with NEW originalServerContent but KEEP userContent
    localStorage.setItem(storageKey.value, JSON.stringify({
        content: userContent.value,
        originalServerContent: serverContent.value 
    }));
    
    hasConflict.value = false;
};

// Editor Toolbar Actions
const insertText = (before: string, after: string = '') => {
    if (!editorRef.value) return;
    
    const textarea = editorRef.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selection + after + text.substring(end);
    userContent.value = newText;
    
    nextTick(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selection.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
};
</script>

<template>
  <div class="room-info-wrapper">
    <div class="room-info-backdrop" @click="emit('close')"></div>
    <div class="room-info-container glass">
    <div class="info-header">
      <div>
        <h3 class="modal-title">{{ roomName }}</h3>
        <p class="modal-subtitle">{{ i18n.t('ui.info') }}</p>
      </div>
      <div class="header-actions">
        <button v-if="mode === 'view'" @click="mode = 'edit'" class="icon-btn" :title="i18n.t('ui.edit')">
          <Edit2 class="icon" />
        </button>
        <button v-else @click="save" class="icon-btn save-btn" :title="i18n.t('ui.save')">
          <Save class="icon" />
        </button>
        <button @click="emit('close')" class="icon-btn close-btn" :title="i18n.t('ui.close')">
          <X class="icon" />
        </button>
      </div>
    </div>

    <!-- Conflict Warning -->
    <div v-if="hasConflict && mode === 'view'" class="conflict-banner">
      <div class="conflict-content">
        <AlertTriangle class="icon warning-icon" />
        <span>{{ i18n.t('ui.update_available') }}</span>
      </div>
      <div class="conflict-actions">
        <button @click="acceptServerUpdate" class="sm-btn">{{ i18n.t('ui.overwrite_with_server') }}</button>
        <button @click="keepMyVersion" class="sm-btn">{{ i18n.t('ui.keep_my_version') }}</button>
      </div>
    </div>

    <!-- Editor Toolbar -->
    <div v-if="mode === 'edit'" class="editor-toolbar">
        <button @click="insertText('**', '**')" class="toolbar-btn" title="Bold"><Bold class="sm-icon"/></button>
        <button @click="insertText('*', '*')" class="toolbar-btn" title="Italic"><Italic class="sm-icon"/></button>
        <div class="divider"></div>
        <button @click="insertText('# ')" class="toolbar-btn" title="Heading 1"><Heading1 class="sm-icon"/></button>
        <button @click="insertText('## ')" class="toolbar-btn" title="Heading 2"><Heading2 class="sm-icon"/></button>
        <button @click="insertText('### ')" class="toolbar-btn" title="Heading 3"><Heading3 class="sm-icon"/></button>
        <div class="divider"></div>
        <button @click="insertText('- ')" class="toolbar-btn" title="List"><List class="sm-icon"/></button>
        <button @click="insertText('[', '](url)')" class="toolbar-btn" title="Link"><Link class="sm-icon"/></button>
    </div>

    <div class="info-content scrollbar-hide" :class="{ 'is-editing': mode === 'edit' }">
      <div v-if="isLoading" class="loading">{{ i18n.t('ui.loading') }}...</div>
      
      <div v-else-if="mode === 'view'" class="markdown-body" v-html="renderedContent"></div>
      
      <div v-else class="editor-container">
        <textarea ref="editorRef" v-model="userContent" class="markdown-editor" :placeholder="i18n.t('ui.enter_notes')"></textarea>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>

.room-info-wrapper {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: flex-end; /* Mobile: slide up */
  justify-content: center;
  pointer-events: auto;
}

.room-info-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    animation: fade-in 0.2s ease-out;
}

.room-info-container {
  position: relative;
  width: 100%;
  max-height: 90vh;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  /* background removed to allow glass effect */
  display: flex;
  flex-direction: column;
  animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--foreground);
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  z-index: 10;
  overflow: hidden; /* Fix border radius & content overflow */
}

/* Glass effect fallback if not checking main.css */
/* .room-info-container.glass { ... } handled by main.css */

.dark .room-info-container {
    /* dark mode glass handled by main.css .dark .glass */
    color: #fff;
}

@media (min-width: 768px) {
    .room-info-wrapper {
        align-items: center; /* Desktop: center */
    }

    .room-info-container {
        width: 600px;
        height: 80vh;
        max-height: 800px;
        border-radius: 1.25rem; /* Match SettingsModal */
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scale-up {
  from { 
    opacity: 0;
    transform: translateY(10%) scale(0.96); /* Mobile slide up hint */
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@media (min-width: 768px) {
    @keyframes scale-up {
        from { 
            opacity: 0;
            transform: scale(0.96);
        }
        to { 
            opacity: 1;
            transform: scale(1);
        }
    }
}


.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem; /* Match SettingsModal padding */
  margin-bottom: 0; /* Content padding handles spacing */
  /* border-bottom removed for clean glass look, or keep faint */
  border-bottom: 1px solid rgba(0,0,0,0.05); 
}
.dark .info-header {
    border-bottom: 1px solid rgba(255,255,255,0.05); 
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.icon-btn {
  background: rgba(0,0,0,0.05); /* Match close-btn style */
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%; /* Circle like Settings */
  color: var(--foreground);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
    transform: scale(1.05);
    background: rgba(0,0,0,0.1);
}

.dark .icon-btn {
    background: rgba(255,255,255,0.1);
}
.dark .icon-btn:hover {
    background: rgba(255,255,255,0.15);
}

.close-btn:hover {
    transform: rotate(90deg);
    background: rgba(239, 68, 68, 0.1); /* Slight red tint on hover for close? Or just rotate */
    color: var(--destructive);
}
.save-btn:hover {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
}

.icon {
    width: 1.25rem;
    height: 1.25rem;
}

.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}
.info-content.is-editing {
    padding: 0; /* Remove padding for full-width editor */
    display: flex;
    flex-direction: column;
}

.markdown-body {
    line-height: 1.6;
}

/* Basic Markdown Styles usually provided by a global CSS or library, 
   but adding some defaults here just in case */
:deep(h1), :deep(h2), :deep(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
}
:deep(p) { margin-bottom: 1em; }
:deep(ul), :deep(ol) { margin-left: 1.5em; margin-bottom: 1em; }
:deep(table) { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 1em 0; 
}
:deep(th), :deep(td) {
    border: 1px solid var(--border, #ddd);
    padding: 0.5rem;
    text-align: left;
}
:deep(th) { background: rgba(0,0,0,0.02); }
:deep(img) {
    max-width: 100%;
    border-radius: 0.5rem;
    margin: 1rem 0;
}
:deep(blockquote) {
    border-left: 4px solid var(--primary, #3b82f6);
    margin: 1rem 0;
    padding-left: 1rem;
    color: var(--muted-foreground, #666);
    font-style: italic;
}

.editor-toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.3); /* Transparent toolbar */
    overflow-x: auto;
}
.dark .editor-toolbar {
    background: rgba(0,0,0,0.2);
}

.toolbar-btn {
    padding: 0.4rem;
    border-radius: 0.4rem;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.toolbar-btn:hover {
    background: rgba(0,0,0,0.05);
}
.dark .toolbar-btn:hover {
    background: rgba(255,255,255,0.1);
}

.divider {
    width: 1px;
    background: var(--border);
    margin: 0 0.25rem;
}

.sm-icon {
    width: 1rem;
    height: 1rem;
}

.editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.markdown-editor {
    flex: 1;
    width: 100%;
    padding: 1.5rem;
    border: none;
    background: transparent;
    color: inherit;
    font-family: monospace;
    resize: none;
    outline: none; 
}

.conflict-banner {
    background: rgba(255, 247, 237, 0.9);
    color: #9a3412;
    padding: 0.75rem 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #fed7aa;
}
.dark .conflict-banner {
    background: rgba(67, 20, 7, 0.9);
    color: #ffedd5;
    border-color: #7c2d12;
}

.conflict-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
}

.conflict-actions {
    display: flex;
    gap: 0.5rem;
}

.sm-btn {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    cursor: pointer;
}
.sm-btn:hover {
    background: rgba(0,0,0,0.05);
}
</style>
