let counter = 0;

export function createMessageId(prefix = "msg") {
  counter = (counter + 1) % 100000;
  return `${prefix}-${Date.now()}-${counter}`;
}
