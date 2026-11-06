
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


## Accounts, owner panels and email

Sign-up lives at `/signup.html` (email/password and Google via Firebase Auth). A new
account writes a record to `tenants/<tenant>/members/<uid>` and receives a Firebase
verification email. The branded welcome email is sent by `functions/api/welcome.js`,
which calls Brevo server-side so the API key never reaches the browser.

| Panel | URL | Owner account |
| --- | --- | --- |
| TextNexus | `/adminpanel/textnexus.html` | brodywilliams0226@gmail.com |
| Leo | `/adminpanel/leo.html` (leo.textnexus.me) | lrosasaamot001@stpaul.k12.mn.us |
| Javier | `/adminpanel/javier.html` (javier.textnexus.me) | jcruz016@stpaul.k12.mn.us |

The owner allowlists are duplicated in `database.rules.json`, which is what actually
enforces access. The panel also reads `tenants/<tenant>/site` for the announcement bar
shown on the home page.

### Required setup

1. Publish the rules: `firebase deploy --only database --project nexus-web-development-official`.
2. On Cloudflare Pages, add encrypted environment variables `BREVO_API_KEY` and
   `BREVO_SENDER` (a sender verified in Brevo). Optional: `BREVO_SENDER_NAME`,
   `BREVO_REPLY_TO`, `APP_ORIGIN`, `FIREBASE_API_KEY`.
3. Functional login needs the site served from Cloudflare Pages (or any host with
   `/api/welcome`); GitHub Pages serves the pages but not the email function.
4. In Firebase Authentication, enable the Email/Password and Google providers and add
   `textnexus.me`, `leo.textnexus.me` and `javier.textnexus.me` to Authorized domains.
5. Create DNS records for `www`, `leo` and `javier` (CNAME to `textnexus.me`, proxied).
