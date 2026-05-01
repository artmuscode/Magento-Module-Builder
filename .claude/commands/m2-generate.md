# /m2-generate - Magento 2 Code Generator

Generate Magento 2.4+ PHP classes, XML config files, JSON configs, and complete module scaffolds.

## Activation

This skill activates when the user types `/m2-generate` followed by a description of what to generate.

## Instructions

You are a Magento 2.4 code generator. When invoked:

1. **Parse the request** to determine what needs to be generated (entity name, vendor/module, file type, etc.)
2. **Derive context** from the current project:
   - If working in a Magento project, detect Vendor/Module from file paths
   - If the user specifies "in Vendor/Module", use that
   - If ambiguous, ask
3. **Load the appropriate reference** and generate production-ready code
4. **Generate all related files** - Magento components are interdependent (a model needs its resource model, a controller needs its route, etc.)

## Context Loading

Load these references as needed:

- For PHP class generation: `!cat .claude/commands/reference/m2-generate/php-patterns.md`
- For XML config generation: `!cat .claude/commands/reference/m2-generate/xml-config-patterns.md`
- For full module creation: `!cat .claude/commands/reference/m2-generate/module-scaffold.md`
- For naming rules: `!cat .claude/commands/reference/m2-generate/naming-conventions.md`

## Code Standards

All generated code MUST follow these standards:

### PHP
- `declare(strict_types=1)` at top of every file
- PHP 8.1+ features: constructor property promotion, `readonly`, union types, named arguments, enums
- PSR-12 formatting
- `private readonly` for injected dependencies
- Modern controller interfaces (`HttpGetActionInterface`, `HttpPostActionInterface`) instead of extending `Action`
- Trailing commas in multi-line function parameters and arrays

### XML
- Always include the full `<?xml version="1.0"?>` prolog
- Always include the correct `xsi:noNamespaceSchemaLocation` for each file type
- Use proper indentation (4 spaces)

### Naming
- Derive namespace from target file path
- Table names: `vendor_module_entity` (lowercase snake_case)
- Route frontName: lowercase hyphenated
- Layout handles: `route_controller_action` (lowercase underscored)
- ACL resources: `Vendor_Module::resource_name`
- Plugin names: `vendor_module_description`

## Common Generation Scenarios

### Single Component
```
/m2-generate a model for BlogPost in Acme/Blog
```
Generate: Model + Resource Model + Collection (they're always needed together)

### Controller + Route
```
/m2-generate a frontend controller for viewing blog posts in Acme/Blog
```
Generate: Controller + routes.xml + layout XML

### Plugin
```
/m2-generate a plugin for Magento\Catalog\Model\Product::getName
```
Generate: Plugin class + di.xml entry

### Observer
```
/m2-generate an observer for catalog_product_save_after in Acme/Blog
```
Generate: Observer class + events.xml entry

### Full Entity CRUD
```
/m2-generate complete CRUD for BlogPost in Acme/Blog with title, content, is_active columns
```
Generate: Full module scaffold per module-scaffold.md

### Database Table
```
/m2-generate db_schema.xml for a blog_post table with title, content, author_id, is_active
```
Generate: db_schema.xml with proper column types inferred from names

### System Configuration
```
/m2-generate system config for Acme/Blog with enabled toggle and API key field
```
Generate: system.xml + config.xml + ACL resource

### Data Patch
```
/m2-generate a data patch to add default blog categories in Acme/Blog
```
Generate: Setup/Patch/Data class

### REST API
```
/m2-generate webapi.xml for BlogPost CRUD in Acme/Blog
```
Generate: webapi.xml with routes for all repository methods

## Multi-File Awareness

When generating a component, always consider what related files are needed:

| Component | Also Generate |
|-----------|--------------|
| Model | Resource Model, Collection |
| Controller | routes.xml (if new route), layout XML |
| Plugin | di.xml `<type><plugin>` entry |
| Observer | events.xml entry |
| ViewModel | Layout XML argument entry |
| CLI Command | di.xml CommandListInterface entry |
| Cron Job | crontab.xml entry |
| Config Provider | di.xml CompositeConfigProvider entry |
| Repository | Data Interface, SearchResults Interface, di.xml preferences |
| Custom Router | Router class, di.xml RouterList entry |

## Column Type Inference

When generating db_schema.xml, infer column types from names:
- `*_id`, `id`, `*_count`, `qty`, `quantity`, `sort_order`, `position` -> `int`
- `is_*`, `has_*`, `*_active`, `*_enabled` -> `boolean`
- `*_at`, `*_date`, `date_*` -> `datetime`
- `price`, `*_price`, `*_amount`, `cost`, `*_total`, `weight` -> `decimal(20,6)`
- `*_url`, `*_path`, `name`, `title`, `label`, `sku`, `code`, `email` -> `varchar(255)`
- `content`, `description`, `*_html`, `*_text`, `body` -> `text`
- Everything else -> `varchar(255)` (safe default)

Always add `created_at` and `updated_at` datetime columns unless the user explicitly says not to.
