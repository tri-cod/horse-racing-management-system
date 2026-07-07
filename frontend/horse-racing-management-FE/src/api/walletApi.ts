import axiosInstance from './axiosInstance';
import type { ApiResponse, Wallet, PendingTransaction, BankAccount } from '@/types';

export interface CreateDepositPayload {
  amount: number;
  paymentMethod?: string;
}

export const getBalance = () =>
 axiosInstance.get<ApiResponse<Wallet>>('/wallet/balance').then((r) => r.data.data);

export const createDeposit = (payload: CreateDepositPayload) =>
 axiosInstance.post<ApiResponse<Deposit>>('/wallet/deposit', payload).then((r) => r.data.data);

export const getPendingDeposits = () =>
 axiosInstance.get<ApiResponse<PendingTransaction[]>>('/wallet/deposit/pending').then((r) => r.data.data);

export const approveDeposit = (id: number, note: string) =>
  axiosInstance
    .put<ApiResponse<null>>(`/wallet/deposit/${id}/approve`, null, { params: { note } })
    .then((r) => r.data);

export const rejectDeposit = (id: number, note: string) =>
  axiosInstance
    .put<ApiResponse<null>>(`/wallet/deposit/${id}/reject`, null, { params: { note } })
    .then((r) => r.data);

export const getSystemBalance = () =>
 axiosInstance.get<ApiResponse<Wallet>>('/wallet/balance/system').then((r) => r.data.data);

export interface CreateWithdrawPayload {
  amount: number;
  bankAccountId: number;
}

export const createWithdraw = (payload: CreateWithdrawPayload) =>
  axiosInstance.post<ApiResponse<Withdraw>>('/wallet/withdraw', payload).then((r) => r.data.data);

export const getPendingWithdraws = () =>
  axiosInstance.get<ApiResponse<PendingTransaction[]>>('/wallet/withdraw/pending').then((r) => r.data.data);

export const approveWithdraw = (id: number, note: string) =>
  axiosInstance
    .put<ApiResponse<null>>(`/wallet/withdraw/${id}/approve`, null, { params: { note } })
    .then((r) => r.data);

export const rejectWithdraw = (id: number, note: string) =>
  axiosInstance
    .put<ApiResponse<null>>(`/wallet/withdraw/${id}/reject`, null, { params: { note } })
    .then((r) => r.data);

export interface AddBankAccountPayload {
  bankName: string;
  bankNumber: string;
  bankUserName: string;
}

export const getMyBankAccounts = () =>
  axiosInstance.get<ApiResponse<BankAccount[]>>('/wallet/bank-accounts').then((r) => r.data.data);

export const addBankAccount = (payload: AddBankAccountPayload) =>
  axiosInstance
    .post<ApiResponse<BankAccount>>('/wallet/bank-accounts', payload)
    .then((r) => r.data.data);
