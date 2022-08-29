// import { NodePath, Scope } from "./traverse-src";
import NodePath from "./traverse-src/path";
import Scope from "./traverse-src/scope";
import * as t from "@babel/types";

class NodePath2 extends NodePath {
  a() {
    if (this.isScope()) {
      new Scope(this);
    }
  }
}

export {};
