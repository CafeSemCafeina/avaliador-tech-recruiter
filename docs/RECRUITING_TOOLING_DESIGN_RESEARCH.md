# Recruiting Tooling and UI Research

Date: 2026-06-20  
Purpose: understand common recruiter tooling, interaction patterns, and visual conventions so the MVP feels familiar to recruiters while staying focused on evidence-first technical screening.

## 1. Summary

Recruiting tools tend to organize work around a few repeated objects:

- jobs;
- candidates;
- pipelines;
- profiles;
- scorecards/feedback;
- messages;
- tasks/next actions;
- reports.

The best fit for this MVP is not to mimic a full ATS. The product should feel like a focused recruiter analyst workspace: one role, one candidate, clear evidence, clear uncertainty, and interview-ready questions.

Design direction:

- dense enough for recruiter workflows;
- clear enough for non-technical talent teams;
- evidence-first;
- no final match score;
- strong distinction between evidence, inference, and validation questions;
- familiar ATS-like patterns such as candidate profile panels, pipeline/progress stages, badges, notes, and report summaries.

## 2. Tools likely relevant to the target workflow

Based on public research, the recruiting stack around this kind of workflow includes:

### Loxo

Role: ATS, CRM, sourcing, outreach, candidate profiles, pipeline management, reports, hiring manager collaboration, and native AI agents.

Relevant patterns:

- candidate profiles with notes and custom fields;
- pipeline stages;
- dashboard views of jobs/candidates;
- candidate status reports;
- hiring manager sharing;
- candidate summaries;
- outreach history.

Implication for this MVP:

Use familiar recruiter primitives:

- candidate profile summary;
- evidence notes;
- stage/progress timeline;
- report sections that could be shared with a hiring manager.

Do not build:

- full ATS;
- full CRM;
- outreach/campaigns;
- sourcing database.

### LinkedIn

Role: public professional profile and sourcing context.

Relevant patterns:

- profile header;
- experience timeline;
- skills/certifications;
- activity/posts;
- company and education signals.

Implication for this MVP:

Treat LinkedIn as candidate-provided public context, not ground truth. Extract timeline and signals, but use conservative language.

### HackerRank

Role: technical assessment platform for coding tests and interviews.

Relevant patterns:

- assessment status;
- candidate authenticity/proctoring indicators;
- test results;
- coding interview environment;
- automatic tests and score-like results.

Implication for this MVP:

Avoid competing with coding assessment platforms. This product should prepare the recruiter for what to validate, not replace HackerRank-style assessments.

### Deel Talent / global hiring context

Role: partner/global talent network context.

Relevant patterns:

- global candidate pools;
- remote hiring;
- compensation/location constraints;
- partner-facing quality and speed.

Implication for this MVP:

The report should be globally readable, in English, with concise summaries and clean export.

### Internal profiler / AI screener style tools

Role: behavioral/persona screening and AI-assisted qualitative review.

Relevant patterns:

- recruiter-controlled interpretation;
- "what to ask next";
- strengths and missing context;
- human review rather than cold automation.

Implication for this MVP:

The product should make uncertainty productive: every uncertain claim becomes an interview focus.

## 3. Common HR/recruiting product categories

### ATS

Examples: Loxo, Greenhouse, Lever, Ashby, Workable.

Common UI patterns:

- job pipeline;
- candidate cards;
- drag-and-drop stages;
- profile sidebar;
- stage history;
- interview feedback;
- scorecards;
- next actions;
- team comments;
- email/activity timeline.

What to borrow:

- stage/progress timeline;
- candidate profile framing;
- clear sections for notes and next actions;
- recruiter/hiring manager summaries.

What not to borrow:

- dense CRM navigation;
- multi-candidate pipeline;
- mass actions;
- email outreach;
- scheduling.

### Technical assessment tools

Examples: HackerRank, CodeSignal, CoderPad.

Common UI patterns:

- assessment status;
- question/task list;
- language/runtime metadata;
- test results;
- proctoring/authenticity flags;
- interview playback or notes;
- candidate score/result.

What to borrow:

- technical evidence clarity;
- per-skill validation focus;
- interview question readiness.

What not to borrow:

- final scores;
- pass/fail verdicts;
- coding IDE UI.

### HRIS/global hiring tools

Examples: Deel, Workday, BambooHR, Rippling.

Common UI patterns:

- compliance-first language;
- clean dashboards;
- global location/payroll context;
- employee/contractor profile;
- status banners;
- document checklist;
- action required states.

What to borrow:

- calm operational design;
- clear status and warning banners;
- privacy/data handling copy.

What not to borrow:

- payroll/compliance complexity;
- employee lifecycle modules.

## 4. Design-system patterns recruiters expect

### Layout

Recruiting tools usually favor operational layouts:

- left navigation or top-level workspace navigation;
- main content area;
- side panel for profile/context;
- timeline or activity feed;
- action buttons near candidate/job state;
- sticky summary or next action.

For this MVP, a simpler single-page wizard is enough:

1. job input;
2. candidate input;
3. analysis progress;
4. report.

The report screen can borrow ATS profile conventions:

- left or top summary;
- badges;
- evidence matrix;
- STAR questions;
- methodology and limitations.

### Visual density

Recruiters work quickly across many candidates. The UI should avoid marketing-page spacing. It should be:

- scannable;
- sectioned;
- compact but not cramped;
- text-first;
- easy to copy/export.

### Tables and matrices

Recruiting tools often use tables, stage lists, scorecards, and candidate grids.

For this MVP:

- use a 2x2 evidence matrix;
- each item should include source, rationale, and interview focus;
- avoid overly decorative cards;
- make evidence easy to scan.

### Badges and status chips

Common status chips:

- New;
- Screen;
- Interview;
- Offer;
- Hired;
- Rejected;
- Needs review;
- Missing info.

For this MVP:

- use qualitative badges;
- avoid score-like styling;
- use neutral wording such as "Needs validation" instead of "Failed".

### Candidate profile patterns

Common candidate profile contents:

- headline;
- location;
- links;
- resume;
- activity;
- comments;
- applications;
- interview feedback;
- attachments.

For this MVP:

- candidate summary;
- source links;
- evidence sources;
- technical claims;
- public proof;
- limitations.

### Activity timeline

Common pattern:

- application received;
- resume reviewed;
- screening scheduled;
- feedback submitted;
- status changed.

For this MVP:

- analysis event timeline;
- stage durations;
- parsing/GitHub/portfolio/report steps;
- errors and warnings.

This makes the agent workflow visible in a familiar recruiter format.

## 5. Tool-specific design notes

### Loxo-inspired patterns

Loxo positions itself as an integrated recruiting workflow across ATS, CRM, sourcing, outreach, reports, hiring manager collaboration, and AI agents.

Useful patterns for this MVP:

- candidate profile plus notes;
- dashboard/report view;
- candidate submittal summary;
- client/hiring manager friendly report;
- pipeline/status framing.

Avoid:

- building a pipeline board;
- duplicating CRM/outreach functionality;
- pretending to integrate with Loxo without API access.

### Greenhouse-inspired patterns

Greenhouse emphasizes structured hiring, candidate pipeline visibility, candidate profiles, accessibility, and scorecards.

Useful patterns:

- structured scorecard concept, but adapted without final score;
- accessible candidate profile layout;
- interview feedback readiness;
- stage visibility.

Avoid:

- full scorecard scoring;
- overly large UI that hides dense information.

### Lever-inspired patterns

Lever combines ATS and CRM and is known for pipeline visibility and collaboration.

Useful patterns:

- candidate-centric profile;
- team collaboration/feedback feel;
- pipeline stage clarity;
- simple navigation.

Avoid:

- multi-candidate operations;
- email/mass messaging.

### Ashby-inspired patterns

Ashby is an all-in-one recruiting platform with ATS, CRM, scheduling, analytics, automation, and AI.

Useful patterns:

- clean analytics/reporting;
- alerts and next actions;
- clear pipeline state;
- AI embedded into workflow rather than as a separate chatbot.

Avoid:

- analytics dashboard complexity;
- organization-wide pipeline reports.

### Workable-inspired patterns

Workable candidate profiles expose resume/application details and recruiter actions like comments, emails, interviews, and moving candidates through stages.

Useful patterns:

- candidate profile as action surface;
- comments/notes style sections;
- next action clarity.

Avoid:

- full hiring workflow management.

### HackerRank-inspired patterns

HackerRank is assessment-oriented and uses status/results around technical tests and interviews.

Useful patterns:

- technical validation focus;
- clear test/interview readiness;
- authenticity/proctoring awareness as a concept.

Avoid:

- final assessment score;
- coding challenge UI;
- pass/fail framing.

## 6. Recommended UI structure for this MVP

### Screen 1 - Job Input

Recruiter goal: define the role baseline.

Sections:

- role description;
- seniority;
- years of experience;
- tech stack tags;
- up to 3 primary stacks;
- optional recruiter notes.

Design pattern:

- form with tags;
- short guidance;
- clear primary action.

### Screen 2 - Candidate Input

Recruiter goal: provide evidence sources.

Sections:

- resume upload/paste;
- LinkedIn export upload/paste;
- GitHub URL;
- portfolio URL;
- privacy note.

Design pattern:

- source cards;
- upload states;
- warnings for unsupported inputs;
- no login/cookie language.

### Screen 3 - Analysis Progress

Recruiter goal: see the analysis working and understand what is happening.

Sections:

- live timeline;
- current step;
- stage durations;
- warnings;
- source status.

Design pattern:

- activity timeline;
- status chips;
- progress list;
- log-like but human-readable copy.

### Screen 4 - Report

Recruiter goal: decide what to validate in screening.

Sections:

- executive summary;
- qualitative badges;
- evidence matrix;
- STAR questions;
- recruiter summary;
- hiring manager summary;
- methodology;
- limitations;
- export Markdown.

Design pattern:

- profile/report hybrid;
- matrix cards;
- copy-friendly question blocks;
- methodology accordion or section.

## 7. Visual direction

The UI should not look like:

- a consumer AI chat app;
- a generic SaaS landing page;
- a sales CRM;
- a gamified scoring dashboard.

It should feel like:

- recruiting operations;
- analyst workspace;
- evidence review;
- structured screening preparation.

Recommended visual language:

- neutral professional palette;
- subtle status colors;
- accessible contrast;
- compact forms;
- clear typography;
- light cards;
- strong section labels;
- restrained badges;
- no final score hero.

## 8. Copywriting conventions

Use wording that preserves uncertainty:

Prefer:

- "Needs validation"
- "Public evidence suggests"
- "Confirmed by"
- "Not publicly evidenced"
- "Interview focus"
- "Evidence source"
- "Limitations"

Avoid:

- "Failed"
- "Bad candidate"
- "No experience"
- "Unqualified"
- "Match score"
- "Hire / reject"

## 9. Implications for Claude Design prompts

Claude Design should be prompted to create four separate screens:

1. job input;
2. candidate input;
3. analysis progress;
4. report.

Prompt constraints:

- recruiter-facing B2B product;
- evidence-first technical screening;
- no final score;
- no pipeline board;
- no marketing hero;
- compact operational layout;
- HTML/CSS output;
- accessible contrast;
- report with 2x2 evidence matrix;
- STAR questions section;
- methodology/limitations section.

## 10. Sources

- Loxo platform overview: https://www.loxo.co/
- Loxo pipeline dashboard video: https://www.loxo.co/video/quickly-view-job-pipelines-in-a-dashboard-view
- Loxo candidate profile article: https://www.loxo.co/blog/the-candidate-profile-your-strategic-weapon-in-modern-recruiting
- Loxo hiring pipeline sharing video: https://www.loxo.co/video/share-hiring-pipeline-in-a-few-clicks
- Greenhouse recruiting platform: https://www.greenhouse.com/
- Greenhouse visual candidate pipeline: https://support.greenhouse.io/hc/en-us/articles/4874727408795-Visual-Candidate-Pipeline
- Greenhouse candidate profile redesign: https://www.greenhouse.com/blog/why-we-redesigned-the-candidate-profile-in-greenhouse
- Greenhouse scorecard article: https://www.greenhouse.com/blog/the-hiring-mindset-series-how-to-implement-candidate-scorecard-adoption
- Lever platform overview: https://www.lever.co/
- Ashby platform overview: https://www.ashbyhq.com/
- Ashby growth/product page: https://www.ashbyhq.com/growth
- Ashby candidate profile docs: https://docs.ashbyhq.com/candidate-profile
- Workable overview: https://www.workable.com/
- Workable candidate profile overview: https://help.workable.com/hc/en-us/articles/115012857047-Candidate-profile-in-pipeline-view-overview
- Workable recruiting pipeline customization: https://help.workable.com/hc/en-us/articles/115011967408-Customizing-the-recruiting-pipeline
- HackerRank for Work login/product entry: https://www.hackerrank.com/work/login
- HackerRank CodePair: https://www.hackerrank.com/work/codepair
- HackerRank glossary/proctoring: https://support.hackerrank.com/articles/3572240492-hackerrank-glossary

