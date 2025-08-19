#!/usr/bin/env node
import process from "process";

const cwd = process.argv[1];
if (!(process.env["OS"] || "").startsWith("Windows_")) {
    console.log(`PWD: ${cwd}`);
    console.log(`ARGV: ${JSON.stringify(process.argv)}`);
} else {
    const runWindows = require("./windows");
    runWindows(cwd, process.argv.slice(2));
}
