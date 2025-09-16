class BookmarkDashboard {
    constructor() {
        this.bookmarks = this.loadBookmarks();
        this.categories = this.loadCategories();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderBookmarks();
        this.updateEmptyState();
        this.initTabs();
        this.renderCategories();
        this.updateCategorySelect();
        this.updateFilterButtons();
    }

    bindEvents() {
        // Add bookmark button
        document.getElementById('addBookmarkBtn').addEventListener('click', () => {
            this.addBookmark();
        });

        // Enter key in input fields
        document.getElementById('bookmarkName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBookmark();
        });
        document.getElementById('bookmarkUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBookmark();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportBookmarks();
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        // Import file change
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Import confirm button
        document.getElementById('importConfirmBtn').addEventListener('click', () => {
            this.importBookmarks();
        });

        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });

        document.getElementById('categoryName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCategory();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchBookmarks(e.target.value);
        });

        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            this.clearSearch();
        });
    }

    addBookmark() {
        // Check if we're in edit mode
        if (this.editingBookmarkId) {
            this.showMessage('Please finish editing first or cancel it!', 'error');
            return;
        }

        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const category = document.getElementById('bookmarkCategory').value;

        if (!name || !url) {
            this.showMessage('Please fill in all fields!', 'error');
            return;
        }

        // URL validation
        try {
            new URL(url);
        } catch {
            this.showMessage('Please enter a valid URL!', 'error');
            return;
        }

        const bookmark = {
            id: Date.now().toString(),
            name: name,
            url: url,
            category: category,
            createdAt: new Date().toISOString()
        };

        this.bookmarks.unshift(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
        this.updateEmptyState();
        this.clearForm();
        this.showMessage('Bookmark added successfully!', 'success');
    }

    deleteBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;

        this.showConfirmModal(
            'Delete Bookmark',
            `Do you really want to delete the bookmark "${bookmark.name}"?`,
            () => {
                this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
                this.saveBookmarks();
                this.renderBookmarks();
                this.updateEmptyState();
                this.showMessage('Bookmark deleted!', 'success');
            },
            'delete'
        );
    }

    openBookmark(url) {
        window.open(url, '_blank');
    }

    editBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;

        // Store the editing ID globally
        this.editingBookmarkId = id;

        // Fill form with existing data
        document.getElementById('bookmarkName').value = bookmark.name;
        document.getElementById('bookmarkUrl').value = bookmark.url;
        document.getElementById('bookmarkCategory').value = bookmark.category;

        // Change button text and behavior
        const addBtn = document.getElementById('addBookmarkBtn');
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        
        // Remove all existing event listeners
        const newBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newBtn, addBtn);
        
        // Add new event listener
        document.getElementById('addBookmarkBtn').addEventListener('click', () => {
            this.saveBookmarkEdit(id);
        });

        // Scroll to form
        document.querySelector('.add-bookmark-section').scrollIntoView({ behavior: 'smooth' });

        // Show cancel button
        this.showCancelButton(originalText);
    }

    saveBookmarkEdit(id) {
        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const category = document.getElementById('bookmarkCategory').value;

        if (!name || !url) {
            this.showMessage('Please fill in all fields!', 'error');
            return;
        }

        // URL validation
        try {
            new URL(url);
        } catch {
            this.showMessage('Please enter a valid URL!', 'error');
            return;
        }

        // Find and update existing bookmark
        const bookmarkIndex = this.bookmarks.findIndex(b => b.id === id);
        if (bookmarkIndex !== -1) {
            // Update existing bookmark
            this.bookmarks[bookmarkIndex].name = name;
            this.bookmarks[bookmarkIndex].url = url;
            this.bookmarks[bookmarkIndex].category = category;
            this.bookmarks[bookmarkIndex].updatedAt = new Date().toISOString();

            this.saveBookmarks();
            this.renderBookmarks();
            this.updateEmptyState();
            this.clearForm();
            this.resetAddButton();
            this.hideCancelButton();
            this.showMessage('Bookmark updated successfully!', 'success');
        } else {
            this.showMessage('Bookmark not found!', 'error');
        }
    }

    showCancelButton(originalText) {
        // Remove existing cancel button if any
        const existingCancel = document.querySelector('.cancel-edit-btn');
        if (existingCancel) existingCancel.remove();

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-btn cancel-edit-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        cancelBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        cancelBtn.style.marginLeft = '10px';
        cancelBtn.onclick = () => {
            this.clearForm();
            this.resetAddButton();
            this.hideCancelButton();
        };

        document.querySelector('.add-form').appendChild(cancelBtn);
    }

    hideCancelButton() {
        const cancelBtn = document.querySelector('.cancel-edit-btn');
        if (cancelBtn) cancelBtn.remove();
    }

    resetAddButton() {
        const addBtn = document.getElementById('addBookmarkBtn');
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        
        // Remove all existing event listeners
        const newBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newBtn, addBtn);
        
        // Add new event listener
        document.getElementById('addBookmarkBtn').addEventListener('click', () => {
            this.addBookmark();
        });
        
        // Clear editing state
        this.editingBookmarkId = null;
    }

    setFilter(category) {
        this.currentFilter = category;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeFilterBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeFilterBtn) {
            activeFilterBtn.classList.add('active');
        }

        this.renderBookmarks();
    }

    searchBookmarks(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        // Show/hide clear button
        const clearBtn = document.getElementById('clearSearchBtn');
        if (this.searchQuery) {
            clearBtn.style.display = 'inline-flex';
        } else {
            clearBtn.style.display = 'none';
        }

        this.renderBookmarks();
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.searchQuery = '';
        document.getElementById('clearSearchBtn').style.display = 'none';
        this.renderBookmarks();
    }

    renderBookmarks() {
        const grid = document.getElementById('bookmarksGrid');
        let filteredBookmarks = this.currentFilter === 'all' 
            ? this.bookmarks 
            : this.bookmarks.filter(bookmark => bookmark.category === this.currentFilter);

        // Apply search filter if there's a search query
        if (this.searchQuery) {
            filteredBookmarks = filteredBookmarks.filter(bookmark => 
                bookmark.name.toLowerCase().includes(this.searchQuery) ||
                bookmark.url.toLowerCase().includes(this.searchQuery) ||
                bookmark.category.toLowerCase().includes(this.searchQuery)
            );
        }

        if (filteredBookmarks.length === 0) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = filteredBookmarks.map(bookmark => {
            const category = this.categories.find(cat => cat.id === bookmark.category);
            const categoryColor = category ? category.color : '#8b5cf6';
            const categoryName = category ? category.name : bookmark.category;
            
            return `
                <div class="bookmark-card" data-id="${bookmark.id}">
                    <div class="bookmark-header">
                        <div>
                            <div class="bookmark-title">${this.escapeHtml(bookmark.name)}</div>
                            <div class="bookmark-category" style="background-color: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}40;">
                                <i class="fas fa-tag" style="color: ${categoryColor};"></i>
                                ${this.escapeHtml(categoryName)}
                            </div>
                        </div>
                        <div class="bookmark-header-actions">
                            <button class="bookmark-edit-btn" onclick="dashboard.editBookmark('${bookmark.id}')" title="Edit bookmark">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="bookmark-delete-btn" onclick="dashboard.deleteBookmark('${bookmark.id}')" title="Delete bookmark">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="bookmark-url">${this.escapeHtml(bookmark.url)}</div>
                    <div class="bookmark-actions">
                        <button class="bookmark-btn" onclick="dashboard.openBookmark('${this.escapeHtml(bookmark.url)}')">
                            <i class="fas fa-external-link-alt"></i> Open
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyState');
        let filteredBookmarks = this.currentFilter === 'all' 
            ? this.bookmarks 
            : this.bookmarks.filter(bookmark => bookmark.category === this.currentFilter);

        // Apply search filter if there's a search query
        if (this.searchQuery) {
            filteredBookmarks = filteredBookmarks.filter(bookmark => 
                bookmark.name.toLowerCase().includes(this.searchQuery) ||
                bookmark.url.toLowerCase().includes(this.searchQuery) ||
                bookmark.category.toLowerCase().includes(this.searchQuery)
            );
        }

        emptyState.style.display = filteredBookmarks.length > 0 ? 'none' : 'block';
    }

    clearForm() {
        document.getElementById('bookmarkName').value = '';
        document.getElementById('bookmarkUrl').value = '';
        document.getElementById('bookmarkCategory').value = 'general';
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `success-message ${type}`;
        messageDiv.textContent = message;
        
        if (type === 'error') {
            messageDiv.style.background = '#e74c3c';
        }

        document.body.appendChild(messageDiv);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadBookmarks() {
        try {
            const saved = localStorage.getItem('bookmarkDashboard');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            return [];
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem('bookmarkDashboard', JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
            this.showMessage('Error saving!', 'error');
        }
    }

    // Tab functionality
    initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeTabContent = document.getElementById(`${tabName}-tab`);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }
    }

    // Export/Import functionality
    exportBookmarks() {
        if (this.bookmarks.length === 0 && this.categories.length === 0) {
            this.showMessage('No data available for export!', 'error');
            return;
        }

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            bookmarks: this.bookmarks,
            categories: this.categories,
            settings: {
                currentFilter: this.currentFilter
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('Complete dashboard backup exported successfully!', 'success');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('importConfirmBtn').style.display = 'inline-flex';
            this.selectedFile = file;
        }
    }

    importBookmarks() {
        if (!this.selectedFile) {
            this.showMessage('Please select a file first!', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Check if it's a new format (complete backup) or old format (just bookmarks)
                if (importedData.version && importedData.bookmarks && importedData.categories) {
                    // New format - complete backup
                    this.importCompleteBackup(importedData);
                } else if (Array.isArray(importedData)) {
                    // Old format - just bookmarks array
                    this.importLegacyBookmarks(importedData);
                } else {
                    this.showMessage('Invalid file! Please select a valid backup file.', 'error');
                }
            } catch (error) {
                this.showMessage('Error importing! Please check the file.', 'error');
            }
        };
        reader.readAsText(this.selectedFile);
    }

    importCompleteBackup(importedData) {
        const originalBookmarkCount = this.bookmarks.length;
        const originalCategoryCount = this.categories.length;
        
        // Import categories (merge with existing, avoid duplicates)
        const existingCategoryIds = this.categories.map(cat => cat.id);
        const newCategories = importedData.categories.filter(cat => !existingCategoryIds.includes(cat.id));
        this.categories = [...this.categories, ...newCategories];
        
        // Import bookmarks (merge with existing)
        this.bookmarks = [...this.bookmarks, ...importedData.bookmarks];
        
        // Save everything
        this.saveCategories();
        this.saveBookmarks();
        
        // Update UI
        this.renderCategories();
        this.renderBookmarks();
        this.updateEmptyState();
        this.updateCategorySelect();
        this.updateFilterButtons();
        
        const importedBookmarkCount = this.bookmarks.length - originalBookmarkCount;
        const importedCategoryCount = this.categories.length - originalCategoryCount;
        
        this.showMessage(
            `Backup imported successfully! ${importedBookmarkCount} bookmarks, ${importedCategoryCount} categories added.`, 
            'success'
        );
        
        // Reset import UI
        this.resetImportUI();
    }

    importLegacyBookmarks(importedBookmarks) {
        const originalCount = this.bookmarks.length;
        this.bookmarks = [...this.bookmarks, ...importedBookmarks];
        this.saveBookmarks();
        this.renderBookmarks();
        this.updateEmptyState();
        
        const importedCount = this.bookmarks.length - originalCount;
        this.showMessage(`${importedCount} bookmarks imported successfully! (Legacy format)`, 'success');
        
        // Reset import UI
        this.resetImportUI();
    }

    resetImportUI() {
        document.getElementById('importFile').value = '';
        document.getElementById('fileName').textContent = '';
        document.getElementById('importConfirmBtn').style.display = 'none';
        this.selectedFile = null;
    }

    // Category Management
    loadCategories() {
        try {
            const saved = localStorage.getItem('bookmarkCategories');
            return saved ? JSON.parse(saved) : this.getDefaultCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            return this.getDefaultCategories();
        }
    }

    getDefaultCategories() {
        return [
            { id: 'general', name: 'General', color: '#8b5cf6', isDefault: true },
            { id: 'work', name: 'Work', color: '#3b82f6', isDefault: true },
            { id: 'entertainment', name: 'Entertainment', color: '#10b981', isDefault: true },
            { id: 'shopping', name: 'Shopping', color: '#f59e0b', isDefault: true },
            { id: 'news', name: 'News', color: '#ef4444', isDefault: true },
            { id: 'tools', name: 'Tools', color: '#8b5cf6', isDefault: true }
        ];
    }

    saveCategories() {
        try {
            localStorage.setItem('bookmarkCategories', JSON.stringify(this.categories));
        } catch (error) {
            console.error('Error saving categories:', error);
            this.showMessage('Error saving categories!', 'error');
        }
    }

    addCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const color = document.getElementById('categoryColor').value;

        if (!name) {
            this.showMessage('Please enter a name for the category!', 'error');
            return;
        }

        // Check if category already exists
        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            this.showMessage('A category with this name already exists!', 'error');
            return;
        }

        const category = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            color: color,
            isDefault: false
        };

        this.categories.push(category);
        this.saveCategories();
        this.renderCategories();
        this.updateCategorySelect();
        this.updateFilterButtons();
        this.clearCategoryForm();
        this.showMessage('Category added successfully!', 'success');
        
        // Switch to bookmarks tab to show the new category
        this.switchTab('bookmarks');
    }

    deleteCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        
        if (category.isDefault) {
            this.showMessage('Default categories cannot be deleted!', 'error');
            return;
        }

        this.showConfirmModal(
            'Delete Category',
            `Do you really want to delete the category "${category.name}"? All associated bookmarks will be moved to "General".`,
            () => {
                // Move bookmarks to "General"
                this.bookmarks.forEach(bookmark => {
                    if (bookmark.category === categoryId) {
                        bookmark.category = 'general';
                    }
                });

                // Remove category
                this.categories = this.categories.filter(cat => cat.id !== categoryId);
                
                this.saveCategories();
                this.saveBookmarks();
                this.renderCategories();
                this.renderBookmarks();
                this.updateCategorySelect();
                this.updateFilterButtons();
                this.showMessage('Category deleted and bookmarks moved!', 'success');
            },
            'delete'
        );
    }

    renameCategory(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        
        this.showPromptModal(
            'Rename Category',
            'New name for the category:',
            category.name,
            (newName) => {
                if (newName && newName.trim() !== category.name) {
                    const trimmedName = newName.trim();
                    
                    // Check if name already exists
                    if (this.categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase() && cat.id !== categoryId)) {
                        this.showMessage('A category with this name already exists!', 'error');
                        return;
                    }

                    category.name = trimmedName;
                    this.saveCategories();
                    this.renderCategories();
                    this.updateCategorySelect();
                    this.updateFilterButtons();
                    this.showMessage('Category renamed!', 'success');
                }
            }
        );
    }

    changeCategoryColor(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        
        this.showColorModal(
            'Change Category Color',
            `Choose a new color for the category "${category.name}":`,
            category.color,
            category.name,
            (newColor) => {
                category.color = newColor.toUpperCase();
                this.saveCategories();
                this.renderCategories();
                this.showMessage('Category color changed!', 'success');
            }
        );
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(category => {
            const bookmarkCount = this.bookmarks.filter(bookmark => bookmark.category === category.id).length;
            
            return `
                <div class="category-card" data-category-id="${category.id}" draggable="true">
                    <div class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                    <div class="category-header">
                        <div class="category-name">
                            <div class="category-color-indicator" style="background-color: ${category.color}"></div>
                            ${this.escapeHtml(category.name)}
                        </div>
                    </div>
                    <div class="category-stats">
                        ${bookmarkCount} Bookmark${bookmarkCount !== 1 ? 's' : ''}
                    </div>
                    <div class="category-actions">
                        <button class="category-btn rename" onclick="dashboard.renameCategory('${category.id}')">
                            <i class="fas fa-edit"></i> Rename
                        </button>
                        <button class="category-btn edit" onclick="dashboard.changeCategoryColor('${category.id}')">
                            <i class="fas fa-palette"></i> Color
                        </button>
                        ${!category.isDefault ? `
                            <button class="category-btn delete" onclick="dashboard.deleteCategory('${category.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Add drag and drop event listeners
        this.initDragAndDrop();
    }

    updateCategorySelect() {
        const select = document.getElementById('bookmarkCategory');
        if (!select) return;

        // Clear existing options
        select.innerHTML = '';
        
        // Add all categories as options
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // Set default selection to first category
        if (this.categories.length > 0) {
            select.value = this.categories[0].id;
        }
    }

    updateFilterButtons() {
        const filterSection = document.querySelector('.filter-section');
        if (!filterSection) return;

        // Keep "Alle" button
        const allButton = filterSection.querySelector('[data-category="all"]');
        filterSection.innerHTML = '';
        filterSection.appendChild(allButton);

        // Add category buttons
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category.id;
            button.innerHTML = `<i class="fas fa-tag" style="color: ${category.color};"></i> ${this.escapeHtml(category.name)}`;
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
            filterSection.appendChild(button);
        });
    }

    clearCategoryForm() {
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryColor').value = '#8b5cf6';
    }

    // Drag and Drop functionality
    initDragAndDrop() {
        const cards = document.querySelectorAll('.category-card');
        let draggedElement = null;

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.outerHTML);
            });

            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
                draggedElement = null;
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                card.classList.add('drag-over');
            });

            card.addEventListener('dragleave', (e) => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                
                if (draggedElement && draggedElement !== card) {
                    this.reorderCategories(draggedElement, card);
                }
            });
        });
    }

    reorderCategories(draggedElement, targetElement) {
        const draggedId = draggedElement.dataset.categoryId;
        const targetId = targetElement.dataset.categoryId;
        
        const draggedIndex = this.categories.findIndex(cat => cat.id === draggedId);
        const targetIndex = this.categories.findIndex(cat => cat.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // Remove dragged category from array
        const draggedCategory = this.categories.splice(draggedIndex, 1)[0];
        
        // Insert at new position
        this.categories.splice(targetIndex, 0, draggedCategory);
        
        // Save new order
        this.saveCategories();
        
        // Re-render categories and update other UI elements
        this.renderCategories();
        this.updateCategorySelect();
        this.updateFilterButtons();
        
        this.showMessage('Category order updated!', 'success');
    }

    // Modal Functions
    showConfirmModal(title, message, onConfirm, type = 'normal') {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        const modalClose = document.getElementById('modalClose');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Set button style based on type
        if (type === 'delete') {
            modalConfirm.classList.add('delete');
            modalConfirm.textContent = 'Delete';
        } else {
            modalConfirm.classList.remove('delete');
            modalConfirm.textContent = 'Confirm';
        }

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Event handlers
        const handleConfirm = () => {
            onConfirm();
            this.hideModal();
        };

        const handleCancel = () => {
            this.hideModal();
        };

        // Remove existing listeners
        modalConfirm.replaceWith(modalConfirm.cloneNode(true));
        modalCancel.replaceWith(modalCancel.cloneNode(true));
        modalClose.replaceWith(modalClose.cloneNode(true));

        // Add new listeners
        document.getElementById('modalConfirm').addEventListener('click', handleConfirm);
        document.getElementById('modalCancel').addEventListener('click', handleCancel);
        document.getElementById('modalClose').addEventListener('click', handleCancel);

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) handleCancel();
        };

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    showPromptModal(title, message, defaultValue, onConfirm) {
        const modal = document.getElementById('promptOverlay');
        const modalTitle = document.getElementById('promptTitle');
        const modalMessage = document.getElementById('promptMessage');
        const modalInput = document.getElementById('promptInput');
        const modalConfirm = document.getElementById('promptConfirm');
        const modalCancel = document.getElementById('promptCancel');
        const modalClose = document.getElementById('promptClose');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalInput.value = defaultValue;
        modalInput.select();

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Event handlers
        const handleConfirm = () => {
            const value = modalInput.value.trim();
            if (value) {
                onConfirm(value);
            }
            this.hidePromptModal();
        };

        const handleCancel = () => {
            this.hidePromptModal();
        };

        // Remove existing listeners
        modalConfirm.replaceWith(modalConfirm.cloneNode(true));
        modalCancel.replaceWith(modalCancel.cloneNode(true));
        modalClose.replaceWith(modalClose.cloneNode(true));

        // Add new listeners
        document.getElementById('promptConfirm').addEventListener('click', handleConfirm);
        document.getElementById('promptCancel').addEventListener('click', handleCancel);
        document.getElementById('promptClose').addEventListener('click', handleCancel);

        // Handle Enter key
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        };
        modalInput.addEventListener('keydown', handleEnter);

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) handleCancel();
        };

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    hideModal() {
        const modal = document.getElementById('modalOverlay');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    hidePromptModal() {
        const modal = document.getElementById('promptOverlay');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showColorModal(title, message, currentColor, categoryName, onConfirm) {
        const modal = document.getElementById('colorOverlay');
        const modalTitle = document.getElementById('colorTitle');
        const modalMessage = document.getElementById('colorMessage');
        const colorPicker = document.getElementById('colorPicker');
        const colorHexInput = document.getElementById('colorHexInput');
        const colorPreviewCircle = document.getElementById('colorPreviewCircle');
        const colorPreviewText = document.getElementById('colorPreviewText');
        const colorPresets = document.getElementById('colorPresets');
        const modalConfirm = document.getElementById('colorConfirm');
        const modalCancel = document.getElementById('colorCancel');
        const modalClose = document.getElementById('colorClose');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        colorPreviewText.textContent = categoryName;

        // Set current color
        colorPicker.value = currentColor;
        colorHexInput.value = currentColor;
        colorPreviewCircle.style.backgroundColor = currentColor;

        // Create preset colors
        const presetColors = [
            '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899',
            '#06b6d4', '#84cc16', '#f97316', '#8b5cf6', '#6366f1', '#a855f7',
            '#14b8a6', '#22c55e', '#eab308', '#f43f5e', '#0ea5e9', '#7c3aed'
        ];

        colorPresets.innerHTML = '';
        presetColors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            if (color === currentColor) {
                colorOption.classList.add('selected');
            }
            colorOption.addEventListener('click', () => {
                // Remove selection from all options
                colorPresets.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                // Add selection to clicked option
                colorOption.classList.add('selected');
                // Update inputs and preview
                colorPicker.value = color;
                colorHexInput.value = color;
                colorPreviewCircle.style.backgroundColor = color;
            });
            colorPresets.appendChild(colorOption);
        });

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Event handlers
        const updatePreview = (color) => {
            colorPreviewCircle.style.backgroundColor = color;
            colorHexInput.value = color;
            colorPicker.value = color;
        };

        const handleConfirm = () => {
            const selectedColor = colorHexInput.value.trim();
            if (selectedColor && /^#[0-9A-F]{6}$/i.test(selectedColor)) {
                onConfirm(selectedColor);
            } else {
                this.showMessage('Please enter a valid hex color code!', 'error');
                return;
            }
            this.hideColorModal();
        };

        const handleCancel = () => {
            this.hideColorModal();
        };

        // Color picker change
        colorPicker.addEventListener('input', (e) => {
            updatePreview(e.target.value);
        });

        // Hex input change
        colorHexInput.addEventListener('input', (e) => {
            let value = e.target.value;
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                updatePreview(value);
            }
        });

        // Remove existing listeners
        modalConfirm.replaceWith(modalConfirm.cloneNode(true));
        modalCancel.replaceWith(modalCancel.cloneNode(true));
        modalClose.replaceWith(modalClose.cloneNode(true));

        // Add new listeners
        document.getElementById('colorConfirm').addEventListener('click', handleConfirm);
        document.getElementById('colorCancel').addEventListener('click', handleCancel);
        document.getElementById('colorClose').addEventListener('click', handleCancel);

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) handleCancel();
        };

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Handle Enter key on hex input
        colorHexInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });
    }

    hideColorModal() {
        const modal = document.getElementById('colorOverlay');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new BookmarkDashboard();
});

// Add some sample bookmarks on first visit
if (!localStorage.getItem('bookmarkDashboard')) {
    const sampleBookmarks = [
        {
            id: '1',
            name: 'Google',
            url: 'https://www.google.com',
            category: 'tools',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'GitHub',
            url: 'https://github.com',
            category: 'work',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'YouTube',
            url: 'https://www.youtube.com',
            category: 'entertainment',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('bookmarkDashboard', JSON.stringify(sampleBookmarks));
}
