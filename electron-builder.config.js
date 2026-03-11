const isWindowsDomainEnvironment = process.platform === 'win32' && Boolean(
  process.env.USERDNSDOMAIN || (process.env.USERDOMAIN && process.env.USERDOMAIN !== process.env.COMPUTERNAME),
)

if (isWindowsDomainEnvironment) {
  console.warn(' ⚠️  Detected Windows domain environment. Code signing will be disabled to avoid potential issues with domain policies.')
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  asar: true,
  directories: {
    output: 'build',
  },
  publish: null,
  npmRebuild: true,
  win: {
    signAndEditExecutable: !isWindowsDomainEnvironment,
    icon: 'logo.png',
  },
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/render/**/*',
    "node_modules/**/*"
  ],
}

module.exports = config
