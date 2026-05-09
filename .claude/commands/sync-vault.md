---
description: Back up project memory and documentation to the Obsidian Vault. Include package.json and other important metrics.
---
# Sync Vault Command

When the `/sync-vault` command is invoked, or the user requests to sync the vault, immediately run the sync script to guarantee that local intelligence is backed up to the external Obsidian Vault.

**Execution Script:**
```bash
# turbo-all
./scripts/sync-vault.sh
```

**Context Validation:**
- This command is safe to run anytime.
- Ensure you report to the user what files were synced (read the output of the script).
