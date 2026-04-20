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
cd LSSW
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
spring.datasource.url=jdbc:mysql://localhost:3306/lssw_db
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
nếu ko dc 
python -m crawler.run_crawl
```

---

### 5️⃣ Kiểm tra hệ thống

* 🌐 Frontend: http://localhost:3000
* 🔌 API: http://localhost:8080/api/health

---

## 📁 Cấu trúc thư mục

```bash
LSSW/
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
backend
├── logs
│   ├── lssw-application.log.2025-10-24.0.gz
│   ├── lssw-application.log.2025-10-26.0.gz
│   └── lssw-application.log.2025-10-27.0.gz
├── mvnw
├── mvnw.cmd
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── C1SE61
│   │   │           └── backend
│   │   │               ├── LsswApplication.java
│   │   │               ├── config
│   │   │               │   ├── DatabaseConfig.java
│   │   │               │   ├── FileStorageConfig.java
│   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │               │   └── SecurityConfig.java
│   │   │               ├── controller
│   │   │               │   ├── TrackController.java
│   │   │               │   ├── admin
│   │   │               │   │   ├── AdminCrawlerController.java
│   │   │               │   │   ├── AdminReportController.java
│   │   │               │   │   └── AdminUserController.java
│   │   │               │   ├── ai
│   │   │               │   │   ├── AISummarizeController.java
│   │   │               │   │   └── ChatbotController.java
│   │   │               │   ├── auth
│   │   │               │   │   └── AuthController.java
│   │   │               │   ├── editor
│   │   │               │   │   ├── ArticleController.java
│   │   │               │   │   ├── EditorArticleManagementController.java
│   │   │               │   │   ├── EditorChapterManagementController.java
│   │   │               │   │   ├── EditorFeedbackManagementController.java
│   │   │               │   │   ├── EditorFormManagementController.java
│   │   │               │   │   ├── EditorFormTemplateController.java
│   │   │               │   │   ├── EditorLawManagementController.java
│   │   │               │   │   ├── EditorSimplifiedManagementController.java
│   │   │               │   │   ├── FeedbackEditorController.java
│   │   │               │   │   ├── FeedbackStatsController.java
│   │   │               │   │   ├── FormStatsController.java
│   │   │               │   │   ├── LawStatsController.java
│   │   │               │   │   └── SimplifiedArticleController.java
│   │   │               │   └── user
│   │   │               │       ├── FeedbackController.java
│   │   │               │       ├── LawController.java
│   │   │               │       ├── UserAccountController.java
│   │   │               │       └── UserFormTemplateController.java
│   │   │               ├── dto
│   │   │               │   ├── common
│   │   │               │   │   └── ApiResponse.java
│   │   │               │   ├── request
│   │   │               │   │   ├── admin
│   │   │               │   │   │   ├── AdminLawRequest.java
│   │   │               │   │   │   ├── CreateUserRequest.java
│   │   │               │   │   │   └── UpdateUserRequest.java
│   │   │               │   │   ├── ai
│   │   │               │   │   │   ├── ChatRequestDTO.java
│   │   │               │   │   │   └── SummarizeRequest.java
│   │   │               │   │   ├── auth
│   │   │               │   │   │   ├── ChangePasswordRequest.java
│   │   │               │   │   │   ├── LoginRequestDTO.java
│   │   │               │   │   │   └── RegisterRequestDTO.java
│   │   │               │   │   ├── editor
│   │   │               │   │   │   ├── FormTemplateRequest.java
│   │   │               │   │   │   └── SimplifiedArticleRequestDTO.java
│   │   │               │   │   └── user
│   │   │               │   │       ├── FeedbackRequestDTO.java
│   │   │               │   │       └── UserAccountRequest.java
│   │   │               │   └── response
│   │   │               │       ├── admin
│   │   │               │       │   ├── AdminFeedbackResponseDTO.java
│   │   │               │       │   ├── AdminFormTemplateResponse.java
│   │   │               │       │   ├── ArticleAdminDTO.java
│   │   │               │       │   ├── ChapterAdminDTO.java
│   │   │               │       │   ├── ReportResponse.java
│   │   │               │       │   ├── TopSearchDTO.java
│   │   │               │       │   ├── UserResponseDTO.java
│   │   │               │       │   └── WeeklyAccessDTO.java
│   │   │               │       ├── ai
│   │   │               │       │   ├── ChatHistoryDTO.java
│   │   │               │       │   ├── ChatResponseDTO.java
│   │   │               │       │   ├── ChatbotLogAdminDTO.java
│   │   │               │       │   └── TopQuestionResponse.java
│   │   │               │       ├── auth
│   │   │               │       │   └── LoginResponseDTO.java
│   │   │               │       ├── editor
│   │   │               │       │   ├── FeedbackEditorResponse.java
│   │   │               │       │   ├── FeedbackStatsResponse.java
│   │   │               │       │   ├── FormTemplateResponse.java
│   │   │               │       │   ├── LawStatsResponse.java
│   │   │               │       │   └── SimplifiedArticleResponseDTO.java
│   │   │               │       └── user
│   │   │               │           ├── ArticleDTO.java
│   │   │               │           ├── FeedbackDTO.java
│   │   │               │           ├── FormTemplateDTO.java
│   │   │               │           ├── LawDTO.java
│   │   │               │           ├── SimplifiedArticleDTO.java
│   │   │               │           └── UserAccountResponse.java
│   │   │               ├── model
│   │   │               │   ├── Article.java
│   │   │               │   ├── AuditLog.java
│   │   │               │   ├── Chapter.java
│   │   │               │   ├── ChatbotLog.java
│   │   │               │   ├── ChatbotSettings.java
│   │   │               │   ├── Feedback.java
│   │   │               │   ├── FormTemplate.java
│   │   │               │   ├── Law.java
│   │   │               │   ├── PageViewLog.java
│   │   │               │   ├── Role.java
│   │   │               │   ├── SearchLog.java
│   │   │               │   ├── Section.java
│   │   │               │   ├── SimplifiedArticle.java
│   │   │               │   └── UserAccount.java
│   │   │               ├── repository
│   │   │               │   ├── ArticleRepository.java
│   │   │               │   ├── AuditLogRepository.java
│   │   │               │   ├── ChapterRepository.java
│   │   │               │   ├── ChatbotLogRepository.java
│   │   │               │   ├── ChatbotSettingsRepository.java
│   │   │               │   ├── FeedbackRepository.java
│   │   │               │   ├── FormTemplateRepository.java
│   │   │               │   ├── LawRepository.java
│   │   │               │   ├── PageViewLogRepository.java
│   │   │               │   ├── RoleRepository.java
│   │   │               │   ├── SearchLogRepository.java
│   │   │               │   ├── SimplifiedArticleRepository.java
│   │   │               │   └── UserAccountRepository.java
│   │   │               ├── service
│   │   │               │   ├── admin
│   │   │               │   │   ├── AdminReportService.java
│   │   │               │   │   ├── AdminUserService.java
│   │   │               │   │   └── ReportExportService.java
│   │   │               │   ├── ai
│   │   │               │   │   ├── ChatbotAdminService.java
│   │   │               │   │   ├── ChatbotService.java
│   │   │               │   │   └── GroqService.java
│   │   │               │   ├── auth
│   │   │               │   │   └── AuthService.java
│   │   │               │   ├── editor
│   │   │               │   │   ├── EditorArticleManagementService.java
│   │   │               │   │   ├── EditorChapterManagementService.java
│   │   │               │   │   ├── EditorFeedbackManagementService.java
│   │   │               │   │   ├── EditorFormManagementService.java
│   │   │               │   │   ├── EditorFormTemplateService.java
│   │   │               │   │   ├── EditorLawManagementService.java
│   │   │               │   │   ├── EditorSimplifiedManagementService.java
│   │   │               │   │   ├── FeedbackEditorService.java
│   │   │               │   │   ├── FeedbackStatsService.java
│   │   │               │   │   ├── LawStatsService.java
│   │   │               │   │   └── SimplifiedArticleService.java
│   │   │               │   ├── log
│   │   │               │   │   ├── AuditLogService.java
│   │   │               │   │   └── SearchLogService.java
│   │   │               │   └── user
│   │   │               │       ├── CustomUserDetailsService.java
│   │   │               │       ├── DataInitializer.java
│   │   │               │       ├── FeedbackService.java
│   │   │               │       ├── LawService.java
│   │   │               │       ├── UserAccountService.java
│   │   │               │       └── UserFormTemplateService.java
│   │   │               └── util
│   │   │                   └── JwtUtil.java
│   │   └── resources
│   │       └── application.properties
│   └── test
│       └── java
│           └── com
│               └── C1SE61
│                   └── LSSW
│                       └── LsswApplicationTests.java
└── target
    ├── classes
    │   ├── application.properties
    │   └── com
    │       └── C1SE61
    │           └── backend
    │               ├── LsswApplication.class
    │               ├── config
    │               │   ├── DatabaseConfig.class
    │               │   ├── FileStorageConfig.class
    │               │   ├── JwtAuthenticationFilter.class
    │               │   └── SecurityConfig.class
    │               ├── controller
    │               │   ├── TrackController.class
    │               │   ├── admin
    │               │   │   ├── AdminCrawlerController.class
    │               │   │   ├── AdminReportController.class
    │               │   │   └── AdminUserController.class
    │               │   ├── ai
    │               │   │   ├── AISummarizeController.class
    │               │   │   └── ChatbotController.class
    │               │   ├── auth
    │               │   │   └── AuthController.class
    │               │   ├── editor
    │               │   │   ├── ArticleController.class
    │               │   │   ├── EditorArticleManagementController.class
    │               │   │   ├── EditorChapterManagementController.class
    │               │   │   ├── EditorFeedbackManagementController.class
    │               │   │   ├── EditorFormManagementController.class
    │               │   │   ├── EditorFormTemplateController.class
    │               │   │   ├── EditorLawManagementController.class
    │               │   │   ├── EditorSimplifiedManagementController.class
    │               │   │   ├── FeedbackEditorController.class
    │               │   │   ├── FeedbackStatsController.class
    │               │   │   ├── FormStatsController.class
    │               │   │   ├── LawStatsController.class
    │               │   │   └── SimplifiedArticleController.class
    │               │   └── user
    │               │       ├── FeedbackController.class
    │               │       ├── LawController.class
    │               │       ├── UserAccountController.class
    │               │       └── UserFormTemplateController.class
    │               ├── dto
    │               │   ├── common
    │               │   │   └── ApiResponse.class
    │               │   ├── request
    │               │   │   ├── admin
    │               │   │   │   ├── AdminLawRequest.class
    │               │   │   │   ├── CreateUserRequest.class
    │               │   │   │   └── UpdateUserRequest.class
    │               │   │   ├── ai
    │               │   │   │   ├── ChatRequestDTO.class
    │               │   │   │   └── SummarizeRequest.class
    │               │   │   ├── auth
    │               │   │   │   ├── ChangePasswordRequest.class
    │               │   │   │   ├── LoginRequestDTO.class
    │               │   │   │   └── RegisterRequestDTO.class
    │               │   │   ├── editor
    │               │   │   │   ├── FormTemplateRequest.class
    │               │   │   │   ├── SimplifiedArticleRequestDTO$SimplifiedArticleRequestDTOBuilder.class
    │               │   │   │   └── SimplifiedArticleRequestDTO.class
    │               │   │   └── user
    │               │   │       ├── FeedbackRequestDTO.class
    │               │   │       └── UserAccountRequest.class
    │               │   └── response
    │               │       ├── admin
    │               │       │   ├── AdminFeedbackResponseDTO$AdminFeedbackResponseDTOBuilder.class
    │               │       │   ├── AdminFeedbackResponseDTO.class
    │               │       │   ├── AdminFormTemplateResponse$AdminFormTemplateResponseBuilder.class
    │               │       │   ├── AdminFormTemplateResponse.class
    │               │       │   ├── ArticleAdminDTO$ArticleAdminDTOBuilder.class
    │               │       │   ├── ArticleAdminDTO.class
    │               │       │   ├── ChapterAdminDTO$ChapterAdminDTOBuilder.class
    │               │       │   ├── ChapterAdminDTO.class
    │               │       │   ├── ReportResponse$CategoryShare$CategoryShareBuilder.class
    │               │       │   ├── ReportResponse$CategoryShare.class
    │               │       │   ├── ReportResponse$DailyMetric$DailyMetricBuilder.class
    │               │       │   ├── ReportResponse$DailyMetric.class
    │               │       │   ├── ReportResponse$PeriodInfo$PeriodInfoBuilder.class
    │               │       │   ├── ReportResponse$PeriodInfo.class
    │               │       │   ├── ReportResponse$ReportResponseBuilder.class
    │               │       │   ├── ReportResponse$Summary$SummaryBuilder.class
    │               │       │   ├── ReportResponse$Summary.class
    │               │       │   ├── ReportResponse$TopContentItem$TopContentItemBuilder.class
    │               │       │   ├── ReportResponse$TopContentItem.class
    │               │       │   ├── ReportResponse.class
    │               │       │   ├── TopSearchDTO.class
    │               │       │   ├── UserResponseDTO.class
    │               │       │   └── WeeklyAccessDTO.class
    │               │       ├── ai
    │               │       │   ├── ChatHistoryDTO.class
    │               │       │   ├── ChatResponseDTO.class
    │               │       │   ├── ChatbotLogAdminDTO.class
    │               │       │   └── TopQuestionResponse.class
    │               │       ├── auth
    │               │       │   └── LoginResponseDTO.class
    │               │       ├── editor
    │               │       │   ├── FeedbackEditorResponse$FeedbackEditorResponseBuilder.class
    │               │       │   ├── FeedbackEditorResponse.class
    │               │       │   ├── FeedbackStatsResponse$MonthlyStats.class
    │               │       │   ├── FeedbackStatsResponse$RecentFeedback.class
    │               │       │   ├── FeedbackStatsResponse$Stats.class
    │               │       │   ├── FeedbackStatsResponse.class
    │               │       │   ├── FormTemplateResponse.class
    │               │       │   ├── LawStatsResponse$LawStatsResponseBuilder.class
    │               │       │   ├── LawStatsResponse$MonthlyActivity.class
    │               │       │   ├── LawStatsResponse$RecentWork.class
    │               │       │   ├── LawStatsResponse$Stats.class
    │               │       │   ├── LawStatsResponse.class
    │               │       │   ├── SimplifiedArticleResponseDTO$SimplifiedArticleResponseDTOBuilder.class
    │               │       │   └── SimplifiedArticleResponseDTO.class
    │               │       └── user
    │               │           ├── ArticleDTO$ArticleDTOBuilder.class
    │               │           ├── ArticleDTO.class
    │               │           ├── FeedbackDTO.class
    │               │           ├── FormTemplateDTO.class
    │               │           ├── LawDTO.class
    │               │           ├── SimplifiedArticleDTO.class
    │               │           └── UserAccountResponse.class
    │               ├── model
    │               │   ├── Article$ArticleBuilder.class
    │               │   ├── Article.class
    │               │   ├── AuditLog$AuditLogBuilder.class
    │               │   ├── AuditLog.class
    │               │   ├── Chapter$ChapterBuilder.class
    │               │   ├── Chapter$ChapterStatus.class
    │               │   ├── Chapter.class
    │               │   ├── ChatbotLog$ChatbotLogBuilder.class
    │               │   ├── ChatbotLog.class
    │               │   ├── ChatbotSettings.class
    │               │   ├── Feedback$FeedbackBuilder.class
    │               │   ├── Feedback$Status.class
    │               │   ├── Feedback.class
    │               │   ├── FormTemplate$FormTemplateBuilder.class
    │               │   ├── FormTemplate$Status.class
    │               │   ├── FormTemplate.class
    │               │   ├── Law$LawBuilder.class
    │               │   ├── Law.class
    │               │   ├── PageViewLog$PageViewLogBuilder.class
    │               │   ├── PageViewLog.class
    │               │   ├── Role$RoleBuilder.class
    │               │   ├── Role.class
    │               │   ├── SearchLog$SearchLogBuilder.class
    │               │   ├── SearchLog.class
    │               │   ├── Section$SectionBuilder.class
    │               │   ├── Section.class
    │               │   ├── SimplifiedArticle$SimplifiedArticleBuilder.class
    │               │   ├── SimplifiedArticle$Status.class
    │               │   ├── SimplifiedArticle.class
    │               │   ├── UserAccount$UserAccountBuilder.class
    │               │   └── UserAccount.class
    │               ├── repository
    │               │   ├── ArticleRepository.class
    │               │   ├── AuditLogRepository.class
    │               │   ├── ChapterRepository.class
    │               │   ├── ChatbotLogRepository.class
    │               │   ├── ChatbotSettingsRepository.class
    │               │   ├── FeedbackRepository.class
    │               │   ├── FormTemplateRepository.class
    │               │   ├── LawRepository.class
    │               │   ├── PageViewLogRepository.class
    │               │   ├── RoleRepository.class
    │               │   ├── SearchLogRepository.class
    │               │   ├── SimplifiedArticleRepository.class
    │               │   └── UserAccountRepository.class
    │               ├── service
    │               │   ├── admin
    │               │   │   ├── AdminReportService$DateRange.class
    │               │   │   ├── AdminReportService.class
    │               │   │   ├── AdminUserService.class
    │               │   │   └── ReportExportService.class
    │               │   ├── ai
    │               │   │   ├── ChatbotAdminService.class
    │               │   │   ├── ChatbotService.class
    │               │   │   └── GroqService.class
    │               │   ├── auth
    │               │   │   └── AuthService.class
    │               │   ├── editor
    │               │   │   ├── EditorArticleManagementService.class
    │               │   │   ├── EditorChapterManagementService.class
    │               │   │   ├── EditorFeedbackManagementService$1.class
    │               │   │   ├── EditorFeedbackManagementService.class
    │               │   │   ├── EditorFormManagementService.class
    │               │   │   ├── EditorFormTemplateService.class
    │               │   │   ├── EditorLawManagementService.class
    │               │   │   ├── EditorSimplifiedManagementService.class
    │               │   │   ├── FeedbackEditorService.class
    │               │   │   ├── FeedbackStatsService.class
    │               │   │   ├── LawStatsService.class
    │               │   │   └── SimplifiedArticleService.class
    │               │   ├── log
    │               │   │   ├── AuditLogService.class
    │               │   │   └── SearchLogService.class
    │               │   └── user
    │               │       ├── CustomUserDetailsService.class
    │               │       ├── DataInitializer.class
    │               │       ├── FeedbackService.class
    │               │       ├── LawService$SearchResultDTO.class
    │               │       ├── LawService.class
    │               │       ├── UserAccountService.class
    │               │       └── UserFormTemplateService.class
    │               └── util
    │                   └── JwtUtil.class
    ├── generated-sources
    │   └── annotations
    ├── generated-test-sources
    │   └── test-annotations
    ├── maven-status
    │   └── maven-compiler-plugin
    │       ├── compile
    │       │   └── default-compile
    │       │       ├── createdFiles.lst
    │       │       └── inputFiles.lst
    │       └── testCompile
    │           └── default-testCompile
    │               ├── createdFiles.lst
    │               └── inputFiles.lst
    └── test-classes
        └── com
            └── C1SE61
                └── LSSW
                    └── LsswApplicationTests.class
.gitattributes
.gitignore
mvnw
mvnw.cmd
pom.xml
frontend
├── README.md
│
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── browserconfig.xml
│   ├── favicon.ico
│   ├── image
│   │   ├── Law.png
│   │   ├── icon.png
│   │   ├── logo.png
│   │   └── lssw.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src
│   ├── App.jsx
│   ├── api
│   │   ├── adminUser.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── chatbotAPI.js
│   │   ├── feedback.js
│   │   ├── feedbackEditorAPI.js
│   │   ├── form.js
│   │   ├── law.js
│   │   ├── report.js
│   │   ├── track.js
│   │   └── userProfile.js
│   ├── components
│   │   ├── chatbot
│   │   │   ├── ChatHistoryPage.jsx
│   │   │   └── ChatWidget.jsx
│   │   ├── editor
│   │   │   ├── EditorSidebar.jsx
│   │   │   ├── EditorWorkspace.jsx
│   │   │   └── FormModal.jsx
│   │   ├── layout
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   └── user
│   │       └── UserSidebar.jsx
│   ├── contexts
│   │   └── AuthContext.js
│   ├── index.js
│   ├── layouts
│   │   ├── AdminLayout.jsx
│   │   ├── EditorLayout.jsx
│   │   └── UserLayout.jsx
│   ├── pages
│   │   ├── admin
│   │   │   ├── Chatbot.jsx
│   │   │   ├── CrawlLaws.jsx
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── Feedback.jsx
│   │   │   ├── Laws.jsx
│   │   │   ├── Logs.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── auth
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── editor
│   │   │   ├── DashboardEditor.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── FormPage.jsx
│   │   │   └── SimplifyPage.jsx
│   │   ├── public
│   │   │   ├── AboutPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   └── user
│   │       ├── DashboardPage.jsx
│   │       ├── FormPage.jsx
│   │       ├── HelpContactPage.jsx
│   │       ├── UserSearch.jsx
│   │       └── UserSearchDetail.jsx
│   ├── routes
│   │   └── PrivateRoute.jsx
│   ├── styles
│   │   ├── admin
│   │   │   ├── AdminLayout.css
│   │   │   ├── DashboardAdmin.css
│   │   │   ├── ManageUser.css
│   │   │   ├── chatbot.css
│   │   │   ├── crawl-laws.css
│   │   │   ├── feedback.css
│   │   │   ├── laws.css
│   │   │   ├── logs.css
│   │   │   ├── reports.css
│   │   │   ├── settings.css
│   │   │   └── simplified.css
│   │   ├── auth
│   │   │   ├── Login.css
│   │   │   └── Register.css
│   │   ├── chatbot
│   │   │   ├── ChatHistory.css
│   │   │   └── ChatWidget.css
│   │   ├── editor
│   │   │   ├── DashboardEditor.css
│   │   │   ├── EditorLayout.css
│   │   │   ├── EditorWorkspace.css
│   │   │   ├── FeedbackPage.css
│   │   │   ├── FormModal.css
│   │   │   ├── FormPage.css
│   │   │   └── SimplifyPage.css
│   │   ├── global.css
│   │   ├── landing
│   │   │   ├── Footer.css
│   │   │   └── Header.css
│   │   ├── public
│   │   │   ├── AboutPage.css
│   │   │   └── LandingPage.css
│   │   └── user
│   │       ├── DashboardPage.css
│   │       ├── FormPage.css
│   │       ├── HelpContactPage.css
│   │       ├── ProfilePage.css
│   │       ├── UserSearch.css
│   │       └── UserSearchDetail.css
│   └── utils
│       └── notifications.js
App.jsx
index.js
.gitignore
package-lock.json
package.json
tailwind.config.js
python
├── __init__.py
├── __pycache__
│   └── db_core.cpython-313.pyc
├── ai
│   ├── __init__.py
│   ├── app.py
│   ├── bm25_index.py
│   ├── build_vector_store_chunks.py
│   ├── build_vector_store_faq.py
│   ├── build_vector_store_simplified.py
│   ├── context_builder.py
│   ├── groq_service.py
│   ├── legal_rag_pipeline.py
│   ├── legal_topic_boost.py
│   ├── local_embedder.py
│   ├── rebuild_all.py
│   ├── retrieval_level6.py
│   └── topic_cluster_builder.py
├── bm25_index
│   ├── articles_bm25.pkl
│   ├── articles_chunks_bm25.pkl
│   ├── faq_bm25.pkl
│   └── simplified_bm25.pkl
├── crawler
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-313.pyc
│   │   ├── archive_cleanup.cpython-313.pyc
│   │   ├── content_cleaner.cpython-313.pyc
│   │   ├── crawl_law.cpython-313.pyc
│   │   ├── db.cpython-313.pyc
│   │   ├── db_inserts.cpython-313.pyc
│   │   ├── log_utils.cpython-313.pyc
│   │   ├── metadata_extractor.cpython-313.pyc
│   │   ├── run_crawl.cpython-313.pyc
│   │   └── run_crawl_api.cpython-313.pyc
│   ├── archive_cleanup.py
│   ├── content_cleaner.py
│   ├── crawl_law.py
│   ├── db.py
│   ├── db_inserts.py
│   ├── log_utils.py
│   ├── metadata_extractor.py
│   ├── run_crawl.py
│   └── run_crawl_api.py
├── db_core.log
├── db_core.py
├── requirements.txt
├── vector_store
│   ├── articles
│   │   ├── chunks
│   │   │   ├── meta.json
│   │   │   ├── topic_centroids.npy
│   │   │   └── vectors.npy
│   │   ├── meta.json
│   │   ├── topic_centroids.npy
│   │   └── vectors.npy
│   ├── faq
│   │   ├── meta.json
│   │   ├── topic_centroids.npy
│   │   └── vectors.npy
│   ├── forms
│   │   ├── meta.json
│   │   └── vectors.npy
│   └── simplified
│       ├── meta.json
│       ├── topic_centroids.npy
│       └── vectors.npy
└── venv
    ├── Include
    ├── Lib
    │   └── site-packages
    │       ├── pip
    │       └── pip-25.2.dist-info
    │           ├── INSTALLER
    │           ├── METADATA
    │           ├── RECORD
    │           ├── REQUESTED
    │           ├── WHEEL
    │           ├── entry_points.txt
    │           ├── licenses
    │           │   ├── AUTHORS.txt
    │           │   ├── LICENSE.txt
    │           │   └── src
    │           │       └── pip
    │           │           └── _vendor
    │           │               ├── cachecontrol
    │           │               │   └── LICENSE.txt
    │           │               ├── certifi
    │           │               │   └── LICENSE
    │           │               ├── dependency_groups
    │           │               │   └── LICENSE.txt
    │           │               ├── distlib
    │           │               │   └── LICENSE.txt
    │           │               ├── distro
    │           │               │   └── LICENSE
    │           │               ├── idna
    │           │               │   └── LICENSE.md
    │           │               ├── msgpack
    │           │               │   └── COPYING
    │           │               ├── packaging
    │           │               │   ├── LICENSE
    │           │               │   ├── LICENSE.APACHE
    │           │               │   └── LICENSE.BSD
    │           │               ├── pkg_resources
    │           │               │   └── LICENSE
    │           │               ├── platformdirs
    │           │               │   └── LICENSE
    │           │               ├── pygments
    │           │               │   └── LICENSE
    │           │               ├── pyproject_hooks
    │           │               │   └── LICENSE
    │           │               ├── requests
    │           │               │   └── LICENSE
    │           │               ├── resolvelib
    │           │               │   └── LICENSE
    │           │               ├── rich
    │           │               │   └── LICENSE
    │           │               ├── tomli
    │           │               │   ├── LICENSE
    │           │               │   └── LICENSE-HEADER
    │           │               ├── tomli_w
    │           │               │   └── LICENSE
    │           │               ├── truststore
    │           │               │   └── LICENSE
    │           │               └── urllib3
    │           │                   └── LICENSE.txt
    │           ├── top_level.txt
    │           ├── __init__.py
    │           ├── __main__.py
    │           ├── __pip-runner__.py
    │           ├── __pycache__
    │           │   ├── __init__.cpython-313.pyc
    │           │   ├── __main__.cpython-313.pyc
    │           │   └── __pip-runner__.cpython-313.pyc
    │           ├── _internal
    │           │   ├── __init__.py
    │           │   ├── __pycache__
    │           │   │   ├── __init__.cpython-313.pyc
    │           │   │   ├── build_env.cpython-313.pyc
    │           │   │   ├── cache.cpython-313.pyc
    │           │   │   ├── configuration.cpython-313.pyc
    │           │   │   ├── exceptions.cpython-313.pyc
    │           │   │   ├── main.cpython-313.pyc
    │           │   │   ├── pyproject.cpython-313.pyc
    │           │   │   ├── self_outdated_check.cpython-313.pyc
    │           │   │   └── wheel_builder.cpython-313.pyc
    │           │   ├── build_env.py
    │           │   ├── cache.py
    │           │   ├── cli
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── autocompletion.cpython-313.pyc
    │           │   │   │   ├── base_command.cpython-313.pyc
    │           │   │   │   ├── cmdoptions.cpython-313.pyc
    │           │   │   │   ├── command_context.cpython-313.pyc
    │           │   │   │   ├── index_command.cpython-313.pyc
    │           │   │   │   ├── main.cpython-313.pyc
    │           │   │   │   ├── main_parser.cpython-313.pyc
    │           │   │   │   ├── parser.cpython-313.pyc
    │           │   │   │   ├── progress_bars.cpython-313.pyc
    │           │   │   │   ├── req_command.cpython-313.pyc
    │           │   │   │   ├── spinners.cpython-313.pyc
    │           │   │   │   └── status_codes.cpython-313.pyc
    │           │   │   ├── autocompletion.py
    │           │   │   ├── base_command.py
    │           │   │   ├── cmdoptions.py
    │           │   │   ├── command_context.py
    │           │   │   ├── index_command.py
    │           │   │   ├── main.py
    │           │   │   ├── main_parser.py
    │           │   │   ├── parser.py
    │           │   │   ├── progress_bars.py
    │           │   │   ├── req_command.py
    │           │   │   ├── spinners.py
    │           │   │   └── status_codes.py
    │           │   ├── commands
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── cache.cpython-313.pyc
    │           │   │   │   ├── check.cpython-313.pyc
    │           │   │   │   ├── completion.cpython-313.pyc
    │           │   │   │   ├── configuration.cpython-313.pyc
    │           │   │   │   ├── debug.cpython-313.pyc
    │           │   │   │   ├── download.cpython-313.pyc
    │           │   │   │   ├── freeze.cpython-313.pyc
    │           │   │   │   ├── hash.cpython-313.pyc
    │           │   │   │   ├── help.cpython-313.pyc
    │           │   │   │   ├── index.cpython-313.pyc
    │           │   │   │   ├── inspect.cpython-313.pyc
    │           │   │   │   ├── install.cpython-313.pyc
    │           │   │   │   ├── list.cpython-313.pyc
    │           │   │   │   ├── lock.cpython-313.pyc
    │           │   │   │   ├── search.cpython-313.pyc
    │           │   │   │   ├── show.cpython-313.pyc
    │           │   │   │   ├── uninstall.cpython-313.pyc
    │           │   │   │   └── wheel.cpython-313.pyc
    │           │   │   ├── cache.py
    │           │   │   ├── check.py
    │           │   │   ├── completion.py
    │           │   │   ├── configuration.py
    │           │   │   ├── debug.py
    │           │   │   ├── download.py
    │           │   │   ├── freeze.py
    │           │   │   ├── hash.py
    │           │   │   ├── help.py
    │           │   │   ├── index.py
    │           │   │   ├── inspect.py
    │           │   │   ├── install.py
    │           │   │   ├── list.py
    │           │   │   ├── lock.py
    │           │   │   ├── search.py
    │           │   │   ├── show.py
    │           │   │   ├── uninstall.py
    │           │   │   └── wheel.py
    │           │   ├── configuration.py
    │           │   ├── distributions
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── base.cpython-313.pyc
    │           │   │   │   ├── installed.cpython-313.pyc
    │           │   │   │   ├── sdist.cpython-313.pyc
    │           │   │   │   └── wheel.cpython-313.pyc
    │           │   │   ├── base.py
    │           │   │   ├── installed.py
    │           │   │   ├── sdist.py
    │           │   │   └── wheel.py
    │           │   ├── exceptions.py
    │           │   ├── index
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── collector.cpython-313.pyc
    │           │   │   │   ├── package_finder.cpython-313.pyc
    │           │   │   │   └── sources.cpython-313.pyc
    │           │   │   ├── collector.py
    │           │   │   ├── package_finder.py
    │           │   │   └── sources.py
    │           │   ├── locations
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _distutils.cpython-313.pyc
    │           │   │   │   ├── _sysconfig.cpython-313.pyc
    │           │   │   │   └── base.cpython-313.pyc
    │           │   │   ├── _distutils.py
    │           │   │   ├── _sysconfig.py
    │           │   │   └── base.py
    │           │   ├── main.py
    │           │   ├── metadata
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _json.cpython-313.pyc
    │           │   │   │   ├── base.cpython-313.pyc
    │           │   │   │   └── pkg_resources.cpython-313.pyc
    │           │   │   ├── _json.py
    │           │   │   ├── base.py
    │           │   │   ├── importlib
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── _compat.cpython-313.pyc
    │           │   │   │   │   ├── _dists.cpython-313.pyc
    │           │   │   │   │   └── _envs.cpython-313.pyc
    │           │   │   │   ├── _compat.py
    │           │   │   │   ├── _dists.py
    │           │   │   │   └── _envs.py
    │           │   │   └── pkg_resources.py
    │           │   ├── models
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── candidate.cpython-313.pyc
    │           │   │   │   ├── direct_url.cpython-313.pyc
    │           │   │   │   ├── format_control.cpython-313.pyc
    │           │   │   │   ├── index.cpython-313.pyc
    │           │   │   │   ├── installation_report.cpython-313.pyc
    │           │   │   │   ├── link.cpython-313.pyc
    │           │   │   │   ├── pylock.cpython-313.pyc
    │           │   │   │   ├── scheme.cpython-313.pyc
    │           │   │   │   ├── search_scope.cpython-313.pyc
    │           │   │   │   ├── selection_prefs.cpython-313.pyc
    │           │   │   │   ├── target_python.cpython-313.pyc
    │           │   │   │   └── wheel.cpython-313.pyc
    │           │   │   ├── candidate.py
    │           │   │   ├── direct_url.py
    │           │   │   ├── format_control.py
    │           │   │   ├── index.py
    │           │   │   ├── installation_report.py
    │           │   │   ├── link.py
    │           │   │   ├── pylock.py
    │           │   │   ├── scheme.py
    │           │   │   ├── search_scope.py
    │           │   │   ├── selection_prefs.py
    │           │   │   ├── target_python.py
    │           │   │   └── wheel.py
    │           │   ├── network
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── auth.cpython-313.pyc
    │           │   │   │   ├── cache.cpython-313.pyc
    │           │   │   │   ├── download.cpython-313.pyc
    │           │   │   │   ├── lazy_wheel.cpython-313.pyc
    │           │   │   │   ├── session.cpython-313.pyc
    │           │   │   │   ├── utils.cpython-313.pyc
    │           │   │   │   └── xmlrpc.cpython-313.pyc
    │           │   │   ├── auth.py
    │           │   │   ├── cache.py
    │           │   │   ├── download.py
    │           │   │   ├── lazy_wheel.py
    │           │   │   ├── session.py
    │           │   │   ├── utils.py
    │           │   │   └── xmlrpc.py
    │           │   ├── operations
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── check.cpython-313.pyc
    │           │   │   │   ├── freeze.cpython-313.pyc
    │           │   │   │   └── prepare.cpython-313.pyc
    │           │   │   ├── build
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── build_tracker.cpython-313.pyc
    │           │   │   │   │   ├── metadata.cpython-313.pyc
    │           │   │   │   │   ├── metadata_editable.cpython-313.pyc
    │           │   │   │   │   ├── metadata_legacy.cpython-313.pyc
    │           │   │   │   │   ├── wheel.cpython-313.pyc
    │           │   │   │   │   ├── wheel_editable.cpython-313.pyc
    │           │   │   │   │   └── wheel_legacy.cpython-313.pyc
    │           │   │   │   ├── build_tracker.py
    │           │   │   │   ├── metadata.py
    │           │   │   │   ├── metadata_editable.py
    │           │   │   │   ├── metadata_legacy.py
    │           │   │   │   ├── wheel.py
    │           │   │   │   ├── wheel_editable.py
    │           │   │   │   └── wheel_legacy.py
    │           │   │   ├── check.py
    │           │   │   ├── freeze.py
    │           │   │   ├── install
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── editable_legacy.cpython-313.pyc
    │           │   │   │   │   └── wheel.cpython-313.pyc
    │           │   │   │   ├── editable_legacy.py
    │           │   │   │   └── wheel.py
    │           │   │   └── prepare.py
    │           │   ├── pyproject.py
    │           │   ├── req
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── constructors.cpython-313.pyc
    │           │   │   │   ├── req_dependency_group.cpython-313.pyc
    │           │   │   │   ├── req_file.cpython-313.pyc
    │           │   │   │   ├── req_install.cpython-313.pyc
    │           │   │   │   ├── req_set.cpython-313.pyc
    │           │   │   │   └── req_uninstall.cpython-313.pyc
    │           │   │   ├── constructors.py
    │           │   │   ├── req_dependency_group.py
    │           │   │   ├── req_file.py
    │           │   │   ├── req_install.py
    │           │   │   ├── req_set.py
    │           │   │   └── req_uninstall.py
    │           │   ├── resolution
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   └── base.cpython-313.pyc
    │           │   │   ├── base.py
    │           │   │   ├── legacy
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── resolver.cpython-313.pyc
    │           │   │   │   └── resolver.py
    │           │   │   └── resolvelib
    │           │   │       ├── __init__.py
    │           │   │       ├── __pycache__
    │           │   │       │   ├── __init__.cpython-313.pyc
    │           │   │       │   ├── base.cpython-313.pyc
    │           │   │       │   ├── candidates.cpython-313.pyc
    │           │   │       │   ├── factory.cpython-313.pyc
    │           │   │       │   ├── found_candidates.cpython-313.pyc
    │           │   │       │   ├── provider.cpython-313.pyc
    │           │   │       │   ├── reporter.cpython-313.pyc
    │           │   │       │   ├── requirements.cpython-313.pyc
    │           │   │       │   └── resolver.cpython-313.pyc
    │           │   │       ├── base.py
    │           │   │       ├── candidates.py
    │           │   │       ├── factory.py
    │           │   │       ├── found_candidates.py
    │           │   │       ├── provider.py
    │           │   │       ├── reporter.py
    │           │   │       ├── requirements.py
    │           │   │       └── resolver.py
    │           │   ├── self_outdated_check.py
    │           │   ├── utils
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _jaraco_text.cpython-313.pyc
    │           │   │   │   ├── _log.cpython-313.pyc
    │           │   │   │   ├── appdirs.cpython-313.pyc
    │           │   │   │   ├── compat.cpython-313.pyc
    │           │   │   │   ├── compatibility_tags.cpython-313.pyc
    │           │   │   │   ├── datetime.cpython-313.pyc
    │           │   │   │   ├── deprecation.cpython-313.pyc
    │           │   │   │   ├── direct_url_helpers.cpython-313.pyc
    │           │   │   │   ├── egg_link.cpython-313.pyc
    │           │   │   │   ├── entrypoints.cpython-313.pyc
    │           │   │   │   ├── filesystem.cpython-313.pyc
    │           │   │   │   ├── filetypes.cpython-313.pyc
    │           │   │   │   ├── glibc.cpython-313.pyc
    │           │   │   │   ├── hashes.cpython-313.pyc
    │           │   │   │   ├── logging.cpython-313.pyc
    │           │   │   │   ├── misc.cpython-313.pyc
    │           │   │   │   ├── packaging.cpython-313.pyc
    │           │   │   │   ├── retry.cpython-313.pyc
    │           │   │   │   ├── setuptools_build.cpython-313.pyc
    │           │   │   │   ├── subprocess.cpython-313.pyc
    │           │   │   │   ├── temp_dir.cpython-313.pyc
    │           │   │   │   ├── unpacking.cpython-313.pyc
    │           │   │   │   ├── urls.cpython-313.pyc
    │           │   │   │   ├── virtualenv.cpython-313.pyc
    │           │   │   │   └── wheel.cpython-313.pyc
    │           │   │   ├── _jaraco_text.py
    │           │   │   ├── _log.py
    │           │   │   ├── appdirs.py
    │           │   │   ├── compat.py
    │           │   │   ├── compatibility_tags.py
    │           │   │   ├── datetime.py
    │           │   │   ├── deprecation.py
    │           │   │   ├── direct_url_helpers.py
    │           │   │   ├── egg_link.py
    │           │   │   ├── entrypoints.py
    │           │   │   ├── filesystem.py
    │           │   │   ├── filetypes.py
    │           │   │   ├── glibc.py
    │           │   │   ├── hashes.py
    │           │   │   ├── logging.py
    │           │   │   ├── misc.py
    │           │   │   ├── packaging.py
    │           │   │   ├── retry.py
    │           │   │   ├── setuptools_build.py
    │           │   │   ├── subprocess.py
    │           │   │   ├── temp_dir.py
    │           │   │   ├── unpacking.py
    │           │   │   ├── urls.py
    │           │   │   ├── virtualenv.py
    │           │   │   └── wheel.py
    │           │   ├── vcs
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── bazaar.cpython-313.pyc
    │           │   │   │   ├── git.cpython-313.pyc
    │           │   │   │   ├── mercurial.cpython-313.pyc
    │           │   │   │   ├── subversion.cpython-313.pyc
    │           │   │   │   └── versioncontrol.cpython-313.pyc
    │           │   │   ├── bazaar.py
    │           │   │   ├── git.py
    │           │   │   ├── mercurial.py
    │           │   │   ├── subversion.py
    │           │   │   └── versioncontrol.py
    │           │   └── wheel_builder.py
    │           ├── _vendor
    │           │   ├── __init__.py
    │           │   ├── __pycache__
    │           │   │   └── __init__.cpython-313.pyc
    │           │   ├── cachecontrol
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _cmd.cpython-313.pyc
    │           │   │   │   ├── adapter.cpython-313.pyc
    │           │   │   │   ├── cache.cpython-313.pyc
    │           │   │   │   ├── controller.cpython-313.pyc
    │           │   │   │   ├── filewrapper.cpython-313.pyc
    │           │   │   │   ├── heuristics.cpython-313.pyc
    │           │   │   │   ├── serialize.cpython-313.pyc
    │           │   │   │   └── wrapper.cpython-313.pyc
    │           │   │   ├── _cmd.py
    │           │   │   ├── adapter.py
    │           │   │   ├── cache.py
    │           │   │   ├── caches
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── file_cache.cpython-313.pyc
    │           │   │   │   │   └── redis_cache.cpython-313.pyc
    │           │   │   │   ├── file_cache.py
    │           │   │   │   └── redis_cache.py
    │           │   │   ├── controller.py
    │           │   │   ├── filewrapper.py
    │           │   │   ├── heuristics.py
    │           │   │   ├── py.typed
    │           │   │   ├── serialize.py
    │           │   │   └── wrapper.py
    │           │   ├── certifi
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   └── core.cpython-313.pyc
    │           │   │   ├── cacert.pem
    │           │   │   ├── core.py
    │           │   │   └── py.typed
    │           │   ├── dependency_groups
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   ├── _implementation.cpython-313.pyc
    │           │   │   │   ├── _lint_dependency_groups.cpython-313.pyc
    │           │   │   │   ├── _pip_wrapper.cpython-313.pyc
    │           │   │   │   └── _toml_compat.cpython-313.pyc
    │           │   │   ├── _implementation.py
    │           │   │   ├── _lint_dependency_groups.py
    │           │   │   ├── _pip_wrapper.py
    │           │   │   ├── _toml_compat.py
    │           │   │   └── py.typed
    │           │   ├── distlib
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── compat.cpython-313.pyc
    │           │   │   │   ├── resources.cpython-313.pyc
    │           │   │   │   ├── scripts.cpython-313.pyc
    │           │   │   │   └── util.cpython-313.pyc
    │           │   │   ├── compat.py
    │           │   │   ├── resources.py
    │           │   │   ├── scripts.py
    │           │   │   ├── t32.exe
    │           │   │   ├── t64-arm.exe
    │           │   │   ├── t64.exe
    │           │   │   ├── util.py
    │           │   │   ├── w32.exe
    │           │   │   ├── w64-arm.exe
    │           │   │   └── w64.exe
    │           │   ├── distro
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   └── distro.cpython-313.pyc
    │           │   │   ├── distro.py
    │           │   │   └── py.typed
    │           │   ├── idna
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── codec.cpython-313.pyc
    │           │   │   │   ├── compat.cpython-313.pyc
    │           │   │   │   ├── core.cpython-313.pyc
    │           │   │   │   ├── idnadata.cpython-313.pyc
    │           │   │   │   ├── intranges.cpython-313.pyc
    │           │   │   │   ├── package_data.cpython-313.pyc
    │           │   │   │   └── uts46data.cpython-313.pyc
    │           │   │   ├── codec.py
    │           │   │   ├── compat.py
    │           │   │   ├── core.py
    │           │   │   ├── idnadata.py
    │           │   │   ├── intranges.py
    │           │   │   ├── package_data.py
    │           │   │   ├── py.typed
    │           │   │   └── uts46data.py
    │           │   ├── msgpack
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── exceptions.cpython-313.pyc
    │           │   │   │   ├── ext.cpython-313.pyc
    │           │   │   │   └── fallback.cpython-313.pyc
    │           │   │   ├── exceptions.py
    │           │   │   ├── ext.py
    │           │   │   └── fallback.py
    │           │   ├── packaging
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _elffile.cpython-313.pyc
    │           │   │   │   ├── _manylinux.cpython-313.pyc
    │           │   │   │   ├── _musllinux.cpython-313.pyc
    │           │   │   │   ├── _parser.cpython-313.pyc
    │           │   │   │   ├── _structures.cpython-313.pyc
    │           │   │   │   ├── _tokenizer.cpython-313.pyc
    │           │   │   │   ├── markers.cpython-313.pyc
    │           │   │   │   ├── metadata.cpython-313.pyc
    │           │   │   │   ├── requirements.cpython-313.pyc
    │           │   │   │   ├── specifiers.cpython-313.pyc
    │           │   │   │   ├── tags.cpython-313.pyc
    │           │   │   │   ├── utils.cpython-313.pyc
    │           │   │   │   └── version.cpython-313.pyc
    │           │   │   ├── _elffile.py
    │           │   │   ├── _manylinux.py
    │           │   │   ├── _musllinux.py
    │           │   │   ├── _parser.py
    │           │   │   ├── _structures.py
    │           │   │   ├── _tokenizer.py
    │           │   │   ├── licenses
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── _spdx.cpython-313.pyc
    │           │   │   │   └── _spdx.py
    │           │   │   ├── markers.py
    │           │   │   ├── metadata.py
    │           │   │   ├── py.typed
    │           │   │   ├── requirements.py
    │           │   │   ├── specifiers.py
    │           │   │   ├── tags.py
    │           │   │   ├── utils.py
    │           │   │   └── version.py
    │           │   ├── pkg_resources
    │           │   │   ├── __init__.py
    │           │   │   └── __pycache__
    │           │   │       └── __init__.cpython-313.pyc
    │           │   ├── platformdirs
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   ├── android.cpython-313.pyc
    │           │   │   │   ├── api.cpython-313.pyc
    │           │   │   │   ├── macos.cpython-313.pyc
    │           │   │   │   ├── unix.cpython-313.pyc
    │           │   │   │   ├── version.cpython-313.pyc
    │           │   │   │   └── windows.cpython-313.pyc
    │           │   │   ├── android.py
    │           │   │   ├── api.py
    │           │   │   ├── macos.py
    │           │   │   ├── py.typed
    │           │   │   ├── unix.py
    │           │   │   ├── version.py
    │           │   │   └── windows.py
    │           │   ├── pygments
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   ├── console.cpython-313.pyc
    │           │   │   │   ├── filter.cpython-313.pyc
    │           │   │   │   ├── formatter.cpython-313.pyc
    │           │   │   │   ├── lexer.cpython-313.pyc
    │           │   │   │   ├── modeline.cpython-313.pyc
    │           │   │   │   ├── plugin.cpython-313.pyc
    │           │   │   │   ├── regexopt.cpython-313.pyc
    │           │   │   │   ├── scanner.cpython-313.pyc
    │           │   │   │   ├── sphinxext.cpython-313.pyc
    │           │   │   │   ├── style.cpython-313.pyc
    │           │   │   │   ├── token.cpython-313.pyc
    │           │   │   │   ├── unistring.cpython-313.pyc
    │           │   │   │   └── util.cpython-313.pyc
    │           │   │   ├── console.py
    │           │   │   ├── filter.py
    │           │   │   ├── filters
    │           │   │   │   ├── __init__.py
    │           │   │   │   └── __pycache__
    │           │   │   │       └── __init__.cpython-313.pyc
    │           │   │   ├── formatter.py
    │           │   │   ├── formatters
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── _mapping.cpython-313.pyc
    │           │   │   │   └── _mapping.py
    │           │   │   ├── lexer.py
    │           │   │   ├── lexers
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── _mapping.cpython-313.pyc
    │           │   │   │   │   └── python.cpython-313.pyc
    │           │   │   │   ├── _mapping.py
    │           │   │   │   └── python.py
    │           │   │   ├── modeline.py
    │           │   │   ├── plugin.py
    │           │   │   ├── regexopt.py
    │           │   │   ├── scanner.py
    │           │   │   ├── sphinxext.py
    │           │   │   ├── style.py
    │           │   │   ├── styles
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── _mapping.cpython-313.pyc
    │           │   │   │   └── _mapping.py
    │           │   │   ├── token.py
    │           │   │   ├── unistring.py
    │           │   │   └── util.py
    │           │   ├── pyproject_hooks
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   └── _impl.cpython-313.pyc
    │           │   │   ├── _impl.py
    │           │   │   ├── _in_process
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── _in_process.cpython-313.pyc
    │           │   │   │   └── _in_process.py
    │           │   │   └── py.typed
    │           │   ├── requests
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __version__.cpython-313.pyc
    │           │   │   │   ├── _internal_utils.cpython-313.pyc
    │           │   │   │   ├── adapters.cpython-313.pyc
    │           │   │   │   ├── api.cpython-313.pyc
    │           │   │   │   ├── auth.cpython-313.pyc
    │           │   │   │   ├── certs.cpython-313.pyc
    │           │   │   │   ├── compat.cpython-313.pyc
    │           │   │   │   ├── cookies.cpython-313.pyc
    │           │   │   │   ├── exceptions.cpython-313.pyc
    │           │   │   │   ├── help.cpython-313.pyc
    │           │   │   │   ├── hooks.cpython-313.pyc
    │           │   │   │   ├── models.cpython-313.pyc
    │           │   │   │   ├── packages.cpython-313.pyc
    │           │   │   │   ├── sessions.cpython-313.pyc
    │           │   │   │   ├── status_codes.cpython-313.pyc
    │           │   │   │   ├── structures.cpython-313.pyc
    │           │   │   │   └── utils.cpython-313.pyc
    │           │   │   ├── __version__.py
    │           │   │   ├── _internal_utils.py
    │           │   │   ├── adapters.py
    │           │   │   ├── api.py
    │           │   │   ├── auth.py
    │           │   │   ├── certs.py
    │           │   │   ├── compat.py
    │           │   │   ├── cookies.py
    │           │   │   ├── exceptions.py
    │           │   │   ├── help.py
    │           │   │   ├── hooks.py
    │           │   │   ├── models.py
    │           │   │   ├── packages.py
    │           │   │   ├── sessions.py
    │           │   │   ├── status_codes.py
    │           │   │   ├── structures.py
    │           │   │   └── utils.py
    │           │   ├── resolvelib
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── providers.cpython-313.pyc
    │           │   │   │   ├── reporters.cpython-313.pyc
    │           │   │   │   └── structs.cpython-313.pyc
    │           │   │   ├── providers.py
    │           │   │   ├── py.typed
    │           │   │   ├── reporters.py
    │           │   │   ├── resolvers
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── abstract.cpython-313.pyc
    │           │   │   │   │   ├── criterion.cpython-313.pyc
    │           │   │   │   │   ├── exceptions.cpython-313.pyc
    │           │   │   │   │   └── resolution.cpython-313.pyc
    │           │   │   │   ├── abstract.py
    │           │   │   │   ├── criterion.py
    │           │   │   │   ├── exceptions.py
    │           │   │   │   └── resolution.py
    │           │   │   └── structs.py
    │           │   ├── rich
    │           │   │   ├── __init__.py
    │           │   │   ├── __main__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── __main__.cpython-313.pyc
    │           │   │   │   ├── _cell_widths.cpython-313.pyc
    │           │   │   │   ├── _emoji_codes.cpython-313.pyc
    │           │   │   │   ├── _emoji_replace.cpython-313.pyc
    │           │   │   │   ├── _export_format.cpython-313.pyc
    │           │   │   │   ├── _extension.cpython-313.pyc
    │           │   │   │   ├── _fileno.cpython-313.pyc
    │           │   │   │   ├── _inspect.cpython-313.pyc
    │           │   │   │   ├── _log_render.cpython-313.pyc
    │           │   │   │   ├── _loop.cpython-313.pyc
    │           │   │   │   ├── _null_file.cpython-313.pyc
    │           │   │   │   ├── _palettes.cpython-313.pyc
    │           │   │   │   ├── _pick.cpython-313.pyc
    │           │   │   │   ├── _ratio.cpython-313.pyc
    │           │   │   │   ├── _spinners.cpython-313.pyc
    │           │   │   │   ├── _stack.cpython-313.pyc
    │           │   │   │   ├── _timer.cpython-313.pyc
    │           │   │   │   ├── _win32_console.cpython-313.pyc
    │           │   │   │   ├── _windows.cpython-313.pyc
    │           │   │   │   ├── _windows_renderer.cpython-313.pyc
    │           │   │   │   ├── _wrap.cpython-313.pyc
    │           │   │   │   ├── abc.cpython-313.pyc
    │           │   │   │   ├── align.cpython-313.pyc
    │           │   │   │   ├── ansi.cpython-313.pyc
    │           │   │   │   ├── bar.cpython-313.pyc
    │           │   │   │   ├── box.cpython-313.pyc
    │           │   │   │   ├── cells.cpython-313.pyc
    │           │   │   │   ├── color.cpython-313.pyc
    │           │   │   │   ├── color_triplet.cpython-313.pyc
    │           │   │   │   ├── columns.cpython-313.pyc
    │           │   │   │   ├── console.cpython-313.pyc
    │           │   │   │   ├── constrain.cpython-313.pyc
    │           │   │   │   ├── containers.cpython-313.pyc
    │           │   │   │   ├── control.cpython-313.pyc
    │           │   │   │   ├── default_styles.cpython-313.pyc
    │           │   │   │   ├── diagnose.cpython-313.pyc
    │           │   │   │   ├── emoji.cpython-313.pyc
    │           │   │   │   ├── errors.cpython-313.pyc
    │           │   │   │   ├── file_proxy.cpython-313.pyc
    │           │   │   │   ├── filesize.cpython-313.pyc
    │           │   │   │   ├── highlighter.cpython-313.pyc
    │           │   │   │   ├── json.cpython-313.pyc
    │           │   │   │   ├── jupyter.cpython-313.pyc
    │           │   │   │   ├── layout.cpython-313.pyc
    │           │   │   │   ├── live.cpython-313.pyc
    │           │   │   │   ├── live_render.cpython-313.pyc
    │           │   │   │   ├── logging.cpython-313.pyc
    │           │   │   │   ├── markup.cpython-313.pyc
    │           │   │   │   ├── measure.cpython-313.pyc
    │           │   │   │   ├── padding.cpython-313.pyc
    │           │   │   │   ├── pager.cpython-313.pyc
    │           │   │   │   ├── palette.cpython-313.pyc
    │           │   │   │   ├── panel.cpython-313.pyc
    │           │   │   │   ├── pretty.cpython-313.pyc
    │           │   │   │   ├── progress.cpython-313.pyc
    │           │   │   │   ├── progress_bar.cpython-313.pyc
    │           │   │   │   ├── prompt.cpython-313.pyc
    │           │   │   │   ├── protocol.cpython-313.pyc
    │           │   │   │   ├── region.cpython-313.pyc
    │           │   │   │   ├── repr.cpython-313.pyc
    │           │   │   │   ├── rule.cpython-313.pyc
    │           │   │   │   ├── scope.cpython-313.pyc
    │           │   │   │   ├── screen.cpython-313.pyc
    │           │   │   │   ├── segment.cpython-313.pyc
    │           │   │   │   ├── spinner.cpython-313.pyc
    │           │   │   │   ├── status.cpython-313.pyc
    │           │   │   │   ├── style.cpython-313.pyc
    │           │   │   │   ├── styled.cpython-313.pyc
    │           │   │   │   ├── syntax.cpython-313.pyc
    │           │   │   │   ├── table.cpython-313.pyc
    │           │   │   │   ├── terminal_theme.cpython-313.pyc
    │           │   │   │   ├── text.cpython-313.pyc
    │           │   │   │   ├── theme.cpython-313.pyc
    │           │   │   │   ├── themes.cpython-313.pyc
    │           │   │   │   ├── traceback.cpython-313.pyc
    │           │   │   │   └── tree.cpython-313.pyc
    │           │   │   ├── _cell_widths.py
    │           │   │   ├── _emoji_codes.py
    │           │   │   ├── _emoji_replace.py
    │           │   │   ├── _export_format.py
    │           │   │   ├── _extension.py
    │           │   │   ├── _fileno.py
    │           │   │   ├── _inspect.py
    │           │   │   ├── _log_render.py
    │           │   │   ├── _loop.py
    │           │   │   ├── _null_file.py
    │           │   │   ├── _palettes.py
    │           │   │   ├── _pick.py
    │           │   │   ├── _ratio.py
    │           │   │   ├── _spinners.py
    │           │   │   ├── _stack.py
    │           │   │   ├── _timer.py
    │           │   │   ├── _win32_console.py
    │           │   │   ├── _windows.py
    │           │   │   ├── _windows_renderer.py
    │           │   │   ├── _wrap.py
    │           │   │   ├── abc.py
    │           │   │   ├── align.py
    │           │   │   ├── ansi.py
    │           │   │   ├── bar.py
    │           │   │   ├── box.py
    │           │   │   ├── cells.py
    │           │   │   ├── color.py
    │           │   │   ├── color_triplet.py
    │           │   │   ├── columns.py
    │           │   │   ├── console.py
    │           │   │   ├── constrain.py
    │           │   │   ├── containers.py
    │           │   │   ├── control.py
    │           │   │   ├── default_styles.py
    │           │   │   ├── diagnose.py
    │           │   │   ├── emoji.py
    │           │   │   ├── errors.py
    │           │   │   ├── file_proxy.py
    │           │   │   ├── filesize.py
    │           │   │   ├── highlighter.py
    │           │   │   ├── json.py
    │           │   │   ├── jupyter.py
    │           │   │   ├── layout.py
    │           │   │   ├── live.py
    │           │   │   ├── live_render.py
    │           │   │   ├── logging.py
    │           │   │   ├── markup.py
    │           │   │   ├── measure.py
    │           │   │   ├── padding.py
    │           │   │   ├── pager.py
    │           │   │   ├── palette.py
    │           │   │   ├── panel.py
    │           │   │   ├── pretty.py
    │           │   │   ├── progress.py
    │           │   │   ├── progress_bar.py
    │           │   │   ├── prompt.py
    │           │   │   ├── protocol.py
    │           │   │   ├── py.typed
    │           │   │   ├── region.py
    │           │   │   ├── repr.py
    │           │   │   ├── rule.py
    │           │   │   ├── scope.py
    │           │   │   ├── screen.py
    │           │   │   ├── segment.py
    │           │   │   ├── spinner.py
    │           │   │   ├── status.py
    │           │   │   ├── style.py
    │           │   │   ├── styled.py
    │           │   │   ├── syntax.py
    │           │   │   ├── table.py
    │           │   │   ├── terminal_theme.py
    │           │   │   ├── text.py
    │           │   │   ├── theme.py
    │           │   │   ├── themes.py
    │           │   │   ├── traceback.py
    │           │   │   └── tree.py
    │           │   ├── tomli
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _parser.cpython-313.pyc
    │           │   │   │   ├── _re.cpython-313.pyc
    │           │   │   │   └── _types.cpython-313.pyc
    │           │   │   ├── _parser.py
    │           │   │   ├── _re.py
    │           │   │   ├── _types.py
    │           │   │   └── py.typed
    │           │   ├── tomli_w
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   └── _writer.cpython-313.pyc
    │           │   │   ├── _writer.py
    │           │   │   └── py.typed
    │           │   ├── truststore
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _api.cpython-313.pyc
    │           │   │   │   ├── _macos.cpython-313.pyc
    │           │   │   │   ├── _openssl.cpython-313.pyc
    │           │   │   │   ├── _ssl_constants.cpython-313.pyc
    │           │   │   │   └── _windows.cpython-313.pyc
    │           │   │   ├── _api.py
    │           │   │   ├── _macos.py
    │           │   │   ├── _openssl.py
    │           │   │   ├── _ssl_constants.py
    │           │   │   ├── _windows.py
    │           │   │   └── py.typed
    │           │   ├── urllib3
    │           │   │   ├── __init__.py
    │           │   │   ├── __pycache__
    │           │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   ├── _collections.cpython-313.pyc
    │           │   │   │   ├── _version.cpython-313.pyc
    │           │   │   │   ├── connection.cpython-313.pyc
    │           │   │   │   ├── connectionpool.cpython-313.pyc
    │           │   │   │   ├── exceptions.cpython-313.pyc
    │           │   │   │   ├── fields.cpython-313.pyc
    │           │   │   │   ├── filepost.cpython-313.pyc
    │           │   │   │   ├── poolmanager.cpython-313.pyc
    │           │   │   │   ├── request.cpython-313.pyc
    │           │   │   │   └── response.cpython-313.pyc
    │           │   │   ├── _collections.py
    │           │   │   ├── _version.py
    │           │   │   ├── connection.py
    │           │   │   ├── connectionpool.py
    │           │   │   ├── contrib
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   ├── _appengine_environ.cpython-313.pyc
    │           │   │   │   │   ├── appengine.cpython-313.pyc
    │           │   │   │   │   ├── ntlmpool.cpython-313.pyc
    │           │   │   │   │   ├── pyopenssl.cpython-313.pyc
    │           │   │   │   │   ├── securetransport.cpython-313.pyc
    │           │   │   │   │   └── socks.cpython-313.pyc
    │           │   │   │   ├── _appengine_environ.py
    │           │   │   │   ├── _securetransport
    │           │   │   │   │   ├── __init__.py
    │           │   │   │   │   ├── __pycache__
    │           │   │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   │   ├── bindings.cpython-313.pyc
    │           │   │   │   │   │   └── low_level.cpython-313.pyc
    │           │   │   │   │   ├── bindings.py
    │           │   │   │   │   └── low_level.py
    │           │   │   │   ├── appengine.py
    │           │   │   │   ├── ntlmpool.py
    │           │   │   │   ├── pyopenssl.py
    │           │   │   │   ├── securetransport.py
    │           │   │   │   └── socks.py
    │           │   │   ├── exceptions.py
    │           │   │   ├── fields.py
    │           │   │   ├── filepost.py
    │           │   │   ├── packages
    │           │   │   │   ├── __init__.py
    │           │   │   │   ├── __pycache__
    │           │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   └── six.cpython-313.pyc
    │           │   │   │   ├── backports
    │           │   │   │   │   ├── __init__.py
    │           │   │   │   │   ├── __pycache__
    │           │   │   │   │   │   ├── __init__.cpython-313.pyc
    │           │   │   │   │   │   ├── makefile.cpython-313.pyc
    │           │   │   │   │   │   └── weakref_finalize.cpython-313.pyc
    │           │   │   │   │   ├── makefile.py
    │           │   │   │   │   └── weakref_finalize.py
    │           │   │   │   └── six.py
    │           │   │   ├── poolmanager.py
    │           │   │   ├── request.py
    │           │   │   ├── response.py
    │           │   │   └── util
    │           │   │       ├── __init__.py
    │           │   │       ├── __pycache__
    │           │   │       │   ├── __init__.cpython-313.pyc
    │           │   │       │   ├── connection.cpython-313.pyc
    │           │   │       │   ├── proxy.cpython-313.pyc
    │           │   │       │   ├── queue.cpython-313.pyc
    │           │   │       │   ├── request.cpython-313.pyc
    │           │   │       │   ├── response.cpython-313.pyc
    │           │   │       │   ├── retry.cpython-313.pyc
    │           │   │       │   ├── ssl_.cpython-313.pyc
    │           │   │       │   ├── ssl_match_hostname.cpython-313.pyc
    │           │   │       │   ├── ssltransport.cpython-313.pyc
    │           │   │       │   ├── timeout.cpython-313.pyc
    │           │   │       │   ├── url.cpython-313.pyc
    │           │   │       │   └── wait.cpython-313.pyc
    │           │   │       ├── connection.py
    │           │   │       ├── proxy.py
    │           │   │       ├── queue.py
    │           │   │       ├── request.py
    │           │   │       ├── response.py
    │           │   │       ├── retry.py
    │           │   │       ├── ssl_.py
    │           │   │       ├── ssl_match_hostname.py
    │           │   │       ├── ssltransport.py
    │           │   │       ├── timeout.py
    │           │   │       ├── url.py
    │           │   │       └── wait.py
    │           │   └── vendor.txt
    │           └── py.typed
    ├── Scripts
    │   ├── Activate.ps1
    │   ├── activate
    │   ├── activate.bat
    │   ├── activate.fish
    │   ├── deactivate.bat
    │   ├── pip.exe
    │   ├── pip3.13.exe
    │   ├── pip3.exe
    │   ├── python.exe
    │   └── pythonw.exe
    └── pyvenv.cfg

.gitignore
image.png
package-lock.json





















python
├── __init__.py
├── __pycache__
│   └── db_core.cpython-313.pyc
├── ai
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-313.pyc
│   │   ├── app.cpython-313.pyc
│   │   ├── bm25_index.cpython-313.pyc
│   │   ├── build_vector_store_chunks.cpython-313.pyc
│   │   ├── build_vector_store_simplified.cpython-313.pyc
│   │   ├── context_builder.cpython-313.pyc
│   │   ├── groq_service.cpython-313.pyc
│   │   ├── legal_rag_pipeline.cpython-313.pyc
│   │   ├── legal_topic_boost.cpython-313.pyc
│   │   ├── local_embedder.cpython-313.pyc
│   │   ├── retrieval_level6.cpython-313.pyc
│   │   └── topic_cluster_builder.cpython-313.pyc
│   ├── app.py
│   ├── bm25_index.py
│   ├── build_vector_store_chunks.py
│   ├── build_vector_store_simplified.py
│   ├── context_builder.py
│   ├── gemini_service.py
│   ├── groq_service.py
│   ├── legal_rag_pipeline.py
│   ├── legal_topic_boost.py
│   ├── local_embedder.py
│   ├── rebuild_all.py
│   ├── retrieval_level6.py
│   └── topic_cluster_builder.py
├── bm25_index
│   ├── articles_bm25.pkl
│   ├── articles_chunks_bm25.pkl
│   ├── faq_bm25.pkl
│   └── simplified_bm25.pkl
├── cleanup_faq.py
├── crawler
│   ├── __init__.py
│   ├── __pycache__
│   │   ├── __init__.cpython-313.pyc
│   │   ├── archive_cleanup.cpython-313.pyc
│   │   ├── content_cleaner.cpython-313.pyc
│   │   ├── crawl_law.cpython-313.pyc
│   │   ├── db.cpython-313.pyc
│   │   ├── db_inserts.cpython-313.pyc
│   │   ├── log_utils.cpython-313.pyc
│   │   ├── metadata_extractor.cpython-313.pyc
│   │   ├── run_crawl.cpython-313.pyc
│   │   └── run_crawl_api.cpython-313.pyc
│   ├── archive_cleanup.py
│   ├── content_cleaner.py
│   ├── crawl_law.py
│   ├── db.py
│   ├── db_inserts.py
│   ├── log_utils.py
│   ├── metadata_extractor.py
│   ├── run_crawl.py
│   └── run_crawl_api.py
├── db_core.log
├── db_core.py
├── fix_faq_refs.py
├── requirements.txt
├── test.py
├── vector_store
│   ├── articles
│   │   └── chunks
│   │       ├── meta.json
│   │       ├── topic_centroids.npy
│   │       └── vectors.npy
│   └── simplified
│       ├── meta.json
│       └── vectors.npy
