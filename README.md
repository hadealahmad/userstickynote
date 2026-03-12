# Twitter Sticky Notes

A Chrome extension that lets you attach private sticky notes to Twitter (X) user profiles and timeline tweets. Includes a Laravel backend for optional cloud sync and cross-device access.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Extension (Frontend)](#extension-frontend)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [How It Works](#how-it-works)
  - [Development](#development)
  - [Building & Installation](#building--installation)
- [Backend (Laravel)](#backend-laravel)
  - [Tech Stack](#backend-tech-stack)
  - [Project Structure](#backend-project-structure)
  - [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Database Schema](#database-schema)
  - [Development Setup](#development-setup)
- [Cloud Sync](#cloud-sync)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Twitter Sticky Notes is a two-part application:

1. **Chrome Extension** — Injects a sticky note widget next to tweet actions and profile actions on Twitter/X. Notes are stored locally by default and can optionally sync to the cloud.

2. **Laravel Backend** — Provides user authentication (Google OAuth), API token management, note storage, cloud sync, and Stripe-powered premium subscriptions.

---

## Features

- **Profile & Timeline Integration**: Seamlessly injects UI next to timeline tweet actions and profile user actions.
- **Multiple Notes**: Add, edit, and keep track of multiple notes per Twitter user.
- **Context Source**: Notes capture the source tweet or profile URL so you can trace your thoughts back.
- **Local Storage**: Notes are stored locally using Chrome Storage API — works offline.
- **Cloud Sync (Premium)**: Sync notes across devices for $1/year via Stripe.
- **Modern UI**: Built with Shadcn-Vue components, dark mode support, and Vue 3 reactivity.
- **Web Dashboard**: Manage notes, API tokens, and account settings via the web interface.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Content Script│  │  Popup (App) │  │  Storage Service │  │
│  │  (inject.ts)  │  │  (App.vue)   │  │  (storage.ts)    │  │
│  └──────┬───────┘  └──────────────┘  └────────┬─────────┘  │
│         │                                       │           │
│         │ Injects StickyNoteWidget              │           │
│         │ into Twitter DOM                      │           │
│         ▼                                       ▼           │
│  ┌──────────────┐                          ┌──────────┐    │
│  │ StickyNote   │                          │ Chrome   │    │
│  │ Widget.vue   │                          │ Storage  │    │
│  └──────────────┘                          └────┬─────┘    │
│                                                  │           │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
                                    Optional Cloud │ Sync
                                                   │
┌──────────────────────────────────────────────────┼──────────┐
│                    Laravel Backend                │           │
│  ┌───────────────────────────────────────────────▼────────┐ │
│  │              API (Token Auth Middleware)                │ │
│  └───────────────────────────────────────────────┬────────┘ │
│         │              │              │          │           │
│         ▼              ▼              ▼          ▼           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Notes   │  │  Users   │  │  Stripe  │  │  Google  │   │
│  │Controller│  │  Model   │  │Payments  │  │   OAuth  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                          │                                  │
│                          ▼                                  │
│                    ┌──────────┐                             │
│                    │ Database │                             │
│                    │ (SQLite/ │                             │
│                    │  MySQL)  │                             │
│                    └──────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Extension (Frontend)

### Tech Stack

- **Vue 3** — Reactive UI framework
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first CSS
- **Shadcn-Vue / Radix Vue** — Accessible UI components
- **CRXJS** — Chrome Extension build plugin for Vite
- **Lucide Vue** — Icon library

### Project Structure

```
userstickynote/
├── src/
│   ├── content.ts              # Content script — injects widgets into Twitter
│   ├── App.vue                 # Extension popup UI (notes list + settings)
│   ├── main.ts                 # Popup entry point
│   ├── style.css               # Global styles and Tailwind config
│   ├── components/
│   │   ├── StickyNoteWidget.vue  # Widget injected into Twitter pages
│   │   └── ui/                   # Shadcn-Vue UI components
│   └── lib/
│       ├── storage.ts          # Storage service (local + cloud sync)
│       └── utils.ts            # Utility functions (cn helper)
├── public/
│   └── logo.svg
├── icons/                      # Extension icons (16, 48, 128px)
├── manifest.json               # Chrome Extension manifest (MV3)
├── vite.config.ts              # Vite + CRXJS configuration
├── package.json
└── tailwind.config.js
```

### How It Works

#### Content Script (`src/content.ts`)

The content script runs on Twitter/X pages and:

1. Uses a `MutationObserver` to watch for DOM changes (Twitter is a SPA)
2. Finds tweet action buttons (`[data-testid="caret"]`) and profile action buttons (`[data-testid="userActions"]`)
3. Extracts the Twitter username from the tweet or URL
4. Extracts the source tweet URL from the timestamp link
5. Creates a Vue app instance of `StickyNoteWidget` and injects it next to the action buttons
6. Marks injected elements to avoid duplicate injection

#### Sticky Note Widget (`src/components/StickyNoteWidget.vue`)

The widget is a popover component that:

- Shows a sticky note icon (yellow when notes exist, gray when empty)
- Opens a popover with a list of existing notes for that user
- Allows adding, editing, and deleting notes
- Polls for updates every 3 seconds when closed
- Each note captures the source URL for context

#### Popup App (`src/App.vue`)

The extension popup provides:

- **Notes View**: Lists all notes across all users, sorted by most recent
- **Settings View**: Configure cloud sync, enter API token, trigger manual sync
- **Subscription Status**: Shows connection status and links to web dashboard

#### Storage Service (`src/lib/storage.ts`)

The storage service handles:

- **Local Storage**: Uses `chrome.storage.local` (or `localStorage` for development)
- **Note CRUD**: Create, read, update, delete notes
- **Cloud Sync**: Sends notes to backend API when sync is enabled
- **Subscription Check**: Verifies premium status via `/api/user` endpoint

### Development

```bash
# Install dependencies
bun install

# Start dev server (for popup development)
bun run dev
```

### Building & Installation

```bash
# Build the extension
bun run build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer Mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

---

## Backend (Laravel)

### Backend Tech Stack

- **Laravel 12** — PHP framework
- **Inertia.js + Vue 3** — Server-side rendering with Vue frontend
- **Laravel Socialite** — Google OAuth integration
- **Stripe** — Payment processing
- **SQLite / MySQL** — Database

### Backend Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   └── NoteController.php    # API note CRUD + sync
│   │   │   ├── AuthController.php        # Google OAuth
│   │   │   ├── DashboardController.php   # Web dashboard + token management
│   │   │   ├── StripeController.php      # Checkout + webhooks
│   │   │   ├── WebNoteController.php     # Web-based note CRUD
│   │   │   └── AdminController.php       # Admin dashboard
│   │   └── Middleware/
│   │       └── ApiTokenAuth.php          # API token authentication
│   └── Models/
│       ├── User.php
│       ├── ApiToken.php
│       └── Note.php
├── database/
│   └── migrations/
│       ├── 0001_01_01_000000_create_users_table.php
│       ├── 2026_01_01_000001_add_github_fields_to_users_table.php
│       ├── 2026_01_01_000002_create_api_tokens_table.php
│       └── 2026_01_01_000003_create_notes_table.php
├── routes/
│   └── web.php                           # All routes (web + API)
├── config/
│   └── services.php                      # Google + Stripe config
├── composer.json
└── .env.example
```

### API Endpoints

#### Extension API (Token Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user` | Get authenticated user info (subscription status) |
| `GET` | `/api/notes` | Get all notes for the user |
| `POST` | `/api/notes` | Create or update a note |
| `DELETE` | `/api/notes/{id}` | Delete a note |
| `POST` | `/api/sync` | Full sync — send local notes, receive merged state |

#### Web Routes (Session Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Landing page |
| `GET` | `/auth/google` | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/dashboard` | Web dashboard (auth required) |
| `POST` | `/tokens` | Create API token |
| `DELETE` | `/tokens/{id}` | Delete API token |
| `DELETE` | `/account` | Delete user account |
| `GET` | `/billing/checkout` | Create Stripe checkout session |
| `POST` | `/webhooks/stripe` | Stripe webhook handler (no auth) |

### Authentication

The backend uses two authentication methods:

1. **Session-based (Web)**: Google OAuth via Laravel Socialite. Users log in through the web dashboard.

2. **API Token-based (Extension)**: Users generate API tokens from the dashboard. Tokens are hashed (SHA-256) before storage. The extension sends tokens via `Authorization: Bearer <token>` header. The `ApiTokenAuth` middleware validates tokens and resolves the user.

### Database Schema

#### users

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `google_id` | string | Google OAuth ID (unique) |
| `name` | string | User's display name |
| `email` | string | User's email (unique) |
| `google_avatar` | string | Google avatar URL |
| `is_admin` | boolean | Admin flag (default: false) |
| `is_subscribed` | boolean | Premium subscription status |
| `subscription_ends_at` | timestamp | Subscription expiry date |
| `password` | string | Nullable (OAuth only) |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

#### api_tokens

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users (cascade delete) |
| `name` | string | Token label (e.g., "Chrome Extension") |
| `token` | string(64) | Hashed token (SHA-256, unique) |
| `last_used_at` | timestamp | Last usage timestamp |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

#### notes

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users (cascade delete) |
| `twitter_user_id` | string | Twitter user identifier |
| `twitter_username` | string | Twitter username (nullable) |
| `content` | text | Note content (max 2000 chars) |
| `source_url` | string | Source tweet/profile URL (nullable) |
| `client_id` | string | UUID from extension for upsert |
| `created_at` | timestamp | Creation date |
| `updated_at` | timestamp | Last update |

**Indexes:**
- Composite index on `(user_id, twitter_user_id)`
- Unique constraint on `(user_id, client_id)` — enables upsert on sync

### Development Setup

```bash
cd backend

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure .env with:
# - Database credentials (SQLite by default)
# - Google OAuth credentials
# - Stripe keys

# Run migrations
php artisan migrate

# Start development server (runs PHP, queue, logs, and Vite concurrently)
composer run dev
```

---

## Cloud Sync

Cloud sync is a premium feature ($1/year) that allows notes to be synced across devices.

### How It Works

1. User signs up via Google OAuth on the web dashboard
2. User pays $1/year via Stripe checkout
3. User generates an API token from the dashboard
4. User pastes the token into the extension settings
5. Notes sync automatically when saved, or manually via "Sync Now"

### Sync Flow

```
Extension                          Backend
    │                                 │
    │  POST /api/sync                 │
    │  { notes: [...] }               │
    │  Authorization: Bearer <token>  │
    │────────────────────────────────►│
    │                                 │
    │                                 │  Upsert notes by client_id
    │                                 │  Return all user notes
    │                                 │
    │  200 OK                         │
    │  { synced: N, notes: [...] }    │
    │◄────────────────────────────────│
    │                                 │
    │  Replace local storage          │
    │  with server state              │
```

### Subscription Check

The extension checks subscription status by calling `GET /api/user` and reading the `is_subscribed` field. Cloud sync endpoints return `402 Payment Required` if the user is not subscribed.

---

## Environment Variables

### Backend (.env)

```env
# App
APP_NAME="Twitter Sticky Notes"
APP_URL=https://twitter-sticky-notes.cranl.app

# Database
DB_CONNECTION=sqlite
# Or MySQL/PostgreSQL:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sticky_notes
# DB_USERNAME=root
# DB_PASSWORD=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

# Stripe
STRIPE_KEY=pk_test_
STRIPE_SECRET=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.