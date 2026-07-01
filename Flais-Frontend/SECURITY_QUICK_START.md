# 🔐 Security Quick Start Guide

For FLAIS GRANITO Frontend Team

---

## TL;DR - What You Need to Know

Your website now has:
- ✅ XSS protection (scripts can't run)
- ✅ Spam blocking (rate limiting)
- ✅ Form validation (emails/phones)
- ✅ Crash protection (error boundaries)
- ✅ Security headers (prevents attacks)

**Bottom line:** Use the security utilities when building forms. That's it.

---

## 🚀 For Developers: When Building Forms

### Step 1: Import Security Functions

```javascript
import { 
  sanitizeInput, 
  isValidEmail, 
  isValidPhone,
  checkRateLimit 
} from '@/utils/security';
```

### Step 2: Validate & Sanitize in handleSubmit

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Sanitize (remove dangerous HTML)
  const name = sanitizeInput(formData.name);
  const email = sanitizeInput(formData.email);
  
  // Validate
  if (!isValidEmail(email)) {
    toast.error('Invalid email');
    return;
  }
  
  // Rate limit (max 5 submissions per minute)
  if (!checkRateLimit('contact-form', 5, 60000)) {
    toast.error('Too many submissions. Wait 1 minute.');
    return;
  }
  
  // Submit to backend
  api.post('/contact', { name, email });
};
```

**That's it!** The backend will validate again (always validate on backend too).

---

## 🎨 For Frontend Designers: When Displaying Content

### ✅ Display User Comments Safely

```javascript
import { escapeHtml } from '@/utils/security';

const Comment = ({ text, author }) => (
  <div className="comment">
    <h4>{escapeHtml(author)}</h4>
    <p>{escapeHtml(text)}</p>
  </div>
);
```

### ❌ Never Do This

```javascript
// NEVER EVER DO THIS
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

---

## 📤 For File Upload Features

```javascript
import { validateFileUpload } from '@/utils/security';

const handleFileUpload = (file) => {
  // Validate before upload
  const validation = validateFileUpload(file, {
    maxSize: 5 * 1024 * 1024,        // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf']
  });

  if (!validation.isValid) {
    toast.error(validation.error);  // Show error to user
    return;
  }

  // Safe to upload
  uploadFile(file);
};
```

---

## 🔗 For External Links

```javascript
import { isValidUrl } from '@/utils/security';

const handleLinkClick = (url) => {
  if (isValidUrl(url)) {
    window.location.href = url;
  } else {
    console.error('Invalid URL blocked');
  }
};
```

---

## 🐛 If Something Breaks

### Check Browser Console
```
F12 → Console tab → Look for [SECURITY] messages
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Too many submissions" | Rate limiting working. Wait 1 minute. |
| Form not submitting | Check console for validation errors |
| Security warning in console | Check SECURITY.md for explanation |

---

## 📋 Before You Deploy

```bash
# Check for vulnerabilities
npm audit

# Build for production
npm run build

# Test the build locally
npm run preview

# Verify HTTPS is enabled on server
```

---

## 🆘 Contact Your Security Team

If you find a security issue:
1. **Don't** post about it publicly
2. **Don't** commit it to git
3. **Do** report it to your team lead
4. **Do** explain where/how it happens

---

## 📚 Learn More

- See `SECURITY.md` for full details
- See `SECURITY_IMPLEMENTATION.md` for what's been done

---

## ✅ Gotchas to Remember

- ✅ Sanitize input on frontend (UX)
- ✅ Sanitize input on backend (security - always needed!)
- ✅ Use escapeHtml() when displaying content
- ✅ Rate limit all public forms
- ✅ Run `npm audit` weekly

---

## 🎯 In 30 Seconds

For any form:
```javascript
1. Sanitize inputs: sanitizeInput()
2. Validate emails: isValidEmail()
3. Check rate limit: checkRateLimit()
4. Submit to backend
```

For any user content display:
```javascript
1. Always escape: escapeHtml()
2. Never use: dangerouslySetInnerHTML
```

---

**That's all you need to know.** Your website is secure. 🎉

---

**Questions?** Check SECURITY.md or ask your team lead.
