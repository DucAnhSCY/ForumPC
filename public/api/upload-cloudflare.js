/**
 * Cloudflare Images API Upload Proxy
 * 
 * This file handles secure uploading to Cloudflare Images
 * It should be secured with proper authentication in production
 */

// Define constants for Cloudflare API
const CF_ZONE_ID = '4173baa8fe5b12f5f8214903e1adcf4a';
const CF_API_ENDPOINT = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/images/v1`;

// IMPORTANT: API token should NEVER be hardcoded here
// It should be accessed via environment variables in the server context
// The token will be accessed from context.env in the serverless function

/**
 * Handles the upload request from CKEditor to Cloudflare Images
 * @param {Request} request - The incoming request with file data
 * @returns {Response} - JSON response with upload result
 */
async function handleUpload(request) {
    try {
        // Extract the file from the form data
        const formData = await request.formData();
        const file = formData.get('upload'); // CKEditor uses 'upload' as the file field name
        
        if (!file) {
            return new Response(
                JSON.stringify({
                    uploaded: 0,
                    error: { message: 'No file provided' }
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Create new FormData for Cloudflare
        const cfFormData = new FormData();
        cfFormData.append('file', file);
        cfFormData.append('requireSignedURLs', 'false');
        
        // The API token should be obtained from environment variables
        // This will be handled by the Cloudflare Functions context
        const apiToken = process.env.CF_API_TOKEN;
        
        if (!apiToken) {
            console.error('API token not found in environment variables');
            return new Response(
                JSON.stringify({
                    uploaded: 0,
                    error: { message: 'Server configuration error' }
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Make request to Cloudflare Images API
        const response = await fetch(CF_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`
            },
            body: cfFormData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('Cloudflare upload error:', data.errors);
            return new Response(
                JSON.stringify({
                    uploaded: 0,
                    error: { message: 'Upload to Cloudflare failed' }
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Format response for CKEditor
        return new Response(
            JSON.stringify({
                uploaded: 1,
                fileName: file.name,
                url: data.result.variants[0]
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in upload handler:', error);
        return new Response(
            JSON.stringify({
                uploaded: 0,
                error: { message: 'Internal server error' }
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Export the handler for use with serverless functions
export default handleUpload; 