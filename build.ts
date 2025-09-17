import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = "dist/index.js";

console.info(`\x1b[32m➜\x1b[0m Building [${process.argv[2]}] handler`);

esbuild
    .build({
        entryPoints: [`./src/handler/${process.argv[2]}/index.ts`],
        bundle: true,
        minify: true,
        sourcemap: true,
        splitting: false, // Prevent multiple output files
        metafile: false, // Avoid generating extra metadata files
        format: "cjs",
        platform: "node",
        target: "node22",
        outfile: outputPath,
        external: [
            "../../../package.json",
            "./chromium/appIcon.png",
            "./loader",
            "chromium-bidi/*",
        ],
    })
    .then(() => {
        console.info(`\x1b[32m➜\x1b[0m Finished build to ${outputPath}`);

        const sourcePackagePath = path.resolve(
            __dirname,
            "node_modules/playwright-core/package.json",
        );
        const destPackagePath = path.resolve(__dirname, "dist/playwright-package.json");
        console.info(`\x1b[32m➜\x1b[0m Copying \n\tfrom => ${sourcePackagePath} \n\t  to => ${destPackagePath}`);
        fs.copyFileSync(sourcePackagePath, destPackagePath);
        console.info("\x1b[32m➜\x1b[0m Copied successfully");

        const bundledCode = fs
            .readFileSync(path.resolve(__dirname, outputPath), "utf-8")
            .replace(/..\/..\/..\/package.json/g, "./playwright-package.json");
        console.info("\x1b[32m➜\x1b[0m Replaced problematic path of Playwright to the copy");

        fs.writeFileSync(path.resolve(__dirname, outputPath), bundledCode);
        console.info(`\x1b[32m➜\x1b[0m Overrode the original ${outputPath}`);
    })
    .catch(() => process.exit(1));
