# Blobert Devlog #5: Ready for Level 1

The theme of this stretch has been simple, get the basic controls, attacks, absorption, and basic mutation system working.

---

## A Real Entry Point (Not a Test Scene)

This is the first post where I’m actually talking about level generation, so quick context.

I replaced my old hand-built test scene with a procedural run scene as the entry point. Instead of “open this scene and hope everything is wired,” the game now boots into something that assembles itself.
The root is intentionally boring:
- player
- spawn marker
- system nodes

No baked rooms. No hidden assumptions. Everything else gets pulled in at runtime by `RunSceneAssembler`.

One detail that ended up mattering more than expected:  
`RunSceneAssembler` *has* to live directly under the scene root. Its room insertion logic depends on parent context, so even being one level off quietly breaks everything.

```text
ProceduralRun (Node3D)
├─ WorldEnvironment
├─ DirectionalLight3D
├─ Player3D
├─ SpawnPosition (Marker3D)
├─ RunSceneAssembler   <-- direct child of root (required)
├─ DeathRestartCoordinator
├─ InfectionInteractionHandler
├─ InfectionUI
└─ RespawnZone
   └─ CollisionShape3D
```

This was the first step toward something that behaves like a real game instead of a controlled test environment.

---

## My tests were not enough

As soon as I started actually *playing* the run scene, things fell apart in ways tests never caught.

### Startup Ordering Was Lying to Me

I had nodes being attached with deferred `add_child` during `_ready`, while other systems were trying to grab references immediately.

So sometimes everything worked. Sometimes it didn’t. Classic “one frame too early” bug. Tests didn’t catch it because they weren’t exercising real scene timing, just static expectations.

---

### The “Why Is Everything White” Bug

At one point the entire scene just blew out.

Not “a little bright.”  
Completely unreadable.

<img src="images/Blobert/post_5/whiteout.gif" alt="Overexposed White Scene GIF" style="width:700px;"/>

Turns out room templates were each bringing their own:
- `WorldEnvironment`
- `DirectionalLight`

Stack enough of those and you’re basically summoning the sun. The fix was simple: enforce a single environment/light source at the run level. The lesson was not: **procedural composition means every piece has to be a good citizen.**

---

### Interaction Lookup Was Too Naive

`InfectionInteractionHandler` worked fine in tests, but failed depending on how deep a room was nested.

I originally assumed a fixed relationship in the scene tree. That assumption died immediately once rooms became dynamic. The fix was switching from “look here” to:

> “walk up the tree until you find the thing you need.”

Not exciting, but way more correct in a system where structure isn’t fixed.

#### The Bug My Tests Approved

Respawn broke in a way that took longer than it should have to track down.

I had this:

```gdscript
# Wrong: resolves as child of current node
@export var player_path: NodePath = NodePath("Player3D")

# Correct: walk to parent, then sibling
@export var player_path: NodePath = NodePath("../Player3D")
```

What I thought I wrote: “find my sibling”

What I actually wrote: “find my child”

The worst part: my tests passed. Because they made the same bad assumption. Fixing the game meant fixing the tests to reflect the real scene graph, not the simplified one I had in my head.

---

## Making Death Cheap (On Purpose)

I added a debug kill key:

```gdscript
if OS.is_debug_build() and event.is_action_pressed("debug_kill_player"):
    player.apply_damage(player.current_hp)
```

Bound to K in debug builds.

<img src="images/Blobert/post_5/respawn_loop.gif" alt="Quick Death → Respawn Loop GIF" style="width:700px;"/>

This sped up iteration on:
- death
- restart
- state reset
- post-respawn wiring

Way more useful than trying to “naturally” die every time.

---

## Small Fix, Big Impact: Resource Gating

I added an HP affordability check to chunk throwing.

Before:
- you could throw even at 0 HP
- game would enter impossible states

Now:
- actions validate cost before executing

It’s a small guard, but it removes an entire class of “this shouldn’t even be possible” bugs.

---

## Fixing the Tests (Not Just Adding More)

Part of this phase was deleting tests.

Not because tests are bad but because some of them:
- were brittle
- relied on GDScript lambda quirks
- looked deterministic but weren’t

They weren’t protecting anything.

They were just… green.

The goal shifted to: **tests that fail for the right reason**

---

### Killing a Flicker by Breaking a Rule

There was a one-frame flicker when enemies swapped visuals.

The fix was a little counterintuitive:
- defer the swap
- use `free()` instead of `queue_free()`

That kept the EnemyVisual node name stable during the transition.

<img src="images/Blobert/post_5/broken_flicker.gif" alt="Broken Flicker GIF" style="width:700px;"/>

Normally I avoid free() in these flows, but in this case it removed lookup churn and fixed the glitch cleanly.

---

## Where This Actually Lands

This is the first time in a while where the project feels like a playable game, not just a passing test suite.

The loop is finally healthy:
- write targeted tests
- play the game
- find where reality disagrees
- fix the system
- fix the tests
- repeat

This pass covered:
- startup ordering
- environment duplication
- interaction lookup depth
- respawn path correctness
- death loop tooling
- resource validation
- reward correctness
- visual stability

Level 1 is finally unblocked.

Now I can spend time building gameplay instead of fighting the wiring (lol, but wouldn't that be cool?).

<img src="images/Blobert/post_5/level1_run.gif" alt="Level 1 Playthrough GIF" style="width:700px;"/>