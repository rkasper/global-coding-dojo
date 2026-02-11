export class BankAccount {
    private balanceInCents: number = 0;

    deposit(dollars: number) {
        this.assertPositiveAmount(dollars);
        this.balanceInCents += dollars * 100;
    }

    withdraw(dollars: number) {
        this.assertPositiveAmount(dollars);
        const amountInCents = dollars * 100;
        if (this.balanceInCents < amountInCents) {
            throw new Error("Insufficient funds");
        }
        this.balanceInCents -= amountInCents;
    }

    get balance(): number {
        return this.balanceInCents / 100;
    }

    private assertPositiveAmount(amount: number) {
        if (amount <= 0) {
            throw new Error("Amount must be positive");
        }
    }
}