# Blobert Devlog #3: From 2D Roots to 3D Branches

Okay, so last time we talked about the *big* realization that Blobert needed a full 3D foundation. Now comes the fun part: actually building it!

I knew I didn't want to start completely from scratch. Luckily, Godot has a fantastic [official example project](https://github.com/godotengine/godot-demo-projects) that's built around a 3rd person character controller. It was *exactly* what I needed.

<img src="images/Blobert/post_3/demo_game.gif" alt="drawing" style="width:700px;"/>

---
## Copying is the Highest Form of Flattery (Right?)

I basically treated the example project as a template. I didn't just copy and paste (though there was *some* of that!), but used it as a starting point for understanding how to set up:

*   **A 3D scene:**  Setting up a basic environment.
*   **Character movement:** The example project has smooth walking, running, and jumping – a huge win.
*   **Input handling:**  How Godot handles keyboard/gamepad input in 3D.

It was a *massive* time saver.  Instead of figuring out all the low-level stuff, I could focus on making it *Blobert's* movement. I pointed Claude at the demo and had it do the heavy lifting. It rewrote my old 2D game into proper 3D. More impressively, the look and feel of Blobert was really smooth on the first try (okay, second try, but still).

---

## Adapting the Controller

The example project is for a 3rd person character, and Blobert's more of a 2.5D platformer. So I had to make some changes:

*   **Constrained Movement:**  I locked the character's Z-axis movement to keep things on a flat plane.
*   **Simplified Collision:**  Blobert doesn't need complex climbing or crouching (yet!).
*   **Camera Adjustments:** Tweaked the camera to get that "Kirby 64" perspective.

<img src="images/Blobert/post_3/movement.gif" alt="Blobert Constrained Movement GIF" style="width:700px;"/>

---

## Yoinking the Godot Demo Character

Instead of getting blocked on art (a classic trap), I pulled in a character from the Godot Engine demo project.
It gave me a solid starting point for the 3D character and animations. Since I lack 3D modeling skills, this was a huge help and time saver. Plus it was made for a much more interesting model to use as the enemy then just having a generic cube.

<img src="images/Blobert/post_3/3d_enemies.gif" alt="Blobert 3D Enemies GIF" style="width:700px;"/>

---

## Lobert from Blobert

At some point, Blobert needed to actually *do something*.

Enter: chunk throwing.

Since I can't completely steal Kirby's ingestion mechanic, I decided that the most thematic choice that made sense was to have Blobert throw chunks of himself at enemies.

The mechanic is simple:
- Blobert pulls off part of himself  
- Throws it forward  
- That chunk becomes a temporary object in the world  

Continuing on with keeping the 3D models simple, the chunks are just a simple sphere with a texture.

<img src="images/Blobert/post_3/lobbing.gif" alt="Blobert Lobbing Chunk GIF" style="width:700px;"/>

---

## The Sticking Point (blob?)

Unlike guns or bombs, chunks don't disappear after they hit their target. Instead, they stick to the enemy and become part of it. This meant that chunks need to be persistent in the world even after they were thrown.

Projectiles are a common mechanic in 3D games, so its a well understood and well defined mechanic. The perfect type of task thats perfect for an agent to handle. I pointed Claude at the chunk ticket and had it handle the implementation.

<img src="images/Blobert/post_3/sticking.gif" alt="Blobert Sticking to Enemy GIF" style="width:700px;"/>

PS: I still don't know what to call them. Chunks just don't feel right, yeah know?

---

## Thats a lot of tokens...

This wasn’t really a coding problem.

It was a **prompting problem**.

I know how to structure this kind of system:
- collections instead of individual variables  
- reusable components  
- clean separation of concerns  

But that was not explicit my agent workflow.

So without being explicit, I started getting patterns like:
- handling chunks individually, for example:
```gdscript
var chunk1 = preload("res://scenes/chunk.tscn")
var chunk2 = preload("res://scenes/chunk.tscn")
```
- logic tied to specific instances  
- solutions that worked… but didn’t scale  

Even though I only had two chunks, the *implementation* mattered more than the count.

Because the agent optimizes for:
> “solve the problem as described”

Not:
> “solve the problem in a way thats scalable and maintainable.”

That mismatch is where the token usage exploded:
- more corrections  
- more rewrites  
- more context to explain what I actually wanted 

Additionally, essentially a single script file contained the logic for the entire game (minus a few other files for the UI and level design). This made it difficult to reason about the code and made it difficult to scale. Agents ended up loading the entire file into its context window, which used up a lot of tokens to parse through.

Agents have to be directed to write code in a way thats scalable and maintainable for humans and AI alike. Well, maybe not humans much longer...

---

## What I Learned

**1. Agents do exactly what you ask not what you intend**  
If you don’t say “this should scale,” it won’t.

**2. You have to specify patterns, not just outcomes**  
“Make chunk throwing work” is not enough.  
“Implement this as a collection-based system that supports multiple instances” is.

**3. Even small systems deserve scalable structure**  
I only had two chunks.  
That was still enough to justify doing it the *right* way.

**4. Bad structure is expensive with agents**  
Not just technically, literally in tokens, time, and iteration cycles.

**5. You're not just coding, you’re directing**  
The job shifts from writing code to:
- defining constraints  
- enforcing patterns  
- correcting course early  

---

## Next Steps

Now that I have a solid base for movement, I'm tackling:

*   **Animation:**  Getting Blobert to look alive!
*   **Basic Level Integration:**  Putting the character into a simple level.
*   **Mutation System:**  Implementing the mutation system.

Wish me luck!