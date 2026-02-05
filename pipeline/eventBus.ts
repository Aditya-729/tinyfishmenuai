import { PipelineEvent } from "../lib/types";

type RunState = {
  events: PipelineEvent[];
  subscribers: Set<ReadableStreamDefaultController>;
  closed: boolean;
};

class EventBus {
  private runs = new Map<string, RunState>();

  startRun(runId: string) {
    if (!this.runs.has(runId)) {
      this.runs.set(runId, { events: [], subscribers: new Set(), closed: false });
    }
  }

  append(runId: string, event: Omit<PipelineEvent, "sequence">) {
    const run = this.runs.get(runId);
    if (!run) return;
    const sequence = run.events.length;
    const payload: PipelineEvent = { ...event, sequence };
    run.events.push(payload);
    run.subscribers.forEach((controller) => controller.enqueue(payload));
  }

  close(runId: string) {
    const run = this.runs.get(runId);
    if (!run) return;
    run.closed = true;
    run.subscribers.forEach((controller) => controller.close());
    run.subscribers.clear();
  }

  createStream(runId: string, fromIndex = 0) {
    const run = this.runs.get(runId);
    if (!run) return null;

    let activeController: ReadableStreamDefaultController | null = null;

    return new ReadableStream<PipelineEvent>({
      start: (controller) => {
        activeController = controller;
        run.events.slice(fromIndex).forEach((event) => controller.enqueue(event));
        if (run.closed) {
          controller.close();
          return;
        }
        run.subscribers.add(controller);
      },
      cancel: () => {
        if (activeController) {
          run.subscribers.delete(activeController);
        }
      },
    });
  }

  getRun(runId: string) {
    return this.runs.get(runId);
  }
}

export const eventBus = new EventBus();
