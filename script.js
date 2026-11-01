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

        // Start each page at the top (prevents a blank screen on iPhone)
        const main = document.querySelector('.main-content');
        if (main) main.scrollTop = 0;
        window.scrollTo(0, 0);

        // Safari fix: force the page area to repaint after switching pages
        const repaint = () => {
            if (!main) return;
            main.style.display = 'none';
            void main.offsetHeight;
            main.style.display = '';
        };
        repaint();
        requestAnimationFrame(repaint);
        setTimeout(repaint, 100);
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
                
