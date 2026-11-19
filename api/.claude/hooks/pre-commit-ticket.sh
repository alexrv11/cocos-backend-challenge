#!/bin/bash
# Pre-commit hook: ensures git commit messages include a ticket reference (T-XXX)

CMD=$(jq -r '.tool_input.command // ""')

# If not a git commit command, allow
if ! echo "$CMD" | grep -qE 'git\s+commit'; then
  exit 0
fi

# If commit message already includes a ticket reference, allow
if echo "$CMD" | grep -qE 'T-[0-9]+'; then
  exit 0
fi

# Block: missing ticket reference
cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message must include at least one ticket reference (T-XXX). Run 'gh issue list --state open' to find the related ticket(s) and include them in conventional commit format, e.g. feat(T-030): create order submission endpoint"}}
EOF
