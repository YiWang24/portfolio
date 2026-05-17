let counter = 0;

export function createMessageId(prefix = "msg") {
  counter = (counter + 1) % 100000;
  return `${prefix}-${Date.now()}-${counter}`;
}

export type ThoughtLog = {
  id: string;
  message: string;
  status: "running" | "done" | "error";
};

export function createInitialThoughts(): ThoughtLog[] {
  return [
    {
      id: createMessageId("thought"),
      message: "Analyzing intent...",
      status: "done",
    },
    {
      id: createMessageId("thought"),
      message: "Routing to best agent...",
      status: "done",
    },
    {
      id: createMessageId("thought"),
      message: "Synthesizing response...",
      status: "running",
    },
  ];
}
