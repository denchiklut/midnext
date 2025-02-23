import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { dtsPlugin } from "esbuild-plugin-d.ts"

await build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    sourcemap: true,
    format: 'cjs',
    platform: 'node',
    target: ['es6'],
    outdir: 'dist',
    plugins: [
        dtsPlugin({ tsconfig: 'tsconfig.json' }),
        nodeExternalsPlugin(),
    ],
});
