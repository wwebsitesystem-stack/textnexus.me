
Visit `http://localhost:8000` to see the boot sequence and interface. Note that API calls to the Cloudflare Worker may require CORS configuration or direct deployment testing.

### Deploying Changes
1. Push changes to `main` (or open a pull request).
2. The **Deploy to Cloudflare Pages** workflow stages the served files with
   `scripts/build-site.sh` and publishes them to the `textnexus` Pages project,
   so the repository itself stays private.
3. Add the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   once; without them the workflow cannot publish.

## 🔒 Security & Privacy
*   **Turnstile Integration:** All critical access points are protected against automated scripts.
*   **No PII Storage:** Frontend does not store sensitive personal information; state is managed locally or via secure session tokens where applicable.
*   **Open Source Transparency:** Code is publicly available for auditability.

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure all new components adhere to the existing **Design Token** system in `Style.css` to maintain visual consistency.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. *(Note: Add LICENSE file if missing)*

---
**Built with ❤️ by the TextNexus Team.**  
*Nexus OS // Edition X — Where Systems Meet Simplicity.*


## Accounts and email

Account creation lives at `/signup.html` — email/password and Google through Firebase
Auth. A new account is saved to its own `users/<uid>` node (the only database path a
signed-in user may write, per `database.rules.json`) and receives a Firebase
verification email. The branded welcome email is sent by `functions/api/welcome.js`,
which calls Brevo server-side so the API key never reaches the browser.

### Required setup

1. Publish the rules: `firebase deploy --only database --project nexus-web-development-official`.
2. Feedback from `/feedback.html` opens a prefilled email draft addressed to
   `brodywilliams0226@gmail.com`; the visitor presses Send in their own mail app. This
   works on GitHub Pages and needs no form service, server, or secret.
3. The branded welcome email is sent by `functions/api/welcome.js`, which calls Brevo
   server-side so the API key never reaches the browser. That function needs Cloudflare
   Pages (or another host that runs `/api/*`); GitHub Pages serves the pages but not the
   function. On Pages, add encrypted `BREVO_API_KEY` and `BREVO_SENDER` (optional:
   `BREVO_SENDER_NAME`, `BREVO_REPLY_TO`, `APP_ORIGIN`, `FIREBASE_API_KEY`).
4. In Firebase Authentication, enable the Email/Password and Google providers and add
   `textnexus.me` to Authorized domains.
5. Create a DNS record for `www` (CNAME to `textnexus.me`, proxied).

### Performance and analytics

`index.html` renders its workspace immediately; the old boot/splash/Turnstile gate no
longer blocks paint. `home.html` uses plain CSS and inline SVG instead of the Tailwind
browser compiler, the Phosphor icon bundle and Google Fonts.

Set `CF_ANALYTICS_TOKEN` when running `scripts/build-site.sh` (or as a CI secret) to
inject Cloudflare Web Analytics into every staged page. With no token, no beacon is
added, and nothing analytics-related is committed.

The AI builder Worker (`worker.js`) now checks the request origin, rate limits by IP,
and requires a Firebase ID token before it creates GitHub repos or Cloudflare DNS
records. Optional environment: `ALLOWED_ORIGINS` (comma-separated), `FIREBASE_API_KEY`.
Deploy it separately with `wrangler deploy`.
