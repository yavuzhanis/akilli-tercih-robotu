const UNIVERSITY_NAME = "Kapadokya Üniversitesi";
const OFFICIAL_SOURCE_URL = "https://aday.kapadokya.edu.tr/puanlar-kontenjanlar";
const SOURCE_YEAR = "2025 YKS";

window.PROGRAM_DATA_VERSION = "Kapadokya Üniversitesi 2025 YKS resmi puan ve kontenjan verisi";
window.UNIVERSITY_INFO = {
  name: UNIVERSITY_NAME,
  type: "Vakıf Üniversitesi",
  foundation: "Kapadokya Meslek Yüksekokulu 2005-2006'da eğitime başladı; 2017'de Kapadokya Üniversitesi çatısı kuruldu.",
  city: "Nevşehir / İstanbul",
  campuses: [
    "Mustafapaşa Yerleşkesi",
    "Ürgüp Sağlık Yerleşkesi",
    "Ürgüp Fabrika Yerleşkesi",
    "Uçhisar Sanat Yerleşkesi",
    "Sabiha Gökçen Yerleşkesi"
  ],
  phone: "0384 353 5009",
  email: "info@kapadokya.edu.tr",
  sourceUrl: OFFICIAL_SOURCE_URL
};

const facultyDefaults = {
  "Bilgisayar ve Bilişim Teknolojileri Fakültesi": {
    category: "bilişim",
    campus: "Mustafapaşa Yerleşkesi",
    city: "Nevşehir",
    duration: "4 yıl"
  },
  "Diş Hekimliği Fakültesi": {
    category: "sağlık",
    campus: "Ürgüp Sağlık Yerleşkesi",
    city: "Nevşehir",
    duration: "5 yıl"
  },
  "İnsan ve Toplum Bilimleri Fakültesi": {
    category: "sosyal",
    campus: "Mustafapaşa Yerleşkesi",
    city: "Nevşehir",
    duration: "4 yıl"
  },
  "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi": {
    category: "tasarım",
    campus: "Mustafapaşa Yerleşkesi",
    city: "Nevşehir",
    duration: "4 yıl"
  },
  "Sağlık Bilimleri Yüksekokulu": {
    category: "sağlık",
    campus: "Ürgüp Sağlık Yerleşkesi",
    city: "Nevşehir",
    duration: "4 yıl"
  },
  "Uygulamalı Bilimler Yüksekokulu": {
    category: "turizm",
    campus: "Mustafapaşa Yerleşkesi",
    city: "Nevşehir",
    duration: "4 yıl"
  },
  "Kapadokya Meslek Yüksekokulu": {
    category: "sağlık",
    campus: "Mustafapaşa Yerleşkesi",
    city: "Nevşehir",
    duration: "2 yıl"
  },
  "Kapadokya Meslek Yüksekokulu (İstanbul)": {
    category: "havacılık",
    campus: "Sabiha Gökçen Yerleşkesi",
    city: "İstanbul",
    duration: "2 yıl"
  }
};

const officialRows = [
  ["203852139", "Bilgi Güvenliği Teknolojisi (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 8, 299.59, "310214"],
  ["203852146", "Bilgi Güvenliği Teknolojisi (%50 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 51, 209.39, "1059627"],
  ["203852153", "Bilişim Sistemleri ve Teknolojileri (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 8, 299.67, "309895"],
  ["203852160", "Bilişim Sistemleri ve Teknolojileri (%50 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 51, 214.26, "1004413"],
  ["203852167", "Veri Bilimi ve Analitiği (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 7, 294.04, "331539"],
  ["203852174", "Veri Bilimi ve Analitiği (%50 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 42, 213.33, "1014961"],
  ["203852181", "Yapay Zeka ve Makine Öğrenmesi (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 7, 324.21, "232687"],
  ["203852188", "Yapay Zeka ve Makine Öğrenmesi (%25 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 42, 199.61, "1156185"],
  ["203852195", "Yazılım Geliştirme (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 10, 314.07, "261523"],
  ["203852202", "Yazılım Geliştirme (%25 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "SAY", 64, 173.66, "1284463"],
  ["203852209", "Yönetim Bilişim Sistemleri (Burslu)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "EA", 10, 331.88, "185504"],
  ["203852216", "Yönetim Bilişim Sistemleri (%50 İndirimli)", "Bilgisayar ve Bilişim Teknolojileri Fakültesi", "EA", 68, 189.23, "1430037"],
  ["203851896", "Diş Hekimliği (Ücretli)", "Diş Hekimliği Fakültesi", "SAY", 76, 416.51, "79926"],
  ["203851897", "Diş Hekimliği (Burslu)", "Diş Hekimliği Fakültesi", "SAY", 12, 460.42, "37048"],
  ["203852223", "İngiliz Dili ve Edebiyatı (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "DİL", 10, 386.08, "27334"],
  ["203852230", "İngiliz Dili ve Edebiyatı (%50 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "DİL", 68, 152.45, "140399"],
  ["203852237", "İngilizce Mütercim ve Tercümanlık (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "DİL", 10, 387.27, "26834"],
  ["203852244", "İngilizce Mütercim ve Tercümanlık (%50 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "DİL", 68, 159.07, "140006"],
  ["203852258", "Psikoloji (Ücretli)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 60, 146.78, "1494570"],
  ["203852251", "Psikoloji (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 12, 345.06, "139934"],
  ["203852265", "Psikoloji (%25 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 18, 256.43, "734387"],
  ["203852272", "Siyaset Bilimi ve Kamu Yönetimi (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 5, 290.28, "416907"],
  ["203852279", "Siyaset Bilimi ve Kamu Yönetimi (%50 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 34, 167.93, "1490794"],
  ["203852286", "Siyaset Bilimi ve Uluslararası İlişkiler (İngilizce) (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 5, 287.89, "435168"],
  ["203852293", "Siyaset Bilimi ve Uluslararası İlişkiler (İngilizce) (%50 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "EA", 31, 239.98, "924143"],
  ["203852300", "Türk Dili ve Edebiyatı (Burslu)", "İnsan ve Toplum Bilimleri Fakültesi", "SÖZ", 3, 309.72, "191617"],
  ["203852307", "Türk Dili ve Edebiyatı (%50 İndirimli)", "İnsan ve Toplum Bilimleri Fakültesi", "SÖZ", 25, 211.86, "997114"],
  ["203851992", "Grafik Tasarımı (Burslu)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "EA", 5, 299.17, "353900"],
  ["203851999", "Grafik Tasarımı (%50 İndirimli)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "EA", 34, 141.50, "1494601"],
  ["203852069", "İç Mimarlık ve Çevre Tasarımı (Burslu)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "EA", 3, 333.00, "181129"],
  ["203852076", "İç Mimarlık ve Çevre Tasarımı (%50 İndirimli)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "EA", 22, 238.10, "946475"],
  ["203851904", "Şehir ve Bölge Planlama (Burslu)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "SAY", 5, 266.08, "474339"],
  ["203851905", "Şehir ve Bölge Planlama (%50 İndirimli)", "Mimarlık, Tasarım ve Güzel Sanatlar Fakültesi", "SAY", 34, 187.85, "1240342"],
  ["203851851", "Beslenme ve Diyetetik (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 4, 308.53, "279048"],
  ["203851964", "Beslenme ve Diyetetik (%50 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 31, 218.56, "952612"],
  ["203851857", "Çocuk Gelişimi (Burslu)", "Sağlık Bilimleri Yüksekokulu", "EA", 8, 312.17, "275700"],
  ["203851971", "Çocuk Gelişimi (%50 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "EA", 49, 173.81, "1484479"],
  ["203851879", "Dil ve Konuşma Terapisi (Ücretli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 10, 263.70, "490081"],
  ["203851880", "Dil ve Konuşma Terapisi (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 10, 394.87, "105233"],
  ["203851882", "Dil ve Konuşma Terapisi (%25 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 58, 270.80, "445135"],
  ["203852006", "Ebelik (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 10, 333.74, "208881"],
  ["203852013", "Ebelik (%25 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 68, 245.72, "636559"],
  ["203851854", "Fizyoterapi ve Rehabilitasyon (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 7, 313.32, "263822"],
  ["203851978", "Fizyoterapi ve Rehabilitasyon (%50 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 42, 184.62, "1255788"],
  ["203852020", "Hemşirelik (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 10, 357.05, "161063"],
  ["203852027", "Hemşirelik (%25 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 68, 267.69, "464084"],
  ["203851906", "Odyoloji (Burslu)", "Sağlık Bilimleri Yüksekokulu", "SAY", 7, 284.15, "374744"],
  ["203851985", "Odyoloji (%50 İndirimli)", "Sağlık Bilimleri Yüksekokulu", "SAY", 42, 173.92, "1284163"],
  ["203851860", "Gastronomi ve Mutfak Sanatları (Burslu)", "Uygulamalı Bilimler Yüksekokulu", "SÖZ", 13, 349.12, "59556"],
  ["203851861", "Gastronomi ve Mutfak Sanatları (%50 İndirimli)", "Uygulamalı Bilimler Yüksekokulu", "SÖZ", 85, 155.01, "1173740"],
  ["203851894", "Havacılık Elektrik ve Elektroniği (Burslu)", "Uygulamalı Bilimler Yüksekokulu", "SAY", 10, 398.95, "100203"],
  ["203852034", "Havacılık Elektrik ve Elektroniği (%25 İndirimli)", "Uygulamalı Bilimler Yüksekokulu", "SAY", 59, 272.65, "434321"],
  ["203851898", "Havacılık Yönetimi (Burslu)", "Uygulamalı Bilimler Yüksekokulu", "EA", 10, 332.06, "184809"],
  ["203851899", "Havacılık Yönetimi (%50 İndirimli)", "Uygulamalı Bilimler Yüksekokulu", "EA", 59, 178.92, "1473558"],
  ["203851900", "Uçak Gövde ve Motor Bakımı (Burslu)", "Uygulamalı Bilimler Yüksekokulu", "SAY", 10, 415.83, "80667"],
  ["203851901", "Uçak Gövde ve Motor Bakımı (%25 İndirimli)", "Uygulamalı Bilimler Yüksekokulu", "SAY", 68, 290.79, "345016"],
  ["203852041", "Turizm Rehberliği (Burslu)", "Uygulamalı Bilimler Yüksekokulu", "DİL", 5, 350.31, "43018"],
  ["203852048", "Turizm Rehberliği (%50 İndirimli)", "Uygulamalı Bilimler Yüksekokulu", "DİL", 34, 135.06, "140646"],
  ["203851219", "Ağız ve Diş Sağlığı (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 342.97, "445135"],
  ["203851809", "Ağız ve Diş Sağlığı (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 223.80, "1921601"],
  ["203851237", "Ameliyathane Hizmetleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 331.88, "529590"],
  ["203851811", "Ameliyathane Hizmetleri (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 180.57, "2299135"],
  ["203851361", "Anestezi (Ücretli)", "Kapadokya Meslek Yüksekokulu", "TYT", 34, 236.62, "1739177"],
  ["203851379", "Anestezi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 356.74, "356927"],
  ["203851812", "Anestezi (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 34, 282.74, "1072476"],
  ["203851908", "Bilgisayar Programcılığı (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 314.22, "692352"],
  ["203851909", "Bilgisayar Programcılığı (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 147.67, "2310568"],
  ["203851910", "Bilgisayar Programcılığı (Uzaktan Öğretim) (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 26, 279.83, "1112568"],
  ["203851911", "Bilgisayar Programcılığı (Uzaktan Öğretim) (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 170, 193.07, "2253998"],
  ["203851943", "Bilişim Güvenliği Teknolojisi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 311.10, "725289"],
  ["203851950", "Bilişim Güvenliği Teknolojisi (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 169.26, "2308745"],
  ["203852083", "Bulut Bilişim Operatörlüğü (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 7, 272.69, "1212575"],
  ["203852090", "Bulut Bilişim Operatörlüğü (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 42, 215.01, "2038689"],
  ["203851785", "Ceza İnfaz ve Güvenlik Hizmetleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 311.27, "723574"],
  ["203851794", "Ceza İnfaz ve Güvenlik Hizmetleri (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 201.78, "2187065"],
  ["203852097", "Dijital Dönüşüm Elektroniği (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 7, 276.47, "1159284"],
  ["203852104", "Dijital Dönüşüm Elektroniği (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 42, 181.49, "2297470"],
  ["203851722", "Diş Protez Teknolojisi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 347.93, "411396"],
  ["203851814", "Diş Protez Teknolojisi (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 256.75, "1443683"],
  ["203851255", "Diyaliz (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 326.55, "574938"],
  ["203851815", "Diyaliz (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 193.27, "2252761"],
  ["203851273", "Fizyoterapi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 324.20, "596012"],
  ["203851820", "Fizyoterapi (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 161.13, "2310239"],
  ["203851404", "İlk ve Acil Yardım (Ücretli)", "Kapadokya Meslek Yüksekokulu", "TYT", 38, 245.26, "1612406"],
  ["203851413", "İlk ve Acil Yardım (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 351.04, "391213"],
  ["203851821", "İlk ve Acil Yardım (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 30, 286.38, "1023695"],
  ["203851929", "İnsansız Hava Aracı Teknolojisi ve Operatörlüğü (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 8, 347.00, "417551"],
  ["203851936", "İnsansız Hava Aracı Teknolojisi ve Operatörlüğü (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 51, 164.67, "2309840"],
  ["203852111", "Kurumsal Bilişim Uzmanlığı (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 7, 263.82, "1340457"],
  ["203852118", "Kurumsal Bilişim Uzmanlığı (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 42, 210.49, "2094081"],
  ["203851431", "Odyometri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 9, 319.15, "643373"],
  ["203851916", "Odyometri (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 55, 174.13, "2306342"],
  ["203851501", "Optisyenlik (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 328.54, "557648"],
  ["203851824", "Optisyenlik (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 214.36, "2046821"],
  ["203852125", "Otonom Sistemler Teknikerliği (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 7, 286.95, "1016169"],
  ["203852132", "Otonom Sistemler Teknikerliği (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 42, 216.21, "2023515"],
  ["203851634", "Patoloji Laboratuvar Teknikleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 317.87, "655742"],
  ["203851826", "Patoloji Laboratuvar Teknikleri (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 171.85, "2307711"],
  ["203851883", "Radyoterapi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 7, 321.40, "622110"],
  ["203851884", "Radyoterapi (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 42, 177.27, "2303613"],
  ["203850115", "Sivil Hava Ulaştırma İşletmeciliği (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 341.89, "452888"],
  ["203850275", "Sivil Hava Ulaştırma İşletmeciliği (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 231.73, "1810007"],
  ["203850875", "Sivil Havacılık Kabin Hizmetleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 347.71, "412794"],
  ["203851917", "Sivil Havacılık Kabin Hizmetleri (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 261.07, "1380694"],
  ["203851307", "Tıbbi Görüntüleme Teknikleri (Ücretli)", "Kapadokya Meslek Yüksekokulu", "TYT", 18, 226.87, "1879306"],
  ["203851316", "Tıbbi Görüntüleme Teknikleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 346.12, "423512"],
  ["203851829", "Tıbbi Görüntüleme Teknikleri (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 50, 252.00, "1513532"],
  ["203851652", "Tıbbi Laboratuvar Teknikleri (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 341.24, "457598"],
  ["203851830", "Tıbbi Laboratuvar Teknikleri (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 234.20, "1774357"],
  ["203850151", "Turist Rehberliği (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 330.89, "537700"],
  ["203850293", "Turist Rehberliği (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 68, 220.23, "1970581"],
  ["203851467", "Turist Rehberliği (Uzaktan Öğretim) (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 26, 376.49, "255938"],
  ["203851767", "Turist Rehberliği (Uzaktan Öğretim) (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 170, 218.37, "1995294"],
  ["203850884", "Uçak Teknolojisi (Ücretli)", "Kapadokya Meslek Yüksekokulu", "TYT", 34, 282.37, "1077513"],
  ["203850893", "Uçak Teknolojisi (Burslu)", "Kapadokya Meslek Yüksekokulu", "TYT", 10, 388.69, "206014"],
  ["203850918", "Uçak Teknolojisi (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu", "TYT", 34, 309.51, "742400"],
  ["203850954", "Sivil Hava Ulaştırma İşletmeciliği (İstanbul) (Burslu)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 8, 349.50, "401006"],
  ["203851957", "Sivil Hava Ulaştırma İşletmeciliği (İstanbul) (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 51, 273.09, "1206829"],
  ["203851334", "Sivil Havacılık Kabin Hizmetleri (İstanbul) (Burslu)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 12, 353.04, "378864"],
  ["203851352", "Sivil Havacılık Kabin Hizmetleri (İstanbul) (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 76, 271.92, "1223617"],
  ["203850963", "Uçak Teknolojisi (İstanbul) (Ücretli)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 24, 316.46, "669757"],
  ["203850972", "Uçak Teknolojisi (İstanbul) (Burslu)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 7, 413.29, "128287"],
  ["203851194", "Uçak Teknolojisi (İstanbul) (%25 İndirimli)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 23, 350.95, "391791"],
  ["203851616", "Uçuş Harekat Yöneticiliği (İstanbul) (Burslu)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 10, 366.49, "303656"],
  ["203851834", "Uçuş Harekat Yöneticiliği (İstanbul) (%50 İndirimli)", "Kapadokya Meslek Yüksekokulu (İstanbul)", "TYT", 68, 269.33, "1260865"]
];

function getFeeStatus(name) {
  const match = name.match(/\((Burslu|Ücretli|%25 İndirimli|%50 İndirimli)\)$/);
  return match ? match[1] : "";
}

function getBaseProgramName(name) {
  return name.replace(/\s+\((Burslu|Ücretli|%25 İndirimli|%50 İndirimli)\)$/u, "");
}

function formatRank(rank) {
  return String(rank).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getLanguage(name) {
  return name.includes("(İngilizce)") || name.startsWith("İngiliz")
    ? "İngilizce"
    : "Türkçe";
}

function getCategory(name, faculty) {
  if (/Havacılık|Hava|Uçak|Uçuş|İnsansız Hava/i.test(name)) return "havacılık";
  if (/Bilgi|Bilişim|Yazılım|Veri|Yapay Zeka|Bilgisayar|Bulut|Dijital|Otonom|Kurumsal Bilişim/i.test(name)) return "bilişim";
  if (/Gastronomi|Turizm|Turist/i.test(name)) return "turizm";
  if (/Grafik|Mimarlık|Şehir/i.test(name)) return "tasarım";
  if (/Diş|Beslenme|Çocuk Gelişimi|Dil ve Konuşma|Ebelik|Fizyoterapi|Hemşirelik|Odyoloji|Ağız|Ameliyathane|Anestezi|Diyaliz|Odyometri|Optisyenlik|Patoloji|Radyoterapi|Tıbbi/i.test(name)) return "sağlık";
  if (faculty.includes("İnsan ve Toplum")) return "sosyal";
  return facultyDefaults[faculty]?.category || "sosyal";
}

function getCareers(name, category) {
  if (/Yapay Zeka|Veri|Bilişim|Bilgi|Yazılım|Bilgisayar|Bulut|Dijital|Otonom|Kurumsal/i.test(name)) {
    return ["Yazılım ve bilişim uzmanlığı", "Veri ve sistem analizi", "Dijital dönüşüm ekipleri"];
  }
  if (/Diş Hekimliği/i.test(name)) return ["Diş hekimi", "Klinik uygulama", "Ağız ve diş sağlığı hizmetleri"];
  if (/Havacılık|Hava|Uçak|Uçuş|İnsansız Hava/i.test(name)) {
    return ["Havacılık operasyonları", "Teknik bakım ve operasyon", "Yer hizmetleri ve uçuş destek"];
  }
  if (/Gastronomi/i.test(name)) return ["Şeflik", "Yiyecek içecek yönetimi", "Gastronomi girişimciliği"];
  if (/Rehber/i.test(name)) return ["Turist rehberliği", "Turizm danışmanlığı", "Kültürel rota yönetimi"];
  if (category === "sağlık") return ["Sağlık hizmetleri", "Klinik/laboratuvar uygulamaları", "Hasta destek süreçleri"];
  if (category === "tasarım") return ["Tasarım ofisleri", "Proje geliştirme", "Yaratıcı endüstriler"];
  return ["Kamu ve özel sektör", "Araştırma ve analiz", "Kurumsal danışmanlık"];
}

function getPriorities(category) {
  if (category === "bilişim") return ["kariyer", "teknoloji", "uygulama"];
  if (category === "sağlık") return ["kariyer", "uygulama", "insan"];
  if (category === "havacılık") return ["kariyer", "uygulama", "teknoloji"];
  if (category === "tasarım") return ["kariyer", "uygulama"];
  return ["kariyer", "insan"];
}

function getSummary(name, faculty, feeStatus, baseScore, rank) {
  const baseName = getBaseProgramName(name);
  return `${UNIVERSITY_NAME} ${faculty} bünyesindeki ${baseName} programının ${feeStatus} seçeneği için 2025 YKS resmi aday sayfasında en küçük puan ${baseScore.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, başarı sırası ${formatRank(rank)} olarak ilan edilmiştir.`;
}

window.PROGRAM_DATA = officialRows.map(([code, name, faculty, scoreType, quota, baseScore, rank]) => {
  const defaults = facultyDefaults[faculty];
  const category = getCategory(name, faculty);
  const feeStatus = getFeeStatus(name);
  const educationType = name.includes("Uzaktan Öğretim") ? "Uzaktan" : "Örgün";

  return {
    id: `kun-${code}`,
    university: UNIVERSITY_NAME,
    name,
    faculty,
    scoreType,
    educationType,
    campus: defaults.campus,
    city: defaults.city,
    duration: defaults.duration,
    language: getLanguage(name),
    scholarshipOptions: [feeStatus],
    quota,
    careers: getCareers(name, category),
    baseScore,
    rank: formatRank(rank),
    sourceYear: SOURCE_YEAR,
    sourceStatus: `Resmi aday sayfası · Program kodu ${code}`,
    sourceUrl: OFFICIAL_SOURCE_URL,
    category,
    priorities: getPriorities(category),
    summary: getSummary(name, faculty, feeStatus, baseScore, rank),
    feeStatus,
    baseScoreYear: SOURCE_YEAR,
    rankYear: SOURCE_YEAR,
    quotaYear: SOURCE_YEAR
  };
});
