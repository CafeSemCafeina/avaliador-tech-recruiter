SourceCard — an evidence-source input on the candidate screen (resume, LinkedIn export, GitHub, portfolio, notes). Shows required/optional and flips to a green "provided" state when `filled`.

```jsx
<SourceCard icon={icon} title="Resume" description="PDF or pasted text" required filled meta="resume.pdf · 184 KB" action={<Button size="sm" variant="ghost">Replace</Button>}>
  <Textarea rows={4} placeholder="…or paste resume text" />
</SourceCard>
```
