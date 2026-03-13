# Designing the Mutation System for My Slime Platformer

In the first post, I introduced the core idea behind the game: a 2.5D
platformer starring a bio-engineered slime that absorbs and combines
powers from enemies.

This post is about the system that makes that idea work: the **mutation
system**.

The mutation system is the heart of the game.

It determines: - what enemies are for - how combat works - how traversal
changes over time - and how the player experiments inside levels

Rather than treating abilities as isolated power-ups, I wanted them to
feel like pieces of a larger system.

------------------------------------------------------------------------

# The Basic Idea

Blobert can hold **two mutations at a time**.

Those mutations come from enemies.

The player weakens an enemy, throws a chunk of slime onto it, absorbs
its mutation, and pulls the chunk back in.

Once absorbed, that mutation fills one of Blobert's available slots.

The interesting part happens when two mutations are combined.

Two active mutations can be fused into a **hybrid ability**.

That hybrid then occupies both slots.

So the system is not just about collecting powers. It is about deciding:

-   which mutations to carry
-   which ones to combine
-   when to keep a hybrid
-   when to replace it with something more useful

That decision-making is where a lot of the fun comes from.

------------------------------------------------------------------------

# Why Two Slots?

I like two slots because it creates a good balance between:

-   experimentation
-   readability
-   commitment

One slot would be too simple.

Three or more slots would make the system harder to understand and
harder to balance.

Two gives the player just enough room to think in combinations without
making the whole game feel like a spreadsheet.

It also makes enemy encounters easier to design.

When a player sees two or three enemy types in a room, they can
immediately start thinking about possible combinations.

------------------------------------------------------------------------

# Mutation Categories

I started organizing mutations into a few broad groups.

## Elemental Mutations

These change damage type and environmental interaction.

Current elemental group:

-   Fire
-   Ice
-   Wind
-   Earth
-   Metal
-   Electric
-   Acid

These are useful because they naturally suggest environmental
interactions.

Examples:

-   Fire can burn hazards or ignite targets
-   Ice can freeze enemies or create temporary surfaces
-   Wind can push objects or improve air movement
-   Earth can create armor or heavy attacks
-   Metal can affect rails, magnets, or armor
-   Electric can power devices or chain between targets
-   Acid can melt barriers or leave damage zones

------------------------------------------------------------------------

## Weapon Mutations

These define attack style more than element.

Current weapon group:

-   Sword
-   Javelin
-   Punch
-   Ring

These are important because they give the player different ways to apply
force.

Examples:

-   Sword gives close-range directional attacks
-   Javelin gives reach and piercing
-   Punch gives impact and knockback
-   Ring supports curved or returning attacks

These also make for fun self-combinations.

Examples:

-   Punch + Punch -\> Boxing Gloves
-   Ring + Ring -\> Boomerang

------------------------------------------------------------------------

## Utility and Movement Mutations

These are often the most important for platforming.

Current utility group:

-   Adhesion
-   Tendril
-   Bomb

Examples:

-   Adhesion supports wall-clinging and climbing
-   Tendril supports pulling, grappling, or extended reach
-   Bomb supports explosive interactions and puzzle solving

These are especially useful because they blur the line between combat
and traversal.

That is something I care about a lot in this project.

I do not want powers to matter only during combat. I want them to matter
in the level itself.

------------------------------------------------------------------------

# Enemies as Mutation Carriers

One of the biggest shifts in this project was thinking about enemies
differently.

Instead of asking:

"What attack pattern should this enemy have?"

I started asking:

"What mutation does this enemy represent?"

That changes the design process a lot.

Every enemy is basically a **carrier for a specific mutation**.

For example:

-   Adhesion Bug -\> Adhesion
-   Acid Spitter -\> Acid
-   Blade Sentinel -\> Sword
-   Ferro Drone -\> Metal
-   Knuckle Sprite -\> Punch

That means enemy design and ability design are tightly connected.

It also means enemies need to be readable, because the player is not
just reading danger --- they are reading opportunity.

------------------------------------------------------------------------

# Multiple Enemies Per Mutation

I do not want each mutation to come from only one enemy.

That would make the game too predictable, and it would also make the
world feel smaller.

So each mutation category gets **2 to 3 enemy types**.

That gives me a few advantages:

-   more visual variety
-   more encounter variety
-   more room to scale difficulty
-   more thematic flexibility by world

For example, the same mutation can appear in different forms:

## Acid Mutation Carriers

-   Acid Spitter
-   Melt Worm
-   Corrosion Beetle

## Sword Mutation Carriers

-   Blade Sentinel
-   Duel Knight
-   Cutter Wisp

## Wind Mutation Carriers

-   Gale Sprite
-   Cyclone Bird
-   Gust Hopper

That way the player keeps seeing familiar abilities in new contexts.

------------------------------------------------------------------------

# Fusion as Commitment

Fusing two mutations creates a hybrid ability that occupies both slots.

That is important.

I do not want fusion to feel like a temporary bonus.

I want it to feel like a real choice.

Once the player fuses two powers together, they are committing to that
hybrid until they replace it.

That makes the system more interesting because the player has to decide:

-   keep the reliable base powers
-   or gamble on a hybrid that might be more specialized

This is especially useful in a platformer, because situational abilities
can create alternate routes, shortcuts, or puzzle solutions.

A hybrid should not always be stronger than the two base powers.

Sometimes it should simply be **more specific**.

That helps preserve experimentation.

If every hybrid was just a straight upgrade, the system would become
boring very quickly.

------------------------------------------------------------------------

# Example Fusion Ideas

I do not plan to implement every possible combination immediately, but
here are some examples of the kinds of fusions I want:

-   Fire + Wind -\> Fire Tornado
-   Metal + Punch -\> Rocket Fist
-   Ice + Earth -\> Crystal Armor
-   Acid + Adhesion -\> Sticky Acid Nodes
-   Ring + Ring -\> Boomerang
-   Punch + Punch -\> Boxing Gloves
-   Sword + Fire -\> Flame Blade
-   Javelin + Electric -\> Lightning Spear

Some of these are combat-focused. Some are traversal-focused. Some
create environmental tools.

That mix is important.

------------------------------------------------------------------------

# Designing the Roster First

One lesson that became obvious early is that the mutation system has to
come before a lot of other systems.

It affects:

-   enemy design
-   encounter design
-   level design
-   secrets
-   boss design
-   progression pacing

Because of that, I have been treating the mutation list as one of the
game's main design documents.

At the moment, the core base mutation set looks like this:

-   Adhesion
-   Acid
-   Claw
-   Carapace
-   Electric
-   Tendril
-   Fire
-   Ice
-   Earth
-   Wind
-   Metal
-   Sword
-   Javelin
-   Punch
-   Ring
-   Bomb

That gives enough space for a lot of combinations without feeling
impossible to reason about.

------------------------------------------------------------------------

# Building Around Experimentation

The main feeling I want from this game is:

"I wonder what happens if I combine these."

That means the mutation system has to support curiosity.

To do that, it needs:

-   clear enemy-to-ability mapping
-   readable mutation slots
-   understandable hybrid results
-   lots of situations where abilities matter in both combat and
    traversal

If the player only uses powers to do damage, the system will feel
shallow.

If the player uses powers to:

-   fight
-   move
-   solve problems
-   access secrets
-   improvise in a room

then the system starts to feel alive.

That is the target.

------------------------------------------------------------------------

# Next Post

In the next post, I'm going to focus on the enemy side of this system:

**how I'm generating a large enemy roster with Blender and Python
without hand-modeling every creature.**
