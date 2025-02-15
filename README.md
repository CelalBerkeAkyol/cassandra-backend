# **Data Science & ML Blog Backend**

## **📌 Proje Açıklaması**

Bu proje, **Data Science** ve **Makine Öğrenmesi** alanındaki içerikleri yönetmek için oluşturulmuş bir **blog backend API'sidir**. **RESTful API** mimarisini kullanarak, kullanıcıların blog içeriklerini yönetmesini, kategorilere ayırmasını ve yorum yapmasını sağlar.

> **Not:** Bu proje **iki bileşenden** oluşmaktadır:
>
> - **Frontend**: [Data Science & ML Blog Frontend](https://github.com/username/data-science-ml-frontend)
> - **Backend** (Bu repo): API servislerini sağlar.

---

## **🚀 Özellikler**

- ✅ **RESTful API** ile blog içerik yönetimi
- ✅ **JWT Authentication** ile güvenli kimlik doğrulama
- ✅ **RBAC (Role-Based Access Control)** ile yetkilendirme
- ✅ **Kategori, Blog ve Kullanıcı yönetimi**
- ✅ **Markdown desteği** ile içerik formatlama
- ✅ **Görsel yükleme API’si** ile medya yönetimi
- ✅ **Unit & Integration Testleri** ile sağlam API mimarisi

---

## **🛠 Kullanılan Teknolojiler**

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, Bcrypt
- **Security:** Sanitize-HTML, Cookie-Parser
- **Environment Management:** Dotenv
- **Routing & Middleware:** CORS, Slugify
- **API Documentation:** Swagger

---

## **📌 API Endpointleri**

### **🔹 Kullanıcı İşlemleri**

- **`/user`** → Kullanıcı işlemleri (profil görüntüleme, güncelleme, silme)
- **`/auth`** → Kimlik doğrulama işlemleri (kayıt, giriş, çıkış, token yenileme)

### **🔹 Blog Yönetimi**

- **`/posts`** → Blog yazıları (oluşturma, düzenleme, silme, listeleme)
- **`/category`** → Blog kategorileri (oluşturma, listeleme, güncelleme)

### **🔹 Medya Yönetimi**

- **`/images`** → Görsellerin yüklenmesi ve yönetimi

---

## **📂 Klasör Yapısı**

```
📂 src

 ┣ 📂 controllers     # API endpoint işlemleri
 ┣ 📂 helpers         # Yardımcı fonksiyonlar
 ┣ 📂 middlewares     # Yetkilendirme ve hata yönetimi
 ┣ 📂 models          # MongoDB şemaları
 ┣ 📂 routers         # API yönlendirme dosyaları
 ┣ 📜 .env            # Değişkenler Dosyası
 ┗ 📜 server.js       # Ana sunucu dosyası
```

---

## **🚀 Kurulum ve Çalıştırma**

### **1️⃣ Gereksinimler**

- Node.js **14+**
- MongoDB **4.x** (Yerel veya Cloud)

### **2️⃣ Projeyi Klonlayın**

```bash
git clone https://github.com/CelalBerkeAkyol/Finance-blog-backend
cd finance-blog-backend
```

### **3️⃣ Bağımlılıkları Kurun**

```bash
npm install
```

### **4️⃣ Çevresel Değişkenleri Ayarlayın**

`.env` dosyasını oluşturun ve aşağıdaki gibi yapılandırın:

```
MONGOOSE_URL=mongodb://localhost:27017/ds_ml_blog
JWT_SECRET=supersecuresecret
REFRESH_TOKEN_SECRET=supersecuresecret
```

### **5️⃣ Veritabanını Başlatın**

```bash
npm run seed
```

### **6️⃣ Sunucuyu Çalıştırın**

```bash
npm run dev
```

---

## **📌 API Dokümantasyonu**

Tüm endpoint’leri Swagger arayüzünden görüntüleyebilirsiniz:

📌 **Swagger UI:** [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs)

---

## **📌 Testler**

Unit ve entegrasyon testlerini çalıştırmak için:

```bash
npm test
```

---

## **📌 Katkıda Bulunma**

Projeye katkı sağlamak isterseniz aşağıdaki adımları takip edebilirsiniz:

1. **Fork** yapın ve klonlayın
2. Yeni bir **branch** oluşturun:
   ```bash
   git checkout -b feature/yeniozellik
   ```
3. Değişikliklerinizi yapın ve commit edin:
   ```bash
   git commit -m "Yeni özellik eklendi"
   ```
4. **Pull Request** açın 🚀

---

## **📜 Lisans**

Bu proje **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** lisansı altında dağıtılmaktadır. Bu lisans, eserin **ticari olmayan kullanımını** ve **türev çalışmalar yapılmasını** yasaklamaktadır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakabilirsiniz.

---

## **📩 İletişim**

📧 **E-posta:** [support@example.com](mailto:support@example.com)\
🌐 **Proje Web Sitesi:** [dsmlblog.com](https://dsmlblog.com)\
🚀 **Geliştirici:** [GitHub ](https://github.com/username)

---

### **🔗 Ekstra Bağlantılar**

- 📌 **[Frontend Repo](https://github.com/username/data-science-ml-frontend)**
- 📌 **[API Swagger Docs](http://localhost:5000/api-docs)**

---
