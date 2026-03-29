# Icynigma.ai - Replit Quick Start (Plug & Play)

## 🚀 One-Click Setup

This is a **complete, ready-to-run** package. Follow these simple steps:

### Step 1: Create Replit Project (1 minute)

1. Go to [replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Select **"Node.js"** as language
4. Name it **"icynigma"**
5. Click **"Create Repl"**

### Step 2: Upload Project Files (2 minutes)

1. Download the project source code
2. Extract the ZIP/TAR file
3. In Replit, click the **"Upload file"** button (or drag & drop)
4. Select all extracted files and upload them
5. Wait for upload to complete

### Step 3: Install Dependencies (3 minutes)

In the Replit terminal, run:

```bash
pnpm install
```

This will automatically install all required packages.

### Step 4: Set Up Database (2 minutes)

**Option A: Use SQLite (Easiest for Testing)**
- SQLite is already configured and will work immediately
- No additional setup needed!

**Option B: Use MySQL (Recommended for Production)**
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up for free account
3. Create a new database
4. Copy the connection string
5. In Replit Secrets, add: `DATABASE_URL=<your_connection_string>`

### Step 5: Configure Secrets (3 minutes)

In Replit, click **"Secrets"** (lock icon) and add these:

```
VITE_APP_ID=test-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=your-random-secret-key-here
OWNER_NAME=Your Name
OWNER_OPEN_ID=test-open-id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=test-api-key
VITE_FRONTEND_FORGE_API_KEY=test-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_APP_TITLE=Icynigma
VITE_APP_LOGO=/logo.png
```

### Step 6: Start the App (1 minute)

In the Replit terminal, run:

```bash
pnpm dev
```

The app will start and Replit will show you a public URL. Click it to open your app!

---

## ✨ That's It! You're Done!

Your Icynigma.ai is now running. You can:

- **Chat with the AI** - Click "Chat with AI" button
- **Sign in** - Use the login functionality
- **View chat history** - All conversations are saved
- **Customize** - Edit colors, text, and AI personality

---

## 🎨 Customization (Optional)

### Change AI Personality

Edit `server/routers.ts` and find this section:

```typescript
{ 
  role: "system", 
  content: "You are Icynigma, a philosophical AI..." 
}
```

Replace the text with your custom system prompt.

### Change Theme Colors

Edit `client/src/index.css` and modify the color variables:

```css
@theme {
  --color-background: oklch(0.15 0.05 260);
  --color-accent: oklch(0.35 0.15 260);
  /* ... more colors ... */
}
```

### Change App Title & Logo

In Replit Secrets, update:
- `VITE_APP_TITLE=Your App Name`
- `VITE_APP_LOGO=https://your-logo-url.png`

---

## 🔧 Troubleshooting

### "Cannot find module" error
```bash
pnpm install
```

### App won't start
1. Check Replit console for error messages
2. Make sure all secrets are set correctly
3. Try: `pnpm build` then `pnpm start`

### Database errors
- For SQLite: Should work automatically
- For MySQL: Verify `DATABASE_URL` is correct
- Try: `pnpm db:push` to create tables

### OAuth not working
- Make sure `VITE_APP_ID` is set
- Check that `OAUTH_SERVER_URL` is correct

---

## 📚 Project Structure

```
icynigma/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Home, Chat pages
│   │   ├── components/ # UI components
│   │   └── App.tsx     # Main app
│   └── index.html
├── server/              # Express backend
│   ├── routers.ts      # API endpoints
│   └── db.ts           # Database queries
├── drizzle/            # Database schema
├── package.json        # Dependencies
└── README.md           # Full documentation
```

---

## 🚀 Next Steps

1. **Deploy to Production** - Use Replit's built-in deployment
2. **Add Custom Domain** - Connect your own domain
3. **Enable Database** - Switch to MySQL for production
4. **Customize AI** - Modify system prompt for your use case
5. **Add Features** - Extend with new chat modes, export, etc.

---

## 📖 Full Documentation

For detailed information, see:
- `PROJECT_DOCUMENTATION.md` - Complete technical docs
- `README.md` - Feature overview
- Inline code comments - Implementation details

---

## 💡 Tips

- **Test locally first** - Use `pnpm dev` to test changes
- **Check logs** - Replit console shows helpful error messages
- **Use secrets** - Never hardcode API keys in code
- **Backup database** - Export your data regularly

---

## 🎉 You're All Set!

Your Icynigma.ai is ready to use. Start chatting with the philosophical AI and enjoy!

**Questions?** Check the documentation or the inline code comments.

**Happy coding! 🚀**
