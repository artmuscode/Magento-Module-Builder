# Magento 2 XML Configuration Patterns

Reference for generating XML config files. Each pattern includes the root document structure and individual elements.

## Variable Resolution
- **Vendor_Module**: derived from path (e.g., `Acme_Blog`)
- **vendor_module**: lowercase snake (e.g., `acme_blog`)
- **Vendor\Module**: namespace form (e.g., `Acme\Blog`)
- **vendor.module**: dot notation for queues (e.g., `acme.blog`)

---

## Module Declaration (`etc/module.xml`)

### Root + Module
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="Vendor_Module"/>
</config>
```

---

## Dependency Injection (`etc/di.xml`, `etc/frontend/di.xml`, `etc/adminhtml/di.xml`)

### Root
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">
    <!-- preferences, types, virtualTypes here -->
</config>
```

### Preference (Interface -> Implementation)
```xml
<preference for="Vendor\Module\Api\EntityRepositoryInterface"
            type="Vendor\Module\Model\EntityRepository"/>
```

### Plugin Declaration
```xml
<type name="Target\Class\Name">
    <plugin name="vendor_module_plugin_name"
            type="Vendor\Module\Plugin\PluginClass"/>
</type>
```

### Type Arguments
```xml
<type name="Vendor\Module\Model\MyClass">
    <arguments>
        <argument name="argName" xsi:type="string">value</argument>
    </arguments>
</type>
```

### Checkout ConfigProvider Registration
```xml
<type name="Magento\Checkout\Model\CompositeConfigProvider">
    <arguments>
        <argument name="configProviders" xsi:type="array">
            <item name="vendor_module_config_provider" xsi:type="object">
                Vendor\Module\Model\CheckoutConfigProvider
            </item>
        </argument>
    </arguments>
</type>
```

### Checkout Layout Processor Registration
```xml
<type name="Magento\Checkout\Block\OnePage">
    <arguments>
        <argument name="layoutProcessors" xsi:type="array">
            <item name="vendor_module_layout_processor" xsi:type="object">
                Vendor\Module\Block\Checkout\LayoutProcessor
            </item>
        </argument>
    </arguments>
</type>
```

### Custom Router Registration
```xml
<type name="Magento\Framework\App\RouterList">
    <arguments>
        <argument name="routerList" xsi:type="array">
            <item name="custom_router" xsi:type="array">
                <item name="class" xsi:type="string">Vendor\Module\Router\CustomRouter</item>
                <item name="sortOrder" xsi:type="string">40</item>
            </item>
        </argument>
    </arguments>
</type>
```

### CLI Command Registration
```xml
<type name="Magento\Framework\Console\CommandListInterface">
    <arguments>
        <argument name="commands" xsi:type="array">
            <item name="vendorModuleCommand" xsi:type="object">
                Vendor\Module\Console\Command\MyCommand
            </item>
        </argument>
    </arguments>
</type>
```

---

## Routes (`etc/frontend/routes.xml`, `etc/adminhtml/routes.xml`)

### Root + Router + Route
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:App/etc/routes.xsd">
    <router id="standard">
        <route id="route_id" frontName="route-name">
            <module name="Vendor_Module"/>
        </route>
    </router>
</config>
```
- Frontend: `router id="standard"`
- Admin: `router id="admin"`
- Route `id`: snake_case, `frontName`: lowercase hyphenated

---

## Database Schema (`etc/db_schema.xml`)

### Root + Full Table
```xml
<?xml version="1.0"?>
<schema xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Setup/Declaration/Schema/etc/schema.xsd">
    <table name="vendor_module_entity" engine="innodb" comment="Entity Table">
        <column xsi:type="int" name="id" padding="10" unsigned="true"
                nullable="false" identity="true" comment="Id"/>
        <column xsi:type="varchar" name="name" length="255" comment="Name"/>
        <column xsi:type="text" name="description" comment="Description"/>
        <column xsi:type="boolean" name="is_active" nullable="false"
                default="false" comment="Is Active"/>
        <column xsi:type="datetime" name="created_at" nullable="false"
                default="CURRENT_TIMESTAMP" on_update="false" comment="Created At"/>
        <column xsi:type="datetime" name="updated_at" nullable="false"
                default="CURRENT_TIMESTAMP" on_update="true" comment="Updated At"/>
        <constraint xsi:type="primary" referenceId="PRIMARY">
            <column name="id"/>
        </constraint>
    </table>
</schema>
```

### Column Types
| Type | Key Attributes |
|------|---------------|
| `int` | `padding`, `unsigned`, `identity`, `nullable` |
| `smallint` | `padding`, `unsigned`, `identity`, `nullable` |
| `varchar` | `length` (default 255), `nullable` |
| `text` | `nullable` |
| `boolean` | `default`, `nullable` |
| `datetime` | `default`, `on_update`, `nullable` |
| `decimal` | `precision`, `scale`, `nullable` |
| `blob` | `nullable` |

### Constraints
```xml
<!-- Primary Key -->
<constraint xsi:type="primary" referenceId="PRIMARY">
    <column name="id"/>
</constraint>

<!-- Unique -->
<constraint xsi:type="unique" referenceId="VENDOR_MODULE_TABLE_COL1_COL2">
    <column name="col1"/>
    <column name="col2"/>
</constraint>

<!-- Foreign Key -->
<constraint xsi:type="foreign"
    referenceId="VENDOR_MODULE_TABLE_COL_REFTABLE_REFCOL"
    table="vendor_module_entity"
    column="store_id"
    referenceTable="store"
    referenceColumn="store_id"
    onDelete="CASCADE"/>
```
- `onDelete`: `CASCADE`, `SET NULL`, `NO ACTION`

### Index
```xml
<index referenceId="VENDOR_MODULE_TABLE_COLUMN" indexType="btree">
    <column name="column_name"/>
</index>
```
- `indexType`: `btree`, `fulltext`, `hash`

---

## Events (`etc/events.xml`, `etc/frontend/events.xml`, `etc/adminhtml/events.xml`)

### Root + Event + Observer
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Event/etc/events.xsd">
    <event name="event_name_here">
        <observer name="vendor_module_observer_name"
                  instance="Vendor\Module\Observer\ObserverClass"/>
    </event>
</config>
```

---

## Layout XML (`view/frontend/layout/`, `view/adminhtml/layout/`)

### Page Root
```xml
<?xml version="1.0"?>
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <!-- blocks, referenceContainers, etc. -->
    </body>
</page>
```

### Reference Container
```xml
<referenceContainer name="content">
    <!-- add blocks here -->
</referenceContainer>
```

### Block with Template
```xml
<block name="vendor.module.block_name"
       template="Vendor_Module::template-name.phtml"/>
```

### Block with ViewModel
```xml
<block name="vendor.module.block_name"
       template="Vendor_Module::template-name.phtml">
    <arguments>
        <argument name="view_model" xsi:type="object">
            Vendor\Module\ViewModel\MyViewModel
        </argument>
    </arguments>
</block>
```

### JS Layout Component (for checkout/dynamic UI)
```xml
<arguments>
    <argument name="jsLayout" xsi:type="array">
        <item name="components" xsi:type="array">
            <item name="myComponent" xsi:type="array">
                <item name="component" xsi:type="string">Vendor_Module/js/my-component</item>
            </item>
        </item>
    </argument>
</arguments>
```

### Page Layout Root
```xml
<?xml version="1.0"?>
<layout xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_layout.xsd">
    <!-- containers here -->
</layout>
```

---

## ACL (`etc/acl.xml`)

### Full ACL Structure
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Acl/etc/acl.xsd">
    <acl>
        <resources>
            <resource id="Magento_Backend::admin">
                <resource id="Magento_Backend::content">
                    <resource id="Vendor_Module::top_level" title="Module Title" sortOrder="900">
                        <resource id="Vendor_Module::entity" title="Manage Entities"/>
                    </resource>
                </resource>
            </resource>
        </resources>
    </acl>
</config>
```
- Nest under existing Magento sections: `content`, `stores`, `system`, `marketing`, `reports`, `catalog`

---

## Admin Menu (`etc/adminhtml/menu.xml`)

### Full Menu with Parent + Child
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Backend:etc/menu.xsd">
    <menu>
        <add id="Vendor_Module::top_level"
             title="Module Title"
             translate="title"
             module="Vendor_Module"
             resource="Vendor_Module::top_level"
             sortOrder="900"/>
        <add id="Vendor_Module::entity"
             title="Manage Entities"
             translate="title"
             module="Vendor_Module"
             resource="Vendor_Module::top_level"
             parent="Vendor_Module::top_level"
             sortOrder="10"
             action="route_id/entity"/>
    </menu>
</config>
```

---

## System Configuration (`etc/adminhtml/system.xml`)

### Root
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Config:etc/system_file.xsd">
    <system>
        <tab id="vendor" translate="label" sortOrder="900">
            <label>Vendor Name</label>
        </tab>
        <section id="vendor_module" translate="label" sortOrder="10"
                 showInDefault="1" showInWebsite="1" showInStore="1">
            <label>Module Name</label>
            <tab>vendor</tab>
            <resource>Vendor_Module::config</resource>
            <group id="general" translate="label" sortOrder="10"
                   showInDefault="1" showInWebsite="1" showInStore="1">
                <label>General Settings</label>
                <field id="enabled" translate="label" type="select" sortOrder="10"
                       showInDefault="1" showInWebsite="1" showInStore="1">
                    <label>Enable Module</label>
                    <source_model>Magento\Config\Model\Config\Source\Yesno</source_model>
                </field>
            </group>
        </section>
    </system>
</config>
```

---

## Default Config Values (`etc/config.xml`)

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Store:etc/config.xsd">
    <default>
        <vendor_module>
            <general>
                <enabled>1</enabled>
            </general>
        </vendor_module>
    </default>
</config>
```

---

## Web API (`etc/webapi.xml`)

### Root + Routes
```xml
<?xml version="1.0"?>
<routes xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Webapi:etc/webapi.xsd">
    <route url="/V1/vendor/entities/:entityId" method="GET">
        <service class="Vendor\Module\Api\EntityRepositoryInterface" method="getById"/>
        <resources>
            <resource ref="Vendor_Module::entity"/>
        </resources>
    </route>
    <route url="/V1/vendor/entities" method="POST">
        <service class="Vendor\Module\Api\EntityRepositoryInterface" method="save"/>
        <resources>
            <resource ref="Vendor_Module::entity"/>
        </resources>
    </route>
</routes>
```

---

## Extension Attributes (`etc/extension_attributes.xml`)

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Api/etc/extension_attributes.xsd">
    <extension_attributes for="Magento\Catalog\Api\Data\ProductInterface">
        <attribute code="custom_data"
                   type="Vendor\Module\Api\Data\CustomDataInterface"/>
    </extension_attributes>
</config>
```

---

## CSP Whitelist (`etc/csp_whitelist.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<csp_whitelist xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Csp:etc/csp_whitelist.xsd">
    <policies>
        <policy id="script-src">
            <values>
                <value id="example_com" type="host">https://example.com</value>
            </values>
        </policy>
    </policies>
</csp_whitelist>
```
- Policy IDs: `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `frame-src`, `object-src`

---

## Crontab (`etc/crontab.xml`)

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Cron:etc/crontab.xsd">
    <group id="default">
        <job name="vendor_module_process_queue"
             instance="Vendor\Module\Cron\ProcessQueue"
             method="execute">
            <schedule>*/5 * * * *</schedule>
        </job>
    </group>
</config>
```

---

## Theme Declaration (`theme.xml`)

```xml
<?xml version="1.0"?>
<theme xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:noNamespaceSchemaLocation="urn:magento:framework:Config/etc/theme.xsd">
    <title>Theme Name</title>
    <parent>Magento/blank</parent>
    <media>
        <preview_image>media/preview.jpg</preview_image>
    </media>
</theme>
```

---

## Page Layouts (`etc/page_layouts.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<page_layouts xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:noNamespaceSchemaLocation="urn:magento:framework:View/PageLayout/etc/layouts.xsd">
    <layout id="custom-layout">
        <label translate="true">Custom Layout</label>
    </layout>
</page_layouts>
```

---

## UI Components

### Listing Root (`view/adminhtml/ui_component/{entity}_listing.xml`)
```xml
<?xml version="1.0"?>
<listing xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Ui:etc/ui_configuration.xsd">
    <!-- dataSource, columns, etc. -->
</listing>
```

### Form Root (`view/adminhtml/ui_component/{entity}_form.xml`)
```xml
<?xml version="1.0"?>
<form xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Ui:etc/ui_configuration.xsd">
    <!-- dataSource, fieldsets, etc. -->
</form>
```

---

## Message Queue

### Communication (`etc/communication.xml`)
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Communication/etc/communication.xsd">
    <topic name="vendor.module.entity" request="string"/>
</config>
```

### Queue Topology (`etc/queue_topology.xml`)
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework-message-queue:etc/topology.xsd">
    <exchange name="magento">
        <binding id="vendor.module.entity"
                 topic="vendor.module.entity"
                 destination="vendor.module.entity"/>
    </exchange>
</config>
```

### Queue Publisher (`etc/queue_publisher.xml`)
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework-message-queue:etc/publisher.xsd">
    <publisher topic="vendor.module.entity"/>
</config>
```

### Queue Consumer (`etc/queue_consumer.xml`)
```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework-message-queue:etc/consumer.xsd">
    <consumer name="vendor.module.entity"
              queue="vendor.module.entity"
              handler="Vendor\Module\Model\EntityConsumer::process"/>
</config>
```

---

## Composer JSON (`composer.json`)

### Module
```json
{
    "name": "vendor/module-name",
    "description": "Module description.",
    "require": {
        "php": "^8.1",
        "magento/framework": "^103"
    },
    "type": "magento2-module",
    "version": "1.0.0",
    "license": ["MIT"],
    "autoload": {
        "files": ["registration.php"],
        "psr-4": { "Vendor\\Module\\": "" }
    }
}
```

### Theme
```json
{
    "name": "vendor/theme-frontend-name",
    "description": "Theme description.",
    "require": {
        "php": "^8.1",
        "magento/framework": "^103",
        "magento/theme-frontend-blank": "^100"
    },
    "type": "magento2-theme",
    "version": "1.0.0",
    "license": ["MIT"],
    "autoload": {
        "files": ["registration.php"]
    }
}
```
