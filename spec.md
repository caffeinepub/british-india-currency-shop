# British India Currency Shop

## Current State
Fresh project with only the base scaffolding. No backend or frontend code exists yet.

## Requested Changes (Diff)

### Add
- One-page storefront selling British India and world currencies (coins/notes)
- Filterable currency catalog with listings (name, description, era/period, price, condition, image)
- Trust/about section with shop credentials
- Inquiry form (name, email, message, listing reference)
- Admin panel (role-gated) for managing listings and viewing/responding to inquiries
- Authorization with role-based access (admin role)
- First-run admin setup so the owner can grant themselves admin access

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Select authorization component
2. Generate Motoko backend with:
   - Listing CRUD (id, title, description, era, price, condition, imageUrl, category, sold flag)
   - Category filtering support
   - Inquiry submission and admin read/manage
   - Role management (admin assignment, first-run bootstrap)
3. Build React frontend:
   - Public: hero, filterable catalog grid, about/trust section, inquiry form
   - Admin: login button, listing manager (add/edit/delete), inquiry viewer
   - Responsive single-page layout
