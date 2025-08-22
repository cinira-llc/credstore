import child_process from "child_process";

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

export {
    evaluate,
    findExecutable
};
