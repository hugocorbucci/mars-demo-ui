# mars-demo-ui

Static UI subcomponent for the **Mars Demo Shop** App Platform app.

## Role in the app

| Concern | Detail |
| --- | --- |
| App Platform type | `static_sites` component named `web` |
| Owned by | This repo |
| Wired from | [`mars-demo-app`](https://github.com/hugocorbucci/mars-demo-app) → `.do/app.yaml` |
| Source dir | `public/` |
| Ingress | `/` (API is mounted at `/api`) |

App Platform serves the built static assets from `public/` using the `html` environment. No Node build step is required.

## Local preview

```bash
cd public
python3 -m http.server 45123
# open http://127.0.0.1:45123
```

API calls go to `/api/*`. Locally that path only works when you reverse-proxy to the API, or when the full app is deployed on App Platform (ingress routes `/api` to the service).

## Contents

- `public/index.html` — shop surface with demo actions
- `public/app.js` — calls health, create order, slow email lookup, load test
- `public/styles.css` — layout
- `public/404.html` — static error document referenced by the app spec
