#!/usr/bin/env node
import process from "process";
import {Adapters} from "./adapters";

/* Note: the Node process terminates when the event loop is empty, so this IIFE will run to completion and the exit code
will be 0 unless we explicitly exit with some other value. */
(async () => {
    const adapters = await Adapters.create();
    const adapter = await adapters.select();
    const [, , action, service, username, password] = process.argv;
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
})();
