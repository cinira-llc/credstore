import child_process from "child_process";

type ExecuteResult = {
    code: number;
    stderr: Buffer | undefined;
    stdout: Buffer | undefined;
}

const execute = async (cmd: string, args: string[] = [], stdin?: Buffer) => new Promise<ExecuteResult>((resolve, reject) => {
    const stderr: Buffer[] = [];
    const stdout: Buffer[] = [];
    const proc = child_process.spawn(cmd, args, {shell: false})
        .on("error", err => {
            reject(err);
        }).on("spawn", () => {
            if (null != stdin) {
                const {stdin: input} = proc;
                input.write(stdin);
                input.end();
            }
        }).on("close", code => {
            resolve({
                code: code || 0,
                get stderr() {
                    if (1 === stderr.length) {
                        return stderr[0];
                    } else if (stderr.length > 1) {
                        return Buffer.concat(stderr);
                    }
                },
                get stdout() {
                    if (1 === stdout.length) {
                        return stdout[0];
                    } else if (stdout.length > 1) {
                        return Buffer.concat(stdout);
                    }
                }
            });
        });
    proc.stdout.on("data", data => stdout.push(data));
    proc.stderr.on("data", data => stderr.push(data));
});

export {
    execute,
    ExecuteResult
};
