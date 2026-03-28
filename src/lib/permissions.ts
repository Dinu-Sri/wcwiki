const ROLE_HIERARCHY: Record<string, number> = {
  USER: 0,
  EDITOR: 1,
  APPROVER: 2,
  SUPER_ADMIN: 3,
};

/**
 * Check if a viewer with `viewerRole` can view a profile with `targetRole`.
 * - USER: own profile only (checked separately)
 * - EDITOR: USER + EDITOR profiles
 * - APPROVER: USER + EDITOR + APPROVER profiles
 * - SUPER_ADMIN: all profiles
 */
export function canViewProfile(viewerRole: string, targetRole: string): boolean {
  const viewerLevel = ROLE_HIERARCHY[viewerRole] ?? 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0;
  return viewerLevel >= targetLevel;
}
