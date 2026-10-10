import type { Issue, IssueStatus } from '../models/issue';

/**
 * Events published when issues change.
 *
 * This is the extension point asked for by the guidelines: real-time
 * updates, targeted notifications or in-issue comments can be plugged in by
 * subscribing here (e.g. to send a notification) or by calling `emit` when
 * a WebSocket / Server-Sent-Events message arrives from the back end.
 */
export type IssueEvent =
  | { type: 'issue-created'; issue: Issue }
  | { type: 'issue-updated'; issue: Issue }
  | { type: 'status-changed'; issue: Issue; previousStatus: IssueStatus };

/** Function called for every published event. */
export type IssueEventListener = (event: IssueEvent) => void;

/** Current subscribers. */
const listeners = new Set<IssueEventListener>();

/** Tiny publish/subscribe hub for issue events. */
export const issueEvents = {
  /** Registers a listener; returns a function that removes it. */
  subscribe(listener: IssueEventListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Sends an event to every listener. A failing listener does not affect the others. */
  emit(event: IssueEvent): void {
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Issue event listener failed', error);
      }
    });
  },
};

/** Publishes the events for a saved issue: always "updated", plus "status-changed" when the status moved. */
export function publishIssueSaved(previous: Issue, saved: Issue): void {
  issueEvents.emit({ type: 'issue-updated', issue: saved });
  if (previous.status !== saved.status) {
    issueEvents.emit({ type: 'status-changed', issue: saved, previousStatus: previous.status });
  }
}
