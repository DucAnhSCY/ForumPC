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
    
    // Upload URL for images - this will be set from main.js
    config.filebrowserUploadUrl = 'http://localhost:5083/api/Upload/Image';
    
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