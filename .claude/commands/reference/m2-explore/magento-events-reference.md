# Magento 2 Events Reference

## How Events Work

Events are dispatched via `Magento\Framework\Event\ManagerInterface::dispatch()`. Observers register in `events.xml` (global, frontend, or adminhtml scope).

### Event Data Access
```php
public function execute(Observer $observer): void
{
    $event = $observer->getEvent();
    $entity = $event->getData('entity_key'); // or $event->getEntityKey()
}
```

---

## Catalog Events

### Product Events
| Event | Data Keys | When |
|-------|-----------|------|
| `catalog_product_save_before` | `product`, `data_object` | Before product save |
| `catalog_product_save_after` | `product`, `data_object` | After product save |
| `catalog_product_delete_before` | `product` | Before product delete |
| `catalog_product_delete_after` | `product` | After product delete |
| `catalog_product_load_after` | `product`, `data_object` | After product load |
| `catalog_product_collection_load_after` | `collection` | After product collection loads |
| `catalog_product_is_salable_before` | `product` | Before salability check |
| `catalog_product_is_salable_after` | `product`, `salable` | After salability check |
| `catalog_product_get_final_price` | `product`, `qty` | During final price calculation |
| `catalog_product_type_prepare_full_options` | `product`, `buy_request`, `transport` | Before adding to cart |
| `catalog_product_validate_before` | `product` | Before product validation |
| `catalog_controller_product_view` | `product` | Product page view controller |
| `catalog_product_new_action` | `product` | New product action in admin |
| `catalog_product_edit_action` | `product` | Edit product action in admin |
| `catalog_product_attribute_update_before` | `attributes_data`, `product_ids`, `store_id` | Before mass attribute update |

### Category Events
| Event | Data Keys | When |
|-------|-----------|------|
| `catalog_category_save_before` | `category`, `data_object` | Before category save |
| `catalog_category_save_after` | `category`, `data_object` | After category save |
| `catalog_category_delete_before` | `category` | Before category delete |
| `catalog_category_delete_after` | `category` | After category delete |
| `catalog_category_change_products` | `category`, `product_ids` | When products assigned to category change |
| `catalog_category_prepare_save` | `category`, `request` | Before save in controller |
| `catalog_category_flat_loadnodes_before` | `select` | Before flat category nodes load |

---

## Sales / Order Events

### Order Events
| Event | Data Keys | When |
|-------|-----------|------|
| `sales_order_place_before` | `order` | Before order placement |
| `sales_order_place_after` | `order` | After order placement |
| `sales_order_save_before` | `order`, `data_object` | Before order save |
| `sales_order_save_after` | `order`, `data_object` | After order save |
| `sales_order_load_after` | `order`, `data_object` | After order load |
| `sales_order_delete_before` | `order` | Before order delete |
| `order_cancel_after` | `order` | After order cancellation |
| `sales_order_payment_place_start` | `payment` | Start of payment placement |
| `sales_order_payment_place_end` | `payment` | End of payment placement |
| `sales_order_payment_capture` | `payment`, `invoice` | Payment capture |
| `sales_order_payment_refund` | `payment`, `creditmemo` | Payment refund |
| `sales_order_payment_void` | `payment` | Payment void |
| `sales_order_state_change_before` | `order`, `payment` | Before order state change |
| `sales_order_status_unassign` | `status`, `state` | When status unassigned from state |

### Invoice Events
| Event | Data Keys | When |
|-------|-----------|------|
| `sales_order_invoice_save_before` | `invoice`, `data_object` | Before invoice save |
| `sales_order_invoice_save_after` | `invoice`, `data_object` | After invoice save |
| `sales_order_invoice_pay` | `invoice` | When invoice paid |
| `sales_order_invoice_register` | `invoice`, `order` | When invoice registered |
| `sales_order_invoice_cancel` | `invoice` | When invoice cancelled |

### Shipment Events
| Event | Data Keys | When |
|-------|-----------|------|
| `sales_order_shipment_save_before` | `shipment`, `data_object` | Before shipment save |
| `sales_order_shipment_save_after` | `shipment`, `data_object` | After shipment save |
| `sales_order_shipment_track_save_before` | `track`, `data_object` | Before tracking save |

### Credit Memo Events
| Event | Data Keys | When |
|-------|-----------|------|
| `sales_order_creditmemo_save_before` | `creditmemo`, `data_object` | Before credit memo save |
| `sales_order_creditmemo_save_after` | `creditmemo`, `data_object` | After credit memo save |
| `sales_order_creditmemo_refund` | `creditmemo` | When credit memo refunded |

---

## Checkout Events

| Event | Data Keys | When |
|-------|-----------|------|
| `checkout_cart_add_product_complete` | `product`, `request`, `response` | After product added to cart |
| `checkout_cart_update_items_before` | `cart`, `info` | Before cart items update |
| `checkout_cart_update_items_after` | `cart`, `info` | After cart items update |
| `checkout_cart_save_before` | `cart` | Before cart save |
| `checkout_cart_save_after` | `cart` | After cart save |
| `checkout_cart_product_add_after` | `quote_item`, `product` | After product added to quote |
| `checkout_submit_all_after` | `order`, `quote` | After checkout submit completes |
| `checkout_onepage_controller_success_action` | `order_ids` | Order success page |
| `checkout_type_onepage_save_order_after` | `order`, `quote` | After onepage order saved |
| `checkout_allow_guest` | `quote`, `store`, `result` | When checking guest checkout allowed |
| `sales_quote_save_before` | `quote` | Before quote save |
| `sales_quote_save_after` | `quote` | After quote save |
| `sales_quote_item_set_product` | `product`, `quote_item` | When product set on quote item |
| `sales_quote_remove_item` | `quote_item` | When item removed from quote |
| `sales_quote_add_item` | `quote_item` | When item added to quote |
| `sales_quote_collect_totals_before` | `quote` | Before totals collection |
| `sales_quote_collect_totals_after` | `quote` | After totals collection |
| `sales_quote_address_collect_totals_before` | `quote_address`, `quote` | Before address totals |
| `sales_quote_address_collect_totals_after` | `quote_address`, `quote` | After address totals |
| `sales_quote_product_add_after` | `items` | After products added to quote |
| `checkout_submit_before` | `quote` | Before checkout submit |

---

## Customer Events

| Event | Data Keys | When |
|-------|-----------|------|
| `customer_register_success` | `account_controller`, `customer` | After customer registration |
| `customer_save_before` | `customer`, `data_object` | Before customer save |
| `customer_save_after` | `customer`, `data_object` | After customer save |
| `customer_delete_before` | `customer` | Before customer delete |
| `customer_delete_after` | `customer` | After customer delete |
| `customer_login` | `customer` | After customer login |
| `customer_logout` | `customer` | After customer logout |
| `customer_data_object_login` | `customer` | After customer data object login |
| `customer_address_save_before` | `customer_address` | Before address save |
| `customer_address_save_after` | `customer_address` | After address save |
| `customer_session_init` | `customer_session` | Session init |
| `adminhtml_customer_save_after` | `customer`, `request` | After admin customer save |
| `visitor_init` | `visitor` | Visitor init |
| `visitor_activity_save` | `visitor` | Visitor activity save |

---

## CMS Events

| Event | Data Keys | When |
|-------|-----------|------|
| `cms_page_prepare_save` | `page`, `request` | Before CMS page save in controller |
| `cms_page_render` | `page`, `controller_action` | When CMS page renders |
| `cms_block_save_before` | `object`, `data_object` | Before CMS block save |
| `cms_block_save_after` | `object`, `data_object` | After CMS block save |

---

## Controller Events

| Event | Data Keys | When |
|-------|-----------|------|
| `controller_action_predispatch` | `controller_action`, `request` | Before any controller action |
| `controller_action_predispatch_{routeId}` | `controller_action`, `request` | Before specific route |
| `controller_action_predispatch_{fullActionName}` | `controller_action`, `request` | Before specific action |
| `controller_action_postdispatch` | `controller_action`, `request` | After any controller action |
| `controller_action_postdispatch_{routeId}` | `controller_action`, `request` | After specific route |
| `controller_action_postdispatch_{fullActionName}` | `controller_action`, `request` | After specific action |
| `controller_action_layout_render_before` | `controller_action`, `layout` | Before layout render |
| `controller_action_layout_render_before_{fullActionName}` | same | Before specific action render |

---

## Store / Admin Events

| Event | Data Keys | When |
|-------|-----------|------|
| `store_save_after` | `store` | After store save |
| `store_delete_after` | `store` | After store delete |
| `store_group_save` | `store_group` | After store group save |
| `admin_user_authenticate_after` | `username`, `password`, `user`, `result` | After admin auth |
| `backend_auth_user_login_success` | `user` | Admin login success |
| `backend_auth_user_login_failed` | `user_name`, `exception` | Admin login failure |
| `admin_system_config_changed_section_{section}` | `website`, `store` | After system config section saved |
| `adminhtml_cache_flush_all` | none | When all caches flushed |
| `clean_cache_by_tags` | `object` | When cache cleaned by tags |

---

## Email Events

| Event | Data Keys | When |
|-------|-----------|------|
| `email_order_set_template_vars_before` | `transport`, `transportObject` | Before order email template vars |
| `email_invoice_set_template_vars_before` | `transport`, `transportObject` | Before invoice email vars |
| `email_shipment_set_template_vars_before` | `transport`, `transportObject` | Before shipment email vars |
| `email_creditmemo_set_template_vars_before` | `transport`, `transportObject` | Before credit memo email vars |

---

## Payment Events

| Event | Data Keys | When |
|-------|-----------|------|
| `payment_method_is_active` | `result`, `method_instance`, `quote` | Check if payment active |
| `payment_method_assign_data_{code}` | `method`, `data`, `payment_model` | Assign data to payment |

---

## Generic Model Events

For any model extending `AbstractModel`:
| Event | Pattern |
|-------|---------|
| `{prefix}_save_before` | Before save |
| `{prefix}_save_after` | After save |
| `{prefix}_delete_before` | Before delete |
| `{prefix}_delete_after` | After delete |
| `{prefix}_load_after` | After load |
| `{prefix}_save_commit_after` | After save transaction commits |
| `{prefix}_delete_commit_after` | After delete transaction commits |
| `{prefix}_clear` | After data cleared |

The `{prefix}` is set by `$_eventPrefix` property on the model.

---

## Scope-Specific events.xml

- `etc/events.xml` — Global (all areas)
- `etc/frontend/events.xml` — Frontend only
- `etc/adminhtml/events.xml` — Admin only
- `etc/webapi_rest/events.xml` — REST API only
- `etc/webapi_soap/events.xml` — SOAP API only
- `etc/graphql/events.xml` — GraphQL only
- `etc/crontab/events.xml` — Cron only
