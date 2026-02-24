# 4. System Requirements

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## 4.1 Hardware Requirements

### 4.1.1 Development Environment

Minimum specifications for local development of the Southville 8B NHS Edge system.

#### Minimum Requirements

| Component | Specification | Notes |
|-----------|---------------|-------|
| **Processor** | Intel Core i5 (8th gen) or AMD Ryzen 5 | 4 cores minimum |
| **RAM** | 8 GB | 16 GB recommended for better performance |
| **Storage** | 256 GB SSD | At least 10 GB free space required |
| **Display** | 1366 x 768 | 1920 x 1080 recommended |
| **Network** | Broadband Internet | Minimum 10 Mbps download speed |
| **Operating System** | Windows 10/11, macOS 11+, Linux (Ubuntu 20.04+) | 64-bit required |

#### Recommended Specifications

| Component | Specification | Benefits |
|-----------|---------------|----------|
| **Processor** | Intel Core i7 (10th gen+) or AMD Ryzen 7 | Faster builds and better multi-tasking |
| **RAM** | 16 GB or more | Run multiple services simultaneously |
| **Storage** | 512 GB NVMe SSD | Faster file operations and builds |
| **Display** | 1920 x 1080 or higher | Better development experience |
| **Network** | 25+ Mbps | Faster dependency downloads |
| **Graphics** | Integrated or Dedicated GPU | Smoother UI development |

### 4.1.2 Production Environment

For hosting the production application.

#### Small Deployment (< 500 users)

| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 2 vCPUs | Minimum for Next.js server |
| **RAM** | 4 GB | 8 GB recommended |
| **Storage** | 50 GB SSD | For application and logs |
| **Bandwidth** | 100 GB/month | Depends on usage |

**Recommended Platforms:**
- Vercel (Free tier for small projects)
- DigitalOcean Droplet ($24/month)
- AWS EC2 t3.small ($17/month)

#### Medium Deployment (500-2000 users)

| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 4 vCPUs | For better concurrency |
| **RAM** | 8 GB | Handle more simultaneous users |
| **Storage** | 100 GB SSD | Application + database backups |
| **Bandwidth** | 500 GB/month | Higher traffic capacity |

**Recommended Platforms:**
- Vercel Pro ($20/month)
- DigitalOcean Droplet ($48/month)
- AWS EC2 t3.medium ($35/month)

#### Large Deployment (2000+ users)

| Component | Specification | Notes |
|-----------|---------------|-------|
| **CPU** | 8+ vCPUs | Load balanced across instances |
| **RAM** | 16+ GB | Per instance |
| **Storage** | 200+ GB SSD | Scalable storage |
| **Bandwidth** | 1+ TB/month | High traffic capacity |
| **Load Balancer** | Required | Distribute traffic across instances |
| **CDN** | Required | Static asset delivery |

**Recommended Architecture:**
- Vercel Enterprise (Custom pricing)
- AWS/Azure/GCP with load balancing
- Kubernetes cluster

---

## 4.2 Software Requirements

### 4.2.1 Required Software (Development)

#### Core Runtime

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | 18.x or 20.x (LTS) | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x+ (comes with Node.js) | Package manager | Bundled with Node.js |
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com/) |

> **Important:** Node.js 18 or 20 (LTS versions) are required. Node.js 21+ may have compatibility issues.

#### Verification Commands

After installation, verify versions:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or v20.x.x

# Check npm version
npm --version
# Expected output: 9.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.40.x or higher
```

### 4.2.2 Development Tools (Recommended)

#### Code Editor

**Visual Studio Code** (Recommended)

| Extension | Purpose | Install Command |
|-----------|---------|-----------------|
| **ES7+ React/Redux Snippets** | React code snippets | `ext install dsznajder.es7-react-js-snippets` |
| **Tailwind CSS IntelliSense** | TailwindCSS autocomplete | `ext install bradlc.vscode-tailwindcss` |
| **Prettier** | Code formatting | `ext install esbenp.prettier-vscode` |
| **ESLint** | Linting | `ext install dbaeumer.vscode-eslint` |
| **TypeScript and JavaScript Language Features** | TypeScript support | Built-in |
| **GitLens** | Git integration | `ext install eamodio.gitlens` |

**Alternative Editors:**
- WebStorm (Paid, full-featured IDE)
- Sublime Text
- Atom (discontinued, use VSCode instead)

#### Database Tools (Optional)

| Tool | Purpose | Platform |
|------|---------|----------|
| **Supabase Dashboard** | Database management | Web-based (recommended) |
| **pgAdmin** | PostgreSQL administration | Cross-platform |
| **DBeaver** | Universal database tool | Cross-platform |
| **TablePlus** | Modern database client | macOS, Windows, Linux |

#### API Testing Tools

| Tool | Purpose | Platform |
|------|---------|----------|
| **Thunder Client** | VS Code API testing | VS Code extension |
| **Postman** | API development & testing | Cross-platform |
| **Insomnia** | REST client | Cross-platform |
| **cURL** | Command-line API testing | Command-line |

#### Browser Developer Tools

All modern browsers include developer tools. Recommended for testing:

- **Chrome DevTools** (Primary)
- **Firefox Developer Tools**
- **Edge DevTools**
- **Safari Web Inspector**

### 4.2.3 Runtime Dependencies (Production)

#### Production Hosting Requirements

**For Vercel (Recommended):**
- No server required (serverless)
- Automatic scaling
- Built-in CDN
- Zero configuration

**For Self-Hosted (VPS/Cloud):**

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.x or 20.x LTS | Runtime environment |
| **PM2** | Latest | Process manager |
| **Nginx** | 1.22+ | Reverse proxy (optional) |
| **systemd** | System default | Service management (Linux) |

---

## 4.3 Network Requirements

### 4.3.1 Bandwidth Requirements

#### Development Environment

| Activity | Bandwidth | Frequency |
|----------|-----------|-----------|
| **Initial Clone** | ~500 MB | One-time |
| **npm install** | ~200 MB | Per setup |
| **Hot Reload** | Minimal | Continuous |
| **API Requests** | < 1 MB/min | Development |

**Recommended:** 10 Mbps+ download speed

#### Production Environment

| User Load | Bandwidth | Notes |
|-----------|-----------|-------|
| **< 100 concurrent** | 10 Mbps | Small school |
| **100-500 concurrent** | 50 Mbps | Medium school |
| **500+ concurrent** | 100+ Mbps | Large school, use CDN |

**Peak Usage:** Expect 3-5x normal bandwidth during:
- Exam periods (quiz taking)
- Assignment deadlines
- Report card releases

### 4.3.2 Port Configuration

#### Development Ports

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| **Next.js Dev Server** | 3000 | HTTP | Frontend application |
| **Core API** | 3001 | HTTP | Backend API (if running locally) |
| **Chat Service** | 3002 | HTTP/WS | Chat service (if running locally) |
| **Webpack HMR** | Random | WebSocket | Hot Module Replacement |

#### Production Ports

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| **HTTP** | 80 | HTTP | Redirect to HTTPS |
| **HTTPS** | 443 | HTTPS | Primary access |
| **SSH** | 22 | SSH | Server administration (if self-hosted) |

> **Security Note:** Never expose database ports (5432 for PostgreSQL) to the public internet.

### 4.3.3 Firewall Rules

#### Development Environment

- **Outbound:** Allow all (for npm, git, API calls)
- **Inbound:** Allow port 3000 (localhost only)

#### Production Environment (Self-Hosted)

**Inbound Rules:**

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 80 | TCP | 0.0.0.0/0 | HTTP (redirect to HTTPS) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (primary access) |
| 22 | TCP | Admin IPs only | SSH (restrict to known IPs) |

**Outbound Rules:**

| Port | Protocol | Destination | Purpose |
|------|----------|-------------|---------|
| 443 | TCP | Supabase | Database connection |
| 443 | TCP | Cloudflare | R2 storage access |
| 443 | TCP | Any | API calls, updates |

#### Recommended Security Configuration

```bash
# Example UFW (Ubuntu Firewall) configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from <your-ip> to any port 22
sudo ufw enable
```

---

## 4.4 Browser Compatibility Matrix

### 4.4.1 Supported Browsers (Desktop)

The application is tested and fully supported on modern browsers:

| Browser | Minimum Version | Recommended | Support Level |
|---------|----------------|-------------|---------------|
| **Google Chrome** | 100+ | Latest | ✅ Full Support |
| **Microsoft Edge** | 100+ | Latest | ✅ Full Support |
| **Mozilla Firefox** | 100+ | Latest | ✅ Full Support |
| **Safari** | 15+ | Latest | ✅ Full Support |
| **Opera** | 85+ | Latest | ⚠️ Partially Tested |
| **Brave** | 1.40+ | Latest | ⚠️ Partially Tested |

> **Note:** Internet Explorer 11 is **not supported**. Users on IE11 will see an upgrade notice.

### 4.4.2 Mobile Browser Support

| Browser | Platform | Minimum Version | Support Level |
|---------|----------|----------------|---------------|
| **Safari** | iOS | iOS 15+ | ✅ Full Support |
| **Chrome** | Android | Android 10+ | ✅ Full Support |
| **Samsung Internet** | Android | Latest | ⚠️ Partially Tested |
| **Firefox Mobile** | Android | Latest | ⚠️ Partially Tested |

**Responsive Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### 4.4.3 Feature Compatibility

#### Modern JavaScript Features

All supported browsers must support:

| Feature | Requirement | Fallback |
|---------|-------------|----------|
| **ES2020** | Native support | None (polyfills not included) |
| **Async/Await** | Native support | Required |
| **Modules (ESM)** | Native support | Required |
| **WebSocket** | Native support | Required for chat |
| **Service Workers** | Native support | Optional (PWA features) |
| **IndexedDB** | Native support | Optional (offline storage) |

#### CSS Features

| Feature | Requirement | Fallback |
|---------|-------------|----------|
| **CSS Grid** | Native support | Required |
| **Flexbox** | Native support | Required |
| **CSS Custom Properties** | Native support | Required (for theming) |
| **CSS Animations** | Native support | Graceful degradation |

#### Browser-Specific Issues

**Safari:**
- Date input format handling may differ
- Service Worker limitations in Private Browsing mode

**Firefox:**
- WebSocket connection limits (configurable)
- Developer Tools performance profiling differences

**Mobile Safari (iOS):**
- Viewport height calculation differences
- Fullscreen API limitations (quiz mode)

### 4.4.4 Accessibility Requirements

The application supports:

| Standard | Level | Notes |
|----------|-------|-------|
| **WCAG 2.1** | AA | Target compliance level |
| **Screen Readers** | NVDA, JAWS, VoiceOver | Tested |
| **Keyboard Navigation** | Full support | All interactive elements |
| **Color Contrast** | 4.5:1 minimum | Text and backgrounds |

**Assistive Technology Compatibility:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS, iOS)
- TalkBack (Android)

---

## System Requirements Summary

### Quick Reference Checklist

**Development Setup:**
- [ ] Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)
- [ ] 8 GB RAM minimum (16 GB recommended)
- [ ] Node.js 18.x or 20.x LTS installed
- [ ] npm 9.x+ installed
- [ ] Git 2.40+ installed
- [ ] Code editor (VS Code recommended)
- [ ] 10+ Mbps internet connection
- [ ] Modern browser (Chrome, Edge, Firefox, or Safari)

**Production Hosting:**
- [ ] 2-4 vCPUs (depending on user load)
- [ ] 4-8 GB RAM (depending on user load)
- [ ] 50-100 GB SSD storage
- [ ] 100+ GB/month bandwidth
- [ ] HTTPS certificate (Let's Encrypt or paid)
- [ ] Supabase account configured
- [ ] Cloudflare R2 account configured (for storage)

**Network Configuration:**
- [ ] Firewall rules configured (ports 80, 443)
- [ ] SSH access restricted to admin IPs
- [ ] Database ports not exposed publicly
- [ ] CDN configured for static assets (production)

**Browser Support:**
- [ ] Chrome 100+
- [ ] Edge 100+
- [ ] Firefox 100+
- [ ] Safari 15+
- [ ] Mobile browsers (iOS 15+, Android 10+)

---

## Navigation

- [← Previous: Architecture & Design](../volume-1-system-overview/03-architecture-design.md)
- [Next: Development Environment Setup →](./05-development-environment-setup.md)
- [↑ Back to Volume 2 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
