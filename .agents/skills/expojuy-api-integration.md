# expojuy-api-integration

## Purpose

Wire the ExpoJuy frontend to a backend endpoint — typed wrapper, caller, auth,
loading and error states — and handle the cross-repository work that a real
integration always implies.

## When to Use

- A feature needs data from, or must send data to, the NestJS backend.
- Changing login, session or account behaviour.
- A task asks to "make the contact/tickets/newsletter form actually work".

## Preconditions

1. **Confirm the endpoint exists.** The backend is at `../backend` (repo
   `jlopezjuy/expojuy2026backend`). Its full surface is small — read it:
   ```bash
   rg -n "@(Get|Post|Put|Delete)\(" ../backend/server/src/web/rest
   ```
   If the endpoint does not exist, this is a **cross-repository task**: the
   backend change comes first, under
   `../backend/.agents/skills/expojuy-api-endpoint.md`. Say so before starting.

2. **Confirm the data is not already static.** Exhibitors, agenda, FAQ, venue
   zones and news all live in `src/data/` and `src/content/`. Moving one of
   them to the API is an architecture change, not a wiring task — flag it and
   confirm the intent.

3. **Read the existing integration.** It is two small files:
   `src/lib/api/client.ts` and `src/lib/api/auth.ts`.

## Repository Context

Everything the frontend consumes today:

```text
src/lib/api/client.ts
  apiRequest<T>(path, { token?, headers?, ...RequestInit }): Promise<T>
    ├─ resolveUrl(): PUBLIC_API_BASE_URL, or window.location.origin when empty/relative
    ├─ sets Content-Type: application/json when a body is present
    ├─ sets Authorization: Bearer <token> when a token is given
    ├─ !response.ok           → throw ApiError(status)
    ├─ 401 AND a token was sent → unauthorizedHandler() → clearSession() + /login
    └─ 204                    → undefined

src/lib/api/auth.ts
  login({ username, password, rememberMe })  → POST /api/authenticate → { id_token }
  getAccount(token)                          → GET  /api/account      → UserDTO

src/lib/auth/session.ts
  sessionSignal        @preact/signals signal, shared by every island
  getSession / setSession / clearSession
  storage key 'expojuy_auth' in localStorage (remember) or sessionStorage
  registers the 401 handler at module load
```

Consumers: `src/components/islands/LoginForm.tsx`, `AccountView.tsx`,
`AuthNav.tsx`.

`PUBLIC_API_BASE_URL` (declared in `src/env.d.ts`, documented in `.env.example`)
is `http://localhost:8080` locally and **empty in Docker**, where Nginx proxies
`/api/` and `/management/` to the backend container
(`../docker/frontend/nginx.conf`).

### Known contract mismatch

`src/lib/api/auth.ts:UserDTO` declares `firstName`, `lastName`, `activated`,
`langKey` and `authorities` as **required**. The backend
(`../backend/server/src/service/dto/user.dto.ts`) declares them **optional**. A
user without a `firstName` will satisfy the type at compile time and be
`undefined` at runtime. Do not add more optimistic fields; if you touch this
type, tighten it toward the backend's reality.

## Workflow

### 1. Typed wrapper in `src/lib/api/`

Never call `fetch` from a component.

```ts
// src/lib/api/<domain>.ts
import { apiRequest } from './client';

export interface Thing {
  id: number;
  name: string;
}

export function listThings(token: string): Promise<Thing[]> {
  return apiRequest<Thing[]>('/api/things', { token });
}

export function createThing(token: string, body: Omit<Thing, 'id'>): Promise<Thing> {
  return apiRequest<Thing>('/api/things', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
```

Mirror the backend DTO field-for-field, including optionality. Keep the
interface next to the functions that use it, as `auth.ts` does.

### 2. Pagination

The backend does not wrap paginated payloads — it returns a bare array plus
headers (`X-Total-Count`, RFC5988 `Link`; see `HeaderUtil.addPaginationHeaders`).
`apiRequest` returns only the parsed body, so if you need the total you must
either extend `client.ts` to surface headers or add a dedicated function. Do not
assume a `{ content, total }` envelope.

### 3. Calling it

**From an island** (needs reactive state):

```tsx
const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

useEffect(() => {
  const session = sessionSignal.value;
  if (!session) return;
  setState('loading');
  listThings(session.token)
    .then((things) => { setThings(things); setState('idle'); })
    .catch(() => setState('error'));
}, []);
```

**From `enhance.ts`** (a form submit with no persistent state) — import the
wrapper and handle the promise there. Keep the `preventDefault`, disabled-button
and status-message pattern the existing form handlers use.

### 4. Error handling

Distinguish a rejected request from an unreachable service. `LoginForm.tsx:67-74`
is the reference and its comment explains why:

```tsx
const rejected = cause instanceof ApiError && cause.status >= 400 && cause.status < 500;
setError(rejected ? GENERIC_ERROR : SERVICE_ERROR);
```

Telling someone "wrong password" when the backend is down sends them to reset a
password that was never the problem. Keep 4xx messages generic so they never
reveal whether an account exists.

Messages are Spanish and user-facing. `role="alert"` on the container.

### 5. Auth

- The token lives in `sessionSignal.value.token`. Read it, do not re-read
  storage.
- Pass it as `{ token }` to `apiRequest` — never build the `Authorization`
  header by hand.
- A 401 on a tokened request already triggers logout and redirect globally. Do
  not add a second handler.
- After a successful login, `setSession(token, user, remember)` picks
  `localStorage` vs `sessionStorage` and clears the other.

### 6. Static-first check

If the data is stable for the life of the event, it belongs in `src/data/` and
should be baked into the static build — that is the whole architecture. Only
genuinely per-user or per-request data justifies a runtime fetch. Say which one
this is.

## Validation

```bash
npm run check
npm run build
npm test
```

Then run both sides together:

```bash
# terminal 1
cd ../backend && BACKEND_ENV=test npm run start:server     # :8080, seeded admin/admin

# terminal 2
npm run dev                                                # :4321
```

Confirm, in the browser:

1. Happy path works.
2. Backend stopped → the "service unavailable" message appears, not "wrong
   credentials".
3. A 401 clears the session and redirects to `/login`.
4. Loading state is visible and the submit control is disabled while pending.
5. Nothing new in the console — `tests/pages.spec.ts` fails on console errors.

## Common Mistakes

- Calling `fetch` directly from a component, bypassing base-URL resolution, the
  auth header and the 401 handler.
- Assuming `PUBLIC_API_BASE_URL` is always set. In Docker it is empty by design.
- Hardcoding `http://localhost:8080` anywhere.
- Building the `Authorization` header manually.
- Reading the token from `localStorage` instead of `sessionSignal`.
- Treating every failure as a credential error.
- Expecting a `{ content, total }` pagination envelope.
- Adding a fetch to a page that could be statically generated.
- Making one of the simulated forms *appear* to submit without a real endpoint.
- Marking a field required in the frontend `UserDTO` when the backend has it
  optional — the existing mismatch is a bug, not a pattern.
- Fetching in an island without a loading and an error state.

## Completion Criteria

- `npm run check`, `npm run build` and `npm test` pass with no new failures.
- All network access goes through `apiRequest`.
- Loading, empty, error and unauthorized states are all handled and visible.
- Verified against a locally running backend, both success and failure paths.
- The frontend type matches the backend DTO, optionality included.
- If a backend change was required, the report names the files on both sides and
  states whether that side is done or outstanding.
