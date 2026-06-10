# Deploy frontend and backend on Render

This repository includes `render.yaml`, which creates:

- `mec-dental-api`: Node.js/Express web service.
- `mec-dental-web`: Vite/React static site.
- MongoDB remains hosted on MongoDB Atlas.

## 1. Prepare MongoDB Atlas

1. Create a database user with read/write access to the application database.
2. Copy the Atlas connection string into `MONGODB_URI`.
3. Add the backend's outbound IP range to the Atlas IP access list. For a quick
   initial deployment, `0.0.0.0/0` works but is less restrictive; use a strong,
   unique database password.

## 2. Create the Render Blueprint

1. Push `render.yaml` and the deployment changes to GitHub.
2. In Render, choose **New > Blueprint**.
3. Connect `Ansociuu/dental-management-system` and select the `main` branch.
4. Enter the prompted secret values:

| Service | Variable | Value |
| --- | --- | --- |
| `mec-dental-api` | `MONGODB_URI` | MongoDB Atlas connection string |
| `mec-dental-api` | `CORS_ORIGINS` | Frontend URL, for example `https://mec-dental-web.onrender.com` |
| `mec-dental-web` | `VITE_API_URL` | Backend URL, for example `https://mec-dental-api.onrender.com/api/v1` |

Render generates `JWT_SECRET` automatically.

If Render assigns a different service URL because a name is already taken, use
the actual URLs shown in the Render dashboard. After changing
`VITE_API_URL`, manually redeploy the frontend because Vite embeds this value
during the build.

## 3. Verify

1. Open the backend URL. It should return a JSON success response.
2. Open the frontend URL and test login.
3. Refresh a nested route such as `/login` or `/admin/dashboard`; it should
   continue to load through the static-site rewrite.

Do not commit `backend/.env`. Production secrets belong in the Render
environment-variable settings.
