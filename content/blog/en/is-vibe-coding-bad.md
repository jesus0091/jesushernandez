---
title: "Is vibe coding bad? A developer's take after shipping Ristario to production"
slug: is-vibe-coding-bad
description: "A developer's take: vibe coding isn't bad, skipping the decisions is. Where AI failed on Ristario, what I rewrote, and how I use it now."
date: 2026-10-22
updated: 2026-10-22
keywords:
  - is vibe coding bad
  - vibe coded app to production
  - vibe coding in production
  - limits of vibe coding
  - ai-built app
  - next.js
pillar: ai-to-production
relatedWork: ristario
alternateSlug: vibe-coding-en-produccion
---

# Is vibe coding bad? A developer's take after shipping Ristario to production

I'm a developer and product designer. I use AI every day, as a tool inside my own engineering process, but I don't vibe code anything that goes to production. This post explains why.

**Short answer: no. Vibe coding is bad when it replaces the decisions a product needs, and useful when it speeds up the work after those decisions are made.** The code is rarely what decides whether something survives production. The decisions around the code do: what pages exist, who reads them, on what device, what the data looks like, and what "done" means.

I learned this shipping [Ristario](/works/ristario), a free QR menu for restaurants in Venezuela. Prices there change every day, in two currencies, so the product shows prices in bolívares and dollars at the BCV rate, takes orders through WhatsApp, and lets owners edit everything from a phone. I designed the brand, the UI system and every visual asset, then wrote it in Next.js and launched it. One person, no handoff, and not full time: I built it in the hours I had free. AI wrote part of the code; the architecture, the data model and the final review were mine.

Here are the facts before the argument:

| What | Number |
|---|---|
| Pages in production | 41, all built ahead of time from one set of components |
| City pages | 18, from Caracas and Maracaibo to Mérida and Los Teques |
| Business-type pages | 12 (areperas, bakeries, food trucks, pizzerias, cafés and more) |
| Lighthouse, live home page (October 2026) | 95 performance, 100 SEO |
| AI tools used as assistants | Cursor, ChatGPT and Claude |
| Where AI failed most | UI design and the data layer |

## What do I mean by "vibe coding"?

I use the term the way most people do now: you describe what you want in plain language, an AI model writes the code, and you judge the result mostly by running it and looking at it, not by reading every line. That's a fair way to build a prototype. You find out fast whether an idea holds up on a screen.

The trouble starts when the same loop is used for things you can't judge by looking at the screen: a page Google can't index, a layout that shifts while it loads, a database that quietly grows a second table for the same thing. None of those show up in a demo, and all of them show up in production.

So when someone asks me "is vibe coding bad?", I hear a different question: *is it safe to let the AI make the decisions?* For production, my answer is no.

## Is vibe coding bad for production apps?

It depends on who owns the decisions. Developers are still skeptical of the output: in Stack Overflow's 2025 survey, **46% of developers said they distrust the accuracy of AI tools, against 33% who trust it** ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai)). I think that distrust is healthy, but it aims at the wrong target. The accuracy of a single function matters less than whether anyone decided what the function was for.

On Ristario, the decisions that made the product work were not code decisions:

- **A page for every search.** A restaurant owner searches for a QR menu in their city, or for their kind of business. So the site has one page per city and one per business type, each written for that search, generated from data instead of copied by hand.
- **The phone comes first.** The menu is read on a phone at the table, and the owner edits it on a phone too. Every screen was designed from the phone outward, and the same content is reordered for tablet and desktop instead of shrunk.
- **Two currencies, one rate.** Showing prices in bolívares and dollars at the BCV rate is the whole reason the product exists. It's a product rule, not a feature request a model can guess.
- **One orange.** Warm paper, ink and a single orange that marks every action. A design system with fewer choices is easier to keep consistent, whoever writes the code.

An AI model can write the code for 41 pages quickly. It can't tell you that you need 41 pages and not 4, or why each one should exist. That part is product work, and it's the part I'd never hand off.

## Which AI tools do I use, and what don't I delegate?

Over the project I worked with Cursor, ChatGPT and Claude. I treat them the way I treat any other dev tool: each one is good at a specific job, and none of them owns the project.

What I delegate: boilerplate, repetitive components once the pattern exists, first drafts of queries, refactors I've already planned, and a second pair of eyes on code I wrote. What I don't delegate: the architecture, the data model, the design system, and the decision of whether a change is ready to ship.

Using more than one tool also taught me that **the context is yours, not the tool's.** A new tool knows nothing about the decisions the code was written inside: the design system, the naming, how the data is shaped. If those decisions only live in old chat threads, every new session starts by guessing them again. The more of the plan I had written down, the less it mattered which model was reading it.

## Where did AI fail on Ristario?

Two places, and they're the two I'd warn anyone about.

### The UI: generic, and easy to spot

AI-generated UI still looks like AI-generated UI. It reaches for the same rounded cards, the same gradients, the same spacing and the same safe layouts, and anyone who has seen a few of these products can tell where the screen came from. For a product whose whole pitch is "this looks like *your* restaurant, not a template", that's a real problem.

So the UI is the part I rewrote the most. I designed the brand and the UI system in Figma before writing code (one type family, Inter, from Regular to ExtraBold; one accent color; a small set of surfaces), and used that as the reference every component had to match. AI was useful for wiring a component up once I knew exactly what it should look like. It wasn't useful for deciding what it should look like.

### The data: tables and queries it had already written

The second failure was quieter and more dangerous. When I asked for a new feature that touched the database, the AI often didn't know, or didn't check, what already existed. It would create a table that duplicated one I already had, or write a new query for data an existing query already returned.

In a demo that's invisible: the feature works. In production it means two sources of truth for the same thing, data that drifts apart, and a schema that gets harder to change every week. I ended up treating every database change as something to review line by line, never as something to accept because the screen looked right.

| Area | What AI did well | What I had to rewrite or decide myself |
|---|---|---|
| UI | Turning an already-designed component into working code | The design itself. Generic AI layouts were replaced with the Figma system: one typeface, one orange, fewer surfaces |
| Data layer | Writing queries and boilerplate fast | Duplicated tables and repeated queries. Every schema change had to be checked against what already existed |
| Page structure | Filling in pages once the pattern existed | The strategy: one page per city and per business type, generated from data |
| Product rules | Implementing a rule once it was stated | The rules themselves, like two currencies at the BCV rate |

The pattern: **AI was strong wherever the answer was already decided, and weak wherever it had to decide.** Design and data structure are both decisions, so that's where it failed.

## Why does the part AI can't do matter most?

Because production is where the cost of a wrong decision compounds. A wrong function costs you an afternoon. A wrong structure costs you every page, and every row, built on top of it.

Take the page structure. Ristario's search strategy rests on 18 city pages and 12 business-type pages. If those had been written as 30 separate files, every change to the layout would mean 30 edits, and sooner or later one of them would drift. Generating them from one set of components and a list of cities and businesses means a fix lands everywhere at once. That's a decision about data, made before anyone writes the code. Once it's made, AI is good at filling it in. The duplicated tables are the same lesson from the other side: when nobody owns the shape of the data, the AI invents a new one each time.

My rule of thumb: **let AI write the code, not the plan.** The more specific the plan, the better the generated code, and the easier it is to spot when the code is wrong.

## What breaks when a vibe-coded app goes to production?

On Ristario, the gaps were almost never in the parts the demo shows. They were in the parts nobody looks at in a demo. Before Ristario went live, every page went through the same checks:

- **Phone, tablet and desktop.** Every page, not just the home page.
- **Contrast and reading sizes.** The menu is read at a table, often in bad light.
- **Performance and layout shift.** Nobody waits at a table for a slow page, and Google favours sites that open quickly.
- **The data.** No duplicated tables, no second query for data that already has one.
- **SEO.** A generated `sitemap.xml` with all 41 pages, referenced from `robots.txt`; JSON-LD for the organization, the website and the app; Open Graph and Twitter cards with a generated image, and the language set to `es-VE`.
- **Analytics from day one,** so launch is the start of measuring, not the end of the project.

None of those items are hard. They're just invisible from inside a chat window.

If you have an app built with Lovable, v0, Bolt or Cursor that works in the demo but not yet in production, that list is where I'd start. It's also most of what I do when [I take over an AI-built app](/services).

## What would I do differently?

**Write the design system down before the first prompt.** I'd still design in Figma first, but I'd also put the rules (typeface, color, spacing, which components exist) in a file the AI reads at the start of every session. Generic UI is what you get when the model has nothing specific to match.

**Give the AI the database schema, and review every change to it.** Most of the duplicated tables came from the model not seeing what already existed. Putting the current schema in front of it, and reading every migration before accepting it, would have caught them earlier.

**Keep the project's context outside the tool.** Working across Cursor, ChatGPT and Claude meant re-explaining the project more than once. A short written brief of the decisions already made would have saved that time.

## So, should you vibe code your next product?

For a prototype, yes. It's the fastest way I know to find out whether an idea works on a screen. For production, use AI to write code inside decisions someone has already made: the structure, the design system, the data model, the checks. Keep the decisions with a developer who answers for the result.

If you already have an app built with AI that works in the demo but isn't ready for real users, that's the gap I work on: reviewing the code, fixing the data model, replacing the generic UI and taking it to production. [Here's how I work](/services). The [full Ristario case study](/works/ristario) has the brand, the screens and the stack.

## FAQ

### Is vibe coding bad?

No. It's a fast way to build prototypes. It becomes a problem when AI makes the product decisions, like structure, design system, data model and quality checks, that a person should own. Use it to write code, not to decide what to build.

### Can a vibe-coded app go to production?

Yes, if someone reviews it against production checks: every screen size, contrast, performance and layout shift, the database schema, SEO metadata, analytics, and authentication for apps with users. Most AI-built apps fail on what the demo never shows, not on what it does.

### What does AI-generated code get wrong most often?

In my experience, two things. The UI comes out generic and recognizably AI-made, and the data layer drifts: the AI creates tables that already exist or repeats queries it already wrote. Both happen because the AI is deciding something nobody decided for it.

### Is AI-written code slower?

It doesn't have to be. Ristario's live home page scores 95 on Lighthouse performance and 100 on SEO. Speed depends on the decisions behind the code (static pages, image handling, avoiding layout shift) more than on who typed it.

### Which AI tool is best for vibe coding?

I used Cursor, ChatGPT and Claude as assistants on the same project, and the tool mattered less than the context I gave it. A written design system and an up-to-date database schema improve the output of any of them.
