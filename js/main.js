/**
 * Magento Module Builder - Main Application
 * Visual M2 module design tool with validation and AI-ready export
 */

document.addEventListener('DOMContentLoaded', function() {
    // State
    let currentCategory = 'foundation';
    let rightPanelOpen = false;
    let selectedBlock = null;

    // Initialize the block list with foundation category
    populateBlockListUI('foundation');

    // Initialize Flowy
    flowy(
        document.getElementById('canvas'),
        onBlockGrab,
        onBlockRelease,
        onBlockSnap,
        onBlockRearrange,
        100,  // spacing_x
        80    // spacing_y
    );

    // Initialize properties panel
    propertiesPanel = new PropertiesPanel();

    // Initialize validator
    moduleValidator = new ModuleValidator(propertiesPanel);

    // Initialize exporter
    magentoExporter = new MagentoExporter(propertiesPanel);

    // ========== Block List Navigation ==========
    function populateBlockListUI(categoryKey) {
        const blockList = document.getElementById('blocklist');
        if (blockList) {
            blockList.innerHTML = populateBlockList(categoryKey);
        }
    }

    // Category tab click handlers
    document.querySelectorAll('.side-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.side-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            populateBlockListUI(currentCategory);
        });
    });

    // ========== Flowy Callbacks ==========
    function onBlockGrab(block) {
        block.classList.add('blockdisabled');
    }

    function onBlockRelease() {
        document.querySelectorAll('.blockdisabled').forEach(el => {
            el.classList.remove('blockdisabled');
        });
    }

    function onBlockSnap(drag, first, parent) {
        // Remove sidebar styling
        const grabme = drag.querySelector('.grabme');
        if (grabme) grabme.remove();

        const blockin = drag.querySelector('.blockin');
        if (blockin) blockin.remove();

        // Get block type
        const blockType = drag.querySelector('.blockelemtype')?.value;
        const blockId = drag.querySelector('.blockid')?.value;

        if (blockType) {
            drag.innerHTML += generateCanvasBlockHTML(blockType, blockId);
        }

        // Run validation after snap
        setTimeout(() => moduleValidator.validate(), 100);

        return true;
    }

    function onBlockRearrange(drag, parent) {
        return true;
    }

    // ========== Canvas Block Click Handler ==========
    let noClick = false;

    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.create-flowy')) {
            noClick = true;
        } else {
            noClick = false;
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (e.buttons === 1) {
            noClick = true;
        }
    });

    document.addEventListener('mouseup', function(e) {
        if (noClick) return;

        const block = e.target.closest('.block');
        if (block && !block.classList.contains('dragging')) {
            if (rightPanelOpen && selectedBlock === block) {
                // Already open for this block
            } else {
                rightPanelOpen = true;
                selectedBlock = block;
                propertiesPanel.show(block);
            }
        }
    });

    // ========== Properties Panel Close ==========
    document.getElementById('close-properties')?.addEventListener('click', function() {
        rightPanelOpen = false;
        selectedBlock = null;
        propertiesPanel.hide();
    });

    // ========== Delete Block ==========
    document.getElementById('delete-block')?.addEventListener('click', function() {
        flowy.deleteBlocks();
        rightPanelOpen = false;
        selectedBlock = null;
        propertiesPanel.hide();
        // Run validation after delete
        setTimeout(() => moduleValidator.validate(), 100);
    });

    // ========== Project Name Editing ==========
    const projectTitle = document.getElementById('project-title');
    if (projectTitle) {
        projectTitle.addEventListener('blur', function() {
            magentoExporter.setProjectMeta(this.textContent.trim(), magentoExporter.projectDescription);
        });
        projectTitle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }

    // ========== Export Actions ==========
    document.getElementById('export-json')?.addEventListener('click', function() {
        magentoExporter.downloadJson();
        showNotification('Module design exported as JSON');
    });

    document.getElementById('copy-json')?.addEventListener('click', async function() {
        const success = await magentoExporter.copyToClipboard();
        showNotification(success ? 'Copied to clipboard!' : 'Failed to copy');
    });

    document.getElementById('preview-export')?.addEventListener('click', function() {
        const data = magentoExporter.export();
        showExportPreview(data);
    });

    // ========== Validation Badge ==========
    document.getElementById('validation-badge')?.addEventListener('click', function() {
        document.getElementById('validation-modal')?.classList.add('active');
    });

    document.getElementById('close-validation')?.addEventListener('click', function() {
        document.getElementById('validation-modal')?.classList.remove('active');
    });

    document.getElementById('validation-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    // ========== Clear Canvas ==========
    document.getElementById('clear-canvas')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            flowy.deleteBlocks();
            propertiesPanel.blockData.clear();
            rightPanelOpen = false;
            selectedBlock = null;
            propertiesPanel.hide();
            moduleValidator.validate();
            showNotification('Canvas cleared');
        }
    });

    // ========== Export Preview Modal ==========
    function showExportPreview(data) {
        const modal = document.getElementById('export-modal');
        const content = document.getElementById('export-content');

        if (modal && content) {
            content.textContent = JSON.stringify(data, null, 2);
            modal.classList.add('active');
        }
    }

    document.getElementById('close-modal')?.addEventListener('click', function() {
        document.getElementById('export-modal')?.classList.remove('active');
    });

    document.getElementById('export-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    // ========== Notifications ==========
    function showNotification(message) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // ========== Search Blocks ==========
    const searchInput = document.getElementById('search-blocks');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();

            if (query.length > 0) {
                // Search across all categories
                const blockList = document.getElementById('blocklist');
                let html = '';
                for (const [catKey, catData] of Object.entries(BlockCategories)) {
                    for (const block of catData.blocks) {
                        if (block.title.toLowerCase().includes(query) || block.description.toLowerCase().includes(query)) {
                            html += generateBlockHTML(block, catKey);
                        }
                    }
                }
                if (blockList) blockList.innerHTML = html || '<p class="prop-hint" style="padding: 16px; text-align: center;">No matching components</p>';
            } else {
                populateBlockListUI(currentCategory);
            }
        });
    }

    // ========== Keyboard Shortcuts ==========
    document.addEventListener('keydown', function(e) {
        // Escape to close panels
        if (e.key === 'Escape') {
            if (document.getElementById('export-modal')?.classList.contains('active')) {
                document.getElementById('export-modal').classList.remove('active');
            } else if (document.getElementById('validation-modal')?.classList.contains('active')) {
                document.getElementById('validation-modal').classList.remove('active');
            } else if (rightPanelOpen) {
                propertiesPanel.hide();
                rightPanelOpen = false;
                selectedBlock = null;
            }
        }

        // Ctrl/Cmd + E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            magentoExporter.downloadJson();
            showNotification('Module design exported as JSON');
        }

        // Ctrl/Cmd + Shift + C to copy
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            magentoExporter.copyToClipboard().then(success => {
                showNotification(success ? 'Copied to clipboard!' : 'Failed to copy');
            });
        }
    });

    // ========== Sidebar Toggle ==========
    const reopenBtn = document.getElementById('reopen-sidebar');

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('collapsed');
        document.getElementById('toggle-sidebar')?.classList.toggle('collapsed');
        reopenBtn?.classList.toggle('visible', sidebar?.classList.contains('collapsed'));
    }

    document.getElementById('toggle-sidebar')?.addEventListener('click', toggleSidebar);
    reopenBtn?.addEventListener('click', toggleSidebar);

    // ========== Initialize Project ==========
    magentoExporter.setProjectMeta('My Magento Module', 'A new Magento 2 module');
});
