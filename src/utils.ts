import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";

/**
 * Determine whether a command exists on the system path.
 *
 * @param command the command name.
 */
const commandExists = async (command: string): Promise<boolean> => new Promise<boolean>(resolve => {
    child_process.exec(command, err => {
        resolve(err == null);
    });
});

/**
 * Evaluate a JavaScript expression with a given context object as `this`.
 *
 * @param expr the expression.
 * @param context the context object.
 */
const evaluate = (expr: string, context: NodeJS.Dict<any> = {}): any => {
    return new Function(`with (this) return (${expr});`).call(context);
}

/**
 * Find the home directory of the credstore installation. Will be the installation directory unless executed from within
 * the project itself, in which case it will be the project directory.
 *
 * @param cwd the current working directory.
 */
const findHome = async (cwd: string) => {
    try {
        const mainPath = require.main?.path;
        if (null != mainPath) {
            return path.resolve(mainPath, "..");
        }
        await fs.promises.stat(path.resolve(cwd, "./dist/credstore.js"));
        return cwd;
    } catch (err) {
        if (err instanceof Error && "code" in err && "ENOENT" === err.code) {
            return path.resolve(path.dirname(process.argv[1]), "..");
        }
        throw err;
    }
}

/* Module exports. */
export {
    commandExists,
    evaluate,
    findHome
};
