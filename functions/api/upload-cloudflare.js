/**
 * Cloudflare Worker for handling image uploads to Cloudflare Images
 */

// Configure the Cloudflare API details
const CF_ZONE_ID = '4173baa8fe5b12f5f8214903e1adcf4a';
const CF_API_ENDPOINT = `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/images/v1`;

export async function onRequest(context) {
    // Get the request object
    const request = context.request;
    
    // Check if this is a POST request
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({
            uploaded: 0,
            error: { message: 'Method not allowed' }
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        // Extract the file from the form data
        const formData = await request.formData();
        
        // CKEditor specific: get the upload file using CKEditor's field name
        const file = formData.get('upload');
        
        if (!file) {
            return new Response(JSON.stringify({
                uploaded: 0,
                error: { message: 'No file provided' }
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create new FormData for Cloudflare Images API
        const cfFormData = new FormData();
        cfFormData.append('file', file);
        cfFormData.append('requireSignedURLs', 'false');
        
        // Get the API token from environment variable
        // This should be set in your Cloudflare Workers configuration
        const apiToken = context.env.CF_API_TOKEN;
        
        if (!apiToken) {
            return new Response(JSON.stringify({
                uploaded: 0,
                error: { message: 'API token not configured' }
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
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
            return new Response(JSON.stringify({
                uploaded: 0,
                error: { message: 'Upload to Cloudflare failed' }
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Format response for CKEditor
        return new Response(JSON.stringify({
            uploaded: 1,
            fileName: file.name,
            url: data.result.variants[0]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error in upload handler:', error);
        return new Response(JSON.stringify({
            uploaded: 0,
            error: { message: 'Internal server error' }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 