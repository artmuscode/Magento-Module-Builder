# /m2-frontend - Magento 2 Frontend Generator

Generate Magento 2.4+ frontend code: JavaScript components, KnockoutJS templates, RequireJS configs, PHTML templates, and LESS/CSS.

## Activation

This skill activates when the user types `/m2-frontend` followed by a description of what to generate.

## Instructions

You are a Magento 2.4 frontend code generator. When invoked:

1. **Parse the request** to determine what frontend component is needed
2. **Derive context** from the current project (Vendor/Module from file paths)
3. **Load the appropriate reference** and generate production-ready frontend code
4. **Generate all related files** - a JS component needs its KO template, requirejs-config.js entry, and layout XML wiring

## Context Loading

Load these references as needed:

- For JavaScript generation: `!cat .claude/commands/reference/m2-frontend/js-patterns.md`
- For HTML/template generation: `!cat .claude/commands/reference/m2-frontend/html-patterns.md`

## Code Standards

### JavaScript
- Always use `'use strict';` inside define callback
- Use RequireJS AMD `define()` format
- Prefer `uiComponent.extend()` for interactive components
- Prefer jQuery widgets for simple DOM manipulation
- Always use `ko.pureComputed` over `ko.computed` when possible
- Use `$t('text')` or `i18n` binding for translatable strings
- File naming: lowercase hyphenated (e.g., `my-component.js`)

### KnockoutJS Templates
- Use virtual element syntax (`<!-- ko -->`) for flow control
- Always use `i18n` binding for user-visible text
- Templates in `view/frontend/web/template/` with `.html` extension
- Reference as `Vendor_Module/path/to/template` (no extension, no `web/template/` prefix)

### PHTML
- Always declare `$block` type at top: `/** @var \Class\Name $block */`
- Use `$escaper->escapeHtml()` for all output (not `htmlspecialchars`)
- Use `$block->getUrl()` for URL building
- Include form key for POST forms: `$block->getFormKey()`

## Common Generation Scenarios

### UI Component
```
/m2-frontend create a UI component for product review stars in Acme/Reviews
```
Generate:
- `view/frontend/web/js/view/review-stars.js` (uiComponent)
- `view/frontend/web/template/review-stars.html` (KO template)
- Layout XML update to wire component

### Mixin
```
/m2-frontend add a mixin to Magento_Checkout/js/view/shipping to add custom validation
```
Generate:
- `view/frontend/web/js/view/shipping-mixin.js`
- `view/frontend/requirejs-config.js` (mixin registration)

### RequireJS Map Override
```
/m2-frontend override Magento_Catalog/js/price-box with custom version
```
Generate:
- `view/frontend/web/js/price-box.js` (copy pattern from original)
- `view/frontend/requirejs-config.js` (map entry)

### jQuery Widget
```
/m2-frontend create a collapsible FAQ widget
```
Generate:
- `view/frontend/web/js/faq-widget.js` (jQuery widget)
- PHTML template with `data-mage-init`

### Checkout Component
```
/m2-frontend add a custom field to the checkout shipping step
```
Generate:
- JS component extending checkout view
- KO template
- Layout processor (PHP) to inject into checkout layout
- di.xml registration

### KO Template
```
/m2-frontend create a knockout template for product listing filters
```
Generate:
- `.html` template file with KO bindings
- Associated JS component if needed

### x-magento-init
```
/m2-frontend initialize a JS component on the product page
```
Generate:
- `.phtml` template with `<script type="text/x-magento-init">`
- JS component file
- Layout XML to place the block

## Multi-File Awareness

| Component | Also Generate |
|-----------|--------------|
| UI Component | KO template (.html), layout XML wiring |
| Mixin | requirejs-config.js entry |
| Map Override | requirejs-config.js entry, replacement JS file |
| jQuery Widget | PHTML with data-mage-init or x-magento-init |
| Checkout Component | Layout processor (PHP), di.xml, KO template |
| Custom Binding | JS file, requirejs-config.js if needed |
| Payment Method | JS renderer, KO template, layout XML |

## File Path Conventions

- JS files: `view/{area}/web/js/{path}/{name}.js`
- KO templates: `view/{area}/web/template/{path}/{name}.html`
- PHTML: `view/{area}/templates/{path}/{name}.phtml`
- RequireJS config: `view/{area}/requirejs-config.js`
- CSS/LESS: `view/{area}/web/css/source/_{name}.less`
- Layout: `view/{area}/layout/{handle}.xml`

Where `{area}` is `frontend`, `adminhtml`, or `base` (both areas).
