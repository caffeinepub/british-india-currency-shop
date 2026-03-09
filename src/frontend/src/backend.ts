// Stub backend — this app uses localStorage for all data persistence.
// No Motoko canister is required for this application.

export type backendInterface = {
  _initializeAccessControlWithSecret: (secret: string) => Promise<void>;
  getCallerUserRole: () => Promise<{ admin: null } | { user: null } | { guest: null }>;
  isCallerAdmin: () => Promise<boolean>;
  assignCallerUserRole: (user: unknown, role: unknown) => Promise<void>;
};
