import type { HubInterface } from "../hub";
import type TraversalContext from "../context";
import type { Visitor } from "../types";
import Scope from "../scope";
import { validate } from "@babel/types";
import * as t from "@babel/types";

import type { NodePathValidators } from "./generated/validators";

export const REMOVED = 1 << 0;
export const SHOULD_STOP = 1 << 1;
export const SHOULD_SKIP = 1 << 2;

class NodePath<T extends t.Node = t.Node> {
  constructor(hub: HubInterface, parent: t.ParentMaps[T["type"]]) {
    this.parent = parent;
    this.hub = hub;
    this.data = null;

    this.context = null;
    this.scope = null;
  }

  declare parent: t.ParentMaps[T["type"]];
  declare hub: HubInterface;
  declare data: Record<string | symbol, unknown>;
  // TraversalContext is configured by setContext
  declare context: TraversalContext;
  declare scope: Scope;

  contexts: Array<TraversalContext> = [];
  state: any = null;
  opts: any = null;
  // this.shouldSkip = false; this.shouldStop = false; this.removed = false;
  _traverseFlags: number = 0;
  skipKeys: any = null;
  parentPath: t.ParentMaps[T["type"]] extends null
    ? null
    : NodePath<t.ParentMaps[T["type"]]> | null = null;
  container: t.Node | Array<t.Node> | null = null;
  listKey: string | null = null;
  key: string | number | null = null;
  node: T = null;
  type: T["type"] | null = null;

  static get({
    hub,
    parentPath,
    parent,
    container,
    listKey,
    key,
  }: {
    hub?: HubInterface;
    parentPath: NodePath | null;
    parent: t.Node;
    container: t.Node | t.Node[];
    listKey?: string;
    key: string | number;
  }): NodePath {}

  getScope(scope: Scope): Scope {
    // TODO: Remove this when TS is fixed.
    // A regression was introduced in ts4.8 that would cause OOM.
    // Avoid it by manually casting the types.
    // https://github.com/babel/babel/pull/14880
    return this.isScope() ? new Scope(this) : scope;
  }

  setData(key: string | symbol, val: any): any {
    if (this.data == null) {
      this.data = Object.create(null);
    }
    return (this.data[key] = val);
  }

  getData(key: string | symbol, def?: any): any {
    if (this.data == null) {
      this.data = Object.create(null);
    }
    let val = this.data[key];
    if (val === undefined && def !== undefined) val = this.data[key] = def;
    return val;
  }

  hasNode(): this is NodePath<NonNullable<this["node"]>> {
    return this.node != null;
  }

  buildCodeFrameError(
    msg: string,
    Error: new () => Error = SyntaxError
  ): Error {
    return this.hub.buildError(this.node, msg, Error);
  }

  traverse<T>(visitor: Visitor<T>, state: T): void;
  traverse(visitor: Visitor): void;
  traverse(visitor: any, state?: any) {}

  set(key: string, node: any) {
    validate(this.node, key, node);
    // @ts-expect-error key must present in this.node
    this.node[key] = node;
  }

  getPathLocation(): string {
    const parts = [];
    let path: NodePath = this;
    do {
      let key = path.key;
      if (path.inList) key = `${path.listKey}[${key}]`;
      parts.unshift(key);
    } while ((path = path.parentPath));
    return parts.join(".");
  }

  debug(message: string) {}

  toString() {
    return "";
  }

  get inList() {
    return !!this.listKey;
  }

  set inList(inList) {
    if (!inList) {
      this.listKey = null;
    }
    // ignore inList = true as it should depend on `listKey`
  }

  get parentKey(): string {
    return (this.listKey || this.key) as string;
  }

  get shouldSkip() {
    return !!(this._traverseFlags & SHOULD_SKIP);
  }

  set shouldSkip(v) {
    if (v) {
      this._traverseFlags |= SHOULD_SKIP;
    } else {
      this._traverseFlags &= ~SHOULD_SKIP;
    }
  }

  get shouldStop() {
    return !!(this._traverseFlags & SHOULD_STOP);
  }

  set shouldStop(v) {
    if (v) {
      this._traverseFlags |= SHOULD_STOP;
    } else {
      this._traverseFlags &= ~SHOULD_STOP;
    }
  }

  get removed() {
    return !!(this._traverseFlags & REMOVED);
  }
  set removed(v) {
    if (v) {
      this._traverseFlags |= REMOVED;
    } else {
      this._traverseFlags &= ~REMOVED;
    }
  }
}

// @ts-expect-error TS throws because ensureBlock returns the body node path
// however, we don't use the return value and treat it as a transform and
// assertion utilities. For better type inference we annotate it as an
// assertion method
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NodePath<T> extends NodePathValidators {
  /**
   * @see ./conversion.ts for implementation
   */
  ensureBlock<
    T extends
      | t.Loop
      | t.WithStatement
      | t.Function
      | t.LabeledStatement
      | t.CatchClause
  >(
    this: NodePath<T>
  ): asserts this is NodePath<T & { body: t.BlockStatement }>;
}

export default NodePath;
