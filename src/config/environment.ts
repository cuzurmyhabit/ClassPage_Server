/** Required credentials are never supplied by source-code defaults. */
export function requireEnvironment(name: string, minimumLength = 1): string {
  const value = process.env[name];
  if (!value || value.trim().length < minimumLength) {
    throw new Error(name + ' must be configured (minimum ' + minimumLength + ' characters).');
  }
  return value;
}

export function requireJwtSecret(): string {
  const value = requireEnvironment('JWT_SECRET', 32);
  if (/change[-_ ]?(this|me)|replace[-_ ]?me|your[-_ ]?secret|<[^>]+>/i.test(value)) {
    throw new Error('JWT_SECRET must not be a published example or placeholder.');
  }
  return value;
}
