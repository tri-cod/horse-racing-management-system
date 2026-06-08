// ============================================================
// USER ROLES & STATUSES
// Source of truth, khớp với enum của backend (OpenAPI spec).
// Khi backend thêm role mới (ví dụ TRAINER), chỉ cần thêm vào đây.
// ============================================================

export const ROLES = [
  'ADMIN',
  'MANAGER',
  'STAFF',
  'REFEREE',
  'JOCKEY',
  'HORSE_OWNER',
  'SPECTATOR',
  'USER',
  'TRAINER',
];

export const ROLE_LABELS = {
  ADMIN:       'Administrator',
  MANAGER:     'Manage',
  STAFF:       'Staff',
  REFEREE:     'Referee',
  JOCKEY:      'Jockey',
  HORSE_OWNER: 'Horse owner',
  SPECTATOR:   'Audiences',
  USER:        'User',
  TRAINER:     'Trainer', 
};

export const STATUSES = ['ACTIVE', 'INACTIVE', 'BANNED'];

export const STATUS_LABELS = {
  ACTIVE:   'Currently active',
  INACTIVE: 'Not activated',
  BANNED:   'Locked',
};

export const PAGE_SIZES = [10, 20, 50];
