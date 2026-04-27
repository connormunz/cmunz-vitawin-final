# Vita-Win

**Connor Munz** — Daily vitamin / medication adherence logger.

## Structure

```
vita-win/
├── app.py              # Flask entry point (single route)
├── requirements.txt
├── templates/
│   └── index.html      # Bootstrap 5.2, semantic HTML, WCAG 2.1 AA
└── static/
    ├── style.css       # Minimal Bootstrap overrides only
    └── app.js          # All logic — localStorage persistence, no server DB
```

## Run

```bash
pip install -r requirements.txt
python app.py
```

Navigate to `http://127.0.0.1:5000`.

## Persistence

All data is stored in **browser localStorage** (`vitawin_YYYY-MM-DD` keys).  
No server-side database. No user accounts. Browser-specific and private.

## Notes

- Replace `G-XXXXXXXXXX` in `index.html` with your actual GA4 Measurement ID.
- One log entry per day. Buttons disable after logging to prevent double-logging.
- "Clear History" removes all `vitawin_*` keys from localStorage.