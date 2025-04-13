import { workflow } from "@/lib/qstash";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const MAX_RETRIES = 5;
const POLLING_INTERVAL = 5000; // 5 seconds

export const workflowsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        workflowRunId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { workflowRunId } = input;

      let retries = 0;
      let workflowStatus = false;

      if (!workflowRunId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workflow run ID is required",
        });
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

            // If the workflow is still running, wait for a while before checking again
            await new Promise((resolve) =>
              setTimeout(resolve, POLLING_INTERVAL),
            );

            retries++;
          }
        } catch (error) {
          console.error("Error fetching workflow logs:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch workflow logs",
          });
        }
      }

      if (!workflowStatus) {
        throw new TRPCError({
          code: "TIMEOUT",
          message: "Workflow did not complete successfully",
        });
      }

      return {
        status: "success",
        message: "Workflow completed successfully",
      };
    }),
});
