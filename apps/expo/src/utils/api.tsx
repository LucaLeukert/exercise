import { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import {
  createTRPCContext,
} from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@acme/worker";

import { getBaseUrl } from "./base-url";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export const api = createTRPCReact<AppRouter>();

export function TRPCClient(props: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          colorMode: "ansi",
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseUrl()}/trpc`,
          async headers() {
            const authToken = await getToken();
            return {
              Authorization: authToken ?? undefined,
            };
          },
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}

export type { RouterInputs, RouterOutputs } from "@acme/worker";
