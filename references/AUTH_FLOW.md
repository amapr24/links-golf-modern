# Authentication Flow Documentation

## Overview

Links Golf uses **Manus OAuth** for user authentication combined with a **MySQL database** for persistent user records and session management. Supabase is used for optional member-specific data (profiles, photos) but is **not required** for authentication.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                         │
│                                                                   │
│  1. User clicks "Login" → getLoginUrl()                          │
│     Redirects to: VITE_OAUTH_PORTAL_URL?...&state=<encoded>    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MANUS OAUTH PORTAL                            │
│                                                                   │
│  2. User authenticates (email/Google/Apple/GitHub/etc)          │
│     OAuth server validates credentials                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR APP SERVER                               │
│                  (Express + tRPC Backend)                        │
│                                                                   │
│  3. OAuth callback: GET /api/oauth/callback?code=...&state=...  │
│     ↓                                                             │
│  4. Exchange code for token via Manus OAuth API                  │
│     ↓                                                             │
│  5. Fetch user info (openId, email, name, platforms)            │
│     ↓                                                             │
│  6. Upsert user to MySQL database                                │
│     ↓                                                             │
│  7. Sign JWT session token (openId + appId + name)              │
│     ↓                                                             │
│  8. Set secure HTTP-only cookie: MANUS_SESSION_TOKEN            │
│     ↓                                                             │
│  9. Redirect browser to /                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Authenticated)                       │
│                                                                   │
│  10. Session cookie now present in all requests                  │
│      useAuth() hook reads ctx.user from tRPC                    │
│      User can access /dashboard and protected routes            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. **OAuth Portal URL** (Frontend Entry Point)

**File:** `client/src/const.ts`

```typescript
export function getLoginUrl(returnPath?: string): string {
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  if (!portalUrl || !appId) {
    console.warn("OAuth env vars missing, falling back to /login");
    return "/login";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri); // Base64 encode for safety
  
  return `${portalUrl}?appId=${appId}&redirectUri=${redirectUri}&state=${state}`;
}
```

**Environment Variables Required:**
- `VITE_OAUTH_PORTAL_URL` — Manus OAuth login portal URL (frontend)
- `VITE_APP_ID` — Your app's unique OAuth application ID

---

### 2. **OAuth Callback Handler** (Backend Exchange)

**File:** `server/_core/oauth.ts`

When user returns from OAuth portal with `code` and `state`:

```typescript
// 1. Exchange code for access token
const tokenResponse = await sdk.exchangeCodeForToken(code, state);

// 2. Fetch user info using access token
const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

// 3. Upsert user to MySQL database
await db.upsertUser({
  openId: userInfo.openId,        // Unique OAuth identifier
  name: userInfo.name || null,
  email: userInfo.email ?? null,
  loginMethod: userInfo.loginMethod, // 'email', 'google', 'apple', etc
  lastSignedIn: new Date(),
});

// 4. Create signed JWT session token
const sessionToken = await sdk.createSessionToken(userInfo.openId);

// 5. Set secure HTTP-only cookie
res.cookie(COOKIE_NAME, sessionToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: ONE_YEAR_MS,
});

// 6. Redirect to home
res.redirect("/");
```

**Environment Variables Required:**
- `OAUTH_SERVER_URL` — Manus OAuth backend API URL (server-side)
- `JWT_SECRET` — Secret key for signing session tokens
- `VITE_APP_ID` — Must match frontend app ID

---

### 3. **Session Token Creation & Verification**

**File:** `server/_core/sdk.ts`

**Creating a session token:**
```typescript
async createSessionToken(openId: string): Promise<string> {
  return new SignJWT({
    openId,
    appId: ENV.appId,
    name: options.name || "",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}
```

**Verifying a session token:**
```typescript
async verifySession(cookieValue: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(cookieValue, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.warn("[Auth] Session verification failed");
    return null;
  }
}
```

**Token Structure:**
- **Algorithm:** HS256 (HMAC-SHA256)
- **Payload:** `{ openId, appId, name }`
- **Expiration:** 1 year (configurable)
- **Signing Key:** `JWT_SECRET` environment variable

---

### 4. **User Database Storage**

**File:** `drizzle/schema.ts`

```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }), // 'email', 'google', etc
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
```

**Key Fields:**
- `openId` — Unique identifier from Manus OAuth (primary auth key)
- `loginMethod` — Platform used to sign in (email, google, apple, github, microsoft)
- `lastSignedIn` — Tracks user activity
- `role` — For role-based access control (user, admin)

---

### 5. **Request Authentication Flow**

**File:** `server/_core/context.ts`

Every tRPC request goes through authentication:

```typescript
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // 1. Extract session cookie from request
    const cookies = parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    
    // 2. Verify JWT signature and expiration
    const session = await sdk.verifySession(sessionCookie);
    
    // 3. Look up user in MySQL by openId
    const user = await db.getUserByOpenId(session.openId);
    
    // 4. Update lastSignedIn timestamp
    await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
    
  } catch (error) {
    user = null; // Public procedures can proceed without auth
  }

  return { req, res, user };
}
```

**Result:** `ctx.user` is available in all tRPC procedures:
- **Public procedures** — `ctx.user` may be `null`
- **Protected procedures** — `ctx.user` is guaranteed to exist (or throws UNAUTHORIZED)

---

### 6. **Frontend Authentication State**

**File:** `client/src/_core/hooks/useAuth.ts`

```typescript
export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    error: meQuery.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
    logout: async () => { /* ... */ },
  };
}
```

**Usage in components:**
```typescript
function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={getLoginUrl()} />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Logout Flow

**File:** `server/routers.ts`

```typescript
logout: publicProcedure.mutation(({ ctx }) => {
  // Clear the session cookie
  ctx.res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
  });
  
  return { success: true };
});
```

**Frontend:**
```typescript
const { logout } = useAuth();
await logout(); // Clears cookie, user becomes null
```

---

## Supabase Integration (Optional)

**File:** `client/src/lib/supabase.ts`

Supabase is used for **member-specific data only**, NOT authentication:

```typescript
// Upload member photo to Supabase Storage
await uploadMemberPhoto(userId, photoFile);

// Save membership signup data
await saveMemberSignup({
  userId: user.openId,
  email: user.email,
  phone,
  address,
});

// Activate membership (set expires_at)
await activateMembership(userId, expirationDate);
```

**Why separate from auth?**
- Authentication = User identity (who are you?)
- Membership = Product data (what's your subscription status?)
- Keeping them separate allows flexibility (e.g., free users without memberships)

---

## Deployment Considerations

### **Manus Hosting (Current)**
- All environment variables pre-configured
- OAuth URLs automatically set
- MySQL database provided
- No additional setup needed

### **Cloudflare Deployment**
- **Session cookie** — Still works (HTTP-only, secure flag)
- **MySQL database** — Must be externally hosted (e.g., PlanetScale, Railway)
- **OAuth URLs** — Must be updated to your Cloudflare domain
- **JWT secret** — Must be set as environment variable
- **Environment variables to update:**
  ```
  OAUTH_SERVER_URL=https://oauth.manus.im (unchanged)
  VITE_OAUTH_PORTAL_URL=https://portal.manus.im (unchanged)
  VITE_APP_ID=<your-app-id> (unchanged)
  JWT_SECRET=<strong-random-string> (set in Cloudflare)
  DATABASE_URL=<your-external-db> (set in Cloudflare)
  ```

### **Key Points for External Deployment**
1. **Session cookies are domain-specific** — Must match your deployed domain
2. **JWT secret must be strong** — Use 32+ character random string
3. **Database must be accessible** — Ensure Cloudflare can reach your MySQL instance
4. **OAuth redirect URI must match** — Register your Cloudflare domain in Manus OAuth settings

---

## Security Best Practices

| Practice | Implementation |
|----------|-----------------|
| **HTTP-only cookies** | Set in `oauth.ts` and `cookies.ts` |
| **Secure flag** | Only in production (checked via `isProduction`) |
| **SameSite policy** | Set to "lax" to prevent CSRF |
| **Token expiration** | 1 year (configurable in `sdk.ts`) |
| **JWT signing** | HS256 with `JWT_SECRET` |
| **Session verification** | Every request via `createContext` |
| **Database validation** | User record checked on each request |

---

## Troubleshooting

### "Missing session cookie"
- User not authenticated
- Cookie may have expired (check `maxAge` setting)
- Check browser DevTools → Application → Cookies

### "Session verification failed"
- `JWT_SECRET` mismatch between server instances
- Cookie corrupted or tampered with
- Token expired

### "User not found"
- User exists in OAuth but not in MySQL
- Database connection issue
- Check `lastSignedIn` timestamp (should be recent)

### OAuth redirect fails
- `VITE_OAUTH_PORTAL_URL` or `VITE_APP_ID` not set
- Redirect URI doesn't match registered domain
- Check browser console for redirect URL

---

## Environment Variables Summary

| Variable | Location | Purpose |
|----------|----------|---------|
| `VITE_OAUTH_PORTAL_URL` | Frontend | OAuth login portal URL |
| `VITE_APP_ID` | Frontend | OAuth application ID |
| `OAUTH_SERVER_URL` | Server | OAuth token exchange endpoint |
| `JWT_SECRET` | Server | Session token signing key |
| `DATABASE_URL` | Server | MySQL connection string |
| `VITE_SUPABASE_URL` | Frontend | Optional: Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Optional: Supabase public key |

---

## Related Files

- `server/_core/oauth.ts` — OAuth callback handler
- `server/_core/sdk.ts` — OAuth service & JWT management
- `server/_core/context.ts` — Request authentication
- `client/src/_core/hooks/useAuth.ts` — Frontend auth state
- `client/src/const.ts` — OAuth URL builder
- `drizzle/schema.ts` — User database schema
