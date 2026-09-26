# Preview setup: Cloudflare Pages and Expo Go

## 1. Cloudflare: a preview link on every PR (about 10 minutes)

Cloudflare now sets new projects up as a Worker with static assets. `wrangler.jsonc`
in the repository carries everything it needs: the build command (with the testing
tools on), the `dist/` folder to serve, and the `previews` block that the PR
previews (`wrangler preview`) require. The dashboard's own build command can stay empty.

1. Go to https://dash.cloudflare.com and sign up (the free plan is enough).
2. In the left menu open **Compute (Workers & Pages)** and click **Create** → the **Pages** tab → **Connect to Git** (it may be named "Import an existing Git repository").
3. Click **Connect GitHub**. GitHub asks which repositories Cloudflare may see:
   choose **Only select repositories** → `Trading-App` → **Install & Authorize**.
4. Back in Cloudflare, pick `Trading-App` → **Begin setup**.
5. Fill in:
   - Project name: `nutrade` (this becomes `nutrade.pages.dev`)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `npx expo export --platform web --output-dir dist`
   - Build output directory: `dist`
   - **Environment variables (advanced)** → add two:
     - `NODE_VERSION` = `22`
     - `EXPO_PUBLIC_TEST_TOOLS` = `1`
6. Click **Save and Deploy**. The first build takes 2–3 minutes.
7. Open the project → **Settings** → **Builds** (or "Builds & deployments") → **Branch control**:
   check that preview deployments are set to **All non-production branches**.
8. Done. From now on Cloudflare posts a comment with a preview link on every PR,
   and `https://nutrade.pages.dev` always shows `main`.

Note: the preview sets the test tools on (`EXPO_PUBLIC_TEST_TOOLS=1`). A release
build leaves that variable out, and the Testing section disappears.

## 2. Expo Go preview: part B (optional now, needed before LOOK-SYSTEM)

1. Create an account at https://expo.dev/signup.
2. Avatar → **Account settings** → **Access tokens** → **Create token**, name it `github-ci`, copy it.
3. GitHub → the repository → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret**: name `EXPO_TOKEN`, value = the token.
4. Tell me your Expo username. One more commit links the app to your Expo project
   (`eas init` and `eas update:configure`: a project id and `expo-updates` in app.json);
   after that every PR gets a QR code for Expo Go. Until then the "Preview in Expo Go"
   check is skipped and stays grey.

## 3. Green checks before merging

GitHub Free does not enforce branch rules on private repositories, so this is a
rule in `CLAUDE.md` instead: a PR is merged only when every CI check on its
latest commit is green.
