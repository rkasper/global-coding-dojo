export interface Transaction {
    type: string;
    amount: number;
    date: Date;
    balanceAfter: number;
}

export class BankAccount {
    private balanceInCents: number = 0;
    private transactions: Transaction[] = [];

    deposit(dollars: number) {
        this.assertPositiveAmount(dollars);
        this.balanceInCents += dollars * 100;
        this.transactions.push({
            type: "deposit",
            amount: dollars,
            date: new Date(),
            balanceAfter: this.balanceInCents / 100
        });
    }

    withdraw(dollars: number) {
        this.assertPositiveAmount(dollars);
        const amountInCents = dollars * 100;
        if (this.balanceInCents < amountInCents) {
            throw new Error("Insufficient funds");
        }
        this.balanceInCents -= amountInCents;
        this.transactions.push({
            type: "withdrawal",
            amount: dollars,
            date: new Date(),
            balanceAfter: this.balanceInCents / 100
        });
    }

    get balance(): number {
        return this.balanceInCents / 100;
    }

    getTransactions(): Transaction[] {
        return this.transactions;
    }

    private assertPositiveAmount(amount: number) {
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
    }
}