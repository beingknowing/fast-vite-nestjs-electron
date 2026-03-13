import type { Configuration } from "electron-builder";

const DEFAULT_GITHUB_REPOSITORY = "beingknowing/fast-vite-nestjs-electron";

function isWindowsDomainEnvironment(): boolean {
  return (
    process.platform === "win32" &&
    Boolean(
      process.env.USERDNSDOMAIN ||
        (process.env.USERDOMAIN && process.env.USERDOMAIN !== process.env.COMPUTERNAME),
    )
  );
}

function getGitHubRepository(): { owner: string; repo: string } {
  const rawRepository = process.env.GITHUB_REPOSITORY || DEFAULT_GITHUB_REPOSITORY;
  const [owner = "beingknowing", repo = "fast-vite-nestjs-electron"] = rawRepository.split("/");
  return { owner, repo };
}

function getPublishConfig(): Pick<Configuration, "publish"> | Record<string, never> {
  const wantsPublish = process.env.ELECTRON_BUILDER_PUBLISH === "always";
  const hasGitHubToken = Boolean(process.env.GH_TOKEN);

  if (wantsPublish && !hasGitHubToken) {
    console.warn(
      " ⚠️  ELECTRON_BUILDER_PUBLISH=always was set but GH_TOKEN is missing. Build will continue with publish disabled.",
    );
  }

  if (!wantsPublish || !hasGitHubToken) {
    return {};
  }

  const { owner, repo } = getGitHubRepository();

  return {
    publish: [
      {
        provider: "github",
        owner,
        repo,
        releaseType: "release",
      },
    ],
  };
}

const shouldDisableWindowsSigning = isWindowsDomainEnvironment();

if (shouldDisableWindowsSigning) {
  console.warn(
    " ⚠️  Detected Windows domain environment. Code signing will be disabled to avoid potential issues with domain policies.",
  );
}

const config: Configuration = {
  appId: "com.beingknowing.fast-vite-nestjs-electron",
  asar: true,
  directories: {
    output: "build",
  },
  ...getPublishConfig(),
  npmRebuild: true,
  win: {
    signAndEditExecutable: !shouldDisableWindowsSigning,
    icon: "logo.png",
  },
  mac: {
    target: ["zip"],
  },
  linux: {
    target: ["AppImage"],
  },
  files: [
    "dist/main/**/*",
    "dist/preload/**/*",
    "dist/render/**/*",
    "node_modules/**/*",
    "node_modules/.pnpm/**/*",
  ],
};

export default config;
