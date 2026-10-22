/** Hashing port, so the auth flow does not depend on a concrete algorithm. */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
