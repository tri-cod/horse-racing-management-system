export type ReportTargetType = 'USER' | 'HORSE';

export type ReportReason = 'CHEATING' | 'ABUSE' | 'FAKE_INFO' | 'RULE_VIOLATION' | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

export interface Report {
 id: number;
 reporterId: number;
 reporterName?: string;
 targetType: ReportTargetType;
 targetId: number;
 targetName?: string;
 reason: string;
 detail?: string;
 status: ReportStatus;
 adminNote?: string;
 createdAt?: string;
 reviewedAt?: string;
}

export interface CreateReportPayload {
 targetType: ReportTargetType;
 targetId: number;
 reason: ReportReason;
 detail?: string;
}

export type ReportReviewAction = 'DISMISS' | 'BAN_USER' | 'BAN_HORSE';
