import fs from "fs";
import path from "path";
import process from "process";
import child_process from "child_process";

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
 * Find a command on the system path based on its binary basename.
 *
 * @param command the command name.
 */
const findCommand = (command: string): Promise<string | undefined> => {
    return new Promise(resolve => {
        child_process.exec(`command -v ${command}`, (err, stdout) => {
            if (null != err) {
                resolve(undefined);
            } else {
                resolve(stdout.trim());
            }
        });
    });
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
        if (null !=  mainPath) {
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
    evaluate,
    findCommand,
    findHome
};
