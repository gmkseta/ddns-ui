# Cloudflare DDNS Manager

🌐 A modern, multilingual web-based Dynamic DNS (DDNS) management tool for Cloudflare DNS records with automatic IP monitoring and updates.

[![Docker Pulls](https://img.shields.io/docker/pulls/gmkseta/ddns-ui)](https://hub.docker.com/r/gmkseta/ddns-ui)
[![GitHub release](https://img.shields.io/github/release/gmkseta/ddns-ui.svg)](https://github.com/gmkseta/ddns-ui/releases)
[![License](https://img.shields.io/github/license/gmkseta/ddns-ui.svg)](LICENSE)

**🌍 Languages**: [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

## ✨ Features

- **🌍 Multilingual Support**: Korean (한국어), English, Japanese (日本語)
- **🔄 Dynamic IP Monitoring**: Automatically detects and updates your public IP address
- **☁️ Cloudflare Integration**: Direct integration with Cloudflare DNS API
- **🎨 Modern Web Interface**: Clean, responsive web UI with dark/light theme support
- **📱 Mobile-Friendly**: Optimized for mobile devices and tablets
- **🏗️ Multi-Zone Support**: Manage DNS records across multiple Cloudflare zones
- **⏰ Automatic Updates**: Configurable intervals for automatic IP checking and DNS updates
- **🎛️ Manual Control**: Instant manual IP updates and scheduler control
- **📊 Update Logs**: Track all IP changes with detailed logging
- **💾 Export/Import**: Backup and restore your DNS configurations
- **🔒 Secure**: JWT-based authentication with configurable credentials

## 🚀 Quick Start

### 🐳 Using Docker (Recommended)

```bash
# Pull and run the latest image
docker run -d \
  --name ddns-ui \
  -p 3000:3000 \
  -v ddns-data:/app/data \
  --restart unless-stopped \
  gmkseta/ddns-ui:latest
```

### 🐳 Using Docker Compose

1. Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  ddns-ui:
    image: gmkseta/ddns-ui:latest
    container_name: ddns-ui
    ports:
      - "${HOST_PORT:-3000}:3000"
    volumes:
      - ddns-data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production

volumes:
  ddns-data:
```

2. Optional: Create `.env` file for custom port:
```bash
HOST_PORT=8080
```

3. Start the service:
```bash
docker-compose up -d
```

### 🖥️ Local Development Setup

```bash
# Clone repository
git clone https://github.com/gmkseta/ddns-ui.git
cd ddns-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

### First-Time Setup

1. Access the web interface at `http://localhost:3000`
2. Login with default credentials:
   - Username: `admin`
   - Password: `password`
3. **⚠️ Important**: Change the default password immediately after first login
4. Select your preferred language (Korean/English/Japanese)
5. Add your Cloudflare API credentials:
   - Go to API Keys section
   - Add your Cloudflare API Token or Global API Key
   - Select your zone and configure DNS records

### Cloudflare API Setup

You need either:

**Option 1: API Token (Recommended)**
- Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- Create a token with `Zone:Read` and `DNS:Edit` permissions
- Scope it to your specific zone(s)

**Option 2: Global API Key**
- Go to [Cloudflare API section](https://dash.cloudflare.com/profile/api-tokens)
- Use your Global API Key + email address

### DNS Record Configuration

1. Select your API key and zone
2. Choose which DNS records to monitor for DDNS updates
3. Configure update intervals (recommended: 5-30 minutes)
4. Enable automatic updates for hands-free operation
5. Monitor changes in the Scheduler Logs tab

## 📱 Supported Languages

- **한국어 (Korean)** - Full localization
- **English** - Full localization  
- **日本語 (Japanese)** - Full localization

The interface automatically detects your browser language and switches accordingly. You can also manually change the language using the language switcher in the header.

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_PATH` | SQLite database file path | `./data/ddns.db` |

## 📡 API Endpoints

The application provides REST APIs for integration:

- `GET /api/ip` - Get current public IP
- `GET /api/zones` - List Cloudflare zones
- `GET /api/records` - List DNS records
- `POST /api/records/update` - Update DNS record
- `GET /api/logs` - Get update logs
- `POST /api/export` - Export configuration
- `POST /api/import` - Import configuration

## 💾 Data Persistence

All data is stored in a SQLite database located at `/app/data/ddns.db` inside the container. Make sure to mount this directory as a volume to persist your configuration across container restarts.

The database includes:
- User authentication data
- Cloudflare API keys and zones
- DNS record configurations
- Update logs and scheduler history
- Application settings

## 🔒 Security

- **Change Default Password**: Always change the default login credentials
- **API Key Security**: API keys are stored securely and can be exported/imported
- **JWT Authentication**: Session-based authentication with configurable expiration
- **Network Access**: Consider running behind a reverse proxy with HTTPS
- **Regular Backups**: Use the export feature to backup your configurations
- **Input Validation**: All inputs are validated and sanitized

## 🛠️ Troubleshooting

### Common Issues

1. **Cannot connect to Cloudflare API**
   - Verify your API token/key is correct
   - Check token permissions include Zone:Read and DNS:Edit
   - Ensure the zone ID is correct

2. **IP detection not working**
   - The app uses ipify.org (free service) for IP detection
   - Check your network connectivity
   - Verify no firewall is blocking outbound requests

3. **Container won't start**
   - Check if port 3000 is already in use
   - Verify Docker has sufficient permissions
   - Check container logs: `docker logs ddns-ui`

4. **Root path returns 404**
   - This is normal in development mode with Turbopack
   - Access via `/en`, `/ko`, or `/ja` directly
   - In production, root path redirects correctly

### Logs

View application logs:
```bash
# Docker
docker logs ddns-ui

# Docker Compose
docker-compose logs ddns-ui
```

## 🏗️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, SQLite
- **Internationalization**: next-intl
- **Authentication**: JWT
- **UI Components**: Custom components with dark/light theme
- **Build**: Docker multi-stage builds with optimized caching

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Development & CI/CD

### 🤖 Automated Workflow

Every Pull Request automatically runs:
- 🔍 **ESLint**: Code style and quality checks
- 🏷️ **TypeScript**: Type safety validation  
- 🏗️ **Build Test**: Ensure production builds work
- 🐳 **Docker Build**: Container image validation
- 🔒 **Security Scan**: Dependency vulnerability checks

When merged to `main`:
- 🐳 **Docker Hub**: Automatic multi-arch image build (AMD64/ARM64)
- 📦 **Versioning**: Semantic version tagging  
- 🔒 **Security**: Container vulnerability scanning

## 💰 Cost Comparison

### Why Choose This Over Traditional DDNS Services?

| Service | Price | Domain | Renewal | Limitations |
|---------|-------|--------|---------|-------------|
| **NoIP** | Free/Paid | Limited domains | Manual every 30 days | Feature restrictions |
| **DynDNS** | $55/year | Limited domains | Automatic | Monthly subscription |
| **Duck DNS** | Free | Subdomains only | Automatic | No custom domains |
| **🌟 This Project** | **FREE** | **Your own domain** | **Automatic** | **No limitations** |

### Benefits of Self-Hosting
- **Complete Control**: Your data stays yours
- **Cost Savings**: $0 vs $25-55/year for traditional services
- **Superior Performance**: Cloudflare's global CDN with 99.9% uptime
- **Professional Features**: Multi-domain support, web interface, backup/restore

## 🌟 Built with AI

This project was developed using **AI-assisted programming** with modern development tools, resulting in:
- ⚡ **Rapid Development**: Ideas to implementation instantly
- 🔍 **Code Quality**: AI-applied best practices
- 📚 **Comprehensive Documentation**: Auto-generated guides
- 🐛 **Bug Prevention**: Real-time code analysis

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ☕ Support

If you find this project helpful, consider buying me a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/gmkseta)

## 💬 Support & Issues

If you encounter any issues or have questions:
- [Open an issue](https://github.com/gmkseta/ddns-ui/issues) on GitHub
- Check the [troubleshooting section](#-troubleshooting) above
- Review existing issues for similar problems

## 🌟 Star History

If you like this project, please give it a ⭐ on GitHub!

---

💡 **Pro Tip**: Save $25-55 per year compared to traditional DDNS services while getting better performance, more features, and complete control over your DNS infrastructure!