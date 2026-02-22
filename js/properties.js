/**
 * Properties Panel - Magento 2 Block Configuration UI
 * Handles 24 block types with smart defaults
 */

class PropertiesPanel {
    constructor() {
        this.panel = document.getElementById('properties');
        this.currentBlock = null;
        this.blockData = new Map();
        this.init();
    }

    init() {
        document.getElementById('close-properties')?.addEventListener('click', () => {
            this.hide();
        });
        document.getElementById('delete-block')?.addEventListener('click', () => {
            if (this.currentBlock) {
                this.deleteCurrentBlock();
            }
        });
    }

    show(block) {
        this.currentBlock = block;
        const blockId = block.querySelector('.blockid')?.value;
        const blockType = block.querySelector('.blockelemtype')?.value;

        if (!blockId || !blockType) return;

        let data = this.blockData.get(blockId);
        if (!data) {
            const blockDef = findBlockByType(blockType);
            data = {
                name: blockDef?.title || 'Untitled',
                description: blockDef?.description || '',
                type: blockType,
                config: JSON.parse(JSON.stringify(blockDef?.defaultConfig || {}))
            };
            this.blockData.set(blockId, data);
        }

        this.renderProperties(blockType, data);

        document.getElementById('propwrap').classList.add('itson');
        this.panel.classList.add('expanded');
        block.classList.add('selectedblock');
    }

    hide() {
        if (this.currentBlock) {
            this.currentBlock.classList.remove('selectedblock');
        }
        this.panel.classList.remove('expanded');
        setTimeout(() => {
            document.getElementById('propwrap').classList.remove('itson');
        }, 300);
        this.currentBlock = null;
    }

    renderProperties(blockType, data) {
        const propList = document.getElementById('proplist');
        if (!propList) return;

        const category = findCategoryByBlockType(blockType);
        const categoryData = BlockCategories[category];

        propList.innerHTML = `
            <div class="prop-section">
                <label class="prop-label">Display Name</label>
                <input type="text" class="prop-input" id="prop-name" value="${this.esc(data.name)}" placeholder="Component name">
            </div>
            ${this.renderTypeSpecificFields(blockType, data.config)}
        `;

        this.attachSaveListeners();
    }

    renderTypeSpecificFields(blockType, config) {
        switch (blockType) {
            case 'module-registration': return this.renderModuleRegistration(config);
            case 'db-schema': return this.renderDbSchema(config);
            case 'model-entity': return this.renderModelEntity(config);
            case 'repository': return this.renderRepository(config);
            case 'data-patch': return this.renderDataPatch(config);
            case 'frontend-controller': return this.renderFrontendController(config);
            case 'admin-controller': return this.renderAdminController(config);
            case 'custom-router': return this.renderCustomRouter(config);
            case 'plugin': return this.renderPlugin(config);
            case 'observer': return this.renderObserver(config);
            case 'cron-job': return this.renderCronJob(config);
            case 'cli-command': return this.renderCliCommand(config);
            case 'viewmodel': return this.renderViewModel(config);
            case 'system-config': return this.renderSystemConfig(config);
            case 'acl-resource': return this.renderAclResource(config);
            case 'admin-menu': return this.renderAdminMenu(config);
            case 'rest-api': return this.renderRestApi(config);
            case 'graphql': return this.renderGraphql(config);
            case 'message-queue': return this.renderMessageQueue(config);
            case 'ui-component': return this.renderUiComponent(config);
            case 'jquery-widget': return this.renderJqueryWidget(config);
            case 'js-mixin': return this.renderJsMixin(config);
            case 'admin-grid': return this.renderAdminGrid(config);
            case 'admin-form': return this.renderAdminForm(config);
            default: return '<p class="prop-hint">No configuration for this block type.</p>';
        }
    }

    // ==================== Foundation ====================

    renderModuleRegistration(config) {
        return `
            <div class="prop-section-title">Module Identity</div>
            <div class="prop-section">
                <div class="prop-row">
                    <div class="prop-half">
                        <label class="prop-label">Vendor</label>
                        <input type="text" class="prop-input" id="prop-vendor" value="${this.esc(config.vendor)}" placeholder="Acme">
                    </div>
                    <div class="prop-half">
                        <label class="prop-label">Module Name</label>
                        <input type="text" class="prop-input" id="prop-module-name" value="${this.esc(config.moduleName)}" placeholder="Blog">
                    </div>
                </div>
            </div>
            <div class="prop-section">
                <label class="prop-label">Version</label>
                <input type="text" class="prop-input" id="prop-version" value="${this.esc(config.version)}" placeholder="1.0.0">
            </div>
            <div class="prop-section">
                <label class="prop-label">PHP Version</label>
                <select class="prop-select" id="prop-php-version">
                    <option value=">=8.1" ${config.phpVersion === '>=8.1' ? 'selected' : ''}>&gt;= 8.1</option>
                    <option value=">=8.2" ${config.phpVersion === '>=8.2' ? 'selected' : ''}>&gt;= 8.2</option>
                    <option value=">=8.3" ${config.phpVersion === '>=8.3' ? 'selected' : ''}>&gt;= 8.3</option>
                </select>
            </div>
            <div class="prop-section">
                <label class="prop-label">Description</label>
                <textarea class="prop-textarea" id="prop-mod-description" rows="2" placeholder="Module description for composer.json">${this.esc(config.description)}</textarea>
            </div>
            <div class="prop-section">
                <label class="prop-label">Module Dependencies</label>
                <div id="deps-list" class="prop-list">
                    ${(config.dependencies || []).map((d, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(d)}" placeholder="Magento_Catalog">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('dependencies', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addDependency()">+ Add Dependency</button>
            </div>
        `;
    }

    // ==================== Data Layer ====================

    renderDbSchema(config) {
        return `
            <div class="prop-section-title">Table Definition</div>
            <div class="prop-section">
                <label class="prop-label">Table Name</label>
                <input type="text" class="prop-input" id="prop-table-name" value="${this.esc(config.tableName)}" placeholder="vendor_module_entity">
                ${this.renderTableNameSuggestion()}
            </div>
            <div class="prop-section">
                <label class="prop-label">Columns</label>
                <div id="columns-list" class="prop-list">
                    ${(config.columns || []).map((col, i) => this.renderColumnItem(col, i)).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addColumn()">+ Add Column</button>
            </div>
            <div class="prop-section">
                <label class="prop-label">Indexes</label>
                <div id="indexes-list" class="prop-list">
                    ${(config.indexes || []).map((idx, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(idx.columns || '')}" placeholder="column1,column2">
                            <select class="prop-mini-select">
                                <option value="index" ${idx.type === 'index' ? 'selected' : ''}>INDEX</option>
                                <option value="unique" ${idx.type === 'unique' ? 'selected' : ''}>UNIQUE</option>
                                <option value="fulltext" ${idx.type === 'fulltext' ? 'selected' : ''}>FULLTEXT</option>
                            </select>
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('indexes', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addIndex()">+ Add Index</button>
            </div>
        `;
    }

    renderColumnItem(col, index) {
        const types = ['int', 'smallint', 'bigint', 'varchar', 'text', 'mediumtext', 'decimal', 'float', 'boolean', 'timestamp', 'datetime', 'date', 'blob'];
        return `
            <div class="prop-list-item" data-index="${index}" style="flex-wrap: wrap;">
                <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(col.name || '')}" placeholder="column_name"
                    onblur="propertiesPanel.onColumnNameBlur(${index}, this.value)">
                <select class="prop-mini-select" style="width: 90px;" data-col-type="${index}">
                    ${types.map(t => `<option value="${t}" ${col.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
                <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('columns', ${index})">×</button>
                ${col.type === 'varchar' ? `<input type="text" class="prop-input-sm" style="flex: 0 0 60px; margin-top: 4px;" value="${this.esc(col.length || '255')}" placeholder="255" title="Length">` : ''}
                ${col.type === 'decimal' ? `<input type="text" class="prop-input-sm" style="flex: 0 0 80px; margin-top: 4px;" value="${this.esc((col.precision || '12') + ',' + (col.scale || '4'))}" placeholder="12,4" title="Precision,Scale">` : ''}
                <label class="prop-checkbox" style="margin-top: 4px; font-size: 11px;">
                    <input type="checkbox" ${col.nullable ? 'checked' : ''}> nullable
                </label>
            </div>
        `;
    }

    renderTableNameSuggestion() {
        const regBlock = this.findBlockDataByType('module-registration');
        if (regBlock?.config?.vendor && regBlock?.config?.moduleName) {
            return '';
        }
        return '<p class="prop-suggestion" title="Add a Module Registration block to get table name suggestions">Set vendor/module in Module Registration for auto-suggestions</p>';
    }

    renderModelEntity(config) {
        const suggestion = this.suggestTableName(config.entityName);
        return `
            <div class="prop-section-title">Model Configuration</div>
            <div class="prop-section">
                <label class="prop-label">Entity Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-entity-name" value="${this.esc(config.entityName)}" placeholder="BlogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Table Name</label>
                <input type="text" class="prop-input" id="prop-table-name" value="${this.esc(config.tableName)}" placeholder="vendor_module_entity">
                ${suggestion ? `<p class="prop-suggestion" onclick="document.getElementById('prop-table-name').value='${suggestion}'; propertiesPanel.saveCurrentBlock();">Suggestion: ${suggestion}</p>` : ''}
            </div>
            <div class="prop-section">
                <label class="prop-label">ID Field</label>
                <input type="text" class="prop-input" id="prop-id-field" value="${this.esc(config.idField)}" placeholder="entity_id">
            </div>
        `;
    }

    renderRepository(config) {
        const methods = config.methods || ['save', 'getById', 'getList', 'delete', 'deleteById'];
        return `
            <div class="prop-section-title">Repository Configuration</div>
            <div class="prop-section">
                <label class="prop-label">Entity Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-entity-name" value="${this.esc(config.entityName)}" placeholder="BlogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Methods</label>
                ${methods.map(m => `
                    <label class="prop-checkbox">
                        <input type="checkbox" data-method="${m}" checked> ${m}
                    </label>
                `).join('')}
            </div>
        `;
    }

    renderDataPatch(config) {
        return `
            <div class="prop-section-title">Data Patch</div>
            <div class="prop-section">
                <label class="prop-label">Patch Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-patch-name" value="${this.esc(config.patchName)}" placeholder="AddDefaultCategories">
            </div>
            <div class="prop-section">
                <label class="prop-label">Description</label>
                <textarea class="prop-textarea" id="prop-patch-description" rows="2" placeholder="What does this patch do?">${this.esc(config.description)}</textarea>
            </div>
            <div class="prop-section">
                <label class="prop-label">Dependencies</label>
                <div id="patch-deps-list" class="prop-list">
                    ${(config.dependencies || []).map((d, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(d)}" placeholder="Vendor\\Module\\Setup\\Patch\\Data\\OtherPatch">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('dependencies', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addPatchDep()">+ Add Dependency</button>
            </div>
        `;
    }

    // ==================== Controllers ====================

    renderFrontendController(config) {
        const suggestion = this.suggestRouteName();
        return `
            <div class="prop-section-title">Frontend Route</div>
            <div class="prop-section">
                <label class="prop-label">Route Front Name</label>
                <input type="text" class="prop-input" id="prop-route-front" value="${this.esc(config.routeFrontName)}" placeholder="blog">
                ${suggestion ? `<p class="prop-suggestion" onclick="document.getElementById('prop-route-front').value='${suggestion}'; propertiesPanel.saveCurrentBlock();">Suggestion: ${suggestion}</p>` : ''}
            </div>
            <div class="prop-section">
                <label class="prop-label">Controller Directory</label>
                <input type="text" class="prop-input" id="prop-controller-dir" value="${this.esc(config.controllerDir)}" placeholder="Post">
            </div>
            <div class="prop-section">
                <label class="prop-label">Action Name</label>
                <input type="text" class="prop-input" id="prop-action-name" value="${this.esc(config.actionName)}" placeholder="View">
            </div>
            <div class="prop-section">
                <label class="prop-label">HTTP Method</label>
                <select class="prop-select" id="prop-http-method">
                    ${['GET', 'POST'].map(m => `<option value="${m}" ${config.httpMethod === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </div>
            <div class="prop-section">
                <label class="prop-label">Result Type</label>
                <select class="prop-select" id="prop-result-type">
                    ${['Page', 'Json', 'Redirect', 'Forward', 'Raw'].map(r => `<option value="${r}" ${config.resultType === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderAdminController(config) {
        return `
            <div class="prop-section-title">Admin Route</div>
            <div class="prop-section">
                <label class="prop-label">Route ID</label>
                <input type="text" class="prop-input" id="prop-route-id" value="${this.esc(config.routeId)}" placeholder="blog">
            </div>
            <div class="prop-section">
                <label class="prop-label">Controller Directory</label>
                <input type="text" class="prop-input" id="prop-controller-dir" value="${this.esc(config.controllerDir)}" placeholder="Post">
            </div>
            <div class="prop-section">
                <label class="prop-label">Action Name</label>
                <input type="text" class="prop-input" id="prop-action-name" value="${this.esc(config.actionName)}" placeholder="Index">
            </div>
            <div class="prop-section">
                <label class="prop-label">Admin Resource (ACL)</label>
                <input type="text" class="prop-input" id="prop-admin-resource" value="${this.esc(config.adminResource)}" placeholder="Acme_Blog::post">
                ${this.renderAclSuggestion()}
            </div>
            <div class="prop-section">
                <label class="prop-label">HTTP Method</label>
                <select class="prop-select" id="prop-http-method">
                    ${['GET', 'POST'].map(m => `<option value="${m}" ${config.httpMethod === m ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderCustomRouter(config) {
        return `
            <div class="prop-section-title">Custom Router</div>
            <div class="prop-section">
                <label class="prop-label">Router Class Name</label>
                <input type="text" class="prop-input" id="prop-router-name" value="${this.esc(config.routerName)}" placeholder="CustomRouter">
            </div>
            <div class="prop-section">
                <label class="prop-label">Sort Order</label>
                <input type="number" class="prop-input" id="prop-sort-order" value="${config.sortOrder || 60}">
            </div>
            <div class="prop-section">
                <label class="prop-label">Match Pattern (regex)</label>
                <input type="text" class="prop-input" id="prop-match-pattern" value="${this.esc(config.matchPattern)}" placeholder="/^custom-path/i">
            </div>
        `;
    }

    // ==================== Business Logic ====================

    renderPlugin(config) {
        return `
            <div class="prop-section-title">Plugin Configuration</div>
            <div class="prop-section">
                <label class="prop-label">Target Class (full namespace)</label>
                <input type="text" class="prop-input" id="prop-target-class" value="${this.esc(config.targetClass)}" placeholder="Magento\\Catalog\\Model\\Product">
            </div>
            <div class="prop-section">
                <label class="prop-label">Target Method</label>
                <input type="text" class="prop-input" id="prop-target-method" value="${this.esc(config.targetMethod)}" placeholder="getName">
            </div>
            <div class="prop-section">
                <label class="prop-label">Plugin Type</label>
                <select class="prop-select" id="prop-plugin-type">
                    ${['before', 'after', 'around'].map(t => `<option value="${t}" ${config.pluginType === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="prop-section">
                <label class="prop-label">Sort Order</label>
                <input type="number" class="prop-input" id="prop-sort-order" value="${config.sortOrder || 10}">
            </div>
        `;
    }

    renderObserver(config) {
        const eventOptions = CommonMagentoEvents.map(e =>
            `<option value="${e}" ${config.eventName === e ? 'selected' : ''}>${e}</option>`
        ).join('');

        return `
            <div class="prop-section-title">Observer Configuration</div>
            <div class="prop-section">
                <label class="prop-label">Event Name</label>
                <select class="prop-select" id="prop-event-name">
                    <option value="">-- Select or type custom --</option>
                    ${eventOptions}
                </select>
                <input type="text" class="prop-input" id="prop-event-custom" value="${this.esc(config.eventName)}" placeholder="custom_event_name" style="margin-top: 6px;">
            </div>
            <div class="prop-section">
                <label class="prop-label">Observer Class Name</label>
                <input type="text" class="prop-input" id="prop-observer-name" value="${this.esc(config.observerName)}" placeholder="HandleEventObserver">
            </div>
            <div class="prop-section">
                <label class="prop-label">Scope</label>
                <select class="prop-select" id="prop-scope">
                    ${['global', 'frontend', 'adminhtml'].map(s => `<option value="${s}" ${config.scope === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderCronJob(config) {
        return `
            <div class="prop-section-title">Cron Job</div>
            <div class="prop-section">
                <label class="prop-label">Job Name</label>
                <input type="text" class="prop-input" id="prop-job-name" value="${this.esc(config.jobName)}" placeholder="vendor_module_process_queue">
            </div>
            <div class="prop-section">
                <label class="prop-label">Schedule (cron expression)</label>
                <input type="text" class="prop-input" id="prop-schedule" value="${this.esc(config.schedule)}" placeholder="0 * * * *">
                <p class="prop-hint">Format: min hour day month weekday</p>
            </div>
            <div class="prop-section">
                <label class="prop-label">Group</label>
                <select class="prop-select" id="prop-group">
                    ${['default', 'index', 'consumers', 'staging'].map(g => `<option value="${g}" ${config.group === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
            </div>
        `;
    }

    renderCliCommand(config) {
        return `
            <div class="prop-section-title">CLI Command</div>
            <div class="prop-section">
                <label class="prop-label">Command Name</label>
                <input type="text" class="prop-input" id="prop-command-name" value="${this.esc(config.commandName)}" placeholder="vendor:module:action">
            </div>
            <div class="prop-section">
                <label class="prop-label">Description</label>
                <input type="text" class="prop-input" id="prop-cmd-description" value="${this.esc(config.description)}" placeholder="Describe what this command does">
            </div>
            <div class="prop-section">
                <label class="prop-label">Arguments</label>
                <div id="args-list" class="prop-list">
                    ${(config.arguments || []).map((a, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(a.name || '')}" placeholder="name">
                            <select class="prop-mini-select">
                                <option value="required" ${a.mode === 'required' ? 'selected' : ''}>required</option>
                                <option value="optional" ${a.mode === 'optional' ? 'selected' : ''}>optional</option>
                            </select>
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('arguments', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addArgument()">+ Add Argument</button>
            </div>
            <div class="prop-section">
                <label class="prop-label">Options</label>
                <div id="options-list" class="prop-list">
                    ${(config.options || []).map((o, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(o.name || '')}" placeholder="--option-name">
                            <input type="text" class="prop-input-sm" value="${this.esc(o.shortcut || '')}" placeholder="-o" style="width: 40px; flex: 0;">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('options', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addOption()">+ Add Option</button>
            </div>
        `;
    }

    renderViewModel(config) {
        return `
            <div class="prop-section-title">ViewModel</div>
            <div class="prop-section">
                <label class="prop-label">ViewModel Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-vm-name" value="${this.esc(config.viewModelName)}" placeholder="PostData">
            </div>
            <div class="prop-section">
                <label class="prop-label">Template Name</label>
                <input type="text" class="prop-input" id="prop-template-name" value="${this.esc(config.templateName)}" placeholder="Vendor_Module::template.phtml">
            </div>
            <div class="prop-section">
                <label class="prop-label">Public Methods</label>
                <div id="vm-methods-list" class="prop-list">
                    ${(config.methods || []).map((m, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(m)}" placeholder="getItems">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('methods', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addVmMethod()">+ Add Method</button>
            </div>
        `;
    }

    // ==================== Configuration ====================

    renderSystemConfig(config) {
        return `
            <div class="prop-section-title">System Configuration</div>
            <div class="prop-section">
                <label class="prop-label">Tab Label</label>
                <input type="text" class="prop-input" id="prop-tab" value="${this.esc(config.tab)}" placeholder="My Module Settings">
            </div>
            <div class="prop-section">
                <label class="prop-label">Section ID</label>
                <input type="text" class="prop-input" id="prop-section" value="${this.esc(config.section)}" placeholder="blog_settings">
            </div>
            <div class="prop-section">
                <label class="prop-label">Groups / Fields</label>
                <div id="groups-list" class="prop-list">
                    ${(config.groups || []).map((g, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(g.id || '')}" placeholder="group_id">
                            <input type="text" class="prop-input-sm" style="flex: 3;" value="${this.esc(g.label || '')}" placeholder="Group Label">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('groups', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 100%; margin-top: 4px;" value="${this.esc(g.fields || '')}" placeholder="field1,field2,field3 (comma-separated)">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addConfigGroup()">+ Add Group</button>
            </div>
        `;
    }

    renderAclResource(config) {
        return `
            <div class="prop-section-title">ACL Resources</div>
            <div class="prop-section">
                <div id="acl-list" class="prop-list">
                    ${(config.resources || []).map((r, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(r.id || '')}" placeholder="Vendor_Module::resource">
                            <input type="text" class="prop-input-sm" style="flex: 3;" value="${this.esc(r.title || '')}" placeholder="Resource Title">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('resources', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 48%; margin-top: 4px;" value="${this.esc(r.parent || '')}" placeholder="Parent resource">
                            <input type="number" class="prop-input-sm" style="flex: 0 0 50px; margin-top: 4px;" value="${r.sortOrder || 10}" placeholder="Sort">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addAclResource()">+ Add Resource</button>
            </div>
        `;
    }

    renderAdminMenu(config) {
        return `
            <div class="prop-section-title">Admin Menu Items</div>
            <div class="prop-section">
                <div id="menu-list" class="prop-list">
                    ${(config.menuItems || []).map((m, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(m.id || '')}" placeholder="Vendor_Module::item">
                            <input type="text" class="prop-input-sm" style="flex: 3;" value="${this.esc(m.title || '')}" placeholder="Menu Title">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('menuItems', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 100%; margin-top: 4px;" value="${this.esc(m.action || '')}" placeholder="route/controller/action">
                            <input type="text" class="prop-input-sm" style="flex: 1 0 48%; margin-top: 4px;" value="${this.esc(m.resource || '')}" placeholder="ACL resource">
                            <input type="text" class="prop-input-sm" style="flex: 1 0 48%; margin-top: 4px;" value="${this.esc(m.parent || '')}" placeholder="Parent menu">
                            <input type="number" class="prop-input-sm" style="flex: 0 0 50px; margin-top: 4px;" value="${m.sortOrder || 10}" placeholder="Sort">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addMenuItem()">+ Add Menu Item</button>
            </div>
        `;
    }

    // ==================== API Layer ====================

    renderRestApi(config) {
        return `
            <div class="prop-section-title">REST API Routes</div>
            <div class="prop-section">
                <div id="routes-list" class="prop-list">
                    ${(config.routes || []).map((r, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <select class="prop-mini-select">
                                ${['GET', 'POST', 'PUT', 'DELETE'].map(m => `<option value="${m}" ${r.method === m ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(r.url || '')}" placeholder="/V1/blog/posts/:id">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('routes', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 100%; margin-top: 4px;" value="${this.esc(r.serviceClass || '')}" placeholder="Service class (full namespace)">
                            <input type="text" class="prop-input-sm" style="flex: 1 0 48%; margin-top: 4px;" value="${this.esc(r.serviceMethod || '')}" placeholder="Method name">
                            <input type="text" class="prop-input-sm" style="flex: 1 0 48%; margin-top: 4px;" value="${this.esc(r.aclResource || '')}" placeholder="ACL resource">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addRestRoute()">+ Add Route</button>
            </div>
        `;
    }

    renderGraphql(config) {
        return `
            <div class="prop-section-title">GraphQL Schema</div>
            <div class="prop-section">
                <label class="prop-label">Type Name</label>
                <input type="text" class="prop-input" id="prop-type-name" value="${this.esc(config.typeName)}" placeholder="BlogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Query Name</label>
                <input type="text" class="prop-input" id="prop-query-name" value="${this.esc(config.queryName)}" placeholder="blogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Resolver Class Name</label>
                <input type="text" class="prop-input" id="prop-resolver-class" value="${this.esc(config.resolverClass)}" placeholder="BlogPostResolver">
            </div>
            <div class="prop-section">
                <label class="prop-label">Fields</label>
                <div id="gql-fields-list" class="prop-list">
                    ${(config.fields || []).map((f, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(f.name || '')}" placeholder="fieldName">
                            <select class="prop-mini-select" style="width: 80px;">
                                ${['String', 'Int', 'Float', 'Boolean', 'ID', 'String!', 'Int!', '[String]'].map(t => `<option value="${t}" ${f.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('fields', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addGqlField()">+ Add Field</button>
            </div>
        `;
    }

    renderMessageQueue(config) {
        return `
            <div class="prop-section-title">Message Queue</div>
            <div class="prop-section">
                <label class="prop-label">Topic Name</label>
                <input type="text" class="prop-input" id="prop-topic-name" value="${this.esc(config.topicName)}" placeholder="vendor.module.entity.action">
            </div>
            <div class="prop-section">
                <label class="prop-label">Consumer Class (full namespace)</label>
                <input type="text" class="prop-input" id="prop-consumer-class" value="${this.esc(config.consumerClass)}" placeholder="Vendor\\Module\\Model\\Consumer">
            </div>
            <div class="prop-section">
                <label class="prop-label">Connection</label>
                <select class="prop-select" id="prop-connection">
                    ${['amqp', 'db'].map(c => `<option value="${c}" ${config.connection === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="prop-section">
                <label class="prop-label">Max Messages</label>
                <input type="number" class="prop-input" id="prop-max-messages" value="${config.maxMessages || 5000}">
            </div>
        `;
    }

    // ==================== Frontend ====================

    renderUiComponent(config) {
        return `
            <div class="prop-section-title">UI Component (KnockoutJS)</div>
            <div class="prop-section">
                <label class="prop-label">Component Name</label>
                <input type="text" class="prop-input" id="prop-component-name" value="${this.esc(config.componentName)}" placeholder="product-gallery">
            </div>
            <div class="prop-section">
                <label class="prop-label">Template Path</label>
                <input type="text" class="prop-input" id="prop-template-path" value="${this.esc(config.templatePath)}" placeholder="Vendor_Module/template-name">
            </div>
            <div class="prop-section">
                <label class="prop-label">Dependencies (RequireJS modules)</label>
                <div id="ui-deps-list" class="prop-list">
                    ${(config.dependencies || []).map((d, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(d)}" placeholder="uiComponent">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('dependencies', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addUiDep()">+ Add Dependency</button>
            </div>
            <div class="prop-section">
                <label class="prop-label">Observables</label>
                <div id="observables-list" class="prop-list">
                    ${(config.observables || []).map((o, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(o)}" placeholder="propertyName">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('observables', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addObservable()">+ Add Observable</button>
            </div>
        `;
    }

    renderJqueryWidget(config) {
        return `
            <div class="prop-section-title">jQuery Widget</div>
            <div class="prop-section">
                <label class="prop-label">Widget Namespace</label>
                <input type="text" class="prop-input" id="prop-widget-ns" value="${this.esc(config.widgetNamespace)}" placeholder="mage">
            </div>
            <div class="prop-section">
                <label class="prop-label">Widget Name</label>
                <input type="text" class="prop-input" id="prop-widget-name" value="${this.esc(config.widgetName)}" placeholder="customWidget">
            </div>
            <div class="prop-section">
                <label class="prop-label">Options</label>
                <div id="widget-options-list" class="prop-list">
                    ${(config.options || []).map((o, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(o.name || '')}" placeholder="optionName">
                            <input type="text" class="prop-input-sm" value="${this.esc(o.default || '')}" placeholder="default value">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('options', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addWidgetOption()">+ Add Option</button>
            </div>
            <div class="prop-section">
                <label class="prop-label">Events</label>
                <div id="widget-events-list" class="prop-list">
                    ${(config.events || []).map((e, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(e)}" placeholder="click .selector">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('events', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addWidgetEvent()">+ Add Event</button>
            </div>
        `;
    }

    renderJsMixin(config) {
        return `
            <div class="prop-section-title">JS Mixin</div>
            <div class="prop-section">
                <label class="prop-label">Target Module</label>
                <input type="text" class="prop-input" id="prop-target-module" value="${this.esc(config.targetModule)}" placeholder="Magento_Checkout/js/view/payment">
            </div>
            <div class="prop-section">
                <label class="prop-label">Type</label>
                <select class="prop-select" id="prop-mixin-type">
                    ${['object', 'function', 'component'].map(t => `<option value="${t}" ${config.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="prop-section">
                <label class="prop-label">Mixin Methods</label>
                <div id="mixin-methods-list" class="prop-list">
                    ${(config.mixinMethods || []).map((m, i) => `
                        <div class="prop-list-item" data-index="${i}">
                            <input type="text" class="prop-input-sm" value="${this.esc(m)}" placeholder="methodName">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('mixinMethods', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addMixinMethod()">+ Add Method</button>
            </div>
        `;
    }

    renderAdminGrid(config) {
        return `
            <div class="prop-section-title">Admin Grid (Listing)</div>
            <div class="prop-section">
                <label class="prop-label">Entity Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-entity-name" value="${this.esc(config.entityName)}" placeholder="BlogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Columns</label>
                <div id="grid-columns-list" class="prop-list">
                    ${(config.columns || []).map((c, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(c.name || '')}" placeholder="column_name">
                            <select class="prop-mini-select" style="width: 80px;">
                                ${['text', 'number', 'date', 'select', 'boolean', 'thumbnail', 'actions'].map(t => `<option value="${t}" ${c.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('columns', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 100%; margin-top: 4px;" value="${this.esc(c.label || '')}" placeholder="Column Label">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addGridColumn()">+ Add Column</button>
            </div>
        `;
    }

    renderAdminForm(config) {
        return `
            <div class="prop-section-title">Admin Form</div>
            <div class="prop-section">
                <label class="prop-label">Entity Name (PascalCase)</label>
                <input type="text" class="prop-input" id="prop-entity-name" value="${this.esc(config.entityName)}" placeholder="BlogPost">
            </div>
            <div class="prop-section">
                <label class="prop-label">Fieldsets</label>
                <div id="fieldsets-list" class="prop-list">
                    ${(config.fieldsets || []).map((fs, i) => `
                        <div class="prop-list-item" data-index="${i}" style="flex-wrap: wrap;">
                            <input type="text" class="prop-input-sm" style="flex: 2;" value="${this.esc(fs.name || '')}" placeholder="general">
                            <input type="text" class="prop-input-sm" style="flex: 3;" value="${this.esc(fs.label || '')}" placeholder="General Information">
                            <button class="prop-remove-btn" onclick="propertiesPanel.removeListItem('fieldsets', ${i})">×</button>
                            <input type="text" class="prop-input-sm" style="flex: 1 0 100%; margin-top: 4px;" value="${this.esc(fs.fields || '')}" placeholder="field1,field2,field3 (comma-separated)">
                        </div>
                    `).join('')}
                </div>
                <button class="prop-add-btn" onclick="propertiesPanel.addFieldset()">+ Add Fieldset</button>
            </div>
        `;
    }

    // ==================== Helpers ====================

    renderAclSuggestion() {
        const regBlock = this.findBlockDataByType('module-registration');
        if (regBlock?.config?.vendor && regBlock?.config?.moduleName) {
            const acl = SmartDefaults.suggestAclResource(regBlock.config.vendor, regBlock.config.moduleName, '');
            return `<p class="prop-suggestion" onclick="document.getElementById('prop-admin-resource').value='${acl}::manage'; propertiesPanel.saveCurrentBlock();">Suggestion: ${acl}::manage</p>`;
        }
        return '';
    }

    suggestTableName(entityName) {
        const regBlock = this.findBlockDataByType('module-registration');
        if (regBlock?.config?.vendor && regBlock?.config?.moduleName && entityName) {
            return SmartDefaults.suggestTableName(entityName, regBlock.config.vendor, regBlock.config.moduleName);
        }
        return '';
    }

    suggestRouteName() {
        const regBlock = this.findBlockDataByType('module-registration');
        if (regBlock?.config?.moduleName) {
            return SmartDefaults.suggestRouteFrontName(regBlock.config.moduleName);
        }
        return '';
    }

    findBlockDataByType(type) {
        for (const [id, data] of this.blockData) {
            if (data.type === type) return data;
        }
        return null;
    }

    /**
     * Called when a column name is blurred - auto-infer type
     */
    onColumnNameBlur(index, name) {
        if (!name) return;
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;

        const data = this.blockData.get(blockId);
        if (!data?.config?.columns?.[index]) return;

        const col = data.config.columns[index];
        if (col.name === name && col._typeSet) return;

        const inferred = SmartDefaults.inferColumnType(name);
        col.name = name;
        col.type = inferred.type;
        col.nullable = inferred.nullable ?? false;
        if (inferred.length) col.length = inferred.length;
        if (inferred.precision) col.precision = inferred.precision;
        if (inferred.scale) col.scale = inferred.scale;
        if (inferred.default !== undefined) col.default = inferred.default;
        if (inferred.unsigned) col.unsigned = inferred.unsigned;
        col._typeSet = true;

        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    // ==================== Save ====================

    attachSaveListeners() {
        document.querySelectorAll('#proplist input, #proplist select, #proplist textarea').forEach(el => {
            el.addEventListener('change', () => this.saveCurrentBlock());
            el.addEventListener('input', () => this.saveCurrentBlock());
        });
    }

    saveCurrentBlock() {
        if (!this.currentBlock) return;

        const blockId = this.currentBlock.querySelector('.blockid')?.value;
        const blockType = this.currentBlock.querySelector('.blockelemtype')?.value;
        if (!blockId) return;

        const data = this.blockData.get(blockId) || { config: {} };

        data.name = document.getElementById('prop-name')?.value || '';
        data.type = blockType;

        switch (blockType) {
            case 'module-registration':
                data.config.vendor = document.getElementById('prop-vendor')?.value || '';
                data.config.moduleName = document.getElementById('prop-module-name')?.value || '';
                data.config.version = document.getElementById('prop-version')?.value || '1.0.0';
                data.config.phpVersion = document.getElementById('prop-php-version')?.value || '>=8.1';
                data.config.description = document.getElementById('prop-mod-description')?.value || '';
                this.saveListItems(data, 'dependencies', '#deps-list');
                break;

            case 'db-schema':
                data.config.tableName = document.getElementById('prop-table-name')?.value || '';
                this.saveColumns(data);
                this.saveIndexes(data);
                break;

            case 'model-entity':
                data.config.entityName = document.getElementById('prop-entity-name')?.value || '';
                data.config.tableName = document.getElementById('prop-table-name')?.value || '';
                data.config.idField = document.getElementById('prop-id-field')?.value || 'entity_id';
                break;

            case 'repository':
                data.config.entityName = document.getElementById('prop-entity-name')?.value || '';
                data.config.methods = [];
                document.querySelectorAll('#proplist [data-method]').forEach(cb => {
                    if (cb.checked) data.config.methods.push(cb.dataset.method);
                });
                break;

            case 'data-patch':
                data.config.patchName = document.getElementById('prop-patch-name')?.value || '';
                data.config.description = document.getElementById('prop-patch-description')?.value || '';
                this.saveListItems(data, 'dependencies', '#patch-deps-list');
                break;

            case 'frontend-controller':
                data.config.routeFrontName = document.getElementById('prop-route-front')?.value || '';
                data.config.controllerDir = document.getElementById('prop-controller-dir')?.value || '';
                data.config.actionName = document.getElementById('prop-action-name')?.value || 'Index';
                data.config.httpMethod = document.getElementById('prop-http-method')?.value || 'GET';
                data.config.resultType = document.getElementById('prop-result-type')?.value || 'Page';
                break;

            case 'admin-controller':
                data.config.routeId = document.getElementById('prop-route-id')?.value || '';
                data.config.controllerDir = document.getElementById('prop-controller-dir')?.value || '';
                data.config.actionName = document.getElementById('prop-action-name')?.value || 'Index';
                data.config.adminResource = document.getElementById('prop-admin-resource')?.value || '';
                data.config.httpMethod = document.getElementById('prop-http-method')?.value || 'GET';
                break;

            case 'custom-router':
                data.config.routerName = document.getElementById('prop-router-name')?.value || '';
                data.config.sortOrder = parseInt(document.getElementById('prop-sort-order')?.value) || 60;
                data.config.matchPattern = document.getElementById('prop-match-pattern')?.value || '';
                break;

            case 'plugin':
                data.config.targetClass = document.getElementById('prop-target-class')?.value || '';
                data.config.targetMethod = document.getElementById('prop-target-method')?.value || '';
                data.config.pluginType = document.getElementById('prop-plugin-type')?.value || 'after';
                data.config.sortOrder = parseInt(document.getElementById('prop-sort-order')?.value) || 10;
                break;

            case 'observer': {
                const eventSelect = document.getElementById('prop-event-name')?.value;
                const eventCustom = document.getElementById('prop-event-custom')?.value;
                data.config.eventName = eventCustom || eventSelect || '';
                data.config.observerName = document.getElementById('prop-observer-name')?.value || '';
                data.config.scope = document.getElementById('prop-scope')?.value || 'global';
                break;
            }

            case 'cron-job':
                data.config.jobName = document.getElementById('prop-job-name')?.value || '';
                data.config.schedule = document.getElementById('prop-schedule')?.value || '0 * * * *';
                data.config.group = document.getElementById('prop-group')?.value || 'default';
                break;

            case 'cli-command':
                data.config.commandName = document.getElementById('prop-command-name')?.value || '';
                data.config.description = document.getElementById('prop-cmd-description')?.value || '';
                this.saveArguments(data);
                this.saveOptions(data);
                break;

            case 'viewmodel':
                data.config.viewModelName = document.getElementById('prop-vm-name')?.value || '';
                data.config.templateName = document.getElementById('prop-template-name')?.value || '';
                this.saveListItems(data, 'methods', '#vm-methods-list');
                break;

            case 'system-config':
                data.config.tab = document.getElementById('prop-tab')?.value || '';
                data.config.section = document.getElementById('prop-section')?.value || '';
                this.saveGroups(data);
                break;

            case 'acl-resource':
                this.saveAclResources(data);
                break;

            case 'admin-menu':
                this.saveMenuItems(data);
                break;

            case 'rest-api':
                this.saveRestRoutes(data);
                break;

            case 'graphql':
                data.config.typeName = document.getElementById('prop-type-name')?.value || '';
                data.config.queryName = document.getElementById('prop-query-name')?.value || '';
                data.config.resolverClass = document.getElementById('prop-resolver-class')?.value || '';
                this.saveGqlFields(data);
                break;

            case 'message-queue':
                data.config.topicName = document.getElementById('prop-topic-name')?.value || '';
                data.config.consumerClass = document.getElementById('prop-consumer-class')?.value || '';
                data.config.connection = document.getElementById('prop-connection')?.value || 'amqp';
                data.config.maxMessages = parseInt(document.getElementById('prop-max-messages')?.value) || 5000;
                break;

            case 'ui-component':
                data.config.componentName = document.getElementById('prop-component-name')?.value || '';
                data.config.templatePath = document.getElementById('prop-template-path')?.value || '';
                this.saveListItems(data, 'dependencies', '#ui-deps-list');
                this.saveListItems(data, 'observables', '#observables-list');
                break;

            case 'jquery-widget':
                data.config.widgetNamespace = document.getElementById('prop-widget-ns')?.value || '';
                data.config.widgetName = document.getElementById('prop-widget-name')?.value || '';
                this.saveWidgetOptions(data);
                this.saveListItems(data, 'events', '#widget-events-list');
                break;

            case 'js-mixin':
                data.config.targetModule = document.getElementById('prop-target-module')?.value || '';
                data.config.type = document.getElementById('prop-mixin-type')?.value || 'object';
                this.saveListItems(data, 'mixinMethods', '#mixin-methods-list');
                break;

            case 'admin-grid':
                data.config.entityName = document.getElementById('prop-entity-name')?.value || '';
                this.saveGridColumns(data);
                break;

            case 'admin-form':
                data.config.entityName = document.getElementById('prop-entity-name')?.value || '';
                this.saveFieldsets(data);
                break;
        }

        this.blockData.set(blockId, data);

        const nameEl = this.currentBlock.querySelector('.blocky-name');
        if (nameEl && data.name) {
            nameEl.textContent = data.name;
        }

        if (typeof moduleValidator !== 'undefined') {
            moduleValidator.validate();
        }
    }

    // ==================== List save helpers ====================

    saveListItems(data, key, containerSelector) {
        const items = document.querySelectorAll(`${containerSelector} .prop-list-item`);
        data.config[key] = [];
        items.forEach(item => {
            const input = item.querySelector('.prop-input-sm');
            if (input?.value) {
                data.config[key].push(input.value);
            }
        });
    }

    saveColumns(data) {
        const items = document.querySelectorAll('#columns-list .prop-list-item');
        data.config.columns = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            const select = item.querySelector('[data-col-type]');
            const checkbox = item.querySelector('input[type="checkbox"]');
            const name = inputs[0]?.value || '';
            if (name) {
                const col = {
                    name,
                    type: select?.value || 'varchar',
                    nullable: checkbox?.checked || false
                };
                if (col.type === 'varchar' && inputs[1]) col.length = inputs[1].value || '255';
                if (col.type === 'decimal' && inputs[1]) {
                    const parts = (inputs[1].value || '12,4').split(',');
                    col.precision = parts[0] || '12';
                    col.scale = parts[1] || '4';
                }
                data.config.columns.push(col);
            }
        });
    }

    saveIndexes(data) {
        const items = document.querySelectorAll('#indexes-list .prop-list-item');
        data.config.indexes = [];
        items.forEach(item => {
            const input = item.querySelector('.prop-input-sm');
            const select = item.querySelector('.prop-mini-select');
            if (input?.value) {
                data.config.indexes.push({ columns: input.value, type: select?.value || 'index' });
            }
        });
    }

    saveArguments(data) {
        const items = document.querySelectorAll('#args-list .prop-list-item');
        data.config.arguments = [];
        items.forEach(item => {
            const input = item.querySelector('.prop-input-sm');
            const select = item.querySelector('.prop-mini-select');
            if (input?.value) {
                data.config.arguments.push({ name: input.value, mode: select?.value || 'required' });
            }
        });
    }

    saveOptions(data) {
        const items = document.querySelectorAll('#options-list .prop-list-item');
        data.config.options = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            if (inputs[0]?.value) {
                data.config.options.push({ name: inputs[0].value, shortcut: inputs[1]?.value || '' });
            }
        });
    }

    saveGroups(data) {
        const items = document.querySelectorAll('#groups-list .prop-list-item');
        data.config.groups = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            if (inputs[0]?.value) {
                data.config.groups.push({ id: inputs[0].value, label: inputs[1]?.value || '', fields: inputs[2]?.value || '' });
            }
        });
    }

    saveAclResources(data) {
        const items = document.querySelectorAll('#acl-list .prop-list-item');
        data.config.resources = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            const sortInput = item.querySelector('input[type="number"]');
            if (inputs[0]?.value) {
                data.config.resources.push({
                    id: inputs[0].value,
                    title: inputs[1]?.value || '',
                    parent: inputs[2]?.value || '',
                    sortOrder: parseInt(sortInput?.value) || 10
                });
            }
        });
    }

    saveMenuItems(data) {
        const items = document.querySelectorAll('#menu-list .prop-list-item');
        data.config.menuItems = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            const sortInput = item.querySelector('input[type="number"]');
            if (inputs[0]?.value) {
                data.config.menuItems.push({
                    id: inputs[0].value,
                    title: inputs[1]?.value || '',
                    action: inputs[2]?.value || '',
                    resource: inputs[3]?.value || '',
                    parent: inputs[4]?.value || '',
                    sortOrder: parseInt(sortInput?.value) || 10
                });
            }
        });
    }

    saveRestRoutes(data) {
        const items = document.querySelectorAll('#routes-list .prop-list-item');
        data.config.routes = [];
        items.forEach(item => {
            const select = item.querySelector('.prop-mini-select');
            const inputs = item.querySelectorAll('.prop-input-sm');
            if (inputs[0]?.value) {
                data.config.routes.push({
                    method: select?.value || 'GET',
                    url: inputs[0].value,
                    serviceClass: inputs[1]?.value || '',
                    serviceMethod: inputs[2]?.value || '',
                    aclResource: inputs[3]?.value || ''
                });
            }
        });
    }

    saveGqlFields(data) {
        const items = document.querySelectorAll('#gql-fields-list .prop-list-item');
        data.config.fields = [];
        items.forEach(item => {
            const input = item.querySelector('.prop-input-sm');
            const select = item.querySelector('.prop-mini-select');
            if (input?.value) {
                data.config.fields.push({ name: input.value, type: select?.value || 'String' });
            }
        });
    }

    saveWidgetOptions(data) {
        const items = document.querySelectorAll('#widget-options-list .prop-list-item');
        data.config.options = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            if (inputs[0]?.value) {
                data.config.options.push({ name: inputs[0].value, default: inputs[1]?.value || '' });
            }
        });
    }

    saveGridColumns(data) {
        const items = document.querySelectorAll('#grid-columns-list .prop-list-item');
        data.config.columns = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            const select = item.querySelector('.prop-mini-select');
            if (inputs[0]?.value) {
                data.config.columns.push({
                    name: inputs[0].value,
                    type: select?.value || 'text',
                    label: inputs[1]?.value || ''
                });
            }
        });
    }

    saveFieldsets(data) {
        const items = document.querySelectorAll('#fieldsets-list .prop-list-item');
        data.config.fieldsets = [];
        items.forEach(item => {
            const inputs = item.querySelectorAll('.prop-input-sm');
            if (inputs[0]?.value) {
                data.config.fieldsets.push({
                    name: inputs[0].value,
                    label: inputs[1]?.value || '',
                    fields: inputs[2]?.value || ''
                });
            }
        });
    }

    // ==================== Add list item methods ====================

    addDependency() { this._addToList('dependencies', 'Magento_Backend'); }
    addPatchDep() { this._addToList('dependencies', ''); }
    addUiDep() { this._addToList('dependencies', ''); }
    addObservable() { this._addToList('observables', ''); }
    addVmMethod() { this._addToList('methods', ''); }
    addMixinMethod() { this._addToList('mixinMethods', ''); }

    addColumn() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.columns = data.config.columns || [];
        data.config.columns.push({ name: '', type: 'varchar', length: '255', nullable: true });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addIndex() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.indexes = data.config.indexes || [];
        data.config.indexes.push({ columns: '', type: 'index' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addArgument() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.arguments = data.config.arguments || [];
        data.config.arguments.push({ name: '', mode: 'required' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addOption() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.options = data.config.options || [];
        data.config.options.push({ name: '', shortcut: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addConfigGroup() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.groups = data.config.groups || [];
        data.config.groups.push({ id: '', label: '', fields: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addAclResource() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.resources = data.config.resources || [];
        data.config.resources.push({ id: '', title: '', parent: '', sortOrder: 10 });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addMenuItem() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.menuItems = data.config.menuItems || [];
        data.config.menuItems.push({ id: '', title: '', action: '', resource: '', parent: '', sortOrder: 10 });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addRestRoute() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.routes = data.config.routes || [];
        data.config.routes.push({ method: 'GET', url: '', serviceClass: '', serviceMethod: '', aclResource: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addGqlField() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.fields = data.config.fields || [];
        data.config.fields.push({ name: '', type: 'String' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addWidgetOption() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.options = data.config.options || [];
        data.config.options.push({ name: '', default: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addWidgetEvent() { this._addToList('events', ''); }

    addGridColumn() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.columns = data.config.columns || [];
        data.config.columns.push({ name: '', type: 'text', label: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    addFieldset() {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config.fieldsets = data.config.fieldsets || [];
        data.config.fieldsets.push({ name: '', label: '', fields: '' });
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    _addToList(key, defaultValue) {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data) return;
        data.config[key] = data.config[key] || [];
        data.config[key].push(defaultValue);
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    removeListItem(listName, index) {
        const blockId = this.currentBlock?.querySelector('.blockid')?.value;
        if (!blockId) return;
        const data = this.blockData.get(blockId);
        if (!data || !data.config[listName]) return;
        data.config[listName].splice(index, 1);
        this.blockData.set(blockId, data);
        this.renderProperties(data.type, data);
    }

    deleteCurrentBlock() {
        if (!this.currentBlock) return;
        const blockId = this.currentBlock.querySelector('.blockid')?.value;
        if (blockId) {
            this.blockData.delete(blockId);
        }
        flowy.deleteBlocks();
        this.hide();
    }

    getBlockData(blockId) {
        return this.blockData.get(blockId);
    }

    getAllBlockData() {
        return Object.fromEntries(this.blockData);
    }

    esc(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

let propertiesPanel;
