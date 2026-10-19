import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import assert from "node:assert/strict";

// Always creates its own disposable cluster. Never reads .env or connects remotely.
const root = process.cwd();
const bin = process.env.PG_BIN || "/usr/lib/postgresql/16/bin";
const directory = mkdtempSync(path.join(tmpdir(), "finance-db-test-"));
const data = path.join(directory, "data");
const connection = [
  "-X",
  "-h",
  directory,
  "-p",
  "5432",
  "-U",
  userInfo().username,
  "-d",
  "postgres",
  "-v",
  "ON_ERROR_STOP=1",
];
let started = false;
function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout: 60000 });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} failed:\n${result.stderr}\n${result.stdout}`);
  return result.stdout.trim();
}
function sql(query) {
  return run(path.join(bin, "psql"), [...connection, "-Atc", query]);
}
function file(name) {
  run(path.join(bin, "psql"), [...connection, "-f", path.join(root, name)]);
}
function concurrent(query) {
  return new Promise((resolve, reject) => {
    const child = spawn(path.join(bin, "psql"), [...connection, "-Atc", query]);
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdout.resume();
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stderr }));
  });
}
try {
  run(path.join(bin, "initdb"), [
    "-D",
    data,
    "-A",
    "trust",
    "--no-locale",
    "-E",
    "UTF8",
  ]);
  run(path.join(bin, "pg_ctl"), [
    "-D",
    data,
    "-l",
    path.join(directory, "server.log"),
    "-o",
    `-k '${directory}' -h ''`,
    "-w",
    "start",
  ]);
  started = true;
  file("tests/database/legacy-schema.sql");
  const balanceMigration = readdirSync("supabase/migrations").find((name) =>
    name.endsWith("_initialize_legacy_balance.sql"),
  );
  file(`supabase/migrations/${balanceMigration}`);
  file("tests/database/opening-balance.sql");
  sql("drop function public.initialize_owned_balance(uuid,numeric)");
  console.log("PASS: standalone one-time opening balance on the legacy schema");
  const overviewMigration = readdirSync("supabase/migrations").find((name) =>
    name.endsWith("_owned_overview_summary.sql"),
  );
  file(`supabase/migrations/${overviewMigration}`);
  file("tests/database/overview.sql");
  sql("drop function public.get_owned_overview_summary(uuid,date,date)");
  sql("drop function public.get_owned_budget_summary(uuid,date,date)");
  sql("drop function public.get_owned_period_summary(uuid,date,date)");
  console.log(
    "PASS: standalone Overview RPC and reporting helpers on the legacy schema",
  );
  // The transaction RPC can be deployed independently to the existing schema.
  const transactionMigration = readdirSync("supabase/migrations").find((name) =>
    name.endsWith("_mutate_owned_transaction.sql"),
  );
  file(`supabase/migrations/${transactionMigration}`);
  file("tests/database/transaction-rpc-standalone.sql");
  sql(
    "drop function public.mutate_owned_transaction(uuid,uuid,text,text,numeric,date,uuid,boolean)",
  );
  console.log(
    "PASS: standalone transaction RPC on the unmigrated legacy schema",
  );
  const potMigration = readdirSync("supabase/migrations").find((name) =>
    name.endsWith("_mutate_owned_pot.sql"),
  );
  file(`supabase/migrations/${potMigration}`);
  file("tests/database/pot-rpc-standalone.sql");
  sql("drop function public.mutate_owned_pot(uuid,uuid,text,numeric)");
  console.log("PASS: standalone pot RPC on the unmigrated legacy schema");
  for (const migration of readdirSync("supabase/migrations")
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    file(`supabase/migrations/${migration}`);
  }
  file("tests/database/isolation.sql");
  file("tests/database/transactions.sql");
  file("tests/database/overview.sql");
  file("tests/database/opening-balance.sql");
  console.log(
    "PASS: overview ownership, empty accounts, full totals and bounded previews",
  );
  console.log(
    "PASS: transaction lifecycle, reporting, duplicate submissions, ownership and rollback",
  );
  console.log(
    "PASS: ownership, permissions, legacy balances, new accounts, views, validation and transaction rollback",
  );
  console.log(
    "PASS: opening balance validation, one-time write and permissions",
  );

  const uninitializedUser = "00000000-0000-4000-8000-000000000003";
  const initializations = await Promise.all(
    [10, 20].map((amount) =>
      concurrent(
        `begin; set local role service_role; select public.initialize_owned_balance('${uninitializedUser}',${amount}); select pg_sleep(0.25); commit;`,
      ),
    ),
  );
  assert.equal(
    initializations.filter((result) => result.code === 0).length,
    1,
    JSON.stringify(initializations),
  );
  assert.match(
    initializations.find((result) => result.code !== 0).stderr,
    /BALANCE_ALREADY_INITIALIZED/,
  );
  assert.equal(
    sql(
      `select count(*) from public.balance_snapshots where user_id='${uninitializedUser}'`,
    ),
    "1",
  );
  sql(
    `delete from public.balance_snapshots where user_id='${uninitializedUser}'`,
  );
  console.log(
    "PASS: concurrent opening-balance requests create exactly one row",
  );

  const user = "00000000-0000-4000-8000-000000000001";
  const pots = [
    "10000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000004",
  ];
  const deposits = await Promise.all(
    pots.map((pot) =>
      concurrent(
        `begin; set local role service_role; select public.mutate_owned_pot('${user}','${pot}','add',80); select pg_sleep(0.25); commit;`,
      ),
    ),
  );
  assert.equal(
    deposits.filter((r) => r.code === 0).length,
    1,
    JSON.stringify(deposits),
  );
  assert.match(
    deposits.find((r) => r.code !== 0).stderr,
    /INSUFFICIENT_BALANCE/,
  );
  assert.equal(
    sql(`select current from public.balance_snapshots where user_id='${user}'`),
    "20",
  );
  assert.equal(
    sql(`select sum(total) from public.pots where user_id='${user}'`),
    "100",
  );
  console.log("PASS: concurrent deposits cannot overspend the shared balance");

  sql(
    `update public.pots set total=50 where id='${pots[0]}'; update public.balance_snapshots set current=100 where user_id='${user}';`,
  );
  const withdrawals = await Promise.all(
    [1, 2].map(() =>
      concurrent(
        `begin; set local role service_role; select public.mutate_owned_pot('${user}','${pots[0]}','withdraw',40); select pg_sleep(0.25); commit;`,
      ),
    ),
  );
  assert.equal(
    withdrawals.filter((r) => r.code === 0).length,
    1,
    JSON.stringify(withdrawals),
  );
  assert.match(
    withdrawals.find((r) => r.code !== 0).stderr,
    /INSUFFICIENT_POT_FUNDS/,
  );
  assert.equal(
    sql(`select total from public.pots where id='${pots[0]}'`),
    "10",
  );
  assert.equal(
    sql(`select current from public.balance_snapshots where user_id='${user}'`),
    "140",
  );
  console.log(
    "PASS: concurrent withdrawals cannot withdraw the same savings twice",
  );
  sql(
    `update public.balance_snapshots set current=100 where user_id='${user}'`,
  );
  const transactionIds = [
    "30000000-0000-4000-8000-000000000010",
    "30000000-0000-4000-8000-000000000011",
  ];
  const expenses = await Promise.all(
    transactionIds.map((id) =>
      concurrent(
        `begin; set local role service_role; select public.mutate_owned_transaction('${user}','${id}','create','Concurrent expense',-80,'2024-08-01','40000000-0000-4000-8000-000000000001'); select pg_sleep(0.25); commit;`,
      ),
    ),
  );
  assert.equal(
    expenses.filter((result) => result.code === 0).length,
    1,
    JSON.stringify(expenses),
  );
  assert.match(
    expenses.find((result) => result.code !== 0).stderr,
    /INSUFFICIENT_BALANCE/,
  );
  assert.equal(
    sql(`select current from public.balance_snapshots where user_id='${user}'`),
    "20",
  );
  assert.equal(
    sql(
      `select count(*) from public.transactions where id in ('${transactionIds[0]}','${transactionIds[1]}')`,
    ),
    "1",
  );
  console.log(
    "PASS: concurrent transaction expenses cannot overspend the same balance",
  );
} finally {
  if (started)
    run(path.join(bin, "pg_ctl"), ["-D", data, "-m", "fast", "-w", "stop"]);
  rmSync(directory, { recursive: true, force: true });
}
