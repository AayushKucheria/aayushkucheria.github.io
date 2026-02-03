# CLAUDE.md

## What this is

Personal website for Aayush Kucheria, hosted on GitHub Pages at https://aayushkucheria.github.io

## Tech stack

- **Jekyll** static site generator with the **Chirpy** theme (v4.1, installed via RubyGems)
- GitHub Actions deploys from `main` to `gh-pages` branch
- Theme provides layouts, includes, and base CSS — this repo only has config, data, tabs, and overrides

## Key files

- `_config.yml` — Site config (title, theme mode, social links, avatar, etc.)
- `index.html` — Home page (uses `page` layout with custom intro HTML)
- `_tabs/about.md` — About page
- `_tabs/bookshelf.md` — Bookshelf page
- `_data/contact.yml` — Sidebar contact links
- `_data/locales/en.yml` — English UI strings
- `assets/css/style.scss` — Custom CSS overrides (imports theme's `main` first)
- `_plugins/posts-lastmod-hook.rb` — Auto-sets last_modified_at from git history
- `res/profile.jpg` — Profile photo

## Navigation

Tabs in `_tabs/` are sorted by `order` in front matter. The home page is `index.html` at `/`.

## Building locally

```
bundle install
bundle exec jekyll serve
```

## Style decisions

- Light theme (not dark)
- Minimal text — personal tone, not corporate/LinkedIn
- Larger base font size for mobile readability
- Max content width 720px
