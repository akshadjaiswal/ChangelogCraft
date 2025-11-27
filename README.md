# ChangelogCraft

> AI-Powered Changelog Generation for GitHub Repositories

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**ChangelogCraft** transforms your Git commit history into beautifully formatted, AI-generated changelogs. Connect your GitHub repositories, select a date range, and let AI create professional release notes that you can share publicly or export in multiple formats.

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Smart Categorization**: Automatically groups commits into Features, Bug Fixes, Performance, Documentation, and more
- **Natural Language**: Converts technical commits into user-friendly release notes
- **Context-Aware**: Uses Groq's Llama 3.1 70B model for intelligent summarization

### 🔗 GitHub Integration
- **OAuth Authentication**: Secure GitHub login
- **Repository Access**: Browse and select from your GitHub repos
- **Commit Analysis**: Fetches and analyzes commit history with metadata

### 📤 Multiple Export Options
- **Markdown**: Copy formatted markdown for README or release notes
- **Public Links**: Share beautiful, publicly accessible changelog pages
- **Raw Format**: Export raw markdown for further processing

### 🎨 Modern UI/UX
- **Dark Mode**: Full dark theme support with smooth transitions
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Preview**: See changelogs render in real-time as they generate
- **Skeleton Loaders**: Beautiful loading states for better UX

### 📊 Dashboard & Analytics
- **Repository Management**: View and manage all your connected repositories
- **Changelog History**: Track all previously generated changelogs
- **View Counts**: Monitor how many people view your public changelogs
- **Search & Filter**: Quickly find changelogs by name or repository

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, Radix UI, Lucide Icons, shadcn/ui |
| **Backend** | Next.js API Routes, Supabase (PostgreSQL) |
| **AI/LLM** | Groq SDK (Llama 3.1 70B), Streaming Responses |
| **Authentication** | GitHub OAuth 2.0, JWT Sessions, Supabase Auth |
| **State Management** | Zustand, TanStack React Query |
| **Utilities** | date-fns, react-markdown, remark-gfm, axios |
| **Developer Tools** | ESLint, Prettier, TypeScript Strict Mode |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **GitHub Account** (for OAuth)
- **Supabase Account** (for database)
- **Groq API Key** (for AI generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshadjaiswal/changelogcraft.git
   cd changelogcraft/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the frontend directory:

   ```env
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback

   # Groq AI Configuration
   GROQ_API_KEY=your_groq_api_key

   # JWT Secret (generate a random string)
   SESSION_SECRET=your_secure_random_jwt_secret
   ```

4. **Set up Supabase Database**

   Run the SQL migrations in your Supabase SQL Editor:
   ```sql
   -- See /supabase/migrations for complete schema
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── changelog/            # Changelog generation endpoints
│   │   │   ├── changelogs/           # Changelog CRUD endpoints
│   │   │   └── repositories/         # Repository endpoints
│   │   ├── changelog/                # Public changelog pages
│   │   │   └── [username]/[repo]/[id]/
│   │   ├── dashboard/                # Protected dashboard pages
│   │   │   ├── changelogs/           # Changelog list page
│   │   │   ├── repositories/         # Repository management
│   │   │   │   └── [id]/             # Repository detail & generation
│   │   │   └── settings/             # User settings
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles & Tailwind config
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── changelog/                # Changelog-specific components
│   │   │   ├── changelog-generator.tsx
│   │   │   └── export-buttons.tsx
│   │   └── dashboard/                # Dashboard components
│   │       ├── sidebar.tsx
│   │       ├── footer.tsx
│   │       ├── changelog-list.tsx
│   │       └── repository-list.tsx
│   ├── lib/
│   │   ├── auth/                     # Authentication utilities
│   │   ├── github/                   # GitHub API client
│   │   ├── groq/                     # Groq AI client
│   │   ├── supabase/                 # Supabase client & helpers
│   │   ├── stores/                   # Zustand stores
│   │   └── utils/                    # Utility functions
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # TypeScript type definitions
│   └── middleware.ts                 # Next.js middleware
├── public/                           # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## 🏗️ Architecture

### App Router Architecture

ChangelogCraft uses Next.js 16 App Router with Server and Client Components:

- **Server Components**: Default for all pages, used for data fetching and SEO
- **Client Components**: Used for interactive elements (marked with `'use client'`)
- **API Routes**: RESTful endpoints in `/app/api/` for backend operations
- **Middleware**: Session validation and authentication checks

### Authentication Flow

```
User clicks "Login with GitHub"
    ↓
GitHub OAuth consent screen
    ↓
Callback to /api/auth/callback
    ↓
Exchange code for GitHub token
    ↓
Fetch user profile from GitHub
    ↓
Create/update user in Supabase
    ↓
Generate JWT session token
    ↓
Set secure HTTP-only cookie
    ↓
Redirect to /dashboard
```

### Changelog Generation Pipeline

```
User selects repository & date range
    ↓
Fetch commits from GitHub API
    ↓
Filter commits by date range
    ↓
Build AI prompt with commit data
    ↓
Stream response from Groq API
    ↓
Parse & format markdown
    ↓
Save to Supabase database
    ↓
Display with preview/raw tabs
    ↓
Generate public shareable link
```

### Database Schema

**Users Table**
- `id` (uuid, primary key)
- `github_id` (text, unique)
- `username` (text)
- `email` (text)
- `avatar_url` (text)
- `created_at`, `updated_at` (timestamp)

**Repositories Table**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users)
- `github_id` (text, unique)
- `name`, `full_name` (text)
- `description`, `language` (text, nullable)
- `html_url` (text)
- `created_at`, `updated_at` (timestamp)

**Changelogs Table**
- `id` (uuid, primary key)
- `repository_id` (uuid, foreign key → repositories)
- `title` (text)
- `markdown` (text)
- `date_from`, `date_to` (date)
- `commit_count` (integer)
- `template_type` (text)
- `view_count` (integer, default 0)
- `generated_at` (timestamp)

---

## 🔧 Environment Setup

### 1. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: ChangelogCraft (or your preference)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`
4. Copy `Client ID` and `Client Secret` to `.env.local`

### 2. Supabase Configuration

1. Create a new project at [Supabase](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Run database migrations in SQL Editor (see `/supabase/migrations`)

### 3. Groq API Key

1. Sign up at [Groq](https://console.groq.com)
2. Navigate to API Keys
3. Create a new API key
4. Copy to `GROQ_API_KEY` in `.env.local`

### 4. JWT Secret

Generate a secure random string for JWT signing:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Prefer functional components with hooks
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **Formatting**: Run `npm run lint` before committing

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Akshad**

- GitHub: [@akshadjaiswal](https://github.com/akshadjaiswal)
- Twitter: [@akshad_999](https://twitter.com/akshad_999)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Groq](https://groq.com/) - Lightning-fast AI inference
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

---

## 📞 Support

If you have any questions or need help, please:
- Open an [Issue](https://github.com/akshadjaiswal/ChangelogCraft/issues)
- Start a [Discussion](https://github.com/akshadjaiswal/ChangelogCraft/discussions)

---

<div align="center">

**Made with ❤️ using AI-powered changelog generation**

[⭐ Star this repo](https://github.com/akshadjaiswal/ChangelogCraft/) | [🐛 Report Bug](https://github.com/akshadjaiswal/ChangelogCraft/issues) | [✨ Request Feature](https://github.com/akshadjaiswal/ChangelogCraft/issues)

</div>
