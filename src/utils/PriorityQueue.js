class PriorityQueue {
  constructor() {
    this.queue = [];
  }
 enqueue(truck) {
    this.queue.push(truck);
    this.queue.sort((a, b) => {
        // first sort by priority (higher first)
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // same priority → shorter processing duration first
        if (a.processingDuration !== b.processingDuration) {
            return a.processingDuration - b.processingDuration;
        }
        // same duration → earlier arrival first
        return new Date(a.arrivalTime) - new Date(b.arrivalTime);
    });
}
  dequeue() {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
  clear() {
    this.queue = [];
  }
}
export default PriorityQueue;
