export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Wallet {
 id: number;
 userId: number;
 balance: number;
 currency?: string;
}

// Shape thực tế backend trả về cho cả deposit và withdraw pending list
export interface PendingTransaction {
 id: number;
 user?: { id: number; username?: string; fullName?: string; email?: string };
 requestType: 'DEPOSIT' | 'WITHDRAW';
 amount: number;
 requestStatus: TransactionStatus;
 paymentMethod?: string;
 referenceCode?: string;
 qrUrl?: string;
 verifyNote?: string;  // với withdraw: "Bank: {bankName} - {bankUserName} - {bankNumber}"
 processedby?: string;
 createdAt: string;
 processedat?: string;
}

// Giữ lại để không break code cũ nếu có nơi nào dùng
export type Deposit = PendingTransaction;
export type Withdraw = PendingTransaction;

export interface BankAccount {
 id: number;
 bankName: string;
 bankNumber: string;
 bankUserName: string;
}
