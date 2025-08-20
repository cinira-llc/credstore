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
fs.stat(path.resolve(cwd, "./dist"), (err: any, stats: any) => {
    if (null != err) {
        throw err;
    }
    const args = process.argv.slice(2);
    if (stats.isDirectory()) {
        run(cwd, args);
    } else {
        run(process.argv[1], args);
    }
});
