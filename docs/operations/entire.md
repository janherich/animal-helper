# Entire checkpoint workflow

Status: **enabled**

Animal Helper uses [Entire](https://entire.io) to connect AI-assisted commits to
the prompts, tool activity, and decisions that produced them.

## Storage and privacy boundary

The source repository is public, but Entire checkpoint history is stored in the
separate private GitHub repository
[`janherich/animal-helper-checkpoints`](https://github.com/janherich/animal-helper-checkpoints).
The shared `.entire/settings.json` tells Entire and Entire.io where to find it.

Project settings:

- use the `git-refs` checkpoint backend;
- automatically sync checkpoints on a normal Git push;
- disable Entire CLI telemetry;
- enable email and telephone-number PII redaction;
- leave address redaction disabled because Entire's built-in detector targets US
  street-address formats and is unsuitable for Slovak data.

Entire's secret and PII redaction is a best-effort safety net, not a security
boundary. Never put production case data, reporter information, capabilities,
credentials, private media, database exports, or administrator sessions into an
AI-agent prompt or working tree. The rules in
[security requirements](../security/security-requirements.md) still apply.

Do not manually push Entire shadow refs. They can contain raw working-tree
snapshots. Only the CLI-managed checkpoint refs may be sent to the private
checkpoint repository.

## Initial setup on a developer machine

Install the stable CLI on macOS:

```sh
brew tap entireio/tap
brew trust --cask entireio/tap/entire
brew install --cask entire
entire version
```

From this repository:

```sh
entire enable -y --agent codex --telemetry=false
entire status --detailed
entire doctor
```

Codex independently requires explicit trust for project hooks. Start Codex, open
`/hooks`, inspect the handlers sourced from `.codex/hooks.json`, and trust them.
Codex records trust for the exact hook hash; repeat the review after a
legitimate hook update.

A contributor also needs GitHub access to the private checkpoint repository.
Sign in to Entire.io with GitHub and grant the Entire GitHub App access to both
the public source repository and private checkpoint repository.

## Daily use

Run the coding agent normally from the repository root. Commit at a meaningful,
reviewable stopping point:

```sh
entire status
git status
git commit
git push
```

Entire links eligible commits to checkpoints and synchronises checkpoint refs
during push without adding a checkpoint branch to the source repository.

Useful diagnostics:

```sh
entire status --detailed
entire checkpoint list
entire doctor
entire doctor logs
```

Before granting a new person access to checkpoint history, remember that it may
contain redacted development transcripts and tool activity beyond what appears
in the source diff.

## Repository transfer

When the project moves to an organisation:

1. transfer or recreate the private checkpoint repository under the same owner
   as the source repository;
2. update `strategy_options.checkpoint_remote` in `.entire/settings.json`;
3. grant the Entire GitHub App access to both repositories;
4. run `entire status --detailed` and `entire doctor`;
5. create and review a synthetic checkpoint before normal development resumes.
