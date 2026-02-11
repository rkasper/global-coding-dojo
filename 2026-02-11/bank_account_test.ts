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

