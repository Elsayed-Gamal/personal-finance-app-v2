# Data isolation rollout

Status (2026-10-19): `20261019101937_mutate_owned_transaction.sql` and
`20261019105024_owned_overview_summary.sql` are applied to Personal finance app
(`awixkkydtjshjzswilec`), along with
`20261019114238_initialize_legacy_balance.sql` and
`20261019120436_mutate_owned_pot.sql`. Isolation, budget uniqueness and the
transaction date index remain pending. The access model below describes
the intended state after the full rollout, not the current remote permissions.

The transaction RPC was deployed independently with the user's approval. Its
signature and service-role execution were verified remotely, and anon/authenticated
EXECUTE is denied. Transaction and balance fingerprints were unchanged. Local
PostgreSQL tests passed for standalone deployment, create/edit/delete, missing or
duplicate balances, ownership, rollback and concurrent spending. The local filename
matches the migration version assigned by Supabase MCP; do not apply it again.

The post-deployment security advisor still reports the existing
[unprotected users/settings/budgets tables](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
and the [recurring-bills view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view).
These require the pending isolation rollout; creating this RPC does not resolve them.

## Access model

NextAuth remains the identity provider. Every financial service resolves the current
account from its signed session and the `users` table, then scopes records by that
account ID. Admin status does not bypass financial ownership. The Supabase secret
key stays server-only; it bypasses RLS, so server ownership checks remain essential.
Anonymous and Supabase-authenticated database roles have no access to application
tables, sequences, the recurring bills view, or the monetary RPC.

Categories and themes are shared reference data, served through the application.
The admin screen continues to manage user accounts and registration settings.

## Database changes

Apply pending files in `supabase/migrations` in filename order, skipping versions
already present in remote migration history:

1. `isolate_user_finances`: per-user pot-name uniqueness, one current balance per
   user, an owner-aware recurring view, restricted grants, RLS and a new-account
   balance trigger. It does not update or backfill historical financial records.
2. `mutate_owned_pot`: a server-only, SECURITY INVOKER RPC which checks ownership,
   locks the pot and balance rows, validates amounts, and changes both in one
   transaction. Applied independently on 2026-10-19; it rejects missing or
   ambiguous legacy balances until the isolation constraints are installed.
3. `transaction_accounting`: budget uniqueness and transaction date index. Pending.
   Reporting RPCs are now deployed with `owned_overview_summary`.
4. `mutate_owned_transaction`: server-only atomic transaction create/edit/delete.
   Applied independently on 2026-10-19; it also rejects ambiguous legacy balances
   until the unique-owner constraint is installed.
5. `owned_overview_summary`: a single owner-scoped read for balance, selected-month
   income/expense, budget totals, saved money and recent transaction previews.
   Applied on 2026-10-19 together with `get_owned_budget_summary` and
   `get_owned_period_summary`, both required by Overview. Totals aggregate all
   records; only previews are limited. All three RPCs are SECURITY INVOKER and
   executable only by service_role among application roles. Live read-only
   assertions matched all six accounts for August 2024 and October 2026.
   Fingerprints confirmed transactions, balances, budgets and pots were unchanged.

`mutate_owned_pot(p_user_id uuid, p_pot_id uuid, p_operation text, p_amount numeric)`
accepts `add`, `withdraw`, or `delete`. Only `service_role` has EXECUTE. The application
supplies `p_user_id` from `requireUser()`, never from user input.
Its remote signature and permissions were verified after deployment. A live delete
was executed inside a rolled-back transaction, and pot/balance fingerprints remained
unchanged across deployment and verification.

Legacy accounts without a balance remain uninitialized. Reads return `null` rather
than zero. Deposits, withdrawals and deletion of nonempty pots fail on both server
and UI until a correct opening balance is established. The user can set that value
once from Profile; the server-scoped RPC locks the user row and rejects subsequent
or concurrent attempts. Empty pots can be deleted.
Do not infer historical balances from pots or redistribute the existing balance.
Newly created accounts receive zero current/income/expense in the same transaction
as user creation, through a SECURITY INVOKER trigger in the private schema.

These migrations extend an existing database; they are not a fresh-install schema.
`tests/database/legacy-schema.sql` is a sanitized test fixture, not a production seed.

## Validation

```bash
npm test
npm run test:db
npm run lint
npm run build
```

`test:db` requires PostgreSQL binaries (16 or later). By default it uses
`/usr/lib/postgresql/16/bin`; set `PG_BIN` for another installation. It creates a
private temporary database cluster and removes it after testing. It never reads
`.env.local` or connects to Supabase. Run as a regular OS user, not root.

The database tests exercise preserved legacy money, missing balances, new-account
initialization, grants and RLS, same-name pots/bills across users, rejected foreign
IDs, invalid amounts, rollback after a simulated second-write failure, concurrent
deposits and concurrent withdrawals. Unit tests cover application authentication,
current admin role, financial query scoping, forged ownership and action errors.

Browser end-to-end checks against the migrated application are still required.

## Deployment sequence

1. Confirm the target project and capture a restorable backup plus current row counts
   and financial totals. Verify the deployed app uses a server secret/service-role
   key (never a browser/publishable key); do not log or export credentials.
2. Build the new app, then temporarily stop financial traffic and user creation on
   the old deployment. Do not run old pot-name/global-balance logic alongside the
   migrated version.
3. Apply pending reviewed migrations in order, skipping already applied versions;
   each runs transactionally. If a
   constraint fails, investigate without deleting or reallocating records.
4. Deploy the matching app and rebuild/invalidate old page caches. The budgets and
   recurring pages are now session-dependent rather than shared static output.
5. Compare historical row counts and financial values, verify direct anonymous
   access is denied, and run login/signup/profile/admin and two-account financial
   smoke tests with designated test accounts. Check Supabase security advisors.
6. Resume traffic only after checks pass. If deployment fails, keep traffic stopped
   and fix forward or restore the verified backup. Do not reopen public policies or
   run the old application against a partially migrated schema.

## Remaining work

Transaction and budget CRUD, selected-month budgets, Overview and responsive
navigation are implemented locally. Their browser acceptance tests and pending
migrations remain release gates. The recurring screen still contains demo totals. Further bill work is deferred
at the user’s request; the attempted monthly-bill implementation was reverted.
Development dependency review is also pending; production dependencies reported
zero known vulnerabilities on 2026-10-19. See `docs/delivery-plan.md`. Revoking all sessions after password changes is separate
from checking the current account and role on every protected operation.
