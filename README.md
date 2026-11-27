# Lab 4 · React applications

Three small applications exploring URL-driven state, accessible interactions, synchronous form validation, and full-stack persistence. Built with React 19, React Router 7, Vite, and Vitest.

| Project | What it demonstrates |
| --- | --- |
| [Photo gallery](photo-gallery/) | URL-based category filters and lightbox, local images, and a native dialog. |
| [Swipe deck](swipe-deck/) | Keyboard and pointer controls, undo, derived scoring, and an Express/Mongoose API. |
| [Fair-play tribunal](fair-play-tribunal/) | Player dossier routes, a comparison matrix, and a context-based appeal form. Case figures are illustrative. |

## Run an app

Install dependencies separately for the app you want to run (Node.js 22.12+):

```sh
cd photo-gallery   # or swipe-deck / fair-play-tribunal
npm install
npm run dev
```

For **swipe-deck**, start MongoDB, copy the root `.env.example` to `.env`, and set `MONGODB_URI` to your database URI. From `swipe-deck/`, run `npm run seed` once and `npm run server` in a separate terminal. The Vite development proxy expects the API on port 3000. Undo changes the current session only; it does not delete a saved swipe.

## Verify

Run these commands inside each app directory:

```sh
npm test
npm run lint
npm run build
```

The swipe-deck MongoDB integration tests require a local MongoDB server and are opt-in; see its [README](swipe-deck/README.md) for the command. The tribunal includes a tested SLA timer hook that is not yet displayed in the dossier.

See [AI_FAILURE_AUDIT.md](AI_FAILURE_AUDIT.md) for commit-linked issues and verification limits.
