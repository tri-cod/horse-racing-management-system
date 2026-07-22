export interface Trainer {
 id: number;
 userId?: number;
 name?: string;
 fullName?: string;
 avatarUrl?: string;
 dateOfBirth?: string;
 experienceYears?: number;
 experience?: string;
 specialization?: string;
 description?: string;
 bio?: string;
 status?: string;
 monthlyFee?: number;   // giá thuê/tháng do trainer đặt (BigDecimal → number/string on wire)
}
