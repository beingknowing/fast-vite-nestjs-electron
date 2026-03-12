const isWindowsDomainEnvironment = process.platform === 'win32' && Boolean(
  process.env.USERDNSDOMAIN || (process.env.USERDOMAIN && process.env.USERDOMAIN !== process.env.COMPUTERNAME),
)

const hasGitHubToken = Boolean(process.env.GH_TOKEN)
const wantsPublish = process.env.ELECTRON_BUILDER_PUBLISH === 'always'
const shouldPublishToGitHub = wantsPublish && hasGitHubToken

const [githubOwner, githubRepo] = (process.env.GITHUB_REPOSITORY || 'beingknowing/fast-vite-nestjs-electron').split('/')

if (isWindowsDomainEnvironment) {
  console.warn(' ⚠️  Detected Windows domain environment. Code signing will be disabled to avoid potential issues with domain policies.')
}

if (wantsPublish && !hasGitHubToken) {
  console.warn(' ⚠️  ELECTRON_BUILDER_PUBLISH=always was set but GH_TOKEN is missing. Build will continue with publish disabled.')
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.beingknowing.fast-vite-nestjs-electron',
  asar: true,
  directories: {
    output: 'build',
  },
  ...(shouldPublishToGitHub
    ? {
      publish: [
        {
          provider: 'github',
          owner: githubOwner,
          repo: githubRepo,
          releaseType: 'release',
        },
      ],
    }
    : {}),
  npmRebuild: true,
  win: {
    signAndEditExecutable: !isWindowsDomainEnvironment,
    icon: 'logo.png',
  },
  mac: {
    target: ['zip'],
  },
  linux: {
    target: ['AppImage'],
  },
  files: [
    'dist/main/**/*',
    'dist/preload/**/*',
    'dist/render/**/*',
    'node_modules/**/*',
    'node_modules/.pnpm/**/*',
  ],
}

module.exports = config
