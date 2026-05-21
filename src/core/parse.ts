import * as acorn from "acorn";
import * as walk from "acorn-walk";

export interface Task {
  id: string;
  task: string;
  type: "stack" | "micro" | "macro";
}

export interface FuncMap {
  [funcName: string]: {
    tasks: Task[];
  };
}

export interface ParseResult {
  mainScript: Task[];
  funcMap: FuncMap;
}

function getName(callee: any): string {
  if (!callee) return "anonymous";
  if (callee.type === "Identifier") return callee.name;
  if (callee.type === "MemberExpression") {
    if (callee.object.type === "CallExpression") {
      return `${getName(callee.object.callee)}().${callee.property?.name || "unknown"}`;
    }
    return `${callee.object?.name || "unknown"}.${callee.property?.name || "unknown"}`;
  }
  return "anonymous";
}

function covertNodeToTask(node: any): Task {
  const callee = node.callee;
  const fullName = getName(callee);
  const uuid = crypto.randomUUID();

  if (fullName.startsWith("setTimeout") || fullName.startsWith("setInterval")) {
    return { id: uuid, task: `${fullName}(cb)`, type: "macro" };
  }
  if (
    fullName.startsWith("Promise") ||
    fullName.includes(".then") ||
    fullName.includes(".catch") ||
    fullName.includes(".finally") ||
    fullName === "queueMicrotask"
  ) {
    return { id: uuid, task: `${fullName}(cb)`, type: "micro" };
  }
  return { id: uuid, task: `${fullName}()`, type: "stack" };
}

export function parseCode(code: string): ParseResult {
  const mainScript: Task[] = [];
  const funcMap: FuncMap = {};

  if (!code || !code.trim()) return { mainScript, funcMap };

  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    });

    walk.ancestor(ast, {
      FunctionDeclaration(node: any) {
        if (node.id?.name) {
          funcMap[node.id.name] = { tasks: [] };
        }
      },

      CallExpression(node: any, _, ancestors: any[]) {
        const task = covertNodeToTask(node);

        const parentFunc = [...ancestors]
          .reverse()
          .find((anc) => anc.type === "FunctionDeclaration");

        if (parentFunc && parentFunc.id?.name) {
          const funcName = parentFunc.id.name;

          if (!funcMap[funcName]) funcMap[funcName] = { tasks: [] };

          funcMap[funcName].tasks.push(task);
        } else {
          mainScript.push(task);
        }
      },
    });
  } catch (error) {
    console.warn("[Parser] 구문 오류: ", error);
  }

  return { mainScript, funcMap };
}
