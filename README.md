(AI generated)

# Dk_Sortable

A lightweight, vanilla JavaScript sortable library with no external dependencies. Perfect for creating draggable, sortable lists with smooth animations and customizable styling.

![Demo Preview](https://img.shields.io/badge/Demo-Interactive-blue)
![Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen)

## Features

✨ **Zero Dependencies** - Pure vanilla JavaScript  
🎯 **Flexible API** - Works with any CSS selector  
🎨 **Customizable** - CSS custom properties for easy theming  
📱 **Touch Support** - Works on mobile devices  
🎪 **Handle Support** - Optional drag handles with custom symbols  
🌈 **Visual Feedback** - Ghost elements, drop indicators, and smooth animations  
⚡ **Lightweight** - Small footprint, big performance  

## Quick Start

### 1. Include the Files

```html
<link rel="stylesheet" href="dk_sortable.css">
<script src="dk_sortable.js"></script>
```

### 2. Basic Usage

```html
<ul id="my-list">
    <li class="item">Item 1</li>
    <li class="item">Item 2</li>
    <li class="item">Item 3</li>
</ul>

<script>
    new Dk_Sortable('#my-list', '.item');
</script>
```

## API Reference

### Constructor

```javascript
new Dk_Sortable(containerSelector, itemSelector, options)
```

**Parameters:**

- `containerSelector` (string) - CSS selector for the container element
- `itemSelector` (string) - CSS selector for sortable items within the container
- `options` (object, optional) - Configuration options

### Options

```javascript
{
    handle: false,                 // Enable drag handles
    handleSymbol: '⋮⋮',             // Symbol for drag handles
    ghostBackgroundColor: null,    // Custom ghost element background
    dropIndicatorColor: '#2196f3', // Color for drop indicators
    enableDragClass: true          // Add 'dragging' class during drag
}
```

## Examples

### Basic Sortable List

```javascript
// Simple sortable list
const sortable = new Dk_Sortable('#todo-list', '.todo-item');
```

### With Drag Handles

```javascript
// Only draggable by handles
const sortable = new Dk_Sortable('#complex-list', '.list-item', {
    handle: true,
    handleSymbol: '☰'
});
```

### Custom Styling

```javascript
// Custom colors and effects
const sortable = new Dk_Sortable('#styled-list', '.styled-item', {
    handle: true,
    handleSymbol: '⋯',
    dropIndicatorColor: '#ff4081'
});
```

## CSS Customization

Dk_Sortable uses CSS custom properties for easy theming:

```css
:root {
    /* Handle styling */
    --dk_sortable-handle-color: #666;
    --dk_sortable-handle-hover-color: #333;
    
    /* Ghost element */
    --dk_sortable-ghost-opacity: 0.6;
    
    /* Drop indicators */
    --dk_sortable-indicator-color: #2196f3;
    --dk_sortable-indicator-shadow: rgba(33, 150, 243, 0.4);
    
    /* Placeholders */
    --dk_sortable-placeholder-border: #ccc;
}
```

## Advanced Usage

### Event Handling

```javascript
const sortable = new Dk_Sortable('#my-list', '.item');

// Listen for DOM changes to detect reordering
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            console.log('List reordered!');
            // Handle reorder logic here
        }
    });
});

observer.observe(document.querySelector('#my-list'), {
    childList: true
});
```

### Multiple Sortable Areas

```javascript
// Create multiple independent sortable areas
const todoSortable = new Dk_Sortable('#todo', '.task');
const doneSortable = new Dk_Sortable('#done', '.task', {
    handle: true,
    handleSymbol: '✓'
});
```

## Browser Support

- Chrome 49+
- Firefox 45+
- Safari 11+
- Edge 16+

## File Structure

```
├── dk_sortable.js     # Main JavaScript library
├── dk_sortable.css    # Core CSS styles
├── demo.html          # Interactive demo and examples
└── README.md          # Documentation
```

## Installation

### Download

Download the latest release and include the files in your project:

```html
<link rel="stylesheet" href="path/to/dk_sortable.css">
<script src="path/to/dk_sortable.js"></script>
```

## Demo

Check out the [interactive demo](demo.html) to see Dk_Sortable in action with various configurations and styling options.

## Performance Tips

- Use specific selectors for better performance
- Avoid deeply nested sortable containers
- Consider using `transform` CSS properties for custom animations
- Test on target devices for smooth touch interactions

### Development Setup

1. Clone the repository
2. Open `demo.html` in your browser to test changes
3. Make sure your changes work across different browsers

## License

MIT License - feel free to use in personal and commercial projects.

## Changelog

### v0.9.0
- Initial release
- Vertical sorting support
- Drag handle functionality
- Touch device compatibility
- Customizable styling with CSS variables
- Zero dependencies

---

**Made with ❤️ for the web development community**