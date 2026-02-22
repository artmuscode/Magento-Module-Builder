/**
 * Smart Defaults - Column type inference and naming conventions for Magento 2
 */

const SmartDefaults = {
    /**
     * Infer column type from column name
     * Based on M2 naming conventions
     */
    inferColumnType(columnName) {
        const name = columnName.toLowerCase();

        // ID columns
        if (name === 'entity_id' || name === 'id' || name.endsWith('_id')) {
            return { type: 'int', nullable: false, unsigned: true, comment: '' };
        }

        // Boolean columns
        if (name.startsWith('is_') || name.startsWith('has_') || name.startsWith('can_')) {
            return { type: 'smallint', nullable: false, default: '0', unsigned: true, comment: 'Boolean flag' };
        }

        // Timestamp columns
        if (name.endsWith('_at') || name === 'created' || name === 'updated') {
            const defaults = {};
            if (name === 'created_at') {
                defaults.default = 'CURRENT_TIMESTAMP';
            }
            return { type: 'timestamp', nullable: true, ...defaults, comment: '' };
        }

        // Price / monetary
        if (name === 'price' || name.endsWith('_price') || name === 'cost' || name.endsWith('_cost')
            || name === 'amount' || name.endsWith('_amount') || name.endsWith('_total')) {
            return { type: 'decimal', precision: '12', scale: '4', nullable: false, default: '0.0000', comment: '' };
        }

        // Quantity
        if (name === 'qty' || name.endsWith('_qty') || name === 'quantity' || name.endsWith('_quantity')) {
            return { type: 'decimal', precision: '12', scale: '4', nullable: false, default: '0.0000', comment: '' };
        }

        // Weight
        if (name === 'weight' || name.endsWith('_weight')) {
            return { type: 'decimal', precision: '12', scale: '4', nullable: true, comment: '' };
        }

        // Long text content
        if (name === 'content' || name === 'description' || name === 'body'
            || name === 'short_description' || name === 'long_description'
            || name.endsWith('_content') || name.endsWith('_html')) {
            return { type: 'text', nullable: true, comment: '' };
        }

        // URL / path fields
        if (name === 'url' || name.endsWith('_url') || name === 'path'
            || name.endsWith('_path') || name === 'url_key' || name === 'identifier') {
            return { type: 'varchar', length: '255', nullable: true, comment: '' };
        }

        // Email
        if (name === 'email' || name.endsWith('_email')) {
            return { type: 'varchar', length: '255', nullable: true, comment: '' };
        }

        // Name / title fields
        if (name === 'name' || name === 'title' || name === 'label'
            || name.endsWith('_name') || name.endsWith('_title') || name.endsWith('_label')) {
            return { type: 'varchar', length: '255', nullable: false, comment: '' };
        }

        // Status
        if (name === 'status' || name.endsWith('_status')) {
            return { type: 'smallint', nullable: false, default: '0', unsigned: true, comment: '' };
        }

        // Sort order / position
        if (name === 'sort_order' || name === 'position' || name.endsWith('_order') || name.endsWith('_position')) {
            return { type: 'int', nullable: false, default: '0', unsigned: true, comment: '' };
        }

        // Store ID
        if (name === 'store_id') {
            return { type: 'smallint', nullable: false, unsigned: true, default: '0', comment: 'Store Id' };
        }

        // Type / code short strings
        if (name === 'type' || name.endsWith('_type') || name === 'code' || name.endsWith('_code') || name === 'sku') {
            return { type: 'varchar', length: '64', nullable: false, comment: '' };
        }

        // Default: varchar
        return { type: 'varchar', length: '255', nullable: true, comment: '' };
    },

    /**
     * Suggest table name from entity name and module info
     * Convention: {vendor}_{module}_{entity_snake}
     */
    suggestTableName(entityName, vendor, moduleName) {
        if (!entityName) return '';
        const snake = this.toSnakeCase(entityName);
        const v = vendor ? vendor.toLowerCase() : '';
        const m = moduleName ? this.toSnakeCase(moduleName) : '';

        if (v && m) {
            return `${v}_${m}_${snake}`;
        }
        return snake;
    },

    /**
     * Suggest route front name from module name
     */
    suggestRouteFrontName(moduleName) {
        if (!moduleName) return '';
        return moduleName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase();
    },

    /**
     * Suggest ACL resource ID
     */
    suggestAclResource(vendor, moduleName, resourceName) {
        if (!vendor || !moduleName) return '';
        const base = `${vendor}_${moduleName}`;
        if (resourceName) {
            return `${base}::${resourceName.toLowerCase()}`;
        }
        return base;
    },

    /**
     * Suggest layout handle from route info
     * Convention: {routeId}_{controllerDir}_{actionName} all lowercase
     */
    suggestLayoutHandle(routeFrontName, controllerDir, actionName) {
        const parts = [routeFrontName, controllerDir, actionName].filter(Boolean);
        return parts.join('_').toLowerCase();
    },

    /**
     * Convert PascalCase or camelCase to snake_case
     */
    toSnakeCase(str) {
        if (!str) return '';
        return str
            .replace(/([A-Z])/g, '_$1')
            .replace(/^_/, '')
            .replace(/__+/g, '_')
            .toLowerCase();
    },

    /**
     * Convert string to PascalCase
     */
    toPascalCase(str) {
        if (!str) return '';
        return str
            .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
            .replace(/^(.)/, (_, c) => c.toUpperCase());
    },

    /**
     * Suggest composer package name
     */
    suggestComposerName(vendor, moduleName) {
        if (!vendor || !moduleName) return '';
        const v = vendor.toLowerCase();
        const m = this.toSnakeCase(moduleName).replace(/_/g, '-');
        return `${v}/module-${m}`;
    },

    /**
     * Suggest namespace from vendor + module
     */
    suggestNamespace(vendor, moduleName) {
        if (!vendor || !moduleName) return '';
        return `${vendor}\\${moduleName}`;
    },

    /**
     * Generate file paths from block type and config
     * Returns resolved file paths for the Magento module
     */
    resolveFilePaths(blockType, config, vendor, moduleName) {
        const basePath = `app/code/${vendor}/${moduleName}`;
        const paths = [];

        switch (blockType) {
            case 'module-registration':
                paths.push(`${basePath}/registration.php`);
                paths.push(`${basePath}/etc/module.xml`);
                paths.push(`${basePath}/composer.json`);
                break;

            case 'db-schema':
                paths.push(`${basePath}/etc/db_schema.xml`);
                paths.push(`${basePath}/etc/db_schema_whitelist.json`);
                break;

            case 'model-entity': {
                const e = config.entityName || 'Entity';
                paths.push(`${basePath}/Model/${e}.php`);
                paths.push(`${basePath}/Model/ResourceModel/${e}.php`);
                paths.push(`${basePath}/Model/ResourceModel/${e}/Collection.php`);
                break;
            }

            case 'repository': {
                const e = config.entityName || 'Entity';
                paths.push(`${basePath}/Api/${e}RepositoryInterface.php`);
                paths.push(`${basePath}/Api/Data/${e}Interface.php`);
                paths.push(`${basePath}/Api/Data/${e}SearchResultsInterface.php`);
                paths.push(`${basePath}/Model/${e}Repository.php`);
                paths.push(`${basePath}/etc/di.xml`);
                break;
            }

            case 'data-patch': {
                const name = config.patchName || 'InitialData';
                paths.push(`${basePath}/Setup/Patch/Data/${name}.php`);
                break;
            }

            case 'frontend-controller': {
                const dir = config.controllerDir || 'Index';
                const action = config.actionName || 'Index';
                const route = config.routeFrontName || 'module';
                paths.push(`${basePath}/etc/frontend/routes.xml`);
                paths.push(`${basePath}/Controller/${dir}/${action}.php`);
                const handle = SmartDefaults.suggestLayoutHandle(route, dir, action);
                paths.push(`${basePath}/view/frontend/layout/${handle}.xml`);
                break;
            }

            case 'admin-controller': {
                const dir = config.controllerDir || 'Index';
                const action = config.actionName || 'Index';
                const route = config.routeId || 'module';
                paths.push(`${basePath}/etc/adminhtml/routes.xml`);
                paths.push(`${basePath}/Controller/Adminhtml/${dir}/${action}.php`);
                const handle = SmartDefaults.suggestLayoutHandle(route, dir, action);
                paths.push(`${basePath}/view/adminhtml/layout/${handle}.xml`);
                break;
            }

            case 'custom-router': {
                const name = config.routerName || 'CustomRouter';
                paths.push(`${basePath}/Router/${name}.php`);
                paths.push(`${basePath}/etc/frontend/di.xml`);
                break;
            }

            case 'plugin': {
                const target = config.targetClass ? config.targetClass.split('\\').pop() : 'Target';
                paths.push(`${basePath}/Plugin/${target}Plugin.php`);
                paths.push(`${basePath}/etc/di.xml`);
                break;
            }

            case 'observer': {
                const name = config.observerName || 'CustomObserver';
                const scope = config.scope || 'global';
                paths.push(`${basePath}/Observer/${name}.php`);
                if (scope === 'global') {
                    paths.push(`${basePath}/etc/events.xml`);
                } else {
                    paths.push(`${basePath}/etc/${scope}/events.xml`);
                }
                break;
            }

            case 'cron-job': {
                const name = config.jobName ? SmartDefaults.toPascalCase(config.jobName) : 'ProcessQueue';
                paths.push(`${basePath}/Cron/${name}.php`);
                paths.push(`${basePath}/etc/crontab.xml`);
                break;
            }

            case 'cli-command': {
                const name = config.commandName ? SmartDefaults.toPascalCase(config.commandName.replace(/:/g, '_')) : 'Custom';
                paths.push(`${basePath}/Console/Command/${name}Command.php`);
                paths.push(`${basePath}/etc/di.xml`);
                break;
            }

            case 'viewmodel': {
                const name = config.viewModelName || 'CustomData';
                paths.push(`${basePath}/ViewModel/${name}.php`);
                break;
            }

            case 'system-config':
                paths.push(`${basePath}/etc/adminhtml/system.xml`);
                paths.push(`${basePath}/etc/config.xml`);
                paths.push(`${basePath}/etc/acl.xml`);
                break;

            case 'acl-resource':
                paths.push(`${basePath}/etc/acl.xml`);
                break;

            case 'admin-menu':
                paths.push(`${basePath}/etc/adminhtml/menu.xml`);
                break;

            case 'rest-api':
                paths.push(`${basePath}/etc/webapi.xml`);
                break;

            case 'graphql': {
                const name = config.resolverClass || 'CustomResolver';
                paths.push(`${basePath}/etc/schema.graphqls`);
                paths.push(`${basePath}/Model/Resolver/${name}.php`);
                break;
            }

            case 'message-queue':
                paths.push(`${basePath}/etc/communication.xml`);
                paths.push(`${basePath}/etc/queue_topology.xml`);
                paths.push(`${basePath}/etc/queue_consumer.xml`);
                break;

            case 'ui-component': {
                const name = SmartDefaults.toSnakeCase(config.componentName || 'custom-component');
                paths.push(`${basePath}/view/frontend/web/js/${name}.js`);
                paths.push(`${basePath}/view/frontend/web/template/${name}.html`);
                break;
            }

            case 'jquery-widget': {
                const name = SmartDefaults.toSnakeCase(config.widgetName || 'custom-widget');
                paths.push(`${basePath}/view/frontend/web/js/${name}.js`);
                paths.push(`${basePath}/view/frontend/templates/${name}.phtml`);
                break;
            }

            case 'js-mixin': {
                const target = (config.targetModule || 'module').split('/').pop();
                paths.push(`${basePath}/view/frontend/requirejs-config.js`);
                paths.push(`${basePath}/view/frontend/web/js/${target}-mixin.js`);
                break;
            }

            case 'admin-grid': {
                const entity = SmartDefaults.toSnakeCase(config.entityName || 'entity');
                const entityPascal = SmartDefaults.toPascalCase(config.entityName || 'entity');
                paths.push(`${basePath}/view/adminhtml/ui_component/${entity}_listing.xml`);
                paths.push(`${basePath}/Ui/DataProvider/${entityPascal}DataProvider.php`);
                break;
            }

            case 'admin-form': {
                const entity = SmartDefaults.toSnakeCase(config.entityName || 'entity');
                const entityPascal = SmartDefaults.toPascalCase(config.entityName || 'entity');
                paths.push(`${basePath}/view/adminhtml/ui_component/${entity}_form.xml`);
                paths.push(`${basePath}/Ui/DataProvider/${entityPascal}FormDataProvider.php`);
                break;
            }
        }

        return paths;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartDefaults;
}
