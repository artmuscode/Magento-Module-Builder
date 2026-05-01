# Magento 2 JavaScript Patterns

## RequireJS Module System

Magento 2 uses RequireJS (AMD) for all JavaScript. Files go in `view/frontend/web/js/` (or `view/adminhtml/web/js/`).

### Basic Module Definition
```javascript
define([], function() {
    'use strict';

    // Module code
});
```

### Module with Dependencies
```javascript
define([
    'jquery',
    'mage/url',
    'Magento_Customer/js/model/customer'
], function($, urlBuilder, customer) {
    'use strict';

    // Module code using $, urlBuilder, customer
});
```

### Common RequireJS Dependencies
| Alias | Module |
|-------|--------|
| `jquery` | jQuery |
| `ko` | Knockout.js |
| `underscore` | Underscore.js |
| `uiComponent` | `Magento_Ui/js/lib/core/element/element` |
| `uiRegistry` | `uiRegistry` |
| `mage/url` | URL builder |
| `mage/storage` | AJAX storage (REST calls) |
| `mage/translate` | `$.mage.__('text')` |
| `Magento_Ui/js/modal/modal` | Modal widget |
| `Magento_Ui/js/model/messageList` | Message list |
| `Magento_Customer/js/customer-data` | Customer section data |
| `Magento_Checkout/js/model/quote` | Checkout quote model |

---

## UI Component

The primary pattern for interactive frontend components in Magento 2.

```javascript
define([
    'uiComponent',
    'ko'
], function(Component, ko) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Vendor_Module/component-template',
            myProperty: '',
            tracks: {
                myProperty: true  // Makes it a KO observable automatically
            }
        },

        initialize: function() {
            this._super();
            // Initialization logic
            return this;
        },

        myMethod: function() {
            // Component method
        }
    });
});
```

### Key UI Component Features
- `defaults`: Define default config values and observables
- `tracks`: Properties listed here become KO observables automatically
- `imports`/`exports`: Link properties between components
- `links`: Two-way binding between components
- `listens`: React to changes in other components
- `template`: KO template path (e.g., `Vendor_Module/path/to/template`)

### UI Component with Imports/Exports
```javascript
defaults: {
    template: 'Vendor_Module/my-component',
    imports: {
        cartData: 'checkout.cart.totals:totals'
    },
    exports: {
        selectedValue: 'checkout.steps.shipping-step:selectedMethod'
    },
    listens: {
        'selectedValue': 'onSelectedValueChange'
    }
}
```

---

## Mixin Pattern

Mixins extend existing JavaScript components without modifying the original.

### Mixin Definition (`view/frontend/web/js/view/component-mixin.js`)
```javascript
define([], function() {
    'use strict';

    return function(target) {
        return target.extend({
            // Override or add methods
            existingMethod: function() {
                // Call original
                var result = this._super();
                // Add custom logic
                return result;
            },

            newMethod: function() {
                // New functionality
            }
        });
    };
});
```

### Mixin with Dependencies
```javascript
define([
    'jquery',
    'mage/utils/wrapper'
], function($, wrapper) {
    'use strict';

    return function(target) {
        return target.extend({
            someMethod: function() {
                // Custom logic before
                var result = this._super();
                // Custom logic after
                return result;
            }
        });
    };
});
```

### Function-based Mixin (for non-component modules)
```javascript
define([
    'mage/utils/wrapper'
], function(wrapper) {
    'use strict';

    return function(targetFunction) {
        return wrapper.wrap(targetFunction, function(original, ...args) {
            // Before logic
            var result = original(...args);
            // After logic
            return result;
        });
    };
});
```

---

## RequireJS Configuration (`view/frontend/requirejs-config.js`)

### Mixin Registration
```javascript
var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/view/shipping': {
                'Vendor_Module/js/view/shipping-mixin': true
            }
        }
    }
};
```

### Module Map Override
```javascript
var config = {
    map: {
        '*': {
            'Magento_Checkout/js/view/payment/default':
                'Vendor_Module/js/view/payment/default'
        }
    }
};
```

### Combined Config
```javascript
var config = {
    config: {
        mixins: {
            'Magento_Catalog/js/price-box': {
                'Vendor_Module/js/price-box-mixin': true
            }
        }
    },
    map: {
        '*': {
            'originalModule': 'Vendor_Module/js/replacement'
        }
    },
    paths: {
        'externalLib': 'https://cdn.example.com/lib'
    },
    shim: {
        'externalLib': {
            deps: ['jquery']
        }
    }
};
```

---

## KnockoutJS Patterns

### Observable
```javascript
this.myValue = ko.observable('initial');
this.myArray = ko.observableArray([]);
```

### Computed Observable
```javascript
this.fullName = ko.computed(function() {
    return this.firstName() + ' ' + this.lastName();
}, this);
```

### Pure Computed (preferred for performance)
```javascript
this.isValid = ko.pureComputed(function() {
    return this.name().length > 0 && this.email().length > 0;
}, this);
```

### Custom Binding Handler
```javascript
ko.bindingHandlers.customBinding = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // Called once when binding is first applied
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.unwrap(valueAccessor());
        // Called when observable value changes
    }
};
```

---

## jQuery Widget Pattern

Used for simpler DOM-manipulation components (non-KO).

```javascript
define([
    'jquery',
    'jquery-ui-modules/widget'
], function($) {
    'use strict';

    $.widget('vendor.widgetName', {
        options: {
            selector: '.target-element',
            activeClass: 'active'
        },

        _create: function() {
            this._bind();
        },

        _bind: function() {
            this._on({
                'click': '_onClick'
            });
        },

        _onClick: function(event) {
            $(event.target).toggleClass(this.options.activeClass);
        }
    });

    return $.vendor.widgetName;
});
```

---

## AJAX / REST API Calls

### Using mage/storage
```javascript
define([
    'mage/storage',
    'Magento_Checkout/js/model/url-builder'
], function(storage, urlBuilder) {
    'use strict';

    // GET request
    storage.get(
        urlBuilder.createUrl('/carts/mine/totals', {})
    ).done(function(response) {
        // Handle response
    });

    // POST request
    storage.post(
        urlBuilder.createUrl('/carts/mine/items', {}),
        JSON.stringify({ cartItem: data })
    ).done(function(response) {
        // Handle response
    });
});
```

### Using jQuery AJAX
```javascript
define(['jquery', 'mage/url'], function($, urlBuilder) {
    'use strict';

    $.ajax({
        url: urlBuilder.build('module/controller/action'),
        type: 'POST',
        dataType: 'json',
        data: { key: 'value' },
        success: function(response) {
            // Handle response
        }
    });
});
```

---

## Customer Data (Sections)

```javascript
define([
    'Magento_Customer/js/customer-data'
], function(customerData) {
    'use strict';

    // Get section data
    var cart = customerData.get('cart');

    // Subscribe to changes
    cart.subscribe(function(updatedCart) {
        console.log('Cart updated:', updatedCart);
    });

    // Invalidate (force reload)
    customerData.invalidate(['cart']);

    // Reload
    customerData.reload(['cart'], true);
});
```

---

## Checkout-Specific Patterns

### Shipping Rate Processor
```javascript
define([
    'Magento_Checkout/js/model/shipping-rate-processor/new-address',
    'Magento_Checkout/js/model/shipping-rate-registry'
], function(defaultProcessor, rateRegistry) {
    'use strict';

    // Custom processor
});
```

### Payment Method Renderer
```javascript
define([
    'Magento_Checkout/js/view/payment/default'
], function(Component) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Vendor_Module/payment/method'
        },

        getCode: function() {
            return 'vendor_payment_method';
        },

        getData: function() {
            return {
                'method': this.getCode(),
                'additional_data': {}
            };
        }
    });
});
```

---

## File Locations

| Type | Path |
|------|------|
| Frontend JS | `view/frontend/web/js/` |
| Admin JS | `view/adminhtml/web/js/` |
| RequireJS config | `view/frontend/requirejs-config.js` |
| KO Templates | `view/frontend/web/template/` (`.html` files) |
| CSS/LESS | `view/frontend/web/css/` |
