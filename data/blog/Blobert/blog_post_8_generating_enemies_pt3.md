# Blobert Devlog #8: Generating Enemies Part 3: Its Purdy Now + Game Update (Yay!)

It's been a while since the last devlog. A lot has shipped since late May: new attacks, a ground-up redesign of the asset editor's styling tools, and a verification workflow that's been quietly catching bugs that would otherwise have slipped into playtesting. Here's the rundown.

---

## Asset Editor: Studio Look Panel Redesign

I've been adding more features to the asset editor for a while now, but the material-editing experience was scattered. This push introduced a redesigned Studio Look panel that makes styling an enemy feel natural to use instead of overwhelming.

<media-slot src="images/Blobert/post_8/asset_editor_2_0.gif" alt="Studio Look Panel Redesign" style="width:500px;" caption="Oooooh, pretty!" />

I'm about to sound like an Anthropic ad here, but I took advantage of their new design tools to create a new UI for the *Asset Editor*. I got a few credits with my subscription and decided to take it for a spin. 

### The Good:
Its really easy to use and iterate through designs. The agent personality is set up to ask a lot of questions up front to help guide towards a solid looking design and user experience. Even providing a full canvas with figma like tools to test out different user interactions. 

<media-slot src="images/Blobert/post_8/claude_design.png" alt="Anthropic Design Canvas" style="width:500px;" caption="Claude design canvas" />

### The Bad:
The biggest pain point was turning the design into an actual working UI. I might have missed the feature or button or whatever to export the design as a react app. Anthropic does allow you to download the full canvas assets though. I ended up downloading the assets and instructing claude to build some react components from the assets. Good news was that the entire backend was fine as is. Additionally, I was able to reuse a lot of components and logic from the existing editor, I just needed to update the styles and some of the logic to fit the new design.

<media-slot src="images/Blobert/post_8/claude_design_assets.png" alt="Claude Design Assets" style="width:500px;" caption="Claude design downloadable assets" />

The top section is now organized around an element picker with nine archetypes: Fire, Ice, Poison, Acid, Earth, Forest, Water, Lightning, and Physical. Each element has a curated color palette, accent color, and glyph icon, giving the editor a clear visual identity as you switch between them. Most of this functionality already existed, but it was previously scattered across the interface, making it difficult to discover and manage. The redesign brings those controls together into a single workflow. I can now choose whether to load an element's built-in default palette or a custom default palette they've configured themselves.

There's also a new workflow for managing element defaults. When custom defaults have been saved for an element, a small indicator dot appears on its tile so it's immediately obvious that you're working from an overridden baseline rather than the built-in configuration. Each element now includes a gear icon that opens a dedicated material configuration modal, allowing defaults to be tuned on a per-zone basis, saved back to the element, or reset to the built-in configuration at any time.

<media-slot src="images/Blobert/post_8/element_select.png" alt="Element Config Modal" style="width:500px;" caption="Element select" />
<media-slot src="images/Blobert/post_8/element_overrides.png" alt="Element Overrides" style="width:500px;" caption="Element overrides" />

The Parts picker received a similar usability overhaul. The underlying customization options were already present, but they were previously buried in a dense collection of controls. The new layout organizes everything around individual body zones: body, limbs, joints, and so on, making it much easier to focus on one area at a time.

<media-slot src="images/Blobert/post_8/parts_picker.gif" alt="Parts Picker" width="480" style="height:800px; object-fit:cover; object-position:top center;" caption="New parts picker" />

The net effect is that building a coherent-looking variant takes far less time than it used to. And more importantly, I don't hate looking at the editor anymore.

---

## Enemy Health System: Making Attacks Actually Land

Before any of the attacks below could be meaningfully tested, enemies needed to be able to receive damage. The health system was written for the original absorbtion code way back when with `EnemyBase` that handles HP via `take_damage()`. But the new attacks have new mechanics like knockbacks, DoTs (Damage over Time), and rooting and slowness effects. To track these effects, they live in a dedicated `EnemyEffectTracker` child node that owns its own `_process(delta)` loop and emits signals back up when damage needs applying. 

```gdscript
func _tick_dots(delta: float) -> void:
    for effect_name in _active_dots.keys():
        var effect: Dictionary = _active_dots[effect_name]
        effect.elapsed_since_tick += delta
        effect.remaining_duration -= delta
        while effect.elapsed_since_tick >= DOT_TICK_INTERVAL:
            effect.elapsed_since_tick -= DOT_TICK_INTERVAL
            var tick_damage: float = effect.dps * DOT_TICK_INTERVAL
            dot_tick_requested.emit(effect_name, tick_damage)
```

There's a agent run I want to call out here. 190 unit tests passed before the ticket closed: 58 primary, 50 tracker, and 82 adversarial. My *Acceptance Criteria Gatekeeper* agent went looking for integration tests bridging `EnemyBase` to `AttackExecutor` and `PlayerProjectile3D` and found zero. It held the ticket at *INTEGRATION* and sent it back. That forced a second pass to write 31 cross-system tests. That’s exactly the gap the integration tests are meant to catch. Everything looked good in isolation, but once systems start talking to each other, that’s where the a lot of bugs tend to hide. Always cool to see what kind of issue the agent find before I even have a chance to playtest.

---

## Base Mutation Attacks: Four Are In

Four base mutation attacks are complete! Claw Swipe, Acid Spit, Ground Slam, and Sticky Spit have all been implemented. Each one is an `AttackResource` data object dispatched through a shared `AttackExecutor`, so they're mostly wiring rather than new architecture per attack.

<media-slot src="images/Blobert/post_8/claw_attack.gif" alt="Claw Attack" style="width:500px;" caption="Claw Attack" />
<media-slot src="images/Blobert/post_8/acid_attack.gif" alt="Acid Attack" style="width:500px;" caption="Acid Attack" />
<media-slot src="images/Blobert/post_8/slam_attack.gif" alt="Ground Slam Attack" style="width:500px;" caption="Ground Slam Attack" />
<media-slot src="images/Blobert/post_8/root_attack.gif" alt="Sticky Spit Attack" style="width:500px;" caption="Sticky Spit Attack" />

A few things worth noting from the implementation work:

**The adhesion root nearly shipped broken.** Adhesion roots enemies by calling `apply_slowness(0.0, duration)`, a multiplier of zero means full stop, reusing the existing slow system without a new API. But both `AttackExecutor` and `PlayerProjectile3D` had a truthiness check on the slow value: `if slow_val and slow_val > 0.0`. In GDScript, `0.0` is falsy. The root would have registered, the projectile would have hit, and absolutely nothing would have happened. No error, no crash, just a sticky spit that doesn't stick. The fix was a null sentinel:

```gdscript
# Before — 0.0 is falsy, root silently skipped
var slow_val = modifiers.get("slow", 0.0)
if slow_val and slow_val > 0.0:
    target.apply_slowness(slow_val, ...)

# After
var slow_val = modifiers.get("slow", null)
if slow_val != null:
    target.apply_slowness(slow_val, ...)
```

This was caught by the spec agent reading the existing executor code before a single test was written. The bug was dead before it was born.

Root duration went from 1s to 3s during verification. One second felt like a micro-stutter in the sandbox; three seconds makes the CC (crowd control) window real. That's a constant change in `attack_database.gd`, but updating the tests was more annoying than expected. Boundary tests that assume a 1.0s clock don't forgive you when you only update half the literals. The agent also hit a float trap: `int(3.0 / 0.05)` for computing expected tick counts looks right and isn't. Caught it because the suite was still failing after the "obvious" edits.

Another issue: cooldowns were leaking across death. A verification pass, originally scoped as manual confirmation, got run through the automated pipeline. The tests immediately found that `reset_hp()` wasn't clearing `_mutation_cooldowns`. Die mid-cooldown, respawn, and your attack timers carried over from your previous life. Subtle, silent, would have shown up as "the game feels off" in playtesting. One-line fix:

```gdscript
func reset_hp() -> void:
    _current_state.current_hp = _simulation.max_hp
    _player_state_machine.reset()
    _mutation_cooldowns.clear()
    _enemy_acid_dots.clear()
```

The adversarial pass also found that the cooldown tick loop was subtracting `delta` directly, so a negative engine delta (rare but legal in Godot) could *increase* a cooldown. Wrapped in `maxf(0.0, delta)` to ensure it never goes negative. Its also just not a good PR strategy 🥁.

<media-slot src="images/common/fg_ostrich_laugh.gif" alt="Ostrich laugh" style="width:500px;" />

---

## Fused Attacks: Framework Done, First Combo In, Testing the Rest

The fused attack system is the main new mechanic in progress. When both mutation slots are filled, `_try_attack()` checks for a fused combo before falling back to the base attack for slot A:

```gdscript
if a_filled and b_filled:
    attack_resource = db.get_fused_attack(a_id, b_id)
    if attack_resource != null:
        var pair: Array = [a_id, b_id]
        pair.sort()
        cooldown_key = "%s_%s" % [pair[0], pair[1]]
    else:
        attack_resource = db.get_base_attack(a_id)
        cooldown_key = a_id
```

The sorted key means `acid+claw` and `claw+acid` resolve to the same database entry, registration order doesn't matter. All six combos are registered:

- **Venomous Shred** (Acid + Claw) — 3-hit melee combo, each hit applies an independent acid DoT stack
- **Sticky Slash** (Adhesion + Claw) — melee swipe that roots on contact
- **Armored Slam** (Slam + Claw) — wider-arc ground slam, infects weakened enemies
- **Venom Web** (Acid + Adhesion) — ranged projectile that roots and applies acid
- **Corrosive Slam** (Acid + Slam) — ground slam that applies acid on impact
- **Web Slam** (Adhesion + Slam) — ground slam that roots everyone in range

The framework and all six resource registrations are in. *Venomous Shred* is the first fully implemented and tested fusion. The rest are defined in the database but verification is still in progress.

<media-slot src="images/Blobert/post_8/acid_claw.gif" alt="Acid Claw Combo" style="width:500px;" caption="Venomous Shred" />

*Venomous Shred* had an interesting implementation wrinkle. The standard acid path (`apply_acid`) overwrites an existing DoT if you hit the same target twice, the new duration replaces the old one. For a 3-hit combo that applies acid on each swing, you want three independently decaying stacks, not one refreshed timer. The combo path uses `apply_acid_stack`, which keys each new entry with an incrementing counter:

```gdscript
func add_acid_stack(duration: float, dps: float) -> void:
    var key: String = "acid_stack_%d" % _acid_stack_counter
    _acid_stack_counter += 1
    add_dot(key, duration, dps)
```

The counter is never reset even after effects are cleared, resetting it would risk reusing keys for still-active entries after a stop-and-reapply cycle.

There was also a dispatch bug that static QA caught before it could ship. `MELEE_SWIPE_COMBO` was wired to call `_handle_melee_swipe_combo()` directly, a function containing `await` calls for inter-hit timing. In GDScript, calling an awaiting function without `await` returns immediately. So `execute_attack` would complete, clear `_is_active`, and exit before a single hit landed. The async wrapper already existed in the file as dead code. One line to wire it up:

```gdscript
# Before — returns before any hits fire
"MELEE_SWIPE_COMBO":
    _handle_melee_swipe_combo(resource)

# After — mirrors SLAM_AOE exactly
"MELEE_SWIPE_COMBO":
    _run_melee_swipe_combo_async(resource)
    return
```

Tests were passing without this fix. The attack would have just done nothing in-game. A related bug surfaced during routing work: the cooldown write in `_try_attack()` was unconditional. If the executor was already busy and rejected a dispatch, the cooldown key still got written, blocking the next attack with no attack having fired. Guard added before the write:

```gdscript
if _attack_executor.is_active():
    return
_attack_executor.execute_attack(attack_resource)
_mutation_cooldowns[cooldown_key] = attack_resource.cooldown
```

*Venomous Shred* also had a single-hit race condition. A claw hit deals damage, which can drop an enemy from `NORMAL` to `WEAKENED` state. *Venomous Shred* also carries an `infect_weakened` modifier that transitions `WEAKENED` enemies to `INFECTED` state. Without a guard, one hit could weaken and infect in the same frame, skipping the intended two-hit pattern. The fix captures state before damage is applied:

```gdscript
for enemy in enemies:
    var pre_state: int = -1
    if enemy.has_method("get_base_state"):
        pre_state = enemy.get_base_state()
    _apply_damage(enemy, resource.damage, kb)
    _apply_modifiers(enemy, resource.modifiers, pre_state)
```

The modifier handler checks `pre_damage_state`, not current state. Dead enemies get an early return.

And... yeah, ground slam waits to land. The carapace *Slam AOE* (AOE = Area of Effect) attack is the first attack that does a radial query instead of targeting a single enemy or projectile. It waits through startup frames, then polls `_is_owner_on_floor()` at 50ms intervals with a 3-second timeout before firing, triggering it while airborne defers the slam to landing.

---

## Sandbox Levels as Human Verification Checkpoints

Automated tests catch logic errors. They can't tell you whether an attack *feels* right, whether the timing is satisfying, or whether the hitbox is where your eyes expect it to be.

What started as one monolithic sandbox with every attack, every sign, and a floor the size of a parking lot got split into focused per-attack scenes: a shared base scene with player, respawn coordinator, and infection handler, then thin section scenes for each mutation. The adhesion attack sandbox gets a fair test because of what's in it: a patrolling target, a wall placed inside projectile range, and HUD text that flips to `root=STOP` when adhesion's slow multiplier hits zero. It became my in-game version of `console.debug()` for checking the state of the game. For each major mechanic, we now build a dedicated sandbox scene that acts as a structured playtest environment. You can see some examples of these in the attack gifs above. Each scene has instructional hint text directly in the 3D world, describing exactly what to try and what to observe. The fused attack sandbox reads:

```
FUSED ATTACKS  (J to fire, 1-6 to switch combo)
1: acid+claw      Venomous Shred (3-hit combo, acid DoT each hit)
2: adhesion+claw  Sticky Slash   (melee swipe, roots target)
...
```

Three labeled target dummies (Target A, B, C) stand in the scene for testing. Open it, run it, and every acceptance criterion from the spec has a corresponding thing you can trigger and observe in under a minute.

<media-slot src="images/Blobert/post_8/full_run.gif" alt="Full Run" style="width:500px;" caption="Sandbox with instructions" />

The sandboxes live alongside the gameplay scenes in version control, so they stay in sync with whatever the current implementation is. There's also a CI policy worth noting: the project's `run/main_scene` must stay pointed at `procedural_run.tscn`, pre-push tests enforce it. The reason for this is mostly because its really easy to accidently change the main scene in the editor. Its a thimble for my fat fingers.

---

That's the update. The four base attacks are complete and verified. The fused attack framework is done and all six combos are registered. *Venomous Shred* has gone through the full pipeline, and the remaining five are being put through verification now. More soon.
