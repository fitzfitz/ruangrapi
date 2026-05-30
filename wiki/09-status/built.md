# Built

## Foundation

Status: complete.

Built:

- React/Vite/TypeScript app foundation
- Supabase/PostgreSQL setup
- RLS foundation
- onboarding RPC
- auth/session provider
- profile and organization query
- route gating
- sign-in, signup, onboarding UI
- dashboard shell

## Properties

Status: MVP baseline complete.

Routes:

- `/dashboard/properties`
- `/dashboard/properties/new`
- `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/edit`

Built:

- list properties
- create property
- property detail page
- edit property

Fields:

- name
- address
- notes

## Units

Status: MVP baseline complete.

Routes:

- Units section on `/dashboard/properties/:propertyId`
- `/dashboard/properties/:propertyId/units/new`
- `/dashboard/properties/:propertyId/units/:unitId/edit`

Built:

- read-only property-scoped Units section
- create Unit
- edit Unit

Fields:

- name
- type
- notes

## Tenants

Status: MVP baseline complete.

Routes:

- `/dashboard/tenants`
- `/dashboard/tenants/new`
- `/dashboard/tenants/:tenantId/edit`

Built:

- read-only Tenants list
- create Tenant
- edit Tenant

Fields:

- full name
- phone
- email
- identity notes
- emergency contact name
- emergency contact phone
- notes

Deferred:

- lease assignment
- direct tenant-to-unit assignment
- delete/archive
- tenant portal
- document upload
- phone normalization refinement
