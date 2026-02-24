# 5. Development Environment Setup

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [5.1 Prerequisites Installation](#51-prerequisites-installation)
  - [5.1.1 Node.js & npm Setup](#511-nodejs--npm-setup)
  - [5.1.2 Git Configuration](#512-git-configuration)
  - [5.1.3 IDE/Editor Setup (VS Code)](#513-ideeditor-setup-vs-code)
- [5.2 Project Setup](#52-project-setup)
  - [5.2.1 Repository Cloning](#521-repository-cloning)
  - [5.2.2 Dependencies Installation](#522-dependencies-installation)
  - [5.2.3 Directory Structure Verification](#523-directory-structure-verification)
- [5.3 Environment Configuration](#53-environment-configuration)
  - [5.3.1 Environment Variables (.env.local)](#531-environment-variables-envlocal)
  - [5.3.2 Supabase Configuration](#532-supabase-configuration)
  - [5.3.3 Chat Service Setup](#533-chat-service-setup)
  - [5.3.4 Configuration Files Overview](#534-configuration-files-overview)
- [5.4 Running the Development Server](#54-running-the-development-server)
  - [5.4.1 Starting the Application](#541-starting-the-application)
  - [5.4.2 Hot Reload & Development Tools](#542-hot-reload--development-tools)
  - [5.4.3 Troubleshooting Common Issues](#543-troubleshooting-common-issues)

---

## 5.1 Prerequisites Installation

### 5.1.1 Node.js & npm Setup

#### Windows Installation

1. **Download Node.js:**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download **LTS version** (18.x or 20.x)
   - Choose "Windows Installer (.msi)" 64-bit

2. **Run Installer:**
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - ✅ Ensure "Automatically install necessary tools" is checked
   - Click "Install"
   - Restart your computer after installation

3. **Verify Installation:**
   ```bash
   # Open PowerShell or Command Prompt
   node --version
   # Expected: v18.x.x or v20.x.x

   npm --version
   # Expected: 9.x.x or higher
   ```

#### macOS Installation

**Method 1: Official Installer**
```bash
# Download from nodejs.org and run .pkg installer
# Then verify:
node --version
npm --version
```

**Method 2: Using Homebrew (Recommended)**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Verify
node --version
npm --version
```

#### Linux Installation (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### Alternative: Using nvm (Node Version Manager)

**Recommended for managing multiple Node.js versions**

**Windows (nvm-windows):**
```bash
# Download from: https://github.com/coreybutler/nvm-windows/releases
# Install nvm-setup.exe

# Then:
nvm install 20
nvm use 20
node --version
```

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then:
nvm install 20
nvm use 20
node --version
```

---

### 5.1.2 Git Configuration

#### Windows Installation

1. **Download Git:**
   - Visit [git-scm.com](https://git-scm.com/)
   - Download "Git for Windows"
   - Run the installer

2. **Installation Options:**
   - ✅ Use Git from Git Bash only (or from command line)
   - ✅ Use OpenSSL library
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use MinTTY
   - ✅ Enable file system caching

3. **Verify Installation:**
   ```bash
   git --version
   # Expected: git version 2.40.x or higher
   ```

#### macOS Installation

```bash
# Using Homebrew
brew install git

# Verify
git --version
```

#### Linux Installation

```bash
# Ubuntu/Debian
sudo apt-get install git

# Verify
git --version
```

#### Git Global Configuration

**Set your identity:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Configure line endings:**
```bash
# Windows
git config --global core.autocrlf true

# macOS/Linux
git config --global core.autocrlf input
```

**Set default branch name:**
```bash
git config --global init.defaultBranch main
```

**Verify configuration:**
```bash
git config --list
```

#### Generate SSH Key (Optional but Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Start SSH agent
# Windows (Git Bash):
eval "$(ssh-agent -s)"

# macOS/Linux:
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
# Windows:
clip < ~/.ssh/id_ed25519.pub

# macOS:
pbcopy < ~/.ssh/id_ed25519.pub

# Linux:
cat ~/.ssh/id_ed25519.pub
# Then copy manually
```

Add the SSH key to your GitHub account:
1. Go to GitHub.com → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

---

### 5.1.3 IDE/Editor Setup (VS Code)

#### Installation

**Download and Install:**
1. Visit [code.visualstudio.com](https://code.visualstudio.com/)
2. Download for your platform
3. Run installer
4. ✅ Check "Add to PATH" during installation (Windows)

#### Essential Extensions

Install the following extensions for optimal development experience:

```bash
# Open VS Code and press Ctrl+Shift+X (Windows/Linux) or Cmd+Shift+X (macOS)
# Search and install each extension, or use the command line:

# ES7+ React/Redux Snippets
code --install-extension dsznajder.es7-react-js-snippets

# Tailwind CSS IntelliSense
code --install-extension bradlc.vscode-tailwindcss

# Prettier - Code formatter
code --install-extension esbenp.prettier-vscode

# ESLint
code --install-extension dbaeumer.vscode-eslint

# GitLens
code --install-extension eamodio.gitlens

# Auto Rename Tag
code --install-extension formulahendry.auto-rename-tag

# Path Intellisense
code --install-extension christian-kohler.path-intellisense

# TypeScript and JavaScript Language Features (Built-in, no install needed)
```

#### VS Code Settings

Create or update `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^\"'`]*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### Recommended VS Code Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Quick file open |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+`` | Toggle terminal |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+/` | Toggle comment |
| `Alt+Up/Down` | Move line up/down |
| `Ctrl+D` | Select next occurrence |
| `F2` | Rename symbol |

---

## 5.2 Project Setup

### 5.2.1 Repository Cloning

#### Clone the Repository

**Using HTTPS:**
```bash
# Navigate to your projects directory
cd C:\Users\YourName\Projects  # Windows
cd ~/Projects                   # macOS/Linux

# Clone the repository
git clone https://github.com/your-org/southville-8b-nhs-edge.git

# Navigate to project
cd southville-8b-nhs-edge
```

**Using SSH (if configured):**
```bash
git clone git@github.com:your-org/southville-8b-nhs-edge.git
cd southville-8b-nhs-edge
```

#### Verify Clone

```bash
# Check git status
git status
# Expected: On branch main, Your branch is up to date...

# View project structure
ls -la  # macOS/Linux
dir     # Windows
```

---

### 5.2.2 Dependencies Installation

#### Navigate to Frontend Directory

**All development work happens in `frontend-nextjs/`:**

```bash
cd frontend-nextjs
```

#### Install Dependencies

```bash
# Install all npm dependencies
npm install

# This will install:
# - Next.js 15
# - React 18
# - TypeScript
# - TailwindCSS
# - All other dependencies from package.json
```

**Expected output:**
```
added 1234 packages, and audited 1235 packages in 2m

234 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

> **Note:** Installation may take 2-5 minutes depending on your internet speed.

#### Verify Installation

```bash
# Check if node_modules exists
ls node_modules  # macOS/Linux
dir node_modules # Windows

# Verify Next.js installation
npx next --version
# Expected: 15.x.x
```

#### Common Installation Issues

**Issue: `EACCES` permission errors (macOS/Linux)**
```bash
# Solution: Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules
```

**Issue: `EPERM` errors (Windows)**
- Run Command Prompt or PowerShell as Administrator
- Close any applications that might be using the files
- Disable antivirus temporarily during installation

**Issue: Network timeout**
```bash
# Increase npm timeout
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Then retry
npm install
```

---

### 5.2.3 Directory Structure Verification

Verify the frontend project structure:

```bash
# List directory contents
ls -la  # macOS/Linux
dir     # Windows
```

**Expected structure:**
```
frontend-nextjs/
├── app/                      # Next.js App Router
│   ├── guess/               # Public routes
│   ├── student/             # Student portal
│   ├── teacher/             # Teacher portal
│   ├── admin/               # Admin portal
│   ├── superadmin/          # Super admin portal
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                 # UI primitives
│   ├── student/            # Student components
│   ├── teacher/            # Teacher components
│   └── ...
├── lib/                    # Utilities
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
├── public/                 # Static assets
├── node_modules/           # Dependencies
├── package.json            # Dependencies manifest
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
├── next.config.mjs         # Next.js config
└── .gitignore             # Git ignore rules
```

---

## 5.3 Environment Configuration

### 5.3.1 Environment Variables (.env.local)

Environment variables store sensitive configuration that shouldn't be committed to version control.

#### Create Environment File

```bash
# Navigate to frontend-nextjs directory
cd frontend-nextjs

# Create .env.local file
# Windows (PowerShell):
New-Item .env.local

# macOS/Linux:
touch .env.local
```

#### Required Environment Variables

Edit `.env.local` with your favorite text editor and add:

```bash
# Supabase Configuration (Required for Chat Realtime)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chat Service Configuration (Optional, defaults to localhost)
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001

# API Configuration (Optional)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> **Important:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the client-side code.

#### Environment Variable Explained

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | Chat service endpoint | Your chat service URL or localhost |

---

### 5.3.2 Supabase Configuration

#### Get Supabase Credentials

1. **Sign up/Login to Supabase:**
   - Visit [supabase.com](https://supabase.com/)
   - Create an account or login
   - Create a new project (if needed)

2. **Get API Credentials:**
   - Go to Project Dashboard
   - Click "Settings" (gear icon) → "API"
   - Copy the following:
     - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
     - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

> **Security Note:** Never commit the `service_role` key to version control. Only use it on the backend.

---

### 5.3.3 Chat Service Setup

The chat service runs separately and provides real-time messaging functionality.

#### Option 1: Use Remote Chat Service (Recommended for Development)

If a shared development chat service is available:

```bash
# In .env.local
NEXT_PUBLIC_CHAT_SERVICE_URL=https://chat.dev.yourschool.com
```

#### Option 2: Run Chat Service Locally

If you need to run the chat service locally:

1. **Navigate to chat service directory:**
   ```bash
   cd ../southville-chat-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Create .env file
   cp .env.example .env

   # Edit .env with your Supabase credentials
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PORT=3001
   ```

4. **Start chat service:**
   ```bash
   npm run start:dev
   ```

5. **Verify chat service:**
   ```bash
   # In another terminal
   curl http://localhost:3001/health
   # Expected: {"status":"ok"}
   ```

6. **Update frontend `.env.local`:**
   ```bash
   NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001
   ```

---

### 5.3.4 Configuration Files Overview

#### `next.config.mjs`

Next.js configuration file:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration options
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
};

export default nextConfig;
```

**Common configurations:**
- `reactStrictMode`: Enable React strict mode
- `images.domains`: Allowed image domains
- `env`: Environment variables
- `redirects`: URL redirects
- `rewrites`: URL rewrites

#### `tailwind.config.ts`

TailwindCSS configuration with custom design system:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'school-blue': '#2563EB',
        'school-gold': '#F59E0B',
        // ... other colors
      },
    },
  },
  plugins: [],
}

export default config
```

#### `tsconfig.json`

TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key settings:**
- `paths`: Path aliases (`@/` → project root)
- `strict`: Strict type checking
- `jsx`: JSX transformation

---

## 5.4 Running the Development Server

### 5.4.1 Starting the Application

#### Start Next.js Development Server

```bash
# Make sure you're in frontend-nextjs directory
cd frontend-nextjs

# Start development server
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.X:3000

 ✓ Ready in 2.5s
 ○ Compiling / ...
 ✓ Compiled / in 1.2s
```

#### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Southville 8B NHS Edge homepage.

#### Verify All Routes

Test different routes:

- **Homepage**: `http://localhost:3000`
- **Guest Routes**: `http://localhost:3000/guess/*`
- **Student Portal** (requires login): `http://localhost:3000/student/dashboard`
- **Teacher Portal** (requires login): `http://localhost:3000/teacher/dashboard`

---

### 5.4.2 Hot Reload & Development Tools

#### Hot Module Replacement (HMR)

Next.js automatically reloads the page when you make changes:

1. **Edit a file:**
   ```tsx
   // app/page.tsx
   export default function Home() {
     return <div>Hello World - Modified!</div>
   }
   ```

2. **Save the file** (Ctrl+S / Cmd+S)

3. **Browser automatically refreshes** with changes

#### Development Tools

**React DevTools:**
1. Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) browser extension
2. Open browser DevTools (F12)
3. Click "Components" tab to inspect React component tree

**Next.js DevTools:**
- Available in the browser console
- Shows route information, server/client components
- Performance metrics

**Terminal Output:**
```
 ○ Compiling /student/dashboard ...
 ✓ Compiled /student/dashboard in 523ms
 GET /student/dashboard 200 in 545ms
```

#### Useful Development Commands

```bash
# Run development server
npm run dev

# Run development server with type checking
npm run dev & npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Analyze bundle size
npm run analyze
```

---

### 5.4.3 Troubleshooting Common Issues

#### Issue: Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1: Kill the process using port 3000**

Windows:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Solution 2: Use a different port**
```bash
# Set PORT environment variable
# Windows (PowerShell):
$env:PORT=3001; npm run dev

# macOS/Linux:
PORT=3001 npm run dev
```

#### Issue: Module Not Found

**Error:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Solutions:**
1. **Verify import path:**
   ```tsx
   // Correct
   import { Button } from '@/components/ui/button'

   // Incorrect
   import { Button } from 'components/ui/button'
   ```

2. **Check file exists:**
   ```bash
   ls components/ui/button.tsx
   ```

3. **Restart dev server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

#### Issue: TypeScript Errors

**Error:**
```
Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:**
1. **Add type guards:**
   ```tsx
   // Before
   const name: string = user.name

   // After
   const name: string = user.name || 'Unknown'
   // or
   const name: string | undefined = user.name
   ```

2. **Run type check:**
   ```bash
   npm run type-check
   ```

#### Issue: Environment Variables Not Loading

**Symptoms:**
- `process.env.NEXT_PUBLIC_SUPABASE_URL` is undefined

**Solutions:**
1. **Verify `.env.local` exists:**
   ```bash
   ls .env.local
   ```

2. **Check variable names:**
   - Must start with `NEXT_PUBLIC_` for client-side access
   - No spaces around `=`
   - No quotes around values (unless needed)

3. **Restart dev server:**
   - Environment variables are loaded at server start
   - Stop (Ctrl+C) and restart: `npm run dev`

4. **Verify in code:**
   ```tsx
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

#### Issue: Styles Not Applying

**Symptoms:**
- Tailwind classes not working
- Custom colors not showing

**Solutions:**
1. **Verify Tailwind setup:**
   ```bash
   # Check if tailwind.config.ts exists
   ls tailwind.config.ts
   ```

2. **Check content paths in `tailwind.config.ts`:**
   ```typescript
   content: [
     './app/**/*.{js,ts,jsx,tsx,mdx}',
     './components/**/*.{js,ts,jsx,tsx,mdx}',
   ]
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

#### Issue: Slow Development Server

**Solutions:**
1. **Disable browser extensions temporarily**
2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Increase Node.js memory:**
   ```bash
   # Windows (PowerShell):
   $env:NODE_OPTIONS="--max-old-space-size=4096"; npm run dev

   # macOS/Linux:
   NODE_OPTIONS=--max-old-space-size=4096 npm run dev
   ```

#### Getting Help

If you continue to experience issues:

1. **Check the logs:**
   - Terminal output
   - Browser console (F12)

2. **Search existing issues:**
   - GitHub Issues
   - Stack Overflow

3. **Ask for help:**
   - Create a GitHub issue
   - Contact the development team
   - Check the project documentation

---

## Setup Verification Checklist

Before proceeding to development, verify your setup:

- [ ] Node.js 18.x or 20.x installed and verified
- [ ] npm 9.x+ installed and verified
- [ ] Git installed and configured
- [ ] VS Code installed with recommended extensions
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env.local` created and configured
- [ ] Supabase credentials added
- [ ] Development server starts without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] Hot reload working (changes reflect in browser)
- [ ] Browser DevTools working
- [ ] No console errors in browser

**If all items are checked, you're ready to start developing!** 🎉

---

## Navigation

- [← Previous: System Requirements](./04-system-requirements.md)
- [Next: Production Deployment →](./06-production-deployment.md)
- [↑ Back to Volume 2 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
