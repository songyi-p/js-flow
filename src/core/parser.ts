import * as acorn from "acorn";
import * as walk from "acorn-walk";
import type { FuncMap, ParseResult, Task } from "@/utils/types/parser";
import {
  createTask,
  extractChain,
  findClosestFunc,
  getDeclaredFuncName,
  getCallExprName,
} from "./parser.helpers";

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
        funcMap[name] = { tasks: [], params: node.params.map((p: any) => p.name) };
      }
    },
    FunctionExpression(node: any, _, ancestors: any[]) {
      const name = getDeclaredFuncName(node, ancestors);
      if (name && !funcMap[name]) {
        funcMap[name] = { tasks: [], params: node.params.map((p: any) => p.name) };
      }
    },
    ArrowFunctionExpression(node: any, _, ancestors: any[]) {
      const name = getDeclaredFuncName(node, ancestors);
      if (name && !funcMap[name]) {
        funcMap[name] = { tasks: [], params: node.params.map((p: any) => p.name) };
      }
    },
  });

  const processedRanges = new Set<string>();
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
      const rangeKey = `${node.start}-${node.end}`;
      if (processedRanges.has(rangeKey)) return;

      const callName = getCallExprName(node.callee);
      const isMicro =
        callName.startsWith("Promise") ||
        callName.includes(".then") ||
        callName.includes(".catch") ||
        callName.includes(".finally") ||
        callName === "queueMicrotask";

      if (isMicro) {
        const parentCall = [...ancestors]
          .reverse()
          .find((a) => a !== node && a.type === "CallExpression");

        if (parentCall) {
          const parentName = getCallExprName(parentCall.callee);
          const parentIsMicro =
            parentName.startsWith("Promise") ||
            parentName.includes(".then") ||
            parentName.includes(".catch") ||
            parentName.includes(".finally") ||
            parentName === "queueMicrotask";

          if (parentIsMicro) {
            processedRanges.add(rangeKey);
            return;
          }
        }

        const { chain } = extractChain(node, code);
        const displayName =
          callName === "queueMicrotask" ? "queueMicrotask(() => { ... })" : "Promise.resolve()";
        const task: Task = {
          id: crypto.randomUUID(),
          task: displayName,
          type: "micro",
          chain,
        };

        processedRanges.add(rangeKey);

        const closestFunc = findClosestFunc(ancestors.slice(0, ancestors.length - 1));
        if (closestFunc) {
          const funcName = getDeclaredFuncName(
            closestFunc,
            ancestors.slice(0, ancestors.indexOf(closestFunc) + 1),
          );
          if (funcName && funcMap[funcName]) {
            funcMap[funcName].tasks.push(task);
            return;
          }
        }
        mainScript.push(task);
        return;
      }

      const task = createTask(node, code);
      processedRanges.add(rangeKey);

      const closestFunc = findClosestFunc(ancestors.slice(0, ancestors.length - 1));
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
