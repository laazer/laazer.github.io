# Building a Mutation-Based Platformer: The Idea Behind My Slime Game

One of my favorite games growing up was *Kirby 64: The Crystal Shards*.

What made it memorable wasn't just the platforming --- it was the
**ability mixing system**.

You could combine two powers together to create completely new ones.

Fire + Sword → flaming sword\
Bomb + Cutter → explosive shuriken

It encouraged experimentation in a way most platformers don't.

I wanted to recreate that **sense of playful experimentation**, but with
a new twist.

------------------------------------------------------------------------

# The Core Concept

The game I'm building is a **2.5D platformer starring a bio-engineered
slime creature**.

The slime --- currently called *Blobert* --- can absorb abilities from
enemies and combine them to create new powers.

Instead of copying powers directly like Kirby, Blobert uses a **physical
mutation system**.

The core gameplay loop looks like this:

1.  Damage an enemy
2.  Throw a chunk of slime onto it
3.  Infect and absorb its mutation
4.  Combine mutations to create new abilities

Enemies aren't just obstacles --- they're **ability sources**.

The goal is to make combat feel like experimentation rather than simple
defeat.

------------------------------------------------------------------------

# The Chunk Mechanic

Blobert doesn't inhale enemies like Kirby.

Instead, Blobert **throws pieces of itself**.

The process works like this:

-   Blobert throws a chunk of slime.
-   The chunk sticks to weakened enemies.
-   The enemy dissolves and the chunk absorbs its mutation.
-   Blobert pulls the chunk back using a stretchy tendril.

Visually it looks like:

    throw chunk → enemy infected → mutation absorbed → chunk returns

This system makes the gameplay feel **physical and biological**.

It also introduces a small risk:

-   When a chunk is detached, Blobert temporarily loses mass.
-   Less mass means weaker movement and less health.
-   Retrieving the chunk restores Blobert.

------------------------------------------------------------------------

# Enemies as Ability Sources

Rather than designing enemies first, I started with the **gameplay idea
of mutations**.

Enemies exist primarily as **carriers for abilities**.

Each enemy type represents a different mutation that Blobert can absorb.

This shifts the role of enemies from:

    things to defeat

to

    tools the player experiments with

That design philosophy shapes almost every part of the game.

------------------------------------------------------------------------

# Why I'm Writing About This

Game development projects often disappear quietly.

I'm documenting this project for two reasons:

1.  To track the design process.
2.  To share the tools and workflows I'm building along the way.

Future posts will cover topics like:

-   designing the mutation system
-   generating enemies procedurally with Blender and Python
-   automatically building Godot scenes from imported models
-   designing enemy encounters around ability combinations

------------------------------------------------------------------------

# Next Post

In the next post I'll go deeper into the **mutation system** itself ---
how abilities are structured and how fusion combinations work.
