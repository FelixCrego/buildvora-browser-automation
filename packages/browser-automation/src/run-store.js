import { RunStateError } from "./errors.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class InMemoryRunStore {
  constructor() {
    this.runs = new Map();
  }

  create(run) {
    if (!run?.runId) {
      throw new RunStateError("run.runId is required.");
    }

    const snapshot = clone(run);
    this.runs.set(run.runId, snapshot);
    return clone(snapshot);
  }

  get(runId) {
    const run = this.runs.get(runId);
    return run ? clone(run) : null;
  }

  update(runId, updates) {
    const current = this.runs.get(runId);
    if (!current) {
      throw new RunStateError(`Unknown run ${runId}.`);
    }

    const next = {
      ...current,
      ...clone(updates),
    };
    this.runs.set(runId, next);
    return clone(next);
  }

  delete(runId) {
    this.runs.delete(runId);
  }

  list() {
    return Array.from(this.runs.values(), (run) => clone(run));
  }
}
