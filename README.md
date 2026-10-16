# # LifeOS - Your Personal Operating System

> Dump everything in your head. LifeOS organizes it.

LifeOS is a personal productivity app designed to capture your thoughts and ideas without any friction. Just dump them, and the system handles the rest.

## Project Structure

```
LifeOS/
├── index.html          # Main HTML structure
├── styles.css          # All styling (responsive design)
├── script.js           # Application logic (vanilla JS)
├── README.md           # This file
└── .gitignore          # Git ignore file (optional)
```

## Features (v0.1)

### ✅ Implemented
- **Dashboard**: Overview with stats and quick dump feature
- **Brain Dump**: Capture thoughts without organization
- **LocalStorage**: Persistent storage of all brain dumps
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Navigation**: Sidebar with 6 sections
- **UI**: Modern, clean productivity aesthetic

### 🚧 Coming Soon
- Tasks (automatic extraction from brain dumps)
- Reminders (notifications for important items)
- Schedule (calendar integration)
- Expenses (spending tracking)
- AI-powered organization
- Export/Archive features

## Getting Started

### Option 1: Run Locally

1. **Clone or download the project**
   ```bash
   cd lifeos
   ```

2. **Start a simple HTTP server**
   
   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   **Using Node.js (with http-server):**
   ```bash
   npx http-server
   ```
   
   **Using VS Code Live Server:**
   - Install the Live Server extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   - Navigate to `http://localhost:8000`

### Option 2: Open Directly
- Simply open `index.html` in your browser (limited localStorage in some cases)

## Usage

### Dashboard
- View stats on brain dumps
- Quick dump feature for fast capture
- See recent brain dumps

### Brain Dump
- Write thoughts without worrying about organization
- Character limit: 500 per dump
- Delete old dumps with one click
- Keyboard shortcut: `Ctrl + Enter` to submit

### Navigation
- Click sidebar items to switch between sections
- On mobile: Tap menu icon to toggle sidebar
- Active page is highlighted in blue

## Technical Details

### Architecture
- **Single Page Application (SPA)** using vanilla JavaScript
- **No frameworks** - pure HTML, CSS, and JavaScript
- **No backend** - everything runs in the browser
- **LocalStorage** - data persists between sessions

### Storage Format
Brain dumps are stored in localStorage as JSON:
```javascript
{
  "id": 1694832000000,
  "content": "Your dump content here",
  "timestamp": "2023-09-15T14:00:00.000Z",
  "createdAt": "2023-09-15T14:00:00.000Z"
}
```

### File Sizes
- HTML: ~8 KB
- CSS: ~15 KB
- JavaScript: ~9 KB
- **Total: ~32 KB** (very lightweight)

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support
- IE11: ⚠️ Partial (some CSS features may not work)

## Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2563eb;      /* Main blue */
    --primary-dark: #1e40af;       /* Darker blue */
    --secondary-color: #8b5cf6;    /* Purple */
    --success-color: #10b981;      /* Green */
    /* ... more colors ... */
}
```

### Change Fonts
Modify the font-family in the `body` rule in `styles.css`

### Adjust Sidebar Width
Edit in `styles.css`:
```css
.sidebar {
    width: 280px;  /* Change this value */
}
```

## Development Notes

### Code Style
- Clean, readable vanilla JavaScript
- CSS follows BEM-inspired naming
- Comments explain key sections
- No build tools required

### Adding New Features
1. Add HTML to `index.html`
2. Add CSS to `styles.css`
3. Add JavaScript logic to `script.js`
4. Follow existing patterns for consistency

### Debugging
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Storage tab to view localStorage
- Use `console.log()` for debugging

## Data Privacy
- All data is stored locally in your browser
- No data sent to any server
- No tracking or analytics
- Complete privacy

## Future Roadmap

### Phase 2: Smart Organization
- Automatic task extraction
- Category tagging
- Search functionality
- Full-text search

### Phase 3: Intelligence
- AI-powered categorization
- Smart reminders
- Habit tracking
- Insights and analytics

### Phase 4: Integration
- Calendar sync
- Todo list export
- Email integration
- Mobile app

## License
MIT License - Feel free to use and modify

## Support
For issues or suggestions, please create an issue in the repository.

---

**Happy dumping! 🧠**
