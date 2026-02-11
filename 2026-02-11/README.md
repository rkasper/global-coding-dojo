# Bank Account Kata

A classic kata for practicing TDD and incremental design. Build a simple bank account system step by step.

## Level 1: Basic Operations

Create a `BankAccount` class that supports:

- `deposit(amount)` - add money to the account
- `withdraw(amount)` - remove money from the account
- `getBalance()` - return the current balance

**Requirements:**
- Account starts with a balance of 0
- Deposit increases the balance
- Withdraw decreases the balance
- Balance cannot go negative (throw an error or return false)
- Amounts must be positive numbers

**Example:**
```
account = new BankAccount()
account.deposit(100)
account.getBalance() // returns 100
account.withdraw(30)
account.getBalance() // returns 70
account.withdraw(100) // should fail - insufficient funds
```

## Level 2: Transaction History

Add the ability to track all transactions:

- `getTransactions()` - return a list of all deposits and withdrawals

**Requirements:**
- Each transaction should include: type (deposit/withdrawal), amount, and date
- Transactions are returned in chronological order
- Balance changes are reflected in the transaction history

## Level 3: Account Statement

Add a method to print an account statement:

- `printStatement()` - print all transactions with running balance

**Requirements:**
- Statement should show: date, description, amount, and balance after each transaction
- Format should be readable and clear
- Consider column alignment for better readability

**Example output:**
```
Date       | Description | Amount  | Balance
2026-02-11 | Deposit     | +100.00 | 100.00
2026-02-11 | Withdrawal  | -30.00  | 70.00
```

## Level 4: Additional Features (Choose Your Own Adventure!)

Pick one or more to extend the kata:

- **Overdraft protection**: Allow negative balance up to a limit
- **Interest calculation**: Apply interest to the balance
- **Multiple accounts**: Support transfers between accounts
- **Account types**: Different rules for savings vs checking accounts
- **Transaction descriptions**: Allow custom notes on transactions
- **Date filtering**: Get transactions for a specific date range

## Tips for Today's Dojo

- Start with the simplest test case first
- Let the tests drive your design
- Refactor after each passing test
- Discuss design decisions as a group
- Have fun!
