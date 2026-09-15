/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Buffer resolve stub for Meteor test-client Rspack
 *
 * test-client-rspack aliases the Node builtin to the path
 * "node_modules/buffer/" which is not a real package. This file
 * satisfies that alias without shipping a second Buffer polyfill.
 */
const NodeBuffer = globalThis.Buffer

export { NodeBuffer as Buffer }
export default { Buffer: NodeBuffer }
