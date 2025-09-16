# 🔗 Hyperlink Dashboard

A modern, responsive web dashboard for organizing and managing your bookmarks with categories, search functionality, and import/export capabilities.


## ✨ Features

### 📚 Bookmark Management
- **Add Bookmarks**: Quickly add new bookmarks with name, URL, and category
- **Edit Bookmarks**: Update existing bookmarks with inline editing
- **Delete Bookmarks**: Remove bookmarks with confirmation dialog
- **Open Bookmarks**: Click to open bookmarks in new tabs

### 🏷️ Category System
- **Custom Categories**: Create unlimited custom categories with custom colors
- **Drag & Drop**: Reorder categories by dragging and dropping
- **Category Management**: Rename, change colors, or delete categories
- **Smart Migration**: When deleting categories, bookmarks automatically move to "General"

### 🔍 Search & Filter
- **Real-time Search**: Search through bookmark names, URLs, and categories
- **Category Filtering**: Filter bookmarks by specific categories
- **Combined Search**: Use search and category filters together
- **Clear Search**: Easy one-click search clearing

### 💾 Data Management
- **Local Storage**: All data stored locally in your browser
- **Export Backup**: Download complete dashboard backup as JSON
- **Import Backup**: Restore from backup files
- **Legacy Support**: Import old bookmark-only files

### 🎨 Modern UI
- **Dark Theme**: Beautiful dark theme with glassmorphism effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Fluid transitions and hover effects
- **Custom Favicon**: Includes a custom bear paw print favicon

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or installation required!

## 📖 Usage

### Adding Bookmarks
1. Enter the website name in the "Website name" field
2. Enter the URL in the "https://example.com" field
3. Select a category from the dropdown
4. Click "Add" or press Enter

### Managing Categories
1. Switch to the "Categories" tab
2. Add new categories with custom names and colors
3. Drag and drop to reorder categories
4. Use the action buttons to rename, change colors, or delete

### Searching Bookmarks
1. Use the search bar to find bookmarks by name, URL, or category
2. Combine with category filters for precise results
3. Click the "×" button to clear search

### Import/Export
1. Go to the "Import/Export" tab
2. Click "Download Complete Dashboard Backup" to export
3. Use "Select File" to import from backup files
4. Supports both new format (complete backup) and legacy bookmark-only files

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and modern features
- **CSS3**: Flexbox, Grid, animations, and glassmorphism effects
- **Vanilla JavaScript**: No frameworks, pure JavaScript
- **Font Awesome**: Icons for better UX
- **Local Storage**: Client-side data persistence

### File Structure
```
HyperlinkDashboard/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── favicon.png         # Custom favicon
└── README.md           # This file
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔧 Customization

### Adding New Default Categories
Edit the `getDefaultCategories()` method in `script.js`:

```javascript
getDefaultCategories() {
    return [
        { id: 'general', name: 'General', color: '#8b5cf6', isDefault: true },
        { id: 'work', name: 'Work', color: '#3b82f6', isDefault: true },
        // Add your custom categories here
    ];
}
```

### Changing Colors
Modify the CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #8b5cf6;
    --secondary-color: #3b82f6;
    /* Add your custom colors */
}
```

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Compact design with collapsible elements

## 🔒 Privacy & Security

- **No Data Collection**: All data stays in your browser
- **No External Requests**: Works completely offline
- **Local Storage Only**: No server communication
- **Client-Side Only**: No backend or database required

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for the beautiful icons
- Modern CSS techniques for the glassmorphism effects
- The open-source community for inspiration

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/HyperlinkDashboard/issues) page
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

---

**Made with ❤️ for better bookmark management**