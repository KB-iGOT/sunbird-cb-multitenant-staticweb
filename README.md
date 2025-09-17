# sunbird-cb-multitenant-staticweb Angular Application

This is a multi-tenant Angular application built with Angular Material 16 and Tailwind CSS 2.2.19. The application shows different content, branding, and styling for different tenants based on JSON configuration files.

## Features

- **Dynamic Tenant Loading**: Content and styling are loaded dynamically based on tenant configuration
- **Angular Material 16**: Modern UI components and Material Design icons
- **Tailwind CSS 2.2.19**: Utility-first CSS framework for responsive design
- **JSON Configuration**: Easy tenant setup through JSON files
- **Responsive Design**: Mobile-friendly layout that works on all screen sizes
- **Theme Customization**: Each tenant can have custom colors, logos, and content

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   - Default tenant: `http://localhost:4200`
   - Specific tenant: `http://localhost:4200?tenant=tenant1`
   - Alternative tenants: `http://localhost:4200?tenant=tenant2` or `http://localhost:4200?tenant=tenant3`

## Tenant Configuration

### Available Tenants

1. **tenant1** - Acme Corporation (Blue theme)
2. **tenant2** - TechVision Solutions (Green theme)  
3. **tenant3** - Global Finance Group (Purple theme)

### Tenant Configuration Structure

Each tenant is configured through a JSON file in `src/assets/tenants/`:

```json
{
  "id": "tenant1",
  "name": "Company Name",
  "theme": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e", 
    "backgroundColor": "#ffffff",
    "textColor": "#333333"
  },
  "branding": {
    "logo": "data:image/svg+xml;base64,...",
    "favicon": "favicon.ico",
    "companyName": "Company Name"
  },
  "content": {
    "title": "Welcome Title",
    "subtitle": "Subtitle text",
    "heroImage": "data:image/svg+xml;base64,...",
    "description": "Company description",
    "features": [
      {
        "title": "Feature Name",
        "description": "Feature description", 
        "icon": "material_icon_name"
      }
    ]
  },
  "contact": {
    "phone": "+1-555-0000",
    "email": "contact@company.com",
    "address": "123 Main St, City, State 12345"
  }
}
```

## How It Works

### Tenant Detection

The application determines which tenant to load using:

1. **Query Parameter**: `?tenant=tenant1` in the URL
2. **Subdomain**: In production, tenants can be detected from subdomain (e.g., `tenant1.yourapp.com`)
3. **Default**: Falls back to `tenant1` for development

### Dynamic Theming

- CSS custom properties are updated dynamically based on tenant theme colors
- Page title and favicon are updated per tenant
- All styling adapts to tenant-specific color schemes

### Component Structure

- **TenantService**: Handles loading and caching tenant configurations
- **AppComponent**: Main component that renders tenant-specific content
- **Dynamic Templates**: Template uses Angular data binding to show tenant content

## Adding New Tenants

1. Create a new JSON file in `src/assets/tenants/` (e.g., `tenant4.json`)
2. Follow the configuration structure above
3. Use data URLs for logos and hero images, or add actual image files to assets
4. The tenant will be automatically available at `?tenant=tenant4`

## Customization

### Adding New Features

You can extend the tenant configuration by:
- Adding new properties to the JSON structure
- Updating the TypeScript interfaces in `src/app/models/tenant.interface.ts`
- Modifying the template in `src/app/app.component.html`

### Styling

- Global styles are in `src/styles.scss`
- Tailwind configuration is in `tailwind.config.js`
- Component-specific styles use Tailwind utility classes

## Build and Deploy

```bash
# Development build
npm run build

# Production build
npm run build --prod
```

## Technologies Used

- **Angular 16**: Frontend framework
- **Angular Material 16**: UI component library
- **Tailwind CSS 2.2.19**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript
- **RxJS**: Reactive programming library

---

*This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.*
