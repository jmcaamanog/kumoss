// SPDX-FileCopyrightText: 2026 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { setupWorker } from "msw/browser";
import { sessionHandlers } from "./handlers";
import { mockState, makeSessionDetail, makeRound, makeStatus } from "./factories";

function fallbackSeed() {
  mockState.clear();
  mockState.addSession(
    makeSessionDetail({
      uuid: "mock-completed-generate",
      username: "alice@example.com",
      operation: "generate",
      provider: "azure",
      first_query: "Deploy a virtual network with two subnets and an NSG",
      current_status: "completed",
      rounds: [
        makeRound({
          number: 1,
          query: "Deploy a virtual network with two subnets and an NSG",
          statuses: [makeStatus("started"), makeStatus("completed")],
          reports: [
            {
              id: 901,
              url: "https://kumossopenstaesc1dev001.blob.core.windows.net/kumoss-artifacts/sessions/mock-completed-generate/rounds/1/reports/generate-mock01.json",
              content_type: "application/json",
              file_size_bytes: 1024,
              created_at: "2026-01-01T00:00:10Z",
              type: "generate",
            },
          ],
          compliance_checks: [
            {
              id: 902,
              url: "https://kumossopenstaesc1dev001.blob.core.windows.net/kumoss-artifacts/sessions/mock-completed-generate/rounds/1/compliance/check-mock01.json",
              content_type: "application/json",
              file_size_bytes: 512,
              created_at: "2026-01-01T00:00:11Z",
              passed: false,
            },
          ],
          plans: [
            {
              id: 903,
              url: "https://kumossopenstaesc1dev001.blob.core.windows.net/kumoss-artifacts/sessions/mock-completed-generate/rounds/1/plans/mock01.txt",
              content_type: "text/plain",
              file_size_bytes: 2048,
              created_at: "2026-01-01T00:00:12Z",
              targets: [
                "azurerm_virtual_network.main",
                "azurerm_subnet.frontend",
              ],
            },
          ],
          code_changes: [
            {
              id: 904,
              url: "https://kumossopenstaesc1dev001.blob.core.windows.net/kumoss-artifacts/sessions/mock-completed-generate/rounds/1/changes/mock01-main.tf",
              content_type: "text/plain",
              file_size_bytes: 768,
              created_at: "2026-01-01T00:00:13Z",
              file_name: "main.tf",
            },
          ],
        }),
      ],
      chat_history: [
        {
          user: "Deploy a virtual network with two subnets and an NSG",
          assistant: "Done — VNet created with 4 resources.",
        },
      ],
    }),
  );
  mockState.addSession(
    makeSessionDetail({
      uuid: "mock-uncompleted-generate",
      username: "bob@example.com",
      operation: "generate",
      provider: "gcp",
      first_query: "Create a GKE cluster with node autoscaling",
      current_status: "uncompleted",
      in_flight: false,
      is_blocked: false,
      created_at: "2026-10-07T14:20:00Z",
      updated_at: "2026-10-07T14:21:30Z",
      scope_id: "my-gcp-project-123",
      rounds: [
        makeRound({
          number: 1,
          query: "Create a GKE cluster with node autoscaling",
          statuses: [
            makeStatus("started", "Preparing your workspace…", "2026-10-07T14:20:00Z"),
            makeStatus("filtering", "Evaluating request scope…", "2026-10-07T14:20:15Z"),
            makeStatus("uncompleted", "Request filtered out — not within allowed scope.", "2026-10-07T14:21:30Z"),
          ],
        }),
      ],
      chat_history: [
        {
          user: "Create a GKE cluster with node autoscaling",
          assistant: "The request was filtered out because it falls outside the allowed scope for this workspace.",
        },
      ],
    }),
  );
}

async function seed() {
  try {
    const loadSeeds = import.meta.glob<{ seed: () => void }>(
      "./seeds/index.ts",
    )["./seeds/index.ts"];
    if (loadSeeds) {
      const localSeeds = await loadSeeds();
      localSeeds.seed();
      return;
    }
  } catch {
    // Fall through to the committed fixtures.
  }
  fallbackSeed();
}

const browserHandlers = [...sessionHandlers];

const worker = setupWorker(...browserHandlers);

export async function startMockWorker() {
  await seed();
  await worker.start({ onUnhandledRequest: "warn" });
}
