# Magento 2 DI Injection Recipes

Quick reference: "I want to do X, inject Y"

---

## Data Access

### I want to load/save/delete an entity
```php
use Vendor\Module\Api\PostRepositoryInterface;
// $this->postRepository->getById($id);
// $this->postRepository->save($post);
// $this->postRepository->delete($post);
```

### I want to search/filter entities
```php
use Magento\Framework\Api\SearchCriteriaBuilder;
// $criteria = $this->searchCriteriaBuilder->addFilter('status', 'active')->create();
// $results = $this->postRepository->getList($criteria);
```

### I want to add sort order to search
```php
use Magento\Framework\Api\SortOrderBuilder;
use Magento\Framework\Api\SearchCriteriaBuilder;
```

### I want to paginate results
```php
use Magento\Framework\Api\SearchCriteriaBuilder;
// $this->searchCriteriaBuilder->setPageSize(10)->setCurrentPage(1);
```

### I want to use filter groups (OR conditions)
```php
use Magento\Framework\Api\FilterBuilder;
use Magento\Framework\Api\Search\FilterGroupBuilder;
use Magento\Framework\Api\SearchCriteriaBuilder;
```

### I want direct database queries
```php
use Magento\Framework\App\ResourceConnection;
// $connection = $this->resourceConnection->getConnection();
// $table = $this->resourceConnection->getTableName('table_name');
// $connection->select()->from($table)->where('id = ?', $id);
```

---

## Product Operations

### I want to load a product
```php
use Magento\Catalog\Api\ProductRepositoryInterface;
// $this->productRepository->get($sku);
// $this->productRepository->getById($id);
```

### I want to get product attributes
```php
use Magento\Catalog\Api\ProductAttributeRepositoryInterface;
// $this->attributeRepository->get('attribute_code');
```

### I want to get product categories
```php
use Magento\Catalog\Api\CategoryLinkManagementInterface;
// $this->categoryLinkManagement->getAssignedProducts($categoryId);
```

### I want to manage product images
```php
use Magento\Catalog\Api\ProductAttributeMediaGalleryManagementInterface;
```

### I want to work with product stock
```php
use Magento\CatalogInventory\Api\StockRegistryInterface;
// $this->stockRegistry->getStockItemBySku($sku);
```

### I want to get product price (with rules)
```php
use Magento\Catalog\Pricing\Price\FinalPrice;
// $product->getPriceInfo()->getPrice(FinalPrice::PRICE_CODE)->getValue();
```

### I want a product collection
```php
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
// $collection = $this->collectionFactory->create();
// $collection->addAttributeToSelect('*')->addFieldToFilter('status', 1);
```

---

## Cart / Quote Operations

### I want to get the current cart
```php
use Magento\Checkout\Model\Session as CheckoutSession;
// $this->checkoutSession->getQuote();
```

### I want to manage cart items programmatically
```php
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Api\CartItemRepositoryInterface;
```

### I want to add a product to cart
```php
use Magento\Quote\Api\CartItemRepositoryInterface;
use Magento\Quote\Api\Data\CartItemInterfaceFactory;
```

### I want to apply a coupon code
```php
use Magento\Quote\Api\CouponManagementInterface;
// $this->couponManagement->set($cartId, $couponCode);
```

### I want to get shipping methods
```php
use Magento\Quote\Api\ShipmentEstimationInterface;
```

---

## Order Operations

### I want to load/search orders
```php
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
```

### I want to create an invoice
```php
use Magento\Sales\Api\InvoiceOrderInterface;
// $this->invoiceOrder->execute($orderId);
```

### I want to create a shipment
```php
use Magento\Sales\Api\ShipOrderInterface;
```

### I want to create a credit memo
```php
use Magento\Sales\Api\RefundOrderInterface;
```

### I want to add a comment to an order
```php
use Magento\Sales\Api\OrderStatusHistoryRepositoryInterface;
use Magento\Sales\Api\Data\OrderStatusHistoryInterfaceFactory;
```

### I want to change order status
```php
use Magento\Sales\Api\OrderManagementInterface;
// Also possible: load order via repository, set state/status, save
```

---

## Customer Operations

### I want to load/manage customers
```php
use Magento\Customer\Api\CustomerRepositoryInterface;
// $this->customerRepository->getById($id);
// $this->customerRepository->get($email); // by email
```

### I want to get the current customer
```php
use Magento\Customer\Model\Session as CustomerSession;
// $this->customerSession->getCustomerId();
// $this->customerSession->isLoggedIn();
```

### I want to manage customer addresses
```php
use Magento\Customer\Api\AddressRepositoryInterface;
```

### I want to manage customer groups
```php
use Magento\Customer\Api\GroupRepositoryInterface;
```

### I want to authenticate a customer
```php
use Magento\Customer\Api\AccountManagementInterface;
// $this->accountManagement->authenticate($email, $password);
```

---

## Store / Configuration

### I want to read system config values
```php
use Magento\Framework\App\Config\ScopeConfigInterface;
// $this->scopeConfig->getValue('section/group/field', ScopeInterface::SCOPE_STORE);
```

### I want to write config values
```php
use Magento\Framework\App\Config\Storage\WriterInterface;
// $this->configWriter->save('section/group/field', $value, $scope, $scopeId);
```

### I want to get the current store
```php
use Magento\Store\Model\StoreManagerInterface;
// $this->storeManager->getStore();
// $this->storeManager->getStore()->getId();
// $this->storeManager->getWebsite();
```

### I want to check the current area (frontend/admin)
```php
use Magento\Framework\App\State;
// $this->appState->getAreaCode(); // 'frontend', 'adminhtml', 'webapi_rest', etc.
```

---

## URL / Request / Response

### I want to build URLs
```php
use Magento\Framework\UrlInterface;
// $this->url->getUrl('route/controller/action', ['param' => 'value']);
```

### I want to get the current request
```php
use Magento\Framework\App\RequestInterface;
// $this->request->getParam('id');
// $this->request->getPostValue();
```

### I want to redirect
```php
use Magento\Framework\Controller\Result\RedirectFactory;
// return $this->redirectFactory->create()->setPath('route/controller/action');
```

### I want to return JSON
```php
use Magento\Framework\Controller\Result\JsonFactory;
// return $this->jsonFactory->create()->setData(['success' => true]);
```

### I want to return a page
```php
use Magento\Framework\View\Result\PageFactory;
// return $this->pageFactory->create();
```

---

## Logging / Debugging

### I want to log messages
```php
use Psr\Log\LoggerInterface;
// $this->logger->info('Message');
// $this->logger->error('Error', ['exception' => $e]);
// $this->logger->debug('Debug data', ['key' => 'value']);
```

### I want a custom log file
```php
// In di.xml:
<type name="Vendor\Module\Logger\Handler">
    <arguments>
        <argument name="fileName" xsi:type="string">/var/log/vendor_module.log</argument>
    </arguments>
</type>
// Handler extends Magento\Framework\Logger\Handler\Base
// Logger extends Monolog\Logger
```

---

## Cache

### I want to use cache
```php
use Magento\Framework\App\CacheInterface;
// $this->cache->save($data, $cacheId, ['TAG'], $lifetime);
// $data = $this->cache->load($cacheId);
// $this->cache->remove($cacheId);
```

### I want to clean cache programmatically
```php
use Magento\Framework\App\Cache\TypeListInterface;
use Magento\Framework\App\Cache\Frontend\Pool;
// $this->typeList->cleanType('config');
```

---

## Email

### I want to send transactional emails
```php
use Magento\Framework\Mail\Template\TransportBuilder;
use Magento\Framework\Translate\Inline\StateInterface;
// $this->inlineTranslation->suspend();
// $transport = $this->transportBuilder
//     ->setTemplateIdentifier('email_template_id')
//     ->setTemplateOptions(['area' => Area::AREA_FRONTEND, 'store' => $storeId])
//     ->setTemplateVars(['var1' => 'value1'])
//     ->setFromByScope('general')
//     ->addTo($email, $name)
//     ->getTransport();
// $transport->sendMessage();
// $this->inlineTranslation->resume();
```

---

## File / Media Operations

### I want to upload files
```php
use Magento\MediaStorage\Model\File\UploaderFactory;
// $uploader = $this->uploaderFactory->create(['fileId' => 'field_name']);
```

### I want to work with the filesystem
```php
use Magento\Framework\Filesystem;
use Magento\Framework\App\Filesystem\DirectoryList;
// $mediaDir = $this->filesystem->getDirectoryWrite(DirectoryList::MEDIA);
```

### I want to read/write files
```php
use Magento\Framework\Filesystem\Driver\File;
// $this->fileDriver->isExists($path);
// $this->fileDriver->fileGetContents($path);
```

---

## Serialization

### I want to serialize/deserialize data
```php
use Magento\Framework\Serialize\SerializerInterface;
// $json = $this->serializer->serialize($data);
// $data = $this->serializer->unserialize($json);
```

---

## Message / Notification

### I want to show flash messages
```php
use Magento\Framework\Message\ManagerInterface;
// $this->messageManager->addSuccessMessage(__('Saved.'));
// $this->messageManager->addErrorMessage(__('Error occurred.'));
// $this->messageManager->addWarningMessage(__('Warning.'));
```

---

## Translation

### I want to translate strings
```php
// Use __() function in templates/classes:
// __('String to translate')
// __('Hello %1', $name)
```

---

## Event Dispatching

### I want to dispatch events
```php
use Magento\Framework\Event\ManagerInterface as EventManagerInterface;
// $this->eventManager->dispatch('my_custom_event', ['key' => $value]);
```

---

## Registry (Deprecated but still used)

### I want to share data between classes
```php
use Magento\Framework\Registry;
// $this->registry->register('key', $value);
// $value = $this->registry->registry('key');
```
**Note**: Deprecated since 2.3. Use service contracts or session to pass data instead.

---

## Factory Pattern

### I want to create new entity instances
Always inject `{ClassName}Factory` — Magento auto-generates these:
```php
use Vendor\Module\Model\PostFactory;
// $post = $this->postFactory->create();
// $post->setTitle('New Post');
```

### I want to create new data interface instances
```php
use Vendor\Module\Api\Data\PostInterfaceFactory;
// $post = $this->postInterfaceFactory->create();
```
