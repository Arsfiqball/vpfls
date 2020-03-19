# Virus Pandemic Fight by Locking down Simulation

This is a simple web-based simulation program running on browser (no need
backend server). Demo: https://vpfls.arsfiqball.com

### Local Usage

You require to install Node.js, Browser-Sync, Yarn and Git before starting
steps below.

1. Clone this repository
   ```sh
   git clone https://github.com/Arsfiqball/vpfls.git
   ```
2. Open the directory and install all dependency
   ```sh
   cd vpfls
   yarn
   ```
3. Build program
   ```sh
   yarn build
   ```
4. Run the browser-sync on `dist` directory
   ```sh
   browser-sync start --server --ss dist -w
   ```

### Development Mode

Same as local usage, but you can run watch mode instead of build mode.
Rollup daemon will keep watching for changes and update your build
every time you save new code. But you need to run browser-sync in separate
terminal window.

```sh
yarn dev
```

### How to Contribute

1. If you found bug, have a good idea for feature, or have a discussion for
   more accurate simulation. Post it at [Issue page](https://github.com/Arsfiqball/vpfls/issues)
   with descriptive title/subject and your best explanation.
2. If you want to contribute to the repo, please squash your commit with
   a descriptive information, dont forget to mention the issue number if it
   solves one. Also mention it on pull request message.

### Maintainer

[Arsfiqball](https://arsfiqball.com)
