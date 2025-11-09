# 🧪 Testing Guide - Refresh Token System

## ✅ Hoàn thành
Đã tích hợp hoàn chỉnh hệ thống Refresh Token với các tính năng:

### 🔐 Backend (Node.js/Express)
- ✅ RefreshToken Model (MongoDB với TTL index)
- ✅ Token Generation (Access 15min + Refresh 30 days)
- ✅ Token Rotation (mỗi lần refresh tạo tokens mới)
- ✅ Login API trả về `{ accessToken, refreshToken, user }`
- ✅ Refresh API (POST /auth/refresh)
- ✅ Logout API (xóa refresh token khỏi DB)
- ✅ Logout All Devices API
- ✅ Google OAuth trả về cả 2 tokens

### 🎨 Frontend (React/TypeScript)
- ✅ Activity Tracker (idle timeout 15 phút)
- ✅ Axios Interceptor (auto-refresh on 401)
- ✅ LoginPage lưu cả 2 tokens (localStorage hoặc sessionStorage)
- ✅ Google OAuth callback xử lý cả 2 tokens
- ✅ App.tsx tích hợp đầy đủ
- ✅ handleLogout xóa cả 2 tokens

---

## 📋 Test Cases

### 1. **Test Login Flow**
**Steps:**
1. Mở DevTools → Application → Local Storage
2. Login với email/password
3. Kiểm tra có 2 tokens:
   - `token` (accessToken - 15 phút)
   - `refreshToken` (30 ngày)

**Expected:**
- ✅ Cả 2 tokens được lưu trong localStorage (nếu tick "Remember me")
- ✅ Hoặc sessionStorage (nếu không tick)
- ✅ User được redirect về home page

---

### 2. **Test Remember Me**
**Steps:**
1. Login với "Remember me" = checked
2. Kiểm tra localStorage
3. Đóng browser và mở lại
4. Kiểm tra còn logged in không

**Expected:**
- ✅ Tokens lưu trong localStorage (persistent)
- ✅ Sau khi đóng/mở lại browser vẫn còn logged in

---

### 3. **Test Activity Tracking**
**Steps:**
1. Login thành công
2. Mở Console (F12)
3. Di chuyển chuột, scroll, gõ phím
4. Quan sát logs

**Expected:**
- ✅ Log "🎯 User authenticated - starting activity tracker (15min idle timeout)"
- ✅ Không thấy lỗi nào trong console
- ✅ Activity được track (last activity time update)

---

### 4. **Test Auto Refresh (14 phút)**
**Để test nhanh, sửa tạm trong activityTracker.ts:**
```typescript
const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 phút thay vì 15
const REFRESH_INTERVAL = 1 * 60 * 1000; // 1 phút thay vì 14
```

**Steps:**
1. Sửa constants như trên
2. Login và đợi 1 phút (có activity)
3. Kiểm tra Console logs
4. Kiểm tra Network tab (F12)

**Expected:**
- ✅ Sau 1 phút, có request POST /auth/refresh
- ✅ Response trả về tokens mới
- ✅ localStorage được update với tokens mới
- ✅ Console log "✅ Token refreshed successfully"

---

### 5. **Test Idle Timeout (15 phút)**
**Để test nhanh, dùng settings ở Test 4:**

**Steps:**
1. Login
2. **KHÔNG** di chuyển chuột/scroll/gõ phím
3. Đợi 2 phút (idle timeout)
4. Kiểm tra console và state

**Expected:**
- ✅ Sau 2 phút không activity → auto logout
- ✅ Console log "⏰ User idle for 2 minutes - logging out"
- ✅ Tokens bị xóa khỏi localStorage
- ✅ User logout và redirect về home

---

### 6. **Test 401 Auto-Refresh**
**Steps:**
1. Login
2. Xóa `token` (accessToken) trong localStorage (giữ lại refreshToken)
3. Thực hiện action cần auth (vào Cart, Profile, etc.)
4. Kiểm tra Network tab

**Expected:**
- ✅ Request ban đầu fail với 401
- ✅ Tự động gọi POST /auth/refresh
- ✅ Lấy token mới
- ✅ Retry request ban đầu với token mới
- ✅ Request thành công

---

### 7. **Test Token Rotation**
**Steps:**
1. Login → lưu `refreshToken` ban đầu
2. Đợi auto-refresh (1 phút nếu dùng test settings)
3. So sánh `refreshToken` cũ và mới

**Expected:**
- ✅ `refreshToken` mới khác với cũ
- ✅ `accessToken` mới khác với cũ
- ✅ MongoDB xóa refresh token cũ
- ✅ MongoDB lưu refresh token mới

---

### 8. **Test Logout**
**Steps:**
1. Login thành công
2. Click Logout button
3. Kiểm tra localStorage và Network

**Expected:**
- ✅ Request POST /auth/logout với refreshToken
- ✅ Cả 2 tokens bị xóa khỏi localStorage/sessionStorage
- ✅ MongoDB xóa refresh token
- ✅ Activity tracker cleanup (logs "🔴 Activity tracker cleaned up")
- ✅ Redirect về home

---

### 9. **Test Google OAuth**
**Steps:**
1. Click "Sign in with Google"
2. Hoàn thành OAuth flow
3. Kiểm tra callback URL và localStorage

**Expected:**
- ✅ URL có params: `?accessToken=...&refreshToken=...&user=...`
- ✅ Cả 2 tokens được lưu trong localStorage
- ✅ User logged in thành công
- ✅ URL params bị xóa sau khi xử lý

---

### 10. **Test Logout All Devices**
**Steps:**
1. Login trên nhiều tabs/browsers (hoặc giả lập)
2. Gọi API: POST /auth/logout-all (với Bearer token)
3. Kiểm tra DB và test refresh

**Expected:**
- ✅ Tất cả refresh tokens của user bị xóa khỏi DB
- ✅ Các tabs khác không thể refresh token nữa
- ✅ Phải login lại tất cả các nơi

---

## 🐛 Common Issues & Solutions

### Issue 1: "Refresh token not found"
**Cause:** refreshToken không được lưu sau login
**Solution:** Kiểm tra LoginPage có lưu `refreshToken` không

### Issue 2: "Cannot read token from storage"
**Cause:** axiosInterceptor đọc sai key
**Solution:** Đảm bảo key là `'token'` và `'refreshToken'`

### Issue 3: Activity tracker không chạy
**Cause:** useEffect dependency sai
**Solution:** Kiểm tra App.tsx có `[user]` dependency không

### Issue 4: 401 vẫn xảy ra sau refresh
**Cause:** Retry request không update token mới
**Solution:** Kiểm tra `failedQueue` có process đúng không

---

## 📊 Backend Verification

### Check MongoDB for Refresh Tokens:
```javascript
// In MongoDB shell or Compass
db.refreshtokens.find({ user: ObjectId("USER_ID") })
```

**Expected:**
- ✅ Mỗi device/session có 1 refresh token
- ✅ Token có `expiresAt` = 30 ngày sau `createdAt`
- ✅ Sau logout → token bị xóa

### Check TTL Index:
```javascript
db.refreshtokens.getIndexes()
```

**Expected:**
- ✅ Có index `{ expiresAt: 1 }` với `expireAfterSeconds: 0`
- ✅ MongoDB tự động xóa expired tokens

---

## 🎯 Production Checklist

Trước khi deploy:
- [ ] Đổi lại `IDLE_TIMEOUT = 15 * 60 * 1000` (15 phút)
- [ ] Đổi lại `REFRESH_INTERVAL = 14 * 60 * 1000` (14 phút)
- [ ] Kiểm tra JWT_SECRET đủ mạnh (ít nhất 32 ký tự)
- [ ] Đảm bảo HTTPS trong production (tokens không bị lộ)
- [ ] Test token rotation đang hoạt động
- [ ] Test logout all devices
- [ ] Verify TTL index trong MongoDB
- [ ] Remove console.logs (hoặc dùng proper logger)
- [ ] Test cross-browser compatibility
- [ ] Test mobile responsiveness

---

## 📝 Notes

1. **Idle Timeout:** Đếm từ lúc user KHÔNG hoạt động, không phải từ lúc login
2. **Auto Refresh:** Chạy mỗi 14 phút NẾU user còn active (không idle)
3. **Token Rotation:** Mỗi lần refresh tạo tokens hoàn toàn mới (security best practice)
4. **Remember Me:** Quyết định lưu localStorage (persistent) hay sessionStorage (session-only)
5. **Cleanup:** Activity tracker tự cleanup khi user logout hoặc component unmount

---

## 🚀 Next Steps

1. Test tất cả các cases trên
2. Fix bugs nếu có
3. Deploy lên staging để test thêm
4. Monitor logs trong production
5. Consider thêm features:
   - Session indicator UI (time remaining)
   - Toast notification "Session expiring soon"
   - Biometric authentication cho mobile
   - Rate limiting cho refresh endpoint
