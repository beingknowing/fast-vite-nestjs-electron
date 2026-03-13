import type { Configuration } from "electron-builder";

const DEFAULT_GITHUB_REPOSITORY = "cnjimbo/QuickTicket2Queue";

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
  const [owner = "cnjimbo", repo = "QuickTicket2Queue"] = rawRepository.split("/");
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
  appId: "com.beingknowing.quickticket2queue",
  productName: "Quick Ticket to Queue",
  asar: true,
  compression: "maximum",
  electronLanguages: ["en-US", "zh-CN"],
  directories: {
    output: "build",
  },
  ...getPublishConfig(),
  npmRebuild: true,
  win: {
    target: ["portable"],
    executableName: "quickticket2queue",
    signAndEditExecutable: !shouldDisableWindowsSigning,
    icon: "logo.png",
  },
  mac: {
    target: ["zip"],
    icon: "build/icons/icon-512.png",
    category: "public.app-category.productivity",
  },
  linux: {
    target: ["AppImage"],
    icon: "build/icons/icon-256.png",
    category: "Utility",
    maintainer: "cnjimbo",
  },
  files: [
    "dist/main/**/*",
    "dist/preload/**/*",
    "dist/render/**/*",
    "node_modules/**/*",
    "node_modules/.pnpm/**/*",
    "!**/*.map",
    "!**/*.md",
    "!**/*.markdown",
    "!**/{test,tests,__tests__,example,examples,docs,doc}/**",
    "!**/tsconfig*.json",
    "!**/*.d.ts",
    "!**/*.ts",
  ],
};

export default config;
