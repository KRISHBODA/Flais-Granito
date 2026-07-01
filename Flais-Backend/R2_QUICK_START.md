# ⚡ Cloudflare R2 Quick Start

Get videos in R2 in 5 minutes.

---

## What You Need to Add to `.env`

```env
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=flais-granito-videos
R2_PUBLIC_URL=https://flais-granito-videos.your_account_id.r2.cloudflarestorage.com
```

---

## Where to Get These Values

### 1. Account ID & Create Credentials

1. Go to: https://dash.cloudflare.com/
2. Left sidebar → **R2 Object Storage**
3. Click **Create Bucket** (if you haven't)
   - Name: `flais-granito-videos`
   - Region: Choose closest to you
4. In R2 Overview, copy **Account ID**

### 2. Create API Token

1. Go to: R2 → **Settings** → **API Tokens** → **Create API Token**
2. Permissions: Check **Edit** + **Read**
3. Scope: **All Buckets**
4. Click **Create Token**
5. Copy:
   - Access Key ID
   - Secret Access Key

### 3. R2_PUBLIC_URL

Use this format:
```
https://<bucket-name>.<account-id>.r2.cloudflarestorage.com
```

Example:
```
https://flais-granito-videos.abc123def456.r2.cloudflarestorage.com
```

---

## Installation & Testing

### Install AWS SDK
```bash
cd backend
npm install
```

### Test Connection
```bash
node test-r2.js
```

Expected output:
```
✅ R2 connection successful!
✅ Test file uploaded successfully!
URL: https://flais-granito-videos.abc123.r2.cloudflarestorage.com/test/connection-test.txt
```

---

## API Endpoints

### Upload Video
```bash
POST /api/admin/upload-video-r2
```

```javascript
const formData = new FormData();
formData.append('file', videoFile);

const response = await api.post('/api/admin/upload-video-r2', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Response:
// {
//   success: true,
//   fileUrl: "https://...",
//   r2Key: "videos/123456-filename.mp4",
//   size: 123456
// }
```

### Upload Image
```bash
POST /api/admin/upload-image-r2
```

### Delete File
```bash
DELETE /api/admin/delete-r2-file
Body: { r2Key: "videos/123-filename.mp4" }
```

### Get R2 Status
```bash
GET /api/admin/r2-config
```

Returns:
```json
{
  "success": true,
  "r2Configured": true,
  "bucketName": "flais-granito-videos",
  "publicUrl": "https://..."
}
```

---

## Migration Guide

### Move Existing Videos to R2

Create `/backend/scripts/migrate-to-r2.js`:

```javascript
const fs = require("fs");
const path = require("path");
const { uploadToR2 } = require("../middleware/r2Upload");
require("dotenv").config();

async function migrateVideos() {
  const videosDir = path.join(__dirname, "../uploads/videos");
  const files = fs.readdirSync(videosDir);
  
  console.log(`Migrating ${files.length} videos...`);

  for (const file of files) {
    try {
      const filePath = path.join(videosDir, file);
      const buffer = fs.readFileSync(filePath);
      
      const mockFile = {
        buffer,
        originalname: file,
        mimetype: "video/mp4",
        size: buffer.length,
      };

      const result = await uploadToR2(mockFile, "videos");
      console.log(`✅ ${file} → ${result.url}`);
    } catch (error) {
      console.error(`❌ ${file}: ${error.message}`);
    }
  }
}

migrateVideos();
```

Run:
```bash
node scripts/migrate-to-r2.js
```

---

## Frontend Implementation

### Replace Upload Endpoint

**Before:**
```javascript
await api.post('/api/admin/upload-file', formData);
```

**After:**
```javascript
await api.post('/api/admin/upload-video-r2', formData);
```

### Example Component

```javascript
import { useState } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function VideoUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/admin/upload-video-r2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      if (response.data.success) {
        toast.success('Video uploaded to R2!');
        console.log('Video URL:', response.data.fileUrl);
        // Use response.data.fileUrl in your database
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="video/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading: {progress}%</p>}
    </div>
  );
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "R2 configuration missing" | Check all R2 env vars are set |
| "InvalidAccessKeyId" | Regenerate API token in Cloudflare |
| "NoSuchBucket" | Bucket name must match exactly |
| "Connection timeout" | Check R2_ACCOUNT_ID format |
| No upload progress | Server is uploading to R2 (be patient) |

---

## Cost Comparison

| Storage | Price/GB/month | Good for |
|---------|----------------|----------|
| **R2** | $0.015 | Videos (cheapest) |
| **Cloudinary** | $0.10+ | Images + videos |
| **Local** | Server cost | Small files only |

---

## Keep Existing System

You can keep both endpoints:
- `/api/admin/upload-file` (local/Cloudinary) - Old
- `/api/admin/upload-video-r2` (R2) - New

---

## Done! 🎉

Your backend is now ready for R2 uploads. 

Next:
1. Update frontend to use `/api/admin/upload-video-r2`
2. Test with small video first
3. Migrate existing videos (optional)
4. Celebrate! 🚀

---

For detailed setup: See `R2_SETUP.md`
