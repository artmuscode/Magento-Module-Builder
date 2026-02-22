# Magento Module Builder - Development Guide

## Project Overview

Visual drag-and-drop designer for Magento 2 modules. Sibling project to `../system-designer/` - same Flowy-based architecture but with Magento-specific blocks, validation, and export.

Pure client-side JavaScript (no build step, no frameworks, no npm). Open `index.html` directly or serve with `python3 -m http.server`.

## Architecture

```
index.html          <- App shell, loads all scripts in order
css/styles.css      <- Single stylesheet, CSS custom properties for theming
js/blocks.js        <- Block definitions (BlockCategories object, 24 types in 7 categories)
js/smart-defaults.js <- SmartDefaults object: column inference, naming, file path resolution
js/properties.js    <- PropertiesPanel class: renders/saves config forms per block type
js/validators.js    <- ModuleValidator class: validates design, updates warning UI
js/exporter.js      <- MagentoExporter class: builds JSON export with file manifest + AI instructions
js/main.js          <- DOMContentLoaded entry point: initializes Flowy, wires events
lib/flowy.js        <- Third-party Flowy library (copied from system-designer, do not edit)
lib/flowy.css       <- Third-party Flowy styles (do not edit)
```

### Script Load Order (matters - no modules)

`flowy.js` -> `blocks.js` -> `smart-defaults.js` -> `properties.js` -> `validators.js` -> `exporter.js` -> `main.js`

### Global Instances

- `propertiesPanel` - PropertiesPanel (created in main.js)
- `moduleValidator` - ModuleValidator (created in main.js)
- `magentoExporter` - MagentoExporter (created in main.js)
- `BlockCategories` - Block definitions object (from blocks.js)
- `SmartDefaults` - Utility object (from smart-defaults.js)
- `CommonMagentoEvents` - Array of common event names for observer dropdown (from blocks.js)

### Data Flow

1. User drags block from sidebar -> Flowy `onBlockSnap` callback fires
2. `generateCanvasBlockHTML()` renders the canvas block
3. User clicks block -> `propertiesPanel.show(block)` renders type-specific form
4. Form changes -> `saveCurrentBlock()` persists to `propertiesPanel.blockData` Map (keyed by Flowy block ID)
5. After any snap/delete/save -> `moduleValidator.validate()` runs all rules, updates badge + block borders
6. Export -> `magentoExporter.export()` reads `propertiesPanel.getAllBlockData()`, builds file manifest via `SmartDefaults.resolveFilePaths()`, generates phased AI instructions

### Block Data Structure

Each block in `propertiesPanel.blockData` Map:
```js
{
  name: "Display Name",
  type: "db-schema",         // matches BlockCategories key
  config: { ... }            // type-specific, matches defaultConfig from blocks.js
}
```

## Key Patterns

### Adding a New Block Type

1. Add definition to `BlockCategories` in `blocks.js` (type, title, description, icon, files, defaultConfig)
2. Add `renderXxx(config)` method in `properties.js` for the form UI
3. Add case to `renderTypeSpecificFields()` switch in `properties.js`
4. Add save logic case to `saveCurrentBlock()` switch in `properties.js`
5. Add any "add item" methods needed (e.g. `addColumn()`)
6. Add validation rules in `validators.js` if needed
7. Add export instructions in `exporter.js` `generateAiInstructions()`
8. Add file path resolution in `smart-defaults.js` `resolveFilePaths()`
9. Add layer mapping in `exporter.js` `buildArchitectureLayers()` layerMap

### Smart Defaults Column Inference

`SmartDefaults.inferColumnType(name)` maps column name patterns to Magento types:
- `*_id` -> int unsigned, `is_*`/`has_*` -> smallint (boolean), `*_at` -> timestamp
- `price`/`*_amount` -> decimal(12,4), `content`/`description` -> text
- `name`/`title` -> varchar(255), `status` -> smallint unsigned

### Validation Rules

All in `ModuleValidator.validate()`. Rules check:
- Block type presence (e.g. module-registration required)
- Cross-block dependencies (model needs schema, repo needs model, admin needs ACL)
- Required config fields per block type

Warnings update: navbar badge count, orange `.has-warning` class on canvas blocks, validation modal list.

### Export Phases

AI instructions follow Magento's dependency order from `module-scaffold.md`:
1. Foundation (registration.php, module.xml, composer.json)
2. Database (db_schema.xml)
3. API Contracts (interfaces)
4. Model Implementation (Model, ResourceModel, Collection, Repository)
5. DI Wiring + Business Logic (di.xml, plugins, observers, cron, CLI)
6. Frontend (controllers, layout, templates, viewmodels, JS)
7. Admin (ACL, routes, menu, grid, form, system config)
8. API (webapi.xml, GraphQL, message queues)

## Magento 2 Naming Conventions Used

- Table names: `{vendor}_{module}_{entity_snake}` (e.g. `acme_blog_post`)
- Route front names: lowercase, hyphenated module name
- Layout handles: `{route}_{controller}_{action}` all lowercase
- ACL resources: `{Vendor}_{Module}::{resource}`
- Composer packages: `{vendor}/module-{module-name}`
- PHP classes: PascalCase, namespaced under `{Vendor}\{Module}\`

## Testing

No automated tests. Manual verification:
1. Open in browser, verify all 7 category tabs show correct blocks
2. Drag each block type - verify it snaps and renders
3. Click blocks - verify properties panel shows correct fields
4. Test smart defaults: add column "is_active" in db-schema, verify boolean type inferred
5. Test validation: add Model without Database Schema, verify warning
6. Test export: build Registration + Schema + Model + Repository, verify JSON output
