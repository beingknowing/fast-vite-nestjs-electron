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
  directories: {
    output: 'dist/electron',
  },
  publish: null,
  npmRebuild: false,
  win: {
    signAndEditExecutable: !isWindowsDomainEnvironment,
    icon: 'logo.png',
  },
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/render/**/*',
  ],
}

module.exports = config
