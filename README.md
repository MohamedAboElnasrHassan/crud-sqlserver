# 🗄️ CRUD SQL Server Management System

<div align="center">

![CRUD SQL Server](https://img.shields.io/badge/CRUD-SQL%20Server-blue?style=for-the-badge&logo=microsoft-sql-server)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=for-the-badge&logo=quasar&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**نظام إدارة قواعد البيانات SQL Server شامل**

*A comprehensive database management system for SQL Server with CRUD operations*

[📥 Download Latest](../../releases/latest) • [📖 Documentation](SMART-RELEASE.md) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

---

## 🌟 Features / الميزات

### 🔧 **Core Features**
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete
- ✅ **SQL Server Integration** - Native SQL Server connectivity
- ✅ **Windows Classic UI** - Familiar Windows interface
- ✅ **Arabic & English Support** - Bilingual interface
- ✅ **Auto-Update System** - Smart automatic updates
- ✅ **Cross-Platform** - Windows, macOS, Linux

### 🤖 **Smart Automation**
- ✅ **Smart Auto-Release** - Intelligent version management
- ✅ **Auto-Commit Helper** - Smart commit message generation
- ✅ **Code Quality Checks** - ESLint, TypeScript, Prettier
- ✅ **GitHub Actions CI/CD** - Automated building and deployment

### 🎨 **User Experience**
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Dark/Light Mode** - Theme switching
- ✅ **Keyboard Shortcuts** - Efficient navigation
- ✅ **Error Handling** - Comprehensive error management

---

## 🚀 Quick Start / البدء السريع

### 📋 Prerequisites / المتطلبات
- **Node.js** 18+ 
- **npm** or **yarn**
- **SQL Server** (local or remote)

### 🔧 Installation / التثبيت

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/crud-sqlserver.git
cd crud-sqlserver

# Install dependencies
npm install

# Smart setup (auto-configures everything)
npm run smart-setup
```

### 🎯 Development / التطوير

```bash
# Start development server
npm run dev:electron

# Smart commit (with helper)
npm run quick-commit

# Build for production
npm run build:electron
```

---

## 📚 Available Scripts / الأوامر المتاحة

### 🔍 **Code Quality**
```bash
npm run lint          # ESLint check
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run type-check    # TypeScript check
npm run fix-all       # Fix all issues
```

### 🛠️ **Development**
```bash
npm run dev           # Web development
npm run dev:electron  # Electron development
npm run dev:pwa       # PWA development
```

### 🏗️ **Building**
```bash
npm run build                    # Build web app
npm run build:electron          # Build Electron app
npm run build:electron:win      # Build for Windows
npm run build:electron:mac      # Build for macOS
npm run build:electron:linux    # Build for Linux
```

### 🚀 **Publishing**
```bash
npm run release                  # Publish release
npm run release:draft           # Publish as draft
npm run release:win             # Publish Windows only
```

### 🤖 **Smart Automation**
```bash
npm run smart-setup             # Initial smart setup
npm run smart-commit            # Smart commit helper
npm run quick-commit            # Fix + commit in one step
npm run pre-release             # Pre-release checks
```

---

## 🏗️ Project Structure / هيكل المشروع

```
crud-sqlserver/
├── 📁 src/                     # Source code
│   ├── 📁 components/          # Vue components
│   ├── 📁 layouts/             # Page layouts
│   ├── 📁 pages/               # Application pages
│   ├── 📁 stores/              # Pinia stores
│   ├── 📁 router/              # Vue Router
│   ├── 📁 i18n/                # Internationalization
│   └── 📁 css/                 # Stylesheets
├── 📁 src-electron/            # Electron main process
├── 📁 scripts/                 # Automation scripts
├── 📁 .github/workflows/       # GitHub Actions
├── 📄 quasar.config.ts         # Quasar configuration
├── 📄 package.json             # Dependencies & scripts
└── 📄 .smart-release.json      # Smart release config
```

---

## 🔧 Configuration / الإعدادات

### ⚙️ **Smart Release Configuration**
Edit `.smart-release.json` to customize:
- Auto-release schedule
- Version bump rules
- Cleanup settings
- Notification preferences

### 🗄️ **Database Configuration**
Configure SQL Server connection in:
- `src/stores/database.ts`
- Environment variables in `.env`

---

## 🤝 Contributing / المساهمة

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** using smart helper: `npm run smart-commit`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### 📝 **Commit Message Format**
```
type(scope): description

Examples:
feat: add smart auto-release system
fix: resolve database connection issue
BREAKING: change API structure
```

---

## 📄 License / الرخصة

This project is licensed under the **MIT License** - see the [LICENSE.txt](LICENSE.txt) file for details.

---

## 🙏 Acknowledgments / الشكر والتقدير

- **Quasar Framework** - Amazing Vue.js framework
- **Electron** - Cross-platform desktop apps
- **Vue.js** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript

---

## 📞 Support / الدعم

- 📧 **Email**: mohamed.aboelnasr.hassan@gmail.com
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)

---

<div align="center">

**Made with ❤️ by Mohamed Abo Elnasr Hassan**

*صُنع بـ ❤️ بواسطة محمد أبو النصر حسن*

</div>
