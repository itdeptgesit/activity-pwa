# Activity Log IT - PWA Dashboard

A modern, high-performance Progressive Web Application (PWA) designed for IT personnel to efficiently log, track, and manage daily technical activities. Built with a focus on "Pristine Glass" aesthetics and a mobile-first user experience.

## ✨ Key Features

- **Bento Grid Dashboard**: A visually striking homepage featuring smart widgets for current tasks, daily goals, and urgent alerts.
- **Pristine Glass UI**: A premium user interface with elegant transparencies, soft blurs, and sophisticated typography.
- **Activity Detail Modal**: Immersive floating detail views for viewing comprehensive task logs without leaving the current context.
- **Smart Filtering**: Advanced filtering by Time (Today, Week, Month), Status (In Progress, Completed), and Priority (Critical).
- **Google Authentication**: Seamless and secure login integrated with Supabase Auth.
- **PWA Ready**: Installable on mobile and desktop devices with a focus on quick access and responsive interaction.

## 🚀 Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Backend**: Supabase (Auth, Database, Real-time)
- **Styling**: Vanilla CSS with modern Glassmorphism patterns
- **Animations**: Framer Motion for fluid transitions and micro-interactions
- **Icons**: Lucide React for a crisp, consistent iconography

## 🛠️ Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📅 Project Roadmap

- [x] Initial UI/UX Design (Pristine Glass)
- [x] Google Login Integration
- [x] Bento Dashboard & Recent Logs
- [x] Activity Management (CRUD)
- [x] Detail Modal Overhaul
- [ ] Offline Caching Capability
- [ ] Export Logs to CSV/PDF
- [ ] Row Level Security (RLS) Configuration

---
Developed with ❤️ by the IT Team.
