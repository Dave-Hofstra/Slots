const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3011;

// --- Storage setup ---
const UPLOAD_DIR = '/app/uploads';
const THEMES_FILE = '/app/data/themes.json';
const PLAYERS_FILE = '/app/data/players.json';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.dirname(THEMES_FILE), { recursive: true });

if (!fs.existsSync(THEMES_FILE)) {
    fs.writeFileSync(THEMES_FILE, '{}', 'utf8');
}
if (!fs.existsSync(PLAYERS_FILE)) {
    fs.writeFileSync(PLAYERS_FILE, '{}', 'utf8');
}

// We store images as: /app/uploads/{themeKey}/{symId}.png
// The client sends the file with originalname = "{symId}.png"
// and the theme key comes from req.body.theme (always populated
// by multer's fields middleware since text fields are parsed first).

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // req.body is populated when multer processes text fields
            // BEFORE the file field, provided we use the right field order.
            // To be safe, derive theme from req.body or fallback to 'scuba'.
            const themeKey = req.body?.theme || 'scuba';
            const dir = path.join(UPLOAD_DIR, themeKey);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // Original filename is set by client as e.g. "J.png"
            cb(null, path.basename(file.originalname));
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));

// --- API Routes ---

// Upload an image for a theme symbol
app.post('/api/slots/themes/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }
    const themeKey = req.body?.theme || 'scuba';
    const symId = path.basename(req.file.originalname, '.png');
    const urlPath = '/Slots/uploads/' + themeKey + '/' + symId + '.png';
    res.json({ path: urlPath });
});

// Load all themes
app.get('/api/slots/themes', (req, res) => {
    try {
        const data = fs.readFileSync(THEMES_FILE, 'utf8');
        res.json({ themes: JSON.parse(data) });
    } catch (e) {
        res.json({ themes: {} });
    }
});

// Save all themes
app.post('/api/slots/themes', (req, res) => {
    try {
        const { themes } = req.body;
        if (!themes) return res.status(400).json({ error: 'No themes data' });
        fs.writeFileSync(THEMES_FILE, JSON.stringify(themes, null, 2), 'utf8');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Load all players
app.get('/api/slots/players', (req, res) => {
    try {
        const data = fs.readFileSync(PLAYERS_FILE, 'utf8');
        res.json({ players: JSON.parse(data) });
    } catch (e) {
        res.json({ players: {} });
    }
});

// Save all players (merge with existing, keep highest balance per player)
app.post('/api/slots/players', (req, res) => {
    try {
        const { players } = req.body;
        if (!players) return res.status(400).json({ error: 'No players data' });
        // Merge incoming with existing data, keeping the highest balance per player
        // so cross-device sync never loses money from a stale save
        let existing = {};
        try {
            existing = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
        } catch (e) { /* file doesn't exist yet */ }
        const merged = { ...players };
        for (const name of Object.keys(existing)) {
            if (!merged[name]) {
                merged[name] = existing[name];
            } else {
                merged[name] = { ...merged[name] };
                merged[name].balance = Math.max(
                    existing[name].balance || 0,
                    merged[name].balance || 0
                );
            }
        }
        fs.writeFileSync(PLAYERS_FILE, JSON.stringify(merged, null, 2), 'utf8');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log('Slots server listening on port ' + PORT);
});
