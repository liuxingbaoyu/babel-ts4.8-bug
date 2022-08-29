import { NodePath, Scope } from "./traverse";

class NodePath2 extends NodePath {
  a() {
    if (this.isScope()) {
      new Scope(this);
    }
  }
}

export {};
