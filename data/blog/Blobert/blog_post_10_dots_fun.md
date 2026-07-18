# Blobert Devlog #10 – More DoTs, More Tools, More Fun

I don't want anyone thinking I'm burying the previous update, so FYI, Blobert has gone closed source, [more here](./blog.html?post=data%2Fblog%2FBlobert%2Fblog_post_9_bittersweet_update.md&v=6).

Now that we've gotten that out of the way. I know it's been awhile since my last update with dev content but I've been busy. Partially with Blobert, partially with my day job, but also with work and this other project, [loregarden](https://github.com/laazer/loregarden), which I'll talk about more in my next post (I still love you Blobert, please don't leave me 🙏). 

---

# Circle, Circle, DoT, DoT

You may recall from the ancient records of Post 8, a DoT is a damage over time effect, the thing is, Blobert as a lot of them. Poison, fire, acid (oh my) and who's to say it will stop at those 3 (yes I realize 3 isn't *that* many). But as I add more, it's important that each DoT feels distinctive and unique. Like a snowflake. A dangerous, deadly snowflake that will kill you given enough time.

## Poison should feel good

Or not I guess... Poison used to be a placeholder. Total damage was split across the first and second half of the duration. That was fine for when I was just putting the initial ability in place, but completely useless for combat feel. In a fight I wanted that classic feeling of building up stacks of poison, ultimately able to topple larger foes and do big damage at max stacks. Think a rogue from World of Warcraft, if that rogue was a green blob trapped in a video game. 

**Now for the change:**

Each stack now ramps damage over its lifetime instead of front-loading or back-loading a fixed budget. Up to five stacks can be applied to each individual enemy. When you're already at the cap, the oldest stack gets evicted so that sweet, fresh poison isn't wasted. Additionally all vulnerability states were stored the same way. The acid weakened status had a bug where it would replace poison status and vice-versa. But I want acid and poison had to coexist in the same vulnerability model, like chocolate and peanut-butter. Rebuilt the stacking layer so both effects compose instead of overwriting each other. I also updated the VFX for poison to have that nice dripping purple look.

<media-slot src="images/Blobert/post_10/poison.gif" alt="Poison effect animation" style="width:500px;" />

The old formula technically passed tests. It also felt nothing like poison in the sandbox. Agents are good at making tests green; they're worse at knowing whether passing tests means "fun." I kept having to playtest and tweaking the settings until the curve matched what I wanted in a real (virtual) fight.

Done.

---

## Blobert started the fire!

<media-slot src="images/Blobert/post_10/the-simpsons-burn.gif" alt="The Simpsons: its a controlled burn" style="width:500px;" />

> I asked the AI to make burning enemies flee.
>
> It did.
>
> They politely ran away from the player.
>
> Never touched another enemy.
>
> I appreciated that the burning enemy respected the other enemies' personal space.
>
> But that completely missed the point.

Ever play *Far Cry 2* or *Far Cry 3*?. Well if you haven't played these games, I'm sorry that your life is missing a small piece of joy. But knowing that doesn't help you understand what I'm going for. So in those games, you can light NPCs on fire (like aby sane person would). Those NPCs then run away and if they run into another NPC, well they end up on fire too. The agent implemented "flee" as "run away from the ignition point" and called it a day. The collision and spread part only happen if you spell out that the flee vector is a means, not the goal.

Once that was fixed, I still couldn't get fire to spread in the sandbox test level. It was the old usual, unit tests passed. Turned out the enemies in the unit tests were placed ~2.5 units apart and sandbox enemies were ~8 units apart. Nothing wrong with the code; I never matched the play scene to the test scene. Moved spawns closer. And spread worked immediately. Woot!

One bug sent me down completely the wrong path. Every particle was rendering white, so naturally I started tearing apart the shader. Turns out the shader was fine. I’d given the particle material the wrong resource type, and Godot was like "okay". *Narrator: "It was not okay"*. One-line fix, hour-long bug

Fire audio is similarly held together with duct tape. I'm less of an audio mixologist then I am a 3d model designer. SouUntil I have proper sound effects, an ffmpeg-generated crackle gets the job done.

<media-slot src="images/Blobert/post_10/flame_spread.gif" alt="Fire spread animation" style="width:500px;" />

Acid was a lot less exciting. Most of the work was just making it read differently from poison: sharper particle bursts, a lingering pool, and a corrosion effect that builds over a few seconds. Nothing technically difficult, just a lot of tweaking until it finally looked like acid instead of green poison.

---
# Extending Asset Editor: Ability Studio

## Fusion Lab Hah!

<media-slot src="images/Blobert/post_10/fusionha.gif" alt="DBZ fusion dance" style="width:500px;" />

Planning mutations in scattered JSON files and markdown task lists was fine when there were nine abilities. It does not scale when you're juggling fusions, build status, reference art, and "wait, did we ship `acid_claw` or `acid_slam`?"

Because of all the work that goes into implementing new abilities, I decided it was time for another custom tool. Thats where the new *Ability Hub* comes in. It's a full studio for designing base and fused abilities: a fusion Lab, a progress board, Model Explorer for licensed 3D with attribution, and scaffolding tools for new abilities. I should have known then and there that I would end up building a new tool to thats better suited for planning and implementation (oooh foreshadowing) (check out my new project [loregarden](https://github.com/laazer/loregarden)).

**Fusion Lab** has a simple design. Two orbs, a plus sign, a result: `orb(a) + orb(b) = fusion`. Pick mutations, see what's shipped, what's in progress, what's still a blank "not built yet" screen. Searchable roster with element-colored cards. Fusions match even when component order in the id differs.

<media-slot src="images/Blobert/post_10/01-fusion-lab-hero.png" alt="Fusion Lab hero shot" style="width:500px;" />

<media-slot src="images/Blobert/post_10/04-fusion-roster-grid.png" alt="Fusion roster grid" style="width:500px;" />

Check out my previous post where I updated the asset editor for more details on how this was built, as I essentially just did the same thing.

<media-slot src="images/Blobert/post_10/05-fusion-not-built.png" alt="Fusion not built" style="width:500px;" />

---

## So easy it feels like stealing 

In order to stay up to date on the latest in greatest in AI technology and techniques, I follow a series of AI development subredits, This led me to 2 very cool additions to the asset editor. The first is a particle editor. I found https://ludusy.com/particles and from there is was simple as pointing the agent at the site and building something similar with the components I had already created. The agent was scary good and had it done in an hour. 

<media-slot src="images/Blobert/post_10/07-particle-editor.png" alt="Particle editor" style="width:500px;" />

The second was also a surprisingly easy add. A "simple" image to 3D-Model generator. The paper and code use can all be found [here](https://make-it-3d.github.io/). Whats even neater is that google provides a generous image generation free tier for NanoBanana. Now creating a custom 3D model is as easy as asking google to generate an image, and then dropping that image into my model generator. 

<media-slot src="images/Blobert/post_10/blob_missle.gif" alt="Blob missile" style="width:500px;" />

## The Future: Concept Art → Animated Enemy

This isn't finished. The next steps involve upgrading the enemy editor, improving attack animations, adding attack models and particles, and finishing the pipeline so more of this work can be automated. But its still crazy to me how much progress I'm able to make with each push. Signing off until next time.


