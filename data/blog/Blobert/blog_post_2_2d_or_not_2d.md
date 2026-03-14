# Blobert Devlog #2: The Time I Thought I Was Making a 3D Game

> 2D or not 2D? That was never the question.
> 
> — Me

When you start a project in a new engine, you expect to make mistakes.

Maybe a physics bug.  
Maybe a weird input issue.

What I did not expect was to spend a significant amount of time building a game that I *thought* was 3D… only to eventually realize it was entirely **2D**.

---

## The Vision (In Theory)

Blobert is inspired by platformers that look 2D but are actually built in 3D.

Games like Kirby 64: The Crystal Shards use what people often call a **2.5D** approach. The player mostly moves left and right like a traditional platformer, but the world itself is 3D.

<img src="images/Blobert/kirby64/k64_sucking.png" alt="drawing" style="width:700px;"/>

That opens the door for things like:

- enemies moving in and out of depth
- projectiles traveling in 3D space
- environments that curve or rotate

So naturally, when I started the project, I wanted to build Blobert using that same idea.

A mostly 2D experience, running on a **3D world**.

<img src="images/Blobert/post_2/gravity_falls.gif" alt="drawing" style="width:700px;"/>
<img src="images/Blobert/post_2/basic_blob.png" alt="drawing" style="width:700px;"/>

At this point I was convinced I was building a 3D game.

---

## The Part Where Everything Seemed Fine

At the time, I was still very new to Godot.

I opened the editor, created a scene, and started wiring up movement, physics, and tests. Everything looked exactly how I expected.

The camera was facing the player head-on, so the game appeared flat.

Perfect.

Exactly the 2.5D look I wanted.

Movement worked.  
Enemies worked.  
Tests worked.

Everything was progressing nicely.

---

## Wait… This Isn't 3D

Eventually I started digging deeper into how some things behaved under the hood.

And that’s when it hit me.

The project wasn't a 3D game with a camera pointed straight at it.

It was just a **2D game**.

Completely.

All the physics.  
All the nodes.  
All the scenes.

Every single thing I had built so far was using Godot’s **2D systems**.

```
SceneTree:
- Node2D
    - Player (CharacterBody2D)
        - Sprite2D
        - CollisionShape2D
    - Camera2D
```

The moment I noticed everything ended in **2D**.

What I thought was a camera trick was really just… the default way 2D scenes look.

---

## The Nuclear Option

At this point there were two options.

1. Slowly bend the architecture toward 3D  
2. Admit I built the wrong foundation and start over

I chose option two.

The commit message said it pretty plainly:

```bash
commit 686aeb8d835e854cd53d0ba52549a186463dd31e
Author: laazer 
Date:   ...
    refactor: remove all 2D legacy code, move test levels to scenes/levels/sandbox/
...
...and so on...
 tests/scripts/ui/test_input_hints_adversarial.gd   |  523 --------
 .../ui/test_wall_cling_visual_readability.gd       |  582 ---------
 ...st_wall_cling_visual_readability_adversarial.gd |  611 ---------
 ...wall_cling_visual_readability_mutation_specs.gd |  775 -----------
 47 files changed, 19 insertions(+), 16529 deletions(-)
```

And somewhere in the middle of the diff was roughly **16,000 lines removed**.

Sometimes the correct fix is the delete key.

The project basically rebooted itself.

---

## Why This Wasn't a Disaster

It hurt a little in the moment, but it was absolutely the right decision.

Blobert is now built around a proper **3D architecture**, with movement constrained to a 2.5D plane.

That makes it much easier to support the kinds of mechanics the game is meant to have.

And importantly, mistakes like this are a lot cheaper to fix early.

Deleting 16,000 lines of code sounds dramatic, but it's a lot better than discovering the same problem six months later.

---

## A Note to Future Me

The real lesson here isn't just about 2D versus 3D.

It's about learning a new engine.

When you're unfamiliar with a tool, it's very easy to assume you understand what you're looking at.

Sometimes the only way to discover that you don't is to build something, tear it down, and build it again properly.

Thankfully this happened early in Blobert's life.

And now the project is finally running on the architecture it was supposed to have from the start.