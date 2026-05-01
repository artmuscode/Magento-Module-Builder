# Magento 2 HTML / Template Patterns

## KnockoutJS Templates (`.html`)

KO templates are located at `view/frontend/web/template/` and use `.html` extension. They use KnockoutJS virtual element syntax and data bindings.

### Virtual Element Bindings

These are comment-based bindings used when you can't add data-bind to an element.

#### Generic
```html
<!-- ko bindingName: expression -->
    Content here
<!-- /ko -->
```

#### If / Ifnot
```html
<!-- ko if: isVisible() -->
    <p>Shown when true</p>
<!-- /ko -->

<!-- ko ifnot: isHidden() -->
    <p>Shown when false</p>
<!-- /ko -->
```

#### Foreach
```html
<!-- ko foreach: items() -->
    <div data-bind="text: $data.name"></div>
<!-- /ko -->
```

#### Template
```html
<!-- ko template: getTemplate() --><!-- /ko -->
```

#### Foreach Region + Template (UI Component regions)
```html
<!-- ko foreach: getRegion('regionName') -->
    <!-- ko template: getTemplate() --><!-- /ko -->
<!--/ko-->
```

#### Text / i18n
```html
<!-- ko text: getText() --><!-- /ko -->
<!-- ko i18n: 'Translatable string' --><!-- /ko -->
```

---

## Element Data Bindings

### Common Bindings
```html
<div data-bind="visible: isVisible()">Visible content</div>
<span data-bind="text: name()"></span>
<span data-bind="html: htmlContent()"></span>
<div data-bind="css: { 'active': isActive() }"></div>
<div data-bind="attr: { 'id': elementId() }"></div>
<div data-bind="style: { 'color': textColor() }"></div>
<img data-bind="attr: { 'src': imageUrl(), 'alt': imageName() }"/>
```

### Event Bindings
```html
<button data-bind="click: onSubmit">Submit</button>
<input data-bind="event: { 'change': onChange }"/>
<form data-bind="submit: onFormSubmit">
```

### Form Bindings
```html
<input type="text" data-bind="value: fieldValue"/>
<input type="checkbox" data-bind="checked: isChecked"/>
<select data-bind="options: availableOptions,
                   optionsText: 'label',
                   optionsValue: 'value',
                   value: selectedOption">
</select>
<textarea data-bind="textInput: description"></textarea>
```

### Foreach with Element
```html
<ul data-bind="foreach: items">
    <li>
        <span data-bind="text: $data.name"></span>
        <span data-bind="text: $parent.currency"></span>
        <span data-bind="text: $index()"></span>
    </li>
</ul>
```

### With Binding
```html
<div data-bind="with: selectedItem">
    <h2 data-bind="text: title"></h2>
    <p data-bind="text: description"></p>
</div>
```

---

## Magento-Specific Bindings

### i18n (Translation)
```html
<span data-bind="i18n: 'Add to Cart'"></span>

<!-- In attribute -->
<input data-bind="attr: { placeholder: $t('Search...') }"/>
```

### afterRender
```html
<div data-bind="afterRender: onAfterRender"></div>
```

### scope (UI Component)
```html
<div data-bind="scope: 'componentName'">
    <!-- ko template: getTemplate() --><!-- /ko -->
</div>
```

### mageInit (initialize JS component)
```html
<div data-mage-init='{"Vendor_Module/js/component": {"option": "value"}}'>
</div>
```

---

## x-magento-init Script Block

Used in `.phtml` files to initialize JavaScript components on specific DOM elements.

### Basic
```html
<script type="text/x-magento-init">
{
    "#element-id": {
        "Vendor_Module/js/component": {
            "option1": "value1",
            "option2": "value2"
        }
    }
}
</script>
```

### With Block Data (in .phtml)
```html
<script type="text/x-magento-init">
{
    "#element-id": {
        "Magento_Ui/js/core/app": <?= $block->getJsLayout() ?>
    }
}
</script>
```

### Wildcard (applies to all matching elements)
```html
<script type="text/x-magento-init">
{
    "*": {
        "Vendor_Module/js/global-component": {
            "baseUrl": "<?= $block->getBaseUrl() ?>"
        }
    }
}
</script>
```

### Multiple Components
```html
<script type="text/x-magento-init">
{
    "#element-one": {
        "Vendor_Module/js/component-a": {}
    },
    ".elements-class": {
        "Vendor_Module/js/component-b": {"key": "value"}
    }
}
</script>
```

---

## PHTML Template Patterns

### Block Variable Declaration
```php
<?php
/** @var \Magento\Framework\View\Element\Template $block */
?>
```

### ViewModel Access
```php
<?php
/** @var \Vendor\Module\ViewModel\MyViewModel $viewModel */
$viewModel = $block->getData('view_model');
?>
<div><?= $viewModel->getSomeData() ?></div>
```

### Translation
```php
<?= __('Translatable string') ?>
<?= __('Hello %1, you have %2 items', $name, $count) ?>
```

### Escaping
```php
<?= $escaper->escapeHtml($value) ?>
<?= $escaper->escapeUrl($url) ?>
<?= $escaper->escapeJs($jsString) ?>
<?= $escaper->escapeHtmlAttr($attribute) ?>
<?= $escaper->escapeCss($cssValue) ?>
```

### Child Block
```php
<?= $block->getChildHtml('child.block.name') ?>
<?= $block->getChildHtml() ?> <!-- All children -->
```

### URL Building
```php
<?= $block->getUrl('route/controller/action') ?>
<?= $block->getUrl('route/controller/action', ['id' => $id]) ?>
<?= $block->getViewFileUrl('Vendor_Module::images/logo.png') ?>
```

### Form Key (CSRF Protection)
```php
<input type="hidden" name="form_key" value="<?= $block->getFormKey() ?>"/>
```

### Secure URL
```php
<?= $block->getBaseUrl() ?>
<?= $block->getMediaUrl() ?>
```

---

## UI Component Template Examples

### Simple Component Template (`view/frontend/web/template/my-component.html`)
```html
<div class="my-component">
    <h2 data-bind="text: title"></h2>

    <!-- ko if: items().length > 0 -->
    <ul data-bind="foreach: items">
        <li>
            <span data-bind="text: $data.name"></span>
            <span class="price" data-bind="text: $data.price"></span>
        </li>
    </ul>
    <!-- /ko -->

    <!-- ko ifnot: items().length > 0 -->
    <p data-bind="i18n: 'No items found.'"></p>
    <!-- /ko -->

    <button class="action primary"
            data-bind="click: onSubmit, i18n: 'Submit'">
    </button>
</div>
```

### Checkout Step Template
```html
<li data-bind="fadeVisible: isVisible">
    <div class="step-title" data-bind="i18n: 'Step Title'"></div>
    <div class="step-content">
        <!-- ko foreach: getRegion('before-form') -->
            <!-- ko template: getTemplate() --><!-- /ko -->
        <!--/ko-->

        <form data-bind="submit: onSubmit">
            <!-- Form fields -->
        </form>

        <!-- ko foreach: getRegion('after-form') -->
            <!-- ko template: getTemplate() --><!-- /ko -->
        <!--/ko-->
    </div>
</li>
```

---

## File Locations

| Type | Path | Extension |
|------|------|-----------|
| KO Templates (frontend) | `view/frontend/web/template/` | `.html` |
| KO Templates (admin) | `view/adminhtml/web/template/` | `.html` |
| PHTML Templates (frontend) | `view/frontend/templates/` | `.phtml` |
| PHTML Templates (admin) | `view/adminhtml/templates/` | `.phtml` |
| Email Templates | `view/frontend/email/` | `.html` |

### Template Reference in Layout XML
```xml
<!-- PHTML template -->
<block template="Vendor_Module::path/to/template.phtml"/>

<!-- KO template (via UI Component) -->
<item name="template" xsi:type="string">Vendor_Module/path/to/template</item>
```

### Template Reference in JS
```javascript
defaults: {
    template: 'Vendor_Module/path/to/template'  // resolves to web/template/path/to/template.html
}
```
