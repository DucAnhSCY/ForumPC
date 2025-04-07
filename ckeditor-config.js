/**
 * CKEditor Config File
 * This file configures CKEditor for the forum
 */

// Disable security warnings globally
CKEDITOR.disableAutoInline = true;

// Override the showNotification method to filter out security warnings
CKEDITOR.plugins.registered['notification'] = {
    init: function(editor) {
        editor.showNotification = function(message, type, duration) {
            // Filter out security warning messages
            if (message.includes('This CKEditor') && message.includes('is not secure')) {
                return;
            }
            // Call the original notification method if needed for other messages
            var notification = new CKEDITOR.plugins.notification(editor, { message: message, type: type, duration: duration });
            notification.show();
            return notification;
        };
    }
};

// Global CKEditor configuration
CKEDITOR.editorConfig = function(config) {
    // Enable upload image and media features
    config.extraPlugins = 'image,embed,autoembed,uploadimage';
    
    // Configure embedding
    config.embed_provider = '//ckeditor.iframe.ly/api/oembed?url={url}&callback={callback}';
    
    // Set content CSS
    config.contentsCss = ['https://cdn.ckeditor.com/4.16.2/standard-all/contents.css'];
    
    // Allow all content
    config.allowedContent = true;
    
    // Set height
    config.height = 300;
    
    // Upload URL for images
    config.filebrowserUploadUrl = 'https://api.ducanhweb.me/api/Upload/Image';
    config.filebrowserImageUploadUrl = 'https://api.ducanhweb.me/api/Upload/Image';
    config.uploadUrl = 'https://api.ducanhweb.me/api/Upload/Image';
    
    // Image upload configuration
    config.imageUploadUrl = 'https://api.ducanhweb.me/api/Upload/Image';
    
    // Disable the security notification message
    config.disableNativeSpellChecker = false;
    config.removePlugins = 'scayt,wsc';
    
    // Disable security notifications
    config.notification = { notificationDuration: 0 };
    
    // Minimize automatic paragraph tags
    config.enterMode = CKEDITOR.ENTER_BR;
    config.autoParagraph = false;
    config.forceSimpleAmpersand = true;
    
    // Toolbar configuration
    config.toolbarGroups = [
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
        { name: 'links' },
        { name: 'insert' },
        { name: 'styles' },
        { name: 'colors' }
    ];
};

// Global API key for the application
const api_key = 'https://api.ducanhweb.me/api/';

// Default CKEditor configuration for the thread and post editor
function getDefaultConfig() {
    return {
        // Define toolbar groups
        toolbar: [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Blockquote'] },
            { name: 'links', items: ['Link', 'Unlink'] },
            { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
            { name: 'styles', items: ['Format'] },
            { name: 'tools', items: ['Maximize'] },
            { name: 'document', items: ['Source'] }
        ],
        // Enable content filtering to prevent XSS
        extraAllowedContent: 'img[src,alt,width,height,style]; iframe[*]; video[*]; source[*]',
        removeButtons: '',
        // Make the editor adapt to the container size
        width: '100%',
        // Format tags available in the format dropdown
        format_tags: 'p;h1;h2;h3;pre',
        // Remove unnecessary plugins for better performance
        removePlugins: 'elementspath,save,font',
        // Set the default language
        language: 'en',
        // Configure file browser
        filebrowserBrowseUrl: '',
        filebrowserUploadUrl: '',
        // Custom styling
        contentsCss: ['ckeditor-custom.css'],
        // Advanced content filtering
        allowedContent: true,
        disableNativeSpellChecker: false,
        // Image upload configuration for DigitalOcean Spaces
        filebrowserImageUploadUrl: `${api_key}Upload/ImageSpaces`,
        // Setup function to handle initialization
        on: {
            instanceReady: function(evt) {
                hideCKEditorSecurityNotification();
            }
        }
    };
}

// Comment editor configuration (simpler toolbar)
function getCommentEditorConfig() {
    const config = getDefaultConfig();
    // Simplified toolbar for comments
    config.toolbar = [
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
        { name: 'links', items: ['Link'] },
        { name: 'insert', items: ['Image'] },
        { name: 'tools', items: ['Maximize'] }
    ];
    config.height = '150px';
    return config;
}

// Initialize CKEditor for the post editor
function initPostEditor() {
    if (CKEDITOR.instances['post-input']) {
        CKEDITOR.instances['post-input'].destroy();
    }
    CKEDITOR.replace('post-input', getDefaultConfig());
}

// Initialize CKEditor for all comment editors
function initCommentEditors() {
    document.querySelectorAll('.comment-editor').forEach(editor => {
        if (editor.id && !CKEDITOR.instances[editor.id]) {
            CKEDITOR.replace(editor.id, getCommentEditorConfig());
        }
    });
}

// Function to initialize a single comment editor
function initCommentEditor(editorId) {
    if (CKEDITOR.instances[editorId]) {
        CKEDITOR.instances[editorId].destroy();
    }
    CKEDITOR.replace(editorId, getCommentEditorConfig());
}

// Hide CKEditor security notification
function hideCKEditorSecurityNotification() {
    const notification = document.querySelector('.cke_notification_info');
    if (notification) {
        notification.style.display = 'none';
    }
} 