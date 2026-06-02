import * as acorn from "acorn";
import * as walk from "acorn-walk";
import {
  createTask,
  findClosestFunc,
  getDeclaredFuncName,
  parseCallbackFunc,
} from "./parser.helpers";
import type { FuncMap, ParseResult, Task } from "@/utils/types/parser";

export function parser(code: string): ParseResult {
  const mainScript: Task[] = [];
  const funcMap: FuncMap = {};

  if (!code?.trim()) return { mainScript, funcMap };

  let ast: acorn.Node;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "module",
      allowAwaitOutsideFunction: true,
    });
  } catch (error) {
    console.warn("[Parser] 구문 오류:", error);
    return { mainScript, funcMap };
  }

  walk.ancestor(ast, {
    FunctionDeclaration(node: any, _, ancestors: any[]) {
      const name = getDeclaredFuncName(node, ancestors);
      if (name && !funcMap[name]) {
        funcMap[name] = {
          tasks: [],
          params: node.params.map((p: any) => p.name),
        };
      }
    },
    FunctionExpression(node: any, _, ancestors: any[]) {
      const name = getDeclaredFuncName(node, ancestors);
      if (name && !funcMap[name]) {
        funcMap[name] = {
          tasks: [],
          params: node.params.map((p: any) => p.name),
        };
      }
    },
    ArrowFunctionExpression(node: any, _, ancestors: any[]) {
      const name = getDeclaredFuncName(node, ancestors);
      if (name && !funcMap[name]) {
        funcMap[name] = {
          tasks: [],
          params: node.params.map((p: any) => p.name),
        };
      }
    },
  });

  walk.ancestor(ast, {
    VariableDeclaration(node: any, _, ancestors: any[]) {
      for (const decl of node.declarations) {
        if (!decl.id?.name) continue;

        const task: Task = {
          id: crypto.randomUUID(),
          task: code.slice(node.start, node.end),
          type: "declaration",
          varName: decl.id.name,
          varValue: decl.init ? code.slice(decl.init.start, decl.init.end) : "undefined",
        };

        const closestFunc = findClosestFunc(ancestors.slice(0, ancestors.length - 1));
        if (closestFunc) {
          const funcName = getDeclaredFuncName(
            closestFunc,
            ancestors.slice(0, ancestors.indexOf(closestFunc) + 1),
          );
          if (funcName && funcMap[funcName]) {
            funcMap[funcName].tasks.push(task);
            continue;
          }
        }
        mainScript.push(task);
      }
    },
    CallExpression(node: any, _, ancestors: any[]) {
      const task = createTask(node, code);
      const closestFunc = findClosestFunc(ancestors.slice(0, ancestors.length - 1));

      if (task.type === "macro" || task.type === "micro") {
        (task as any).bodyTasks = parseCallbackFunc(node, code);
      }

      if (closestFunc) {
        const funcName = getDeclaredFuncName(
          closestFunc,
          ancestors.slice(0, ancestors.indexOf(closestFunc) + 1),
        );
        if (funcName && funcMap[funcName]) {
          funcMap[funcName].tasks.push(task);
          return;
        }
        if (!funcName) return;
      }

      mainScript.push(task);
    },
  });

  return { mainScript, funcMap };
}
