# TASI Alpha Cell Dashboard

[![Update Market Data](https://github.com/muxd22-alt/TASI/actions/workflows/update.yml/badge.svg)](https://github.com/muxd22-alt/TASI/actions/workflows/update.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Real-time dashboard tracking Saudi Arabia's TASI index, AI sentiment, and macroeconomic indicators.**
> 
> Powered by GitHub Actions • Served via GitHub Pages • Zero infrastructure cost

![Dashboard Preview](docs/preview.png)

---

## 🚀 Quick Start

### Option 1: Deploy to GitHub (Recommended)

1. **Create a new GitHub repository** and push this code
2. **Add NewsAPI key** (optional):
   - Go to Settings → Secrets and variables → Actions
   - Add secret: `OPENROUTER_API_KEY` with your [OpenRouter](https://newsapi.org/register) key
3. **Enable GitHub Pages**:
   - Settings → Pages → Source: Deploy from branch
   - Branch: `main`, Folder: `/docs`
4. **Run initial data fetch**:
   - Actions → "Update Market Data" → Run workflow

Your dashboard will be live at: `https://muxd22-alt.github.io/TASI/`

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/muxd22-alt/TASI.git
cd tasi-dashboard

# Run setup (Windows)
setup.bat

# Run setup (Mac/Linux)
chmod +x setup.sh && ./setup.sh

# Start local server
python -m http.server 8000 --directory docs

# Open http://localhost:8000
```

---

## 📊 Dashboard Features

| Feature | Description |
|---------|-------------|
| **TASI Index** | Real-time Tadawul All Share Index tracking |
| **QQQ Comparison** | Compare TASI vs. Invesco QQQ Tech ETF |
| **Relative Strength** | TASI/QQQ ratio for market analysis |
| **AI Sentiment** | News feed tracking Saudi AI, NVIDIA, PIF, NEOM |
| **2030/2040 Targets** | Progress tracking toward Vision goals |
| **Dark Mode** | Automatic theme based on system preference |
| **Mobile Responsive** | Optimized for all screen sizes |

---

## 🏗️ Architecture

```
┌─────────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Actions        │────▶│   docs/data.json │────▶│  GitHub Pages   │
│   (Daily at 6 AM AST)   │     │   (Market Data)  │     │  (Static Site)  │
└─────────────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ├─ yfinance (TASI ^TASI, QQQ)
         └─ NewsAPI (AI sentiment)
```

### Components

| Component | Technology | Cost |
|-----------|------------|------|
| Hosting | GitHub Pages (`/docs`) | $0 |
| Automation | GitHub Actions (Python) | $0 |
| Market Data | Yahoo Finance (`yfinance`) | $0 |
| News API | OpenRouter (Developer Tier) | $0 |
| UI Framework | Tailwind CSS + Chart.js | $0 |

---

## 📁 Project Structure

```
tasi-dashboard/
├── .github/
│   └── workflows/
│       └── update.yml          # Automated data fetch (cron)
├── docs/
│   ├── index.html              # Dashboard UI
│   ├── data.json               # Auto-generated market data
│   └── data.sample.json        # Sample data for testing
├── scripts/
│   └── fetch_data.py           # Python data fetcher
├── .gitignore
├── README.md
├── requirements.txt            # Python dependencies
├── setup.bat                   # Windows setup script
└── setup.sh                    # Mac/Linux setup script
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Optional | OpenRouter API key for AI news |

### Customization

**Update 2030/2040 Targets:**
Edit `docs/index.html` and modify:
```javascript
const CONFIG = {
    TASI_2030_TARGET: 15000,  // Your target value
};
```

**Change Update Frequency:**
Edit `.github/workflows/update.yml`:
```yaml
schedule:
  - cron: '0 3 * * *'  # Daily at 6 AM Riyadh time
```

**Add More Tickers:**
Edit `scripts/fetch_data.py`:
```python
MORE_SYMBOLS = ["^GSPTSI", "^N225"]  # Add your symbols
```

---

## 🔧 Development

### Running Locally

```bash
# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Fetch fresh data
python scripts/fetch_data.py

# Start development server
python -m http.server 8000 --directory docs
```

### Testing with Sample Data

```bash
# Use sample data (no API calls)
cp docs/data.sample.json docs/data.json

# Open in browser
open docs/index.html  # Mac
start docs/index.html # Windows
```

### Debugging

Enable verbose logging:
```bash
export DEBUG=true  # Mac/Linux
set DEBUG=true     # Windows

python scripts/fetch_data.py
```

---

## 📈 Data Sources

| Data | Source | Ticker/Query |
|------|--------|--------------|
| TASI Index | Yahoo Finance | `^TASI` |
| Tech ETF | Yahoo Finance | `QQQ` |
| AI News | NewsAPI | Saudi AI, NVIDIA, PIF, NEOM, Universal High Income |

---

## 🚨 Troubleshooting

### "Data not available" error
- Ensure `docs/data.json` exists
- Run workflow manually: Actions → "Update Market Data" → Run workflow

### NewsAPI rate limit exceeded
- Free tier: 100 requests/day
- Consider upgrading or reducing fetch frequency

### Charts not rendering
- Check browser console for errors
- Ensure Chart.js CDN is accessible

### Workflow fails
- Check Actions tab for detailed logs
- Verify `OPENROUTER_API_KEY` secret is set correctly

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/muxd22-alt/TASI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/muxd22-alt/TASI/discussions)

---

## 🎯 Roadmap

- [ ] Add more Gulf market indices (ADX, DFM, QE)
- [ ] Oil price tracking integration
- [ ] Historical data export (CSV)
- [ ] Custom alert notifications
- [ ] Mobile app (PWA support)

---

<div align="center">

**Built with ❤️ for Saudi Vision 2030**

[Report Bug](https://github.com/muxd22-alt/TASI/issues) · [Request Feature](https://github.com/muxd22-alt/TASI/issues)

</div>
