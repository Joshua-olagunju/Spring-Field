# 🚀 PRODUCTION GO-LIVE CHECKLIST

## Quick 3-Step Deployment

### Step 1: Get Flutterwave LIVE Credentials
- [ ] Log in to Flutterwave Dashboard
- [ ] Go to Settings → API
- [ ] Copy LIVE Public Key (starts with `FLWPUBK-`)
- [ ] Copy LIVE Secret Key (starts with `FLWSECK-`)
- [ ] Copy Webhook Secret Hash

### Step 2: Update Environment Files

**File: `backend/.env`** (4 changes)
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-paste_here-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-paste_here-X
FLUTTERWAVE_WEBHOOK_SECRET_HASH=paste_here
FLUTTERWAVE_ENVIRONMENT=live
```

**File: `.env`** (root folder - 1 change)
```env
VITE_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-paste_here-X"
```

### Step 3: Create Payment Plans & Update IDs

1. **Create 21 plans in Flutterwave** (see PRODUCTION_DEPLOYMENT_GUIDE.md for details)
2. **Update plan IDs in:** `backend/app/Http/Controllers/Api/PaymentController.php`
   - Lines 42-87: Landlord plans (6 IDs)
   - Lines 91-142: User plans (15 IDs)

---

## ✅ Post-Deployment Verification

- [ ] Clear Laravel cache: `php artisan config:clear`
- [ ] Rebuild frontend: `npm run build`
- [ ] Test with ₦100 payment
- [ ] Check database updated
- [ ] Verify in Flutterwave dashboard

---

## 🔴 IMPORTANT REMINDERS

1. **APP_DEBUG=false** in production `.env`
2. **APP_ENV=production** in production `.env`
3. **HTTPS must be enabled** on your domain
4. **Configure webhook URL** in Flutterwave:
   - `https://yourdomain.com/api/flutterwave/webhook`

---

## 📁 Files Summary

| File | Changes | What to Update |
|------|---------|----------------|
| `backend/.env` | 4 lines | Flutterwave credentials + environment |
| `.env` (root) | 1 line | Public key only |
| `PaymentController.php` | 21 plan IDs | Replace test IDs with live IDs |

**Total: 26 values to change**

---

## 🆘 Need Help?

See **PRODUCTION_DEPLOYMENT_GUIDE.md** for:
- Detailed instructions
- Troubleshooting guide
- Security checklist
- Full plan ID mapping

---

**Ready? Let's go live! 🎉**
