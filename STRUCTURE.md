# Cloop Website - Project Structure

This document describes the organized folder structure of the Cloop web application.

## 📁 Directory Structure

```
cloop-website/
├── src/
│   ├── layouts/                    # Page layout components
│   │   ├── DashboardLayout.tsx     # Main dashboard with sidebar navigation
│   │   └── AppSidebar.tsx          # Application sidebar component
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   │
│   │   ├── dashboard/              # Main dashboard
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── subjects/               # Subject learning features
│   │   │   ├── Chapters.tsx        # Chapter listing
│   │   │   └── Topics.tsx          # Topic list and navigation
│   │   │
│   │   ├── chat/                   # Chat interface features
│   │   │   ├── Chat.tsx            # General chat page
│   │   │   └── TopicChat.tsx       # Topic-specific chat with goals
│   │   │
│   │   ├── sessions/               # Session management
│   │   │   └── Sessions.tsx
│   │   │
│   │   ├── statistics/             # Analytics and stats
│   │   │   └── Statistics.tsx
│   │   │
│   │   ├── profile/                # User profile
│   │   │   └── Profile.tsx
│   │   │
│   │   ├── notifications/          # Notifications
│   │   │   └── Notifications.tsx
│   │   │
│   │   └── common/                 # Shared/common features
│   │       ├── Index.tsx           # Landing page
│   │       └── NotFound.tsx        # 404 page
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   └── NavLink.tsx             # Navigation link wrapper
│   │
│   ├── lib/                        # Utilities and API
│   │   ├── api/                    # API functions (organized by feature)
│   │   │   ├── chapters.ts         # Chapter/topic APIs
│   │   │   ├── signup.ts           # Signup APIs
│   │   │   └── topic-chat.ts       # Chat/message APIs
│   │   └── utils.ts                # Helper functions (cn, etc.)
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-mobile.tsx          # Mobile detection hook
│   │   └── use-toast.ts            # Toast notification hook
│   │
│   ├── assets/                     # Static assets (images, fonts)
│   │
│   ├── test/                       # Test files
│   │   ├── example.test.ts
│   │   └── setup.ts
│   │
│   ├── App.tsx                     # Main app component with routes
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles
│   └── vite-env.d.ts               # Vite type definitions
│
├── public/                         # Static public assets
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Vite configuration
├── tailwind.config.ts              # Tailwind CSS config
└── tsconfig.json                   # TypeScript config
```

## 🏗️ Architecture Principles

### 1. **Feature-Based Organization**
Each major feature has its own folder under `features/`. This makes it easy to:
- Find related code quickly
- Understand feature boundaries
- Work on features independently

### 2. **Separation of Concerns**
- **Layouts**: Define page structure (sidebar, header, main area)
- **Features**: Contain page components and feature-specific logic
- **Components**: Reusable UI elements shared across features
- **Lib**: API calls, utilities, and shared logic
- **Hooks**: Custom React hooks for reusable state logic

### 3. **Single Responsibility**
Each file should have one clear purpose:
- Pages handle routing and high-level state
- Components handle UI rendering
- API functions handle data fetching
- Layouts handle page structure

## 📝 File Naming Conventions

- **Components**: PascalCase (e.g., `TopicChat.tsx`, `DashboardLayout.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `chapters.ts`)
- **Features**: lowercase folder names, PascalCase files

## 🔄 Import Patterns

### Feature to Feature
```typescript
import { someUtil } from "@/lib/utils";
```

### Using Layouts
```typescript
import DashboardLayout from "@/layouts/DashboardLayout";
```

### UI Components
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
```

### API Functions
```typescript
import { fetchChapters } from "@/lib/api/chapters";
```

## 🚀 Adding New Features

When adding a new feature:

1. **Create feature folder**: `src/features/feature-name/`
2. **Add page component(s)**: `src/features/feature-name/PageName.tsx`
3. **Add route in App.tsx**: Import and add to routes
4. **Add sidebar link**: Update `AppSidebar.tsx` navigation

## 🎨 Layouts

### DashboardLayout
Used for all authenticated pages with sidebar navigation:
- Dashboard
- Chapters
- Topics
- Sessions
- Statistics
- Profile
- Notifications

### ChatLayout (TopicChat/Chat)
Full-screen layout for chat interfaces:
- Fixed positioning (fills viewport)
- Left sidebar for navigation
- Main chat area with messages
- Input bar at bottom

### AuthLayout (Future)
For login/signup pages (can be added when needed)

## 📊 State Management

- **Local State**: `useState`, `useReducer` for component-specific state
- **Server State**: `@tanstack/react-query` for API data
- **Global State**: Context API or localStorage for auth tokens

## 🔐 Authentication

Auth is handled via:
- Token stored in `localStorage` as `cloop_token`
- User data in `localStorage` as `cloop_user`
- Protected routes check for token existence
- API calls include `Authorization: Bearer ${token}` header

## 🌐 API Structure

All API functions are in `src/lib/api/`:

- **Base URL**: `import.meta.env.VITE_API_BASE_URL` or `https://api.cloopapp.com`
- **Auth**: Header-based with Bearer token
- **Error handling**: Try/catch with meaningful error messages

## 🎯 Best Practices

1. **Keep features isolated**: Don't import from other feature folders
2. **Use TypeScript**: Maintain type safety throughout
3. **Follow existing patterns**: Match code style and conventions
4. **Test before committing**: Run `npm run build` to ensure no errors
5. **Document complex logic**: Add comments for non-obvious implementations

## 🔧 Development Workflow

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## 📦 Key Dependencies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **React Router**: Client-side routing
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **Lucide React**: Icons
- **Zod**: Schema validation

## 🚦 Routes

### Public Routes
- `/` - Landing page
- `/login` - Login
- `/signup` - Registration

### Dashboard Routes (Require Auth)
- `/dashboard` - Main dashboard
- `/chapters` - Chapter list
- `/topics` - Topic list
- `/topic-chat` - Topic chat
- `/dashboard/sessions` - Session history
- `/dashboard/statistics` - Analytics
- `/dashboard/chat` - General chat
- `/dashboard/profile` - User profile
- `/dashboard/notifications` - Notifications

### Catch-All
- `/*` - 404 Not Found

---

**Last Updated**: April 9, 2026  
**Maintained By**: Cloop Development Team
