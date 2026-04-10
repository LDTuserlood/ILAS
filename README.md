# 🚀 ILAS - Intelligent Legal Assistant System

### Hệ thống Hỗ trợ Pháp lý cho Người lao động

---

## 📌 Giới thiệu dự án

ILAS là hệ thống web full-stack gồm:

* 🔧 **Backend:** Java Spring Boot
* 🎨 **Frontend:** React
* 🐍 **Python:** Xử lý dữ liệu, crawler, AI

👉 Ứng dụng cung cấp:

* Tra cứu luật pháp
* Hỗ trợ pháp lý cho người lao động
* Chatbot AI thông minh

---

## ⚙️ Yêu cầu hệ thống

| Công nghệ | Phiên bản  |
| --------- | ---------- |
| Java      | JDK 17+    |
| Node.js   | 14+        |
| NPM       | 6+         |
| Python    | 3.8+       |
| MySQL     | 8.0+       |
| Git       | (tùy chọn) |

---

## 🛠️ Cài đặt dự án

### 1️⃣ Clone repository

```bash
git clone <repository-url>
cd ILAS
```

---

### 2️⃣ Backend (Spring Boot)

```bash
cd backend
```

📌 Cấu hình database trong:

```
backend/src/main/resources/application.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ilas_db
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD
```

▶️ Build & chạy:

```bash
./mvnw clean install
./mvnw spring-boot:run
```

👉 Backend chạy tại:

```
http://localhost:8080
```

---

### 3️⃣ Frontend (React)

```bash
cd frontend
npm install
npm start
```

👉 Frontend chạy tại:

```
http://localhost:3000
```

---

### 4️⃣ Python (Crawler & AI)

```bash
cd python
python -m venv venv
```

👉 Activate:

```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

👉 Cài thư viện:

```bash
pip install -r requirements.txt
```

👉 Tạo file `.env` và cấu hình nếu cần

👉 Chạy crawler:

```bash
python crawler/run_crawl.py
```

---

### 5️⃣ Kiểm tra hệ thống

* 🌐 Frontend: http://localhost:3000
* 🔌 API: http://localhost:8080/api/health

---

## 📁 Cấu trúc thư mục

```bash
ILAS/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── python/
│   ├── crawler/
│   ├── vector_store/
│   ├── bm25_index/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## ⚡ Quick Start

Mở **3 terminal**:

```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2
cd frontend && npm start

# Terminal 3
cd python && python -m venv venv && pip install -r requirements.txt
```

👉 Truy cập:

```
http://localhost:3000
```

---

## 🧰 Công nghệ sử dụng

### 🔧 Backend

* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* Hibernate
* Maven

### 🎨 Frontend

* React
* React Router
* Axios
* Bootstrap + Tailwind
* Recharts

### 🐍 Python

* Flask
* BeautifulSoup
* Playwright
* Sentence Transformers
* BM25

### 🗄️ Database

* MySQL / MariaDB

---

## 🛠️ Tools phát triển

* Git
* VS Code
* Postman
* MySQL Workbench

---

## 📞 Hỗ trợ

Nếu gặp lỗi:

1. Kiểm tra system requirements
2. Kiểm tra cấu hình `.env`
3. Kiểm tra logs
4. Liên hệ team phát triển

---

## 📅 Cập nhật

**20/2/2026**

---
