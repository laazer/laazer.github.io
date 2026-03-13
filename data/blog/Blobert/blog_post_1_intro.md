![Caught Blogging](images/caughtblogging.jpeg)

# Blobert: A Completely Reasonable Use of My Free Time

Every engineer eventually reaches a point where they decide to do something wildly outside their area of expertise.

Some people learn woodworking.  
Some people start brewing beer.

I, apparently, decided to build a video game. (What is wrong with me?)

As a child, I remember a game my cousin had for his N64. It was the the absolute best time! Kirby 64: The Crystal Shards, you play as Kirby, a cute, pink, blob-like character who can absorb abilities from enemies and combine them to create new ones. It was a simple, but incredibly fun game that I could have played for hours on end. But I didn't and don't have N64. Right now the only way to legally play it is to buy the game on the Nintendo Switch Online service and pay the monthly fee + by the game. 

Now most people might value their time more than I do, and just buy the game. But I'm not most people. I make bad life choices. So I decided to build my own version of Kirby 64: The Crystal Shards. A better version. With blackjacks and hookers, jk. But I do want to bring back the magic of the original game.

## The Moment of Poor Judgment

Like many bad ideas, this one started with a simple thought:

“How hard could it be?”

Now to be clear, I’m a software engineer. I spend most of my days building backend services, debugging infrastructure issues, and occasionally arguing with python code.

Video games are… not that.

Video games involve physics engines, animation systems, cameras, rendering pipelines, sound design, asset pipelines, and a terrifying amount of math that game developers somehow just casually know.

Naturally, I decided this would be a good weekend project. Many weekends later, I'm still here.

## Enter: Blobert

The working title for this experiment is **Blobert**.

Blobert is a small, round, vaguely sentient blob whose primary life goals include:

- jumping
- rolling
- existing in colorful environments
- and occasionally defying physics in ways that will absolutely be bugs at first

Blobert isn’t trying to recreate Kirby. That would require actual competence.

But capturing some of that **lighthearted platforming chaos** feels like a good target.

## Choosing an Engine (or: How I Avoided Making My Own Physics Engine)

Step one in building a game is deciding what engine to use.

Step two is resisting the urge to just right this as a web app and use javascript. (That would way be way too easy.)

After a bit of research, I landed on **Godot**. It’s open source, lightweight, and most importantly it doesn’t immediately require me to understand the deeper mysteries of GPU rendering pipelines just to move a character two feet to the left.

Which feels like a reasonable starting point.

The current tech stack looks something like this:

- Engine: **Godot**
- Language: **GDScript**
- Experience level: **aggressively beginner**
- Confidence level: **we’ll see**

## Current Progress

Right now Blobert exists mostly as a concept and a folder structure.

But the immediate goals are pretty straightforward:

1. Make a blob
2. Make the blob move
3. Make the blob jump
4. Prevent the blob from launching itself into orbit

That last one feels like it will be the tricky part.

If everything goes well, the end result will be a small 2.5D platformer prototype where Blobert can bounce around a level and interact with the world.

If everything goes poorly, Blobert will still bounce around a level, just in increasingly chaotic and hilarious ways.

## Why Build This?

Mostly curiosity.

Game development sits at this weird intersection of engineering and art that most software engineers don’t get to touch very often. There are so many systems interacting with each other that even something simple like “jumping” becomes surprisingly complicated.

Also, it just sounds fun.

Blobert isn’t a startup idea, a side hustle, or a product roadmap.

Blobert is just an excuse to learn how games work.

## What This Blog Will Be

This blog is mostly going to be a running log of:

- things I tried
- things that broke
- things that worked
- and the occasional “why is the blob doing that” debugging session

Game development seems to involve a lot of moments where you change one number and suddenly the character can jump 400 feet into the air.

I’m looking forward to documenting those.

The other goal is to refine my skills working with AI tools. Refining the prompts, agents, and workflows I use to build this game. AI is a force multiplier, but can that force be applied without domain level expertise? Is having an understanding of software development enough to build a video game?

## Anyway

That’s Blobert.

Next step: make a blob.

What could possibly go wrong.

Here's the first concept image of Blobert (100% AI generated 😉).
<br><br>
<img src="images/Blobert/concept_image_1.png" alt="drawing" style="width:700px;"/>