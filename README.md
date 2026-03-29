# Icynigma.ai - Philosophical AI Chatbot

> A sophisticated, full-stack philosophical AI chatbot with dark theme aesthetics and contemplative dialogue.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-22%2B-brightgreen)

## 🌟 Features

- **Philosophical AI Chat** - Engage in profound conversations about existence, consciousness, and meaning
- **Dark Theme** - Midnight purple aesthetic with eerie, contemplative atmosphere
- **Full-Stack TypeScript** - Type-safe end-to-end development
- **Real-time Chat** - Instant messaging with persistent history
- **User Authentication** - Secure OAuth integration
- **Responsive Design** - Works on desktop and mobile
- **Production Ready** - Tested, documented, and optimized

## 🚀 Quick Start (Replit)

### 1. Create Replit Project
```bash
# Go to replit.com
# Create new Node.js Repl
# Upload project files
```

### 2. Install & Run
```bash
pnpm install
pnpm dev
```

### 3. Open Preview
Click the preview URL that appears in Replit

**That's it!** Your Icynigma.ai is running.

## 📋 Prerequisites

- Node.js 22+
- pnpm (or npm)
- A database (SQLite included, MySQL optional)
- Manus account (for OAuth and LLM)

## 🛠️ Installation

### Local Development

```bash
# Clone or extract the project
cd icynigma

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Replit Deployment

See [REPLIT_QUICK_START.md](./REPLIT_QUICK_START.md) for step-by-step instructions.

## 📁 Project Structure

```
icynigma/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, Chat)
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (tRPC client)
│   │   ├── App.tsx        # Main app with routing
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML entry
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── _core/            # Core infrastructure
│   │   ├── index.ts      # Server initialization
│   │   ├── trpc.ts       # tRPC setup
│   │   ├── context.ts    # Request context
│   │   ├── oauth.ts      # OAuth handling
│   │   └── llm.ts        # LLM integration
│   ├── routers.ts        # API procedures
│   ├── db.ts             # Database queries
│   └── *.test.ts         # Unit tests
├── drizzle/              # Database
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Migration files
├── shared/               # Shared code
│   ├── const.ts          # Constants
│   └── types.ts          # Shared types
├── .replit               # Replit config
├── setup.sh              # Setup script
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL=sqlite:./icynigma.db

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Security
JWT_SECRET=your_random_secret_key

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Manus LLM
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# App
VITE_APP_TITLE=Icynigma
VITE_APP_LOGO=/logo.png
```

## 🎨 Customization

### Change AI Personality

Edit `server/routers.ts` and modify the system prompt:

```typescript
{ 
  role: "system", 
  content: "Your custom prompt here..." 
}
```

### Modify Theme

Edit `client/src/index.css` to change colors, fonts, and animations.

### Update Branding

In `.env`, change:
- `VITE_APP_TITLE` - App name
- `VITE_APP_LOGO` - Logo URL

## 📚 Available Scripts

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm start            # Run production build

# Database
pnpm db:push          # Create/update database schema

# Testing
pnpm test             # Run unit tests
pnpm test --watch     # Watch mode

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
```

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

Tests cover:
- Authentication flow
- Chat message handling
- Database operations
- Error handling
- API validation

## 🌐 Deployment

### Replit (Recommended for Beginners)
- See [REPLIT_QUICK_START.md](./REPLIT_QUICK_START.md)

### Vercel
```bash
pnpm build
# Deploy dist folder to Vercel
```

### Railway
```bash
# Connect GitHub repo to Railway
# Railway auto-detects Node.js project
```

### Docker
```bash
docker build -t icynigma .
docker run -p 3000:3000 icynigma
```

## 🔐 Security

- **Authentication** - Manus OAuth handles secure login
- **Sessions** - HTTP-only cookies with CSRF protection
- **Database** - Parameterized queries prevent SQL injection
- **API** - tRPC validates all inputs with Zod
- **Secrets** - Environment variables for sensitive data
- **HTTPS** - All connections encrypted

## 📊 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Express 4, tRPC 11, Node.js |
| Database | Drizzle ORM, MySQL/SQLite |
| Auth | Manus OAuth, JWT |
| AI | Manus LLM |
| Language | TypeScript |
| Build | Vite, esbuild |
| Testing | Vitest |

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
pnpm install
```

### Database connection fails
- Verify `DATABASE_URL` is correct
- For SQLite: Ensure write permissions
- For MySQL: Check host, port, credentials

### OAuth not working
- Verify `VITE_APP_ID` is set
- Check OAuth callback URL configuration

### LLM responses empty
- Verify `BUILT_IN_FORGE_API_KEY` is valid
- Check Manus account has LLM access

### Styles not loading
```bash
pnpm build
pnpm start
```

## 📖 Documentation

- [REPLIT_QUICK_START.md](./REPLIT_QUICK_START.md) - Replit deployment guide
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Complete technical docs
- Inline code comments - Implementation details

## 🚀 Performance

- **Frontend** - Code splitting, lazy loading, optimized bundles
- **Backend** - Connection pooling, query optimization, caching
- **Network** - Compression, CDN-ready, optimized payloads
- **Database** - Indexed queries, efficient migrations

## 🎯 Roadmap

- [ ] Voice interaction (speech-to-text)
- [ ] Conversation export (PDF/Markdown)
- [ ] Philosophy topic filters
- [ ] Concept visualization
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Streaming responses
- [ ] User analytics dashboard

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

MIT License - Feel free to use and modify

## 💬 Support

- **Documentation** - See docs folder
- **Issues** - Check GitHub issues
- **Discussions** - Community forum

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Manus](https://manus.im)

## 📞 Contact

- **Website** - https://icynigma.ai
- **Email** - hello@icynigma.ai
- **Twitter** - @icynigma_ai

---

**Made with ❤️ by the Manus team**

**Ready to chat? [Start Icynigma.ai now!](https://icynigma.ai)**
