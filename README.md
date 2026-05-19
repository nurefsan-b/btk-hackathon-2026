# 🪙 MicroFon — Micro-Savings & AI-Driven Trading Platform

> **BTK Akademi Hackathon 2026**  
> Gündelik harcamalarınızın küsuratlarını akıllı yatırımlara dönüştüren, Gemini AI destekli otonom mikro-yatırım platformu.

### 🚀 MicroFon Şimdi Canlıda: Projemizi Hemen Deneyimleyin!
<p align="left">
  <a href="https://microfon.com.tr" target="_blank">
    <img src="https://img.shields.io/badge/Canl%C4%B1%20Web%20Sitesi-microfon.com.tr-blue?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Link">
  </a>
</p>
---

## 📌 Problem ve Vizyon

Milyonlarca insan her gün kredi kartlarıyla binlerce işlem yapıyor. Harcamalardan arta kalan küçük küsuratlar (örneğin ₺87.30'lik bir kahve harcamasının ₺90.00'a yuvarlanmasıyla oluşan **₺2.70**) çoğunlukla gözden kaçar ve vadesiz hesaplarda erir. Diğer yandan, bireysel yatırımcılar piyasaları takip edecek teknik bilgiye, zamana ve başlangıç sermayesine sahip değildir.

**MicroFon**, bu görünmez parayı toplar, biriktirir ve yapay zeka ajanları vasıtasıyla sizin adınıza akıllı finansal enstrümanlara yatırır.

## 💡 Sunulan Çözüm ve Akış

1. 💳 **Akıllı Yuvarlama (Round-Up):** Harcamalarınız otomatik olarak en yakın 10'luk TL değerine yuvarlanır ve aradaki fark birikim havuzuna aktarılır.
2. 💰 **Haftalık Birikim Havuzu:** Biriken paralar haftalık havuzlarda toplanır ve 100 TL eşiğini geçtiğinde yatırım için hazır hale gelir.
3. 🧠 **Gemini Yapay Zeka Ajanı:** Gemini 1.5 Pro tabanlı AI ajanı, güncel finansal haberleri ve piyasa duyarlılıklarını (sentiment) analiz eder.
4. 📈 **Kullanıcı Onaylı / Otonom Yatırım:** AI ajanı bir alım/satım kararı ürettiğinde, isterseniz otonom olarak isterseniz de tek tıkla onaylayarak yatırımı başlatırsınız.
5. 🔄 **Manuel Pozisyon Kapatma (Yeni):** Portföyünüzdeki açık pozisyonları dilediğiniz an tek tıkla satabilir; güncel canlı piyasa fiyatıyla kâr/zarar dahil tüm bakiyeyi anında birikim havuzunuza geri çekebilirsiniz.

---

## 🏗️ Sistem Mimarisi

```
┌─────────────┐     ┌──────────────┐       ┌──────────────┐
│   Frontend  │────▶│   Traefik    │────▶ │   FastAPI    │
│  React + TS │     │   (Proxy)    │       │   Backend    │
└─────────────┘     └──────────────┘       └──────┬───────┘
                                                  │
                           ┌──────────────────────┼──────────────┐
                           │                      │              │
                      ┌────▼─────┐         ┌──────▼───┐   ┌─────▼─────┐
                      │ Postgres │         │  Redis   │   │  Celery   │
                      │   (DB)   │         │ (Cache)  │   │ (Worker)  │
                      └──────────┘         └──────────┘   └─────┬─────┘
                                                                │
                                                          ┌─────▼─────┐
                                                          │  Gemini   │
                                                          │  AI Agent │
                                                          └───────────┘
```

---

## 🛠️ Teknolojik Altyapı (Tech Stack)

| Katman | Teknoloji | Açıklama |
|-------|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Recharts | Canlı grafikler, mikro-animasyonlar ve zengin karanlık tema |
| **Backend** | Python, FastAPI, SQLAlchemy (Async), Pydantic v2 | Yüksek performanslı, asenkron ve tip güvenli API katmanı |
| **Database** | PostgreSQL 16 | İşlem geçmişi, kullanıcı bilgileri ve portföy dayanıklılığı |
| **Cache & Broker** | Redis 7 | Celery görev kuyrukları, 2FA oturumları ve piyasa fiyat önbelleği |
| **Background Jobs** | Celery + Celery Beat + RedBeat | Arka planda çalışan AI kararları ve haftalık birikim toplama |
| **AI / LLM** | Google Gemini 1.5 Pro (LangChain) | Doğal dil işleme ile haber analizi ve gerekçelendirilmiş karar üretimi |
| **Altyapı** | Docker Compose, Traefik,AWS,Cloudflare Tunnel| Kolay yerel kurulum ve production-ready reverse-proxy yönlendirmesi |

---

## ✨ Öne Çıkan Özellikler ve Yenilikler

* 🌐 **Tam Türkçe ve İngilizce Dil Desteği:** Tüm sayfalar (Portföy, Analitik, Yapay Zeka Kararları ve Ayarlar) dinamik dil geçişine sahiptir.
* 🛡️ **Gelişmiş Güvenlik:** Google Authenticator uyumlu İki Aşamalı Doğrulama (2FA) sistemi.
* ⚡ **Gerçek Zamanlı Durum Takibi (SSE):** AI kararlarının arka plandaki Celery süreçleri, frontend tarafından Server-Sent Events (SSE) ile canlı izlenir; arayüzde donma veya gereksiz istek trafiği oluşmaz.
* 📉 **Akıllı Risk Yönetimi:** Ayarlar sayfasından belirlediğiniz Düşük/Orta/Yüksek risk profiline göre Gemini AI yatırım kararlarını optimize eder.

---

## 🚀 Hızlı Kurulum ve Başlatma

### Gereksinimler
- Docker & Docker Compose
- Google Gemini API Key ([Buradan ücretsiz alabilirsiniz](https://aistudio.google.com/apikey))

### 1. Yapılandırma

Proje ana dizininde `.env` dosyası oluşturun ve Gemini API anahtarınızı tanımlayın:
```bash
cp .env.example .env
```
`.env` dosyasını düzenleyip `GOOGLE_API_KEY` alanını doldurun:
```env
GOOGLE_API_KEY=your-actual-gemini-api-key
```

### 2. Docker Konteynerlarını Başlatma

Aşağıdaki komut tüm PostgreSQL, Redis, FastAPI, Celery, Traefik ve React servislerini ayağa kaldırır ve veritabanı şemasını otomatik günceller:

```bash
make setup
```

### 3. Uygulama Adresleri

| Servis | URL |
|---------|-----|
| **Kullanıcı Arayüzü (React)** | `http://localhost:5173` |
| **API Dokümantasyonu (Swagger)** | `http://api.localhost/docs` |
| **Flower (Celery Görev İzleyici)** | `http://flower.localhost` |
| **Traefik Paneli** | `http://localhost:8080` |

### 4. İşlem Simülatörünü Çalıştırma
Yapay zekanın yatırım yapabilmesi için birikim havuzuna kart harcaması simüle etmek isterseniz, arayüzdeki **Demo Panel**'i kullanabilir veya terminalden simülatörü başlatabilirsiniz:

```bash
cd simulator
pip install httpx
python trigger_transactions.py --interval 2
```

---

## 🔧 Yararlı Geliştirici Komutları

```bash
make up          # Tüm konteynerları arka planda çalıştırır
make down        # Tüm konteynerları durdurur
make logs        # Konteyner loglarını canlı izler
make migrate     # Bekleyen veritabanı güncellemelerini uygular
make test        # Pytest test paketini çalıştırır
make lint        # Ruff ile kod standartlarını denetler
```

---

## 👥 Ekip & Teşekkür

**BTK Akademi Hackathon 2026 Projesi.**  
**Paranızın sesini MikroFon ile duyurun!**
## 📸 Uygulama Arayüzü
<img width="1903" height="898" alt="Ekran görüntüsü 2026-05-19 192900" src="https://github.com/user-attachments/assets/a722202a-b673-4dc7-8bc1-a0d8a3bbe639" />
<img width="1903" height="880" alt="Ekran görüntüsü 2026-05-19 195202" src="https://github.com/user-attachments/assets/59963252-074f-4a70-ae67-b0794b3c29c4" />
<img width="1902" height="913" alt="Ekran görüntüsü 2026-05-19 192926" src="https://github.com/user-attachments/assets/f2dc4789-fdac-47ae-b162-e745dd1882d7" />
<img width="1901" height="695" alt="Ekran görüntüsü 2026-05-19 193054" src="https://github.com/user-attachments/assets/e5fc178d-4650-4c95-a2cb-1c8b143fc989" />
<img width="1901" height="912" alt="Ekran görüntüsü 2026-05-19 193110" src="https://github.com/user-attachments/assets/fef8ecda-0cea-4965-a594-80edeba76560" />
<img width="1901" height="832" alt="Ekran görüntüsü 2026-05-19 193125" src="https://github.com/user-attachments/assets/85572b0d-d4d3-4d4e-96eb-6e7fae3d7afa" />
<img width="1902" height="905" alt="Ekran görüntüsü 2026-05-19 193209" src="https://github.com/user-attachments/assets/98fa82ce-ac87-49f3-bd9b-7ee16eeff446" />
<img width="1904" height="907" alt="Ekran görüntüsü 2026-05-19 193228" src="https://github.com/user-attachments/assets/311be009-ffec-4d77-bd6e-f4895b7b99a4" />
<img width="1903" height="255" alt="Ekran görüntüsü 2026-05-19 193238" src="https://github.com/user-attachments/assets/006b9dd6-77bd-4a10-afdc-34823cbf9e77" />
<img width="1903" height="914" alt="Ekran görüntüsü 2026-05-19 193250" src="https://github.com/user-attachments/assets/ccdce5dc-e709-4be9-870f-b0bf28aaf87c" />
<img width="1902" height="536" alt="Ekran görüntüsü 2026-05-19 193304" src="https://github.com/user-attachments/assets/88573e07-c87a-4baa-87ed-44a3697b7b2c" />
<img width="1900" height="903" alt="Ekran görüntüsü 2026-05-19 193337" src="https://github.com/user-attachments/assets/14532dc0-68c3-4f43-869a-c55cdac43e7d" /><img width="1903" height="591" alt="Ekran görüntüsü 2026-05-19 193346" src="https://github.com/user-attachments/assets/c37c7624-e17d-4e85-bc9e-521d3f58db40" />
<img width="1901" height="903" alt="Ekran görüntüsü 2026-05-19 193354" src="https://github.com/user-attachments/assets/d6e26025-4886-4ae3-97ec-b44a9f81725d" />
<img width="1902" height="897" alt="Ekran görüntüsü 2026-05-19 193404" src="https://github.com/user-attachments/assets/e7f63137-14f8-4c42-ba88-9e4210a06809" />
<img width="1893" height="894" alt="Ekran görüntüsü 2026-05-19 193416" src="https://github.com/user-attachments/assets/e0c0b5e6-280b-4f4a-a39a-69a28e0a0f6e" />
<img width="1898" height="281" alt="Ekran görüntüsü 2026-05-19 193426" src="https://github.com/user-attachments/assets/993354df-2e41-44bb-bed0-b2f226a92771" />





