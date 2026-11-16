# BAMBU Interiors

## Update the existing GitHub repository

1. Download and extract the ZIP. On iPhone, save it to Files and choose Uncompress.
2. Open the BAMBU GitHub repository and check which branch Cloudflare deploys, usually main.
3. If index.html currently sits at the repository top level, stay on that level. If the existing site is deployed from a folder such as dist, open that folder instead.
4. Choose Add file → Upload files. Select the extracted files, including all six HTML pages, style.css, site.js, wordmark.svg, b-mark.jpg, render.jpg and sketch.jpg. Include robots.txt and this README if desired. The hidden .nojekyll file is optional for Cloudflare Pages.
5. Commit to the production branch. If GitHub requires a pull request, merge it into that branch to deploy. Files with matching names replace their previous versions.
6. Open the existing Cloudflare Pages project, then Deployments. Wait for the new production deployment to succeed and open its Visit link. Keep your existing Pages build settings and custom domain.
7. On iPhone, check the Menu, all six pages, the image reveal and the contact link. Confirm that hello@bambuinteriors.co.uk is your intended inbox.

The new sketch was generated from the existing render as a quick graphite perspective study with sparse outlines and no shading. The image comparison illustrates a concept.

Upload all files from this version together, including tenants.html and scheme.svg. If only Tenants returns 404 after a successful deploy, first check that tenants.html appears alongside index.html on the production branch, with exactly that lowercase filename.
