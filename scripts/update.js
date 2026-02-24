import fetch from "node-fetch"
import fs from "node:fs/promises"
import path from "node:path"

const importMeta = import.meta
const scriptsDir = path.dirname(importMeta.url.replace("file://", ""))
const baseDir = path.dirname(scriptsDir)

const conf = {
  repo: {
    base: "b0o/b0o",
    branch: "main",
  },
  imgDir: "assets",
  api: "https://github-readme-stats-eight-topaz-65.vercel.app/api",
  styles: {
    light: {
      bg_color: "ffffff",
      border_color: "d0d7de",
    },
    dark: {
      title_color: "58a6ff",
      text_color: "adbac7",
      bg_color: "00000000",
      border_color: "444c56",
    },
  },
}

const data = [
  {
    kind: "section",
    title: "Neovim Projects",
    cards: [
      {
        kind: "repo",
        user: "b0o",
        repo: "SchemaStore.nvim",
        description: "JSON Schemas for Neovim",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "incline.nvim",
        description: "Floating statuslines for Neovim",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "blender.nvim",
        description: "Develop Blender Add-ons with Neovim",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "lavi",
        description: "A soft and sweet colorscheme for Neovim & more",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "nvim-tree-preview.lua",
        description: "Floating preview windows for nvim-tree",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "nvim-conf",
        description: "Maddison's Neovim configuration!",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "tree-sitter-cython",
        description: "Cython grammar for tree-sitter",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "Mulberry",
        description: "Single-file Lua BDD library for testing Neovim plugins",
      },
    ],
  },
  {
    kind: "section",
    title: "Rust Projects",
    cards: [
      {
        kind: "repo",
        user: "b0o",
        repo: "zjstatus-hints",
        description: "A zellij plugin adding context-aware key binding hints for zjstatus.",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "zellij-tools",
        description: "A Zellij plugin that adds a few handy utilities.",
      },
    ],
  },
  {
    kind: "section",
    title: "Linux Projects",
    cards: [
      {
        kind: "repo",
        user: "b0o",
        repo: "dotfiles",
        description: "Maddison's dotfiles",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "swaynagmode",
        description: "swaynag wrapper for the love of keybindings",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "snag",
        description: "snag screenshots and screencasts in Sway",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "tmux-autoreload",
        description: "Automatically reload your tmux config file on change",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "updoot",
        description: "Unify the update process for your entire system",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "arch-lwc",
        description: "Create & run lightweight Arch Linux containers",
      },
    ],
  },
  {
    kind: "section",
    title: "Browser Projects",
    cards: [
      {
        kind: "repo",
        user: "b0o",
        repo: "surfingkeys-conf",
        description: "A SurfingKeys config which adds 180+ key mappings and 50+ search engines",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "aws-favicons-webextension",
        description:
          "Tired of all your AWS browser tabs having the same orange cube favicon? This WebExtension fixes that.",
      },
    ],
  },
  {
    kind: "section",
    title: "Other Projects",
    cards: [
      {
        kind: "repo",
        user: "b0o",
        repo: "awesome-by-example",
        description: "A curated list of example-based learning resources",
      },
      {
        kind: "repo",
        user: "b0o",
        repo: "starred",
        description: "Maddison's starred repos, updated daily!",
      },
    ],
  },
  { kind: "separator" },
  {
    kind: "section",
    cards: [
      {
        kind: "user",
        user: "b0o",
        description: "Maddison Hellstrom's GitHub Stats",
      },
    ],
  },
]

const imgCache = new Map()

function renderCachedImage({ key, url, alt, fragment }) {
  imgCache.set(key, url)
  const cacheUrl = `https://raw.githubusercontent.com/${conf.repo.base}/${conf.repo.branch}/${conf.imgDir}/${key}`
  return `<img src="${cacheUrl}${fragment ? "#" + fragment : ""}" alt="${alt}">`
}

function renderRepoCard({ user, repo, description, style }) {
  const search = new URLSearchParams({
    username: user,
    repo,
    show_owner: true,
    ...conf.styles[style],
  })
  return [
    `<a href="https://github.com/${user}/${repo}#gh-${style}-mode-only">`,
    renderCachedImage({
      key: `${user}-${repo}-${style}.svg`,
      url: `${conf.api}/pin/?${search}`,
      alt: `${repo}: ${description}`,
      fragment: `gh-${style}-mode-only`,
    }),
    `</a>`,
  ].join("")
}

function renderUserCardStyle({ user, description, style }) {
  const search = new URLSearchParams({
    username: user,
    show_icons: true,
    include_all_commits: false,
    ...conf.styles[style],
  })
  return [
    `<a href="https://github.com/${user}#gh-${style}-mode-only">`,
    renderCachedImage({
      key: `${user}-${style}.svg`,
      url: `${conf.api}/?${search}`,
      alt: `${user}: ${description}`,
      fragment: `gh-${style}-mode-only`,
    }),
    `</a>`,
  ].join("")
}

function renderCardStyles(render, { user, repo, description }) {
  return [
    render({ user, repo, description, style: "dark" }),
    render({ user, repo, description, style: "light" }),
  ].join("\n")
}

function renderSection({ title, cards }) {
  const rows = cards.reduce((rows, card, i) => {
    if (i % 2 === 0) {
      rows.push([])
    }
    rows[rows.length - 1].push(renderNode(card))
    return rows
  }, [])
  const rowDivs = rows.map((row) => {
    return [
      `<div float="left">`,
      `${row.join("\n&nbsp;\n")}`,
      `&nbsp;`,
      `</div>`,
    ].join("\n")
  })
  return [
    title ? `### ${title}\n\n` : "",
    ...rowDivs,
    "\n",
  ].join("")
}

function renderNode({ kind, ...rest }) {
  switch (kind) {
    case "repo":
      return renderCardStyles(renderRepoCard, rest)
    case "user":
      return renderCardStyles(renderUserCardStyle, rest)
    case "separator":
      return "---\n"
    case "section":
      return renderSection(rest)
    default:
      throw new Error(`Unknown card kind: ${kind}`)
  }
}

const content = data.map(renderNode).join("\n")

for (const [key, url] of imgCache.entries()) {
  const imgPath = path.join(baseDir, conf.imgDir, key)
  const imgDir = path.dirname(imgPath)
  await fs.mkdir(imgDir, { recursive: true })
  console.log(`Fetching ${url}`)
  const img = await fetch(url)
  const buffer = await img.arrayBuffer()
  console.log(`Writing ${imgPath}`)
  await fs.writeFile(imgPath, Buffer.from(buffer))
}

console.log(`Writing README.md`)
await fs.writeFile(path.join(baseDir, "README.md"), content)
