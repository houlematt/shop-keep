function trim(s) {
  return String(s ?? '').trim();
}

/**
 * @param {{ email?: string, first_name?: string, last_name?: string } | null | undefined} user
 * @returns {string} One or two uppercase characters for an avatar label.
 */
export function userInitials(user) {
  if (!user) return '?';
  const first = trim(user.first_name);
  const last = trim(user.last_name);
  if (first && last) {
    return (first[0] + last[0]).toUpperCase();
  }
  if (first.length >= 2) {
    return first.slice(0, 2).toUpperCase();
  }
  if (first.length === 1) {
    return first.toUpperCase();
  }
  const email = trim(user.email);
  if (email) {
    const local = email.split('@')[0] || email;
    const letters = local.replace(/[^a-zA-Z0-9]/g, '');
    if (letters.length >= 2) {
      return letters.slice(0, 2).toUpperCase();
    }
    if (letters.length === 1) {
      return (letters + letters).toUpperCase();
    }
    if (local.length >= 2) {
      return local.slice(0, 2).toUpperCase();
    }
    if (local.length === 1) {
      return (local + local).toUpperCase();
    }
  }
  return '?';
}
