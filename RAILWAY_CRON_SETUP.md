# Railway Cron Jobs Setup

Railway doesn't support cron jobs directly in the `railway.json` file. Instead, you have several options:

## Option 1: Use Railway's Cron Service (Recommended)

Railway now offers a separate Cron service. Here's how to set it up:

1. **In your Railway dashboard:**
   - Go to your project
   - Click "New Service" 
   - Select "Cron"
   - Configure your cron jobs there

2. **Add these cron jobs:**

   **Morning Manifest (4 AM PST / 11 AM UTC):**
   - Schedule: `0 11 * * *`
   - Command: 
   ```
   curl -X GET https://ppav02-production.up.railway.app/api/cron/send-manifest \
     -H "Authorization: Bearer cron_secret_2025_secure_random_string_xyz789"
   ```

   **Afternoon Manifest (4 PM PST / 11 PM UTC):**
   - Schedule: `0 23 * * *`
   - Command:
   ```
   curl -X GET https://ppav02-production.up.railway.app/api/cron/send-afternoon-manifest \
     -H "Authorization: Bearer cron_secret_2025_secure_random_string_xyz789"
   ```

## Option 2: Use GitHub Actions (Free)

Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Daily Manifests

on:
  schedule:
    # 4 AM PST (11 AM UTC)
    - cron: '0 11 * * *'
    # 4 PM PST (11 PM UTC)  
    - cron: '0 23 * * *'

jobs:
  send-manifest:
    runs-on: ubuntu-latest
    steps:
      - name: Determine which manifest to send
        id: manifest-type
        run: |
          hour=$(date -u +%H)
          if [ "$hour" = "11" ]; then
            echo "endpoint=send-manifest" >> $GITHUB_OUTPUT
          else
            echo "endpoint=send-afternoon-manifest" >> $GITHUB_OUTPUT
          fi
      
      - name: Send manifest email
        run: |
          curl -X GET https://ppav02-production.up.railway.app/api/cron/${{ steps.manifest-type.outputs.endpoint }} \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Then add your `CRON_SECRET` to GitHub repository secrets.

## Option 3: Use External Cron Service (cron-job.org)

1. Sign up at [cron-job.org](https://cron-job.org) (free tier available)

2. Create two cron jobs:

   **Morning Manifest:**
   - URL: `https://ppav02-production.up.railway.app/api/cron/send-manifest`
   - Schedule: `0 4 * * *` (adjust for your timezone)
   - Request Method: GET
   - Custom Headers: `Authorization: Bearer cron_secret_2025_secure_random_string_xyz789`

   **Afternoon Manifest:**
   - URL: `https://ppav02-production.up.railway.app/api/cron/send-afternoon-manifest`
   - Schedule: `0 16 * * *` (adjust for your timezone)
   - Request Method: GET
   - Custom Headers: `Authorization: Bearer cron_secret_2025_secure_random_string_xyz789`

## Environment Variables

Make sure these are set in Railway:

```env
# Your cron secret (must match what you use in the cron service)
CRON_SECRET=cron_secret_2025_secure_random_string_xyz789

# Google Gmail API credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
GOOGLE_EMAIL_FROM=your-email@gmail.com

# Your app URL
NEXTAUTH_URL=https://ppav02-production.up.railway.app
```

## Testing

Test manually to ensure everything works:

```bash
# Test morning manifest
curl -X GET https://ppav02-production.up.railway.app/api/cron/send-manifest \
  -H "Authorization: Bearer cron_secret_2025_secure_random_string_xyz789"

# Test afternoon manifest  
curl -X GET https://ppav02-production.up.railway.app/api/cron/send-afternoon-manifest \
  -H "Authorization: Bearer cron_secret_2025_secure_random_string_xyz789"
```

## Monitoring

Check your Railway logs for:
- `[CRON] Morning manifest sent successfully`
- `[CRON] Afternoon manifest sent successfully`
- `[Google Email] Email sent successfully`

## Troubleshooting

1. **401 Unauthorized**: Check that CRON_SECRET matches in both Railway env vars and your cron service
2. **No emails sent**: Verify users have `sendDailyManifest` or `sendAfternoonManifest` enabled
3. **Gmail API errors**: Check Google credentials are set correctly in Railway