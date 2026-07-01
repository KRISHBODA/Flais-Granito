# Cloudflare R2 Setup Guide

Migrate from local/Cloudinary video storage to **Cloudflare R2** (S3-compatible object storage).

---

## 📋 What You Need

1. **Cloudflare Account** with R2 enabled
2. **R2 API Credentials** (access keys)
3. **R2 Bucket** created
4. **Custom Domain** (optional, but recommended)

---

## Step 1: Create R2 Bucket in Cloudflare

### 1.1 Go to Cloudflare Dashboard
- Visit: https://dash.cloudflare.com/
- Select your account
- Navigate to: **R2 Object Storage** (left sidebar)

### 1.2 Create New Bucket
- Click **Create Bucket**
- Bucket Name: `flais-granito-videos` (or your preferred name)
- Region: Select closest to your users
- Click **Create Bucket**

### 1.3 Get Bucket Details
- In bucket settings, find:
  - **Bucket Name**: `flais-granito-videos`
  - **Account ID**: Visible in R2 overview

---

## Step 2: Generate R2 API Credentials

### 2.1 Create API Token
- Go to: **R2** → **Settings** → **API Tokens**
- Click **Create API Token**
- Set permissions:
  - ✅ **Edit** (allow PUT, DELETE operations)
  - ✅ **Read** (allow GET operations)
- Apply to: **All Buckets** (or specific bucket)
- Click **Create Token**

### 2.2 Copy Credentials
You'll get:
- **Access Key ID**: `xxxxxxxxxxxxxxxxxxxxxxxx`
- **Secret Access Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**⚠️ Save these immediately! You won't see them again.**

---

## Step 3: Create Custom Domain (Optional but Recommended)

### 3.1 Add Public URL
- Go to bucket **Settings** → **CORS**
- Or go to **Settings** → **Custom Domains**
- Add custom domain: `videos.yourdomain.com` or use R2 default URL

### 3.2 R2 Default URL Format
```
https://<bucket-name>.<account-id>.r2.cloudflarestorage.com
```

**Example:**
```
https://flais-granito-videos.abc123def456.r2.cloudflarestorage.com
```

---

## Step 4: Update Backend .env

Add these variables to `/backend/.env`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=flais-granito-videos
R2_PUBLIC_URL=https://flais-granito-videos.abc123def456.r2.cloudflarestorage.com

# Optional: Custom domain
# R2_PUBLIC_URL=https://videos.yourdomain.com
```

### Example `.env` File:
```env
PORT=8000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_here

# Cloudinary (keep for backward compatibility)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudflare R2 (NEW)
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=flais-granito-videos
R2_PUBLIC_URL=https://flais-granito-videos.abc123def456.r2.cloudflarestorage.com
```

---

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

This installs: `@aws-sdk/client-s3`

---

## Step 6: Test R2 Connection

Create a test file `/backend/test-r2.js`:

```javascript
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function testR2() {
  try {
    console.log("🧪 Testing R2 connection...");
    
    // List existing objects
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 5,
    });
    
    const listResult = await r2Client.send(listCommand);
    console.log("✅ R2 connection successful!");
    console.log("Bucket:", process.env.R2_BUCKET_NAME);
    console.log("Objects in bucket:", listResult.Contents?.length || 0);
    
    // Test upload
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: "test/connection-test.txt",
      Body: "Test file from Node.js",
      ContentType: "text/plain",
    });
    
    await r2Client.send(uploadCommand);
    console.log("✅ Test file uploaded successfully!");
    console.log(`URL: ${process.env.R2_PUBLIC_URL}/test/connection-test.txt`);
    
  } catch (error) {
    console.error("❌ R2 connection failed:", error.message);
    process.exit(1);
  }
}

testR2();
```

Run test:
```bash
node test-r2.js
```

Expected output:
```
🧪 Testing R2 connection...
✅ R2 connection successful!
Bucket: flais-granito-videos
Objects in bucket: 0
✅ Test file uploaded successfully!
URL: https://flais-granito-videos.abc123def456.r2.cloudflarestorage.com/test/connection-test.txt
```

---

## Step 7: Update Frontend to Use R2 Endpoints

### Update Admin Upload API Calls

Before (using local):
```javascript
const response = await api.post('/api/admin/upload-file', formData);
```

After (using R2):
```javascript
const response = await api.post('/api/admin/upload-video-r2', formData);
```

### All R2 Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/upload-video-r2` | POST | Upload video to R2 |
| `/api/admin/upload-image-r2` | POST | Upload image to R2 |
| `/api/admin/delete-r2-file` | DELETE | Delete file from R2 |
| `/api/admin/r2-config` | GET | Get R2 config status |

### Example: Upload Video to R2

```javascript
import api from '@/utils/api';

const handleVideoUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/admin/upload-video-r2', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${progress}%`);
      },
    });

    if (response.data.success) {
      const { fileUrl, r2Key } = response.data;
      console.log('Video uploaded to R2:', fileUrl);
      return fileUrl;
    }
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Example: Delete from R2

```javascript
const handleDelete = async (r2Key) => {
  try {
    const response = await api.delete('/api/admin/delete-r2-file', {
      data: { r2Key }
    });

    if (response.data.success) {
      console.log('File deleted from R2');
    }
  } catch (error) {
    console.error('Delete failed:', error.message);
  }
};
```

---

## Step 8: Enable CORS (If Needed)

If uploading directly from browser (not recommended), enable CORS:

### Cloudflare Dashboard → R2 → Bucket Settings → CORS

Add:
```json
[
  {
    "allowedOrigins": ["https://yourdomain.com", "https://admin.yourdomain.com"],
    "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "allowedHeaders": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

---

## Step 9: Migrate Existing Videos (Optional)

To move videos from local to R2:

### 9.1 Create Migration Script

Create `/backend/scripts/migrate-to-r2.js`:

```javascript
const fs = require("fs");
const path = require("path");
const { uploadToR2 } = require("../middleware/r2Upload");
require("dotenv").config();

async function migrateVideos() {
  const videosDir = path.join(__dirname, "../uploads/videos");
  
  if (!fs.existsSync(videosDir)) {
    console.log("No local videos directory found");
    return;
  }

  const files = fs.readdirSync(videosDir);
  console.log(`Found ${files.length} videos to migrate`);

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
      console.log(`✅ Migrated: ${file} → ${result.url}`);
      
      // Optional: Delete after successful upload
      // fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`❌ Failed to migrate ${file}:`, error.message);
    }
  }

  console.log("Migration complete!");
}

migrateVideos();
```

### 9.2 Run Migration

```bash
node scripts/migrate-to-r2.js
```

---

## Pricing & Limits

### R2 Pricing
- **Storage**: $0.015/GB/month
- **Class A Requests**: $4.50/million
- **Class B Requests**: $0.36/million
- **First 10GB free per month**

### Limits
- **Max file size**: 5TB
- **Max bucket size**: Unlimited
- **Request rate**: 1000+ requests/second

---

## Troubleshooting

### "R2 configuration missing"
Check `.env` file has all R2 variables.

### "InvalidAccessKeyId"
- Verify R2_ACCESS_KEY_ID is correct
- Regenerate credentials in Cloudflare dashboard

### "InvalidBucketName"
- Bucket name must match exactly
- No uppercase letters

### Slow uploads?
- Try different R2 region
- Use chunked uploads for large files

### CORS errors?
- Enable CORS in bucket settings
- Add your domain to allowed origins

---

## Keep Both Systems Running

For backward compatibility, you can keep both:

```javascript
// Old endpoint (local/Cloudinary)
POST /api/admin/upload-file

// New endpoint (R2)
POST /api/admin/upload-video-r2
```

Admin can choose which to use.

---

## Best Practices

✅ **DO:**
- Use R2 for video storage (cheaper than Cloudinary)
- Keep backups of important files
- Monitor R2 usage in Cloudflare dashboard
- Use custom domain for better branding
- Set lifecycle rules to delete old test files

❌ **DON'T:**
- Expose R2 credentials in frontend code
- Use same API token for multiple buckets
- Delete buckets without backing up files
- Use root Cloudflare credentials

---

## Security

### Restrict API Token Permissions

1. Create token with minimal permissions
2. Set token expiration (90 days recommended)
3. Regenerate credentials quarterly
4. Never commit `.env` to git

### Bucket Policy (Example)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudflare:root"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::flais-granito-videos/*"
    }
  ]
}
```

---

## Useful Commands

```bash
# Test R2 connection
node test-r2.js

# Migrate existing videos
node scripts/migrate-to-r2.js

# Check R2 bucket contents
aws s3 ls s3://flais-granito-videos --profile r2

# List files by date
aws s3 ls s3://flais-granito-videos --recursive --human-readable --summarize --profile r2
```

---

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/r2/
- **AWS SDK**: https://docs.aws.amazon.com/sdk-for-javascript/
- **Troubleshooting**: https://developers.cloudflare.com/r2/troubleshooting/

---

**Setup complete!** 🎉 Your videos are now stored in Cloudflare R2.
