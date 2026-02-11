import {assert, assertEquals, assertThrows} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {BankAccount} from "./bank_account.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function account_balance_starts_at_0() {
  const bankAccount = new BankAccount();
  assertEquals(bankAccount.balance, 0);
});

Deno.test(function deposit_increases_balance() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  assertEquals(bankAccount.balance, 100);
  bankAccount.deposit(0.57);
  assertEquals(bankAccount.balance, 100.57);
});

Deno.test(function withdraw_decreases_balance() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.withdraw(30);
  assertEquals(bankAccount.balance, 70);
});

Deno.test(function floating_point_precision_problem() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(0.1);
  bankAccount.deposit(0.2);
  assertEquals(bankAccount.balance, 0.3);
});

Deno.test(function cannot_withdraw_more_than_balance() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(50);
  assertThrows(() => {
    bankAccount.withdraw(100);
  }, Error, "Insufficient funds");
});

Deno.test(function deposit_rejects_negative_amounts() {
  const bankAccount = new BankAccount();
  assertThrows(() => {
    bankAccount.deposit(-50);
  }, Error, "Amount must be positive");
});

Deno.test(function withdraw_rejects_negative_amounts() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  assertThrows(() => {
    bankAccount.withdraw(-30);
  }, Error, "Amount must be positive");
});

Deno.test(function getTransactions_returns_deposit_transaction() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 1);
  assertEquals(transactions[0].type, "deposit");
  assertEquals(transactions[0].amount, 100);
});

Deno.test(function getTransactions_returns_multiple_deposits() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.deposit(50);
  bankAccount.deposit(25.50);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 3);
  assertEquals(transactions[0].type, "deposit");
  assertEquals(transactions[0].amount, 100);
  assertEquals(transactions[1].type, "deposit");
  assertEquals(transactions[1].amount, 50);
  assertEquals(transactions[2].type, "deposit");
  assertEquals(transactions[2].amount, 25.50);
});

Deno.test(function getTransactions_returns_withdrawal_transaction() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.withdraw(30);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 2);
  assertEquals(transactions[0].type, "deposit");
  assertEquals(transactions[0].amount, 100);
  assertEquals(transactions[1].type, "withdrawal");
  assertEquals(transactions[1].amount, 30);
});

Deno.test(function getTransactions_returns_mixed_transactions_in_order() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.deposit(50);
  bankAccount.withdraw(30);
  bankAccount.deposit(20);
  bankAccount.withdraw(10);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 5);
  assertEquals(transactions[0].type, "deposit");
  assertEquals(transactions[0].amount, 100);
  assertEquals(transactions[1].type, "deposit");
  assertEquals(transactions[1].amount, 50);
  assertEquals(transactions[2].type, "withdrawal");
  assertEquals(transactions[2].amount, 30);
  assertEquals(transactions[3].type, "deposit");
  assertEquals(transactions[3].amount, 20);
  assertEquals(transactions[4].type, "withdrawal");
  assertEquals(transactions[4].amount, 10);
});

Deno.test(function transaction_includes_date() {
  const bankAccount = new BankAccount();
  const beforeDeposit = new Date();
  bankAccount.deposit(100);
  const afterDeposit = new Date();
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 1);
  assert(transactions[0].date instanceof Date);
  assert(transactions[0].date >= beforeDeposit);
  assert(transactions[0].date <= afterDeposit);
});

Deno.test(function transactions_are_in_chronological_order() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.withdraw(30);
  bankAccount.deposit(50);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 3);
  assert(transactions[0].date <= transactions[1].date);
  assert(transactions[1].date <= transactions[2].date);
});

Deno.test(function transaction_records_balance_after_transaction() {
  const bankAccount = new BankAccount();
  bankAccount.deposit(100);
  bankAccount.withdraw(30);
  bankAccount.deposit(50);
  const transactions = bankAccount.getTransactions();
  assertEquals(transactions.length, 3);
  assertEquals(transactions[0].balanceAfter, 100);
  assertEquals(transactions[1].balanceAfter, 70);
  assertEquals(transactions[2].balanceAfter, 120);
});

