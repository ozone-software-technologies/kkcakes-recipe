# KKCakes Project Context

## Overview
KKCakes is a full-stack web application designed for managing a bakery's daily operations. The system handles inventory management, orders, and recipes with dedicated modules for business efficiency. The application requires a secure authentication login screen before accessing the system.

## Tech Stack
- **Frontend (Client)**: Next.js 16 (React 19), Tailwind CSS v4, TypeScript
- **Backend (Server)**: Node.js, Express.js 5, TypeScript
- **Database / ORM**: MongoDB with Mongoose
- **Authentication/Other**: Firebase (Client) & Firebase Admin (Server)

## Key Application Modules
The project covers the following main modules:
1. **Dashboard**
    - Displays widgets for today's orders and today's inventory status.
2. **Ingredients**
    - Functionality to list, add, edit, and delete ingredients.
    - Ingredient types: Processed, Raw.
    - Field properties: Measurement units are selected via a combo box, with the following options: Grams, Pieces, and Liters.
3. **Recipes**
    - Manage standard bakery recipes mapping ingredients.
4. **Inventory**
    - Track stock levels and perform stock operations.
5. **Orders**
    - Manage customer cake orders and sales.
6. **Users**
    - User/role management for the system (along with login).

## Project Structure
The repository is split into two primary segments:
- `/client`: The Next.js frontend web application codebase containing standard components, pages (App Router / Pages), and client setups.
- `/server`: The Express.js backend application holding API routes, middleware, Mongoose models, and Firebase utilities.
