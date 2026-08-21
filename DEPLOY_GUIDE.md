# 🚀 Deployment Guide / Render සහ Vercel වල Host කරන ආකාරය

මෙම Project එක **Render** සහ **Vercel** වල පහසුවෙන් host කරගත හැකි ආකාරය පහත දැක්වේ.

---

## 📌 පියවර 1: MongoDB Atlas Network Access සකස් කිරීම (අත්‍යවශ්‍යයි!)

Render cloud එකෙන් ඔබගේ MongoDB database එකට connect වීමට නම්:
1. [MongoDB Atlas](https://cloud.mongodb.com) එකට Login වන්න.
2. වම් පැත්තේ menu එකෙන් **Network Access** තෝරන්න.
3. **+ Add IP Address** click කරන්න.
4. **Allow Access from Anywhere (`0.0.0.0/0`)** තෝරා **Confirm** කරන්න.

---

## 🟢 පියවර 2: Backend එක Render හි Host කිරීම

### 1. Render වෙත යාම
1. [Render.com](https://render.com) වෙත ගොස් නොමිලේ Account එකක් සාදා ගන්න හෝ Login වන්න.
2. Dashboard එකෙහි **New +** -> **Web Service** click කරන්න.
3. ඔබගේ GitHub repo එක connect කරන්න (`lions-engineering-rent-tool-system`).

### 2. Service Settings ලබා දීම
- **Name**: `lions-engineering-backend` (හෝ කැමති නමක්)
- **Region**: Singapore / Frankfurt (ඔබට ආසන්න එකක්)
- **Branch**: `main`
- **Root Directory**: *(හිස්ව තබන්න - Leave blank)*
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node backend/server.js`
- **Instance Type**: `Free`

### 3. Environment Variables ඇතුළත් කිරීම (Render Dashboard)
**Environment Variables** tab එකට ගොස් පහත values එක් කරන්න:
- `MONGODB_URI` = `mongodb+srv://wvimaya_db_user:wvimayA123@cluster0.u0dlc31.mongodb.net/lions_engineering?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET` = `lions_engineering_jwt_secret_key_2026`
- `NODE_ENV` = `production`

### 4. Deploy කිරීම
- **Create Web Service** / **Deploy** click කරන්න.
- Deploy වූ පසු ඉහළින් ඔබගේ Backend Live URL එක ලැබේ (උදා: `https://lions-engineering-backend.onrender.com`).
- එම URL එක copy කරගන්න!

---

## ⚡ පියවර 3: Frontend එක Vercel හි Host කිරීම

### 1. Backend URL එක Frontend එකට සම්බන්ධ කිරීම
ඔබේ Project එකේ `frontend/js/config.js` file එක open කර Render වෙතින් ලැබුණු Backend URL එක ඇතුළත් කරන්න:
```javascript
window.API_BASE = 'https://ඔබගේ-render-backend-url.onrender.com/api';
```
*(GitHub වෙත Commit & Push කරන්න)*

### 2. Vercel වෙත Deploy කිරීම
1. [Vercel.com](https://vercel.com) වෙත ගොස් Login වන්න.
2. **Add New...** -> **Project** click කරන්න.
3. ඔබගේ GitHub repo එක තෝරා **Import** කරන්න.
4. **Configure Project** කොටසේ:
   - **Framework Preset**: `Other`
   - **Root Directory**: `frontend` (Edit click කර `frontend` folder එක තෝරන්න)
5. **Deploy** button එක click කරන්න.

🎉 තත්පර කිහිපයකින් ඔබගේ Frontend එක Vercel හි Live වනු ඇත! (උදා: `https://lions-engineering.vercel.app`).

---

## 💡 විකල්ප ක්‍රමය (Option 2): සම්පූර්ණ App එකම Render හි Free Host කිරීම (Fullstack Single Service)

Backend එක සහ Frontend එක දෙකම එකම Render Web Service එකක් ලෙසද ක්‍රියාත්මක වේ. 
Render හි Web Service එක සාදා ඉහත **පියවර 2** පමණක් සිදු කළ විට, Render URL එකෙන් (`https://lions-engineering-backend.onrender.com`) සම්පූර්ණ Frontend dashboard එක සහ Backend එක එකවරම Open වේ!
