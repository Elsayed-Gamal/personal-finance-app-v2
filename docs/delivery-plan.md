# Delivery target: 18 November 2026

Goal: a complete, usable personal finance application ready to deploy within one
month of 18 October 2026. Scope confirmed: data isolation, transactions, budgets,
pots, recurring bills, a real Overview, mobile support and tests. Preserve existing
user records and money. Keep NextAuth. Legacy missing balances must not be guessed.

## Week 1 — Data integrity and security (18–24 October)

- [x] Implement current-account checks and per-user financial queries locally.
- [x] Replace pot-name mutation identifiers with pot IDs and owner checks.
- [x] Implement explicit missing-balance behavior in services and UI.
- [x] Prepare restricted database permissions and owner-aware bills view migrations.
- [x] Implement atomic pot transfers with concurrency/rollback tests.
- [ ] Verify the new UI flows in a browser against a migrated test database.
- [ ] Apply reviewed migrations and validate production compatibility.
- [ ] Resolve dependency vulnerabilities and account/session edge cases.
- [x] Provide a one-time, owner-scoped way to establish a legacy opening balance.

## Week 2 — Complete financial workflows (25–31 October)

- [ ] Create/edit/delete income and expense transactions with validated amounts,
      dates, categories, and consistent balance updates.
- [ ] Create/edit/delete budgets; report actual user spending for the selected month.
- [ ] Manage recurring bills and derive paid/upcoming/due-soon summaries from data.
- [ ] Define and test how transaction edits, deletion, and pot movements affect
      current balance, income, expense and reports without double counting.

## Week 3 — Overview and user experience (1–7 November)

- [ ] Replace Overview placeholder with real balance, income, expense, transactions,
      budgets, pots and recurring bill summaries.
- [ ] Responsive navigation, tables, charts, forms and dialogs for phone/tablet/desktop.
- [ ] Accessible dialogs and keyboard navigation; consistent pending, empty, error,
      retry and success states.
- [ ] Finish profile/admin flows, registration controls and sensible account errors.

## Week 4 — Acceptance and delivery (8–18 November)

- [ ] End-to-end tests for two users plus admin, including direct action requests.
- [ ] Fresh setup and migration instructions; backup and recovery verification.
- [ ] Production build, lint, unit/integration tests and dependency review pass.
- [ ] Real browser checks on mobile and desktop; verify data remains correct after
      reload, concurrent actions, and session changes.
- [ ] Prepare deployment with environment variables and post-deployment smoke tests.

## Evidence and current limits

The initial repository review and live metadata inspection found existing user_id
foreign keys but open database grants/policies, a global pot-name constraint and a
recurring view deduplicating across users. Six existing accounts have only one
balance record; two of the accounts without balances own pots.

Local SQL tests use a disposable PostgreSQL cluster and synthetic records. The transaction and pot mutation RPCs, Overview/reporting RPCs, and opening-balance RPC have been applied remotely; other migrations and
a public deployment are pending. Passing a build
is not proof of complete functionality; the unchecked acceptance items above
remain required for completion.

Verified on 18 October 2026 after the first implementation batch:

- `npm test`: 23 passing application/service tests.
- `npm run test:db`: PostgreSQL isolation, grants, migration preservation, rollback
  and concurrent deposit/withdrawal scenarios passed.
- `npm run lint`: no errors; four existing image optimization warnings remain.
- `npm run build`: passed; budgets and recurring bills are dynamic routes.
- `git diff --check`: passed.
- `npm audit`: 19 findings (3 critical, 13 high, 2 moderate, 1 low), requiring
  dependency remediation and retesting before release. Applicability must be
  assessed against actual enabled features; no automatic force/downgrade was used.

## Transaction RPC deployment — 2026-10-19

- Applied `20261019101937_mutate_owned_transaction` to Personal finance app via
  Supabase MCP with user approval. Local migration version matches remote history.
- Verified signature, service-role execution, denied browser-role EXECUTE, and
  unchanged transaction/balance fingerprints.
- Local PostgreSQL tests pass for standalone deployment, lifecycle, ownership,
  rollback, duplicate/missing balances and concurrent spending.
- Isolation and transaction-accounting migrations are still pending; existing
  table/view security findings remain documented in `data-isolation.md`.

## Overview and financial workflow verification — 2026-10-19

- Implemented an owner-scoped Overview with current available balance, selected-month
  income/expenses, pot savings, category budget usage and latest transactions.
- Preserved missing balances as unknown. Current balance/pots are explicitly all-time;
  monthly totals use the selected month. Recent transactions span all months.
- Added a separate pending Overview migration. SQL aggregates full datasets and only
  limits previews; tests cover more than 1000 records, foreign owners, empty accounts,
  date boundaries and deterministic ordering.
- Added service/action tests for transaction signs, forged ownership, safe failure,
  page invalidation, foreign budget edits/deletes and transaction pagination.
- Updated navigation/layout for narrow screens, keyboard skip links, active-page
  announcements and a retry/sign-out error screen. Browser verification is pending.
- `npm test`: 51 passing tests. `npm run test:db`: all SQL and concurrency scenarios pass.
- `npm run build`: passed, including the dynamic Overview route. `npm run lint`:
  zero errors, one existing recurring-bill image warning. `git diff --check`: passed.
- `npm audit --omit=dev`: zero known vulnerabilities. Development dependencies still
  require review; this does not constitute a complete dependency/security audit.

## Work paused at the Overview milestone — 2026-10-19

At the user's request, the new monthly-bill implementation has been removed.
The existing recurring-bill screen remains as it was before this work. No monthly
bill tables, payment functions or migrations were applied remotely. Further
implementation is paused at the Overview milestone until the user resumes it.

## Explicit Overview RPC deployment — 2026-10-19

At the user's request, applied `20261019105024_owned_overview_summary` and its
required budget/period reporting helpers. All three are SECURITY INVOKER with
service_role-only application execution. Verified the exact signatures and
compared live aggregates with source records for all six accounts in two periods.
Financial fingerprints were unchanged. Standalone and full local SQL suites pass.
The local migration version matches Supabase history; helper definitions were
moved out of the still-pending transaction-accounting migration to avoid replay.
No bill work was resumed; the broader implementation goal remains paused.

## Self-service opening balance — 2026-10-19

- Accounts without a balance see a one-time opening-balance form in Profile.
- The server derives ownership from the current NextAuth account. The database RPC
  locks that user, rejects existing/ambiguous balances and inserts current balance
  with income/expense set to zero. Zero is valid; negative, non-finite, oversized
  and sub-cent values are rejected.
- Applied `20261019114238_initialize_legacy_balance` to Personal finance app.
  The RPC is SECURITY INVOKER and executable only by service_role among application
  roles. A rolled-back live test covered initialization and repeated submission;
  all five eligible accounts remained unchanged afterward.
- Unit tests: 60 passing. Database tests cover standalone legacy deployment,
  permissions, validation and concurrent requests. Production build passes.

## Pot mutation RPC deployment — 2026-10-19

- Applied `20261019120436_mutate_owned_pot` to Personal finance app through
  Supabase MCP. The local migration version matches remote history.
- The RPC performs owner-scoped add, withdraw and delete operations atomically,
  locks affected rows, and rejects missing or duplicate legacy balances.
- Verified SECURITY INVOKER, an empty search path, service-role-only execution and
  a rolled-back live invocation. Pot and balance row counts and fingerprints were
  unchanged. Unit tests remain at 60 passing; all database tests pass.
