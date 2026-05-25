import { covertNodeToTask } from "@/utils/lib";
import type { FuncMap, ParseResult, Task } from "@/utils/type";
import * as acorn from "acorn";
import * as walk from "acorn-walk";

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
