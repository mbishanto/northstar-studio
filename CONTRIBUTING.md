# Contributing to Northstar Studio Portfolio

Thank you for exploring our fictional portfolio contribution guidelines! As this repository is a visual layout demonstration, contributions focus on visual performance, markup syntax checks, and layout alignment.

## Code Standards
- **CSS**: Leverage design system variables. Do not include ad-hoc overrides.
- **HTML**: Follow semantic landmarks. Headings must flow logically (`h1` -> `h2` -> `h3`).
- **JS**: Throttle heavy layout triggers using IntersectionObserver or requestAnimationFrame loops.

## Development Setup
1. Edit content templates in `src/pages/`.
2. Compile changes into page subfolders by executing:
   ```bash
   node build.js
   ```
3. Verify links and check for broken references:
   ```bash
   node verify.js
   ```
