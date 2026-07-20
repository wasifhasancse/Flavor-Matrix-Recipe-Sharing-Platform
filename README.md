# Flavor Matrix - Recipe Sharing Platform

Flavor Matrix is a comprehensive full-stack recipe sharing platform where culinary enthusiasts can discover, create, and manage recipes. Users can explore a vast collection of recipes, use AI-powered tools for culinary advice and recipe generation, and purchase premium recipes. Admins and users have dedicated dashboards to manage their interactions and content seamlessly.

## Live URL
Client: https://flavor-matrix.vercel.app/ *(Replace with actual URL if deployed)*

## Project Purpose
- Provide a dynamic and interactive platform for culinary enthusiasts to discover, share, and manage recipes.
- Offer intelligent AI-powered tools to enhance the cooking experience, answer queries, and reduce food waste.
- Enable users to monetize and access premium recipes through secure Stripe integration.
- Provide robust, role-based dashboards for users to manage their recipes, favorites, and purchases, and for admins to oversee platform activity.

## Main Features

### Unique and High-Demand Features
- **AI Chat Assistant:** Get instant culinary advice, cooking tips, and answers to food-related queries via a 24/7 intelligent chat interface.
- **AI Recipe Generator:** Reduce food waste and discover new meals by turning random ingredients from your fridge into gourmet masterpieces.
- **Premium Recipe Subscriptions:** Stripe-integrated checkout for purchasing and accessing premium or exclusive recipes.
- **Comprehensive Role-Based Dashboards:** Separate interfaces for Admins (managing users, categories, reports, transactions, withdrawals, settings) and Users (managing purchased recipes, profile, analytics, adding recipes, my recipes).
- **Interactive Recipe Community:** Features like recipe liking, favoriting, and detailed analytics for recipe creators.

### Core Platform Features
- **Better Auth Integration:** Secure authentication with email/password and JWT session strategy, utilizing the MongoDB adapter.
- **Advanced Recipe Browsing:** Search, filter, and categorization of recipes on public listing pages.
- **Engaging UI/UX:** Built with HeroUI and Tailwind CSS, featuring smooth Framer Motion animations.
- **Responsive Design:** Fully responsive layout across mobile, tablet, and desktop devices.
- **Theme Support:** Built-in Dark/light theme toggle.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS, HeroUI, Framer Motion
- **Backend:** Next.js API Routes, Node.js, MongoDB
- **Auth:** Better Auth + MongoDB Adapter
- **Payments:** Stripe

## NPM Packages Used

**Core & UI**
- `next`, `react`, `react-dom`
- `@heroui/react`, `@heroui/styles`
- `framer-motion`, `motion`
- `lucide-react`
- `next-themes`
- `recharts` (for dashboard analytics)
- `swiper` (for carousels)

**Backend, Auth & Database**
- `better-auth`, `@better-auth/mongo-adapter`
- `mongodb`
- `jose`
- `stripe`

## Deployment Checklist
- Use environment variables for all secrets and credentials (e.g., Stripe keys, MongoDB URI, Auth secrets, AI API keys).
- Verify private routes and API endpoints are properly authenticated.
- Ensure all dynamic routes render without runtime errors in production.
- Test Stripe webhook endpoints for proper event handling in the production environment.
- Confirm that public pages load properly for unauthenticated visitors.
