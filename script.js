// ============================================
// LifeOS - Frontend Application
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    currentPage: 'dashboard',
    brainDumps: [],
    
    init() {
        this.loadFromStorage();
    },
    
    loadFromStorage() {
        const stored = localStorage.getItem('lifeos_brain_dumps');
        if (stored) {
            try {
                this.brainDumps = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading brain dumps:', e);
                this.brainDumps = [];
            }
        }
    },
    
    saveToStorage() {
        localStorage.setItem('lifeos_brain_dumps', JSON.stringify(this.brainDumps));
    },
    
    addBrainDump(content) {
        if (!content.trim()) return false;
        
        const dump = {
            id: Date.now(),
            content: content.trim(),
            timestamp: new Date().toISOString(),
            createdAt: new Date()
        };
        
        this.brainDumps.unshift(dump);
        this.saveToStorage();
        return dump;
    },
    
    deleteBrainDump(id) {
        this.brainDumps = this.brainDumps.filter(dump => dump.id !== id);
        this.saveToStorage();
    },
    
    getBrainDumpStats() {
        return {
            total: this.brainDumps.length,
            recent: this.brainDumps.slice(0, 3)
        };
    }
};

// ============================================
// UI CONTROLLER
// ============================================

const UIController = {
    // Page Navigation
    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const page = document.getElementById(pageName);
        if (page) {
            page.classList.add('active');
        }
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
        
        // Close mobile menu
        this.closeMobileMenu();
        
        // Update state
        AppState.currentPage = pageName;
    },
    
    // Mobile Menu
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
    },
    
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('mobile-open');
    },
    
    // Brain Dump Functions
    renderBrainDumps() {
        const dumpsList = document.getElementById('dumpsList');
        const dumps = AppState.brainDumps;
        
        if (dumps.length === 0) {
            dumpsList.innerHTML = '<p class="empty-state">No brain dumps yet. Start dumping your thoughts!</p>';
            return;
        }
        
        dumpsList.innerHTML = dumps.map(dump => this.createDumpElement(dump)).join('');
        
        // Attach event listeners
        document.querySelectorAll('.dump-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dumpId = parseInt(btn.dataset.dumpId);
                const action = btn.dataset.action;
                
                if (action === 'delete') {
                    AppState.deleteBrainDump(dumpId);
                    this.renderBrainDumps();
                    this.updateDashboard();
                }
            });
        });
    },
    
    createDumpElement(dump) {
        const date = new Date(dump.timestamp);
        const timeString = this.formatTime(date);
        const contentPreview = this.truncateText(dump.content, 150);
        
        return `
            <div class="dump-item">
                <div class="dump-item-text">${this.escapeHtml(contentPreview)}</div>
                <div class="dump-item-time">${timeString}</div>
                <div class="dump-item-actions">
                    <button class="dump-item-btn" data-dump-id="${dump.id}" data-action="delete">
                        Delete
                    </button>
                </div>
            </div>
        `;
    },
    
    renderRecentBrainDumps() {
        const recentContainer = document.getElementById('recentBrainDumps');
        const stats = AppState.getBrainDumpStats();
        
        if (stats.recent.length === 0) {
            recentContainer.innerHTML = '<p class="empty-state">No brain dumps yet. Start by dumping your thoughts!</p>';
            return;
        }
        
        recentContainer.innerHTML = stats.recent.map(dump => {
            const date = new Date(dump.timestamp);
            const timeString = this.formatTime(date);
            const contentPreview = this.truncateText(dump.content, 100);
            
            return `
                <div class="recent-item">
                    <div>${this.escapeHtml(contentPreview)}</div>
                    <div class="recent-item-time">${timeString}</div>
                </div>
            `;
        }).join('');
    },
    
    // Dashboard
    updateDashboard() {
        // Update stats
        const stats = AppState.getBrainDumpStats();
        document.getElementById('brainDumpCount').textContent = stats.total;
        document.getElementById('taskCount').textContent = '0'; // Placeholder
        document.getElementById('reminderCount').textContent = '0'; // Placeholder
        
        // Update recent items
        this.renderRecentBrainDumps();
    },
    
    // Character Counter
    updateCharCount(input, counter) {
        const count = input.value.length;
        const limit = 500;
        counter.textContent = Math.min(count, limit);
        
        if (count >= limit) {
            input.value = input.value.substring(0, limit);
        }
    },
    
    // Utility Functions
    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    },
    
    truncateText(text, length) {
        if (text.length <= length) {
            return text;
        }
        return text.substring(0, length) + '...';
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            UIController.showPage(pageName);
        });
    });
    
    // Mobile Menu Toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        UIController.toggleMobileMenu();
    });
    
    // Brain Dump Page - Add Dump
    const dumpButton = document.getElementById('dumpButton');
    const dumpInput = document.getElementById('dumpInput');
    
    dumpButton.addEventListener('click', () => {
        addBrainDump(dumpInput);
    });
    
    dumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addBrainDump(dumpInput);
        }
    });
    
    // Character Counter
    const charCount = document.getElementById('charCount');
    dumpInput.addEventListener('input', () => {
        UIController.updateCharCount(dumpInput, charCount);
    });
    
    // Dashboard - Quick Dump
    const quickDumpButton = document.getElementById('quickDumpButton');
    const quickDumpInput = document.getElementById('quickDumpInput');
    
    quickDumpButton.addEventListener('click', () => {
        addBrainDump(quickDumpInput);
    });
    
    quickDumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addBrainDump(quickDumpInput);
        }
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            // Filter functionality can be implemented here
            // For now, just show all
            UIController.renderBrainDumps();
        });
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function addBrainDump(inputElement) {
    const content = inputElement.value;
    
    if (!content.trim()) {
        alert('Please write something before dumping!');
        return;
    }
    
    const dump = AppState.addBrainDump(content);
    
    if (dump) {
        inputElement.value = '';
        
        // Update counter if it exists
        const charCount = inputElement.parentElement.querySelector('#charCount');
        if (charCount) {
            charCount.textContent = '0';
        }
        
        // Refresh UI
        if (AppState.currentPage === 'brain-dump') {
            UIController.renderBrainDumps();
        }
        UIController.updateDashboard();
        
        // Show success feedback
        showNotification('Brain dump added!');
    }
}

function showNotification(message) {
    // Simple notification - can be enhanced later
    console.log('✓', message);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Initialize state
    AppState.init();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    UIController.updateDashboard();
    UIController.renderBrainDumps();
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
