# Maintenance and Reminders Workflow UI Uplift Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Maintenance and Reminders list views into high-density dashboard-matching workflow workspaces (3-column Kanban for Maintenance, 2-column split layout for Reminders) with contextual status actions.

**Architecture:** Maintain all existing TanStack Query data structures and query/mutation hooks. Each component computes local metrics from available query data. App.css styling introduces columns and grids that collapse to stacked layouts on mobile.

**Tech Stack:** React 19, TypeScript, Lucide Icons, Vite, Tailwind CSS / Vanilla CSS (`src/App.css`).

---

### Task 1: CSS Board & Split Layout Styles

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Add board, columns, and priority styles to App.css**
  Append the following classes to `src/App.css` near the layout section:
  ```css
  /* Maintenance Kanban Board Layout */
  .maintenance-board {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    align-items: start;
    margin-top: 18px;
  }

  .maintenance-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: rgb(255 255 255 / 0.4);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    min-height: 500px;
  }

  .maintenance-column__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--primary);
    padding-bottom: 8px;
    margin-bottom: 4px;
  }

  .maintenance-column__header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    color: var(--text-h);
    text-transform: uppercase;
  }

  .maintenance-column__header span {
    font-size: 12px;
    font-weight: 700;
    background: var(--secondary);
    color: var(--secondary-foreground);
    padding: 2px 8px;
    border-radius: 9999px;
  }

  .maintenance-column__empty {
    text-align: center;
    padding: 32px 16px;
    color: var(--text);
    font-size: 13px;
  }

  .maintenance-column__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Priority Badges */
  .priority-badge {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid transparent;
  }

  .priority-badge--urgent {
    color: #c2410c;
    background: #fff7ed;
    border-color: #ffedd5;
  }

  .priority-badge--high {
    color: #b45309;
    background: #fef3c7;
    border-color: #fde68a;
  }

  .priority-badge--medium {
    color: #0369a1;
    background: #f0f9ff;
    border-color: #e0f2fe;
  }

  .priority-badge--low {
    color: #4b5563;
    background: #f3f4f6;
    border-color: #e5e7eb;
  }

  /* Reminders 2-Column Workspace Grid */
  .reminders-split-grid {
    display: grid;
    grid-template-columns: 440px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    margin-top: 18px;
  }

  .reminders-prepare-column {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: var(--shadow-card);
  }

  .reminders-queue-column {
    background: rgb(255 255 255 / 0.5);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .reminders-queue-column h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: var(--text-h);
  }
  ```
- [ ] **Step 2: Add responsive collapse media queries**
  Append responsive styles to handle viewport wrapping:
  ```css
  @media (max-width: 980px) {
    .reminders-split-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .maintenance-board {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  ```
- [ ] **Step 3: Run formatting checks**
  Run: `npm run format:check`
  Expected: Prettier confirms formatting check passes.
- [ ] **Step 4: Commit styles**
  Run:
  ```bash
  git add src/App.css
  git commit -m "style: add CSS board and split grid styles for Maintenance and Reminders"
  ```

---

### Task 2: Refactor Maintenance Page

**Files:**
- Modify: `src/modules/maintenance/presentation/maintenance-page.tsx`

- [ ] **Step 1: Implement summary builder helper**
  Add this helper function above `MaintenancePage`:
  ```tsx
  function buildMaintenanceSummary(tickets: MaintenanceTicketListItem[]) {
    const activeTicketsCount = tickets.filter(
      (t) => t.status === 'open' || t.status === 'in_progress',
    ).length
    const urgentCount = tickets.filter((t) => t.priority === 'urgent').length
    const resolvedCost = tickets
      .filter((t) => t.status === 'resolved' && t.actual_cost !== null)
      .reduce((sum, t) => sum + (t.actual_cost ?? 0), 0)

    return [
      {
        label: 'Active Work',
        value: activeTicketsCount.toString(),
        helper: 'Open or in-progress tickets',
      },
      {
        label: 'Urgent Priority',
        value: urgentCount.toString(),
        helper: 'Requires immediate attention',
      },
      {
        label: 'Resolved Cost',
        value: formatCurrency(resolvedCost),
        helper: 'Completed repairs ledger',
      },
    ]
  }
  ```
- [ ] **Step 2: Add helper for priority styling**
  Add this helper function above `MaintenancePage`:
  ```tsx
  function getPriorityClass(priority: MaintenanceTicketPriority) {
    switch (priority) {
      case 'urgent':
        return 'priority-badge priority-badge--urgent';
      case 'high':
        return 'priority-badge priority-badge--high';
      case 'medium':
        return 'priority-badge priority-badge--medium';
      case 'low':
        return 'priority-badge priority-badge--low';
    }
  }
  ```
- [ ] **Step 3: Render metrics and columns inside MaintenancePage**
  Modify `MaintenancePage` to extract columns and metrics. Replace lines 181-264 with:
  ```tsx
  const maintenanceSummary = buildMaintenanceSummary(maintenanceTicketsQuery.data)
  const openTickets = maintenanceTicketsQuery.data.filter((t) => t.status === 'open')
  const inProgressTickets = maintenanceTicketsQuery.data.filter((t) => t.status === 'in_progress')
  const completedTickets = maintenanceTicketsQuery.data.filter(
    (t) => t.status === 'resolved' || t.status === 'cancelled',
  )
  ```
  Render the summary strip and the board columns:
  ```tsx
  <>
    <div className="command-list-summary" aria-label="Maintenance summary">
      {maintenanceSummary.map((item) => (
        <article className="command-list-summary__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.helper}</p>
        </article>
      ))}
    </div>

    <div className="maintenance-board" aria-label="Maintenance workflow board">
      
      {/* Column 1: Open */}
      <div className="maintenance-column">
        <div className="maintenance-column__header">
          <h3>Open</h3>
          <span>{openTickets.length}</span>
        </div>
        {openTickets.length === 0 ? (
          <p className="maintenance-column__empty">No open tickets</p>
        ) : (
          <div className="maintenance-column__list">
            {openTickets.map((ticket) => renderMaintenanceCard(ticket))}
          </div>
        )}
      </div>

      {/* Column 2: In Progress */}
      <div className="maintenance-column">
        <div className="maintenance-column__header">
          <h3>In Progress</h3>
          <span>{inProgressTickets.length}</span>
        </div>
        {inProgressTickets.length === 0 ? (
          <p className="maintenance-column__empty">No active repairs</p>
        ) : (
          <div className="maintenance-column__list">
            {inProgressTickets.map((ticket) => renderMaintenanceCard(ticket))}
          </div>
        )}
      </div>

      {/* Column 3: Completed */}
      <div className="maintenance-column">
        <div className="maintenance-column__header">
          <h3>Completed</h3>
          <span>{completedTickets.length}</span>
        </div>
        {completedTickets.length === 0 ? (
          <p className="maintenance-column__empty">No completed tickets</p>
        ) : (
          <div className="maintenance-column__list">
            {completedTickets.map((ticket) => renderMaintenanceCard(ticket))}
          </div>
        )}
      </div>
      
    </div>
  </>
  ```
- [ ] **Step 4: Refactor ticket card rendering and actions**
  Define a `renderMaintenanceCard` function within `MaintenancePage` using contextual actions:
  ```tsx
  function renderMaintenanceCard(ticket: MaintenanceTicketListItem) {
    const isUpdating = updatingTicketIds[ticket.id] === true
    const hasUpdateError = updateErrorTicketIds[ticket.id] === true

    return (
      <article className="maintenance-card" key={ticket.id}>
        <div className="maintenance-card__header">
          <div>
            <p className="maintenance-card__property">
              {ticket.property_name}
              {ticket.unit_name !== null ? ` - ${ticket.unit_name}` : ''}
            </p>
            <h3>{ticket.title}</h3>
          </div>
        </div>

        <dl className="maintenance-card__details">
          <div>
            <dt>Priority</dt>
            <dd>
              <span className={getPriorityClass(ticket.priority)}>
                {formatPriority(ticket.priority)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Reported</dt>
            <dd>{formatDateTime(ticket.reported_at)}</dd>
          </div>
          <div>
            <dt>{getStatusDateLabel(ticket.status)}</dt>
            <dd>{formatDateTime(getStatusDate(ticket))}</dd>
          </div>
          <div>
            <dt>Est. cost</dt>
            <dd>{formatCurrency(ticket.estimated_cost)}</dd>
          </div>
          {ticket.status === 'resolved' ? (
            <div>
              <dt>Actual cost</dt>
              <dd>{formatCurrency(ticket.actual_cost)}</dd>
            </div>
          ) : null}
        </dl>

        {ticket.description !== null ? (
          <p className="maintenance-card__description">{ticket.description}</p>
        ) : null}

        <div className="maintenance-card__actions">
          {ticket.status === 'open' ? (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'in_progress')}
              >
                Start Work
              </button>
              <button
                type="button"
                className="button--secondary"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'cancelled')}
              >
                Cancel
              </button>
            </>
          ) : null}

          {ticket.status === 'in_progress' ? (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'resolved')}
              >
                Resolve
              </button>
              <button
                type="button"
                className="button--secondary"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'open')}
              >
                Put on Hold
              </button>
              <button
                type="button"
                className="button--secondary"
                disabled={isUpdating}
                onClick={() => void handleUpdateTicketStatus(ticket, 'cancelled')}
              >
                Cancel
              </button>
            </>
          ) : null}

          {ticket.status === 'resolved' || ticket.status === 'cancelled' ? (
            <button
              type="button"
              className="button--secondary"
              disabled={isUpdating}
              onClick={() => void handleUpdateTicketStatus(ticket, 'open')}
            >
              Reopen
            </button>
          ) : null}
        </div>

        {hasUpdateError ? (
          <p className="maintenance-card__error" role="alert">
            We could not update this ticket. Please try again.
          </p>
        ) : null}
      </article>
    )
  }
  ```
- [ ] **Step 5: Verify build & lint**
  Run: `npm run build && npm run lint`
  Expected: Command succeeds with zero errors.
- [ ] **Step 6: Commit changes**
  Run:
  ```bash
  git add src/modules/maintenance/presentation/maintenance-page.tsx
  git commit -m "feat(maintenance): refactor list into a 3-column Kanban board"
  ```

---

### Task 3: Refactor Reminders Page

**Files:**
- Modify: `src/modules/reminders/presentation/reminders-page.tsx`

- [ ] **Step 1: Implement summary builder helper**
  Add this helper above `RemindersPage`:
  ```tsx
  function buildReminderSummary(reminders: ReminderListItem[]) {
    const preparedCount = reminders.filter((r) => r.status === 'prepared').length
    const sentCount = reminders.filter((r) => r.status === 'sent').length
    const cancelledCount = reminders.filter((r) => r.status === 'cancelled').length

    return [
      {
        label: 'Prepared',
        value: preparedCount.toString(),
        helper: 'Ready to copy & send',
      },
      {
        label: 'Sent',
        value: sentCount.toString(),
        helper: 'Delivered follow-ups',
      },
      {
        label: 'Cancelled',
        value: cancelledCount.toString(),
        helper: 'Skipped reminders',
      },
    ]
  }
  ```
- [ ] **Step 2: Refactor RemindersPage render body**
  Combine the Prepare and Queue sections into the 2-column split workspace grid.
  Replace lines 241-508 in `reminders-page.tsx` with:
  ```tsx
  const reminderSummary = buildReminderSummary(remindersQuery.data || [])
  ```
  Render the layout:
  ```tsx
  <section className="reminders-page" aria-labelledby="reminders-title">
    <div className="reminders-page__header">
      <div>
        <h2 id="reminders-title">Reminders</h2>
        <p>
          Prepare payment reminder messages from payable invoices, copy the
          text, open WhatsApp manually, and track each message status.
        </p>
      </div>
    </div>

    {remindersQuery.isSuccess ? (
      <div className="command-list-summary" aria-label="Reminders summary">
        {reminderSummary.map((item) => (
          <article className="command-list-summary__item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.helper}</p>
          </article>
        ))}
      </div>
    ) : null}

    <div className="reminders-split-grid">
      
      {/* Column 1: Prepare Panel */}
      <aside className="reminders-prepare-column" aria-labelledby="prepare-title">
        <h3 id="prepare-title" style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800 }}>Prepare Reminder</h3>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text)' }}>
          Select a payable invoice to preview the generated message.
        </p>

        {formOptionsQuery.isLoading ? (
          <p className="reminders-page__status">Loading payable invoices...</p>
        ) : null}

        {formOptionsQuery.isError ? (
          <p className="reminders-page__error" role="alert">
            We could not load payable invoices right now.
          </p>
        ) : null}

        {formOptionsQuery.isSuccess && !hasInvoiceOptions ? (
          <div className="reminders-page__empty">
            <h3>No payable invoices</h3>
            <p>Reminder options will appear after an invoice is unpaid.</p>
          </div>
        ) : null}

        {formOptionsQuery.isSuccess && hasInvoiceOptions ? (
          <div className="reminders-prepare__body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="reminders-prepare__field">
              <label htmlFor="reminder-invoice">Invoice</label>
              <select
                id="reminder-invoice"
                value={selectedInvoiceId}
                disabled={isCreatingReminder}
                onChange={(event) => {
                  setSelectedInvoiceId(event.target.value)
                  setCreateError(false)
                }}
              >
                <option value="">Select a payable invoice</option>
                {invoices.map((invoice) => (
                  <option value={invoice.id} key={invoice.id}>
                    {formatInvoiceOption(invoice)}
                  </option>
                ))}
              </select>
            </div>

            {selectedInvoice !== null ? (
              <div className="reminders-prepare__preview" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div>Tenant: <strong>{selectedInvoice.tenant_name}</strong></div>
                  <div>Unit: <strong>{selectedInvoice.unit_name} - {formatPropertyName(selectedInvoice.property_name)}</strong></div>
                  <div>Period: <strong>{formatBillingPeriod(selectedInvoice.billing_period)}</strong></div>
                  <div>Due: <strong>{formatDate(selectedInvoice.due_date, 'No due date')}</strong></div>
                  <div>Remaining: <strong>{formatCurrency(selectedInvoice.remaining_amount)}</strong></div>
                </div>

                <div className="reminders-prepare__message" style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>Generated message</span>
                  <p style={{ fontSize: '12px', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{selectedInvoice.generated_message}</p>
                </div>
              </div>
            ) : null}

            {createError ? (
              <p className="reminders-page__error" role="alert">Could not prepare reminder.</p>
            ) : null}

            <div className="reminders-prepare__actions" style={{ marginTop: '6px' }}>
              <button
                type="button"
                style={{ width: '100%' }}
                disabled={!canPrepareReminder || isCreatingReminder}
                onClick={handlePrepareReminder}
              >
                {isCreatingReminder ? 'Preparing...' : 'Prepare reminder'}
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Column 2: Active Queue */}
      <section className="reminders-queue-column" aria-labelledby="queue-title">
        <h3 id="queue-title">Active Follow-up Queue</h3>

        {remindersQuery.isLoading ? (
          <p className="reminders-page__status">Loading reminders...</p>
        ) : null}

        {remindersQuery.isError ? (
          <p className="reminders-page__error" role="alert">We could not load reminders.</p>
        ) : null}

        {remindersQuery.isSuccess && remindersQuery.data.length === 0 ? (
          <div className="reminders-page__empty">
            <h3>No reminders prepared</h3>
            <p>Select a payable invoice on the left to prepare the first reminder.</p>
          </div>
        ) : (
          <div className="reminders-queue__list" aria-label="Reminder list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {remindersQuery.data.map((reminder) => renderReminderCard(reminder))}
          </div>
        )}
      </section>

    </div>
  </section>
  ```
- [ ] **Step 3: Add contextual card rendering in queue**
  Implement the `renderReminderCard` function inside `RemindersPage`:
  ```tsx
  function renderReminderCard(reminder: ReminderListItem) {
    const isUpdating = updatingReminderIds[reminder.id] === true
    const hasUpdateError = updateErrorReminderIds[reminder.id] === true
    const isCopied = copiedReminderIds[reminder.id] === true

    return (
      <article className="reminder-card" key={reminder.id}>
        <div className="reminder-card__header">
          <div>
            <h3>{reminder.tenant_name}</h3>
            <p>
              {reminder.unit_name} - {formatPropertyName(reminder.property_name)}
            </p>
          </div>
          <span className="reminder-card__status">{formatStatus(reminder.status)}</span>
        </div>

        <ReminderDetails
          dueDate={reminder.invoice_due_date}
          billingPeriod={reminder.invoice_billing_period}
          invoiceTotal={reminder.invoice_total_amount}
        />

        <dl className="reminder-card__meta">
          <div>
            <dt>Channel</dt>
            <dd>{formatChannel(reminder.channel)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDateTime(reminder.updated_at)}</dd>
          </div>
        </dl>

        <div className="reminder-card__message">
          <span>Message</span>
          <p>{reminder.message}</p>
        </div>

        {hasUpdateError ? (
          <p className="reminder-card__error" role="alert">
            Could not update status. Please try again.
          </p>
        ) : null}

        <div className="reminder-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Action Row 1: Copy and WA */}
          {reminder.status === 'prepared' || reminder.status === 'sent' ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                style={{ flex: 1 }}
                onClick={() => void handleCopyReminder(reminder)}
              >
                {isCopied ? 'Copied' : 'Copy message'}
              </button>
              {reminder.whatsapp_url !== null ? (
                <a
                  href={reminder.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1 }}
                >
                  Open WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}

          {/* Action Row 2: Status marking */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
            {reminder.status === 'prepared' ? (
              <>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => void handleUpdateReminderStatus(reminder, 'sent')}
                >
                  Mark Sent
                </button>
                <button
                  type="button"
                  className="button--secondary"
                  disabled={isUpdating}
                  onClick={() => void handleUpdateReminderStatus(reminder, 'cancelled')}
                >
                  Cancel
                </button>
              </>
            ) : null}

            {reminder.status === 'sent' ? (
              <>
                <button
                  type="button"
                  className="button--secondary"
                  disabled={isUpdating}
                  onClick={() => void handleUpdateReminderStatus(reminder, 'prepared')}
                >
                  Revert to Prepared
                </button>
                <button
                  type="button"
                  className="button--secondary"
                  disabled={isUpdating}
                  onClick={() => void handleUpdateReminderStatus(reminder, 'cancelled')}
                >
                  Cancel
                </button>
              </>
            ) : null}

            {reminder.status === 'cancelled' ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleUpdateReminderStatus(reminder, 'prepared')}
              >
                Restore
              </button>
            ) : null}
          </div>
        </div>
      </article>
    )
  }
  ```
- [ ] **Step 4: Verify build & lint**
  Run: `npm run build && npm run lint`
  Expected: Command succeeds with zero errors.
- [ ] **Step 5: Commit changes**
  Run:
  ```bash
  git add src/modules/reminders/presentation/reminders-page.tsx
  git commit -m "feat(reminders): refactor page into a 2-column split workspace"
  ```

---

### Task 4: Final Verification & Documentation Closeout

- [ ] **Step 1: Check build and lint**
  Run:
  ```bash
  npm run format:check
  npm run build
  npm run lint
  git diff --check
  ```
  Expected: All commands pass with exit code 0.
- [ ] **Step 2: Update Built Status wiki**
  Modify `wiki/09-status/built.md` and move Maintenance and Reminders layout uplifts to completed status.
- [ ] **Step 3: Commit closeout**
  Run:
  ```bash
  git add wiki/09-status/built.md
  git commit -m "docs: closeout Maintenance and Reminders layout uplift"
  ```
