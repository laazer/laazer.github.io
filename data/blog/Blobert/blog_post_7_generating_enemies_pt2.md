# Blobert Devlog #6: Generating Enemies Part 2: Yes, I'm still crazy...

So I got sidetracked. Once I had a way of generating enemies, I wanted to make the enemies look more engaging to play against. I also wanted to make the enemies more interesting to look at. But the cycle of building the enemies in the cli, opening them in Blender, slightly tweaking the numbers, and then running the cli again was getting tedious and felt so time consuming. So I decided to do something even more tedious and time consuming. I decided to make a tool that would allow me to quickly tweak enemies via a web interface.

![PLACEHOLDER: Hero shot of the asset editor in the browser, GLB preview visible, dark UI](devlog-6/01-hero-asset-editor.webp)

The joke is only half a joke. Writing a local FastAPI backend plus a Vite front end to skip alt-tabbing into Blender *sounds* like a distraction from making a game. In practice, though, the bottleneck was feedback latency: regenerate, re-import, find the file, open it, check one material parameter, decide it was wrong, repeat. I wanted a loop that stayed inside the repo, talked to the same `model_registry` the pipeline already uses, and let me **see** a variant in a 3D preview without running Godot. So I wired up the Blobert asset editor: one shell command brings up the API and the dev server, and the UI lets me work through enemy families, versions, and “load what already exists on disk” flows instead of spelunking through folders with stale mental maps.

The stack is deliberately boring. `task editor` (same as `bash asset_generation/web/start.sh`) runs Uvicorn on **port 8000** and the frontend on **port 5173**—CORS and paths are set up so the browser can talk to the API without a production build. The registry surface in the app is the thing I keep coming back to: it reads and writes a single manifest path under the Python project, so I’m not scattering config across five JSON files. When something goes wrong, at least the failure is localized.

```bash
# From repo root — one command for backend + frontend
task editor
```

![PLACEHOLDER: Screen recording (GIF) — start `task editor`, open localhost:5173, registry tab loads](devlog-6/02-gif-launch-and-registry.gif)

I’m not going to narrate every button. The part that mattered for enemies was the ability to **reconcile the registry with what the pipeline has already generated**: scan for GLBs, attach versions to families, fix slots, and open a canonical path in the preview panel instead of guessing which export was the latest. That’s the same identity the backend resolves when you ask for an enemy by family and version. If the agent (me, the coding agent, the slightly overcaffeinated one) over-generated filenames or I duplicated a version id, the UI is where I catch it, not three commits later in Godot when the wrong model loads.

The manifest the UI persists to is `asset_generation/python/model_registry.json` (atomic write through the API; the editor footer points at the same path). If you are following along in the repo, that is the file to diff when you are wondering what changed after a long tweaking session. I treat it a bit like a migration: one deliberate write, not hand-edits scattered through scenes.

![PLACEHOLDER: Screenshot of Model Registry pane — enemy families, version rows, “persisted to model_registry.json” footnote](devlog-6/03-model-registry-pane.png)

I still use Blender and the CLI when the problem is truly geometric or rig-related. The web tool didn’t delete that workflow; it made the **shallow** iteration—picking the right built asset, wiring it into slots, checking it in a preview before I re-run Godot—cheap enough that I do more experiments per hour. The agents that helped build it had the usual habit of shipping something that passed tests and still needed a human pass in the real UI. I had to be explicit about “one manifest path, atomic writes, don’t add a second source of truth,” which is the sort of structural constraint that matters more than the line count. Technically the tests were green; I still found rough edges by clicking around like a user. Classic.

For the next session I want cleaner capture of in-game footage with the new enemies, not more YAML. Until then, this devlog is the receipt for the detour. If you are building a similar stack, I hope the screenshot and GIF slots above nudge you to **record the boring launch path**—local editors always look unimpressive in prose until you see the ten-second screen capture.

![PLACEHOLDER: In-game shot or Godot viewport — player facing a generated enemy using registry-selected GLB](devlog-6/04-gameplay-sandbox.png)

Fill in `devlog-6/*` after export: `01` hero, `02` launch GIF, `03` registry pane, `04` in-game or viewport payoff.
