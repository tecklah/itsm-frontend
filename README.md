# ITSM Frontend

## Description
This is the ITSM frontend that allows user to create service request and incident ticket. It is integrate to the ITSM backend that handles the request using agentic AI.

The frontend application is developed using Vite + ReactJS + Material UI. It is mostly generated using Github Co-pilot.

## How to start up the frontend application
npm run dev

## How to setup auto deployment to Firebase Hosting

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Google Cloud project with Firebase enabled
- GitHub repository connected

### 1. Initialize Firebase Hosting
Run the following command at the root of the project:
```bash
firebase init hosting
```

**Configuration prompts:**
- **Project setup**: Select your existing Firebase project or create a new one
- **Public directory**: Enter `dist` (Vite's default build output folder)
- **Configure as single-page app (SPA)**: Yes (rewrites all URLs to /index.html)
- **Set up automatic builds and deploys with GitHub**: Yes
- **Overwrite existing files**: No (unless intentional)

### 2. Configure GitHub Actions Workflow
Firebase CLI auto-generates workflow files in `.github/workflows/`:
- `firebase-hosting-pull-request.yml` - Preview deployments on PRs
- `firebase-hosting-merge.yml` - Production deployments on merge to main

**Important**: Commit these workflow files to your repository.

### 3. Set up GitHub Secrets
The workflow needs authentication. Firebase CLI automatically adds a secret during initialization:
- `FIREBASE_SERVICE_ACCOUNT_*` - Auto-added by Firebase CLI

Verify in: **GitHub repo → Settings → Secrets and variables → Actions**

### 4. Configure Build Command
Ensure your `package.json` has the correct build script:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 5. Deploy
**Manual deployment:**
```bash
npm run build
firebase deploy --only hosting
```

**Auto-deployment:**
- Push to your main branch (triggers merge workflow)
- Create a PR (triggers preview workflow)

**Verify deployment:**
- Check GitHub Actions tab for workflow runs
- View deployment URL in workflow logs
- Visit Firebase Console → Hosting for deployment history

### Troubleshooting
- **Build fails**: Check `dist` folder exists after `npm run build`
- **404 on routes**: Ensure SPA rewrite is configured in `firebase.json`
- **Workflow not triggering**: Verify workflow files are committed to `.github/workflows/`