#!/usr/bin/env node
import fs from "fs";
import path from "path";
import child_process from "child_process";
import process from "process";
import {WindowsCredentialManager} from "./windows.js";
import {CredentialAccess} from "./types";

class CommandLineAccess implements CredentialAccess {
    constructor(
        private readonly bin: string,
        private readonly deleteCmd: string,
        private readonly getCmd: string,
        private readonly setCmd: string
    ) {

    }

    async delete(service: string, username: string) {
        await this.exec(this.deleteCmd, {service, username});
    }

    async get(service: string, username: string): Promise<string> {
        return await this.exec(this.getCmd, {service, username});
    }

    async set(service: string, username: string, password: string) {
        await this.exec(this.setCmd, {service, username, password});
    }

    private exec(template: string, vars: Record<string, string>): Promise<string> {
        const {bin} = this;
        const command = new Function("with (this) return `" + template + "`;").call({bin, ...vars});
        return new Promise((resolve, reject) => {
            child_process.exec(command, (err, stdout, stderr) => {
                if (null == err) {
                    resolve(stdout);
                    return;
                }
                reject(err);
            });
        });
    }
}

const accessByTool: [string, (executable: string) => CredentialAccess][] = [
    [
        "secret-tool",
        executable => new CommandLineAccess(
            executable,
            "${bin} clear service ${service} username ${username}",
            "${bin} lookup service ${service} username ${username}",
            "echo -n '${password}' | ${bin} store --label '${service}/${username}' service ${service} username ${username}")
    ],
    [
        "security",
        executable => new CommandLineAccess(
            executable,
            "${bin} delete-generic-credential -s ${service} -a ${username}",
            "${bin} find-generic-credential -s ${service} -a ${username} -w",
            "${bin} add-generic-credential -s ${service} -a ${username} -w ${password}")
    ],
];

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

const findAccessor = async () => {
    if ((process.env["OS"] || "").startsWith("Windows_")) {
        return new WindowsCredentialManager(await findHome(process.cwd()));
    }
    for (const [tool, access] of accessByTool) {
        try {
            const executable = await new Promise<string>((resolve, reject) => {
                child_process.exec(`command -v ${tool}`, (err: any, stdout: string) => {
                    if (null == err) {
                        resolve(stdout.trim());
                    } else {
                        reject(err)
                    }
                });
            });
            return access(executable);
        } catch (err) {
            console.log(err);
        }
    }
    throw Error("No supported credential access tool was found.");
}

(async () => {
    const access = await findAccessor();
    const [, , action, service, username, password] = process.argv;
    switch (action) {
        case "delete":
            await access.delete(service, username);
            break;
        case "get":
            console.log(await access.get(service, username));
            break;
        case "set":
            await access.set(service, username, password);
            break;
        default:
            console.error(`Unsupported action [${action}].`);
            process.exit(1);
    }
    process.exit(0);
})();

