# Cloudflare DDNS Web UI

A self-hosted **Dynamic DNS management web interface** built with Cloudflare DNS API.

**🌍 Languages**: [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Docker Hub](https://img.shields.io/docker/v/gmkseta/ddns-ui?label=docker%20hub)

## 🚨 Important: Self-Hosted Solution

**This is a self-hosted application** that you need to run on your own server or computer. Unlike cloud-based DDNS services, you maintain full control and ownership of your DNS management system.

### 📍 Where to install:
- **Home server** (NAS, Raspberry Pi, etc.)
- **VPS/Cloud server** (DigitalOcean, AWS, etc.)
- **Local computer** (development/testing)
- **Docker-capable device** anywhere

## 🚀 Why Choose This Over Traditional DDNS Services?

### 💸 Cost Comparison with Popular Services

| Service | Price | Domain | Renewal | Limitations |
|---------|-------|--------|---------|-------------|
| **NoIP** | Free/Paid | Limited domains | Manual every 30 days | Feature restrictions |
| **DynDNS** | $55/year | Limited domains | Automatic | Monthly subscription |
| **Duck DNS** | Free | Subdomains only | Automatic | No custom domains |
| **AWS Route 53** | ~$15/year | Your domain | Automatic | Complex setup, costs |
| **🌟 This Project** | **FREE** | **Your own domain** | **Automatic** | **No limitations** |

### ✨ Why Self-Host Instead of Using Cloud Services?

#### 🔒 **Complete Control**
- **Your data stays yours**: No third-party access to your DNS records
- **No vendor lock-in**: Full control over your infrastructure
- **Custom features**: Modify and extend as needed

#### 💰 **Significant Cost Savings**
- **NoIP Premium**: $24.95/year → **$0**
- **DynDNS**: $55/year → **$0**
- **Multiple domains**: Pay per domain vs. **unlimited free**

#### 🌐 **Superior Performance**
- **Cloudflare's global CDN**: 99.9% uptime guarantee
- **Free SSL certificates**: Automatic HTTPS
- **DDoS protection**: Enterprise-grade security
- **Analytics**: Detailed traffic insights

#### 🔧 **Professional Features**
- **Multiple DNS providers**: Cloudflare (more coming soon)
- **Web interface**: No command-line knowledge required
- **Automatic updates**: Set-and-forget operation
- **Backup/restore**: JSON export/import functionality

## 🗺️ Roadmap: Multi-Provider Support

### 🎯 Currently Supported
- ✅ **Cloudflare DNS** (free tier: unlimited domains)

### 🚧 Coming Soon
- 🔄 **AWS Route 53** (pay-per-query pricing)
- 🔄 **DigitalOcean DNS** (free with droplets)
- 🔄 **Namecheap DNS** (free with domain purchase)
- 🔄 **Google Cloud DNS** (pay-per-query)
- 🔄 **Azure DNS** (pay-per-query)

### 💡 Why Multiple Providers?
- **Choice and flexibility**: Use your preferred DNS provider
- **Redundancy**: Switch providers if needed
- **Cost optimization**: Choose the most cost-effective option
- **Regional preferences**: Some providers work better in certain regions

## ✨ Key Features

- 🔐 **Secure Authentication**: JWT-based admin login
- 🔑 **API Key Management**: Register and manage multiple DNS provider tokens
- 🌐 **Zone Management**: Select and manage domain zones
- 📝 **DNS Records**: Add/edit/delete A/CNAME records
- 🔄 **Smart Auto-Updates**: Automatic IP change detection and updates
- 📊 **Monitoring**: Update logs and real-time status
- 📤 **Backup/Restore**: JSON export/import for configurations
- 🌍 **Multilingual Support**: Korean, English, Japanese interface
- 🐳 **Docker Ready**: One-click deployment with Docker

## 🚀 Quick Start

### 🐳 Option 1: Docker Hub (Fastest)

```bash
# Quick run with Docker
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  -e JWT_SECRET=your-random-jwt-secret-key \
  --restart unless-stopped \
  gmkseta/ddns-ui:latest
```

### 🐳 Option 2: Docker Compose

```yaml
version: '3.8'
services:
  ddns-ui:
    image: gmkseta/ddns-ui:latest
    container_name: ddns-ui
    ports:
      - "3000:3000"
    environment:
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=your-secure-password
      - JWT_SECRET=your-random-jwt-secret-key
      - UPDATE_INTERVAL=5
    volumes:
      - ddns-data:/app/data
    restart: unless-stopped

volumes:
  ddns-data:
```

### 🖥️ Option 3: Local Development

```bash
# Clone and install
git clone https://github.com/gmkseta/ddns-ui
cd ddns-ui
yarn install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
yarn dev
```

## 📋 Setup Guide

### 1. Get Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Set permissions: `Zone:Read`, `DNS:Edit`
5. Add your domain to zone resources
6. Copy the generated token

### 2. Configure the Application

1. Access the web interface at `http://localhost:3000`
2. **Choose your language**: Click the language selector (🇰🇷/🇺🇸/🇯🇵) in the top navigation
3. Login with your admin credentials
4. Go to "API Key Settings" → Add your Cloudflare token
5. Select your domain zone
6. Add/manage DNS records
7. Enable "Auto Update" for DDNS functionality

### 🌍 Language Support

The interface supports three languages with automatic browser detection:
- **Korean (한국어)**: Default language - `http://localhost:3000/ko`
- **English**: International users - `http://localhost:3000/en`  
- **Japanese (日本語)**: Japanese market - `http://localhost:3000/ja`

The system automatically redirects to your preferred language based on browser settings, or you can manually select using the language switcher in the navigation bar.

### 3. Enjoy Automatic DDNS

- The system checks your public IP every 5 minutes
- Automatically updates DNS records when IP changes
- Monitor updates in the dashboard
- Export/import configurations as needed

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `changeme` |
| `JWT_SECRET` | JWT token secret | (required) |
| `DATABASE_PATH` | SQLite database path | `./data/db.sqlite3` |
| `UPDATE_INTERVAL` | Update interval (minutes) | `5` |
| `NODE_ENV` | Runtime environment | `development` |

## 🤖 Built with AI Pair Programming

This project was developed using **AI-assisted programming** with **Cursor AI** and **Claude Sonnet 4**.

### 🚀 Development Process
1. **Ideation**: AI-assisted requirement gathering
2. **Architecture**: Optimal tech stack selection
3. **Coding**: Real-time AI coding assistance
4. **Optimization**: AI-powered code review
5. **Documentation**: Comprehensive auto-generated docs
6. **Deployment**: Docker optimization and automation

### 💡 Benefits of AI Development
- ⚡ **Rapid prototyping**: Ideas to implementation instantly
- 🔍 **Code quality**: AI applies best practices automatically
- 📚 **Learning**: Continuous knowledge transfer during development
- 🐛 **Bug prevention**: Real-time code analysis and fixes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite3 (file-based, no external dependencies)
- **Authentication**: JWT (jose)
- **HTTP Client**: Axios
- **State Management**: TanStack Query
- **Internationalization**: Next-intl (Korean, English, Japanese)
- **Icons**: Heroicons
- **Deployment**: Docker, Docker Compose
- **CI/CD**: GitHub Actions (automated testing & deployment)

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info

### IP Detection
- `GET /api/ip` - Get current public IP

### Configuration
- `GET/POST/DELETE /api/config/apikey` - API key management

### DNS Management
- `GET /api/zones` - List zones
- `GET/POST/PUT/DELETE /api/records` - DNS record CRUD

### DDNS Updates
- `GET/POST /api/ddns/update` - Auto-update status/execution

## 🔒 Security Considerations

- JWT token-based authentication
- API keys stored locally (encrypt at rest recommended)
- HTTPS recommended for production
- Regular password rotation advised
- Network isolation for self-hosted deployments

## 🚀 Development & Contributing

### 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/gmkseta/ddns-ui
cd ddns-ui

# Install dependencies
yarn install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
yarn dev
```

### 🤝 Contributing

We welcome contributions! Here's how our automated workflow works:

#### 📋 Pull Request Process
1. **Fork & Branch**: Create a feature branch from `main`
2. **Code**: Implement your changes following our style guide
3. **Commit**: Use conventional commit messages (feat:, fix:, docs:, etc.)
4. **Push**: Push your branch and create a Pull Request

#### 🤖 Automated Checks
Every PR automatically runs:
- 🔍 **ESLint**: Code style and quality checks
- 🏷️ **TypeScript**: Type safety validation  
- 🏗️ **Build Test**: Ensure production builds work
- 🐳 **Docker Build**: Container image validation
- 🔒 **Security Scan**: Dependency vulnerability checks
- 📋 **Dependency Review**: License and security analysis

#### 🚀 Automated Deployment
When merged to `main`:
- 🐳 **Docker Hub**: Automatic multi-arch image build (AMD64/ARM64)
- 📦 **Versioning**: Semantic version tagging  
- 🔒 **Security**: Container vulnerability scanning
- 📢 **Notifications**: Deployment status updates

#### 🏷️ Auto-Labeling
PRs are automatically labeled based on changed files:
- 🌍 **i18n**: Translation/localization changes
- 🎨 **frontend**: UI/component changes  
- ⚡ **backend**: API/server changes
- 🐳 **docker**: Container/deployment changes
- 📚 **documentation**: README/docs updates

### 💡 Development Tips

```bash
# Code quality checks
yarn lint          # Run ESLint
yarn lint --fix    # Auto-fix issues
yarn type-check    # TypeScript validation
yarn build         # Production build test

# Docker development
docker build -t ddns-ui-dev .
docker run -p 3000:3000 ddns-ui-dev
```

## 🌟 Why Self-Host Your DDNS?

### 🏠 Perfect for Home Labs
- **Home servers**: NAS, media servers, development machines
- **IoT devices**: Raspberry Pi, embedded systems
- **Remote access**: SSH, VPN, web services from anywhere

### 🏢 Enterprise Benefits
- **Cost control**: No per-domain fees for large deployments
- **Compliance**: Keep DNS data in-house
- **Integration**: Custom workflows and automation
- **Scalability**: Handle hundreds of domains without restrictions

### 🔧 Developer Advantages
- **Full control**: Modify and extend functionality
- **No rate limits**: Beyond what your DNS provider allows
- **Local development**: Test changes without external dependencies
- **Open source**: Contribute improvements back to community

## 📚 Useful Links

### 🛠️ Development Tools
- [Cursor AI](https://cursor.sh/) - AI-powered code editor
- [Claude Sonnet](https://www.anthropic.com/claude) - AI assistant

### 🌐 Services
- [Cloudflare](https://www.cloudflare.com/) - DNS and CDN services
- [Docker Hub](https://hub.docker.com/r/gmkseta/ddns-ui) - Container registry

### 📖 Documentation
- [Cloudflare API](https://developers.cloudflare.com/api/) - DNS API docs
- [Next.js](https://nextjs.org/) - React framework
- [Docker](https://docs.docker.com/) - Containerization guide

## 🙏 Credits

- **Development**: AI pair programming (Cursor + Claude Sonnet 4)
- **Design**: Inspired by Toss design system
- **Infrastructure**: Powered by Cloudflare's free tier
- **Community**: Docker Hub and open-source ecosystem

---

💡 **Pro Tip**: Save $25-55 per year compared to traditional DDNS services while getting better performance, more features, and complete control over your DNS infrastructure!
