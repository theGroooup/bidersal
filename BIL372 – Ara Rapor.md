#   

# **BİL 372 \- Veritabanı Sistemleri**

# **2025-2026 Güz Dönemi**

# **Proje Ara Raporu**

# **BiDersAl – Özel Ders Eşleştirme Platformu**

#       **Yunus Emre Özçelik	        221401001**

#       **Ömer Talha Akbulut	        221401005**

#        		      **Mehmet Ali Uslu		221101043**

# **1\) Proje Konusu ve Domain Tanımı**

**Konu:** Öğrenci ve öğretmenleri bir araya getiren, online özel ders randevularının oluşturulmasını, yönetilmesini ve ödemelerinin takip edilmesini sağlayan web tabanlı bir randevu sistemi.

**Amaç:** Öğrencilerin farklı kategorilerdeki dersler için doğrulanmış öğretmenleri bulup uygun zaman dilimlerine randevu oluşturmasını sağlamak. Öğretmenlerin ise kendi programlarını yönetip ders taleplerini kabul edip ödemelerini takip edebileceği bir platform oluşturmak. Tamamlanan dersler sonrası öğrenci ve öğretmenlerin birbirlerini değerlendirebilmesi de hedeflenmektedir.

**Hedef Kullanıcı:** Öğrenciler ve öğretmenler.

# **2\) Veri Tabanı Tasarım Özeti**

Bu proje kapsamında oluşturulan veri tabanı; öğrenci, öğretmen, randevu ve ödeme ilişkilerini bütüncül bir yapıda yöneten ilişkisel bir tasarım yaklaşımıyla modellenmiştir. Temel amaç, eğitimci ve öğrenci arasındaki etkileşimleri doğru şekilde temsil eden, ölçeklenebilir ve yönetilebilir bir veri tabanı yapısı ortaya koymaktır.

Veri tabanı tasarımı yapılırken her tablo belirli bir işlevi temsil etmekte ve verilerin tekrarsız (normalleştirilmiş) biçimde saklanmasına dikkat edilmiştir. Öğrenci ve öğretmen bilgileri iki temel aktör olarak ayrı tablolar üzerinden yönetilirken, bu aktörleri birbirine bağlayan randevu, ödeme ve değerlendirme gibi süreçler ilişki tabanlı ek tablolar aracılığıyla modellenmiştir. Böylece hem veri tutarlılığı sağlanmış hem de gelecekte sistemin genişletilmesine uygun esnek bir yapı oluşturulmuştur.

Tasarım sürecinde özellikle **çoktan çoğa ilişkilerin** (öğretmen – ders) doğru modellenebilmesi için “ogretmen\_ders” gibi ara tablolar kullanılmış; randevu akışı ile ödeme süreçlerinin birbirinden ayrılmasıyla da hem kullanıcı işlemlerinin hem de finansal kayıtların izlenebilirliği artırılmıştır.

Ayrıca, proje geliştirme sürecinin ilerleyen aşamalarında yeni fonksiyonel gereksinimler ortaya çıkabileceğinden, veri tabanı tasarımı değiştirilebilir yapıda tutulmuştur. Nihai sürümde tablolar üzerinde ekleme/çıkarma veya alan düzeyinde iyileştirme yapılması mümkündür; ancak bu değişiklikler **mevcut ana tasarım prensiplerini** (ilişkisel yapı, rol ayrımı, süreç tablolaması gibi) koruyacak biçimde gerçekleştirilecektir.

## **2.1) ogrenci (ogrenci\_id PK)**

* ad, soyad, dogum\_tarihi, cinsiyet  
* tel\_no (UNIQUE)  
* email (UNIQUE)  
* sifre\_hash  
* sinif  
* kayit\_tarihi  
* hesap\_durumu {aktif, askida}


## **2.2) ogretmen (ogretmen\_id PK)**

* ad, soyad  
* dogum\_tarihi (DATE)
* cinsiyet (VARCHAR)
* tel\_no (UNIQUE)  
* email (UNIQUE)  
* sifre\_hash  
* universite, bolum  
* meslek  
* dogrulandi\_mi (Boolean: True/False)  
* biyografi TEXT  
* puan DECIMAL(3, 2) DEFAULT 0  
* belge\_url TEXT  
* hesap\_durumu {aktif, askida}


## **2.3) admin (admin\_id PK)**

* ad, soyad, dogum\_tarihi, cinsiyet  
* tel\_no (UNIQUE)  
* email (UNIQUE)  
* sifre\_hash  
* kayit\_tarihi


## **2.4) ders (ders\_id PK)**

* ders\_adi  
* kategori (Matematik, Fizik, Müzik vb.)  
* seviye (İlkokul, Lise, Üniversite vb.)
* aktif\_mi (Boolean: True/False)


## **2.5) ogretmenin\_verdigi\_dersler (ogretmen\_ders\_id PK)**

* ogretmen\_id (FK → ogretmen.ogretmen\_id)  
* ders\_id (FK → ders.ders\_id)  
* saatlik\_ucret
* aktif\_mi (Boolean: True/False)

Constraint: UNIQUE (ogretmen\_id, ders\_id)

## **2.6) randevu (randevu\_id PK)**

* ogrenci\_id (FK → ogrenci.ogrenci\_id)  
* ogretmen\_ders\_id (FK → ogretmen\_ders.ogretmen\_ders\_id)  
* randevu\_tarihi\_baslangic (DATETIME)  
* sure\_dakika  
* durum {planlandi, tamamlandi, ogrenci\_iptal, ogretmen\_iptal}  
* zoom\_linki (opsiyonel)  
* olusturma\_tarihi


## **2.7) odeme (odeme\_id PK)**

* randevu\_id (FK, UNIQUE → randevu.randevu\_id)  
* tutar  
* ogrenci\_odeme\_durumu {odendi, bekleniyor}  
* ogrenci\_odeme\_tarihi  
* ogretmen\_odeme\_durumu {odendi, bekleniyor}  
* ogretmen\_odeme\_tarihi


## **2.8) degerlendirme (degerlendirme\_id PK)**

* ogretmen\_id (FK → ogretmen.ogretmen\_id)  
* puan (1-5 arası)  
* yorum (opsiyonel)  
* yapan\_ogrenci (FK → ogrenci.ogrenci\_id)  
* tarih


## **2.9) ogretmen\_calisma\_saatleri (calisma\_saati\_id PK)**

* ogretmen\_id (FK → kullanicilar.kullanici\_id)  
* gun\_no (INT: 1=Pazartesi, 2=Salı, ..., 7=Pazar)  
* baslangic\_saati (TIME: örn. "09:00")  
* bitis\_saati (TIME: örn. "17:00")

# **3\) Geliştirilecek Program — Menüler ve Fonksiyonlar**

## **3.1) Öğrenci Portalı**

**Ders Al:** Kategori/Ders/Öğretmen bazlı arama yapma → Öğretmen profillerini ve puanlarını görüntüleme → Öğretmenin takviminden uygun saat dilimini (slot) seçerek randevu talebi gönderme.

**Randevularım:**

1. Gelecek Randevular: Yaklaşan dersleri, ders detaylarını (tarih, öğretmen, link) ve iptal etme seçeneğini görüntüleme.  
2. Geçmiş Randevular: Tamamlanan dersleri listeleme, ders detayı ve ödeme geçmişini görme, öğretmene puan ve yorum bırakma.

**Ödemelerim:** Yapılan ve bekleyen ödemeleri takip etme.

**Profilim:** Kişisel bilgileri (iletişim, sınıf vb.) güncelleme.

## **3.2) Öğretmen Portalı**

**Ders Talepleri**: Öğrencilerden gelen yeni randevu taleplerini görüntüleme, onaylama veya reddetme.

**Takvimim/Randevularım:** Onaylanmış (gelecek) ve tamamlanmış (geçmiş) dersleri takvim üzerinde görme.

**Derslerim:** Sisteme verebileceği dersleri ekleme, düzenleme ve saatlik ücret belirleme.

**Kazançlarım:** Tamamlanan derslerden elde edilen gelirleri ve ödeme durumunu takip etme.

**Profilim:** Kişisel ve mesleki bilgileri (üniversite, uzmanlık alanı vb.) güncelleme, profilin öğrenci arama sonuçlarında nasıl göründüğünü yönetme.

## **3.3 Admin Paneli**

**Kullanıcı Yönetimi:** Tüm kullanıcıları (öğrenci, öğretmen, admin) listeleme, arama, hesap durumunu değiştirme (aktif/askıda).

**Öğretmen Onaylama:** Öğretmen olarak kaydolan kullanıcıların dogrulandi\_mi durumunu belgelerini inceledikten sonra onaylama veya reddetme.

**Ders ve Kategori Yönetimi:** Sisteme yeni dersler, kategoriler ve seviyeler ekleme veya mevcutları düzenleme.

**Raporlama:** Sistem geneliyle ilgili istatistikleri (toplam randevu sayısı, gelir, yeni kullanıcı sayısı vb.) görüntüleme.

**Anlaşmazlık Yönetimi:** Kullanıcılar arasında yaşanan sorunlu randevu veya ödemelere müdahale etme.

# **4\) Uygulama Özeti**

Bu proje, öğrencilerin çeşitli alanlarda özel ders almak için nitelikli öğretmenleri kolayca bulmasını ve ders rezervasyonu yapmasını amaçlayan bir web uygulamasıdır. Öğrenciler, sistem üzerinden öğretmen profillerini, verdikleri dersleri ve diğer öğrenciler tarafından yapılan değerlendirmeleri inceleyerek kendileri için en uygun öğretmeni seçebilecektir. Öğretmenler ise kendi profillerini oluşturup derslerini ve ücretlerini belirleyerek ders talepleri alabilecek, takvimlerini yönetebilecek ve kazançlarını takip edebilecektir. Uygulama, randevu yönetimi, güvenli ödeme takibi ve değerlendirme sistemi ile hem öğrenci hem de öğretmen için şeffaf ve kullanımı kolay bir ekosistem sunacaktır.

