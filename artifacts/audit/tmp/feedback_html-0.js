
    const OWNER_EMAIL = 'brodywilliams0226@gmail.com';
    const form = document.getElementById('feedbackForm');
    const btn = document.getElementById('sendBtn');
    const statusEl = document.getElementById('status');
    const mailtoLink = document.getElementById('mailtoLink');

    const setStatus = (html, kind = '') => {
      statusEl.innerHTML = html;
      statusEl.className = kind;
    };

    const value = (id) => document.getElementById(id).value.trim();

    function mailtoHref() {
      const subject = `[Feedback] ${value('category') || 'Other'} from ${value('name') || 'a visitor'}`;
      const body = [
        `Name: ${value('name')}`,
        `Email: ${value('email')}`,
        `Category: ${value('category')}`,
        '',
        value('message'),
        '',
        `Page: ${location.href}`
      ].join('\n');
      return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function refreshMailto() {
      mailtoLink.href = mailtoHref();
    }

    ['name', 'email', 'category', 'message'].forEach((id) => {
      document.getElementById(id).addEventListener('input', refreshMailto);
    });
    refreshMailto();

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (value('website')) return;
      if (!value('name')) return setStatus('Add your name so we know who to reply to.', 'err');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value('email'))) return setStatus('Add a valid email address.', 'err');
      if (value('message').length < 5) return setStatus('Tell us a little more — at least a sentence.', 'err');

      const href = mailtoHref();
      btn.disabled = true;
      setStatus(`Your email app should open with your feedback ready. Press Send to deliver it. If it does not open, <a href="${href}">use this email link</a>.`, 'ok');
      window.location.href = href;
      setTimeout(() => { btn.disabled = false; }, 1200);
    });
  