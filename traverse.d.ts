import * as t from "./types";
import { Node, RemovePropertiesOptions } from "./types";

declare let path: WeakMap<object, any>;
declare let scope: WeakMap<object, any>;
declare function clear(): void;
declare function clearPath(): void;
declare function clearScope(): void;

declare const __cache_path: typeof path;
declare const __cache_scope: typeof scope;
declare const __cache_clear: typeof clear;
declare const __cache_clearPath: typeof clearPath;
declare const __cache_clearScope: typeof clearScope;
declare namespace __cache {
  export {
    __cache_path as path,
    __cache_scope as scope,
    __cache_clear as clear,
    __cache_clearPath as clearPath,
    __cache_clearScope as clearScope,
  };
}

/**
 * explode() will take a visitor object with all of the various shorthands
 * that we support, and validates & normalizes it into a common format, ready
 * to be used in traversal
 *
 * The various shorthands are:
 * * `Identifier() { ... }` -> `Identifier: { enter() { ... } }`
 * * `"Identifier|NumericLiteral": { ... }` -> `Identifier: { ... }, NumericLiteral: { ... }`
 * * Aliases in `@babel/types`: e.g. `Property: { ... }` -> `ObjectProperty: { ... }, ClassProperty: { ... }`
 *
 * Other normalizations are:
 * * Visitors of virtual types are wrapped, so that they are only visited when
 *   their dynamic check passes
 * * `enter` and `exit` functions are wrapped in arrays, to ease merging of
 *   visitors
 */
declare function explode(visitor: Visitor): Visitor<{}>;
declare function verify(visitor: Visitor): void;
declare function merge<State>(visitors: Visitor<State>[]): Visitor<State>;
declare function merge(
  visitors: Visitor<unknown>[],
  states?: any[],
  wrapper?: Function | null
): Visitor<unknown>;

declare const __visitors_explode: typeof explode;
declare const __visitors_verify: typeof verify;
declare const __visitors_merge: typeof merge;
declare namespace __visitors {
  export {
    __visitors_explode as explode,
    __visitors_verify as verify,
    __visitors_merge as merge,
  };
}

declare type BindingKind =
  | "var"
  | "let"
  | "const"
  | "module"
  | "hoisted"
  | "param"
  | "local"
  | "unknown";
/**
 * This class is responsible for a binding inside of a scope.
 *
 * It tracks the following:
 *
 *  * Node path.
 *  * Amount of times referenced by other nodes.
 *  * Paths to nodes that reassign or modify this binding.
 *  * The kind of binding. (Is it a parameter, declaration etc)
 */
declare class Binding {
  identifier: t.Identifier;
  scope: Scope;
  path: NodePath;
  kind: BindingKind;
  constructor({
    identifier,
    scope,
    path,
    kind,
  }: {
    identifier: t.Identifier;
    scope: Scope;
    path: NodePath;
    kind: BindingKind;
  });
  constantViolations: Array<NodePath>;
  constant: boolean;
  referencePaths: Array<NodePath>;
  referenced: boolean;
  references: number;
  hasDeoptedValue: boolean;
  hasValue: boolean;
  value: any;
  deoptValue(): void;
  setValue(value: any): void;
  clearValue(): void;
  /**
   * Register a constant violation with the provided `path`.
   */
  reassign(path: NodePath): void;
  /**
   * Increment the amount of references to this binding.
   */
  reference(path: NodePath): void;
  /**
   * Decrement the amount of references to this binding.
   */
  dereference(): void;
}

declare class Scope {
  uid: number;
  path: NodePath;
  block: t.Pattern | t.Scopable;
  labels: Map<any, any>;
  inited: boolean;
  bindings: {
    [name: string]: Binding;
  };
  references: {
    [name: string]: true;
  };
  globals: {
    [name: string]: t.Identifier | t.JSXIdentifier;
  };
  uids: {
    [name: string]: boolean;
  };
  data: {
    [key: string | symbol]: unknown;
  };
  crawling: boolean;
  /**
   * This searches the current "scope" and collects all references/bindings
   * within.
   */
  constructor(path: NodePath<t.Pattern | t.Scopable>);
  /**
   * Globals.
   */
  static globals: string[];
  /**
   * Variables available in current context.
   */
  static contextVariables: string[];
  get parent(): Scope;
  get parentBlock(): t.Node;
  get hub(): HubInterface;
  traverse<S>(
    node: t.Node | t.Node[],
    opts: TraverseOptions<S>,
    state: S
  ): void;
  traverse(node: t.Node | t.Node[], opts?: TraverseOptions, state?: any): void;
  /**
   * Generate a unique identifier and add it to the current scope.
   */
  generateDeclaredUidIdentifier(name?: string): t.Identifier;
  /**
   * Generate a unique identifier.
   */
  generateUidIdentifier(name?: string): t.Identifier;
  /**
   * Generate a unique `_id1` binding.
   */
  generateUid(name?: string): string;
  /**
   * Generate an `_id1`.
   */
  _generateUid(name: string, i: number): string;
  generateUidBasedOnNode(node: t.Node, defaultName?: string): string;
  /**
   * Generate a unique identifier based on a node.
   */
  generateUidIdentifierBasedOnNode(
    node: t.Node,
    defaultName?: string
  ): t.Identifier;
  /**
   * Determine whether evaluating the specific input `node` is a consequenceless reference. ie.
   * evaluating it wont result in potentially arbitrary code from being ran. The following are
   * allowed and determined not to cause side effects:
   *
   *  - `this` expressions
   *  - `super` expressions
   *  - Bound identifiers
   */
  isStatic(node: t.Node): boolean;
  /**
   * Possibly generate a memoised identifier if it is not static and has consequences.
   */
  maybeGenerateMemoised(node: t.Node, dontPush?: boolean): t.Identifier;
  checkBlockScopedCollisions(
    local: Binding,
    kind: BindingKind,
    name: string,
    id: any
  ): void;
  rename(
    oldName: string,
    newName?: string,
    block?: t.Pattern | t.Scopable
  ): void;
  /** @deprecated Not used in our codebase */
  _renameFromMap(
    map: Record<string | symbol, unknown>,
    oldName: string | symbol,
    newName: string | symbol,
    value: unknown
  ): void;
  dump(): void;
  toArray(
    node: t.Node,
    i?: number | boolean,
    arrayLikeIsIterable?: boolean | void
  ): t.ArrayExpression | t.CallExpression | t.Identifier;
  hasLabel(name: string): boolean;
  getLabel(name: string): any;
  registerLabel(path: NodePath<t.LabeledStatement>): void;
  registerDeclaration(path: NodePath): void;
  buildUndefinedNode(): t.UnaryExpression;
  registerConstantViolation(path: NodePath): void;
  registerBinding(
    kind: Binding["kind"],
    path: NodePath,
    bindingPath?: NodePath
  ): void;
  addGlobal(node: t.Identifier | t.JSXIdentifier): void;
  hasUid(name: string): boolean;
  hasGlobal(name: string): boolean;
  hasReference(name: string): boolean;
  isPure(node: t.Node, constantsOnly?: boolean): boolean;
  /**
   * Set some arbitrary data on the current scope.
   */
  setData(key: string | symbol, val: any): any;
  /**
   * Recursively walk up scope tree looking for the data `key`.
   */
  getData(key: string | symbol): any;
  /**
   * Recursively walk up scope tree looking for the data `key` and if it exists,
   * remove it.
   */
  removeData(key: string): void;
  init(): void;
  crawl(): void;
  push(opts: {
    id: t.LVal;
    init?: t.Expression;
    unique?: boolean;
    _blockHoist?: number | undefined;
    kind?: "var" | "let" | "const";
  }): void;
  /**
   * Walk up to the top of the scope tree and get the `Program`.
   */
  getProgramParent(): Scope;
  /**
   * Walk up the scope tree until we hit either a Function or return null.
   */
  getFunctionParent(): Scope | null;
  /**
   * Walk up the scope tree until we hit either a BlockStatement/Loop/Program/Function/Switch or reach the
   * very top and hit Program.
   */
  getBlockParent(): Scope;
  /**
   * Walk up from a pattern scope (function param initializer) until we hit a non-pattern scope,
   * then returns its block parent
   * @returns An ancestry scope whose path is a block parent
   */
  getPatternParent(): Scope;
  /**
   * Walks the scope tree and gathers **all** bindings.
   */
  getAllBindings(): Record<string, Binding>;
  /**
   * Walks the scope tree and gathers all declarations of `kind`.
   */
  getAllBindingsOfKind(...kinds: string[]): Record<string, Binding>;
  bindingIdentifierEquals(name: string, node: t.Node): boolean;
  getBinding(name: string): Binding | undefined;
  getOwnBinding(name: string): Binding | undefined;
  getBindingIdentifier(name: string): t.Identifier;
  getOwnBindingIdentifier(name: string): t.Identifier;
  hasOwnBinding(name: string): boolean;
  hasBinding(name: string, noGlobals?: boolean): boolean;
  parentHasBinding(name: string, noGlobals?: boolean): boolean;
  /**
   * Move a binding of `name` to another `scope`.
   */
  moveBindingTo(name: string, scope: Scope): void;
  removeOwnBinding(name: string): void;
  removeBinding(name: string): void;
}

interface HubInterface {
  getCode(): string | void;
  getScope(): Scope | void;
  addHelper(name: string): any;
  buildError(node: Node, msg: string, Error: new () => Error): Error;
}
declare class Hub implements HubInterface {
  getCode(): void;
  getScope(): void;
  addHelper(): void;
  buildError(node: Node, msg: string, Error?: TypeErrorConstructor): Error;
}

declare class TraversalContext<S = unknown> {
  constructor(
    scope: Scope,
    opts: TraverseOptions,
    state: S,
    parentPath: NodePath
  );
  parentPath: NodePath;
  scope: Scope;
  state: S;
  opts: TraverseOptions;
  queue: Array<NodePath> | null;
  priorityQueue: Array<NodePath> | null;
  /**
   * This method does a simple check to determine whether or not we really need to attempt
   * visit a node. This will prevent us from constructing a NodePath.
   */
  shouldVisit(node: t.Node): boolean;
  create(
    node: t.Node,
    container: t.Node | t.Node[],
    key: string | number,
    listKey?: string
  ): NodePath;
  maybeQueue(path: NodePath, notPriority?: boolean): void;
  visitMultiple(container: t.Node[], parent: t.Node, listKey: string): boolean;
  visitSingle(node: t.Node, key: string): boolean;
  visitQueue(queue: Array<NodePath>): boolean;
  visit(node: t.Node, key: string): boolean;
}

interface VirtualTypeAliases {
  BindingIdentifier: t.Identifier;
  BlockScoped: t.Node;
  ExistentialTypeParam: t.ExistsTypeAnnotation;
  Expression: t.Expression;
  Flow: t.Flow | t.ImportDeclaration | t.ExportDeclaration | t.ImportSpecifier;
  ForAwaitStatement: t.ForOfStatement;
  Generated: t.Node;
  NumericLiteralTypeAnnotation: t.NumberLiteralTypeAnnotation;
  Pure: t.Node;
  Referenced: t.Node;
  ReferencedIdentifier: t.Identifier | t.JSXIdentifier;
  ReferencedMemberExpression: t.MemberExpression;
  RestProperty: t.RestElement;
  Scope: t.Scopable | t.Pattern;
  SpreadProperty: t.RestElement;
  Statement: t.Statement;
  User: t.Node;
  Var: t.VariableDeclaration;
}

declare type Visitor<S = {}> = VisitNodeObject<S, t.Node> &
  {
    [Type in t.Node["type"]]?: VisitNode<
      S,
      Extract<
        t.Node,
        {
          type: Type;
        }
      >
    >;
  } &
  {
    [K in keyof t.Aliases]?: VisitNode<S, t.Aliases[K]>;
  } &
  {
    [K in keyof VirtualTypeAliases]?: VisitNode<S, VirtualTypeAliases[K]>;
  } &
  {
    [K in keyof InternalVisitorFlags]?: InternalVisitorFlags[K];
  } & {
    [k: `${string}|${string}`]: VisitNode<S, t.Node>;
  };
/** @internal */
declare type InternalVisitorFlags = {
  _exploded?: boolean;
  _verified?: boolean;
};
declare type VisitNode<S, P extends t.Node> =
  | VisitNodeFunction<S, P>
  | VisitNodeObject<S, P>;
declare type VisitNodeFunction<S, P extends t.Node> = (
  this: S,
  path: NodePath<P>,
  state: S
) => void;
interface VisitNodeObject<S, P extends t.Node> {
  enter?: VisitNodeFunction<S, P>;
  exit?: VisitNodeFunction<S, P>;
}

/**
 * Starting at the parent path of the current `NodePath` and going up the
 * tree, return the first `NodePath` that causes the provided `callback`
 * to return a truthy value, or `null` if the `callback` never returns a
 * truthy value.
 */
declare function findParent(
  this: NodePath,
  callback: (path: NodePath) => boolean
): NodePath | null;
/**
 * Starting at current `NodePath` and going up the tree, return the first
 * `NodePath` that causes the provided `callback` to return a truthy value,
 * or `null` if the `callback` never returns a truthy value.
 */
declare function find(
  this: NodePath,
  callback: (path: NodePath) => boolean
): NodePath | null;
/**
 * Get the parent function of the current path.
 */
declare function getFunctionParent(this: NodePath): NodePath<t.Function> | null;
/**
 * Walk up the tree until we hit a parent node path in a list.
 */
declare function getStatementParent(this: NodePath): NodePath<t.Statement>;
/**
 * Get the deepest common ancestor and then from it, get the earliest relationship path
 * to that ancestor.
 *
 * Earliest is defined as being "before" all the other nodes in terms of list container
 * position and visiting key.
 */
declare function getEarliestCommonAncestorFrom(
  this: NodePath,
  paths: Array<NodePath>
): NodePath;
/**
 * Get the earliest path in the tree where the provided `paths` intersect.
 *
 * TODO: Possible optimisation target.
 */
declare function getDeepestCommonAncestorFrom(
  this: NodePath,
  paths: Array<NodePath>,
  filter?: (deepest: NodePath, i: number, ancestries: NodePath[][]) => NodePath
): NodePath;
/**
 * Build an array of node paths containing the entire ancestry of the current node path.
 *
 * NOTE: The current node path is included in this.
 */
declare function getAncestry(this: NodePath): Array<NodePath>;
/**
 * A helper to find if `this` path is an ancestor of @param maybeDescendant
 */
declare function isAncestor(this: NodePath, maybeDescendant: NodePath): boolean;
/**
 * A helper to find if `this` path is a descendant of @param maybeAncestor
 */
declare function isDescendant(this: NodePath, maybeAncestor: NodePath): boolean;
declare function inType(this: NodePath, ...candidateTypes: string[]): boolean;

declare const NodePath_ancestry_findParent: typeof findParent;
declare const NodePath_ancestry_find: typeof find;
declare const NodePath_ancestry_getFunctionParent: typeof getFunctionParent;
declare const NodePath_ancestry_getStatementParent: typeof getStatementParent;
declare const NodePath_ancestry_getEarliestCommonAncestorFrom: typeof getEarliestCommonAncestorFrom;
declare const NodePath_ancestry_getDeepestCommonAncestorFrom: typeof getDeepestCommonAncestorFrom;
declare const NodePath_ancestry_getAncestry: typeof getAncestry;
declare const NodePath_ancestry_isAncestor: typeof isAncestor;
declare const NodePath_ancestry_isDescendant: typeof isDescendant;
declare const NodePath_ancestry_inType: typeof inType;
declare namespace NodePath_ancestry {
  export {
    NodePath_ancestry_findParent as findParent,
    NodePath_ancestry_find as find,
    NodePath_ancestry_getFunctionParent as getFunctionParent,
    NodePath_ancestry_getStatementParent as getStatementParent,
    NodePath_ancestry_getEarliestCommonAncestorFrom as getEarliestCommonAncestorFrom,
    NodePath_ancestry_getDeepestCommonAncestorFrom as getDeepestCommonAncestorFrom,
    NodePath_ancestry_getAncestry as getAncestry,
    NodePath_ancestry_isAncestor as isAncestor,
    NodePath_ancestry_isDescendant as isDescendant,
    NodePath_ancestry_inType as inType,
  };
}

/**
 * Infer the type of the current `NodePath`.
 */
declare function getTypeAnnotation(this: NodePath): t.FlowType | t.TSType;
/**
 * todo: split up this method
 */
declare function _getTypeAnnotation(this: NodePath): any;
declare function isBaseType(
  this: NodePath,
  baseName: string,
  soft?: boolean
): boolean;
declare function couldBeBaseType(this: NodePath, name: string): boolean;
declare function baseTypeStrictlyMatches(
  this: NodePath,
  rightArg: NodePath
): boolean;
declare function isGenericType(this: NodePath, genericName: string): boolean;

declare const NodePath_inference_getTypeAnnotation: typeof getTypeAnnotation;
declare const NodePath_inference__getTypeAnnotation: typeof _getTypeAnnotation;
declare const NodePath_inference_isBaseType: typeof isBaseType;
declare const NodePath_inference_couldBeBaseType: typeof couldBeBaseType;
declare const NodePath_inference_baseTypeStrictlyMatches: typeof baseTypeStrictlyMatches;
declare const NodePath_inference_isGenericType: typeof isGenericType;
declare namespace NodePath_inference {
  export {
    NodePath_inference_getTypeAnnotation as getTypeAnnotation,
    NodePath_inference__getTypeAnnotation as _getTypeAnnotation,
    NodePath_inference_isBaseType as isBaseType,
    NodePath_inference_couldBeBaseType as couldBeBaseType,
    NodePath_inference_baseTypeStrictlyMatches as baseTypeStrictlyMatches,
    NodePath_inference_isGenericType as isGenericType,
  };
}

/**
 * Replace a node with an array of multiple. This method performs the following steps:
 *
 *  - Inherit the comments of first provided node with that of the current node.
 *  - Insert the provided nodes after the current node.
 *  - Remove the current node.
 */
declare function replaceWithMultiple(
  this: NodePath,
  nodes: t.Node | t.Node[]
): NodePath[];
/**
 * Parse a string as an expression and replace the current node with the result.
 *
 * NOTE: This is typically not a good idea to use. Building source strings when
 * transforming ASTs is an antipattern and SHOULD NOT be encouraged. Even if it's
 * easier to use, your transforms will be extremely brittle.
 */
declare function replaceWithSourceString(
  this: NodePath,
  replacement: string
): [
  NodePath<
    | t.ArrayExpression
    | t.ArrowFunctionExpression
    | t.AssignmentExpression
    | t.AwaitExpression
    | t.BigIntLiteral
    | t.BinaryExpression
    | t.BindExpression
    | t.BooleanLiteral
    | t.CallExpression
    | t.ClassExpression
    | t.ConditionalExpression
    | t.DecimalLiteral
    | t.DoExpression
    | t.FunctionExpression
    | t.Identifier
    | t.Import
    | t.JSXElement
    | t.JSXFragment
    | t.LogicalExpression
    | t.MemberExpression
    | t.MetaProperty
    | t.ModuleExpression
    | t.NewExpression
    | t.NullLiteral
    | t.NumericLiteral
    | t.ObjectExpression
    | t.OptionalCallExpression
    | t.OptionalMemberExpression
    | t.ParenthesizedExpression
    | t.PipelineBareFunction
    | t.PipelinePrimaryTopicReference
    | t.PipelineTopicExpression
    | t.RecordExpression
    | t.RegExpLiteral
    | t.SequenceExpression
    | t.StringLiteral
    | t.Super
    | t.TSAsExpression
    | t.TSInstantiationExpression
    | t.TSNonNullExpression
    | t.TSTypeAssertion
    | t.TaggedTemplateExpression
    | t.TemplateLiteral
    | t.ThisExpression
    | t.TopicReference
    | t.TupleExpression
    | t.TypeCastExpression
    | t.UnaryExpression
    | t.UpdateExpression
    | t.YieldExpression
  >
];
/**
 * Replace the current node with another.
 */
declare function replaceWith<R extends t.Node>(
  this: NodePath,
  replacementPath: R | NodePath<R>
): [NodePath<R>];
/**
 * Description
 */
declare function _replaceWith(this: NodePath, node: t.Node): void;
/**
 * This method takes an array of statements nodes and then explodes it
 * into expressions. This method retains completion records which is
 * extremely important to retain original semantics.
 */
declare function replaceExpressionWithStatements(
  this: NodePath,
  nodes: Array<t.Statement>
): NodePath<t.Expression>[] | NodePath<t.Statement>[];
declare function replaceInline(
  this: NodePath,
  nodes: t.Node | Array<t.Node>
): NodePath<t.Node>[];

declare const NodePath_replacement_replaceWithMultiple: typeof replaceWithMultiple;
declare const NodePath_replacement_replaceWithSourceString: typeof replaceWithSourceString;
declare const NodePath_replacement_replaceWith: typeof replaceWith;
declare const NodePath_replacement__replaceWith: typeof _replaceWith;
declare const NodePath_replacement_replaceExpressionWithStatements: typeof replaceExpressionWithStatements;
declare const NodePath_replacement_replaceInline: typeof replaceInline;
declare namespace NodePath_replacement {
  export {
    NodePath_replacement_replaceWithMultiple as replaceWithMultiple,
    NodePath_replacement_replaceWithSourceString as replaceWithSourceString,
    NodePath_replacement_replaceWith as replaceWith,
    NodePath_replacement__replaceWith as _replaceWith,
    NodePath_replacement_replaceExpressionWithStatements as replaceExpressionWithStatements,
    NodePath_replacement_replaceInline as replaceInline,
  };
}

/**
 * Walk the input `node` and statically evaluate if it's truthy.
 *
 * Returning `true` when we're sure that the expression will evaluate to a
 * truthy value, `false` if we're sure that it will evaluate to a falsy
 * value and `undefined` if we aren't sure. Because of this please do not
 * rely on coercion when using this method and check with === if it's false.
 *
 * For example do:
 *
 *   if (t.evaluateTruthy(node) === false) falsyLogic();
 *
 * **AND NOT**
 *
 *   if (!t.evaluateTruthy(node)) falsyLogic();
 *
 */
declare function evaluateTruthy(this: NodePath): boolean;
/**
 * Walk the input `node` and statically evaluate it.
 *
 * Returns an object in the form `{ confident, value, deopt }`. `confident`
 * indicates whether or not we had to drop out of evaluating the expression
 * because of hitting an unknown node that we couldn't confidently find the
 * value of, in which case `deopt` is the path of said node.
 *
 * Example:
 *
 *   t.evaluate(parse("5 + 5")) // { confident: true, value: 10 }
 *   t.evaluate(parse("!true")) // { confident: true, value: false }
 *   t.evaluate(parse("foo + foo")) // { confident: false, value: undefined, deopt: NodePath }
 *
 */
declare function evaluate(this: NodePath): {
  confident: boolean;
  value: any;
  deopt?: NodePath;
};

declare const NodePath_evaluation_evaluateTruthy: typeof evaluateTruthy;
declare const NodePath_evaluation_evaluate: typeof evaluate;
declare namespace NodePath_evaluation {
  export {
    NodePath_evaluation_evaluateTruthy as evaluateTruthy,
    NodePath_evaluation_evaluate as evaluate,
  };
}

declare function toComputedKey(this: NodePath): t.PrivateName | t.Expression;
declare function ensureBlock(
  this: NodePath<
    t.Loop | t.WithStatement | t.Function | t.LabeledStatement | t.CatchClause
  >
):
  | t.ArrayExpression
  | t.ArrowFunctionExpression
  | t.AssignmentExpression
  | t.AwaitExpression
  | t.BigIntLiteral
  | t.BinaryExpression
  | t.BindExpression
  | t.BlockStatement
  | t.BooleanLiteral
  | t.BreakStatement
  | t.CallExpression
  | t.CatchClause
  | t.ClassDeclaration
  | t.ClassExpression
  | t.ClassMethod
  | t.ClassPrivateMethod
  | t.ConditionalExpression
  | t.ContinueStatement
  | t.DebuggerStatement
  | t.DecimalLiteral
  | t.DeclareClass
  | t.DeclareExportAllDeclaration
  | t.DeclareExportDeclaration
  | t.DeclareFunction
  | t.DeclareInterface
  | t.DeclareModule
  | t.DeclareModuleExports
  | t.DeclareOpaqueType
  | t.DeclareTypeAlias
  | t.DeclareVariable
  | t.DoExpression
  | t.DoWhileStatement
  | t.EmptyStatement
  | t.EnumDeclaration
  | t.ExportAllDeclaration
  | t.ExportDefaultDeclaration
  | t.ExportNamedDeclaration
  | t.ExpressionStatement
  | t.ForInStatement
  | t.ForOfStatement
  | t.ForStatement
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.Identifier
  | t.IfStatement
  | t.Import
  | t.ImportDeclaration
  | t.InterfaceDeclaration
  | t.JSXElement
  | t.JSXFragment
  | t.LabeledStatement
  | t.LogicalExpression
  | t.MemberExpression
  | t.MetaProperty
  | t.ModuleExpression
  | t.NewExpression
  | t.NullLiteral
  | t.NumericLiteral
  | t.ObjectExpression
  | t.ObjectMethod
  | t.OpaqueType
  | t.OptionalCallExpression
  | t.OptionalMemberExpression
  | t.ParenthesizedExpression
  | t.PipelineBareFunction
  | t.PipelinePrimaryTopicReference
  | t.PipelineTopicExpression
  | t.RecordExpression
  | t.RegExpLiteral
  | t.ReturnStatement
  | t.SequenceExpression
  | t.StringLiteral
  | t.Super
  | t.SwitchStatement
  | t.TSAsExpression
  | t.TSDeclareFunction
  | t.TSEnumDeclaration
  | t.TSExportAssignment
  | t.TSImportEqualsDeclaration
  | t.TSInstantiationExpression
  | t.TSInterfaceDeclaration
  | t.TSModuleDeclaration
  | t.TSNamespaceExportDeclaration
  | t.TSNonNullExpression
  | t.TSTypeAliasDeclaration
  | t.TSTypeAssertion
  | t.TaggedTemplateExpression
  | t.TemplateLiteral
  | t.ThisExpression
  | t.ThrowStatement
  | t.TopicReference
  | t.TryStatement
  | t.TupleExpression
  | t.TypeAlias
  | t.TypeCastExpression
  | t.UnaryExpression
  | t.UpdateExpression
  | t.VariableDeclaration
  | t.WhileStatement
  | t.WithStatement
  | t.YieldExpression;
/**
 * Keeping this for backward-compatibility. You should use arrowFunctionToExpression() for >=7.x.
 */
declare function arrowFunctionToShadowed(this: NodePath): void;
/**
 * Given an arbitrary function, process its content as if it were an arrow function, moving references
 * to "this", "arguments", "super", and such into the function's parent scope. This method is useful if
 * you have wrapped some set of items in an IIFE or other function, but want "this", "arguments", and super"
 * to continue behaving as expected.
 */
declare function unwrapFunctionEnvironment(this: NodePath): void;
/**
 * Convert a given arrow function into a normal ES5 function expression.
 */
declare function arrowFunctionToExpression(
  this: NodePath<t.ArrowFunctionExpression>,
  {
    allowInsertArrow,
    /** @deprecated Use `noNewArrows` instead */
    specCompliant,
    noNewArrows,
  }?: {
    allowInsertArrow?: boolean | void;
    specCompliant?: boolean | void;
    noNewArrows?: boolean;
  }
): NodePath<Exclude<t.Function, t.Method | t.ArrowFunctionExpression>>;

declare const NodePath_conversion_toComputedKey: typeof toComputedKey;
declare const NodePath_conversion_ensureBlock: typeof ensureBlock;
declare const NodePath_conversion_arrowFunctionToShadowed: typeof arrowFunctionToShadowed;
declare const NodePath_conversion_unwrapFunctionEnvironment: typeof unwrapFunctionEnvironment;
declare const NodePath_conversion_arrowFunctionToExpression: typeof arrowFunctionToExpression;
declare namespace NodePath_conversion {
  export {
    NodePath_conversion_toComputedKey as toComputedKey,
    NodePath_conversion_ensureBlock as ensureBlock,
    NodePath_conversion_arrowFunctionToShadowed as arrowFunctionToShadowed,
    NodePath_conversion_unwrapFunctionEnvironment as unwrapFunctionEnvironment,
    NodePath_conversion_arrowFunctionToExpression as arrowFunctionToExpression,
  };
}

/**
 * Match the current node if it matches the provided `pattern`.
 *
 * For example, given the match `React.createClass` it would match the
 * parsed nodes of `React.createClass` and `React["createClass"]`.
 */
declare function matchesPattern(
  this: NodePath,
  pattern: string,
  allowPartial?: boolean
): boolean;
/**
 * Check whether we have the input `key`. If the `key` references an array then we check
 * if the array has any items, otherwise we just check if it's falsy.
 */
declare function has(this: NodePath, key: string): boolean;
/**
 * Description
 */
declare function isStatic(this: NodePath): boolean;
/**
 * Alias of `has`.
 */
declare const is: typeof has;
/**
 * Opposite of `has`.
 */
declare function isnt(this: NodePath, key: string): boolean;
/**
 * Check whether the path node `key` strict equals `value`.
 */
declare function equals(this: NodePath, key: string, value: any): boolean;
/**
 * Check the type against our stored internal type of the node. This is handy when a node has
 * been removed yet we still internally know the type and need it to calculate node replacement.
 */
declare function isNodeType(this: NodePath, type: string): boolean;
/**
 * This checks whether or not we're in one of the following positions:
 *
 *   for (KEY in right);
 *   for (KEY;;);
 *
 * This is because these spots allow VariableDeclarations AND normal expressions so we need
 * to tell the path replacement that it's ok to replace this with an expression.
 */
declare function canHaveVariableDeclarationOrExpression(
  this: NodePath
): boolean;
/**
 * This checks whether we are swapping an arrow function's body between an
 * expression and a block statement (or vice versa).
 *
 * This is because arrow functions may implicitly return an expression, which
 * is the same as containing a block statement.
 */
declare function canSwapBetweenExpressionAndStatement(
  this: NodePath,
  replacement: t.Node
): boolean;
/**
 * Check whether the current path references a completion record
 */
declare function isCompletionRecord(
  this: NodePath,
  allowInsideFunction?: boolean
): boolean;
/**
 * Check whether or not the current `key` allows either a single statement or block statement
 * so we can explode it if necessary.
 */
declare function isStatementOrBlock(this: NodePath): boolean;
/**
 * Check if the currently assigned path references the `importName` of `moduleSource`.
 */
declare function referencesImport(
  this: NodePath,
  moduleSource: string,
  importName: string
): boolean;
/**
 * Get the source code associated with this node.
 */
declare function getSource(this: NodePath): string;
declare function willIMaybeExecuteBefore(
  this: NodePath,
  target: NodePath
): boolean;
declare type RelativeExecutionStatus = "before" | "after" | "unknown";
/**
 * Given a `target` check the execution status of it relative to the current path.
 *
 * "Execution status" simply refers to where or not we **think** this will execute
 * before or after the input `target` element.
 */
declare function _guessExecutionStatusRelativeTo(
  this: NodePath,
  target: NodePath
): RelativeExecutionStatus;
/**
 * Resolve a "pointer" `NodePath` to it's absolute path.
 */
declare function resolve(
  this: NodePath,
  dangerous?: boolean,
  resolved?: NodePath[]
): NodePath<t.Node>;
declare function _resolve(
  this: NodePath,
  dangerous?: boolean,
  resolved?: NodePath[]
): NodePath | undefined | null;
declare function isConstantExpression(this: NodePath): boolean;
declare function isInStrictMode(this: NodePath): boolean;

declare const NodePath_introspection_matchesPattern: typeof matchesPattern;
declare const NodePath_introspection_has: typeof has;
declare const NodePath_introspection_isStatic: typeof isStatic;
declare const NodePath_introspection_is: typeof is;
declare const NodePath_introspection_isnt: typeof isnt;
declare const NodePath_introspection_equals: typeof equals;
declare const NodePath_introspection_isNodeType: typeof isNodeType;
declare const NodePath_introspection_canHaveVariableDeclarationOrExpression: typeof canHaveVariableDeclarationOrExpression;
declare const NodePath_introspection_canSwapBetweenExpressionAndStatement: typeof canSwapBetweenExpressionAndStatement;
declare const NodePath_introspection_isCompletionRecord: typeof isCompletionRecord;
declare const NodePath_introspection_isStatementOrBlock: typeof isStatementOrBlock;
declare const NodePath_introspection_referencesImport: typeof referencesImport;
declare const NodePath_introspection_getSource: typeof getSource;
declare const NodePath_introspection_willIMaybeExecuteBefore: typeof willIMaybeExecuteBefore;
declare const NodePath_introspection__guessExecutionStatusRelativeTo: typeof _guessExecutionStatusRelativeTo;
declare const NodePath_introspection_resolve: typeof resolve;
declare const NodePath_introspection__resolve: typeof _resolve;
declare const NodePath_introspection_isConstantExpression: typeof isConstantExpression;
declare const NodePath_introspection_isInStrictMode: typeof isInStrictMode;
declare namespace NodePath_introspection {
  export {
    NodePath_introspection_matchesPattern as matchesPattern,
    NodePath_introspection_has as has,
    NodePath_introspection_isStatic as isStatic,
    NodePath_introspection_is as is,
    NodePath_introspection_isnt as isnt,
    NodePath_introspection_equals as equals,
    NodePath_introspection_isNodeType as isNodeType,
    NodePath_introspection_canHaveVariableDeclarationOrExpression as canHaveVariableDeclarationOrExpression,
    NodePath_introspection_canSwapBetweenExpressionAndStatement as canSwapBetweenExpressionAndStatement,
    NodePath_introspection_isCompletionRecord as isCompletionRecord,
    NodePath_introspection_isStatementOrBlock as isStatementOrBlock,
    NodePath_introspection_referencesImport as referencesImport,
    NodePath_introspection_getSource as getSource,
    NodePath_introspection_willIMaybeExecuteBefore as willIMaybeExecuteBefore,
    NodePath_introspection__guessExecutionStatusRelativeTo as _guessExecutionStatusRelativeTo,
    NodePath_introspection_resolve as resolve,
    NodePath_introspection__resolve as _resolve,
    NodePath_introspection_isConstantExpression as isConstantExpression,
    NodePath_introspection_isInStrictMode as isInStrictMode,
  };
}

declare function call(this: NodePath, key: string): boolean;
declare function _call(this: NodePath, fns?: Array<Function>): boolean;
declare function isDenylisted(this: NodePath): boolean;

declare function visit(this: NodePath): boolean;
declare function skip(this: NodePath): void;
declare function skipKey(this: NodePath, key: string): void;
declare function stop(this: NodePath): void;
declare function setScope(this: NodePath): void;
declare function setContext<S = unknown>(
  this: NodePath,
  context?: TraversalContext<S>
): NodePath<t.Node>;
/**
 * Here we resync the node paths `key` and `container`. If they've changed according
 * to what we have stored internally then we attempt to resync by crawling and looking
 * for the new values.
 */
declare function resync(this: NodePath): void;
declare function _resyncParent(this: NodePath): void;
declare function _resyncKey(this: NodePath): void;
declare function _resyncList(this: NodePath): void;
declare function _resyncRemoved(this: NodePath): void;
declare function popContext(this: NodePath): void;
declare function pushContext(this: NodePath, context: TraversalContext): void;
declare function setup(
  this: NodePath,
  parentPath: NodePath | undefined,
  container: t.Node,
  listKey: string,
  key: string | number
): void;
declare function setKey(this: NodePath, key: string | number): void;
declare function requeue(this: NodePath, pathToQueue?: NodePath<t.Node>): void;
declare function _getQueueContexts(this: NodePath): TraversalContext<unknown>[];

declare const NodePath_context_call: typeof call;
declare const NodePath_context__call: typeof _call;
declare const NodePath_context_isDenylisted: typeof isDenylisted;
declare const NodePath_context_visit: typeof visit;
declare const NodePath_context_skip: typeof skip;
declare const NodePath_context_skipKey: typeof skipKey;
declare const NodePath_context_stop: typeof stop;
declare const NodePath_context_setScope: typeof setScope;
declare const NodePath_context_setContext: typeof setContext;
declare const NodePath_context_resync: typeof resync;
declare const NodePath_context__resyncParent: typeof _resyncParent;
declare const NodePath_context__resyncKey: typeof _resyncKey;
declare const NodePath_context__resyncList: typeof _resyncList;
declare const NodePath_context__resyncRemoved: typeof _resyncRemoved;
declare const NodePath_context_popContext: typeof popContext;
declare const NodePath_context_pushContext: typeof pushContext;
declare const NodePath_context_setup: typeof setup;
declare const NodePath_context_setKey: typeof setKey;
declare const NodePath_context_requeue: typeof requeue;
declare const NodePath_context__getQueueContexts: typeof _getQueueContexts;
declare namespace NodePath_context {
  export {
    isDenylisted as isBlacklisted,
    NodePath_context_call as call,
    NodePath_context__call as _call,
    NodePath_context_isDenylisted as isDenylisted,
    NodePath_context_visit as visit,
    NodePath_context_skip as skip,
    NodePath_context_skipKey as skipKey,
    NodePath_context_stop as stop,
    NodePath_context_setScope as setScope,
    NodePath_context_setContext as setContext,
    NodePath_context_resync as resync,
    NodePath_context__resyncParent as _resyncParent,
    NodePath_context__resyncKey as _resyncKey,
    NodePath_context__resyncList as _resyncList,
    NodePath_context__resyncRemoved as _resyncRemoved,
    NodePath_context_popContext as popContext,
    NodePath_context_pushContext as pushContext,
    NodePath_context_setup as setup,
    NodePath_context_setKey as setKey,
    NodePath_context_requeue as requeue,
    NodePath_context__getQueueContexts as _getQueueContexts,
  };
}

declare function remove(this: NodePath): void;
declare function _removeFromScope(this: NodePath): void;
declare function _callRemovalHooks(this: NodePath): boolean;
declare function _remove(this: NodePath): void;
declare function _markRemoved(this: NodePath): void;
declare function _assertUnremoved(this: NodePath): void;

declare const NodePath_removal_remove: typeof remove;
declare const NodePath_removal__removeFromScope: typeof _removeFromScope;
declare const NodePath_removal__callRemovalHooks: typeof _callRemovalHooks;
declare const NodePath_removal__remove: typeof _remove;
declare const NodePath_removal__markRemoved: typeof _markRemoved;
declare const NodePath_removal__assertUnremoved: typeof _assertUnremoved;
declare namespace NodePath_removal {
  export {
    NodePath_removal_remove as remove,
    NodePath_removal__removeFromScope as _removeFromScope,
    NodePath_removal__callRemovalHooks as _callRemovalHooks,
    NodePath_removal__remove as _remove,
    NodePath_removal__markRemoved as _markRemoved,
    NodePath_removal__assertUnremoved as _assertUnremoved,
  };
}

/**
 * Insert the provided nodes before the current one.
 */
declare function insertBefore(
  this: NodePath,
  nodes_: t.Node | t.Node[]
): NodePath[];
declare function _containerInsert<N extends t.Node>(
  this: NodePath,
  from: number,
  nodes: N[]
): NodePath<N>[];
declare function _containerInsertBefore<N extends t.Node>(
  this: NodePath,
  nodes: N[]
): NodePath<N>[];
declare function _containerInsertAfter<N extends t.Node>(
  this: NodePath,
  nodes: N[]
): NodePath<N>[];
/**
 * Insert the provided nodes after the current one. When inserting nodes after an
 * expression, ensure that the completion record is correct by pushing the current node.
 */
declare function insertAfter(
  this: NodePath,
  nodes_: t.Node | t.Node[]
): NodePath[];
/**
 * Update all sibling node paths after `fromIndex` by `incrementBy`.
 */
declare function updateSiblingKeys(
  this: NodePath,
  fromIndex: number,
  incrementBy: number
): void;
declare function _verifyNodeList<N extends t.Node>(
  this: NodePath,
  nodes: N | N[]
): N[];
declare function unshiftContainer<N extends t.Node, K extends keyof N & string>(
  this: NodePath<N>,
  listKey: K,
  nodes: N[K] extends (infer E)[] ? E | E[] : never
): NodePath<t.Node>[];
declare function pushContainer<N extends t.Node, K extends keyof N & string>(
  this: NodePath<N>,
  listKey: K,
  nodes: N[K] extends (infer E)[] ? E | E[] : never
): NodePath<t.Node>[];
/**
 * Hoist the current node to the highest scope possible and return a UID
 * referencing it.
 */
declare function hoist<T extends t.Node>(
  this: NodePath<T>,
  scope?: Scope
): never;

declare const NodePath_modification_insertBefore: typeof insertBefore;
declare const NodePath_modification__containerInsert: typeof _containerInsert;
declare const NodePath_modification__containerInsertBefore: typeof _containerInsertBefore;
declare const NodePath_modification__containerInsertAfter: typeof _containerInsertAfter;
declare const NodePath_modification_insertAfter: typeof insertAfter;
declare const NodePath_modification_updateSiblingKeys: typeof updateSiblingKeys;
declare const NodePath_modification__verifyNodeList: typeof _verifyNodeList;
declare const NodePath_modification_unshiftContainer: typeof unshiftContainer;
declare const NodePath_modification_pushContainer: typeof pushContainer;
declare const NodePath_modification_hoist: typeof hoist;
declare namespace NodePath_modification {
  export {
    NodePath_modification_insertBefore as insertBefore,
    NodePath_modification__containerInsert as _containerInsert,
    NodePath_modification__containerInsertBefore as _containerInsertBefore,
    NodePath_modification__containerInsertAfter as _containerInsertAfter,
    NodePath_modification_insertAfter as insertAfter,
    NodePath_modification_updateSiblingKeys as updateSiblingKeys,
    NodePath_modification__verifyNodeList as _verifyNodeList,
    NodePath_modification_unshiftContainer as unshiftContainer,
    NodePath_modification_pushContainer as pushContainer,
    NodePath_modification_hoist as hoist,
  };
}

declare function getOpposite(this: NodePath): NodePath | null;
/**
 * Retrieve the completion records of a given path.
 * Note: to ensure proper support on `break` statement, this method
 * will manipulate the AST around the break statement. Do not call the method
 * twice for the same path.
 *
 * @export
 * @param {NodePath} this
 * @returns {NodePath[]} Completion records
 */
declare function getCompletionRecords(this: NodePath): NodePath[];
declare function getSibling(this: NodePath, key: string | number): NodePath;
declare function getPrevSibling(this: NodePath): NodePath;
declare function getNextSibling(this: NodePath): NodePath;
declare function getAllNextSiblings(this: NodePath): NodePath[];
declare function getAllPrevSiblings(this: NodePath): NodePath[];
declare type MaybeToIndex<T extends string> = T extends `${bigint}`
  ? number
  : T;
declare type Pattern<
  Obj extends string,
  Prop extends string
> = `${Obj}.${Prop}`;
declare type Split<P extends string> = P extends Pattern<infer O, infer U>
  ? [MaybeToIndex<O>, ...Split<U>]
  : [MaybeToIndex<P>];
declare type NodeKeyOf<Node extends t.Node | t.Node[]> = keyof Pick<
  Node,
  {
    [Key in keyof Node]-?: Node[Key] extends t.Node | t.Node[] ? Key : never;
  }[keyof Node]
>;
declare type Trav<
  Node extends t.Node | t.Node[],
  Path extends unknown[]
> = Path extends [infer K, ...infer R]
  ? K extends NodeKeyOf<Node>
    ? R extends []
      ? Node[K]
      : Trav<Node[K], R>
    : never
  : never;
declare type ToNodePath<T> = T extends Array<t.Node | null | undefined>
  ? Array<NodePath<T[number]>>
  : T extends t.Node | null | undefined
  ? NodePath<T>
  : never;
declare function get<T extends t.Node, K extends keyof T>(
  this: NodePath<T>,
  key: K,
  context?: boolean | TraversalContext
): T[K] extends Array<t.Node | null | undefined>
  ? Array<NodePath<T[K][number]>>
  : T[K] extends t.Node | null | undefined
  ? NodePath<T[K]>
  : never;
declare function get<T extends t.Node, K extends string>(
  this: NodePath<T>,
  key: K,
  context?: boolean | TraversalContext
): ToNodePath<Trav<T, Split<K>>>;
declare function get<T extends t.Node>(
  this: NodePath<T>,
  key: string,
  context?: true | TraversalContext
): NodePath | NodePath[];

declare function _getKey<T extends t.Node>(
  this: NodePath<T>,
  key: string,
  context?: TraversalContext
): NodePath | NodePath[];
declare function _getPattern(
  this: NodePath,
  parts: string[],
  context?: TraversalContext
): NodePath | NodePath[];
declare function getBindingIdentifiers(
  duplicates: true
): Record<string, t.Identifier[]>;
declare function getBindingIdentifiers(
  duplicates?: false
): Record<string, t.Identifier>;
declare function getBindingIdentifiers(
  duplicates: boolean
): Record<string, t.Identifier[] | t.Identifier>;

declare function getOuterBindingIdentifiers(
  duplicates: true
): Record<string, t.Identifier[]>;
declare function getOuterBindingIdentifiers(
  duplicates?: false
): Record<string, t.Identifier>;
declare function getOuterBindingIdentifiers(
  duplicates: boolean
): Record<string, t.Identifier[] | t.Identifier>;

declare function getBindingIdentifierPaths(
  duplicates: true,
  outerOnly?: boolean
): Record<string, NodePath<t.Identifier>[]>;
declare function getBindingIdentifierPaths(
  duplicates: false,
  outerOnly?: boolean
): Record<string, NodePath<t.Identifier>>;
declare function getBindingIdentifierPaths(
  duplicates?: boolean,
  outerOnly?: boolean
): Record<string, NodePath<t.Identifier> | NodePath<t.Identifier>[]>;

declare function getOuterBindingIdentifierPaths(
  duplicates: true
): Record<string, NodePath<t.Identifier>[]>;
declare function getOuterBindingIdentifierPaths(
  duplicates?: false
): Record<string, NodePath<t.Identifier>>;
declare function getOuterBindingIdentifierPaths(
  duplicates?: boolean
): Record<string, NodePath<t.Identifier> | NodePath<t.Identifier>[]>;

declare const NodePath_family_get: typeof get;
declare const NodePath_family_getBindingIdentifiers: typeof getBindingIdentifiers;
declare const NodePath_family_getOuterBindingIdentifiers: typeof getOuterBindingIdentifiers;
declare const NodePath_family_getBindingIdentifierPaths: typeof getBindingIdentifierPaths;
declare const NodePath_family_getOuterBindingIdentifierPaths: typeof getOuterBindingIdentifierPaths;
declare const NodePath_family_getOpposite: typeof getOpposite;
declare const NodePath_family_getCompletionRecords: typeof getCompletionRecords;
declare const NodePath_family_getSibling: typeof getSibling;
declare const NodePath_family_getPrevSibling: typeof getPrevSibling;
declare const NodePath_family_getNextSibling: typeof getNextSibling;
declare const NodePath_family_getAllNextSiblings: typeof getAllNextSiblings;
declare const NodePath_family_getAllPrevSiblings: typeof getAllPrevSiblings;
declare const NodePath_family__getKey: typeof _getKey;
declare const NodePath_family__getPattern: typeof _getPattern;
declare namespace NodePath_family {
  export {
    NodePath_family_get as get,
    NodePath_family_getBindingIdentifiers as getBindingIdentifiers,
    NodePath_family_getOuterBindingIdentifiers as getOuterBindingIdentifiers,
    NodePath_family_getBindingIdentifierPaths as getBindingIdentifierPaths,
    NodePath_family_getOuterBindingIdentifierPaths as getOuterBindingIdentifierPaths,
    NodePath_family_getOpposite as getOpposite,
    NodePath_family_getCompletionRecords as getCompletionRecords,
    NodePath_family_getSibling as getSibling,
    NodePath_family_getPrevSibling as getPrevSibling,
    NodePath_family_getNextSibling as getNextSibling,
    NodePath_family_getAllNextSiblings as getAllNextSiblings,
    NodePath_family_getAllPrevSiblings as getAllPrevSiblings,
    NodePath_family__getKey as _getKey,
    NodePath_family__getPattern as _getPattern,
  };
}

/**
 * Share comments amongst siblings.
 */
declare function shareCommentsWithSiblings(this: NodePath): void;
declare function addComment(
  this: NodePath,
  type: t.CommentTypeShorthand,
  content: string,
  line?: boolean
): void;
/**
 * Give node `comments` of the specified `type`.
 */
declare function addComments(
  this: NodePath,
  type: t.CommentTypeShorthand,
  comments: t.Comment[]
): void;

declare const NodePath_comments_shareCommentsWithSiblings: typeof shareCommentsWithSiblings;
declare const NodePath_comments_addComment: typeof addComment;
declare const NodePath_comments_addComments: typeof addComments;
declare namespace NodePath_comments {
  export {
    NodePath_comments_shareCommentsWithSiblings as shareCommentsWithSiblings,
    NodePath_comments_addComment as addComment,
    NodePath_comments_addComments as addComments,
  };
}

interface NodePathAssetions {
  assertAccessor(opts?: object): asserts this is NodePath<t.Accessor>;
  assertAnyTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.AnyTypeAnnotation>;
  assertArgumentPlaceholder(
    opts?: object
  ): asserts this is NodePath<t.ArgumentPlaceholder>;
  assertArrayExpression(
    opts?: object
  ): asserts this is NodePath<t.ArrayExpression>;
  assertArrayPattern(opts?: object): asserts this is NodePath<t.ArrayPattern>;
  assertArrayTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.ArrayTypeAnnotation>;
  assertArrowFunctionExpression(
    opts?: object
  ): asserts this is NodePath<t.ArrowFunctionExpression>;
  assertAssignmentExpression(
    opts?: object
  ): asserts this is NodePath<t.AssignmentExpression>;
  assertAssignmentPattern(
    opts?: object
  ): asserts this is NodePath<t.AssignmentPattern>;
  assertAwaitExpression(
    opts?: object
  ): asserts this is NodePath<t.AwaitExpression>;
  assertBigIntLiteral(opts?: object): asserts this is NodePath<t.BigIntLiteral>;
  assertBinary(opts?: object): asserts this is NodePath<t.Binary>;
  assertBinaryExpression(
    opts?: object
  ): asserts this is NodePath<t.BinaryExpression>;
  assertBindExpression(
    opts?: object
  ): asserts this is NodePath<t.BindExpression>;
  assertBlock(opts?: object): asserts this is NodePath<t.Block>;
  assertBlockParent(opts?: object): asserts this is NodePath<t.BlockParent>;
  assertBlockStatement(
    opts?: object
  ): asserts this is NodePath<t.BlockStatement>;
  assertBooleanLiteral(
    opts?: object
  ): asserts this is NodePath<t.BooleanLiteral>;
  assertBooleanLiteralTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.BooleanLiteralTypeAnnotation>;
  assertBooleanTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.BooleanTypeAnnotation>;
  assertBreakStatement(
    opts?: object
  ): asserts this is NodePath<t.BreakStatement>;
  assertCallExpression(
    opts?: object
  ): asserts this is NodePath<t.CallExpression>;
  assertCatchClause(opts?: object): asserts this is NodePath<t.CatchClause>;
  assertClass(opts?: object): asserts this is NodePath<t.Class>;
  assertClassAccessorProperty(
    opts?: object
  ): asserts this is NodePath<t.ClassAccessorProperty>;
  assertClassBody(opts?: object): asserts this is NodePath<t.ClassBody>;
  assertClassDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ClassDeclaration>;
  assertClassExpression(
    opts?: object
  ): asserts this is NodePath<t.ClassExpression>;
  assertClassImplements(
    opts?: object
  ): asserts this is NodePath<t.ClassImplements>;
  assertClassMethod(opts?: object): asserts this is NodePath<t.ClassMethod>;
  assertClassPrivateMethod(
    opts?: object
  ): asserts this is NodePath<t.ClassPrivateMethod>;
  assertClassPrivateProperty(
    opts?: object
  ): asserts this is NodePath<t.ClassPrivateProperty>;
  assertClassProperty(opts?: object): asserts this is NodePath<t.ClassProperty>;
  assertCompletionStatement(
    opts?: object
  ): asserts this is NodePath<t.CompletionStatement>;
  assertConditional(opts?: object): asserts this is NodePath<t.Conditional>;
  assertConditionalExpression(
    opts?: object
  ): asserts this is NodePath<t.ConditionalExpression>;
  assertContinueStatement(
    opts?: object
  ): asserts this is NodePath<t.ContinueStatement>;
  assertDebuggerStatement(
    opts?: object
  ): asserts this is NodePath<t.DebuggerStatement>;
  assertDecimalLiteral(
    opts?: object
  ): asserts this is NodePath<t.DecimalLiteral>;
  assertDeclaration(opts?: object): asserts this is NodePath<t.Declaration>;
  assertDeclareClass(opts?: object): asserts this is NodePath<t.DeclareClass>;
  assertDeclareExportAllDeclaration(
    opts?: object
  ): asserts this is NodePath<t.DeclareExportAllDeclaration>;
  assertDeclareExportDeclaration(
    opts?: object
  ): asserts this is NodePath<t.DeclareExportDeclaration>;
  assertDeclareFunction(
    opts?: object
  ): asserts this is NodePath<t.DeclareFunction>;
  assertDeclareInterface(
    opts?: object
  ): asserts this is NodePath<t.DeclareInterface>;
  assertDeclareModule(opts?: object): asserts this is NodePath<t.DeclareModule>;
  assertDeclareModuleExports(
    opts?: object
  ): asserts this is NodePath<t.DeclareModuleExports>;
  assertDeclareOpaqueType(
    opts?: object
  ): asserts this is NodePath<t.DeclareOpaqueType>;
  assertDeclareTypeAlias(
    opts?: object
  ): asserts this is NodePath<t.DeclareTypeAlias>;
  assertDeclareVariable(
    opts?: object
  ): asserts this is NodePath<t.DeclareVariable>;
  assertDeclaredPredicate(
    opts?: object
  ): asserts this is NodePath<t.DeclaredPredicate>;
  assertDecorator(opts?: object): asserts this is NodePath<t.Decorator>;
  assertDirective(opts?: object): asserts this is NodePath<t.Directive>;
  assertDirectiveLiteral(
    opts?: object
  ): asserts this is NodePath<t.DirectiveLiteral>;
  assertDoExpression(opts?: object): asserts this is NodePath<t.DoExpression>;
  assertDoWhileStatement(
    opts?: object
  ): asserts this is NodePath<t.DoWhileStatement>;
  assertEmptyStatement(
    opts?: object
  ): asserts this is NodePath<t.EmptyStatement>;
  assertEmptyTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.EmptyTypeAnnotation>;
  assertEnumBody(opts?: object): asserts this is NodePath<t.EnumBody>;
  assertEnumBooleanBody(
    opts?: object
  ): asserts this is NodePath<t.EnumBooleanBody>;
  assertEnumBooleanMember(
    opts?: object
  ): asserts this is NodePath<t.EnumBooleanMember>;
  assertEnumDeclaration(
    opts?: object
  ): asserts this is NodePath<t.EnumDeclaration>;
  assertEnumDefaultedMember(
    opts?: object
  ): asserts this is NodePath<t.EnumDefaultedMember>;
  assertEnumMember(opts?: object): asserts this is NodePath<t.EnumMember>;
  assertEnumNumberBody(
    opts?: object
  ): asserts this is NodePath<t.EnumNumberBody>;
  assertEnumNumberMember(
    opts?: object
  ): asserts this is NodePath<t.EnumNumberMember>;
  assertEnumStringBody(
    opts?: object
  ): asserts this is NodePath<t.EnumStringBody>;
  assertEnumStringMember(
    opts?: object
  ): asserts this is NodePath<t.EnumStringMember>;
  assertEnumSymbolBody(
    opts?: object
  ): asserts this is NodePath<t.EnumSymbolBody>;
  assertExistsTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.ExistsTypeAnnotation>;
  assertExportAllDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ExportAllDeclaration>;
  assertExportDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ExportDeclaration>;
  assertExportDefaultDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ExportDefaultDeclaration>;
  assertExportDefaultSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ExportDefaultSpecifier>;
  assertExportNamedDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ExportNamedDeclaration>;
  assertExportNamespaceSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ExportNamespaceSpecifier>;
  assertExportSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ExportSpecifier>;
  assertExpression(opts?: object): asserts this is NodePath<t.Expression>;
  assertExpressionStatement(
    opts?: object
  ): asserts this is NodePath<t.ExpressionStatement>;
  assertExpressionWrapper(
    opts?: object
  ): asserts this is NodePath<t.ExpressionWrapper>;
  assertFile(opts?: object): asserts this is NodePath<t.File>;
  assertFlow(opts?: object): asserts this is NodePath<t.Flow>;
  assertFlowBaseAnnotation(
    opts?: object
  ): asserts this is NodePath<t.FlowBaseAnnotation>;
  assertFlowDeclaration(
    opts?: object
  ): asserts this is NodePath<t.FlowDeclaration>;
  assertFlowPredicate(opts?: object): asserts this is NodePath<t.FlowPredicate>;
  assertFlowType(opts?: object): asserts this is NodePath<t.FlowType>;
  assertFor(opts?: object): asserts this is NodePath<t.For>;
  assertForInStatement(
    opts?: object
  ): asserts this is NodePath<t.ForInStatement>;
  assertForOfStatement(
    opts?: object
  ): asserts this is NodePath<t.ForOfStatement>;
  assertForStatement(opts?: object): asserts this is NodePath<t.ForStatement>;
  assertForXStatement(opts?: object): asserts this is NodePath<t.ForXStatement>;
  assertFunction(opts?: object): asserts this is NodePath<t.Function>;
  assertFunctionDeclaration(
    opts?: object
  ): asserts this is NodePath<t.FunctionDeclaration>;
  assertFunctionExpression(
    opts?: object
  ): asserts this is NodePath<t.FunctionExpression>;
  assertFunctionParent(
    opts?: object
  ): asserts this is NodePath<t.FunctionParent>;
  assertFunctionTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.FunctionTypeAnnotation>;
  assertFunctionTypeParam(
    opts?: object
  ): asserts this is NodePath<t.FunctionTypeParam>;
  assertGenericTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.GenericTypeAnnotation>;
  assertIdentifier(opts?: object): asserts this is NodePath<t.Identifier>;
  assertIfStatement(opts?: object): asserts this is NodePath<t.IfStatement>;
  assertImmutable(opts?: object): asserts this is NodePath<t.Immutable>;
  assertImport(opts?: object): asserts this is NodePath<t.Import>;
  assertImportAttribute(
    opts?: object
  ): asserts this is NodePath<t.ImportAttribute>;
  assertImportDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ImportDeclaration>;
  assertImportDefaultSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ImportDefaultSpecifier>;
  assertImportNamespaceSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ImportNamespaceSpecifier>;
  assertImportSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ImportSpecifier>;
  assertIndexedAccessType(
    opts?: object
  ): asserts this is NodePath<t.IndexedAccessType>;
  assertInferredPredicate(
    opts?: object
  ): asserts this is NodePath<t.InferredPredicate>;
  assertInterfaceDeclaration(
    opts?: object
  ): asserts this is NodePath<t.InterfaceDeclaration>;
  assertInterfaceExtends(
    opts?: object
  ): asserts this is NodePath<t.InterfaceExtends>;
  assertInterfaceTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.InterfaceTypeAnnotation>;
  assertInterpreterDirective(
    opts?: object
  ): asserts this is NodePath<t.InterpreterDirective>;
  assertIntersectionTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.IntersectionTypeAnnotation>;
  assertJSX(opts?: object): asserts this is NodePath<t.JSX>;
  assertJSXAttribute(opts?: object): asserts this is NodePath<t.JSXAttribute>;
  assertJSXClosingElement(
    opts?: object
  ): asserts this is NodePath<t.JSXClosingElement>;
  assertJSXClosingFragment(
    opts?: object
  ): asserts this is NodePath<t.JSXClosingFragment>;
  assertJSXElement(opts?: object): asserts this is NodePath<t.JSXElement>;
  assertJSXEmptyExpression(
    opts?: object
  ): asserts this is NodePath<t.JSXEmptyExpression>;
  assertJSXExpressionContainer(
    opts?: object
  ): asserts this is NodePath<t.JSXExpressionContainer>;
  assertJSXFragment(opts?: object): asserts this is NodePath<t.JSXFragment>;
  assertJSXIdentifier(opts?: object): asserts this is NodePath<t.JSXIdentifier>;
  assertJSXMemberExpression(
    opts?: object
  ): asserts this is NodePath<t.JSXMemberExpression>;
  assertJSXNamespacedName(
    opts?: object
  ): asserts this is NodePath<t.JSXNamespacedName>;
  assertJSXOpeningElement(
    opts?: object
  ): asserts this is NodePath<t.JSXOpeningElement>;
  assertJSXOpeningFragment(
    opts?: object
  ): asserts this is NodePath<t.JSXOpeningFragment>;
  assertJSXSpreadAttribute(
    opts?: object
  ): asserts this is NodePath<t.JSXSpreadAttribute>;
  assertJSXSpreadChild(
    opts?: object
  ): asserts this is NodePath<t.JSXSpreadChild>;
  assertJSXText(opts?: object): asserts this is NodePath<t.JSXText>;
  assertLVal(opts?: object): asserts this is NodePath<t.LVal>;
  assertLabeledStatement(
    opts?: object
  ): asserts this is NodePath<t.LabeledStatement>;
  assertLiteral(opts?: object): asserts this is NodePath<t.Literal>;
  assertLogicalExpression(
    opts?: object
  ): asserts this is NodePath<t.LogicalExpression>;
  assertLoop(opts?: object): asserts this is NodePath<t.Loop>;
  assertMemberExpression(
    opts?: object
  ): asserts this is NodePath<t.MemberExpression>;
  assertMetaProperty(opts?: object): asserts this is NodePath<t.MetaProperty>;
  assertMethod(opts?: object): asserts this is NodePath<t.Method>;
  assertMiscellaneous(opts?: object): asserts this is NodePath<t.Miscellaneous>;
  assertMixedTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.MixedTypeAnnotation>;
  assertModuleDeclaration(
    opts?: object
  ): asserts this is NodePath<t.ModuleDeclaration>;
  assertModuleExpression(
    opts?: object
  ): asserts this is NodePath<t.ModuleExpression>;
  assertModuleSpecifier(
    opts?: object
  ): asserts this is NodePath<t.ModuleSpecifier>;
  assertNewExpression(opts?: object): asserts this is NodePath<t.NewExpression>;
  assertNoop(opts?: object): asserts this is NodePath<t.Noop>;
  assertNullLiteral(opts?: object): asserts this is NodePath<t.NullLiteral>;
  assertNullLiteralTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.NullLiteralTypeAnnotation>;
  assertNullableTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.NullableTypeAnnotation>;
  assertNumberLiteral(opts?: object): asserts this is NodePath<t.NumberLiteral>;
  assertNumberLiteralTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.NumberLiteralTypeAnnotation>;
  assertNumberTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.NumberTypeAnnotation>;
  assertNumericLiteral(
    opts?: object
  ): asserts this is NodePath<t.NumericLiteral>;
  assertObjectExpression(
    opts?: object
  ): asserts this is NodePath<t.ObjectExpression>;
  assertObjectMember(opts?: object): asserts this is NodePath<t.ObjectMember>;
  assertObjectMethod(opts?: object): asserts this is NodePath<t.ObjectMethod>;
  assertObjectPattern(opts?: object): asserts this is NodePath<t.ObjectPattern>;
  assertObjectProperty(
    opts?: object
  ): asserts this is NodePath<t.ObjectProperty>;
  assertObjectTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeAnnotation>;
  assertObjectTypeCallProperty(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeCallProperty>;
  assertObjectTypeIndexer(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeIndexer>;
  assertObjectTypeInternalSlot(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeInternalSlot>;
  assertObjectTypeProperty(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeProperty>;
  assertObjectTypeSpreadProperty(
    opts?: object
  ): asserts this is NodePath<t.ObjectTypeSpreadProperty>;
  assertOpaqueType(opts?: object): asserts this is NodePath<t.OpaqueType>;
  assertOptionalCallExpression(
    opts?: object
  ): asserts this is NodePath<t.OptionalCallExpression>;
  assertOptionalIndexedAccessType(
    opts?: object
  ): asserts this is NodePath<t.OptionalIndexedAccessType>;
  assertOptionalMemberExpression(
    opts?: object
  ): asserts this is NodePath<t.OptionalMemberExpression>;
  assertParenthesizedExpression(
    opts?: object
  ): asserts this is NodePath<t.ParenthesizedExpression>;
  assertPattern(opts?: object): asserts this is NodePath<t.Pattern>;
  assertPatternLike(opts?: object): asserts this is NodePath<t.PatternLike>;
  assertPipelineBareFunction(
    opts?: object
  ): asserts this is NodePath<t.PipelineBareFunction>;
  assertPipelinePrimaryTopicReference(
    opts?: object
  ): asserts this is NodePath<t.PipelinePrimaryTopicReference>;
  assertPipelineTopicExpression(
    opts?: object
  ): asserts this is NodePath<t.PipelineTopicExpression>;
  assertPlaceholder(opts?: object): asserts this is NodePath<t.Placeholder>;
  assertPrivate(opts?: object): asserts this is NodePath<t.Private>;
  assertPrivateName(opts?: object): asserts this is NodePath<t.PrivateName>;
  assertProgram(opts?: object): asserts this is NodePath<t.Program>;
  assertProperty(opts?: object): asserts this is NodePath<t.Property>;
  assertPureish(opts?: object): asserts this is NodePath<t.Pureish>;
  assertQualifiedTypeIdentifier(
    opts?: object
  ): asserts this is NodePath<t.QualifiedTypeIdentifier>;
  assertRecordExpression(
    opts?: object
  ): asserts this is NodePath<t.RecordExpression>;
  assertRegExpLiteral(opts?: object): asserts this is NodePath<t.RegExpLiteral>;
  assertRegexLiteral(opts?: object): asserts this is NodePath<t.RegexLiteral>;
  assertRestElement(opts?: object): asserts this is NodePath<t.RestElement>;
  assertRestProperty(opts?: object): asserts this is NodePath<t.RestProperty>;
  assertReturnStatement(
    opts?: object
  ): asserts this is NodePath<t.ReturnStatement>;
  assertScopable(opts?: object): asserts this is NodePath<t.Scopable>;
  assertSequenceExpression(
    opts?: object
  ): asserts this is NodePath<t.SequenceExpression>;
  assertSpreadElement(opts?: object): asserts this is NodePath<t.SpreadElement>;
  assertSpreadProperty(
    opts?: object
  ): asserts this is NodePath<t.SpreadProperty>;
  assertStandardized(opts?: object): asserts this is NodePath<t.Standardized>;
  assertStatement(opts?: object): asserts this is NodePath<t.Statement>;
  assertStaticBlock(opts?: object): asserts this is NodePath<t.StaticBlock>;
  assertStringLiteral(opts?: object): asserts this is NodePath<t.StringLiteral>;
  assertStringLiteralTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.StringLiteralTypeAnnotation>;
  assertStringTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.StringTypeAnnotation>;
  assertSuper(opts?: object): asserts this is NodePath<t.Super>;
  assertSwitchCase(opts?: object): asserts this is NodePath<t.SwitchCase>;
  assertSwitchStatement(
    opts?: object
  ): asserts this is NodePath<t.SwitchStatement>;
  assertSymbolTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.SymbolTypeAnnotation>;
  assertTSAnyKeyword(opts?: object): asserts this is NodePath<t.TSAnyKeyword>;
  assertTSArrayType(opts?: object): asserts this is NodePath<t.TSArrayType>;
  assertTSAsExpression(
    opts?: object
  ): asserts this is NodePath<t.TSAsExpression>;
  assertTSBaseType(opts?: object): asserts this is NodePath<t.TSBaseType>;
  assertTSBigIntKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSBigIntKeyword>;
  assertTSBooleanKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSBooleanKeyword>;
  assertTSCallSignatureDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSCallSignatureDeclaration>;
  assertTSConditionalType(
    opts?: object
  ): asserts this is NodePath<t.TSConditionalType>;
  assertTSConstructSignatureDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSConstructSignatureDeclaration>;
  assertTSConstructorType(
    opts?: object
  ): asserts this is NodePath<t.TSConstructorType>;
  assertTSDeclareFunction(
    opts?: object
  ): asserts this is NodePath<t.TSDeclareFunction>;
  assertTSDeclareMethod(
    opts?: object
  ): asserts this is NodePath<t.TSDeclareMethod>;
  assertTSEntityName(opts?: object): asserts this is NodePath<t.TSEntityName>;
  assertTSEnumDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSEnumDeclaration>;
  assertTSEnumMember(opts?: object): asserts this is NodePath<t.TSEnumMember>;
  assertTSExportAssignment(
    opts?: object
  ): asserts this is NodePath<t.TSExportAssignment>;
  assertTSExpressionWithTypeArguments(
    opts?: object
  ): asserts this is NodePath<t.TSExpressionWithTypeArguments>;
  assertTSExternalModuleReference(
    opts?: object
  ): asserts this is NodePath<t.TSExternalModuleReference>;
  assertTSFunctionType(
    opts?: object
  ): asserts this is NodePath<t.TSFunctionType>;
  assertTSImportEqualsDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSImportEqualsDeclaration>;
  assertTSImportType(opts?: object): asserts this is NodePath<t.TSImportType>;
  assertTSIndexSignature(
    opts?: object
  ): asserts this is NodePath<t.TSIndexSignature>;
  assertTSIndexedAccessType(
    opts?: object
  ): asserts this is NodePath<t.TSIndexedAccessType>;
  assertTSInferType(opts?: object): asserts this is NodePath<t.TSInferType>;
  assertTSInstantiationExpression(
    opts?: object
  ): asserts this is NodePath<t.TSInstantiationExpression>;
  assertTSInterfaceBody(
    opts?: object
  ): asserts this is NodePath<t.TSInterfaceBody>;
  assertTSInterfaceDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSInterfaceDeclaration>;
  assertTSIntersectionType(
    opts?: object
  ): asserts this is NodePath<t.TSIntersectionType>;
  assertTSIntrinsicKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSIntrinsicKeyword>;
  assertTSLiteralType(opts?: object): asserts this is NodePath<t.TSLiteralType>;
  assertTSMappedType(opts?: object): asserts this is NodePath<t.TSMappedType>;
  assertTSMethodSignature(
    opts?: object
  ): asserts this is NodePath<t.TSMethodSignature>;
  assertTSModuleBlock(opts?: object): asserts this is NodePath<t.TSModuleBlock>;
  assertTSModuleDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSModuleDeclaration>;
  assertTSNamedTupleMember(
    opts?: object
  ): asserts this is NodePath<t.TSNamedTupleMember>;
  assertTSNamespaceExportDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSNamespaceExportDeclaration>;
  assertTSNeverKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSNeverKeyword>;
  assertTSNonNullExpression(
    opts?: object
  ): asserts this is NodePath<t.TSNonNullExpression>;
  assertTSNullKeyword(opts?: object): asserts this is NodePath<t.TSNullKeyword>;
  assertTSNumberKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSNumberKeyword>;
  assertTSObjectKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSObjectKeyword>;
  assertTSOptionalType(
    opts?: object
  ): asserts this is NodePath<t.TSOptionalType>;
  assertTSParameterProperty(
    opts?: object
  ): asserts this is NodePath<t.TSParameterProperty>;
  assertTSParenthesizedType(
    opts?: object
  ): asserts this is NodePath<t.TSParenthesizedType>;
  assertTSPropertySignature(
    opts?: object
  ): asserts this is NodePath<t.TSPropertySignature>;
  assertTSQualifiedName(
    opts?: object
  ): asserts this is NodePath<t.TSQualifiedName>;
  assertTSRestType(opts?: object): asserts this is NodePath<t.TSRestType>;
  assertTSStringKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSStringKeyword>;
  assertTSSymbolKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSSymbolKeyword>;
  assertTSThisType(opts?: object): asserts this is NodePath<t.TSThisType>;
  assertTSTupleType(opts?: object): asserts this is NodePath<t.TSTupleType>;
  assertTSType(opts?: object): asserts this is NodePath<t.TSType>;
  assertTSTypeAliasDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSTypeAliasDeclaration>;
  assertTSTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.TSTypeAnnotation>;
  assertTSTypeAssertion(
    opts?: object
  ): asserts this is NodePath<t.TSTypeAssertion>;
  assertTSTypeElement(opts?: object): asserts this is NodePath<t.TSTypeElement>;
  assertTSTypeLiteral(opts?: object): asserts this is NodePath<t.TSTypeLiteral>;
  assertTSTypeOperator(
    opts?: object
  ): asserts this is NodePath<t.TSTypeOperator>;
  assertTSTypeParameter(
    opts?: object
  ): asserts this is NodePath<t.TSTypeParameter>;
  assertTSTypeParameterDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TSTypeParameterDeclaration>;
  assertTSTypeParameterInstantiation(
    opts?: object
  ): asserts this is NodePath<t.TSTypeParameterInstantiation>;
  assertTSTypePredicate(
    opts?: object
  ): asserts this is NodePath<t.TSTypePredicate>;
  assertTSTypeQuery(opts?: object): asserts this is NodePath<t.TSTypeQuery>;
  assertTSTypeReference(
    opts?: object
  ): asserts this is NodePath<t.TSTypeReference>;
  assertTSUndefinedKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSUndefinedKeyword>;
  assertTSUnionType(opts?: object): asserts this is NodePath<t.TSUnionType>;
  assertTSUnknownKeyword(
    opts?: object
  ): asserts this is NodePath<t.TSUnknownKeyword>;
  assertTSVoidKeyword(opts?: object): asserts this is NodePath<t.TSVoidKeyword>;
  assertTaggedTemplateExpression(
    opts?: object
  ): asserts this is NodePath<t.TaggedTemplateExpression>;
  assertTemplateElement(
    opts?: object
  ): asserts this is NodePath<t.TemplateElement>;
  assertTemplateLiteral(
    opts?: object
  ): asserts this is NodePath<t.TemplateLiteral>;
  assertTerminatorless(
    opts?: object
  ): asserts this is NodePath<t.Terminatorless>;
  assertThisExpression(
    opts?: object
  ): asserts this is NodePath<t.ThisExpression>;
  assertThisTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.ThisTypeAnnotation>;
  assertThrowStatement(
    opts?: object
  ): asserts this is NodePath<t.ThrowStatement>;
  assertTopicReference(
    opts?: object
  ): asserts this is NodePath<t.TopicReference>;
  assertTryStatement(opts?: object): asserts this is NodePath<t.TryStatement>;
  assertTupleExpression(
    opts?: object
  ): asserts this is NodePath<t.TupleExpression>;
  assertTupleTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.TupleTypeAnnotation>;
  assertTypeAlias(opts?: object): asserts this is NodePath<t.TypeAlias>;
  assertTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.TypeAnnotation>;
  assertTypeCastExpression(
    opts?: object
  ): asserts this is NodePath<t.TypeCastExpression>;
  assertTypeParameter(opts?: object): asserts this is NodePath<t.TypeParameter>;
  assertTypeParameterDeclaration(
    opts?: object
  ): asserts this is NodePath<t.TypeParameterDeclaration>;
  assertTypeParameterInstantiation(
    opts?: object
  ): asserts this is NodePath<t.TypeParameterInstantiation>;
  assertTypeScript(opts?: object): asserts this is NodePath<t.TypeScript>;
  assertTypeofTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.TypeofTypeAnnotation>;
  assertUnaryExpression(
    opts?: object
  ): asserts this is NodePath<t.UnaryExpression>;
  assertUnaryLike(opts?: object): asserts this is NodePath<t.UnaryLike>;
  assertUnionTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.UnionTypeAnnotation>;
  assertUpdateExpression(
    opts?: object
  ): asserts this is NodePath<t.UpdateExpression>;
  assertUserWhitespacable(
    opts?: object
  ): asserts this is NodePath<t.UserWhitespacable>;
  assertV8IntrinsicIdentifier(
    opts?: object
  ): asserts this is NodePath<t.V8IntrinsicIdentifier>;
  assertVariableDeclaration(
    opts?: object
  ): asserts this is NodePath<t.VariableDeclaration>;
  assertVariableDeclarator(
    opts?: object
  ): asserts this is NodePath<t.VariableDeclarator>;
  assertVariance(opts?: object): asserts this is NodePath<t.Variance>;
  assertVoidTypeAnnotation(
    opts?: object
  ): asserts this is NodePath<t.VoidTypeAnnotation>;
  assertWhile(opts?: object): asserts this is NodePath<t.While>;
  assertWhileStatement(
    opts?: object
  ): asserts this is NodePath<t.WhileStatement>;
  assertWithStatement(opts?: object): asserts this is NodePath<t.WithStatement>;
  assertYieldExpression(
    opts?: object
  ): asserts this is NodePath<t.YieldExpression>;
}

interface VirtualTypeNodePathValidators {
  isBindingIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["BindingIdentifier"]>;
  isBlockScoped(opts?: object): boolean;
  /**
   * @deprecated
   */
  isExistentialTypeParam<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["ExistentialTypeParam"]>;
  isExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Expression>;
  isFlow<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Flow>;
  isForAwaitStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["ForAwaitStatement"]>;
  isGenerated(opts?: object): boolean;
  /**
   * @deprecated
   */
  isNumericLiteralTypeAnnotation(opts?: object): void;
  isPure(opts?: object): boolean;
  isReferenced(opts?: object): boolean;
  isReferencedIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["ReferencedIdentifier"]>;
  isReferencedMemberExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["ReferencedMemberExpression"]>;
  isRestProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RestProperty>;
  isScope<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["Scope"]>;
  isSpreadProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SpreadProperty>;
  isStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Statement>;
  isUser(opts?: object): boolean;
  isVar<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & VirtualTypeAliases["Var"]>;
}

interface BaseNodePathValidators {
  isAccessor<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Accessor>;
  isAnyTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.AnyTypeAnnotation>;
  isArgumentPlaceholder<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ArgumentPlaceholder>;
  isArrayExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ArrayExpression>;
  isArrayPattern<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ArrayPattern>;
  isArrayTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ArrayTypeAnnotation>;
  isArrowFunctionExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ArrowFunctionExpression>;
  isAssignmentExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.AssignmentExpression>;
  isAssignmentPattern<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.AssignmentPattern>;
  isAwaitExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.AwaitExpression>;
  isBigIntLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BigIntLiteral>;
  isBinary<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Binary>;
  isBinaryExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BinaryExpression>;
  isBindExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BindExpression>;
  isBlock<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Block>;
  isBlockParent<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BlockParent>;
  isBlockStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BlockStatement>;
  isBooleanLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BooleanLiteral>;
  isBooleanLiteralTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BooleanLiteralTypeAnnotation>;
  isBooleanTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BooleanTypeAnnotation>;
  isBreakStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.BreakStatement>;
  isCallExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.CallExpression>;
  isCatchClause<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.CatchClause>;
  isClass<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Class>;
  isClassAccessorProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassAccessorProperty>;
  isClassBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassBody>;
  isClassDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassDeclaration>;
  isClassExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassExpression>;
  isClassImplements<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassImplements>;
  isClassMethod<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassMethod>;
  isClassPrivateMethod<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassPrivateMethod>;
  isClassPrivateProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassPrivateProperty>;
  isClassProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ClassProperty>;
  isCompletionStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.CompletionStatement>;
  isConditional<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Conditional>;
  isConditionalExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ConditionalExpression>;
  isContinueStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ContinueStatement>;
  isDebuggerStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DebuggerStatement>;
  isDecimalLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DecimalLiteral>;
  isDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Declaration>;
  isDeclareClass<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareClass>;
  isDeclareExportAllDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareExportAllDeclaration>;
  isDeclareExportDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareExportDeclaration>;
  isDeclareFunction<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareFunction>;
  isDeclareInterface<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareInterface>;
  isDeclareModule<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareModule>;
  isDeclareModuleExports<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareModuleExports>;
  isDeclareOpaqueType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareOpaqueType>;
  isDeclareTypeAlias<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareTypeAlias>;
  isDeclareVariable<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclareVariable>;
  isDeclaredPredicate<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DeclaredPredicate>;
  isDecorator<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Decorator>;
  isDirective<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Directive>;
  isDirectiveLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DirectiveLiteral>;
  isDoExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DoExpression>;
  isDoWhileStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.DoWhileStatement>;
  isEmptyStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EmptyStatement>;
  isEmptyTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EmptyTypeAnnotation>;
  isEnumBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumBody>;
  isEnumBooleanBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumBooleanBody>;
  isEnumBooleanMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumBooleanMember>;
  isEnumDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumDeclaration>;
  isEnumDefaultedMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumDefaultedMember>;
  isEnumMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumMember>;
  isEnumNumberBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumNumberBody>;
  isEnumNumberMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumNumberMember>;
  isEnumStringBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumStringBody>;
  isEnumStringMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumStringMember>;
  isEnumSymbolBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.EnumSymbolBody>;
  isExistsTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExistsTypeAnnotation>;
  isExportAllDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportAllDeclaration>;
  isExportDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportDeclaration>;
  isExportDefaultDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportDefaultDeclaration>;
  isExportDefaultSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportDefaultSpecifier>;
  isExportNamedDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportNamedDeclaration>;
  isExportNamespaceSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportNamespaceSpecifier>;
  isExportSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExportSpecifier>;
  isExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Expression>;
  isExpressionStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExpressionStatement>;
  isExpressionWrapper<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ExpressionWrapper>;
  isFile<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.File>;
  isFlow<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Flow>;
  isFlowBaseAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FlowBaseAnnotation>;
  isFlowDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FlowDeclaration>;
  isFlowPredicate<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FlowPredicate>;
  isFlowType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FlowType>;
  isFor<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.For>;
  isForInStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ForInStatement>;
  isForOfStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ForOfStatement>;
  isForStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ForStatement>;
  isForXStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ForXStatement>;
  isFunction<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Function>;
  isFunctionDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FunctionDeclaration>;
  isFunctionExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FunctionExpression>;
  isFunctionParent<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FunctionParent>;
  isFunctionTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FunctionTypeAnnotation>;
  isFunctionTypeParam<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.FunctionTypeParam>;
  isGenericTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.GenericTypeAnnotation>;
  isIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Identifier>;
  isIfStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.IfStatement>;
  isImmutable<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Immutable>;
  isImport<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Import>;
  isImportAttribute<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ImportAttribute>;
  isImportDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ImportDeclaration>;
  isImportDefaultSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ImportDefaultSpecifier>;
  isImportNamespaceSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ImportNamespaceSpecifier>;
  isImportSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ImportSpecifier>;
  isIndexedAccessType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.IndexedAccessType>;
  isInferredPredicate<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.InferredPredicate>;
  isInterfaceDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.InterfaceDeclaration>;
  isInterfaceExtends<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.InterfaceExtends>;
  isInterfaceTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.InterfaceTypeAnnotation>;
  isInterpreterDirective<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.InterpreterDirective>;
  isIntersectionTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.IntersectionTypeAnnotation>;
  isJSX<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSX>;
  isJSXAttribute<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXAttribute>;
  isJSXClosingElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXClosingElement>;
  isJSXClosingFragment<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXClosingFragment>;
  isJSXElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXElement>;
  isJSXEmptyExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXEmptyExpression>;
  isJSXExpressionContainer<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXExpressionContainer>;
  isJSXFragment<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXFragment>;
  isJSXIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXIdentifier>;
  isJSXMemberExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXMemberExpression>;
  isJSXNamespacedName<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXNamespacedName>;
  isJSXOpeningElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXOpeningElement>;
  isJSXOpeningFragment<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXOpeningFragment>;
  isJSXSpreadAttribute<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXSpreadAttribute>;
  isJSXSpreadChild<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXSpreadChild>;
  isJSXText<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.JSXText>;
  isLVal<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.LVal>;
  isLabeledStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.LabeledStatement>;
  isLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Literal>;
  isLogicalExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.LogicalExpression>;
  isLoop<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Loop>;
  isMemberExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.MemberExpression>;
  isMetaProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.MetaProperty>;
  isMethod<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Method>;
  isMiscellaneous<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Miscellaneous>;
  isMixedTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.MixedTypeAnnotation>;
  isModuleDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ModuleDeclaration>;
  isModuleExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ModuleExpression>;
  isModuleSpecifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ModuleSpecifier>;
  isNewExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NewExpression>;
  isNoop<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Noop>;
  isNullLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NullLiteral>;
  isNullLiteralTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NullLiteralTypeAnnotation>;
  isNullableTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NullableTypeAnnotation>;
  isNumberLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NumberLiteral>;
  isNumberLiteralTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NumberLiteralTypeAnnotation>;
  isNumberTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NumberTypeAnnotation>;
  isNumericLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.NumericLiteral>;
  isObjectExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectExpression>;
  isObjectMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectMember>;
  isObjectMethod<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectMethod>;
  isObjectPattern<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectPattern>;
  isObjectProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectProperty>;
  isObjectTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeAnnotation>;
  isObjectTypeCallProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeCallProperty>;
  isObjectTypeIndexer<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeIndexer>;
  isObjectTypeInternalSlot<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeInternalSlot>;
  isObjectTypeProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeProperty>;
  isObjectTypeSpreadProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ObjectTypeSpreadProperty>;
  isOpaqueType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.OpaqueType>;
  isOptionalCallExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.OptionalCallExpression>;
  isOptionalIndexedAccessType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.OptionalIndexedAccessType>;
  isOptionalMemberExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.OptionalMemberExpression>;
  isParenthesizedExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ParenthesizedExpression>;
  isPattern<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Pattern>;
  isPatternLike<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.PatternLike>;
  isPipelineBareFunction<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.PipelineBareFunction>;
  isPipelinePrimaryTopicReference<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.PipelinePrimaryTopicReference>;
  isPipelineTopicExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.PipelineTopicExpression>;
  isPlaceholder<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Placeholder>;
  isPrivate<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Private>;
  isPrivateName<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.PrivateName>;
  isProgram<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Program>;
  isProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Property>;
  isPureish<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Pureish>;
  isQualifiedTypeIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.QualifiedTypeIdentifier>;
  isRecordExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RecordExpression>;
  isRegExpLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RegExpLiteral>;
  isRegexLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RegexLiteral>;
  isRestElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RestElement>;
  isRestProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.RestProperty>;
  isReturnStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ReturnStatement>;
  isScopable<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Scopable>;
  isSequenceExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SequenceExpression>;
  isSpreadElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SpreadElement>;
  isSpreadProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SpreadProperty>;
  isStandardized<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Standardized>;
  isStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Statement>;
  isStaticBlock<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.StaticBlock>;
  isStringLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.StringLiteral>;
  isStringLiteralTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.StringLiteralTypeAnnotation>;
  isStringTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.StringTypeAnnotation>;
  isSuper<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Super>;
  isSwitchCase<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SwitchCase>;
  isSwitchStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SwitchStatement>;
  isSymbolTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.SymbolTypeAnnotation>;
  isTSAnyKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSAnyKeyword>;
  isTSArrayType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSArrayType>;
  isTSAsExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSAsExpression>;
  isTSBaseType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSBaseType>;
  isTSBigIntKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSBigIntKeyword>;
  isTSBooleanKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSBooleanKeyword>;
  isTSCallSignatureDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSCallSignatureDeclaration>;
  isTSConditionalType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSConditionalType>;
  isTSConstructSignatureDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSConstructSignatureDeclaration>;
  isTSConstructorType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSConstructorType>;
  isTSDeclareFunction<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSDeclareFunction>;
  isTSDeclareMethod<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSDeclareMethod>;
  isTSEntityName<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSEntityName>;
  isTSEnumDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSEnumDeclaration>;
  isTSEnumMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSEnumMember>;
  isTSExportAssignment<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSExportAssignment>;
  isTSExpressionWithTypeArguments<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSExpressionWithTypeArguments>;
  isTSExternalModuleReference<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSExternalModuleReference>;
  isTSFunctionType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSFunctionType>;
  isTSImportEqualsDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSImportEqualsDeclaration>;
  isTSImportType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSImportType>;
  isTSIndexSignature<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSIndexSignature>;
  isTSIndexedAccessType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSIndexedAccessType>;
  isTSInferType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSInferType>;
  isTSInstantiationExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSInstantiationExpression>;
  isTSInterfaceBody<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSInterfaceBody>;
  isTSInterfaceDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSInterfaceDeclaration>;
  isTSIntersectionType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSIntersectionType>;
  isTSIntrinsicKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSIntrinsicKeyword>;
  isTSLiteralType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSLiteralType>;
  isTSMappedType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSMappedType>;
  isTSMethodSignature<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSMethodSignature>;
  isTSModuleBlock<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSModuleBlock>;
  isTSModuleDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSModuleDeclaration>;
  isTSNamedTupleMember<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNamedTupleMember>;
  isTSNamespaceExportDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNamespaceExportDeclaration>;
  isTSNeverKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNeverKeyword>;
  isTSNonNullExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNonNullExpression>;
  isTSNullKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNullKeyword>;
  isTSNumberKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSNumberKeyword>;
  isTSObjectKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSObjectKeyword>;
  isTSOptionalType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSOptionalType>;
  isTSParameterProperty<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSParameterProperty>;
  isTSParenthesizedType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSParenthesizedType>;
  isTSPropertySignature<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSPropertySignature>;
  isTSQualifiedName<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSQualifiedName>;
  isTSRestType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSRestType>;
  isTSStringKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSStringKeyword>;
  isTSSymbolKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSSymbolKeyword>;
  isTSThisType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSThisType>;
  isTSTupleType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTupleType>;
  isTSType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSType>;
  isTSTypeAliasDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeAliasDeclaration>;
  isTSTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeAnnotation>;
  isTSTypeAssertion<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeAssertion>;
  isTSTypeElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeElement>;
  isTSTypeLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeLiteral>;
  isTSTypeOperator<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeOperator>;
  isTSTypeParameter<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeParameter>;
  isTSTypeParameterDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeParameterDeclaration>;
  isTSTypeParameterInstantiation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeParameterInstantiation>;
  isTSTypePredicate<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypePredicate>;
  isTSTypeQuery<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeQuery>;
  isTSTypeReference<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSTypeReference>;
  isTSUndefinedKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSUndefinedKeyword>;
  isTSUnionType<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSUnionType>;
  isTSUnknownKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSUnknownKeyword>;
  isTSVoidKeyword<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TSVoidKeyword>;
  isTaggedTemplateExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TaggedTemplateExpression>;
  isTemplateElement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TemplateElement>;
  isTemplateLiteral<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TemplateLiteral>;
  isTerminatorless<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Terminatorless>;
  isThisExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ThisExpression>;
  isThisTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ThisTypeAnnotation>;
  isThrowStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.ThrowStatement>;
  isTopicReference<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TopicReference>;
  isTryStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TryStatement>;
  isTupleExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TupleExpression>;
  isTupleTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TupleTypeAnnotation>;
  isTypeAlias<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeAlias>;
  isTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeAnnotation>;
  isTypeCastExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeCastExpression>;
  isTypeParameter<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeParameter>;
  isTypeParameterDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeParameterDeclaration>;
  isTypeParameterInstantiation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeParameterInstantiation>;
  isTypeScript<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeScript>;
  isTypeofTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.TypeofTypeAnnotation>;
  isUnaryExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.UnaryExpression>;
  isUnaryLike<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.UnaryLike>;
  isUnionTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.UnionTypeAnnotation>;
  isUpdateExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.UpdateExpression>;
  isUserWhitespacable<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.UserWhitespacable>;
  isV8IntrinsicIdentifier<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.V8IntrinsicIdentifier>;
  isVariableDeclaration<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.VariableDeclaration>;
  isVariableDeclarator<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.VariableDeclarator>;
  isVariance<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.Variance>;
  isVoidTypeAnnotation<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.VoidTypeAnnotation>;
  isWhile<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.While>;
  isWhileStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.WhileStatement>;
  isWithStatement<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.WithStatement>;
  isYieldExpression<T extends t.Node>(
    this: NodePath<T>,
    opts?: object
  ): this is NodePath<T & t.YieldExpression>;
}
interface NodePathValidators
  extends BaseNodePathValidators,
    VirtualTypeNodePathValidators {}

declare type NodePathMixins = typeof NodePath_ancestry &
  typeof NodePath_inference &
  typeof NodePath_replacement &
  typeof NodePath_evaluation &
  typeof NodePath_conversion &
  typeof NodePath_introspection &
  typeof NodePath_context &
  typeof NodePath_removal &
  typeof NodePath_modification &
  typeof NodePath_family &
  typeof NodePath_comments;
declare class NodePath<T extends t.Node = t.Node> {
  constructor(hub: HubInterface, parent: t.ParentMaps[T["type"]]);
  parent: t.ParentMaps[T["type"]];
  hub: HubInterface;
  data: Record<string | symbol, unknown>;
  context: TraversalContext;
  scope: Scope;
  contexts: Array<TraversalContext>;
  state: any;
  opts: any;
  _traverseFlags: number;
  skipKeys: any;
  parentPath: t.ParentMaps[T["type"]] extends null
    ? null
    : NodePath<t.ParentMaps[T["type"]]> | null;
  container: t.Node | Array<t.Node> | null;
  listKey: string | null;
  key: string | number | null;
  node: T;
  type: T["type"] | null;
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
  }): NodePath;
  getScope(scope: Scope): Scope;
  setData(key: string | symbol, val: any): any;
  getData(key: string | symbol, def?: any): any;
  hasNode(): this is NodePath<NonNullable<this["node"]>>;
  buildCodeFrameError(msg: string, Error?: new () => Error): Error;
  traverse<T>(visitor: Visitor<T>, state: T): void;
  traverse(visitor: Visitor): void;
  set(key: string, node: any): void;
  getPathLocation(): string;
  debug(message: string): void;
  toString(): string;
  get inList(): boolean;
  set inList(inList: boolean);
  get parentKey(): string;
  get shouldSkip(): boolean;
  set shouldSkip(v: boolean);
  get shouldStop(): boolean;
  set shouldStop(v: boolean);
  get removed(): boolean;
  set removed(v: boolean);
}
interface NodePath<T>
  extends NodePathAssetions,
    NodePathValidators,
    NodePathMixins {
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
  ): asserts this is NodePath<
    T & {
      body: t.BlockStatement;
    }
  >;
}

declare type TraverseOptions<S = t.Node> = {
  scope?: Scope;
  noScope?: boolean;
  denylist?: string[];
} & Visitor<S>;
declare function traverse<S>(
  parent: t.Node,
  opts: TraverseOptions<S>,
  scope: Scope | undefined,
  state: S,
  parentPath?: NodePath
): void;
declare function traverse(
  parent: t.Node,
  opts: TraverseOptions,
  scope?: Scope,
  state?: any,
  parentPath?: NodePath
): void;
declare namespace traverse {
  var visitors: typeof __visitors;
  var verify: typeof verify;
  var explode: typeof explode;
  var cheap: (node: t.Node, enter: (node: t.Node) => void) => void;
  var node: (
    node: t.Node,
    opts: TraverseOptions<t.Node>,
    scope?: Scope,
    state?: any,
    path?: NodePath<t.Node>,
    skipKeys?: Record<string, boolean>
  ) => void;
  var clearNode: (node: t.Node, opts?: RemovePropertiesOptions) => void;
  var removeProperties: (
    tree: t.Node,
    opts?: RemovePropertiesOptions
  ) => t.Node;
  var hasType: (
    tree: t.Node,
    type:
      | "ArrayExpression"
      | "AnyTypeAnnotation"
      | "ArgumentPlaceholder"
      | "ArrayPattern"
      | "ArrayTypeAnnotation"
      | "ArrowFunctionExpression"
      | "AssignmentExpression"
      | "AssignmentPattern"
      | "AwaitExpression"
      | "BigIntLiteral"
      | "BinaryExpression"
      | "BindExpression"
      | "BlockStatement"
      | "BooleanLiteral"
      | "BooleanLiteralTypeAnnotation"
      | "BooleanTypeAnnotation"
      | "BreakStatement"
      | "CallExpression"
      | "CatchClause"
      | "ClassAccessorProperty"
      | "ClassBody"
      | "ClassDeclaration"
      | "ClassExpression"
      | "ClassImplements"
      | "ClassMethod"
      | "ClassPrivateMethod"
      | "ClassPrivateProperty"
      | "ClassProperty"
      | "ConditionalExpression"
      | "ContinueStatement"
      | "DebuggerStatement"
      | "DecimalLiteral"
      | "DeclareClass"
      | "DeclareExportAllDeclaration"
      | "DeclareExportDeclaration"
      | "DeclareFunction"
      | "DeclareInterface"
      | "DeclareModule"
      | "DeclareModuleExports"
      | "DeclareOpaqueType"
      | "DeclareTypeAlias"
      | "DeclareVariable"
      | "DeclaredPredicate"
      | "Decorator"
      | "Directive"
      | "DirectiveLiteral"
      | "DoExpression"
      | "DoWhileStatement"
      | "EmptyStatement"
      | "EmptyTypeAnnotation"
      | "EnumBooleanBody"
      | "EnumBooleanMember"
      | "EnumDeclaration"
      | "EnumDefaultedMember"
      | "EnumNumberBody"
      | "EnumNumberMember"
      | "EnumStringBody"
      | "EnumStringMember"
      | "EnumSymbolBody"
      | "ExistsTypeAnnotation"
      | "ExportAllDeclaration"
      | "ExportDefaultDeclaration"
      | "ExportDefaultSpecifier"
      | "ExportNamedDeclaration"
      | "ExportNamespaceSpecifier"
      | "ExportSpecifier"
      | "ExpressionStatement"
      | "File"
      | "ForInStatement"
      | "ForOfStatement"
      | "ForStatement"
      | "FunctionDeclaration"
      | "FunctionExpression"
      | "FunctionTypeAnnotation"
      | "FunctionTypeParam"
      | "GenericTypeAnnotation"
      | "Identifier"
      | "IfStatement"
      | "Import"
      | "ImportAttribute"
      | "ImportDeclaration"
      | "ImportDefaultSpecifier"
      | "ImportNamespaceSpecifier"
      | "ImportSpecifier"
      | "IndexedAccessType"
      | "InferredPredicate"
      | "InterfaceDeclaration"
      | "InterfaceExtends"
      | "InterfaceTypeAnnotation"
      | "InterpreterDirective"
      | "IntersectionTypeAnnotation"
      | "JSXAttribute"
      | "JSXClosingElement"
      | "JSXClosingFragment"
      | "JSXElement"
      | "JSXEmptyExpression"
      | "JSXExpressionContainer"
      | "JSXFragment"
      | "JSXIdentifier"
      | "JSXMemberExpression"
      | "JSXNamespacedName"
      | "JSXOpeningElement"
      | "JSXOpeningFragment"
      | "JSXSpreadAttribute"
      | "JSXSpreadChild"
      | "JSXText"
      | "LabeledStatement"
      | "LogicalExpression"
      | "MemberExpression"
      | "MetaProperty"
      | "MixedTypeAnnotation"
      | "ModuleExpression"
      | "NewExpression"
      | "Noop"
      | "NullLiteral"
      | "NullLiteralTypeAnnotation"
      | "NullableTypeAnnotation"
      | "NumberLiteral"
      | "NumberLiteralTypeAnnotation"
      | "NumberTypeAnnotation"
      | "NumericLiteral"
      | "ObjectExpression"
      | "ObjectMethod"
      | "ObjectPattern"
      | "ObjectProperty"
      | "ObjectTypeAnnotation"
      | "ObjectTypeCallProperty"
      | "ObjectTypeIndexer"
      | "ObjectTypeInternalSlot"
      | "ObjectTypeProperty"
      | "ObjectTypeSpreadProperty"
      | "OpaqueType"
      | "OptionalCallExpression"
      | "OptionalIndexedAccessType"
      | "OptionalMemberExpression"
      | "ParenthesizedExpression"
      | "PipelineBareFunction"
      | "PipelinePrimaryTopicReference"
      | "PipelineTopicExpression"
      | "Placeholder"
      | "PrivateName"
      | "Program"
      | "QualifiedTypeIdentifier"
      | "RecordExpression"
      | "RegExpLiteral"
      | "RegexLiteral"
      | "RestElement"
      | "RestProperty"
      | "ReturnStatement"
      | "SequenceExpression"
      | "SpreadElement"
      | "SpreadProperty"
      | "StaticBlock"
      | "StringLiteral"
      | "StringLiteralTypeAnnotation"
      | "StringTypeAnnotation"
      | "Super"
      | "SwitchCase"
      | "SwitchStatement"
      | "SymbolTypeAnnotation"
      | "TSAnyKeyword"
      | "TSArrayType"
      | "TSAsExpression"
      | "TSBigIntKeyword"
      | "TSBooleanKeyword"
      | "TSCallSignatureDeclaration"
      | "TSConditionalType"
      | "TSConstructSignatureDeclaration"
      | "TSConstructorType"
      | "TSDeclareFunction"
      | "TSDeclareMethod"
      | "TSEnumDeclaration"
      | "TSEnumMember"
      | "TSExportAssignment"
      | "TSExpressionWithTypeArguments"
      | "TSExternalModuleReference"
      | "TSFunctionType"
      | "TSImportEqualsDeclaration"
      | "TSImportType"
      | "TSIndexSignature"
      | "TSIndexedAccessType"
      | "TSInferType"
      | "TSInstantiationExpression"
      | "TSInterfaceBody"
      | "TSInterfaceDeclaration"
      | "TSIntersectionType"
      | "TSIntrinsicKeyword"
      | "TSLiteralType"
      | "TSMappedType"
      | "TSMethodSignature"
      | "TSModuleBlock"
      | "TSModuleDeclaration"
      | "TSNamedTupleMember"
      | "TSNamespaceExportDeclaration"
      | "TSNeverKeyword"
      | "TSNonNullExpression"
      | "TSNullKeyword"
      | "TSNumberKeyword"
      | "TSObjectKeyword"
      | "TSOptionalType"
      | "TSParameterProperty"
      | "TSParenthesizedType"
      | "TSPropertySignature"
      | "TSQualifiedName"
      | "TSRestType"
      | "TSStringKeyword"
      | "TSSymbolKeyword"
      | "TSThisType"
      | "TSTupleType"
      | "TSTypeAliasDeclaration"
      | "TSTypeAnnotation"
      | "TSTypeAssertion"
      | "TSTypeLiteral"
      | "TSTypeOperator"
      | "TSTypeParameter"
      | "TSTypeParameterDeclaration"
      | "TSTypeParameterInstantiation"
      | "TSTypePredicate"
      | "TSTypeQuery"
      | "TSTypeReference"
      | "TSUndefinedKeyword"
      | "TSUnionType"
      | "TSUnknownKeyword"
      | "TSVoidKeyword"
      | "TaggedTemplateExpression"
      | "TemplateElement"
      | "TemplateLiteral"
      | "ThisExpression"
      | "ThisTypeAnnotation"
      | "ThrowStatement"
      | "TopicReference"
      | "TryStatement"
      | "TupleExpression"
      | "TupleTypeAnnotation"
      | "TypeAlias"
      | "TypeAnnotation"
      | "TypeCastExpression"
      | "TypeParameter"
      | "TypeParameterDeclaration"
      | "TypeParameterInstantiation"
      | "TypeofTypeAnnotation"
      | "UnaryExpression"
      | "UnionTypeAnnotation"
      | "UpdateExpression"
      | "V8IntrinsicIdentifier"
      | "VariableDeclaration"
      | "VariableDeclarator"
      | "Variance"
      | "VoidTypeAnnotation"
      | "WhileStatement"
      | "WithStatement"
      | "YieldExpression",
    denylistTypes?: string[]
  ) => boolean;
  var cache: typeof __cache;
}

export {
  Binding,
  Hub,
  HubInterface,
  NodePath,
  Scope,
  TraverseOptions,
  Visitor,
  traverse as default,
  __visitors as visitors,
};
