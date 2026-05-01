# Magento 2 PHP Class Patterns

Reference for generating PHP classes. All patterns use `declare(strict_types=1)`, PHP 8.1+ features (constructor promotion, readonly, union types, named arguments), and PSR-12 formatting.

## Variable Resolution
Claude derives these automatically from context:
- **Namespace**: from file path (e.g., `app/code/Acme/Blog/Model/` -> `Acme\Blog\Model`)
- **Class name**: from filename (e.g., `Post.php` -> `Post`)
- **Vendor_Module**: from path (e.g., `app/code/Acme/Blog/` -> `Acme_Blog`)
- **Table prefix**: lowercase vendor_module (e.g., `acme_blog`)

---

## Registration

### Module Registration (`registration.php`)
- Location: Module root
- Registers module with `ComponentRegistrar::register(ComponentRegistrar::MODULE, 'Vendor_Module', __DIR__)`
- Always `declare(strict_types=1)`

### Theme Registration (`registration.php`)
- Location: Theme root (e.g., `app/design/frontend/Vendor/theme/`)
- Uses `ComponentRegistrar::THEME` with path like `frontend/Vendor/theme`

---

## Models (Entity Layer)

### Model (`Model/{Entity}.php`)
- Extends: `Magento\Framework\Model\AbstractModel`
- `_construct()` calls `$this->_init(ResourceModel\{Entity}::class)`
- Optionally set `$_eventPrefix` and `$_eventObject` for model events
- Can implement `Api\Data\{Entity}Interface` for service contracts

### Resource Model (`Model/ResourceModel/{Entity}.php`)
- Extends: `Magento\Framework\Model\ResourceModel\Db\AbstractDb`
- Define `MAIN_TABLE` and `ID_FIELD_NAME` as class constants
- `_construct()` calls `$this->_init(self::MAIN_TABLE, self::ID_FIELD_NAME)`
- Table name convention: `vendor_module_entity` (snake_case)

### Collection (`Model/ResourceModel/{Entity}/Collection.php`)
- Extends: `Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection`
- `_construct()` calls `$this->_init(Model::class, ResourceModel::class)`
- Import model class with `use` statement

---

## Controllers

### Frontend Controller - Page (`Controller/{Dir}/{Action}.php`)
- Implements: `Magento\Framework\App\Action\HttpGetActionInterface` (or `HttpPostActionInterface`)
- Inject `PageFactory` via constructor (readonly)
- `execute()` returns `Page` from `$this->pageFactory->create()`
- No parent class needed for modern controllers

### Frontend Controller - JSON (`Controller/{Dir}/{Action}.php`)
- Implements: `HttpGetActionInterface`
- Inject `JsonFactory` via constructor
- `execute()` returns `Json` with `->setData($data)`

### Admin Controller (`Controller/Adminhtml/{Entity}/{Action}.php`)
- Extends: `Magento\Backend\App\Action`
- Implements: `HttpGetActionInterface` (or `HttpPostActionInterface`)
- Define `ADMIN_RESOURCE` constant for ACL check
- Call `parent::__construct($context)` (Context is `Magento\Backend\App\Action\Context`)
- Set active menu and page title in `execute()`

---

## Plugins

### Plugin Class (`Plugin/{Target}Plugin.php`)
- Plain class (no extends/implements)
- Location: `Plugin/` directory
- Registered in `di.xml` with `<type><plugin>` declaration

### Before Plugin Method
```
public function before{MethodName}({TargetClass} $subject, ...$args): array
```
- Returns array of modified arguments
- First param is always `$subject` (the intercepted class instance)

### After Plugin Method
```
public function after{MethodName}({TargetClass} $subject, $result, ...$originalArgs)
```
- First param: `$subject`, second: `$result` (return value of original method)
- Returns modified `$result`

### Around Plugin Method
```
public function around{MethodName}({TargetClass} $subject, callable $proceed, ...$args)
```
- Must call `$proceed(...$args)` to execute original method
- Avoid when before/after suffice (performance cost)

---

## Observers

### Observer (`Observer/{EventDescription}Observer.php`)
- Implements: `Magento\Framework\Event\ObserverInterface`
- Single method: `execute(Observer $observer): void`
- Access event data: `$observer->getEvent()->getData('key')` or `$observer->getEvent()->getKey()`
- Registered in `events.xml`

---

## Blocks & View Models

### Block (`Block/{Name}.php`)
- Extends: `Magento\Framework\View\Element\Template`
- Public methods called from `.phtml` templates
- Prefer ViewModels over Blocks for new code

### View Model (`ViewModel/{Name}.php`)
- Implements: `Magento\Framework\View\Element\Block\ArgumentInterface`
- Injected into blocks via layout XML `<argument name="view_model" xsi:type="object">`
- Preferred over blocks for data logic (since Magento 2.2+)
- Constructor injection for dependencies

### Checkout Layout Processor (`Block/Checkout/{Name}.php`)
- Implements: `Magento\Checkout\Block\Checkout\LayoutProcessorInterface`
- `process($jsLayout): array` - modifies checkout JS layout
- Registered in `di.xml` as layout processor argument

---

## API / Service Contracts

### Data Interface (`Api/Data/{Entity}Interface.php`)
- Can extend `Magento\Framework\Api\ExtensibleDataInterface` (for extension attributes) or standalone
- Define string constants for column/field names
- Getter/setter pairs for each field
- Include `getExtensionAttributes()` / `setExtensionAttributes()` if extensible
- Mark with `@api` and `@since` version

### Repository Interface (`Api/{Entity}RepositoryInterface.php`)
- Methods: `save()`, `getById()`, `getList()`, `delete()`, `deleteById()`
- `getList()` accepts `SearchCriteriaInterface`, returns `{Entity}SearchResultsInterface`
- FQCNs in `@param` and `@return` docblocks for WSDL/webapi generation
- Mark with `@api` and `@since` version

### Search Results Interface (`Api/Data/{Entity}SearchResultsInterface.php`)
- Extends: `Magento\Framework\Api\SearchResultsInterface`
- Override `getItems()` and `setItems()` with typed arrays
- Return/accept `{Entity}Interface[]`

---

## Setup / Data Patches

### Data Patch (`Setup/Patch/Data/{PatchName}.php`)
- Implements: `Magento\Framework\Setup\Patch\DataPatchInterface`
- Required methods: `apply()`, `getDependencies()` (static, returns array), `getAliases()` (returns array)
- Inject `ResourceConnection` for direct DB operations, or entity-specific services
- Class name should describe what the patch does (e.g., `AddDefaultCategories`)

### Data Patch - CMS Block (`Setup/Patch/Data/{PatchName}.php`)
- Same interface as above
- Inject: `BlockInterfaceFactory`, `BlockRepository`, `GetBlockByIdentifierInterface`, `LoggerInterface`
- Try to load existing block by identifier before creating new one
- Use heredoc for HTML content

### Schema Patch (`Setup/Patch/Schema/{PatchName}.php`)
- Implements: `Magento\Framework\Setup\Patch\SchemaPatchInterface`
- For schema changes that can't be expressed in `db_schema.xml`

---

## Checkout

### Checkout Config Provider (`Model/{Name}ConfigProvider.php`)
- Implements: `Magento\Checkout\Model\ConfigProviderInterface`
- `getConfig(): array` returns data available in checkout JS as `window.checkoutConfig`
- Registered in `di.xml` under `Magento\Checkout\Model\CompositeConfigProvider` arguments

---

## Routing

### Custom Router (`Router/{Name}.php`)
- Implements: `Magento\Framework\App\RouterInterface`
- `match(RequestInterface $request): ?ActionInterface`
- Registered in `di.xml` under `Magento\Framework\App\RouterList` with sort order
- Return `null` if this router doesn't handle the request

---

## Console Commands

### CLI Command (`Console/Command/{Name}Command.php`)
- Extends: `Symfony\Component\Console\Command\Command`
- `configure()`: set name, description, arguments, options
- `execute(InputInterface $input, OutputInterface $output): int`
- Return `Cli::RETURN_SUCCESS` (0) or `Cli::RETURN_FAILURE` (1)
- Registered in `di.xml` under `Magento\Framework\Console\CommandListInterface`

---

## Cron Jobs

### Cron Class (`Cron/{Name}.php`)
- Plain class with `execute(): void` method
- Inject dependencies via constructor
- Registered in `crontab.xml` with schedule expression

---

## GraphQL

### Resolver (`Model/Resolver/{Name}.php`)
- Implements: `Magento\Framework\GraphQl\Query\ResolverInterface`
- `resolve(Field $field, $context, ResolveInfo $info, ?array $value, ?array $args)`
- Schema defined in `etc/schema.graphqls`

---

## Common Constructor Patterns

### Typical Model Repository
```php
public function __construct(
    private readonly {Entity}Factory $entityFactory,
    private readonly ResourceModel\{Entity} $resource,
    private readonly {Entity}SearchResultsInterfaceFactory $searchResultsFactory,
    private readonly CollectionFactory $collectionFactory,
    private readonly CollectionProcessorInterface $collectionProcessor,
) {}
```

### Typical Admin Controller
```php
public function __construct(
    Context $context,                          // Must pass to parent
    private readonly PageFactory $pageFactory,
    private readonly {Entity}RepositoryInterface $repository,
) {
    parent::__construct($context);
}
```

### Typical Frontend Controller
```php
public function __construct(
    private readonly PageFactory $pageFactory,
    private readonly {Entity}RepositoryInterface $repository,
) {}
```
