# Laxmi Credit: Stability & Protection Protocol

This document serves as a "Guardian Protocol" for the Laxmi Credit project. It defines the core stable components that must **never** be deleted or modified in a destructive way when adding new features.

## 🛡️ Stable Protection Zones

### 1. Calculation Engine (`src/utils/policyUtils.js`, `src/banks/*/calculator.js`)
- **Rule**: Never remove existing calculation parameters.
- **Action**: All changes must be **additive**. If a new rule is needed, add it as a separate block or a versioned override.

### 2. Admin Governance Structure (`src/components/AdminDashboard.jsx`, `src/components/admin/*`)
- **Rule**: Never remove existing management modules (Leads, Banks, Policies).
- **Action**: New modules must be integrated into the navigation without hiding existing ones. Use hierarchical menus if the list grows too large.

### 3. Neural Design System (`index.css`, `src/components/AdminDashboard.css`)
- **Rule**: Maintain the "Neural/Dark" premium futuristic aesthetic.
- **Action**: Do not reset backgrounds to default browser values (white). Use the defined CSS variables for transparency, blur, and glow.

### 4. Firebase Configuration (`src/config/firebase.js`)
- **Rule**: Do not modify production keys once validated unless explicitly asked.
- **Action**: Always double-check API keys against the Firebase Console before applying.

## 🚀 Development Workflow
1.  **Safety Sync**: Before any major code change, verify the status of the local `npm run dev` server.
2.  **Beta-First**: Always apply and test changes in the `Latest PL Beta` folder before syncing to the `Final PL Product`.
3.  **Additive Innovation**: When adding a feature, build it in its own modular file rather than injecting it into the middle of stable components.

---
**Status**: 🟢 System Stable | 🔒 Neural Gate Hardened
