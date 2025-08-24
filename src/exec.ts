import child_process from "child_process";

/**
 * Result of executing a command in a child process.
 */
type ExecuteResult = {
    code: number;
    stderr?: Buffer;
    stdout?: Buffer;
}

/**
 * Execute a command in a child process, passing it a given array of arguments and, optionally, a Buffer to its standard
 * input.
 *
 * @param command the command.
 * @param args the arguments.
 * @param stdin the standard input.
 */
const execute = (command: string, args: string[] = [], stdin?: Buffer) =>
    new Promise<ExecuteResult>((resolve, reject) => {
        const stderr: Buffer[] = [];
        const stdout: Buffer[] = [];
        const proc = child_process.spawn(command, args, {shell: false})
            .on("error", reject)
            .on("spawn", () => {
                if (undefined !== stdin) {
                    const {stdin: input} = proc;
                    input.write(stdin);
                    input.end();
                }
            })
            .on("close", code => resolve({
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
            }));
        proc.stdout.on("data", data => stdout.push(data));
        proc.stderr.on("data", data => stderr.push(data));
    });

/* Module exports. */
export {
    execute,
    ExecuteResult
};
