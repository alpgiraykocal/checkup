/* ISO 3166-1 ülke listesi ve varsayılan AML risk işaretleri.
   Bayraklar başlangıç değeridir; Ayarlar > Ülke riskleri ekranından değiştirilir. */

const COUNTRIES = [
 {
  "code": "VI",
  "tr": "ABD Virjin Adaları",
  "en": "U.S. Virgin Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AF",
  "tr": "Afganistan",
  "en": "Afghanistan",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "DE",
  "tr": "Almanya",
  "en": "Germany",
  "flags": []
 },
 {
  "code": "US",
  "tr": "Amerika Birleşik Devletleri",
  "en": "United States",
  "flags": []
 },
 {
  "code": "AS",
  "tr": "Amerikan Samoası",
  "en": "American Samoa",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AD",
  "tr": "Andorra",
  "en": "Andorra",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AO",
  "tr": "Angola",
  "en": "Angola",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "AI",
  "tr": "Anguilla",
  "en": "Anguilla",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AG",
  "tr": "Antigua ve Barbuda",
  "en": "Antigua and Barbuda",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AR",
  "tr": "Arjantin",
  "en": "Argentina",
  "flags": []
 },
 {
  "code": "AL",
  "tr": "Arnavutluk",
  "en": "Albania",
  "flags": []
 },
 {
  "code": "AW",
  "tr": "Aruba",
  "en": "Aruba",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AU",
  "tr": "Avustralya",
  "en": "Australia",
  "flags": []
 },
 {
  "code": "AT",
  "tr": "Avusturya",
  "en": "Austria",
  "flags": []
 },
 {
  "code": "AZ",
  "tr": "Azerbaycan",
  "en": "Azerbaijan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BS",
  "tr": "Bahamalar",
  "en": "Bahamas",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BH",
  "tr": "Bahreyn",
  "en": "Bahrain",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BD",
  "tr": "Bangladeş",
  "en": "Bangladesh",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BB",
  "tr": "Barbados",
  "en": "Barbados",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BY",
  "tr": "Belarus",
  "en": "Belarus",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "BZ",
  "tr": "Belize",
  "en": "Belize",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BE",
  "tr": "Belçika",
  "en": "Belgium",
  "flags": []
 },
 {
  "code": "BJ",
  "tr": "Benin",
  "en": "Benin",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BM",
  "tr": "Bermuda",
  "en": "Bermuda",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "AE",
  "tr": "Birleşik Arap Emirlikleri",
  "en": "United Arab Emirates",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "GB",
  "tr": "Birleşik Krallık",
  "en": "United Kingdom",
  "flags": []
 },
 {
  "code": "BO",
  "tr": "Bolivya",
  "en": "Bolivia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BA",
  "tr": "Bosna-Hersek",
  "en": "Bosnia and Herzegovina",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BW",
  "tr": "Botsvana",
  "en": "Botswana",
  "flags": []
 },
 {
  "code": "BR",
  "tr": "Brezilya",
  "en": "Brazil",
  "flags": []
 },
 {
  "code": "VG",
  "tr": "Britanya Virjin Adaları",
  "en": "British Virgin Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BN",
  "tr": "Brunei",
  "en": "Brunei",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "BG",
  "tr": "Bulgaristan",
  "en": "Bulgaria",
  "flags": []
 },
 {
  "code": "BF",
  "tr": "Burkina Faso",
  "en": "Burkina Faso",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "BI",
  "tr": "Burundi",
  "en": "Burundi",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "BT",
  "tr": "Butan",
  "en": "Bhutan",
  "flags": []
 },
 {
  "code": "CV",
  "tr": "Cabo Verde",
  "en": "Cabo Verde",
  "flags": []
 },
 {
  "code": "KY",
  "tr": "Cayman Adaları",
  "en": "Cayman Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "GI",
  "tr": "Cebelitarık",
  "en": "Gibraltar",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "DZ",
  "tr": "Cezayir",
  "en": "Algeria",
  "flags": [
   "fatfGrey"
  ]
 },
 {
  "code": "DJ",
  "tr": "Cibuti",
  "en": "Djibouti",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "CK",
  "tr": "Cook Adaları",
  "en": "Cook Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "CW",
  "tr": "Curaçao",
  "en": "Curaçao",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "DK",
  "tr": "Danimarka",
  "en": "Denmark",
  "flags": []
 },
 {
  "code": "CD",
  "tr": "Demokratik Kongo Cumhuriyeti",
  "en": "DR Congo",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "DO",
  "tr": "Dominik Cumhuriyeti",
  "en": "Dominican Republic",
  "flags": []
 },
 {
  "code": "DM",
  "tr": "Dominika",
  "en": "Dominica",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "TL",
  "tr": "Doğu Timor",
  "en": "Timor-Leste",
  "flags": []
 },
 {
  "code": "EC",
  "tr": "Ekvador",
  "en": "Ecuador",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GQ",
  "tr": "Ekvator Ginesi",
  "en": "Equatorial Guinea",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "SV",
  "tr": "El Salvador",
  "en": "El Salvador",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "ID",
  "tr": "Endonezya",
  "en": "Indonesia",
  "flags": []
 },
 {
  "code": "ER",
  "tr": "Eritre",
  "en": "Eritrea",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "AM",
  "tr": "Ermenistan",
  "en": "Armenia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "EE",
  "tr": "Estonya",
  "en": "Estonia",
  "flags": []
 },
 {
  "code": "SZ",
  "tr": "Esvatini",
  "en": "Eswatini",
  "flags": []
 },
 {
  "code": "ET",
  "tr": "Etiyopya",
  "en": "Ethiopia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MA",
  "tr": "Fas",
  "en": "Morocco",
  "flags": []
 },
 {
  "code": "FJ",
  "tr": "Fiji",
  "en": "Fiji",
  "flags": []
 },
 {
  "code": "CI",
  "tr": "Fildişi Sahili",
  "en": "Côte d'Ivoire",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "PH",
  "tr": "Filipinler",
  "en": "Philippines",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "PS",
  "tr": "Filistin",
  "en": "Palestine",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "FI",
  "tr": "Finlandiya",
  "en": "Finland",
  "flags": []
 },
 {
  "code": "FR",
  "tr": "Fransa",
  "en": "France",
  "flags": []
 },
 {
  "code": "GA",
  "tr": "Gabon",
  "en": "Gabon",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GM",
  "tr": "Gambiya",
  "en": "Gambia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GH",
  "tr": "Gana",
  "en": "Ghana",
  "flags": []
 },
 {
  "code": "GN",
  "tr": "Gine",
  "en": "Guinea",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GW",
  "tr": "Gine-Bissau",
  "en": "Guinea-Bissau",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GD",
  "tr": "Grenada",
  "en": "Grenada",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "GT",
  "tr": "Guatemala",
  "en": "Guatemala",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "GG",
  "tr": "Guernsey",
  "en": "Guernsey",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "GY",
  "tr": "Guyana",
  "en": "Guyana",
  "flags": []
 },
 {
  "code": "ZA",
  "tr": "Güney Afrika",
  "en": "South Africa",
  "flags": [
   "fatfGrey"
  ]
 },
 {
  "code": "KR",
  "tr": "Güney Kore",
  "en": "South Korea",
  "flags": []
 },
 {
  "code": "SS",
  "tr": "Güney Sudan",
  "en": "South Sudan",
  "flags": [
   "fatfGrey",
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "GE",
  "tr": "Gürcistan",
  "en": "Georgia",
  "flags": []
 },
 {
  "code": "HT",
  "tr": "Haiti",
  "en": "Haiti",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "IN",
  "tr": "Hindistan",
  "en": "India",
  "flags": []
 },
 {
  "code": "NL",
  "tr": "Hollanda",
  "en": "Netherlands",
  "flags": []
 },
 {
  "code": "HN",
  "tr": "Honduras",
  "en": "Honduras",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "HK",
  "tr": "Hong Kong",
  "en": "Hong Kong",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "HR",
  "tr": "Hırvatistan",
  "en": "Croatia",
  "flags": []
 },
 {
  "code": "IQ",
  "tr": "Irak",
  "en": "Iraq",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "JM",
  "tr": "Jamaika",
  "en": "Jamaica",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "JP",
  "tr": "Japonya",
  "en": "Japan",
  "flags": []
 },
 {
  "code": "JE",
  "tr": "Jersey",
  "en": "Jersey",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "KH",
  "tr": "Kamboçya",
  "en": "Cambodia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "CM",
  "tr": "Kamerun",
  "en": "Cameroon",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "CA",
  "tr": "Kanada",
  "en": "Canada",
  "flags": []
 },
 {
  "code": "ME",
  "tr": "Karadağ",
  "en": "Montenegro",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "QA",
  "tr": "Katar",
  "en": "Qatar",
  "flags": []
 },
 {
  "code": "KZ",
  "tr": "Kazakistan",
  "en": "Kazakhstan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "KE",
  "tr": "Kenya",
  "en": "Kenya",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "CO",
  "tr": "Kolombiya",
  "en": "Colombia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "KM",
  "tr": "Komorlar",
  "en": "Comoros",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "CG",
  "tr": "Kongo Cumhuriyeti",
  "en": "Republic of the Congo",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "XK",
  "tr": "Kosova",
  "en": "Kosovo",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "CR",
  "tr": "Kosta Rika",
  "en": "Costa Rica",
  "flags": []
 },
 {
  "code": "KW",
  "tr": "Kuveyt",
  "en": "Kuwait",
  "flags": []
 },
 {
  "code": "KP",
  "tr": "Kuzey Kore",
  "en": "North Korea",
  "flags": [
   "fatfBlack",
   "sanctioned",
   "euHighRisk"
  ]
 },
 {
  "code": "MK",
  "tr": "Kuzey Makedonya",
  "en": "North Macedonia",
  "flags": []
 },
 {
  "code": "CU",
  "tr": "Küba",
  "en": "Cuba",
  "flags": [
   "sanctioned"
  ]
 },
 {
  "code": "CY",
  "tr": "Kıbrıs",
  "en": "Cyprus",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "KG",
  "tr": "Kırgızistan",
  "en": "Kyrgyzstan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "LA",
  "tr": "Laos",
  "en": "Laos",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "LS",
  "tr": "Lesotho",
  "en": "Lesotho",
  "flags": []
 },
 {
  "code": "LV",
  "tr": "Letonya",
  "en": "Latvia",
  "flags": []
 },
 {
  "code": "LR",
  "tr": "Liberya",
  "en": "Liberia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "LY",
  "tr": "Libya",
  "en": "Libya",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "LI",
  "tr": "Lihtenştayn",
  "en": "Liechtenstein",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "LT",
  "tr": "Litvanya",
  "en": "Lithuania",
  "flags": []
 },
 {
  "code": "LB",
  "tr": "Lübnan",
  "en": "Lebanon",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "LU",
  "tr": "Lüksemburg",
  "en": "Luxembourg",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "HU",
  "tr": "Macaristan",
  "en": "Hungary",
  "flags": []
 },
 {
  "code": "MG",
  "tr": "Madagaskar",
  "en": "Madagascar",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MO",
  "tr": "Makao",
  "en": "Macao",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MW",
  "tr": "Malavi",
  "en": "Malawi",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MV",
  "tr": "Maldivler",
  "en": "Maldives",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MY",
  "tr": "Malezya",
  "en": "Malaysia",
  "flags": []
 },
 {
  "code": "ML",
  "tr": "Mali",
  "en": "Mali",
  "flags": [
   "fatfGrey",
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "MT",
  "tr": "Malta",
  "en": "Malta",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "IM",
  "tr": "Man Adası",
  "en": "Isle of Man",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MH",
  "tr": "Marshall Adaları",
  "en": "Marshall Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MU",
  "tr": "Mauritius",
  "en": "Mauritius",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MX",
  "tr": "Meksika",
  "en": "Mexico",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MD",
  "tr": "Moldova",
  "en": "Moldova",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MC",
  "tr": "Monako",
  "en": "Monaco",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "MR",
  "tr": "Moritanya",
  "en": "Mauritania",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "MZ",
  "tr": "Mozambik",
  "en": "Mozambique",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "MN",
  "tr": "Moğolistan",
  "en": "Mongolia",
  "flags": []
 },
 {
  "code": "MM",
  "tr": "Myanmar",
  "en": "Myanmar",
  "flags": [
   "fatfBlack",
   "sanctioned",
   "euHighRisk"
  ]
 },
 {
  "code": "EG",
  "tr": "Mısır",
  "en": "Egypt",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "NA",
  "tr": "Namibya",
  "en": "Namibia",
  "flags": [
   "fatfGrey"
  ]
 },
 {
  "code": "NR",
  "tr": "Nauru",
  "en": "Nauru",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "NP",
  "tr": "Nepal",
  "en": "Nepal",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "NE",
  "tr": "Nijer",
  "en": "Niger",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "NG",
  "tr": "Nijerya",
  "en": "Nigeria",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "NI",
  "tr": "Nikaragua",
  "en": "Nicaragua",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "NU",
  "tr": "Niue",
  "en": "Niue",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "NO",
  "tr": "Norveç",
  "en": "Norway",
  "flags": []
 },
 {
  "code": "CF",
  "tr": "Orta Afrika Cumhuriyeti",
  "en": "Central African Republic",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "PK",
  "tr": "Pakistan",
  "en": "Pakistan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "PA",
  "tr": "Panama",
  "en": "Panama",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "PG",
  "tr": "Papua Yeni Gine",
  "en": "Papua New Guinea",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "PY",
  "tr": "Paraguay",
  "en": "Paraguay",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "PE",
  "tr": "Peru",
  "en": "Peru",
  "flags": []
 },
 {
  "code": "PL",
  "tr": "Polonya",
  "en": "Poland",
  "flags": []
 },
 {
  "code": "PT",
  "tr": "Portekiz",
  "en": "Portugal",
  "flags": []
 },
 {
  "code": "PR",
  "tr": "Porto Riko",
  "en": "Puerto Rico",
  "flags": []
 },
 {
  "code": "RO",
  "tr": "Romanya",
  "en": "Romania",
  "flags": []
 },
 {
  "code": "RW",
  "tr": "Ruanda",
  "en": "Rwanda",
  "flags": []
 },
 {
  "code": "RU",
  "tr": "Rusya",
  "en": "Russia",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "KN",
  "tr": "Saint Kitts ve Nevis",
  "en": "Saint Kitts and Nevis",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "LC",
  "tr": "Saint Lucia",
  "en": "Saint Lucia",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "VC",
  "tr": "Saint Vincent ve Grenadinler",
  "en": "Saint Vincent and the Grenadines",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "WS",
  "tr": "Samoa",
  "en": "Samoa",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "SM",
  "tr": "San Marino",
  "en": "San Marino",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "SN",
  "tr": "Senegal",
  "en": "Senegal",
  "flags": [
   "fatfGrey"
  ]
 },
 {
  "code": "SC",
  "tr": "Seyşeller",
  "en": "Seychelles",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "SL",
  "tr": "Sierra Leone",
  "en": "Sierra Leone",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "SG",
  "tr": "Singapur",
  "en": "Singapore",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "SX",
  "tr": "Sint Maarten",
  "en": "Sint Maarten",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "SK",
  "tr": "Slovakya",
  "en": "Slovakia",
  "flags": []
 },
 {
  "code": "SI",
  "tr": "Slovenya",
  "en": "Slovenia",
  "flags": []
 },
 {
  "code": "SO",
  "tr": "Somali",
  "en": "Somalia",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "LK",
  "tr": "Sri Lanka",
  "en": "Sri Lanka",
  "flags": []
 },
 {
  "code": "SD",
  "tr": "Sudan",
  "en": "Sudan",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "SR",
  "tr": "Surinam",
  "en": "Suriname",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "SY",
  "tr": "Suriye",
  "en": "Syria",
  "flags": [
   "fatfGrey",
   "sanctioned",
   "euHighRisk",
   "weakAml"
  ]
 },
 {
  "code": "SA",
  "tr": "Suudi Arabistan",
  "en": "Saudi Arabia",
  "flags": []
 },
 {
  "code": "ST",
  "tr": "São Tomé ve Príncipe",
  "en": "São Tomé and Príncipe",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "RS",
  "tr": "Sırbistan",
  "en": "Serbia",
  "flags": []
 },
 {
  "code": "TJ",
  "tr": "Tacikistan",
  "en": "Tajikistan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "TZ",
  "tr": "Tanzanya",
  "en": "Tanzania",
  "flags": [
   "fatfGrey",
   "weakAml"
  ]
 },
 {
  "code": "TH",
  "tr": "Tayland",
  "en": "Thailand",
  "flags": []
 },
 {
  "code": "TW",
  "tr": "Tayvan",
  "en": "Taiwan",
  "flags": []
 },
 {
  "code": "TG",
  "tr": "Togo",
  "en": "Togo",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "TO",
  "tr": "Tonga",
  "en": "Tonga",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "TT",
  "tr": "Trinidad ve Tobago",
  "en": "Trinidad and Tobago",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "TN",
  "tr": "Tunus",
  "en": "Tunisia",
  "flags": []
 },
 {
  "code": "TC",
  "tr": "Turks ve Caicos Adaları",
  "en": "Turks and Caicos Islands",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "TR",
  "tr": "Türkiye",
  "en": "Türkiye",
  "flags": []
 },
 {
  "code": "TM",
  "tr": "Türkmenistan",
  "en": "Turkmenistan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "UG",
  "tr": "Uganda",
  "en": "Uganda",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "UA",
  "tr": "Ukrayna",
  "en": "Ukraine",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "OM",
  "tr": "Umman",
  "en": "Oman",
  "flags": []
 },
 {
  "code": "UY",
  "tr": "Uruguay",
  "en": "Uruguay",
  "flags": []
 },
 {
  "code": "VU",
  "tr": "Vanuatu",
  "en": "Vanuatu",
  "flags": [
   "offshore"
  ]
 },
 {
  "code": "VA",
  "tr": "Vatikan",
  "en": "Vatican City",
  "flags": []
 },
 {
  "code": "VE",
  "tr": "Venezuela",
  "en": "Venezuela",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "VN",
  "tr": "Vietnam",
  "en": "Vietnam",
  "flags": [
   "fatfGrey"
  ]
 },
 {
  "code": "YE",
  "tr": "Yemen",
  "en": "Yemen",
  "flags": [
   "fatfGrey",
   "sanctioned",
   "euHighRisk",
   "weakAml"
  ]
 },
 {
  "code": "NZ",
  "tr": "Yeni Zelanda",
  "en": "New Zealand",
  "flags": []
 },
 {
  "code": "GR",
  "tr": "Yunanistan",
  "en": "Greece",
  "flags": []
 },
 {
  "code": "ZM",
  "tr": "Zambiya",
  "en": "Zambia",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "ZW",
  "tr": "Zimbabve",
  "en": "Zimbabwe",
  "flags": [
   "sanctioned",
   "weakAml"
  ]
 },
 {
  "code": "TD",
  "tr": "Çad",
  "en": "Chad",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "CZ",
  "tr": "Çekya",
  "en": "Czechia",
  "flags": []
 },
 {
  "code": "CN",
  "tr": "Çin",
  "en": "China",
  "flags": []
 },
 {
  "code": "UZ",
  "tr": "Özbekistan",
  "en": "Uzbekistan",
  "flags": [
   "weakAml"
  ]
 },
 {
  "code": "JO",
  "tr": "Ürdün",
  "en": "Jordan",
  "flags": []
 },
 {
  "code": "IR",
  "tr": "İran",
  "en": "Iran",
  "flags": [
   "fatfBlack",
   "sanctioned",
   "euHighRisk"
  ]
 },
 {
  "code": "IE",
  "tr": "İrlanda",
  "en": "Ireland",
  "flags": []
 },
 {
  "code": "ES",
  "tr": "İspanya",
  "en": "Spain",
  "flags": []
 },
 {
  "code": "IL",
  "tr": "İsrail",
  "en": "Israel",
  "flags": []
 },
 {
  "code": "SE",
  "tr": "İsveç",
  "en": "Sweden",
  "flags": []
 },
 {
  "code": "CH",
  "tr": "İsviçre",
  "en": "Switzerland",
  "flags": []
 },
 {
  "code": "IT",
  "tr": "İtalya",
  "en": "Italy",
  "flags": []
 },
 {
  "code": "IS",
  "tr": "İzlanda",
  "en": "Iceland",
  "flags": []
 },
 {
  "code": "CL",
  "tr": "Şili",
  "en": "Chile",
  "flags": []
 }
];
