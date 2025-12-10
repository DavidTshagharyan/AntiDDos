# Netlify Deployment Guide

This guide will help you deploy your Anti-DDoS Protection Website to Netlify.

## Quick Deploy (Drag & Drop)

1. **Prepare your folder**: Ensure all files are in the `anti-ddos-website` folder
2. **Go to Netlify**: Visit [app.netlify.com](https://app.netlify.com)
3. **Drag & Drop**: Simply drag the entire `anti-ddos-website` folder onto the Netlify dashboard
4. **Wait**: Netlify will automatically deploy your site
5. **Done**: Your site will be live at a URL like `your-site-name.netlify.app`

## Folder Structure

Make sure your folder structure looks like this:

```
anti-ddos-website/
├── index.html
├── detect.html
├── mitigate.html
├── resources.html
├── about.html
├── login.html
├── register.html
├── dashboard.html
├── 404.html
├── logo.webp
├── css/
│   └── styles.css
└── js/
    ├── scripts.js
    └── dashboard.js
```

## Important Notes

- **No Build Process Required**: This is a static site, so no build commands needed
- **All Files Included**: Make sure all HTML, CSS, JS, and image files are included
- **No Backend**: This site works entirely client-side using LocalStorage
- **HTTPS**: Netlify automatically provides HTTPS for your site

## Custom Domain (Optional)

1. Go to your site settings in Netlify
2. Click "Domain settings"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Environment Variables

Not needed for this static site. All functionality works client-side.

## Troubleshooting

### Images Not Loading
- Check that `logo.webp` is in the root of `anti-ddos-website` folder
- Verify file paths are relative (not absolute)

### JavaScript Not Working
- Check browser console for errors
- Ensure all JS files are included
- Verify file paths in HTML are correct

### Styles Not Applied
- Check that `css/styles.css` exists
- Verify the CSS file path in HTML `<link>` tags

## Performance Tips

- Netlify automatically optimizes images
- Enable Netlify's asset optimization in site settings
- Consider adding a `_headers` file for caching (optional)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all file paths are correct
3. Ensure all files are included in the deployment folder

---

**Ready to deploy?** Just drag and drop your `anti-ddos-website` folder onto Netlify!

