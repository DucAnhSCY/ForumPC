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

// Cloudflare Zone API details
const CF_ZONE_ID = '4173baa8fe5b12f5f8214903e1adcf4a';
const CF_API_ENDPOINT = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/images/v1`;

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
    
    // Upload URL for images - using Cloudflare Images API
    config.filebrowserUploadUrl = '/api/upload-cloudflare';
    config.filebrowserImageUploadUrl = '/api/upload-cloudflare';
    config.uploadUrl = '/api/upload-cloudflare';
    
    // Image upload configuration
    config.imageUploadUrl = '/api/upload-cloudflare';
    
    // Custom function for image uploads
    config.cloudflareZoneId = CF_ZONE_ID;
    
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