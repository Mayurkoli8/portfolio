# Mayur Koli — portfolio

Source for [mayurkoli.me](https://mayurkoli.me): my work, experience, skills and contact details, plus the latest posts from my blog, [Cellwise](https://blog.mayurkoli.me).

Plain HTML, CSS and JavaScript. No build step.

## Structure

```
index.html          Home page
privacy.html        Privacy policy (served at /privacy)
404.html            Not-found page
assets/css/site.css Styles (light and dark themes)
assets/js/site.js   Nav, scroll reveals, blog feed, contact form
assets/imgs/work/   Project screenshots
assets/og.png       Social share image
ads.txt             AdSense seller record for mayurkoli.me and its subdomains
robots.txt, sitemap.xml
vercel.json         Clean URLs, redirects (/resume, /blog), headers
.vercelignore       Repo files that are not deployed
```

## Run locally

```bash
npx serve .
```

Then open http://localhost:3000.

## Deploy

Hosted on Vercel as a static site: framework preset **Other**, no build command, output directory `.` (the repo root). Every push to `main` deploys.

`ads.txt` must stay at the root of `mayurkoli.me`. Ad crawlers check the root domain's `ads.txt` for every subdomain, including the blog.

## Updating content

- **Resume:** replace `Mayur Koli Resume 2026 AI Engineer.pdf`. If the file name changes, update the links in `index.html` and the `/resume` redirect in `vercel.json`.
- **Blog posts:** the home page loads the latest five from `https://blog.mayurkoli.me/feed.xml`. The list in `index.html` is only a fallback.
- **Contact form:** submissions go to Formspree (form `xdoqqnog`).

## Contact

- Email: kolimohit9595@gmail.com
- LinkedIn: [linkedin.com/in/mayur-koli-484603215](https://www.linkedin.com/in/mayur-koli-484603215/)
- GitHub: [github.com/Mayurkoli8](https://github.com/Mayurkoli8)
