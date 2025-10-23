export declare class NewsApproval {
    id: string;
    news_id: string;
    approver_id: string;
    status: 'approved' | 'rejected' | 'pending' | 'changes_requested';
    remarks: string;
    action_at: Date;
    approver?: any;
    news?: any;
}
