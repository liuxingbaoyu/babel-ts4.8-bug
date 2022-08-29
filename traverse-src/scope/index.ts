import type NodePath from "../path";
import Binding from "./binding";

import type * as t from "@babel/types";

let uid = 0;

export type { Binding };

export default class Scope {
  uid;

  path: NodePath;
  block: t.Pattern | t.Scopable;

  labels;
  inited;

  bindings: { [name: string]: Binding };
  references: { [name: string]: true };
  globals: { [name: string]: t.Identifier | t.JSXIdentifier };
  uids: { [name: string]: boolean };
  data: { [key: string | symbol]: unknown };
  crawling: boolean;

  /**
   * This searches the current "scope" and collects all references/bindings
   * within.
   */
  constructor(path: NodePath<t.Pattern | t.Scopable>) {
    const { node } = path;
    // Sometimes, a scopable path is placed higher in the AST tree.
    // In these cases, have to create a new Scope.

    this.uid = uid++;

    this.block = node;
    this.path = path;

    this.labels = new Map();
    this.inited = false;
  }
}
