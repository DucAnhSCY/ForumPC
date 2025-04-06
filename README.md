# PC Forum

A forum website dedicated to PC enthusiasts, technology discussions, and gaming.

## Project Structure

```
ForumPC/
├── public/             # Static files to be deployed
│   ├── _redirects      # Cloudflare Pages redirects configuration
│   ├── *.html          # HTML files
│   ├── *.css           # CSS files
│   ├── *.js            # JavaScript files
│   └── *.otf           # Font files
├── functions/          # Cloudflare Pages Functions
│   └── api/            # API endpoints
│       └── upload-cloudflare.js  # Image upload handler
├── package.json        # Project metadata
└── wrangler.toml       # Cloudflare Workers configuration
```

## Deploying to Cloudflare Pages

1. Log in to your Cloudflare account
2. Go to Cloudflare Pages
3. Click "Create a project"
4. Connect to your GitHub repository
5. Configure your build settings:
   - Production branch: `main` (or your preferred branch)
   - Build command: Leave blank (static site)
   - Build output directory: `public`
6. Click "Save and Deploy"

## Cloudflare Images Configuration

This project uses Cloudflare Images for image uploads in CKEditor. To set it up:

1. Enable Cloudflare Images in your Cloudflare account
2. Create an API token with the "Cloudflare Images" permission
3. In your Cloudflare Pages project settings:
   - Go to "Settings" > "Environment variables"
   - Add a new variable named `CF_API_TOKEN` with your API token as the value
   - Set the variable to be encrypted
   - Deploy the changes

The Zone ID is already configured in the code: `4173baa8fe5b12f5f8214903e1adcf4a`

## Redirects Configuration

The `_redirects` file in the public directory configures URL routing for the site:

- All HTML files can be accessed directly or without the .html extension
- Special routes for categories, community, login, etc.
- Dynamic forum thread routing

## Local Development

To test the site locally, simply open any HTML file in a web browser.

For testing Cloudflare Functions locally:
1. Install Wrangler: `npm install -g wrangler`
2. Copy `.env.example` to `.env` and add your Cloudflare API token
3. Run `wrangler pages dev public` to start a local development server

## License

This project is licensed under the ISC License 