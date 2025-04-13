"use server";

import { workflow } from "@/lib/qstash";

export const pollWorkflowStatus = async (workflowRunId: string) => {
  const MAX_RETRIES = 5;
  const POLLING_INTERVAL = 5000; // 5 seconds

  let retries = 0;
  let workflowStatus = false;

  if (!workflowRunId) {
    throw new Error("Workflow run ID is required");
  }

  while (retries < MAX_RETRIES) {
    try {
      const { runs } = await workflow.logs({
        workflowRunId,
      });

      if (runs && runs.length > 0) {
        const { workflowState } = runs[0];

        if (workflowState === "RUN_SUCCESS") {
          workflowStatus = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        retries++;
      }
    } catch (error) {
      console.error("Error fetching workflow logs:", error);
      throw new Error("Failed to fetch workflow logs");
    }
  }

  if (!workflowStatus) {
    throw new Error("Workflow did not complete successfully");
  }

  return {
    status: "success",
    message: "Workflow completed successfully",
  };
};
