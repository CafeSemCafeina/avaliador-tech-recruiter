StageItem — a single row in the agentic analysis-progress timeline. Render a vertical list; mark the final one `last`.

```jsx
<StageItem state="completed" title="Parsing resume" duration="1.2s" />
<StageItem state="running" title="Analyzing GitHub repositories" detail="3 public repos" />
<StageItem state="pending" title="Generating STAR questions" last />
```

States: `pending`, `running`, `completed`, `warning`, `failed`.
