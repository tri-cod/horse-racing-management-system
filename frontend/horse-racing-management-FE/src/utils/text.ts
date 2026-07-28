/** "APPROVED" | "PENDING_ADMIN" | "Active" → "Approved" | "Pending Admin" | "Active" */
export const humanizeStatus = (status?: string | null) =>
  status
    ? status
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '';
