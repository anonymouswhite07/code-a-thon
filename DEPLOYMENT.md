# Cloud Deployment Guide — Vercel & Render (Dockerized)
**Code-a-thon 2026 | Gnanamani College of Technology**

This platform is configured for modern cloud hosting:
* **Backend**: Hosted on [Render](https://render.com) using a **single unified Docker container** (Spring Boot 3 + GCC + OpenJDK 17 + Python 3 + Node.js Sandbox).
* **Frontend**: Hosted on [Vercel](https://vercel.com) (Next.js 16 with Edge network).

---

## 1. Deploying Backend to Render (Single Docker Web Service)

Because we bundle the Spring Boot API, compilers, and the execution sandbox into one container:
* **You only need 1 Web Service on Render.**
* The backend talks to the code-runner directly over `http://localhost:5050` inside the container (zero network latency, zero extra cost, 100% reliable).

### Method A: 1-Click Render Blueprint (Recommended)
1. In your [Render Dashboard](https://dashboard.render.com), click **New +** &rarr; **Blueprint**.
2. Connect your GitHub repository: `https://github.com/anonymouswhite07/code-a-thon`.
3. Render reads [`render.yaml`](./render.yaml) automatically.
4. Click **Apply**.
5. Once deployed, copy your backend URL (e.g., `https://codeathon-backend.onrender.com`).

---

### Method B: Manual Web Service on Render
1. Click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository `https://github.com/anonymouswhite07/code-a-thon`.
3. Configure:
   * **Name**: `codeathon-backend`
   * **Language**: `Docker`
   * **Branch**: `main`
   * **Root Directory**: `.` (leave empty or root)
   * **Dockerfile Path**: `Dockerfile`
   * **Health Check Path**: `/api/v1/rounds`
   * **Plan**: Free or Starter
4. Environment Variables:
   * `PORT` = `10000`
   * `CORS_ALLOWED_ORIGINS` = `https://*.vercel.app,http://localhost:3000,http://localhost:3001`
   * `CODE_RUNNER_URL` = `http://localhost:5050`
   * `JWT_SECRET` = `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
5. Click **Deploy Web Service** and copy your live URL.

---

## 2. Deploying Frontend to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com) &rarr; **Add New...** &rarr; **Project**.
2. Import `https://github.com/anonymouswhite07/code-a-thon`.
3. Under **Project Settings**:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: Click *Edit* and select **`frontend`** (Crucial: ensures Vercel serves the Next.js app without 404).
4. Under **Environment Variables**:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: `https://<your-backend-name>.onrender.com/api/v1`
5. Click **Deploy**.
