# BAMBU Interiors website

Open `index.html` in a browser for a local preview. Keep all the site files together.

## GitHub

1. Save the ZIP to Files on iPhone and choose **Uncompress**. On a computer, extract the ZIP.
2. Open your `bambu-interiors` repository. If you are starting with a new repository, create it with a README to initialise the main branch.
3. Choose **Add file → Upload files**. Select the files inside the extracted folder and upload them to the repository root. On iPhone, the hidden `.nojekyll` file is optional for Cloudflare.
4. Confirm that `index.html`, `style.css`, `site.js`, `mark.svg`, `render.jpg`, `sketch.jpg` and `robots.txt` sit together at the top level. Commit to `main`.

## Cloudflare Pages

If your Pages project already deploys from `main`, check its next deployment after committing. Otherwise, in **Workers & Pages**, create a **Pages** application and import the GitHub repository.

| Setting | Value |
| --- | --- |
| Production branch | main |
| Framework preset | None |
| Build command | Leave blank |
| Build output directory | . |
| Root directory | Leave blank |

Deploy and open the assigned `pages.dev` URL. Check the slider and confirm the proposed contact address, `hello@bambuinteriors.co.uk`, before sharing the site. Havas Media and Saga are labelled as prior professional experience placeholders. Once ready, connect your domain in the project's **Custom domains** settings.
