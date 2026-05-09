# Feature Prompt: Auth System

> Copy นี้ต่อท้าย Morning Prompt เมื่อจะ build Auth

```
## Feature: Auth System

Build complete auth flow with these exact specs:

### Register (/register)
- Fields: name, email, password, confirm password
- Validation: zod schema (email format, password min 8 chars)
- On success: create user in Supabase, redirect to /onboarding
- Error: show inline field errors (not alert())

### Login (/login)
- Fields: email, password + "remember me" checkbox
- OAuth: Google button (Supabase OAuth)
- On success: redirect to /feed
- Error: "Invalid email or password" — never reveal which is wrong

### Session
- Use Supabase session (cookie-based, SSR-compatible via @supabase/ssr)
- Middleware: protect /feed /profile /trips /buddy → redirect to /login
- Public routes: / /login /register /explore

### Files to create/update
- src/app/register/page.tsx
- src/app/login/page.tsx
- src/app/api/auth/callback/route.ts (already exists)
- middleware.ts (already exists — verify)
- lib/validations.ts — zod schemas

Start with: Register page + Supabase signUp integration
```
