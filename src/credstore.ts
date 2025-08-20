#!/usr/bin/env node
import fs from "fs";
import path from "path";
import {runWindows} from "./windows.js";

const run = (home: string, args: string[]) => {
    if (!(process.env["OS"] || "").startsWith("Windows_")) {
        console.log(`Home: ${home}`);
        console.log(`ARGV: ${JSON.stringify(process.argv)}`);
    } else {
        runWindows(home, args);
    }
}

const cwd = process.cwd();
fs.stat(path.resolve(cwd, "./dist/credstore.js"), (err: any, stats: any) => {
    const args = process.argv.slice(2);
    if (null == err) {
        run(cwd, args);
    } else if ("code" in err && err.code === "ENOENT") {
        run(path.resolve(path.dirname(process.argv[1]), ".."), args);
    } else {
        throw err;
    }
});
