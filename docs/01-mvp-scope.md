# MVP Scope

## MVP Principle

The MVP should focus on operational clarity, not advanced automation.

Build the smallest version that helps a rental owner manage monthly rental workflows.

## In Scope

### Property and Unit Management

- Create property
- Create units under property
- Track unit status
- Track rent price per unit

### Tenant Management

- Create tenant profile
- Store contact information
- Connect tenant to active lease

### Lease Management

- Assign tenant to unit
- Define lease start date
- Define lease end date when applicable
- Define monthly rent amount
- Track active/inactive lease status

### Monthly Billing

- Generate monthly bill/invoice records
- Track due date
- Track invoice status
- Support unpaid, partially paid, paid, overdue

### Payments

- Record payment
- Connect payment to invoice
- Store payment date and amount
- Store payment method

### Receipts

- Generate simple receipt data
- Receipt does not need complex PDF generation in the earliest version

### WhatsApp Reminders

- Prepare reminder message text
- Manual send via WhatsApp link is acceptable for MVP
- No WhatsApp Business API integration in first MVP unless approved later

### Utility Readings

- Record electricity/water meter readings
- Calculate usage manually or with simple formula
- Keep this simple for MVP

### Maintenance Tickets

- Create maintenance ticket
- Track status
- Connect ticket to property/unit
- Add simple description

### Dashboard

- Total units
- Occupied units
- Vacant units
- Expected rent this month
- Collected rent this month
- Unpaid invoices
- Open maintenance tickets

## Out of Scope for Initial MVP

- Marketplace listing
- Tenant mobile app
- Owner mobile app
- Complex accounting
- Tax reporting
- Payroll
- Inventory
- Multi-branch enterprise hierarchy
- Automated bank reconciliation
- Payment gateway integration
- Full WhatsApp Business API automation
- Advanced role-based permission system
- AI features
- Native mobile app

## MVP Constraint

The MVP should be built as a modular monolith using Supabase and React.

Do not introduce microservices.
