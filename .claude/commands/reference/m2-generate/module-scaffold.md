# Magento 2 Module Scaffold Recipe

Complete recipe for creating a new Magento 2 module from scratch. Use this when generating a full module or CRUD entity.

## Minimal Module (Foundation)

Every module needs at minimum:

```
app/code/Vendor/Module/
    registration.php
    etc/
        module.xml
    composer.json
```

## Full CRUD Entity Module

For a complete entity (e.g., "BlogPost" in "Acme/Blog"):

### 1. Module Foundation
```
registration.php                    # Module registration
etc/module.xml                      # Module declaration
composer.json                       # Composer package
```

### 2. Database Schema
```
etc/db_schema.xml                   # Table definition
etc/db_schema_whitelist.json        # Whitelist (auto-generated, but needed)
```

### 3. API Layer (Service Contracts)
```
Api/Data/BlogPostInterface.php              # Data interface (getters/setters)
Api/Data/BlogPostSearchResultsInterface.php # Search results wrapper
Api/BlogPostRepositoryInterface.php         # Repository interface (CRUD)
```

### 4. Model Layer
```
Model/BlogPost.php                          # Entity model
Model/ResourceModel/BlogPost.php            # Resource model (DB operations)
Model/ResourceModel/BlogPost/Collection.php # Collection
Model/BlogPostRepository.php                # Repository implementation
```

### 5. DI Configuration
```
etc/di.xml                          # Preferences (interface -> implementation)
```

### 6. Frontend (Optional)
```
etc/frontend/routes.xml             # Frontend routes
Controller/Post/View.php            # View controller
view/frontend/layout/blog_post_view.xml   # Layout
view/frontend/templates/post/view.phtml   # Template
ViewModel/PostData.php              # View model
```

### 7. Admin (Optional)
```
etc/adminhtml/routes.xml            # Admin routes
etc/adminhtml/menu.xml              # Admin menu entry
etc/acl.xml                         # Access control
Controller/Adminhtml/Post/Index.php # Admin grid controller
Controller/Adminhtml/Post/Edit.php  # Admin edit controller
Controller/Adminhtml/Post/Save.php  # Admin save controller
Controller/Adminhtml/Post/Delete.php # Admin delete controller
view/adminhtml/ui_component/blog_post_listing.xml  # Admin grid
view/adminhtml/ui_component/blog_post_form.xml     # Admin form
view/adminhtml/layout/blog_post_index.xml          # Grid layout
view/adminhtml/layout/blog_post_edit.xml           # Edit layout
```

### 8. Web API (Optional)
```
etc/webapi.xml                      # REST/SOAP API routes
```

---

## Step-by-Step Generation Order

When generating, follow this dependency order:

### Phase 1: Foundation
1. `registration.php`
2. `etc/module.xml`
3. `composer.json`

### Phase 2: Database
4. `etc/db_schema.xml` - Define table with columns

### Phase 3: API Contracts
5. `Api/Data/{Entity}Interface.php` - Define data model interface with constants + getters/setters matching db columns
6. `Api/Data/{Entity}SearchResultsInterface.php` - Extends SearchResultsInterface
7. `Api/{Entity}RepositoryInterface.php` - save, getById, getList, delete, deleteById

### Phase 4: Implementation
8. `Model/{Entity}.php` - Extends AbstractModel, implements DataInterface
9. `Model/ResourceModel/{Entity}.php` - Extends AbstractDb, defines MAIN_TABLE + ID_FIELD_NAME
10. `Model/ResourceModel/{Entity}/Collection.php` - Extends AbstractCollection
11. `Model/{Entity}Repository.php` - Implements RepositoryInterface

### Phase 5: Wiring
12. `etc/di.xml` - Preference mappings:
    - `{Entity}Interface` -> `Model\{Entity}`
    - `{Entity}RepositoryInterface` -> `Model\{Entity}Repository`
    - `{Entity}SearchResultsInterface` -> `Magento\Framework\Api\SearchResults`

### Phase 6: Frontend (if needed)
13. `etc/frontend/routes.xml`
14. Controllers
15. Layout XML
16. Templates + ViewModels

### Phase 7: Admin (if needed)
17. `etc/acl.xml`
18. `etc/adminhtml/routes.xml`
19. `etc/adminhtml/menu.xml`
20. Admin Controllers
21. UI Component XML (listing + form)
22. Admin Layout XML

### Phase 8: API (if needed)
23. `etc/webapi.xml`

---

## Key Relationships

### Data Interface <-> Resource Model
The Data Interface constants should match the Resource Model's MAIN_TABLE columns:
```php
// Api/Data/BlogPostInterface.php
public const ENTITY_ID = 'entity_id';
public const TITLE = 'title';
public const CONTENT = 'content';
public const IS_ACTIVE = 'is_active';

// Model/ResourceModel/BlogPost.php
public const MAIN_TABLE = 'acme_blog_post';
public const ID_FIELD_NAME = 'entity_id';
```

### Model <-> Resource Model <-> Collection
```php
// Model/BlogPost.php _construct()
$this->_init(ResourceModel\BlogPost::class);

// Model/ResourceModel/BlogPost/Collection.php _construct()
$this->_init(BlogPost::class, ResourceModel\BlogPost::class);
```

### di.xml Preferences
```xml
<preference for="Acme\Blog\Api\Data\BlogPostInterface"
            type="Acme\Blog\Model\BlogPost"/>
<preference for="Acme\Blog\Api\BlogPostRepositoryInterface"
            type="Acme\Blog\Model\BlogPostRepository"/>
<preference for="Acme\Blog\Api\Data\BlogPostSearchResultsInterface"
            type="Magento\Framework\Api\SearchResults"/>
```

### Route <-> Controller <-> Layout
- Route frontName `blog` + controller dir `Post` + action `View` = URL `blog/post/view`
- Layout handle: `blog_post_view` (all lowercase, underscored)
- Layout file: `view/frontend/layout/blog_post_view.xml`

### Admin Menu <-> ACL <-> Route
- Menu `action` attribute matches admin route: `blog/post/index`
- Menu `resource` matches ACL resource ID: `Acme_Blog::post`
- Controller `ADMIN_RESOURCE` matches same ACL: `Acme_Blog::post`

---

## db_schema_whitelist.json

After creating `db_schema.xml`, generate the whitelist:
```bash
bin/magento setup:db-declaration:generate-whitelist --module-name=Vendor_Module
```

Or create manually - it lists all tables, columns, constraints, and indexes that are allowed to be modified:
```json
{
    "vendor_module_entity": {
        "column": {
            "id": true,
            "name": true,
            "is_active": true,
            "created_at": true,
            "updated_at": true
        },
        "constraint": {
            "PRIMARY": true
        }
    }
}
```

---

## Common Additions

### Add Observer to Existing Module
1. Create `Observer/{Name}Observer.php`
2. Add to `etc/events.xml` (or scoped `etc/frontend/events.xml`)

### Add Plugin to Existing Module
1. Create `Plugin/{Name}Plugin.php`
2. Add `<type><plugin>` to `etc/di.xml` (or scoped)

### Add CLI Command
1. Create `Console/Command/{Name}Command.php`
2. Register in `etc/di.xml` under `CommandListInterface`

### Add Cron Job
1. Create `Cron/{Name}.php`
2. Add to `etc/crontab.xml`

### Add System Configuration
1. Create `etc/adminhtml/system.xml` (fields)
2. Create `etc/config.xml` (defaults)
3. Add ACL resource for config access

### Add Data Patch
1. Create `Setup/Patch/Data/{PatchName}.php`
2. Implements `DataPatchInterface`
3. Runs automatically on `bin/magento setup:upgrade`

### Add REST API
1. Create repository interface + implementation (if not exists)
2. Add routes to `etc/webapi.xml`
3. Map to service contract methods
