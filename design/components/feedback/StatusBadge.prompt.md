StatusBadge — the qualitative status vocabulary of the analyzer. Use careful, uncertainty-preserving wording in the label; the tone sets a muted color (never alarming).

```jsx
<StatusBadge tone="confirmed">Confirmed by evidence</StatusBadge>
<StatusBadge tone="validate">Needs validation</StatusBadge>
<StatusBadge tone="gap">Not publicly evidenced</StatusBadge>
<StatusBadge tone="info">Running</StatusBadge>
```

Tones: `confirmed`, `validate`, `gap`, `uncertain`, `info`, `neutral`. Variants: `soft` (default), `outline`, `solid`.
