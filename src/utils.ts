import child_process from "child_process";
import fs from "fs";
import path from "path";
import process from "process";

const evaluate = (expr: string, vars: NodeJS.Dict<any> = {}): any => {
    return new Function(`with (this) return (${expr});`).call(vars);
}

const findExecutable = (name: string): Promise<string | undefined> => {
    return new Promise(resolve => {
        child_process.exec(`command -v ${name}`, (err, stdout) => {
            if (null != err) {
                resolve(undefined);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

const findHome = async (cwd: string) => {
    try {
        await fs.promises.stat(path.resolve(cwd, "./dist/credstore.js"));
        return cwd;
    } catch (err) {
        if (Error.isError(err) && "code" in err && "ENOENT" === err.code) {
            return path.resolve(path.dirname(process.argv[1]), "..");
        }
        throw err;
    }
}

export {
    evaluate,
    findExecutable,
    findHome
};
