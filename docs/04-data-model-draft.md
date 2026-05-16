# Data Model Draft

This file is a draft.

Do not create Supabase migrations until this draft is reviewed and approved.

## Draft Tables

### organizations

Represents the business account.

Fields:

- id
- name
- created_at
- updated_at

### profiles

Represents user profile connected to Supabase Auth.

Fields:

- id
- organization_id
- full_name
- role
- created_at
- updated_at

### properties

Rental properties.

Fields:

- id
- organization_id
- name
- address
- notes
- created_at
- updated_at

### units

Rentable units inside properties.

Fields:

- id
- organization_id
- property_id
- name
- type
- status
- base_rent_amount
- notes
- created_at
- updated_at

Possible status:

- vacant
- occupied
- inactive
- maintenance

### tenants

Tenant profiles.

Fields:

- id
- organization_id
- full_name
- phone
- email
- identity_number
- emergency_contact_name
- emergency_contact_phone
- notes
- created_at
- updated_at

### leases

Connects tenant to unit.

Fields:

- id
- organization_id
- tenant_id
- unit_id
- start_date
- end_date
- monthly_rent_amount
- billing_day
- deposit_amount
- status
- created_at
- updated_at

Possible status:

- active
- ended
- cancelled

### invoices

Monthly billing records.

Fields:

- id
- organization_id
- lease_id
- tenant_id
- unit_id
- billing_period
- due_date
- amount
- status
- notes
- created_at
- updated_at

Possible status:

- draft
- unpaid
- partially_paid
- paid
- overdue
- cancelled

### payments

Payment records.

Fields:

- id
- organization_id
- invoice_id
- amount
- payment_date
- payment_method
- reference_number
- notes
- created_at
- updated_at

Possible payment methods:

- cash
- bank_transfer
- e_wallet
- other

### receipts

Receipt records.

Fields:

- id
- organization_id
- payment_id
- receipt_number
- issued_at
- created_at
- updated_at

### utility_readings

Utility meter readings.

Fields:

- id
- organization_id
- unit_id
- billing_period
- utility_type
- previous_reading
- current_reading
- usage_amount
- rate
- total_amount
- created_at
- updated_at

Possible utility types:

- electricity
- water
- other

### maintenance_tickets

Maintenance issues.

Fields:

- id
- organization_id
- property_id
- unit_id
- title
- description
- status
- priority
- reported_at
- resolved_at
- created_at
- updated_at

Possible status:

- open
- in_progress
- resolved
- cancelled

Possible priority:

- low
- medium
- high
- urgent

### reminders

Prepared reminder messages.

Fields:

- id
- organization_id
- invoice_id
- tenant_id
- channel
- message
- status
- created_at
- updated_at

Possible channel:

- whatsapp
- manual

Possible status:

- draft
- prepared
- sent
- cancelled

## Multi-Tenant Rule

Most business tables should include `organization_id`.

## Open Data Questions

- Should invoices have line items?
- Should utility charges be separate invoices?
- Should payments support allocation across multiple invoices?
- Should receipt number be globally unique or organization-scoped?
- Should phone numbers be normalized to Indonesian format?