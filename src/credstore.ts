#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";
import {Adapters} from "./adapters";

/* Note: the Node process terminates when the event loop is empty, so this IIFE will run to completion and the exit code
will be 0 unless we explicitly exit with some other value. */
(async () => {
    const {argv} = process;
    if (-1 !== argv.indexOf("--help") || -1 !== argv.indexOf("-h") || argv.length < 3) {
        const command = path.basename(argv[1]).replace(/\.[^.]+$/, "");
        console.log(`Usage: ${command} delete <service> <account>`);
        console.log(`       ${command} get <service> <account>`);
        console.log(`       ${command} set <service> <account> <password>`);
    } else if (-1 !== argv.indexOf("--version") || -1 !== argv.indexOf("-v")) {
        let version = "(development build)";
        const mainPath = require.main?.path;
        if (null != mainPath) {
            try {
                version = await fs.promises.readFile(path.resolve(mainPath, "./VERSION"), "utf8");
            } catch (err) {
                /* Ignore. */
            }
        }
        console.log(`credstore ${version}`);
    } else {
        const adapters = await Adapters.create();
        const adapter = await adapters.select();
        const [, , action, service, username, password] = argv;
        try {
            switch (action) {
                case "delete":
                    await adapter.delete(service, username);
                    break;
                case "get":
                    console.log(await adapter.get(service, username));
                    break;
                case "set":
                    await adapter.set(service, username, password);
                    break;
                default:
                    console.error(`Unsupported action [${action}].`);
                    process.exit(1);
            }
        } catch (err) {
            console.error((err as Error).message);
            process.exit(1);
        }
    }
})();
