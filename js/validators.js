/**
 * Module Validator - Validates Magento 2 module design for completeness
 */

class ModuleValidator {
    constructor(propertiesPanel) {
        this.propertiesPanel = propertiesPanel;
        this.warnings = [];
    }

    /**
     * Run all validation rules and update UI
     */
    validate() {
        this.warnings = [];
        const blockDataMap = this.propertiesPanel.getAllBlockData();
        const blocks = Object.entries(blockDataMap);

        // Collect block types present
        const types = new Set();
        const typeData = {};
        for (const [id, data] of blocks) {
            types.add(data.type);
            if (!typeData[data.type]) typeData[data.type] = [];
            typeData[data.type].push({ id, data });
        }

        this.validateModuleRegistration(types, typeData);
        this.validateDataLayer(types, typeData);
        this.validateControllers(types, typeData);
        this.validateRequiredFields(blocks);

        this.updateUI();
        return this.warnings;
    }

    /**
     * Rule: Exactly one Module Registration block required
     */
    validateModuleRegistration(types, typeData) {
        if (!types.has('module-registration')) {
            this.warnings.push({
                severity: 'error',
                message: 'Missing <strong>Module Registration</strong> block. Every module needs one.',
                blockType: 'module-registration'
            });
        } else {
            const regBlocks = typeData['module-registration'] || [];
            if (regBlocks.length > 1) {
                this.warnings.push({
                    severity: 'warning',
                    message: 'Multiple Module Registration blocks found. A module should have exactly one.',
                    blockType: 'module-registration'
                });
            }
            // Check vendor/module filled in
            for (const { data } of regBlocks) {
                if (!data.config?.vendor) {
                    this.warnings.push({
                        severity: 'error',
                        message: 'Module Registration: <strong>Vendor</strong> name is required.',
                        blockType: 'module-registration'
                    });
                }
                if (!data.config?.moduleName) {
                    this.warnings.push({
                        severity: 'error',
                        message: 'Module Registration: <strong>Module Name</strong> is required.',
                        blockType: 'module-registration'
                    });
                }
            }
        }
    }

    /**
     * Rule: Model should have Database Schema, Repository should have Model
     */
    validateDataLayer(types, typeData) {
        if (types.has('model-entity') && !types.has('db-schema')) {
            this.warnings.push({
                severity: 'warning',
                message: '<strong>Model/Entity</strong> block found without a <strong>Database Schema</strong>. Models typically need a table definition.',
                blockType: 'model-entity'
            });
        }

        if (types.has('repository') && !types.has('model-entity')) {
            this.warnings.push({
                severity: 'warning',
                message: '<strong>Repository</strong> block found without a <strong>Model/Entity</strong>. Repositories need a model to manage.',
                blockType: 'repository'
            });
        }

        // Admin controller should have ACL
        if (types.has('admin-controller') && !types.has('acl-resource')) {
            const hasSystemConfig = types.has('system-config'); // system-config includes acl.xml
            if (!hasSystemConfig) {
                this.warnings.push({
                    severity: 'warning',
                    message: '<strong>Admin Controller</strong> found without an <strong>ACL Resource</strong>. Admin controllers require access control.',
                    blockType: 'admin-controller'
                });
            }
        }

        // Admin grid/form should have model
        if ((types.has('admin-grid') || types.has('admin-form')) && !types.has('model-entity')) {
            this.warnings.push({
                severity: 'warning',
                message: '<strong>Admin Grid/Form</strong> found without a <strong>Model/Entity</strong>. Admin UI typically needs an entity.',
                blockType: 'admin-grid'
            });
        }

        // REST API should have repository
        if (types.has('rest-api') && !types.has('repository')) {
            this.warnings.push({
                severity: 'info',
                message: '<strong>REST API</strong> typically maps to a <strong>Repository</strong> service contract.',
                blockType: 'rest-api'
            });
        }
    }

    /**
     * Rule: Check admin controllers have adminResource configured
     */
    validateControllers(types, typeData) {
        const adminControllers = typeData['admin-controller'] || [];
        for (const { data } of adminControllers) {
            if (!data.config?.adminResource) {
                this.warnings.push({
                    severity: 'warning',
                    message: 'Admin Controller <strong>' + (data.name || 'Untitled') + '</strong>: Missing ACL resource. Set the Admin Resource field.',
                    blockType: 'admin-controller'
                });
            }
        }
    }

    /**
     * Rule: Check required fields per block type
     */
    validateRequiredFields(blocks) {
        for (const [id, data] of blocks) {
            switch (data.type) {
                case 'db-schema':
                    if (!data.config?.tableName) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Database Schema <strong>${data.name || 'Untitled'}</strong>: Missing table name.`,
                            blockType: 'db-schema'
                        });
                    }
                    if (!data.config?.columns?.length) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Database Schema <strong>${data.name || 'Untitled'}</strong>: No columns defined.`,
                            blockType: 'db-schema'
                        });
                    }
                    break;

                case 'model-entity':
                    if (!data.config?.entityName) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Model/Entity <strong>${data.name || 'Untitled'}</strong>: Missing entity name.`,
                            blockType: 'model-entity'
                        });
                    }
                    break;

                case 'repository':
                    if (!data.config?.entityName) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Repository <strong>${data.name || 'Untitled'}</strong>: Missing entity name.`,
                            blockType: 'repository'
                        });
                    }
                    break;

                case 'frontend-controller':
                    if (!data.config?.routeFrontName) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Frontend Controller <strong>${data.name || 'Untitled'}</strong>: Missing route front name.`,
                            blockType: 'frontend-controller'
                        });
                    }
                    break;

                case 'plugin':
                    if (!data.config?.targetClass) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Plugin <strong>${data.name || 'Untitled'}</strong>: Missing target class.`,
                            blockType: 'plugin'
                        });
                    }
                    break;

                case 'observer':
                    if (!data.config?.eventName) {
                        this.warnings.push({
                            severity: 'warning',
                            message: `Observer <strong>${data.name || 'Untitled'}</strong>: Missing event name.`,
                            blockType: 'observer'
                        });
                    }
                    break;
            }
        }
    }

    /**
     * Update the validation badge and block warning borders
     */
    updateUI() {
        const badge = document.getElementById('validation-badge');
        const countEl = document.getElementById('validation-count');

        if (this.warnings.length > 0) {
            badge?.classList.remove('hidden');
            if (countEl) countEl.textContent = this.warnings.length;
        } else {
            badge?.classList.add('hidden');
        }

        // Remove all warning borders
        document.querySelectorAll('.block.has-warning').forEach(el => {
            el.classList.remove('has-warning');
        });

        // Add warning borders to blocks with issues
        const warningTypes = new Set(this.warnings.map(w => w.blockType));
        document.querySelectorAll('.block').forEach(block => {
            const type = block.querySelector('.blockelemtype')?.value;
            if (type && warningTypes.has(type)) {
                block.classList.add('has-warning');
            }
        });

        // Update validation list modal content
        const listEl = document.getElementById('validation-list');
        if (listEl) {
            if (this.warnings.length === 0) {
                listEl.innerHTML = '<p class="prop-hint" style="text-align: center; padding: 20px;">No warnings. Your module design looks good!</p>';
            } else {
                listEl.innerHTML = this.warnings.map(w => `
                    <div class="validation-item">
                        <span class="v-icon">${w.severity === 'error' ? '!' : w.severity === 'info' ? 'i' : '!'}</span>
                        <span class="v-text">${w.message}</span>
                    </div>
                `).join('');
            }
        }
    }
}

let moduleValidator;
