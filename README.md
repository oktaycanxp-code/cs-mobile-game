# CS Mobile Strike

Mobil ekran için tasarlanmış, hızlı ve oynanabilir bir "CS tarzı" mini ateşli oyun prototipidir.

## Özellikler
- Mobil uyumlu tek ekran oyun
- Dokunmatik kontrol / fare kontrolü
- Rakip düşman spawn sistemi
- Skor, can ve süre sistemi
- Yeniden başlatma ekranı
- Tarayıcıda çalışır

## Çalıştırma
Aynı klasörde terminal açıp aşağıdakileri çalıştırın:

```bash
python3 -m http.server 8000
```

Sonra tarayıcıda şu adrese gidin:

```text
http://localhost:8000
```

## Oynama
- Ekrana dokunarak/gelerek hedefe nişan al
- Oto ateş veya dokunma ile ateş et
- Düşmanlara vur, canını koru
- Süre dolmadan yüksek skor yap

## Geliştirme notu
Bu proje hızlı prototip olarak hazırlanmıştır. İsterseniz bir sonraki adımda bunu şu özelliklerle geliştirebilirim:
- silah seçimi
- daha fazla düşman tipi
- animasyon ve sesler
- menü ekranı
- bomb/round modu
- gerçek mobil uygulama paketleme
