/**
 * Magento 2 Module Builder - Block Definitions
 * 7 Categories, 24 Block Types
 */

const BlockCategories = {
    'foundation': {
        name: 'Foundation',
        color: '#217ce8',
        blocks: [
            {
                type: 'module-registration',
                title: 'Module Registration',
                description: 'registration.php, module.xml, composer.json',
                icon: 'M',
                files: ['registration.php', 'etc/module.xml', 'composer.json'],
                defaultConfig: {
                    vendor: '',
                    moduleName: '',
                    version: '1.0.0',
                    dependencies: [],
                    phpVersion: '>=8.1',
                    description: ''
                }
            }
        ]
    },
    'data-layer': {
        name: 'Data',
        color: '#f59e0b',
        blocks: [
            {
                type: 'db-schema',
                title: 'Database Schema',
                description: 'db_schema.xml table definition',
                icon: 'T',
                files: ['etc/db_schema.xml', 'etc/db_schema_whitelist.json'],
                defaultConfig: {
                    tableName: '',
                    columns: [],
                    constraints: [],
                    indexes: []
                }
            },
            {
                type: 'model-entity',
                title: 'Model / Entity',
                description: 'Model + ResourceModel + Collection',
                icon: 'E',
                files: ['Model/{Entity}.php', 'Model/ResourceModel/{Entity}.php', 'Model/ResourceModel/{Entity}/Collection.php'],
                defaultConfig: {
                    entityName: '',
                    tableName: '',
                    idField: 'entity_id'
                }
            },
            {
                type: 'repository',
                title: 'Repository',
                description: 'API interfaces + Repository implementation',
                icon: 'R',
                files: ['Api/{Entity}RepositoryInterface.php', 'Api/Data/{Entity}Interface.php', 'Api/Data/{Entity}SearchResultsInterface.php', 'Model/{Entity}Repository.php'],
                defaultConfig: {
                    entityName: '',
                    methods: ['save', 'getById', 'getList', 'delete', 'deleteById']
                }
            },
            {
                type: 'data-patch',
                title: 'Data Patch',
                description: 'Setup/Patch/Data class',
                icon: 'P',
                files: ['Setup/Patch/Data/{PatchName}.php'],
                defaultConfig: {
                    patchName: '',
                    description: '',
                    dependencies: []
                }
            }
        ]
    },
    'controllers': {
        name: 'Routes',
        color: '#10b981',
        blocks: [
            {
                type: 'frontend-controller',
                title: 'Frontend Controller',
                description: 'Controller + routes.xml + layout XML',
                icon: 'F',
                files: ['etc/frontend/routes.xml', 'Controller/{Dir}/{Action}.php', 'view/frontend/layout/{handle}.xml'],
                defaultConfig: {
                    routeFrontName: '',
                    controllerDir: '',
                    actionName: 'Index',
                    httpMethod: 'GET',
                    resultType: 'Page'
                }
            },
            {
                type: 'custom-router',
                title: 'Custom Router',
                description: 'RouterInterface implementation',
                icon: 'U',
                files: ['Router/{RouterName}.php', 'etc/frontend/di.xml'],
                defaultConfig: {
                    routerName: '',
                    sortOrder: 60,
                    matchPattern: ''
                }
            }
        ]
    },
    'logic': {
        name: 'Logic',
        color: '#8b5cf6',
        blocks: [
            {
                type: 'plugin',
                title: 'Plugin',
                description: 'Plugin class + di.xml entry',
                icon: 'P',
                files: ['Plugin/{Name}Plugin.php', 'etc/di.xml'],
                defaultConfig: {
                    targetClass: '',
                    targetMethod: '',
                    pluginType: 'after',
                    sortOrder: 10
                }
            },
            {
                type: 'observer',
                title: 'Observer',
                description: 'Observer class + events.xml',
                icon: 'O',
                files: ['Observer/{Name}Observer.php', 'etc/events.xml'],
                defaultConfig: {
                    eventName: '',
                    observerName: '',
                    scope: 'global'
                }
            },
            {
                type: 'cron-job',
                title: 'Cron Job',
                description: 'Cron class + crontab.xml',
                icon: 'C',
                files: ['Cron/{Name}.php', 'etc/crontab.xml'],
                defaultConfig: {
                    jobName: '',
                    schedule: '0 * * * *',
                    group: 'default'
                }
            },
            {
                type: 'cli-command',
                title: 'CLI Command',
                description: 'Console Command + di.xml registration',
                icon: '>',
                files: ['Console/Command/{Name}Command.php', 'etc/di.xml'],
                defaultConfig: {
                    commandName: '',
                    description: '',
                    arguments: [],
                    options: []
                }
            },
        ]
    },
    'api-layer': {
        name: 'API',
        color: '#ec4899',
        blocks: [
            {
                type: 'rest-api',
                title: 'REST API',
                description: 'webapi.xml route definitions',
                icon: 'W',
                files: ['etc/webapi.xml'],
                defaultConfig: {
                    routes: []
                }
            },
            {
                type: 'graphql',
                title: 'GraphQL',
                description: 'schema.graphqls + Resolver',
                icon: 'G',
                files: ['etc/schema.graphqls', 'Model/Resolver/{Name}.php'],
                defaultConfig: {
                    typeName: '',
                    fields: [],
                    resolverClass: '',
                    queryName: ''
                }
            },
            {
                type: 'message-queue',
                title: 'Message Queue',
                description: 'communication.xml + queue topology',
                icon: 'Q',
                files: ['etc/communication.xml', 'etc/queue_topology.xml', 'etc/queue_consumer.xml'],
                defaultConfig: {
                    topicName: '',
                    consumerClass: '',
                    connection: 'amqp',
                    maxMessages: 5000
                }
            }
        ]
    },
    'frontend': {
        name: 'Frontend',
        color: '#d97706',
        blocks: [
            {
                type: 'ui-component',
                title: 'UI Component',
                description: 'KnockoutJS component + template',
                icon: 'U',
                files: ['view/frontend/web/js/{name}.js', 'view/frontend/web/template/{name}.html'],
                defaultConfig: {
                    componentName: '',
                    templatePath: '',
                    dependencies: [],
                    observables: []
                }
            },
            {
                type: 'jquery-widget',
                title: 'jQuery Widget',
                description: 'jQuery widget + PHTML init',
                icon: '$',
                files: ['view/frontend/web/js/{name}.js', 'view/frontend/templates/{name}.phtml'],
                defaultConfig: {
                    widgetNamespace: '',
                    widgetName: '',
                    options: [],
                    events: []
                }
            },
            {
                type: 'js-mixin',
                title: 'JS Mixin',
                description: 'JS mixin + requirejs-config.js',
                icon: 'X',
                files: ['view/frontend/requirejs-config.js', 'view/frontend/web/js/{name}-mixin.js'],
                defaultConfig: {
                    targetModule: '',
                    mixinMethods: [],
                    type: 'object'
                }
            },
            {
                type: 'viewmodel',
                title: 'ViewModel',
                description: 'ViewModel class (ArgumentInterface)',
                icon: 'V',
                files: ['ViewModel/{Name}.php'],
                defaultConfig: {
                    viewModelName: '',
                    methods: [],
                    templateName: ''
                }
            }
        ]
    },
    'admin': {
        name: 'Admin',
        color: '#e84f1c',
        blocks: [
            {
                type: 'admin-controller',
                title: 'Admin Controller',
                description: 'Admin controller + admin routes + layout',
                icon: 'A',
                files: ['etc/adminhtml/routes.xml', 'Controller/Adminhtml/{Dir}/{Action}.php', 'view/adminhtml/layout/{handle}.xml'],
                defaultConfig: {
                    routeId: '',
                    controllerDir: '',
                    actionName: 'Index',
                    adminResource: '',
                    httpMethod: 'GET'
                }
            },
            {
                type: 'acl-resource',
                title: 'ACL Resource',
                description: 'acl.xml resource definition',
                icon: 'K',
                files: ['etc/acl.xml'],
                defaultConfig: {
                    resources: []
                }
            },
            {
                type: 'admin-menu',
                title: 'Admin Menu',
                description: 'menu.xml menu items',
                icon: 'N',
                files: ['etc/adminhtml/menu.xml'],
                defaultConfig: {
                    menuItems: []
                }
            },
            {
                type: 'system-config',
                title: 'System Config',
                description: 'system.xml + config.xml + ACL',
                icon: 'S',
                files: ['etc/adminhtml/system.xml', 'etc/config.xml', 'etc/acl.xml'],
                defaultConfig: {
                    tab: '',
                    section: '',
                    groups: []
                }
            },
            {
                type: 'admin-grid',
                title: 'Admin Grid',
                description: 'UI Component listing XML + data provider',
                icon: '#',
                files: ['view/adminhtml/ui_component/{entity}_listing.xml', 'Ui/DataProvider/{Entity}DataProvider.php'],
                defaultConfig: {
                    entityName: '',
                    columns: []
                }
            },
            {
                type: 'admin-form',
                title: 'Admin Form',
                description: 'UI Component form XML + data provider',
                icon: 'F',
                files: ['view/adminhtml/ui_component/{entity}_form.xml', 'Ui/DataProvider/{Entity}FormDataProvider.php'],
                defaultConfig: {
                    entityName: '',
                    fieldsets: []
                }
            }
        ]
    }
};

/**
 * Common Magento events for the observer block dropdown
 */
const CommonMagentoEvents = [
    'catalog_product_save_after',
    'catalog_product_save_before',
    'catalog_product_delete_after',
    'checkout_cart_add_product_complete',
    'checkout_cart_update_items_after',
    'sales_order_place_after',
    'sales_order_save_after',
    'sales_order_invoice_save_after',
    'sales_order_shipment_save_after',
    'customer_register_success',
    'customer_login',
    'customer_logout',
    'customer_save_after',
    'controller_action_predispatch',
    'controller_action_postdispatch',
    'layout_render_before',
    'cms_page_render',
    'catalog_category_save_after',
    'checkout_submit_all_after',
    'payment_method_is_active'
];

/**
 * Generate HTML for a draggable block in the sidebar
 */
function generateBlockHTML(block, category) {
    return `
        <div class="blockelem create-flowy noselect" data-category="${category}">
            <input type="hidden" name="blockelemtype" class="blockelemtype" value="${block.type}">
            <input type="hidden" name="blockconfig" class="blockconfig" value='${JSON.stringify(block.defaultConfig)}'>
            <div class="grabme">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="3" cy="3" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="3" r="1.5" fill="currentColor"/>
                    <circle cx="3" cy="9" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                </svg>
            </div>
            <div class="blockin">
                <div class="blockico" style="background: ${BlockCategories[category].color}20;">
                    <span style="background: ${BlockCategories[category].color};"></span>
                    <span class="block-icon-letter" style="color: ${BlockCategories[category].color}; font-size: 14px; font-weight: 700;">${block.icon}</span>
                </div>
                <div class="blocktext">
                    <p class="blocktitle">${block.title}</p>
                    <p class="blockdesc">${block.description}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate the canvas block content after snapping
 */
function generateCanvasBlockHTML(blockType, blockId) {
    const block = findBlockByType(blockType);
    const category = findCategoryByBlockType(blockType);

    if (!block || !category) return '';

    const categoryData = BlockCategories[category];
    const filesPreview = block.files.slice(0, 3).join(', ');

    return `
        <div class="blocky-header" style="border-left-color: ${categoryData.color};">
            <div class="blocky-left">
                <span class="blocky-icon" style="color: ${categoryData.color}; font-weight: 700;">${block.icon}</span>
                <span class="blocky-name" contenteditable="true">${block.title}</span>
            </div>
            <div class="blocky-right">
                <button class="blocky-menu-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="blocky-body">
            <p class="blocky-desc">${block.description}</p>
            <div class="blocky-tags">
                <span class="blocky-tag" style="background: ${categoryData.color}20; color: ${categoryData.color};">${categoryData.name}</span>
            </div>
            <p class="blocky-files">${filesPreview}</p>
        </div>
    `;
}

/**
 * Find block definition by type
 */
function findBlockByType(type) {
    for (const category of Object.values(BlockCategories)) {
        const block = category.blocks.find(b => b.type === type);
        if (block) return block;
    }
    return null;
}

/**
 * Find category key by block type
 */
function findCategoryByBlockType(type) {
    for (const [key, category] of Object.entries(BlockCategories)) {
        if (category.blocks.find(b => b.type === type)) {
            return key;
        }
    }
    return null;
}

/**
 * Populate the sidebar with blocks for a given category
 */
function populateBlockList(categoryKey) {
    const category = BlockCategories[categoryKey];
    if (!category) return '';

    return category.blocks.map(block => generateBlockHTML(block, categoryKey)).join('');
}

/**
 * Get all block types as a flat array
 */
function getAllBlockTypes() {
    const types = [];
    for (const [catKey, category] of Object.entries(BlockCategories)) {
        for (const block of category.blocks) {
            types.push({ ...block, category: catKey });
        }
    }
    return types;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlockCategories, CommonMagentoEvents, generateBlockHTML, generateCanvasBlockHTML, findBlockByType, findCategoryByBlockType, populateBlockList, getAllBlockTypes };
}
