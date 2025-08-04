# ClaudioVeloso
Gestão de ofertas de trabalhos com marcação 

## 🚀 Live Demo
Visit the live application: [https://mrtfb.github.io/ClaudioVeloso](https://mrtfb.github.io/ClaudioVeloso)

## 📋 About
A Vue.js application for managing job offers and appointments, featuring:
- User type selection (Client/Installer)
- Job cards and listings
- Calendar view for scheduling
- Work session management
- Dashboard views for different user types

## 🛠️ Technology Stack
- **Frontend**: Vue.js 3 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3
- **State Management**: Pinia
- **Routing**: Vue Router
- **Icons**: Heroicons
- **Testing**: Vitest + Playwright

## 🏃‍♂️ Quick Start

### Clone repository
```bash
git clone https://github.com/mrtfb/ClaudioVeloso.git
cd ClaudioVeloso
```

### Install dependencies
```bash
npm install
# or
cd job-offer-app && npm install
```

### Test locally
```bash
npm run dev
# or
cd job-offer-app && npm run dev
```

### Build for production
```bash
npm run build
# or
cd job-offer-app && npm run build
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the `main` branch triggers a new deployment.

### Manual Deployment Steps
```bash
# Build the project
npm run build

# Commit and push changes
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

The site will be available at: `https://mrtfb.github.io/ClaudioVeloso`

## 📁 Project Structure
```
ClaudioVeloso/
├── .github/workflows/     # GitHub Actions workflows
├── job-offer-app/         # Main Vue.js application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── e2e/              # End-to-end tests
│   └── package.json      # App dependencies
└── README.md             # This file
```

## 🧪 Available Scripts

In the project root:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

In the job-offer-app directory:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the ISC License.