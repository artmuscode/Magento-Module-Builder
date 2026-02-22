/**
 * Magento Module Exporter - Generates AI-ready JSON with file manifest and phased instructions
 */

class MagentoExporter {
    constructor(propertiesPanel) {
        this.propertiesPanel = propertiesPanel;
        this.projectName = 'My Magento Module';
        this.projectDescription = '';
    }

    setProjectMeta(name, description) {
        this.projectName = name;
        this.projectDescription = description;
    }

    /**
     * Main export method
     */
    export() {
        const flowyOutput = flowy.output();
        const blocks = flowyOutput?.html ? this.parseBlocks(flowyOutput.html) : [];
        const blockDataMap = this.propertiesPanel.getAllBlockData();

        const moduleInfo = this.getModuleInfo(blockDataMap);
        const components = this.buildComponents(blocks, blockDataMap, moduleInfo);
        const fileManifest = this.buildFileManifest(blockDataMap, moduleInfo);
        const dependencies = this.detectDependencies(blockDataMap);
        const layers = this.buildArchitectureLayers(blockDataMap);
        const aiInstructions = this.generateAiInstructions(blockDataMap, moduleInfo);
        const warnings = typeof moduleValidator !== 'undefined' ? moduleValidator.validate() : [];

        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            tool: 'magento-module-builder',
            project: {
                name: this.projectName,
                description: this.projectDescription
            },
            module: {
                vendor: moduleInfo.vendor,
                name: moduleInfo.moduleName,
                fullName: moduleInfo.vendor && moduleInfo.moduleName ? `${moduleInfo.vendor}_${moduleInfo.moduleName}` : '',
                namespace: moduleInfo.vendor && moduleInfo.moduleName ? `${moduleInfo.vendor}\\${moduleInfo.moduleName}` : '',
                composerName: SmartDefaults.suggestComposerName(moduleInfo.vendor, moduleInfo.moduleName),
                version: moduleInfo.version,
                phpVersion: moduleInfo.phpVersion,
                description: moduleInfo.description
            },
            components,
            architecture: {
                layers,
                dependencies
            },
            fileManifest,
            aiInstructions,
            validation: {
                warnings: warnings.length,
                issues: warnings.map(w => ({ severity: w.severity, message: w.message.replace(/<[^>]+>/g, '') }))
            }
        };
    }

    /**
     * Parse blocks from Flowy HTML output
     */
    parseBlocks(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blocks = [];

        doc.querySelectorAll('.block').forEach(block => {
            const id = block.querySelector('.blockid')?.value;
            const type = block.querySelector('.blockelemtype')?.value;
            if (id && type) {
                blocks.push({ id, type });
            }
        });

        return blocks;
    }

    /**
     * Extract module registration info
     */
    getModuleInfo(blockDataMap) {
        for (const [id, data] of Object.entries(blockDataMap)) {
            if (data.type === 'module-registration') {
                return {
                    vendor: data.config?.vendor || '',
                    moduleName: data.config?.moduleName || '',
                    version: data.config?.version || '1.0.0',
                    phpVersion: data.config?.phpVersion || '>=8.1',
                    description: data.config?.description || '',
                    dependencies: data.config?.dependencies || []
                };
            }
        }
        return { vendor: 'Vendor', moduleName: 'Module', version: '1.0.0', phpVersion: '>=8.1', description: '', dependencies: [] };
    }

    /**
     * Build component list from block data
     */
    buildComponents(blocks, blockDataMap, moduleInfo) {
        const components = [];

        for (const [id, data] of Object.entries(blockDataMap)) {
            const blockDef = findBlockByType(data.type);
            const category = findCategoryByBlockType(data.type);

            components.push({
                id,
                type: data.type,
                name: data.name,
                category,
                config: data.config,
                files: SmartDefaults.resolveFilePaths(data.type, data.config, moduleInfo.vendor, moduleInfo.moduleName)
            });
        }

        return components;
    }

    /**
     * Build complete file manifest with Magento-convention paths
     */
    buildFileManifest(blockDataMap, moduleInfo) {
        const allFiles = new Set();

        for (const [id, data] of Object.entries(blockDataMap)) {
            const files = SmartDefaults.resolveFilePaths(data.type, data.config, moduleInfo.vendor, moduleInfo.moduleName);
            files.forEach(f => allFiles.add(f));
        }

        // Sort files by path for readable output
        const sorted = [...allFiles].sort();

        // Group by directory
        const grouped = {};
        for (const filepath of sorted) {
            const parts = filepath.split('/');
            const dir = parts.slice(0, -1).join('/');
            if (!grouped[dir]) grouped[dir] = [];
            grouped[dir].push(parts[parts.length - 1]);
        }

        return {
            totalFiles: sorted.length,
            basePath: moduleInfo.vendor && moduleInfo.moduleName
                ? `app/code/${moduleInfo.vendor}/${moduleInfo.moduleName}`
                : 'app/code/Vendor/Module',
            files: sorted,
            byDirectory: grouped
        };
    }

    /**
     * Auto-detect module dependencies based on block types
     */
    detectDependencies(blockDataMap) {
        const deps = new Set();
        const userDeps = new Set();

        for (const [id, data] of Object.entries(blockDataMap)) {
            switch (data.type) {
                case 'module-registration':
                    (data.config?.dependencies || []).forEach(d => userDeps.add(d));
                    break;
                case 'admin-controller':
                case 'admin-menu':
                case 'admin-grid':
                case 'admin-form':
                    deps.add('Magento_Backend');
                    break;
                case 'rest-api':
                    deps.add('Magento_Webapi');
                    break;
                case 'graphql':
                    deps.add('Magento_GraphQl');
                    break;
                case 'message-queue':
                    deps.add('Magento_MessageQueue');
                    if (data.config?.connection === 'amqp') {
                        deps.add('Magento_Amqp');
                    }
                    break;
                case 'system-config':
                    deps.add('Magento_Config');
                    deps.add('Magento_Backend');
                    break;
                case 'ui-component':
                case 'jquery-widget':
                    deps.add('Magento_Ui');
                    break;
                case 'cron-job':
                    deps.add('Magento_Cron');
                    break;
            }
        }

        return {
            autoDetected: [...deps].sort(),
            userSpecified: [...userDeps].sort(),
            all: [...new Set([...deps, ...userDeps])].sort()
        };
    }

    /**
     * Group blocks into architecture layers
     */
    buildArchitectureLayers(blockDataMap) {
        const layers = {
            foundation: [],
            data: [],
            routing: [],
            logic: [],
            config: [],
            api: [],
            frontend: []
        };

        const layerMap = {
            'module-registration': 'foundation',
            'db-schema': 'data',
            'model-entity': 'data',
            'repository': 'data',
            'data-patch': 'data',
            'frontend-controller': 'routing',
            'admin-controller': 'routing',
            'custom-router': 'routing',
            'plugin': 'logic',
            'observer': 'logic',
            'cron-job': 'logic',
            'cli-command': 'logic',
            'viewmodel': 'logic',
            'system-config': 'config',
            'acl-resource': 'config',
            'admin-menu': 'config',
            'rest-api': 'api',
            'graphql': 'api',
            'message-queue': 'api',
            'ui-component': 'frontend',
            'jquery-widget': 'frontend',
            'js-mixin': 'frontend',
            'admin-grid': 'frontend',
            'admin-form': 'frontend'
        };

        for (const [id, data] of Object.entries(blockDataMap)) {
            const layer = layerMap[data.type] || 'logic';
            layers[layer].push({
                id,
                type: data.type,
                name: data.name
            });
        }

        return layers;
    }

    /**
     * Generate phased AI instructions matching module-scaffold.md
     */
    generateAiInstructions(blockDataMap, moduleInfo) {
        const instructions = [];
        const types = new Set();
        for (const [id, data] of Object.entries(blockDataMap)) {
            types.add(data.type);
        }

        const moduleFull = moduleInfo.vendor && moduleInfo.moduleName
            ? `${moduleInfo.vendor}_${moduleInfo.moduleName}`
            : 'Vendor_Module';
        const ns = moduleInfo.vendor && moduleInfo.moduleName
            ? `${moduleInfo.vendor}\\${moduleInfo.moduleName}`
            : 'Vendor\\Module';

        // Phase 1: Foundation
        if (types.has('module-registration')) {
            instructions.push({
                phase: 1,
                phaseName: 'Foundation',
                instruction: `Create module foundation for ${moduleFull}: registration.php, etc/module.xml, and composer.json. Namespace: ${ns}. Version: ${moduleInfo.version}.`,
                priority: 1
            });
        }

        // Phase 2: Database
        const dbSchemas = this.getBlocksByType(blockDataMap, 'db-schema');
        if (dbSchemas.length > 0) {
            for (const { data } of dbSchemas) {
                const cols = (data.config?.columns || []).map(c => `${c.name} (${c.type})`).join(', ');
                instructions.push({
                    phase: 2,
                    phaseName: 'Database',
                    instruction: `Create etc/db_schema.xml with table "${data.config?.tableName || 'TBD'}"${cols ? ` containing columns: ${cols}` : ''}. Generate db_schema_whitelist.json.`,
                    priority: 2
                });
            }
        }

        // Phase 3: API Contracts (Interfaces)
        const repos = this.getBlocksByType(blockDataMap, 'repository');
        if (repos.length > 0) {
            for (const { data } of repos) {
                const entity = data.config?.entityName || 'Entity';
                const methods = (data.config?.methods || []).join(', ');
                instructions.push({
                    phase: 3,
                    phaseName: 'API Contracts',
                    instruction: `Create service contracts for ${entity}: Api/Data/${entity}Interface.php, Api/Data/${entity}SearchResultsInterface.php, Api/${entity}RepositoryInterface.php with methods: ${methods}.`,
                    priority: 3
                });
            }
        }

        // Phase 4: Model Implementation
        const models = this.getBlocksByType(blockDataMap, 'model-entity');
        if (models.length > 0) {
            for (const { data } of models) {
                const entity = data.config?.entityName || 'Entity';
                instructions.push({
                    phase: 4,
                    phaseName: 'Model Implementation',
                    instruction: `Create Model/${entity}.php (extends AbstractModel), Model/ResourceModel/${entity}.php (table: "${data.config?.tableName || 'TBD'}", id: "${data.config?.idField || 'entity_id'}"), and Model/ResourceModel/${entity}/Collection.php.${repos.length > 0 ? ` Also create Model/${entity}Repository.php implementing the repository interface.` : ''}`,
                    priority: 4
                });
            }
        }

        // Phase 5: DI Wiring
        if (repos.length > 0 || types.has('plugin') || types.has('cli-command')) {
            instructions.push({
                phase: 5,
                phaseName: 'DI Wiring',
                instruction: `Create etc/di.xml with preference mappings${repos.length > 0 ? ' (interface -> implementation for repositories)' : ''}${types.has('plugin') ? ', plugin declarations' : ''}${types.has('cli-command') ? ', CLI command registrations' : ''}.`,
                priority: 5
            });
        }

        // Phase 6: Frontend (controllers, templates, viewmodels)
        const frontControllers = this.getBlocksByType(blockDataMap, 'frontend-controller');
        if (frontControllers.length > 0) {
            for (const { data } of frontControllers) {
                const route = data.config?.routeFrontName || 'module';
                const dir = data.config?.controllerDir || 'Index';
                const action = data.config?.actionName || 'Index';
                instructions.push({
                    phase: 6,
                    phaseName: 'Frontend',
                    instruction: `Create frontend route "${route}" with controller ${dir}/${action} (${data.config?.httpMethod || 'GET'}, result: ${data.config?.resultType || 'Page'}). Include etc/frontend/routes.xml and layout XML.`,
                    priority: 6
                });
            }
        }

        const viewmodels = this.getBlocksByType(blockDataMap, 'viewmodel');
        for (const { data } of viewmodels) {
            instructions.push({
                phase: 6,
                phaseName: 'Frontend',
                instruction: `Create ViewModel/${data.config?.viewModelName || 'Data'}.php implementing ArgumentInterface${data.config?.methods?.length ? ` with methods: ${data.config.methods.join(', ')}` : ''}.`,
                priority: 6
            });
        }

        // Phase 7: Admin
        const adminControllers = this.getBlocksByType(blockDataMap, 'admin-controller');
        if (adminControllers.length > 0 || types.has('acl-resource') || types.has('admin-menu') || types.has('admin-grid') || types.has('admin-form')) {
            // ACL
            if (types.has('acl-resource') || types.has('system-config')) {
                instructions.push({
                    phase: 7,
                    phaseName: 'Admin',
                    instruction: 'Create etc/acl.xml with access control resources.',
                    priority: 7
                });
            }

            // Admin routes + controllers
            for (const { data } of adminControllers) {
                const route = data.config?.routeId || 'module';
                const dir = data.config?.controllerDir || 'Index';
                const action = data.config?.actionName || 'Index';
                instructions.push({
                    phase: 7,
                    phaseName: 'Admin',
                    instruction: `Create admin route "${route}" with Controller/Adminhtml/${dir}/${action}.php. ADMIN_RESOURCE: "${data.config?.adminResource || 'TBD'}".`,
                    priority: 7
                });
            }

            // Admin menu
            if (types.has('admin-menu')) {
                instructions.push({
                    phase: 7,
                    phaseName: 'Admin',
                    instruction: 'Create etc/adminhtml/menu.xml with admin menu entries.',
                    priority: 7
                });
            }

            // Admin grid
            const grids = this.getBlocksByType(blockDataMap, 'admin-grid');
            for (const { data } of grids) {
                const entity = data.config?.entityName || 'Entity';
                const cols = (data.config?.columns || []).map(c => c.name).filter(Boolean).join(', ');
                instructions.push({
                    phase: 7,
                    phaseName: 'Admin',
                    instruction: `Create admin listing UI component for ${entity}${cols ? ` with columns: ${cols}` : ''}. Include data provider.`,
                    priority: 7
                });
            }

            // Admin form
            const forms = this.getBlocksByType(blockDataMap, 'admin-form');
            for (const { data } of forms) {
                const entity = data.config?.entityName || 'Entity';
                instructions.push({
                    phase: 7,
                    phaseName: 'Admin',
                    instruction: `Create admin form UI component for ${entity}. Include data provider.`,
                    priority: 7
                });
            }
        }

        // Phase 8: API
        const restApis = this.getBlocksByType(blockDataMap, 'rest-api');
        if (restApis.length > 0) {
            for (const { data } of restApis) {
                const routes = (data.config?.routes || []).map(r => `${r.method} ${r.url}`).join(', ');
                instructions.push({
                    phase: 8,
                    phaseName: 'API',
                    instruction: `Create etc/webapi.xml with REST routes${routes ? `: ${routes}` : ''}. Map to service contract methods.`,
                    priority: 8
                });
            }
        }

        const gqls = this.getBlocksByType(blockDataMap, 'graphql');
        for (const { data } of gqls) {
            instructions.push({
                phase: 8,
                phaseName: 'API',
                instruction: `Create GraphQL schema (etc/schema.graphqls) for type "${data.config?.typeName || 'TBD'}" with resolver Model/Resolver/${data.config?.resolverClass || 'TBD'}.php.`,
                priority: 8
            });
        }

        const queues = this.getBlocksByType(blockDataMap, 'message-queue');
        for (const { data } of queues) {
            instructions.push({
                phase: 8,
                phaseName: 'API',
                instruction: `Create message queue config for topic "${data.config?.topicName || 'TBD'}" with consumer class "${data.config?.consumerClass || 'TBD'}". Connection: ${data.config?.connection || 'amqp'}.`,
                priority: 8
            });
        }

        // Business logic (plugins, observers, cron, CLI) - Phase 5.5 (between DI and Frontend)
        const plugins = this.getBlocksByType(blockDataMap, 'plugin');
        for (const { data } of plugins) {
            instructions.push({
                phase: 5,
                phaseName: 'Business Logic',
                instruction: `Create ${data.config?.pluginType || 'after'} plugin for ${data.config?.targetClass || 'TBD'}::${data.config?.targetMethod || 'TBD'}. Sort order: ${data.config?.sortOrder || 10}.`,
                priority: 5
            });
        }

        const observers = this.getBlocksByType(blockDataMap, 'observer');
        for (const { data } of observers) {
            instructions.push({
                phase: 5,
                phaseName: 'Business Logic',
                instruction: `Create observer for event "${data.config?.eventName || 'TBD'}" in ${data.config?.scope || 'global'} scope. Class: Observer/${data.config?.observerName || 'TBD'}.php.`,
                priority: 5
            });
        }

        const crons = this.getBlocksByType(blockDataMap, 'cron-job');
        for (const { data } of crons) {
            instructions.push({
                phase: 5,
                phaseName: 'Business Logic',
                instruction: `Create cron job "${data.config?.jobName || 'TBD'}" with schedule "${data.config?.schedule || '0 * * * *'}" in group "${data.config?.group || 'default'}".`,
                priority: 5
            });
        }

        const clis = this.getBlocksByType(blockDataMap, 'cli-command');
        for (const { data } of clis) {
            instructions.push({
                phase: 5,
                phaseName: 'Business Logic',
                instruction: `Create CLI command "${data.config?.commandName || 'TBD'}": ${data.config?.description || 'No description'}.`,
                priority: 5
            });
        }

        // System config
        const sysConfigs = this.getBlocksByType(blockDataMap, 'system-config');
        for (const { data } of sysConfigs) {
            instructions.push({
                phase: 7,
                phaseName: 'Configuration',
                instruction: `Create system configuration: etc/adminhtml/system.xml (section: "${data.config?.section || 'TBD'}"), etc/config.xml for defaults, and ACL for config access.`,
                priority: 7
            });
        }

        // Data patches
        const patches = this.getBlocksByType(blockDataMap, 'data-patch');
        for (const { data } of patches) {
            instructions.push({
                phase: 4,
                phaseName: 'Data Setup',
                instruction: `Create data patch Setup/Patch/Data/${data.config?.patchName || 'TBD'}.php. ${data.config?.description || ''}`,
                priority: 4
            });
        }

        // Frontend JS
        const uiComps = this.getBlocksByType(blockDataMap, 'ui-component');
        for (const { data } of uiComps) {
            instructions.push({
                phase: 6,
                phaseName: 'Frontend JS',
                instruction: `Create KnockoutJS UI component "${data.config?.componentName || 'TBD'}" with template.`,
                priority: 6
            });
        }

        const widgets = this.getBlocksByType(blockDataMap, 'jquery-widget');
        for (const { data } of widgets) {
            instructions.push({
                phase: 6,
                phaseName: 'Frontend JS',
                instruction: `Create jQuery widget "${data.config?.widgetNamespace || 'mage'}.${data.config?.widgetName || 'TBD'}" with PHTML initialization template.`,
                priority: 6
            });
        }

        const mixins = this.getBlocksByType(blockDataMap, 'js-mixin');
        for (const { data } of mixins) {
            instructions.push({
                phase: 6,
                phaseName: 'Frontend JS',
                instruction: `Create JS mixin for "${data.config?.targetModule || 'TBD'}" in requirejs-config.js.`,
                priority: 6
            });
        }

        return instructions.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Get blocks of a specific type from block data map
     */
    getBlocksByType(blockDataMap, type) {
        const result = [];
        for (const [id, data] of Object.entries(blockDataMap)) {
            if (data.type === type) {
                result.push({ id, data });
            }
        }
        return result;
    }

    /**
     * Export to clipboard
     */
    async copyToClipboard() {
        const data = this.export();
        const json = JSON.stringify(data, null, 2);

        try {
            await navigator.clipboard.writeText(json);
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            return false;
        }
    }

    /**
     * Download as JSON file
     */
    downloadJson() {
        const data = this.export();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const name = data.module.fullName || this.projectName;
        a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-module-design.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

let magentoExporter;
