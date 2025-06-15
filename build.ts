import esbuild from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

interface BuildConfig extends esbuild.BuildOptions {
  outfile: string;
  globalName?: string;
}

interface CopyFile {
  from: string;
  to: string;
}

interface CopyDirectory {
  from: string;
  to: string;
}

const commonConfig: Partial<esbuild.BuildOptions> = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  target: 'es2020',
  format: 'iife',
  external: [],
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
  }
};

const buildConfigs: BuildConfig[] = [
  {
    ...commonConfig,
    entryPoints: ['src/content.tsx'],
    outfile: 'dist/content.js',
    globalName: 'HoverCopyContent'
  },
  {
    ...commonConfig,
    entryPoints: ['src/popup.tsx'],
    outfile: 'dist/popup.js',
    globalName: 'HoverCopyPopup'
  }
];

const copyFiles: CopyFile[] = [
  { from: 'src/manifest.json', to: 'dist/manifest.json' },
  { from: 'src/popup.html', to: 'dist/popup.html' },
  { from: 'src/popup.css', to: 'dist/popup.css' },
  { from: 'src/content.css', to: 'dist/content.css' }
];

const copyDirectories: CopyDirectory[] = [
  { from: 'src/icons', to: 'dist/icons' }
];

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyDirectory(src: string, dest: string): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const files = readdirSync(src);
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    if (statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

async function build(): Promise<void> {
  try {
    console.log('Building with esbuild...');
    
    for (const config of buildConfigs) {
      ensureDir(config.outfile);
      if (isWatch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        console.log(`Watching ${config.entryPoints?.[0]}...`);
      } else {
        await esbuild.build(config);
        console.log(`Built ${config.entryPoints?.[0]} -> ${config.outfile}`);
      }
    }

    copyFiles.forEach(({ from, to }) => {
      try {
        ensureDir(to);
        copyFileSync(from, to);
        console.log(`Copied ${from} -> ${to}`);
      } catch (error) {
        console.warn(`Warning: Could not copy ${from} -> ${to}:`, (error as Error).message);
      }
    });

    copyDirectories.forEach(({ from, to }) => {
      try {
        copyDirectory(from, to);
        console.log(`Copied directory ${from} -> ${to}`);
      } catch (error) {
        console.warn(`Warning: Could not copy directory ${from} -> ${to}:`, (error as Error).message);
      }
    });

    if (!isWatch) {
      console.log('Build completed successfully!');
    } else {
      console.log('Watching for changes...');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();