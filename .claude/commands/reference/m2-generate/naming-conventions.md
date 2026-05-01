# Magento 2 Naming Conventions

## Deriving Vendor, Module, and Namespace

### From File Path
Given a file at `app/code/Acme/Blog/Model/Post.php`:
- **Vendor**: `Acme` (first directory under `app/code/`)
- **Module**: `Blog` (second directory under `app/code/`)
- **Module Name**: `Acme_Blog` (used in `module.xml`, `registration.php`)
- **Namespace Root**: `Acme\Blog`
- **Full Class**: `Acme\Blog\Model\Post`

### From Composer Package (vendor/)
Given a file at `vendor/acme/module-blog/Model/Post.php`:
- **Vendor**: `Acme` (from `composer.json` autoload PSR-4 namespace)
- **Module**: `Blog` (from `etc/module.xml`)
- **Composer Name**: `acme/module-blog`

### From Current Working Directory
If Claude is working in a Magento project, derive vendor/module from:
1. The path of the file being created/edited
2. The nearest `registration.php` or `etc/module.xml`
3. The user's explicit specification (e.g., "in Acme/Blog")

## PHP Naming Rules

### Classes
- **PascalCase** for all class names: `PostRepository`, `SaveController`, `ProductPlugin`
- **Suffix by type**:
  - Controllers: no suffix, named by action (`Save`, `Index`, `View`, `Delete`)
  - Plugins: `{TargetShortName}Plugin` (e.g., `ProductPlugin`)
  - Observers: `{EventDescription}Observer` (e.g., `SetOrderStatusObserver`)
  - Commands (CLI): `{Action}Command` (e.g., `ReindexCommand`)
  - Cron: no suffix, named by job (`ProcessQueue`, `CleanLogs`)
  - Setup: `InstallData`, `UpgradeData`, `InstallSchema`, `UpgradeSchema` (legacy), `Patch` classes for declarative

### Interfaces
- Always suffixed with `Interface`: `PostInterface`, `PostRepositoryInterface`
- Service contracts go in `Api/` (repositories) or `Api/Data/` (data models)

### Methods
- **camelCase**: `getProductName()`, `setStatus()`, `isActive()`
- Getters: `get{Property}()`, `is{BoolProperty}()`, `has{Property}()`
- Setters: `set{Property}($value)`

### Constants
- **UPPER_SNAKE_CASE**: `STATUS_ACTIVE`, `CACHE_TAG`, `EVENT_PREFIX`

### Properties
- **camelCase** private/protected: `$productRepository`, `$logger`
- Magento convention: constructor-injected dependencies are `private readonly`

## XML Naming Rules

### Module Declaration (`etc/module.xml`)
- Module name: `Vendor_Module` format
- Setup version: semver `X.Y.Z` (only if using setup scripts)

### Database Tables (`etc/db_schema.xml`)
- **snake_case**, prefixed with vendor/module hint: `acme_blog_post`, `acme_blog_comment`
- Primary key column: `entity_id` or `{entity}_id` (e.g., `post_id`)
- Foreign keys: `{referenced_table}_{referenced_column}` pattern
- Index names: `{TABLE}_{COLUMN(S)}` uppercase

### Columns
- **snake_case**: `created_at`, `updated_at`, `is_active`, `store_id`
- Boolean columns: prefix with `is_` or `has_`
- Timestamp columns: suffix with `_at`
- Foreign key columns: match the referenced column name (e.g., `store_id` references `store.store_id`)

### Routes and URLs
- Route frontName: **lowercase**, **hyphenated** if multi-word: `blog`, `custom-module`
- Controller path: maps to directory structure under `Controller/`
- URL structure: `frontName/controllerDirectory/actionClass` → `blog/post/view`

### Layout XML Handles
- Format: `{routeId}_{controllerDir}_{actionName}` all lowercase
- Example: `blog_post_view`, `catalog_product_view`
- Container/block names: **lowercase.dot.separated**: `content`, `acme.blog.post.list`

### Events
- **snake_case**: `catalog_product_save_after`, `sales_order_place_after`
- Pattern: `{area}_{entity}_{action}_{timing}`

### DI Config
- Type names: full class path `Acme\Blog\Model\PostRepository`
- Virtual types: descriptive PascalCase `AcmeBlogPostGridDataProvider`
- Plugin names: `{vendor}_{module}_{description}`: `acme_blog_product_name_plugin`

## File Location Rules

### PHP Files
| Type | Location | Example |
|------|----------|---------|
| Model | `Model/` | `Model/Post.php` |
| Resource Model | `Model/ResourceModel/` | `Model/ResourceModel/Post.php` |
| Collection | `Model/ResourceModel/{Entity}/` | `Model/ResourceModel/Post/Collection.php` |
| Repository | `Model/` | `Model/PostRepository.php` |
| API Interface | `Api/` | `Api/PostRepositoryInterface.php` |
| Data Interface | `Api/Data/` | `Api/Data/PostInterface.php` |
| Data Search Results | `Api/Data/` | `Api/Data/PostSearchResultsInterface.php` |
| Controller (adminhtml) | `Controller/Adminhtml/{Entity}/` | `Controller/Adminhtml/Post/Save.php` |
| Controller (frontend) | `Controller/{Entity}/` | `Controller/Post/View.php` |
| Block | `Block/` | `Block/PostList.php` |
| Block (adminhtml) | `Block/Adminhtml/` | `Block/Adminhtml/Post/Edit.php` |
| Helper | `Helper/` | `Helper/Data.php` |
| Plugin | `Plugin/` | `Plugin/ProductPlugin.php` |
| Observer | `Observer/` | `Observer/SetOrderStatusObserver.php` |
| Console Command | `Console/Command/` | `Console/Command/ReindexCommand.php` |
| Cron | `Cron/` | `Cron/ProcessQueue.php` |
| Setup Patch (Data) | `Setup/Patch/Data/` | `Setup/Patch/Data/AddDefaultCategories.php` |
| Setup Patch (Schema) | `Setup/Patch/Schema/` | `Setup/Patch/Schema/AddIndexToTable.php` |
| ViewModel | `ViewModel/` | `ViewModel/PostData.php` |
| UI DataProvider | `Ui/DataProvider/` | `Ui/DataProvider/PostDataProvider.php` |
| CustomerData | `CustomerData/` | `CustomerData/PostSection.php` |

### XML Config Files
| File | Location | Purpose |
|------|----------|---------|
| `module.xml` | `etc/` | Module declaration and version |
| `registration.php` | root | Module registration |
| `di.xml` | `etc/`, `etc/frontend/`, `etc/adminhtml/` | Dependency injection config |
| `routes.xml` | `etc/frontend/`, `etc/adminhtml/` | Route declarations |
| `menu.xml` | `etc/adminhtml/` | Admin menu entries |
| `system.xml` | `etc/adminhtml/` | System configuration fields |
| `config.xml` | `etc/` | Default config values |
| `acl.xml` | `etc/` | Access control list |
| `db_schema.xml` | `etc/` | Database schema (declarative) |
| `db_schema_whitelist.json` | `etc/` | Schema whitelist for upgrades |
| `events.xml` | `etc/`, `etc/frontend/`, `etc/adminhtml/` | Event observer registration |
| `crontab.xml` | `etc/` | Cron job scheduling |
| `webapi.xml` | `etc/` | REST/SOAP API definitions |
| `widget.xml` | `etc/` | Widget declarations |
| `indexer.xml` | `etc/` | Indexer declarations |
| `mview.xml` | `etc/` | Materialized views |
| `email_templates.xml` | `etc/` | Email template declarations |
| `catalog_attributes.xml` | `etc/` | Catalog attribute groups |

### Frontend Files
| Type | Location |
|------|----------|
| Layout XML | `view/frontend/layout/` |
| Templates (phtml) | `view/frontend/templates/` |
| Web JS | `view/frontend/web/js/` |
| Web CSS/LESS | `view/frontend/web/css/` |
| RequireJS config | `view/frontend/requirejs-config.js` |
| Adminhtml Layout | `view/adminhtml/layout/` |
| Adminhtml Templates | `view/adminhtml/templates/` |
| UI Component XML | `view/adminhtml/ui_component/` |
| Email Templates | `view/frontend/email/` |
