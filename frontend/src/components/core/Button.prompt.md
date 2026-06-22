Button — the primary action control; use `primary` (ink) for the single main action per screen, `accent` for emphasis, `secondary` for everything else.

```jsx
<Button variant="primary" size="md">Start analysis</Button>
<Button variant="secondary" leadingIcon={icon}>Add source</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Variants: `primary`, `accent`, `secondary`, `subtle`, `ghost`, `danger-quiet`. Sizes: `sm` (30px), `md` (36px), `lg` (44px). Supports `loading`, `disabled`, `fullWidth`, `leadingIcon`/`trailingIcon`.
