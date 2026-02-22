# Magento Module Builder

A visual drag-and-drop tool for designing Magento 2 module architectures. Built on the [Flowy](https://github.com/nicolo-ribaudo/flowy) library, it lets you compose module components on a canvas, configure them via a properties panel, and export an AI-friendly JSON specification for code generation.

## Quick Start

```bash
cd magento-module-builder
python3 -m http.server 8080
# Open http://localhost:8080
```

No build step required - pure HTML/CSS/JS.

## How It Works

1. **Drag** component blocks from the sidebar onto the canvas
2. **Click** a block to configure it in the properties panel
3. **Connect** blocks by dragging children onto parents (Flowy tree structure)
4. **Export** the design as JSON (Ctrl+E) or copy to clipboard (Ctrl+Shift+C)

The exported JSON includes:
- Module identity (vendor, name, namespace, composer name)
- All components with their configuration
- **File manifest** - complete list of files with Magento-convention paths (e.g. `app/code/Vendor/Module/Model/Post.php`)
- **Auto-detected dependencies** (e.g. admin blocks add `Magento_Backend`)
- **Phased AI instructions** - ordered generation steps matching Magento's dependency chain (Foundation -> Database -> API Contracts -> Models -> DI -> Frontend -> Admin -> API)
- Validation warnings

## Block Categories (24 blocks, 7 categories)

| Category | Color | Blocks |
|----------|-------|--------|
| **Foundation** | Blue | Module Registration |
| **Data** | Amber | Database Schema, Model/Entity, Repository, Data Patch |
| **Routes** | Green | Frontend Controller, Admin Controller, Custom Router |
| **Logic** | Purple | Plugin, Observer, Cron Job, CLI Command, ViewModel |
| **Config** | Cyan | System Config, ACL Resource, Admin Menu |
| **API** | Pink | REST API, GraphQL, Message Queue |
| **Frontend** | Orange | UI Component, jQuery Widget, JS Mixin, Admin Grid, Admin Form |

## Smart Defaults

The builder infers sensible defaults from naming conventions:

- **Column type inference**: `*_id` -> int, `is_*` -> boolean, `*_at` -> timestamp, `price` -> decimal(12,4), `content` -> text
- **Table name suggestions**: Entity "BlogPost" in Acme/Blog -> `acme_blog_blog_post`
- **Route front name**: Derived from module name
- **ACL resource IDs**: Suggested from vendor/module
- **Composer package name**: Auto-generated as `vendor/module-name`

## Validation

The builder warns you about common issues:

- Missing Module Registration block
- Empty vendor/module name
- Model without Database Schema
- Repository without Model
- Admin Controller without ACL Resource
- Admin Grid/Form without Model
- Missing required fields per block type

Warnings appear as a badge in the navbar and orange borders on affected blocks.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + E` | Export as JSON file |
| `Ctrl/Cmd + Shift + C` | Copy JSON to clipboard |
| `Escape` | Close panel/modal |

## Project Structure

```
magento-module-builder/
  index.html              # App shell - 7-category sidebar, canvas, properties panel
  css/styles.css          # Dark theme with Magento orange accent (#f26322)
  js/
    blocks.js             # 24 block definitions + sidebar/canvas rendering
    smart-defaults.js     # Column inference, naming conventions, file path resolution
    properties.js         # Property forms for all 24 block types
    validators.js         # Module validation rules + warning UI
    exporter.js           # JSON export with file manifest + AI instructions
    main.js               # App initialization, Flowy callbacks, event wiring
  lib/
    flowy.js              # Flowy library (drag-and-drop tree builder)
    flowy.css             # Flowy styles
```

## Export Format

The exported JSON is designed to be fed directly to an AI coding assistant:

```json
{
  "version": "1.0",
  "tool": "magento-module-builder",
  "module": {
    "vendor": "Acme",
    "name": "Blog",
    "fullName": "Acme_Blog",
    "namespace": "Acme\\Blog",
    "composerName": "acme/module-blog"
  },
  "components": [ ... ],
  "architecture": {
    "layers": { "foundation": [], "data": [], "routing": [], ... },
    "dependencies": { "autoDetected": ["Magento_Backend"], "userSpecified": [] }
  },
  "fileManifest": {
    "totalFiles": 12,
    "basePath": "app/code/Acme/Blog",
    "files": [ "app/code/Acme/Blog/registration.php", ... ],
    "byDirectory": { ... }
  },
  "aiInstructions": [
    { "phase": 1, "phaseName": "Foundation", "instruction": "Create module foundation..." },
    { "phase": 2, "phaseName": "Database", "instruction": "Create db_schema.xml..." }
  ]
}
```

## Related

- **system-designer** - The generic system architecture builder this project is based on
- **Magento 2 skill files** (`~/.claude/skills/m2-generate/`) - Reference patterns for M2 module generation
