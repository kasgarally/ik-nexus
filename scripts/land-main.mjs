/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Merge the current branch into main, push, and delete that branch
 *
 * Usage (repo root, on a feature branch with a clean tree):
 *   pnpm run land
 *   pnpm run land -- next-branch
 *   pnpm run land -- --dry-run
 *
 * Refuses to run on main or with uncommitted files. After a successful
 * land you are on main, or on next-branch if you passed a name.
 */
import { spawnSync } from 'node:child_process'

const MAIN_BRANCH = 'main'
const REMOTE = 'origin'

function printUsage() {
  console.log(`Usage:
  pnpm run land
  pnpm run land -- <next-branch>
  pnpm run land -- --dry-run
  pnpm run land -- --dry-run <next-branch>`)
}

function parseArgs(argv) {
  let dryRun = false
  let nextBranch = ''

  for (const argument of argv) {
    if (argument === '--help' || argument === '-h') {
      return { help: true }
    }
    if (argument === '--dry-run') {
      dryRun = true
      continue
    }
    if (argument.startsWith('-')) {
      throw new Error(`Unknown flag ${argument}`)
    }
    if (nextBranch) {
      throw new Error(`Unexpected extra argument ${argument}`)
    }
    nextBranch = argument
  }

  if (nextBranch) {
    assertSafeBranchName(nextBranch, 'next branch')
    if (nextBranch === MAIN_BRANCH) {
      throw new Error(`Next branch cannot be ${MAIN_BRANCH}`)
    }
  }

  return { help: false, dryRun, nextBranch }
}

function assertSafeBranchName(name, label) {
  if (!/^[A-Za-z0-9._/-]+$/.test(name) || name.startsWith('-') || name.includes('..')) {
    throw new Error(`${label} ${name} is not a safe git branch name`)
  }
}

function git(repoRoot, args, { capture = false, allowFail = false } = {}) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })

  if (result.error) {
    throw new Error(result.error.message)
  }
  if (!allowFail && result.status !== 0) {
    const detail = capture ? (result.stderr.trim() || result.stdout.trim()) : ''
    throw new Error(detail || `git ${args.join(' ')} failed`)
  }
  return result
}

function gitText(repoRoot, args, options = {}) {
  return (git(repoRoot, args, { ...options, capture: true }).stdout || '').trim()
}

function findRepoRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'Not inside a git repository')
  }
  return result.stdout.trim()
}

function requireCleanWorktree(repoRoot) {
  const porcelain = gitText(repoRoot, ['status', '--porcelain'])
  if (porcelain) {
    throw new Error('Working tree is not clean. Commit or stash first, then run land again.')
  }
}

function remoteBranchExists(repoRoot, branch) {
  const listing = gitText(repoRoot, ['ls-remote', '--heads', REMOTE, branch])
  return listing.length > 0
}

function isAncestor(repoRoot, commit, ofCommit) {
  const result = git(repoRoot, ['merge-base', '--is-ancestor', commit, ofCommit], {
    capture: true,
    allowFail: true,
  })
  return result.status === 0
}

function deleteLocalBranch(repoRoot, branch) {
  const deleted = git(repoRoot, ['branch', '-d', branch], { allowFail: true })
  if (deleted.status === 0) {
    return
  }

  // Git refuses -d when the branch is ahead of a stale origin/<branch>
  // even after those commits are on main. -D only after we know main has them.
  if (!isAncestor(repoRoot, branch, MAIN_BRANCH)) {
    throw new Error(`Local ${branch} is not fully merged into ${MAIN_BRANCH}`)
  }
  git(repoRoot, ['branch', '-D', branch])
}

function land({ dryRun, nextBranch }) {
  const repoRoot = findRepoRoot()
  const featureBranch = gitText(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD'])

  if (featureBranch === 'HEAD') {
    throw new Error('Detached HEAD. Check out a feature branch first.')
  }
  if (featureBranch === MAIN_BRANCH) {
    throw new Error(`Already on ${MAIN_BRANCH}. Land from a feature branch.`)
  }
  assertSafeBranchName(featureBranch, 'current branch')
  requireCleanWorktree(repoRoot)

  console.log(`Landing ${featureBranch} onto ${MAIN_BRANCH}`)
  if (nextBranch) {
    console.log(`Then creating ${nextBranch}`)
  }
  if (dryRun) {
    console.log('Dry run: no git writes')
    return
  }

  git(repoRoot, ['fetch', REMOTE, '--prune'])
  git(repoRoot, ['checkout', MAIN_BRANCH])
  try {
    git(repoRoot, ['pull', '--ff-only', REMOTE, MAIN_BRANCH])
    const merged = git(repoRoot, ['merge', '--ff-only', featureBranch], { allowFail: true })
    if (merged.status !== 0) {
      throw new Error(
        `${MAIN_BRANCH} and ${featureBranch} have diverged. Rebase ${featureBranch} onto ${MAIN_BRANCH}, then land again.`,
      )
    }
    git(repoRoot, ['push', REMOTE, MAIN_BRANCH])
  } catch (error) {
    git(repoRoot, ['checkout', featureBranch], { allowFail: true })
    throw error
  }

  if (remoteBranchExists(repoRoot, featureBranch)) {
    git(repoRoot, ['push', REMOTE, '--delete', featureBranch])
  } else {
    console.log(`No ${REMOTE}/${featureBranch} to delete`)
  }

  deleteLocalBranch(repoRoot, featureBranch)
  git(repoRoot, ['fetch', REMOTE, '--prune'])

  if (nextBranch) {
    git(repoRoot, ['checkout', '-b', nextBranch])
    console.log(`Landed ${featureBranch} onto ${MAIN_BRANCH}. Now on ${nextBranch}.`)
    return
  }

  console.log(`Landed ${featureBranch} onto ${MAIN_BRANCH}. Now on ${MAIN_BRANCH}.`)
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printUsage()
    return
  }
  land(options)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
