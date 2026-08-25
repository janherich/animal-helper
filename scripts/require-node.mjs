const [major] = process.versions.node.split(".").map(Number);

if (major === undefined || major < 24 || major >= 27) {
  console.error(
    `animal-helper needs Node.js 24 (this process is v${process.versions.node}).`,
  );
  console.error(
    "pnpm 11 also needs Node 22.13+ / 24; Node 23.1 crashes with 'Cannot find package node:sqlite'.",
  );
  console.error("");
  console.error("Homebrew:");
  console.error('  export PATH="$(brew --prefix node@24)/bin:$PATH"');
  console.error("");
  console.error("Or use nvm/fnm to select the version in .nvmrc.");
  process.exit(1);
}
