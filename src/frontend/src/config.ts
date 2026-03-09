// Stub config — this app uses localStorage for all data persistence.
// No Motoko canister is required for this application.

import type { backendInterface } from "./backend";

export async function loadConfig() {
  return {
    ii_derivation_origin: undefined as string | undefined,
  };
}

type ActorOptions = {
  agentOptions?: {
    identity?: unknown;
  };
};

export async function createActorWithConfig(_options?: ActorOptions): Promise<backendInterface> {
  return {
    _initializeAccessControlWithSecret: async (_secret: string) => {},
    getCallerUserRole: async () => ({ guest: null }),
    isCallerAdmin: async () => false,
    assignCallerUserRole: async (_user: unknown, _role: unknown) => {},
  };
}
