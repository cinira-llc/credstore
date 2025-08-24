import {execute} from "../src/exec";

describe("exec.ts", () => {
    const [node] = process.argv;
    describe("execute()", () => {
        it("should return the process exit code", async () => {
            const result = await execute(node, ["-e", "process.exit(123);"]);
            expect(result.code).toBe(123);
        });
        it("should capture stderr", async () => {
            const result = await execute(node, ["-e", "console.error('This is stderr.');"]);
            expect(result.code).toBe(0);
            expect(result.stderr!!.toString("utf-8")).toBe("This is stderr.\n");
            expect(result.stdout).toBeUndefined();
        });
        it("should capture stdout", async () => {
            const result = await execute(node, ["-e", "console.log('This is stdout.');"]);
            expect(result.code).toBe(0);
            expect(result.stderr).toBeUndefined();
            expect(result.stdout!!.toString("utf-8")).toBe("This is stdout.\n");
        });
        it("should pipe stdin", async () => {
            const result = await execute(node, ["-"], Buffer.from("console.log('This is stdout from stdin.');", "utf-8"));
            expect(result.code).toBe(0);
            expect(result.stderr).toBeUndefined();
            expect(result.stdout!!.toString("utf-8")).toBe("This is stdout from stdin.\n");
        });
    });
});
