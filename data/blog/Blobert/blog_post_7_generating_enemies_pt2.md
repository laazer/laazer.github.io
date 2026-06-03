# Blobert Devlog #7: Generating Enemies Part 2: Yes, I'm still crazy...

So I got sidetracked.

Once I had a way of generating enemies, I wanted the enemies to look more engaging to play against. I also wanted them to be more interesting to look at. But the cycle of building enemies in the CLI, opening them in Blender, tweaking numbers, exporting again, then re-importing into Godot just to discover one material value was slightly wrong started getting exhausting.

So naturally I decided to solve this by building an entire web application.

<img src="images/Blobert/post_7/demo1.gif" alt="Hero shot of the asset editor in the browser" style="width:700px;"/>

The joke is only half a joke.

Writing a local FastAPI backend plus a Vite frontend to avoid alt-tabbing into Blender sounds like classic procrastination disguised as engineering. But the real bottleneck wasn't generation speed. It was feedback latency.

The actual loop looked something like this:

1. Run the Python pipeline
2. Generate or modify meshes/materials in Blender
3. Export a GLB
4. Find the correct exported file
5. Import or preview it
6. Realize one parameter looked wrong
7. Repeat

That loop sounds manageable until you do it fifty times in a row while tuning colors, attachments, patterns, and materials.

What I really wanted was a tight local loop that stayed inside the repo and reused the exact same data the asset pipeline already depended on.

The pipeline itself is roughly:

> Python generators → Blender build/export → GLB asset → registry update → web preview → Godot import

The important part is that every stage references the same asset identity. I didn't want "preview data" and "runtime data" slowly drifting into separate worlds.

So I built an editor around the existing pipeline instead of beside it.

The editor talks directly to the same `model_registry.json` manifest the generators and Godot integration already use. That registry became the canonical map between generated assets, versions, metadata, and what the engine should actually load at runtime.

That means:
- the preview panel
- the export pipeline
- the runtime loader
- and the registry UI

…are all reasoning about the same files and identifiers instead of maintaining parallel copies of truth.

One shell command now boots the backend and frontend together, opens the preview workflow, and lets me iterate on enemy variants, attachments, materials, and animations without constantly bouncing between tools.

The stack is pretty simple:

- FastAPI backend (port `8000`)
- Vite frontend (port `5173`)
- Three.js for 3D rendering
- Tailwind CSS for styling
- React for the UI
- `model_registry.json` as the canonical asset manifest

> Go simple or go home.
> -me

## Make tasks, not war and not make

I recently decided to move away from Make. As nice as it is, I kept running into situations where I was fighting the tool more than using it. So I started experimenting around 😱.

I've been using [go-task/task](https://taskfile.dev/) for a while now and I've been really happy with it. It's simple, readable, and much easier to evolve alongside the repo.

Technically, task editor just runs bash `asset_generation/web/start.sh`.

That script:
- boots `uvicorn` on `0.0.0.0:8000` with hot reload
- starts the `Vite` dev server on `5173`
- verifies Node supports globalThis.crypto.getRandomValues (Node 18+)
- and prints the one URL I actually care about

The backend config points directly at `asset_generation/python`, and CORS is only opened for the local `Vite` frontend. The important part is that the browser preview and the CLI pipeline are operating on the same directory tree and the same manifest instead of duplicated configs.

bash # From repo root task editor 

```bash
🐲 [laazer] 🚀 ~/workspace/blobert [[🐍 .venv]] 👾 (main ●) ● λ task editor:debug-spots
task: [editor:debug-spots] bash asset_generation/web/start.sh
=== Starting Blobert Asset Editor ===
Backend started (pid 71968)
INFO:     Will watch for changes in these directories: ['/Users/laazer/workspace/blobert/asset_generation/web/backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [71968] using WatchFiles
INFO:     Started server process [71991]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
Found '/Users/laazer/workspace/blobert/asset_generation/web/frontend/.nvmrc' with version <20>
v20.20.2 is already installed.
Now using node v20.20.2 (npm v10.8.2)
Found '/Users/laazer/workspace/blobert/asset_generation/web/frontend/.nvmrc' with version <20>
Now using node v20.20.2 (npm v10.8.2)
Frontend started (pid 72671)

Open http://localhost:5173
Press Ctrl+C to stop both servers.


> blobert-asset-editor@0.1.0 dev
> vite


  VITE v5.4.21  ready in 392 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Don't forget to recycle

The web editor didn't replace Blender or the CLI.

Anything truly geometric or rig-related still belongs in actual modeling tools. What the editor replaced was the logistical part of the loop:

- regenerate
- find the export
- re-import it
- preview one change
- realize it was wrong
- repeat

Enemies are split into logical zones—body, head, limbs, extras—so materials, patterns, and procedural features can vary independently. That means most iteration no longer requires rebuilding the entire asset.

Most of my workflow is now shallow iteration:
- pick a variant
- assign materials or attachments
- tweak a zone
- preview the GLB
- push it into Godot

I reuse the same pipeline outputs and the same model registry contract throughout the entire loop, so I’m not constantly wondering whether I’m previewing stale data or accidentally loading last week’s export.

Once that loop became reliable and cheap, I stopped mentally budgeting changes. I just started trying more ideas per hour.

## One prod to rule them all… and its localhost

I kept running into a weird pattern while working with agents.

Every time I renamed a field, simplified a schema, or removed an obsolete path, the model would try to preserve the old behavior too. Instead of replacing the serializer, it would maintain both serializers. Instead of deleting an old key, it would quietly add migration logic "just in case."

That makes sense for production systems. This is not a production system. This is a local development tool that I fully control.

So for the editor, I intentionally stopped treating backwards compatibility like a sacred rule. I'd rather rename the field, update the one caller, fix the manifest, and move on than carry compatibility baggage forever because an agent assumed every API should survive indefinitely. The important distinction is making sure that mindset stays inside tooling and doesn't leak into runtime game assets.

## Back to babysitting

I thought I was past the point of babysitting my agents. I was wrong. LLMs are really great at generating specified functionality fast. They do it with about as much grace as a set designer. Don't get me wrong—set designers do incredibly difficult work. But their work is very pointed. They build a set with a scene in mind. They reuse pieces across scenes with clever tricks. The catch is that set pieces are ultimately **temporary**. They're not meant to be permanent infrastructure. They're meant to be thrown away when the production wraps. LLMs are like that too. They generate a lot of stuff that works on paper. It isn't always what you want. It doesn't always compose. So when I asked for patterns and different fill options, I realized my agents were set designing, not building a well-structured application.

LLMs behave similarly. They generate systems that work surprisingly well in isolation, but they don't always compose cleanly as the project grows. So when I started adding procedural patterns, image fills, gradients, per-zone controls, and animation options, I realized the agents were solving features one at a time instead of preserving a coherent structure underneath.

The generated UI ended up with a forest of flat string keys:

- `feat_body_texture_*`
- `feat_head_texture_*`
- rotation controls
- image ids
- UV parameters

…because that was the fastest local representation for the model to extend.

On the Python side, the merge logic became responsible for:
- nested feature reconciliation
- mesh overrides
- defaults
- allowlists
- legacy field migration
- validation
- and export compatibility

At some point it stopped feeling like a domain model and started feeling like an air traffic controller.

Here's part of the regex classification system the agent kept extending as more feature types were added:

```python
_FEAT_ZONE_FLAT_KEY = re.compile(
    r"^feat_(body|head|limbs|joints|extra)_"
    r"(finish|hex|color_mode|color_image_id|color_image_preview|color_image_uv_rect)$"
)
```

And here's part of the merge layer that eventually had to reconcile all of it:

```python
def options_for_enemy(enemy_type: str, raw: dict[str, Any] | None) -> dict[str, Any]:
    """Merge defaults with user JSON; mesh overrides live under ``mesh``."""
    base = _defaults_for_slug(enemy_type)
    mesh_keys = set(_mesh_numeric_defaults(enemy_type).keys())
    if not raw:
        return _coerce_and_validate(enemy_type, base)

    nested = raw.get(enemy_type)
    src: dict[str, Any] = nested if isinstance(nested, dict) else dict(raw)
    _migrate_legacy_stripe_rotation_keys(src)

    merged = dict(base)
    mesh = dict(base["mesh"])
    if enemy_type == "spider":
        allowed_non_mesh = {c["key"] for c in _spider_eye_control_defs()}
    else:
        allowed_non_mesh = {
            c["key"] for c in _ANIMATED_BUILD_CONTROLS.get(enemy_type, [])
        }
    # …filters, nested merges, coerce_validate…
```

A lot of developers are starting to run into the same problem with generated code:
→ tests green ✅ 
→ preview weird 🤔 
→ export fine ✅ 
→ Godot wrong 🤦‍♂️

The dangerous failures usually aren't syntax errors. They're mismatches between layers that technically function independently but no longer agree on reality.

## Hooked on hooks

When agents write a lot of code quickly, the scary failures aren't usually "won't parse." They're unreviewed drift: style that doesn't match the repo, complexity that sneaks past review, GDScript that never got a second pass. Pre-commit hooks are the solution that I previously would have set up way later in the project. When most of my time went into hand writing buisness logic, tests, and validation, I didn't really think to set up pre-commit hooks. I knew the structure wasn't drifting because I was the one writing it. I could have agents review the code but that comes with a few problems:
- Agents wrote the code in the first place, so it likely *reads* as correct
- Even if the code reads as correct, it doesn't mean its *correct* or maintanable
- Tokens are EXPENSIVE! (I'm already hitting daily and weekly token limits as is)
- Amd I like my code style, sue me.

<img src="images/Blobert/post_7/sue_me.gif" alt="Michael Scott dont sue me meme" style="width:500px;"/>

Before a commit lands, staged Python runs through Ruff on the error classes I actually care about, Pylint with a tight complexity rule on touched files, and organization checks that catch patterns I'd otherwise rubber-stamp at 11pm. Staged GDScript gets the same spirit in a different language: review plus org rules so gameplay code doesn't accumulate unexplained literals and one-off hacks just because a generator was feeling creative. This actually started me down another rabbit hole, so stay tuned for more on that in a future post.

Before a push, the expensive nets come out: headless Godot tests when scenes or scripts changed, pytest with coverage for the asset pipeline, plus a diff-cover gate so new lines don't skate by untested. 

The goal isn't perfection. The goal is making "mergeable" mean something closer to:
> "future me probably won't hate this immediately."

That still doesn't replace clicking through the asset editor like a user. It just buys back the easy wins so my attention goes to the weird UI edge cases, not to import order and whether I ran the suite. 

## Feature rich, time poor

If you give a mouse a cookie, it eventually asks for:
- gradients
- spots
- stripes
- image fills
- shell attachments
- procedural variations
- pattern presets
- and probably emissive mushroom bulbs for some reason

The editor can do a lot now.

The tradeoff is that every new feature dimension multiplies maintenance pressure across:
- Python validation
- Blender material generation
- GLB export
- `Three.js` preview
- registry serialization
- and Godot runtime loading

"Feature rich, time poor" is my polite way of saying I sometimes shipped novelty before I shipped defaults that don't embarrass me in screenshots.

## Model Registry

I'm not going to narrate every button in the editor.

The important part was reconciling generated assets with the registry automatically.

The registry stores:
- asset families
- versions
- canonical file paths
- metadata
- preview relationships
- and runtime identity information

The editor can:
- scan generated GLBs
- associate versions with families
- reconcile missing entries
- repair slots
- and open canonical previews

That matters because the registry is the same identity system Godot eventually consumes at runtime.

If:
- the pipeline generated duplicate versions
- filenames drifted
- exports landed in the wrong directory
- or an agent over-generated assets

…the editor is where I want to discover that problem, not several commits later inside the game engine.

The manifest itself lives at: `asset_generation/python/model_registry.json`

The backend writes to it atomically through the API because I wanted one deliberate source of truth instead of random hand-edited metadata scattered through scenes and folders.

After successful exports, the backend also attempts to automatically sync newly discovered GLBs into the manifest so I don't have to manually inspect directories like a raccoon searching through a dumpster.

Failures during sync don't block exports, but they do log loudly. Silent failure is the one thing I increasingly refuse to tolerate in this pipeline.

<img src="images/Blobert/post_7/model_registry.png" alt="Model Registry" style="width:700px;"/>

## Spoiders

What is a cute platformer without the creepiest crawlers imaginable? The mighty spoider… spider. I added an `AnimatedSpider` class to the pipeline. It meant adding:
- a quadruped rig
- procedural body scaling
- configurable leg proportions
- themed material slots

The editor side uses the same JSON build schema as every other enemy type, which means I can rapidly iterate on readability and silhouette design without touching the rig unless absolutely necessary.

<img src="images/Blobert/post_7/spoider.png" alt="Spoider" style="width:700px;"/>

## Body parts galore

Even with base enemies and color variation, the roster still felt visually repetitive. So I added simple reusable attachment systems:
- horns
- shells
- bulbs
- eyes
- extra geometry pieces

These all route through the same zone-geometry system instead of requiring entirely new hand-authored enemy species every time I want variety.

## Colors

The original pipeline already supported whole-model coloration.

The next step was per-zone control:
- body
- head
- limbs
- extras

…plus finishes, gradients, and material options so enemies could feel structurally different instead of just hue-shifted clones.

## Images

Textures are table stakes for this kind of editor. The surprising part wasn't getting image fills working. The surprising part was how quickly the agent wired image ids and UV parameters through the same feature system already handling solid colors and gradients. The hard part came later:
maintenance. Every new rendering mode multiplies interaction complexity with every existing mode.

## Patterns

### Struggling with stripes

Continuing on the theme of making features just because I can, I wanted patterns on the enemies. The obvious two were stripes and spots. Who doesn't want a spider with tiger stripes, right? Since textures on parts were already working, I assumed stripes were "just another image." And I thought it worked…

<img src="images/Blobert/post_7/beachball_demo1.gif" alt="Beachball pattern demo" style="width:700px;"/>

Oh cool… beachball pattern on a spider… "No problem, it's just not aligned—I'll ask Claude to wrap it differently." Except stripes in this codebase are **not** one thing. In `material_stripes_zone.py`, the `stripe_preset` chooses between two different strategies:

- **`beachball` / `swirl` (default-ish path):** bake a **256×256** stripe PNG, slap it on Principled via a **UVMap → TexImage** chain. That's classic "image on UVs." If the UV layout looks like a crime scene, the pattern looks like a crime scene. Beachball on a spider was doing what beachball does—just not what *I* wanted on *that* mesh.
- **`doplar`:** object-space projection built from the mesh position dotted with a direction vector derived from preset + **yaw + pitch** (`stripe_rot_yaw` / `stripe_rot_pitch` in the UI; legacy `texture_stripe_rot_*` keys get migrated in `options_for_enemy`). That path sets `mat["blobert_stripe_procedural"] = True` so export can reason about "this needs to survive GLTF," instead of pretending a single PNG always maps cleanly.

So what I actually had to do to "wrap stripes differently" wasn't vibes—it was **pick the non-UV strategy** (`doplar`), then **rotate** with yaw/pitch until the direction vector lined up with how the spider's body is authored. The frontend exposes that as a segmented control plus degree sliders:

```typescript
// Stripe preset + rotation controls mirrored from Python (animatedZoneControlsMerge.ts)
{
  key: `${p}stripe_direction`,
  label: `${zlabel} — Stripe preset`,
  type: "select_str",
  options: ["beachball", "doplar", "swirl"],
  default: "beachball",
  segmented: true,
},
{ key: `${p}stripe_rot_yaw`, label: `${zlabel} — Stripe yaw`, type: "float", min: -180, max: 180, step: 1, default: 0, unit: "deg" },
{ key: `${p}stripe_rot_pitch`, label: `${zlabel} — Stripe pitch`, type: "float", min: -180, max: 180, step: 1, default: 0, unit: "deg" },
```

<img src="images/Blobert/post_7/stripes_how_to.png" alt="Stripes how to" style="width:700px;"/>

### Is it wrong to want to have a pattern on an image?

One of the many (unnecessary) features I wanted is patterns *and* images *and* combinations *now*. Claude built it. Parts of it worked first try. Other parts worked like a demo: fine until you rotate the mesh and remember UVs don't care about your feelings.

## Make the invisible visible

One of Claude's favorite hobbies is swallowing exceptions.

Sometimes that's acceptable:
- non-critical sync failures
- cleanup issues
- recoverable post-processing

But the dangerous failures are the invisible ones:
- no logs
- no warnings
- no UI signal
- just silently incorrect state

By the time a broken export reaches Godot, the original problem may be several pipeline stages upstream. So I've started treating observability like a first-class feature. If the agent hides a failure path, I usually undo that before I trust the tool.

# Closing thoughts

The interesting thing about this pipeline is not that it's "advanced." It's that it's unusual.

There aren't endless training examples for:
- Blender procedural generation
- GLB export pipelines
- runtime Godot integration
- web previews
- registry synchronization
- procedural material systems
- and agent-assisted tooling

All of this is stitched together into one local workflow. The backend APIs and frontend scaffolding came together surprisingly quickly. The rendering systems, projection logic, and long-term structure needed much more active steering. The agents could absolutely generate functionality. The harder problem was preserving coherence as the system expanded. The biggest lesson so far has probably been this:

#### *AI accelerates local construction, but it also increases ambiguity unless you aggressively constrain state, ownership, and feedback loops.*

That means:
- single sources of truth
- small modules
- static analysis
- explicit ownership boundaries
- visible failures
- and constantly testing the actual user experience instead of trusting green checkmarks

Otherwise the set pieces eventually become load-bearing walls.
Also nice to know my job may be safe for a bit longer 😅

<img src="images/Blobert/post_7/demo2.gif" alt="In-game shot or Godot viewport — player facing a generated enemy using registry-selected GLB" style="width:700px;"/>