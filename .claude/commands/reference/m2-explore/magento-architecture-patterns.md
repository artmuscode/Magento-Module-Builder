# Magento 2 Architecture Patterns

## Service Contracts

The primary API pattern in Magento 2. Service contracts define stable interfaces that decouple modules.

### Structure
```
Api/
  {Entity}RepositoryInterface.php    # CRUD + search operations
Api/Data/
  {Entity}Interface.php              # Data model (getters/setters)
  {Entity}SearchResultsInterface.php # Search result wrapper
```

### Repository Interface Pattern
```php
interface PostRepositoryInterface
{
    public function save(PostInterface $post): PostInterface;
    public function getById(int $postId): PostInterface;
    public function getList(SearchCriteriaInterface $searchCriteria): PostSearchResultsInterface;
    public function delete(PostInterface $post): bool;
    public function deleteById(int $postId): bool;
}
```

### Data Interface Pattern
```php
interface PostInterface extends ExtensibleDataInterface
{
    const ENTITY_ID = 'entity_id';
    const TITLE = 'title';

    public function getEntityId(): ?int;
    public function setEntityId(?int $entityId): self;
    public function getTitle(): ?string;
    public function setTitle(?string $title): self;
    public function getExtensionAttributes(): ?PostExtensionInterface;
    public function setExtensionAttributes(PostExtensionInterface $ext): self;
}
```

### Wiring via di.xml
```xml
<preference for="Vendor\Module\Api\PostRepositoryInterface"
            type="Vendor\Module\Model\PostRepository" />
<preference for="Vendor\Module\Api\Data\PostInterface"
            type="Vendor\Module\Model\Post" />
```

## Plugin System (Interceptors)

Modifies behavior of any public method without modifying the original class.

### Types
| Type | Method Prefix | Use Case |
|------|--------------|----------|
| Before | `before{Method}` | Modify input arguments |
| After | `after{Method}` | Modify return value |
| Around | `around{Method}` | Full control (wrap execution) |

### Before Plugin
```php
public function beforeSetName(ProductInterface $subject, string $name): array
{
    return [strtolower($name)]; // Modified arguments
}
```

### After Plugin
```php
public function afterGetName(ProductInterface $subject, string $result): string
{
    return strtoupper($result); // Modified result
}
```

### Around Plugin
```php
public function aroundSave(
    PostRepositoryInterface $subject,
    callable $proceed,
    PostInterface $post
): PostInterface {
    // Before logic
    $result = $proceed($post);
    // After logic
    return $result;
}
```

### Plugin di.xml Declaration
```xml
<type name="Magento\Catalog\Model\Product">
    <plugin name="vendor_module_product_plugin"
            type="Vendor\Module\Plugin\ProductPlugin"
            sortOrder="10"
            disabled="false" />
</type>
```

### Plugin Limitations
- Cannot intercept: final methods, final classes, non-public methods, static methods, `__construct`, virtual types, objects created with `new` (not ObjectManager)
- Avoid around plugins when before/after suffice (performance)
- Sort order: lower = executes first (for before), last (for after)

## Observer Pattern

Loose coupling via events. Observers react to dispatched events without modifying core flow.

### Observer Class
```php
class ProductSaveObserver implements ObserverInterface
{
    public function execute(Observer $observer): void
    {
        $product = $observer->getEvent()->getProduct();
        // React to event
    }
}
```

### Event Registration (events.xml)
```xml
<event name="catalog_product_save_after">
    <observer name="vendor_module_product_save"
              instance="Vendor\Module\Observer\ProductSaveObserver" />
</event>
```

### Dispatching Custom Events
```php
$this->eventManager->dispatch('vendor_module_custom_event', [
    'entity' => $entity,
    'store_id' => $storeId,
]);
```

## Dependency Injection

Magento's DI container (ObjectManager) manages all object creation. Configuration via `di.xml`.

### Constructor Injection (Preferred)
```php
public function __construct(
    private readonly PostRepositoryInterface $postRepository,
    private readonly SearchCriteriaBuilder $searchCriteriaBuilder,
    private readonly LoggerInterface $logger
) {}
```

### di.xml Configuration Types

#### Preference (Interface → Implementation)
```xml
<preference for="Vendor\Module\Api\PostRepositoryInterface"
            type="Vendor\Module\Model\PostRepository" />
```

#### Type Arguments
```xml
<type name="Vendor\Module\Model\PostRepository">
    <arguments>
        <argument name="collectionFactory" xsi:type="object">
            Vendor\Module\Model\ResourceModel\Post\CollectionFactory
        </argument>
    </arguments>
</type>
```

#### Virtual Types
```xml
<virtualType name="VendorModulePostGridDataProvider"
             type="Magento\Framework\View\Element\UiComponent\DataProvider\DataProvider">
    <arguments>
        <argument name="collection" xsi:type="object">
            Vendor\Module\Model\ResourceModel\Post\Grid\Collection
        </argument>
    </arguments>
</virtualType>
```

#### Proxy (Lazy Loading)
```xml
<type name="Vendor\Module\Console\Command\HeavyCommand">
    <arguments>
        <argument name="session" xsi:type="object">
            Magento\Customer\Model\Session\Proxy
        </argument>
    </arguments>
</type>
```

## EAV (Entity-Attribute-Value)

Used by products, categories, customers, customer addresses. Allows dynamic attributes without schema changes.

### Key Components
- **Entity**: The main record (e.g., `catalog_product_entity`)
- **Attribute**: Metadata about a property (e.g., `name`, `price`, `sku`)
- **Value Tables**: Separate tables per data type (`_varchar`, `_int`, `_decimal`, `_text`, `_datetime`)

### Adding EAV Attributes (Data Patch)
```php
class AddCustomAttribute implements DataPatchInterface
{
    public function __construct(
        private readonly ModuleDataSetupInterface $moduleDataSetup,
        private readonly EavSetupFactory $eavSetupFactory
    ) {}

    public function apply(): void
    {
        $eavSetup = $this->eavSetupFactory->create(['setup' => $this->moduleDataSetup]);
        $eavSetup->addAttribute(Product::ENTITY, 'custom_attr', [
            'type' => 'varchar',
            'label' => 'Custom Attribute',
            'input' => 'text',
            'required' => false,
            'visible' => true,
            'global' => ScopedAttributeInterface::SCOPE_STORE,
            'group' => 'General',
        ]);
    }
}
```

## UI Components

Admin grids and forms use the UI Component framework.

### Grid (Listing)
- XML definition: `view/adminhtml/ui_component/{entity}_listing.xml`
- Data source: `Magento\Framework\View\Element\UiComponent\DataProvider\DataProvider`
- Collection: grid-specific collection registered via di.xml
- Columns: defined as `<column>` elements with data type and rendering

### Form
- XML definition: `view/adminhtml/ui_component/{entity}_form.xml`
- Data provider: custom class extending `DataProvider`
- Fieldsets and fields defined in XML
- Save/delete actions mapped to controllers

### Wiring in di.xml
```xml
<type name="Magento\Framework\View\Element\UiComponent\DataProvider\CollectionFactory">
    <arguments>
        <argument name="collections" xsi:type="array">
            <item name="vendor_entity_listing_data_source" xsi:type="string">
                Vendor\Module\Model\ResourceModel\Entity\Grid\Collection
            </item>
        </argument>
    </arguments>
</type>
```

## Cron System

### Cron Class
```php
class ProcessQueue
{
    public function execute(): void
    {
        // Cron job logic
    }
}
```

### crontab.xml
```xml
<group id="default">
    <job name="vendor_module_process_queue"
         instance="Vendor\Module\Cron\ProcessQueue"
         method="execute">
        <schedule>*/5 * * * *</schedule>
    </job>
</group>
```

## CLI Commands

```php
class ReindexCommand extends Command
{
    protected function configure(): void
    {
        $this->setName('vendor:reindex');
        $this->setDescription('Reindex custom data');
        $this->addArgument('type', InputArgument::OPTIONAL, 'Index type');
        $this->addOption('force', 'f', InputOption::VALUE_NONE, 'Force reindex');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // Command logic
        return Cli::RETURN_SUCCESS;
    }
}
```

### Registration in di.xml
```xml
<type name="Magento\Framework\Console\CommandListInterface">
    <arguments>
        <argument name="commands" xsi:type="array">
            <item name="vendorReindex" xsi:type="object">
                Vendor\Module\Console\Command\ReindexCommand
            </item>
        </argument>
    </arguments>
</type>
```

## API (webapi.xml)

```xml
<route url="/V1/vendor/posts/:postId" method="GET">
    <service class="Vendor\Module\Api\PostRepositoryInterface" method="getById" />
    <resources>
        <resource ref="Vendor_Module::post_view" />
    </resources>
</route>
```

## ACL (Access Control)

```xml
<acl>
    <resources>
        <resource id="Magento_Backend::admin">
            <resource id="Vendor_Module::top_level" title="Module Name">
                <resource id="Vendor_Module::entity_manage" title="Manage Entities" />
                <resource id="Vendor_Module::config" title="Configuration" />
            </resource>
        </resource>
    </resources>
</acl>
```

## Message Queue (Async)

### queue_topology.xml
```xml
<topology>
    <exchange name="vendor.module.exchange" type="topic" connection="amqp">
        <binding id="vendorModuleBinding" topic="vendor.module.topic"
                 destinationType="queue" destination="vendor.module.queue" />
    </exchange>
</topology>
```

### queue_consumer.xml
```xml
<consumer name="vendor.module.consumer"
          queue="vendor.module.queue"
          handler="Vendor\Module\Model\Consumer::process"
          consumerInstance="Magento\Framework\MessageQueue\Consumer"
          connection="amqp"
          maxMessages="1000" />
```

## GraphQL

### schema.graphqls
```graphql
type Query {
    vendorPosts(
        filter: VendorPostFilterInput @doc(description: "Filter posts")
        pageSize: Int = 20 @doc(description: "Page size")
        currentPage: Int = 1 @doc(description: "Current page")
    ): VendorPostOutput @resolver(class: "Vendor\\Module\\Model\\Resolver\\Posts")
}
```

### Resolver
```php
class Posts implements ResolverInterface
{
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null)
    {
        // Resolve and return data
    }
}
```
