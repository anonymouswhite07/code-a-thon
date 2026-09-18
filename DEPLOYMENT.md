# Cloud Deployment Guide — Vercel & Render
**Code-a-thon 2026 | Gnanamani College of Technology**

This project is pre-configured for seamless cloud hosting:
* **Frontend**: Hosted on [Vercel](https://vercel.com) (Next.js 16 with Edge routing).
* **Backend**: Hosted on [Render](https://render.com) (Spring Boot 3 + JDK 17 Dockerized Web Service).
* **Code Sandbox Runner**: Hosted on [Render](https://render.com) (Alpine Docker container with GCC, OpenJDK 17, and Python 3).

---

## 1. Deploying the Backend & Runner to Render

You can deploy both the Spring Boot Backend and the Code Execution Sandbox on Render using either **Option A (Automated Blueprint)** or **Option B (Manual Web Services)**.

### Option A: 1-Click Render Blueprint (Recommended)
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   * **`codeathon-backend`**: Docker Web Service running Spring Boot on port 10000.
   * **`codeathon-runner`**: Docker Web Service running the sandbox on port 5050.
5. Click **Apply**.
6. Once deployed, copy your backend URL (e.g., `https://codeathon-backend.onrender.com`).

---

### Option B: Manual Web Services on Render

#### Step 1: Deploy the Code Runner Sandbox
1. Click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `codeathon-runner`
   * **Language / Environment**: `Docker`
   * **Root Directory**: `code-runner`
   * **Dockerfile Path**: `code-runner/Dockerfile`
   * **Plan**: Free or Starter
4. Environment Variables:
   * `PORT` = `5050`
5. Click **Deploy Web Service** and note its internal or public URL (e.g., `https://codeathon-runner.onrender.com`).

#### Step 2: Deploy the Spring Boot Backend
1. Click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `codeathon-backend`
   * **Language / Environment**: `Docker`
   * **Root Directory**: `backend`
   * **Dockerfile Path**: `backend/Dockerfile`
   * **Health Check Path**: `/api/v1/rounds`
   * **Plan**: Starter (or Free with in-memory H2)
4. Environment Variables:
   * `PORT` = `10000`
   * `CODE_RUNNER_URL` = `https://codeathon-runner.onrender.com` (or `http://codeathon-runner:5050` if using Render private networking)
   * `CORS_ALLOWED_ORIGINS` = `https://*.vercel.app,http://localhost:3000,http://localhost:3001`
   * `JWT_SECRET` = `(generate a 256-bit secret string)`
5. Click **Deploy Web Service** and copy your backend URL (e.g., `https://codeathon-backend.onrender.com`).

---

## 2. Deploying the Frontend to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New...** &rarr; **Project**.
2. Import your GitHub repository.
3. In the project configuration:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Click *Edit* and select `frontend`.
   * **Build Command**: `next build` (default)
   * **Output Directory**: `.next` (default)
4. Expand **Environment Variables** and add:
   ```bash
   NEXT_PUBLIC_API_URL=https://<your-backend-name>.onrender.com/api/v1
   ```
   *(Make sure to replace `<your-backend-name>` with your actual Render service name and include the `/api/v1` suffix).*
5. Click **Deploy**.

---

## 3. CORS & Security Verification

* **Wildcard Vercel Domain Support**:
  The backend's `SecurityConfig.java` is configured with `setAllowedOriginPatterns` supporting `https://*.vercel.app`. Any preview deployment (`https://project-*-yourteam.vercel.app`) or production domain (`https://project.vercel.app`) will automatically pass CORS credentials checks without manual configuration.
* **Dynamic Port Binding**:
  The backend respects Render's assigned `${PORT}` variable dynamically (`server.port: ${PORT:8080}`).
* **Health Probes**:
  Render health probes check `/api/v1/rounds`, ensuring the service is marked healthy only when the application context and database tables are fully ready.
