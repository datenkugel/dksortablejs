class Dk_Sortable {
    constructor(containerSelector, itemSelector, options = {}) {
        this.containerSelector = containerSelector;
        this.itemSelector = itemSelector;
        
        // Default options
        this.options = {
            useHandle: false,
            handleSymbol: '✥',
            ghostBackgroundColor: '#f0f0f0',
            dropIndicatorColor: '#2196f3',
            ...options
        };
        
        // State variables
        this.draggedElement = null;
        this.ghostElement = null;
        this.dropIndicator = null;
        this.dropPlaceholder = null;
        this.containers = [];
        this.initialMouseY = 0;
        this.initialElementY = 0;
        this.dragOffset = { x: 0, y: 0 };
        this.currentPlaceholder = null;
        
        this.init();
    }
    
    init() {
        this.containers = document.querySelectorAll(this.containerSelector);
        
        this.containers.forEach(container => {
            this.setupContainer(container);
        });
        
        // Create drop indicator
        this.createDropIndicator();
        
        // Bind event listeners
        this.bindEvents();
    }
    
    setupContainer(container) {
        const items = container.querySelectorAll(this.itemSelector);
        
        items.forEach(item => {
            this.setupItem(item);
        });
    }
    
    setupItem(item) {
        if (this.options.useHandle) {
            this.addHandle(item);
        } else {
            item.draggable = false; // Prevent default drag behavior
        }
    }
    
    addHandle(item) {
        // Check if handle already exists
        if (item.querySelector('.dk_sortable-handle')) {
            return;
        }
        
        const handle = document.createElement('div');
        handle.className = 'dk_sortable-handle';
        handle.title = 'Drag to reorder';
        handle.setAttribute('data-symbol', this.options.handleSymbol);
        
        item.insertBefore(handle, item.firstChild);
    }
    
    createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'dk_sortable-drop-indicator';
        this.dropIndicator.style.display = 'none';
        this.dropIndicator.style.backgroundColor = this.options.dropIndicatorColor;
        document.body.appendChild(this.dropIndicator);
        
        // Create placeholder element
        this.dropPlaceholder = document.createElement('div');
        this.dropPlaceholder.className = 'dk_sortable-drop-placeholder';
        this.dropPlaceholder.style.display = 'none';
    }
    
    bindEvents() {
        // Use event delegation for better performance
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Prevent default drag behavior
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest(this.itemSelector)) {
                e.preventDefault();
            }
        });
    }
    
    handleMouseDown(e) {
        const item = e.target.closest(this.itemSelector);
        if (!item) return;
        
        const container = item.closest(this.containerSelector);
        if (!container) return;
        
        // Check if we should start dragging
        let shouldDrag = false;
        
        if (this.options.useHandle) {
            // Only drag if clicked on handle
            shouldDrag = e.target.closest('.dk_sortable-handle') !== null;
        } else {
            // Drag from anywhere on the item
            shouldDrag = true;
        }
        
        if (!shouldDrag) return;
        
        e.preventDefault();
        
        this.startDrag(item, e);
    }
    
    startDrag(item, e) {
        this.draggedElement = item;
        
        // Store initial positions
        const rect = item.getBoundingClientRect();
        this.initialMouseY = e.clientY;
        this.initialElementY = rect.top;
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // Add dragging class
        item.classList.add('dragging');
        
        // Create ghost element
        this.createGhostElement(item);
        
        // Change cursor
        document.body.style.cursor = 'grabbing';
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
    }
    
    createGhostElement(originalItem) {
        this.ghostElement = originalItem.cloneNode(true);
        this.ghostElement.classList.add('dk_sortable-ghost');
        this.ghostElement.classList.remove('dragging');
        
        // Apply custom background color
        this.ghostElement.style.backgroundColor = this.options.ghostBackgroundColor;
        
        // Position the ghost element with exact dimensions
        const rect = originalItem.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(originalItem);
        
        this.ghostElement.style.position = 'absolute';
        this.ghostElement.style.zIndex = '1000';
        this.ghostElement.style.width = rect.width + 'px';
        this.ghostElement.style.height = rect.height + 'px';
        this.ghostElement.style.left = rect.left + 'px';
        this.ghostElement.style.top = rect.top + 'px';
        this.ghostElement.style.pointerEvents = 'none';
        
        // Remove any margin/padding that might affect size
        this.ghostElement.style.margin = '0';
        this.ghostElement.style.boxSizing = 'border-box';
        
        document.body.appendChild(this.ghostElement);
    }
    
    handleMouseMove(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        
        // Update ghost element position
        if (this.ghostElement) {
            this.ghostElement.style.left = (e.clientX - this.dragOffset.x) + 'px';
            this.ghostElement.style.top = (e.clientY - this.dragOffset.y) + 'px';
        }
        
        // Find the drop position
        this.updateDropIndicator(e);
    }
    
    updateDropIndicator(e) {
        const container = this.draggedElement.closest(this.containerSelector);
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const items = Array.from(container.querySelectorAll(this.itemSelector))
            .filter(item => item !== this.draggedElement);
        
        let insertPosition = null;
        let insertBefore = null;
        
        // Remove any existing placeholder
        this.removePlaceholder();
        
        // Get colors from dragged element
        const draggedStyle = window.getComputedStyle(this.draggedElement);
        let elementColor = null;
        
        // Try to get a visible color from the element
        if (draggedStyle.borderColor && 
            draggedStyle.borderColor !== 'rgba(0, 0, 0, 0)' && 
            draggedStyle.borderColor !== 'transparent' &&
            draggedStyle.borderColor !== 'rgb(0, 0, 0)') {
            elementColor = draggedStyle.borderColor;
        } else if (draggedStyle.backgroundColor && 
                   draggedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                   draggedStyle.backgroundColor !== 'transparent') {
            elementColor = draggedStyle.backgroundColor;
        } else if (draggedStyle.color && 
                   draggedStyle.color !== 'rgba(0, 0, 0, 0)' && 
                   draggedStyle.color !== 'transparent') {
            elementColor = draggedStyle.color;
        }
        
        // If no color found or color is too light/transparent, use a default
        if (!elementColor || this.isColorTooLight(elementColor)) {
            elementColor = this.options.dropIndicatorColor || '#2196f3';
        }
        
        // Check if mouse is within container bounds
        if (e.clientX >= containerRect.left && 
            e.clientX <= containerRect.right &&
            e.clientY >= containerRect.top && 
            e.clientY <= containerRect.bottom) {
            
            // Find the best insert position based on vertical position
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                
                if (e.clientY < itemCenter) {
                    insertBefore = item;
                    break;
                }
            }
            
            // Create and show placeholder with element colors
            this.showPlaceholder(container, insertBefore, elementColor);
            
            if (insertBefore) {
                const rect = insertBefore.getBoundingClientRect();
                insertPosition = {
                    x: rect.left,
                    y: rect.top - 15, // Position above the item with more space
                    width: rect.width
                };
            } else if (items.length > 0) {
                // Insert at the end
                const lastItem = items[items.length - 1];
                const rect = lastItem.getBoundingClientRect();
                insertPosition = {
                    x: rect.left,
                    y: rect.bottom + 15, // Position below the last item with more space
                    width: rect.width
                };
            } else {
                // Container is empty (except for dragged element)
                insertPosition = {
                    x: containerRect.left + 20,
                    y: containerRect.top + 20,
                    width: containerRect.width - 40
                };
            }
        }
        
        // Update drop indicator with dynamic colors
        if (insertPosition) {
            this.dropIndicator.style.display = 'block';
            this.dropIndicator.style.left = insertPosition.x + 'px';
            this.dropIndicator.style.top = insertPosition.y + 'px';
            this.dropIndicator.style.width = insertPosition.width + 'px';
            
            // Apply dynamic colors - make it more subtle since we have placeholder preview
            this.dropIndicator.style.background = `linear-gradient(90deg, ${this.adjustColorOpacity(elementColor, 0.6)}, ${this.adjustColorOpacity(elementColor, 0.3)})`;
            this.dropIndicator.style.boxShadow = `0 0 8px ${this.adjustColorOpacity(elementColor, 0.2)}`;
            
            // Update pseudo-elements colors via CSS custom properties
            this.dropIndicator.style.setProperty('--indicator-color', this.adjustColorOpacity(elementColor, 0.7));
            this.dropIndicator.style.setProperty('--indicator-shadow', this.adjustColorOpacity(elementColor, 0.2));
        } else {
            this.dropIndicator.style.display = 'none';
        }
        
        // Store for drop operation
        this.insertBefore = insertBefore;
    }
    
    showPlaceholder(container, insertBefore, elementColor) {
        // Create a new placeholder element that looks like the dragged item
        const placeholder = this.draggedElement.cloneNode(true);
        placeholder.classList.remove('dragging');
        placeholder.classList.add('dk_sortable-placeholder');
        
        // Get the height of the dragged element for the placeholder
        const draggedRect = this.draggedElement.getBoundingClientRect();
        
        // Style the placeholder to look like a preview
        placeholder.style.opacity = '0.5';
        placeholder.style.transform = 'scale(0.95)';
        placeholder.style.pointerEvents = 'none';
        placeholder.style.backgroundColor = this.adjustColorOpacity(elementColor, 0.1);
        placeholder.style.border = `2px dashed ${elementColor}`;
        placeholder.style.borderRadius = '4px';
        
        // Insert placeholder at the correct position
        if (insertBefore) {
            container.insertBefore(placeholder, insertBefore);
        } else {
            container.appendChild(placeholder);
        }
        
        this.currentPlaceholder = placeholder;
    }
    
    // Helper method to adjust color opacity
    adjustColorOpacity(color, opacity) {
        // Handle different color formats
        if (color.startsWith('rgb(')) {
            // Convert rgb() to rgba()
            return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
        } else if (color.startsWith('rgba(')) {
            // Update existing rgba() opacity
            return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
        } else if (color.startsWith('#')) {
            // Convert hex to rgba
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        } else {
            // Fallback for other color formats
            return `rgba(102, 102, 102, ${opacity})`;
        }
    }
    
    // Helper method to check if color is too light to be visible
    isColorTooLight(color) {
        try {
            let r, g, b;
            
            if (color.startsWith('rgb(')) {
                const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (matches) {
                    r = parseInt(matches[1]);
                    g = parseInt(matches[2]);
                    b = parseInt(matches[3]);
                }
            } else if (color.startsWith('rgba(')) {
                const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
                if (matches) {
                    r = parseInt(matches[1]);
                    g = parseInt(matches[2]);
                    b = parseInt(matches[3]);
                    const a = parseFloat(matches[4]);
                    // If alpha is very low, consider it too light
                    if (a < 0.3) return true;
                }
            } else if (color.startsWith('#')) {
                const hex = color.replace('#', '');
                r = parseInt(hex.substr(0, 2), 16);
                g = parseInt(hex.substr(2, 2), 16);
                b = parseInt(hex.substr(4, 2), 16);
            } else {
                return false; // Can't determine, assume it's fine
            }
            
            // Calculate luminance (perceived brightness)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.8; // Too light if luminance > 80%
        } catch (e) {
            return false; // If parsing fails, assume it's fine
        }
    }
    
    removePlaceholder() {
        if (this.currentPlaceholder && this.currentPlaceholder.parentNode) {
            this.currentPlaceholder.parentNode.removeChild(this.currentPlaceholder);
            this.currentPlaceholder = null;
        }
    }
    
    handleMouseUp(e) {
        if (!this.draggedElement) return;
        
        e.preventDefault();
        
        // Perform the actual reordering
        this.performDrop();
        
        // Cleanup
        this.cleanup();
    }
    
    performDrop() {
        const container = this.draggedElement.closest(this.containerSelector);
        if (!container) return;
        
        // Remove dragging class
        this.draggedElement.classList.remove('dragging');
        
        // Reorder the element
        if (this.insertBefore) {
            container.insertBefore(this.draggedElement, this.insertBefore);
        } else {
            // Append to end
            container.appendChild(this.draggedElement);
        }
        
        // Trigger custom event for external listeners
        const event = new CustomEvent('dk_sortable:change', {
            detail: {
                element: this.draggedElement,
                container: container,
                newIndex: Array.from(container.children).indexOf(this.draggedElement)
            }
        });
        container.dispatchEvent(event);
    }
    
    cleanup() {
        // Remove ghost element
        if (this.ghostElement) {
            document.body.removeChild(this.ghostElement);
            this.ghostElement = null;
        }
        
        // Remove placeholder
        this.removePlaceholder();
        
        // Hide drop indicator
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }
        
        // Reset cursor and selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Reset state
        this.draggedElement = null;
        this.insertBefore = null;
    }
    
    // Public methods
    
    // Refresh the sortable when DOM changes
    refresh() {
        this.containers = document.querySelectorAll(this.containerSelector);
        this.containers.forEach(container => {
            this.setupContainer(container);
        });
    }
    
    // Add a new item programmatically
    addItem(item, container) {
        container.appendChild(item);
        this.setupItem(item);
    }
    
    // Get current order of items
    getOrder(container = null) {
        if (container) {
            return Array.from(container.querySelectorAll(this.itemSelector));
        }
        
        // Return order for all containers
        const result = {};
        this.containers.forEach((container, index) => {
            result[index] = Array.from(container.querySelectorAll(this.itemSelector));
        });
        return result;
    }
    
    // Destroy the sortable instance
    destroy() {
        // Remove event listeners
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        // Remove drop indicator
        if (this.dropIndicator && this.dropIndicator.parentNode) {
            document.body.removeChild(this.dropIndicator);
        }
        
        // Remove placeholder
        this.removePlaceholder();
        
        // Remove handles if they were added
        if (this.options.useHandle) {
            this.containers.forEach(container => {
                const handles = container.querySelectorAll('.dk_sortable-handle');
                handles.forEach(handle => handle.remove());
            });
        }
        
        // Cleanup state
        this.cleanup();
    }
}