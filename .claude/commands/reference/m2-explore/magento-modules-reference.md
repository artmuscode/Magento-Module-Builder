# Magento 2 Modules Reference

Top modules with key classes, interfaces, and extension points.

---

## Magento_Catalog

**Purpose**: Products, categories, and attributes management.

### Key Interfaces
- `Magento\Catalog\Api\ProductRepositoryInterface` — Product CRUD
- `Magento\Catalog\Api\CategoryRepositoryInterface` — Category CRUD
- `Magento\Catalog\Api\CategoryLinkManagementInterface` — Product-category assignments
- `Magento\Catalog\Api\ProductAttributeRepositoryInterface` — Attribute management
- `Magento\Catalog\Api\Data\ProductInterface` — Product data model
- `Magento\Catalog\Api\Data\CategoryInterface` — Category data model
- `Magento\Catalog\Api\ProductTypeListInterface` — Product types
- `Magento\Catalog\Api\ProductLinkRepositoryInterface` — Related/crosssell/upsell

### Key Models
- `Magento\Catalog\Model\Product` — Product entity
- `Magento\Catalog\Model\Category` — Category entity
- `Magento\Catalog\Model\ResourceModel\Product` — Product resource
- `Magento\Catalog\Model\ResourceModel\Product\Collection` — Product collection
- `Magento\Catalog\Model\Product\Type\AbstractType` — Product type base
- `Magento\Catalog\Model\Layer` — Catalog layer (filtering)

### Key Events
`catalog_product_save_before/after`, `catalog_product_load_after`, `catalog_category_save_after`, `catalog_product_collection_load_after`, `catalog_product_get_final_price`

---

## Magento_Sales

**Purpose**: Orders, invoices, shipments, credit memos.

### Key Interfaces
- `Magento\Sales\Api\OrderRepositoryInterface` — Order CRUD
- `Magento\Sales\Api\OrderManagementInterface` — Order operations (cancel, hold, etc.)
- `Magento\Sales\Api\InvoiceRepositoryInterface` — Invoice CRUD
- `Magento\Sales\Api\ShipmentRepositoryInterface` — Shipment CRUD
- `Magento\Sales\Api\CreditmemoRepositoryInterface` — Credit memo CRUD
- `Magento\Sales\Api\InvoiceOrderInterface` — Create invoice for order
- `Magento\Sales\Api\ShipOrderInterface` — Create shipment for order
- `Magento\Sales\Api\RefundOrderInterface` — Create credit memo
- `Magento\Sales\Api\Data\OrderInterface` — Order data model
- `Magento\Sales\Api\Data\OrderItemInterface` — Order item data
- `Magento\Sales\Api\Data\InvoiceInterface` — Invoice data

### Key Models
- `Magento\Sales\Model\Order` — Order entity
- `Magento\Sales\Model\Order\Item` — Order item
- `Magento\Sales\Model\Order\Payment` — Payment on order
- `Magento\Sales\Model\Order\Address` — Order address
- `Magento\Sales\Model\Order\Status\History` — Status history

### Key Events
`sales_order_place_before/after`, `sales_order_save_after`, `sales_order_payment_place_end`, `sales_order_invoice_save_after`

---

## Magento_Customer

**Purpose**: Customer accounts, addresses, groups, sessions.

### Key Interfaces
- `Magento\Customer\Api\CustomerRepositoryInterface` — Customer CRUD
- `Magento\Customer\Api\AccountManagementInterface` — Registration, auth, password reset
- `Magento\Customer\Api\AddressRepositoryInterface` — Address CRUD
- `Magento\Customer\Api\GroupRepositoryInterface` — Customer groups
- `Magento\Customer\Api\Data\CustomerInterface` — Customer data
- `Magento\Customer\Api\Data\AddressInterface` — Address data

### Key Models
- `Magento\Customer\Model\Customer` — Customer entity
- `Magento\Customer\Model\Session` — Customer session
- `Magento\Customer\Model\ResourceModel\Customer\Collection`

### Key Events
`customer_register_success`, `customer_login`, `customer_logout`, `customer_save_after`

---

## Magento_Checkout

**Purpose**: Cart and checkout flow.

### Key Interfaces
- `Magento\Checkout\Api\GuestPaymentInformationManagementInterface`
- `Magento\Checkout\Api\PaymentInformationManagementInterface`
- `Magento\Checkout\Api\ShippingInformationManagementInterface`
- `Magento\Checkout\Api\TotalsInformationManagementInterface`

### Key Models
- `Magento\Checkout\Model\Session` — Checkout session
- `Magento\Checkout\Model\Cart` — Cart operations
- `Magento\Checkout\Model\Type\Onepage` — Onepage checkout
- `Magento\Checkout\Model\CompositeConfigProvider` — Checkout config

### Key Events
`checkout_cart_add_product_complete`, `checkout_submit_all_after`, `checkout_onepage_controller_success_action`

---

## Magento_Quote

**Purpose**: Shopping cart (quote) management.

### Key Interfaces
- `Magento\Quote\Api\CartRepositoryInterface` — Quote CRUD
- `Magento\Quote\Api\CartManagementInterface` — Cart operations
- `Magento\Quote\Api\CartItemRepositoryInterface` — Cart item CRUD
- `Magento\Quote\Api\CouponManagementInterface` — Coupon codes
- `Magento\Quote\Api\ShipmentEstimationInterface` — Shipping estimation
- `Magento\Quote\Api\Data\CartInterface` — Quote data
- `Magento\Quote\Api\Data\CartItemInterface` — Quote item data
- `Magento\Quote\Api\Data\TotalsInterface` — Cart totals

### Key Models
- `Magento\Quote\Model\Quote` — Quote entity
- `Magento\Quote\Model\Quote\Item` — Quote item
- `Magento\Quote\Model\Quote\Address` — Quote address
- `Magento\Quote\Model\Quote\Payment` — Quote payment

### Key Events
`sales_quote_save_before/after`, `sales_quote_collect_totals_after`, `sales_quote_item_set_product`

---

## Magento_Cms

**Purpose**: CMS pages, blocks, widgets.

### Key Interfaces
- `Magento\Cms\Api\PageRepositoryInterface` — CMS page CRUD
- `Magento\Cms\Api\BlockRepositoryInterface` — CMS block CRUD
- `Magento\Cms\Api\Data\PageInterface` — Page data
- `Magento\Cms\Api\Data\BlockInterface` — Block data

### Key Models
- `Magento\Cms\Model\Page` — CMS page
- `Magento\Cms\Model\Block` — CMS block

---

## Magento_Eav

**Purpose**: Entity-Attribute-Value system for dynamic attributes.

### Key Interfaces
- `Magento\Eav\Api\AttributeRepositoryInterface` — Attribute CRUD
- `Magento\Eav\Api\AttributeSetRepositoryInterface` — Attribute set CRUD
- `Magento\Eav\Api\AttributeGroupRepositoryInterface` — Attribute group CRUD

### Key Models
- `Magento\Eav\Model\Entity\Attribute` — Attribute entity
- `Magento\Eav\Model\Entity\Attribute\Source\AbstractSource` — Attribute source base
- `Magento\Eav\Model\Entity\Attribute\Backend\AbstractBackend` — Attribute backend
- `Magento\Eav\Model\Entity\Attribute\Frontend\AbstractFrontend` — Attribute frontend
- `Magento\Eav\Setup\EavSetup` — Install/update EAV attributes

---

## Magento_Payment

**Purpose**: Payment method framework.

### Key Interfaces
- `Magento\Payment\Api\PaymentMethodListInterface` — List payment methods
- `Magento\Payment\Api\Data\PaymentMethodInterface` — Payment method data

### Key Models
- `Magento\Payment\Model\Method\AbstractMethod` — Payment method base (legacy)
- `Magento\Payment\Model\MethodInterface` — Payment method interface
- `Magento\Payment\Gateway\Command\CommandPool` — Payment gateway commands
- `Magento\Payment\Gateway\Config\Config` — Gateway config
- `Magento\Payment\Gateway\Http\TransferBuilder` — HTTP transfer
- `Magento\Payment\Gateway\Validator\AbstractValidator` — Validation
- `Magento\Payment\Gateway\Request\BuilderInterface` — Request builder
- `Magento\Payment\Gateway\Response\HandlerInterface` — Response handler

### Payment Gateway Pattern (Modern)
Uses `Magento\Payment\Gateway\*` namespace. Configure in `di.xml` with:
- CommandPool (authorize, capture, void, refund)
- Request builders (build API request)
- Response handlers (parse API response)
- Validators (validate response)
- Transfer factory (HTTP client config)

---

## Magento_Shipping

**Purpose**: Shipping carrier framework.

### Key Interfaces
- `Magento\Shipping\Model\Carrier\CarrierInterface`

### Key Models
- `Magento\Shipping\Model\Carrier\AbstractCarrier` — Carrier base class
- `Magento\Shipping\Model\Rate\Result` — Rate result container
- `Magento\Quote\Model\Quote\Address\RateResult\Method` — Individual rate

---

## Magento_Tax

**Purpose**: Tax calculation and rules.

### Key Interfaces
- `Magento\Tax\Api\TaxRuleRepositoryInterface`
- `Magento\Tax\Api\TaxRateRepositoryInterface`
- `Magento\Tax\Api\TaxCalculationInterface`
- `Magento\Tax\Api\TaxClassRepositoryInterface`

---

## Magento_Store

**Purpose**: Multi-store management (websites, store groups, store views).

### Key Interfaces
- `Magento\Store\Api\StoreRepositoryInterface`
- `Magento\Store\Api\WebsiteRepositoryInterface`
- `Magento\Store\Api\GroupRepositoryInterface`
- `Magento\Store\Api\StoreConfigManagerInterface`

### Key Models
- `Magento\Store\Model\StoreManagerInterface` — Primary store access
- `Magento\Store\Model\Store` — Store view
- `Magento\Store\Model\Website` — Website
- `Magento\Store\Model\Group` — Store group

---

## Magento_Framework (Core)

### Key Classes
- `Magento\Framework\App\Config\ScopeConfigInterface` — System config reader
- `Magento\Framework\App\ResourceConnection` — Direct DB access
- `Magento\Framework\Event\ManagerInterface` — Event dispatch
- `Magento\Framework\Message\ManagerInterface` — Flash messages
- `Magento\Framework\UrlInterface` — URL builder
- `Magento\Framework\App\RequestInterface` — HTTP request
- `Magento\Framework\Serialize\SerializerInterface` — JSON serialization
- `Magento\Framework\Filesystem` — Filesystem access
- `Magento\Framework\Mail\Template\TransportBuilder` — Email sending
- `Magento\Framework\App\CacheInterface` — Cache operations
- `Psr\Log\LoggerInterface` — Logging

### Base Classes
- `Magento\Framework\Model\AbstractModel` — Model base
- `Magento\Framework\Model\ResourceModel\Db\AbstractDb` — Resource model base
- `Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection` — Collection base
- `Magento\Framework\App\Action\Action` — Controller base (legacy)
- `Magento\Framework\App\Action\HttpGetActionInterface` — GET controller (modern)
- `Magento\Framework\App\Action\HttpPostActionInterface` — POST controller (modern)
- `Magento\Framework\View\Element\Template` — Block base
- `Magento\Framework\DataObject` — Generic data container

### Result Types
- `Magento\Framework\Controller\Result\Json` — JSON response
- `Magento\Framework\Controller\Result\Redirect` — Redirect response
- `Magento\Framework\Controller\Result\Raw` — Raw response
- `Magento\Framework\View\Result\Page` — Page response
- `Magento\Framework\Controller\Result\Forward` — Forward to another action

---

## Magento_Ui

**Purpose**: Admin UI components (grids, forms).

### Key Classes
- `Magento\Ui\Component\Listing\Columns` — Grid columns
- `Magento\Ui\Component\Form` — Form component
- `Magento\Ui\DataProvider\AbstractDataProvider` — Data provider base
- `Magento\Framework\View\Element\UiComponent\DataProvider\DataProvider` — Generic data provider
- `Magento\Ui\Component\MassAction\Filter` — Mass action filter

---

## Magento_Backend

**Purpose**: Admin panel framework.

### Key Classes
- `Magento\Backend\App\Action` — Admin controller base
- `Magento\Backend\App\Action\Context` — Admin controller context
- `Magento\Backend\Model\Auth\Session` — Admin session
- `Magento\Backend\Block\Widget\Grid\Container` — Grid container
- `Magento\Backend\Block\Widget\Form\Container` — Form container

### ACL Constant Pattern
```php
const ADMIN_RESOURCE = 'Vendor_Module::resource_id';
```

---

## Magento_CatalogInventory

**Purpose**: Stock/inventory management (pre-MSI).

### Key Interfaces
- `Magento\CatalogInventory\Api\StockRegistryInterface` — Stock registry
- `Magento\CatalogInventory\Api\StockItemRepositoryInterface`
- `Magento\CatalogInventory\Api\Data\StockItemInterface`

---

## Magento_Directory

**Purpose**: Countries, regions, currency.

### Key Interfaces
- `Magento\Directory\Api\CountryInformationAcquirerInterface`
- `Magento\Directory\Api\CurrencyInformationAcquirerInterface`

### Key Models
- `Magento\Directory\Model\Currency` — Currency
- `Magento\Directory\Model\Country` — Country
- `Magento\Directory\Model\Region` — Region

---

## Magento_Search / Magento_Elasticsearch

**Purpose**: Catalog search, search engine integration.

### Key Interfaces
- `Magento\Search\Api\SearchInterface`
- `Magento\Framework\Search\SearchEngineInterface`

---

## Magento_Indexer

**Purpose**: Indexing framework.

### Key Interfaces
- `Magento\Framework\Indexer\ActionInterface` — Indexer action
- `Magento\Framework\Mview\ActionInterface` — Materialized view action

### Configuration
- `etc/indexer.xml` — Register indexer
- `etc/mview.xml` — Register materialized view with subscriptions

---

## Magento_Cron

**Purpose**: Cron job scheduling and execution.

### Key Classes
- `Magento\Cron\Model\Schedule` — Cron schedule entry

### Configuration
- `etc/crontab.xml` — Register cron jobs

---

## Magento_ImportExport

**Purpose**: Entity import/export framework.

### Key Classes
- `Magento\ImportExport\Model\Import\Entity\AbstractEntity` — Import entity base
- `Magento\ImportExport\Model\Export\Entity\AbstractEntity` — Export entity base

---

## Magento_Email

**Purpose**: Transactional email templates.

### Key Classes
- `Magento\Framework\Mail\Template\TransportBuilder` — Build and send emails
- `Magento\Email\Model\Template` — Email template model

### Configuration
- `etc/email_templates.xml` — Declare templates
- `view/frontend/email/` — Template files (.html)

---

## Magento_Config

**Purpose**: System configuration (admin panel config sections).

### Key Files
- `etc/adminhtml/system.xml` — Config sections/groups/fields
- `etc/config.xml` — Default config values

---

## Magento_Widget

**Purpose**: CMS widget framework.

### Key Classes
- `Magento\Widget\Block\BlockInterface` — Widget block interface
- `Magento\Framework\View\Element\Template` — Widget template base

### Configuration
- `etc/widget.xml` — Declare widgets

---

## Magento_GraphQl / Magento_CatalogGraphQl

**Purpose**: GraphQL API layer.

### Key Interfaces
- `Magento\Framework\GraphQl\Query\ResolverInterface` — Query resolver
- `Magento\Framework\GraphQl\Schema\Type\ResolveInfo` — Resolution info

### Configuration
- `etc/schema.graphqls` — GraphQL schema definition

---

## Magento_Webapi

**Purpose**: REST and SOAP API framework.

### Configuration
- `etc/webapi.xml` — API route definitions

### Key Classes
- `Magento\Webapi\Controller\Rest` — REST controller
- `Magento\Framework\Webapi\Rest\Request` — REST request
