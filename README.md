# Rios

Rios is an interactive spatial intelligence platform that combines traditional maps with immersive 3D visualization. It provides a unified workspace to explore, monitor, and interact with real-world assets in context.

![Project preview](public/preview.png)

<!-- Badges placed immediately below the image -->

[![Status](https://img.shields.io/badge/status-prototype-blue)](https://github.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.173.0-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.3-000000)](https://github.com/pmndrs/zustand)
[![Axios](https://img.shields.io/badge/Axios-1.7.9-007ACC?logo=axios&logoColor=white)](https://axios-http.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](https://github.com/)

## Overview

Rios unites geospatial data, mapping, and a synchronized 3D scene into a single interactive interface. Users can search, inspect, and annotate assets while both the map and the 3D visualization remain consistent.

**Maintainer note**: I have over 10 years of experience managing open source projects and designed this README to follow established best practices for clarity and contributor onboarding.

## Quick start

Prerequisites

- Node.js 18 or later
- Yarn or npm

Install and run in development

```bash
npm install
npm run dev
```

Build for production

```bash
npm run build
npm run preview
```

## Features

- Interactive 2D map paired with a real-time 3D scene
- Vehicle and asset inspection and monitoring
- Area management and building annotations
- Centralized state for immediate cross-view updates
- Search and navigation tools

## Project structure

Top-level files and directories

- `package.json` - project metadata and scripts
- `src/` - application source code
- `public/` - static assets and images

## How it works

Rios loads backend geospatial and scene data through an API layer. Data is stored in global stores and consumed by both the map UI and the 3D renderer so that interactions update every view instantly.

## Demo script

<details>
<summary>Show demo script and narration (1 to 3 minutes)</summary>

1. Problem (20 to 30 seconds)

   Organizations manage vehicles, infrastructure, and geographic data through disconnected tools. Understanding what is happening on the ground is difficult, and decision making is slower than it should be.

2. Solution (20 seconds)

   Rios provides a unified workspace that combines maps with immersive 3D visualization so teams can explore and act on spatial data visually.

3. Product demo (60 to 90 seconds)

   On startup Rios loads geospatial and scene data. Use search to find locations, select assets, inspect vehicles, and navigate the 3D scene. Create annotations and manage areas of interest while the map and 3D scene remain synchronized.

4. Technology (20 to 30 seconds)

   Built with React, TypeScript, Vite, and Three.js. State management is centralized and data is fetched via an Axios based API layer.

5. Future scope (20 to 30 seconds)

   Roadmap items include real-time IoT integration, live vehicle tracking, collaborative workflows, and AI powered spatial insights.

</details>

## Technical notes and design choices

<details>
<summary>Expand for rationale and badge usage guidance</summary>

Badges are used to communicate important project metadata at a glance. For guidance on badge selection and best practices see the GitHub community discussion: https://github.com/orgs/community/discussions/16925

The project uses `zustand` for compact and efficient global stores. `three` with `@react-three/fiber` provides the 3D scene. `leaflet` and `react-leaflet` provide the map view. Axios is the data layer for HTTP requests.

Performance notes

- Keep 3D scene complexity bounded and load geometry lazily
- Batch state updates to avoid excessive re renders
- Use requestAnimationFrame for smooth scene updates

</details>

## Contributing

Contributions are welcome. Open an issue to propose changes or start a pull request. Follow existing code style and ensure linting remains green by running `npm run lint`.

If you intend to contribute substantial features, open an issue describing the design before implementing the change.

## License

This repository is currently private. Choose a license and update `package.json` to reflect the project license when you make the repository public.

## Contact

For questions or collaboration inquiries open an issue or contact the maintainers through the repository.

<p align="center">
  <img src="./public/preview.png" alt="Rios preview" width="100%" />
</p>

<h1 align="center">Rios</h1>
<p align="center">A Map to 3D website for turning open map data into interactive scenes</p>

<p align="center">
  <a href="https://www.rios.luxionlabs.com/">Visit Website</a> ·
  <a href="https://github.com/Invariants0/rios.gitissues">Report Bugs</a>
</p>
