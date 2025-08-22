import {execute} from "../src/exec";

describe("exec.ts", () => {
    describe("execute()", () => {
        it("should capture stderr from a command", async () => {
            const result = await execute("ls", ["/does/not/exist"]);
            expect(result.code).toBe(2);
            expect(result.stderr!!.toString("utf-8")).toContain("/does/not/exist");
            expect(result.stdout).toBeUndefined();
        });
        it("should capture stdout from a command", async () => {
            const result = await execute("echo", ["-n", "Hello, World!"]);
            expect(result.code).toBe(0);
            expect(result.stdout!!.toString("utf-8")).toBe("Hello, World!");
            expect(result.stderr).toBeUndefined();
        });
        it("should pipe provided input to a command", async () => {
            const result = await execute("cat", [], Buffer.from("Hello, World!", "utf-8"));
            expect(result.code).toBe(0);
            expect(result.stdout!!.toString("utf-8")).toBe("Hello, World!");
            expect(result.stderr).toBeUndefined();
        });
    });
});
