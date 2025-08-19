#!/usr/bin/env node
import process from "process";
import fs from "fs";
import path from "path";
import runWindows from "./windows.js";

const cwd = process.cwd();
const stat = await fs.promises.stat(path.resolve(cwd, "./dist"));
let home: string;
if (stat.isDirectory()) {
    home = cwd;
} else {
    home = process.argv[1];
}
if (!(process.env["OS"] || "").startsWith("Windows_")) {
    console.log(`Home: ${home}`);
    console.log(`ARGV: ${JSON.stringify(process.argv)}`);
} else {
    runWindows(home, process.argv.slice(2));
}
