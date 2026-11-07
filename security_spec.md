# Security Specification: Portfolio Database Rules

## 1. Data Invariants
- **Public Portfolio Data (Projects, Concert Photos, Services, Testimonials, Settings)**:
  - Read access is public so visitors, potential clients, and directors can browse Ronny / Onset Media work.
  - Write, update, and delete access is strictly locked to verified administrators (`isAdmin()`).
  - No unauthenticated or unauthorized users can modify or delete portfolio projects, gallery photos, or services.
- **Client Inquiries (`inquiries`)**:
  - Anyone can submit a contact inquiry, but inquiries contain PII (client email, name, message).
  - Only authenticated administrators (`isAdmin()`) can read, list, update status, or delete client inquiries.
  - Incoming inquiries must strictly validate fields, sizes, and formats.
- **Path and Size Constraints**:
  - All document IDs must match `^[a-zA-Z0-9_\-]+$` and be <= 128 characters.
  - String fields are bounded with strict `.size()` checks to prevent payload exhaustion attacks.

## 2. Test Scenarios (The Dirty Dozen Payloads)
1. Unauthenticated write to `/projects/{projectId}` -> PERMISSION_DENIED
2. Non-admin authenticated user write to `/projects/{projectId}` -> PERMISSION_DENIED
3. Admin write to `/projects/{projectId}` with invalid ID (>128 chars or special chars) -> PERMISSION_DENIED
4. Unauthenticated deletion of `/concert_photos/{photoId}` -> PERMISSION_DENIED
5. Public or non-admin read of `/inquiries` collection (PII leak attempt) -> PERMISSION_DENIED
6. Non-admin write or update to `/settings/general` -> PERMISSION_DENIED
7. Unauthenticated write to `/services/{serviceId}` -> PERMISSION_DENIED
8. Unauthenticated write to `/testimonials/{testimonialId}` -> PERMISSION_DENIED
9. Inquiry creation with missing required fields (e.g. no email or message) -> PERMISSION_DENIED
10. Inquiry creation with oversized message (>3000 chars) -> PERMISSION_DENIED
11. Privilege escalation: user attempting to write themselves into `/admins/{uid}` without admin rights -> PERMISSION_DENIED
12. Shadow update: injecting ghost fields into `/projects/{projectId}` during update -> PERMISSION_DENIED
