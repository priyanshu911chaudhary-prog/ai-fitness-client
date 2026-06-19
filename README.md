# AI Fitness Tracker - Client

A premium, highly-aesthetic React frontend for the AI Fitness Tracker platform. Designed with an "Awwwards-winning" approach, this application features modern glassmorphism, fluid micro-animations, glowing bento-box layouts, and a dark zinc theme.

## 🚀 Overview

This repository contains the frontend client code built with **Vite + React**. It provides a sleek user interface for:
- User Authentication (Login / Signup)
- A comprehensive Dashboard for tracking macros and calories
- Workouts Library with an AI Routine Architect interface
- Meals Library with an AI Nutrition Architect interface
- User Profile and Settings

> **Note:** This frontend is currently operating in a **mocked state** utilizing local Zustand state management and mocked API delays. It is designed to be integrated with the `aifitness` backend API.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Form Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🎨 Design Philosophy

The UI/UX focuses on a highly premium feel:
- **Dark Theme:** Deep zinc backgrounds (`bg-zinc-950`) provide high contrast.
- **Neon Accents:** Emerald and Teal glowing gradients and blurs emphasize interactive elements.
- **Glassmorphism:** Frosted glass panels (`backdrop-blur-xl`, `bg-zinc-900/40`) create a sense of depth.
- **Micro-animations:** Hover effects, entrance fades, and dynamic floating elements bring the app to life.

## 📁 Folder Structure

```text
src/
├── components/
│   ├── layout/       # Sidebar, app wrappers
│   └── ui/           # Reusable atomic UI (Button, Input)
├── pages/
│   ├── auth/         # Login, Signup forms
│   ├── dashboard/    # Main user dashboard
│   ├── meals/        # Meal listing, AI generation, and creation
│   ├── workouts/     # Workout listing, AI generation, and creation
│   └── Landing.jsx   # Public-facing showcase landing page
├── store/            # Zustand state management (useFitnessStore.js)
├── utils/            # Axios API configuration (api.js)
├── App.jsx           # Main router and layout structure
└── index.css         # Global styles and custom keyframes
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. Navigate to the client directory:
   ```bash
   cd ai-fitness-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the localhost URL provided by Vite in your browser.

## 🔗 Backend Integration Next Steps

To connect this frontend to your real backend API:
1. Ensure your backend (`aifitness`) is running properly (e.g., ensure `GROQ_API_KEY` is set in its `.env`).
2. Update `src/utils/api.js` to point to your live backend endpoint.
3. Replace the `setTimeout` mock delays in `Login.jsx`, `Signup.jsx`, and AI Generators with real Axios calls.
4. Update the Zustand store (`src/store/useFitnessStore.js`) to fetch from `GET /api/v1/...` instead of relying on the initial hardcoded arrays.
