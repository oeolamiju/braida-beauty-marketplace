# Content Management System Guide

## Overview

The Braida Beauty Marketplace now includes a comprehensive Content Management System (CMS) that allows administrators to manage all static content, policies, FAQs, and safety resources directly from the admin console.

## Features

### 1. **Content Pages Management**
Administrators can create, edit, and manage static pages including:
- Terms of Service
- Privacy Policy  
- Community Guidelines
- Safety Tips
- Help Center articles
- And any other custom pages

**Features:**
- Rich text editor with Markdown support
- Version history tracking
- Publish/Draft status control
- SEO meta descriptions
- Content categorization
- Preview before publishing

**Access:** Admin Portal → Content

### 2. **FAQ Management**
Manage frequently asked questions organized by category.

**Categories:**
- General
- Booking
- Payment
- Freelancer
- Safety
- Custom categories

**Features:**
- Add, edit, delete FAQ items
- Drag-and-drop ordering
- Category-based organization
- Active/Inactive toggle
- Real-time search and filtering

**Access:** Admin Portal → FAQs

### 3. **Safety Resources Management**
Manage emergency contacts and safety resources displayed to users.

**Resource Types:**
- Emergency services
- Hotlines
- Support websites
- Community resources

**Features:**
- Phone number and URL management
- Emergency resource flagging
- Custom display ordering
- Active/Inactive status
- Resource categorization

**Access:** Admin Portal → Safety Resources

## Admin Access

### Navigation
1. Log in with admin credentials
2. Navigate to Admin Portal
3. Click on "Content" tile to access content management
4. Choose from:
   - **Content Pages** - Manage static pages
   - **FAQs** - Manage FAQ items
   - **Safety Resources** - Manage safety contacts

### Content Pages

#### Creating a New Page
1. Click "New Page"
2. Enter:
   - **Slug** - URL-friendly identifier (e.g., `terms-of-service`)
   - **Title** - Page title
   - **Content** - Page content using Markdown
   - **Meta Description** - SEO description
   - **Category** - Content category (legal, community, safety, help, about)
   - **Published** - Toggle to make page live
3. Click "Save"

#### Editing a Page
1. Click "Edit" button on the page card
2. Modify any fields
3. Changes create a new version automatically
4. Click "Save" to publish changes

#### Publishing/Unpublishing
- Use the eye icon toggle to publish or unpublish pages
- Unpublished pages are only visible to admins

### FAQs

#### Adding FAQ Items
1. Click "New FAQ"
2. Enter:
   - **Category** - FAQ category
   - **Question** - The question text
   - **Answer** - Detailed answer
   - **Display Order** - Number for sorting (lower = higher priority)
   - **Active** - Toggle visibility
3. Click "Save"

#### Managing FAQs
- FAQs are automatically grouped by category
- Use display order to control how FAQs appear
- Edit or delete using the action buttons

### Safety Resources

#### Adding Safety Resources
1. Click "New Resource"
2. Enter:
   - **Title** - Resource name
   - **Description** - Brief description
   - **Resource Type** - emergency, hotline, website, support
   - **Phone Number** - Contact number (optional)
   - **URL** - Website link (optional)
   - **Emergency Resource** - Flag for priority display
   - **Display Order** - Sorting priority
   - **Active** - Toggle visibility
3. Click "Save"

## Frontend Integration

### Fetching Content

Content is automatically fetched and displayed on the frontend:

- **Terms Page** (`/terms`) - Displays `terms-of-service` page
- **Privacy Page** (`/privacy`) - Displays `privacy-policy` page  
- **Help Center** (`/help`) - Displays all active FAQs
- **Safety Pages** - Display safety tips and resources

### Custom Pages

To add a new custom page:

1. Create the page in the admin console with a unique slug
2. Add a route in `/frontend/App.tsx`:
```tsx
<Route path="/my-page" element={<MyCustomPage />} />
```

3. Create the page component to fetch content:
```tsx
import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { ContentPage } from "~backend/content/types";

export default function MyCustomPage() {
  const [content, setContent] = useState<ContentPage | null>(null);

  useEffect(() => {
    backend.content.getPage({ slug: "my-custom-slug" })
      .then(response => setContent(response.page));
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: content?.content || "" }} />
  );
}
```

## API Endpoints

### Content Pages
- `GET /content/pages` - List all pages
- `GET /content/pages/:slug` - Get page by slug
- `POST /admin/content/pages` - Create page (admin only)
- `PATCH /admin/content/pages/:id` - Update page (admin only)
- `DELETE /admin/content/pages/:id` - Delete page (admin only)

### FAQs
- `GET /content/faqs` - List all FAQs
- `POST /admin/content/faqs` - Create FAQ (admin only)
- `PATCH /admin/content/faqs/:id` - Update FAQ (admin only)
- `DELETE /admin/content/faqs/:id` - Delete FAQ (admin only)

### Safety Resources
- `GET /content/safety-resources` - List all resources
- `POST /admin/content/safety-resources` - Create resource (admin only)
- `PATCH /admin/content/safety-resources/:id` - Update resource (admin only)
- `DELETE /admin/content/safety-resources/:id` - Delete resource (admin only)

## Database Schema

### content_pages
- `id` - UUID primary key
- `slug` - Unique URL identifier
- `title` - Page title
- `content` - HTML/Markdown content
- `meta_description` - SEO description
- `category` - Content category
- `is_published` - Published status
- `version` - Version number
- `created_at`, `updated_at`, `published_at`
- `last_edited_by` - Admin user ID

### content_versions
- Version history for all content changes
- Links to `content_pages`

### faq_items
- `id` - UUID primary key
- `category` - FAQ category
- `question` - Question text
- `answer` - Answer text
- `display_order` - Sort order
- `is_active` - Active status
- `created_at`, `updated_at`

### safety_resources
- `id` - UUID primary key
- `title` - Resource title
- `description` - Resource description
- `resource_type` - Type of resource
- `url` - Website URL (optional)
- `phone_number` - Contact number (optional)
- `is_emergency` - Emergency flag
- `display_order` - Sort order
- `is_active` - Active status
- `created_at`, `updated_at`

## Best Practices

1. **Use Markdown** - Content supports Markdown formatting for better readability
2. **Version Control** - All changes are versioned automatically
3. **Preview First** - Use the preview tab before publishing
4. **SEO Optimization** - Always add meta descriptions for better search visibility
5. **Keep FAQs Updated** - Regularly review and update FAQ content
6. **Emergency Resources** - Keep emergency contact information current and verified
7. **Content Categories** - Use consistent categorization for better organization
8. **Mobile Friendly** - All content is automatically responsive

## Troubleshooting

### Content Not Displaying
- Check if the page is marked as "Published"
- Verify the slug matches the frontend route
- Clear browser cache

### Permission Denied
- Ensure you're logged in as an admin
- Check that your role is set to "ADMIN"

### Changes Not Appearing
- Content changes are immediate
- If using a CDN, you may need to invalidate the cache
- Hard refresh the browser (Ctrl+F5)

## Future Enhancements

Potential future features:
- Rich media uploads (images, videos)
- Content scheduling
- Multi-language support
- Content approval workflows
- Analytics integration
- A/B testing capabilities
- Template library
- Bulk import/export
