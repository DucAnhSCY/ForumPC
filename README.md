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
└── package.json        # Project metadata
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

## Redirects Configuration

The `_redirects` file in the public directory configures URL routing for the site:

- All HTML files can be accessed directly or without the .html extension
- Special routes for categories, community, login, etc.
- Dynamic forum thread routing

## Local Development

To test the site locally, simply open any HTML file in a web browser.

## License

This project is licensed under the ISC License 