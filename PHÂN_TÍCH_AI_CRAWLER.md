# 📚 Phân Tích Chi Tiết Các File AI & Crawler

**Ngày tạo:** 09/04/2026  
**Version:** 1.0  
**Mục đích:** Giải thích chức năng từng file và các dòng code quan trọng

---

## 📂 PHẦN 1: Thư Mục `ai/` - Xử Lý RAG (Retrieval-Augmented Generation) & AI

### 1️⃣ **`__init__.py`**
- **Chức năng:** File package initialization (trống)
- **Dòng quan trọng:** N/A
- **Mô tả:** Đánh dấu thư mục `ai` là Python package

---

### 2️⃣ **`app.py`** - Main Flask Server
- **Chức năng:** Khởi động Flask API server với 2 endpoint chính
- **Dòng quan trọng:**
  ```python
  # Line 5: Flask app initialization
  app = Flask(__name__)
  CORS(app)
  
  # Line 11-12: Endpoint nhận câu hỏi từ frontend + settings
  @app.route("/api/ask", methods=["POST"])
  def ask():
      settings = data.get("settings", {})  # Nhận cấu hình từ backend
  
  # Line 21: Gọi hàm RAG pipeline chính
  result = answer_legal_question(question, settings)
  
  # Line 37: Endpoint rebuild models (chạy background job)
  @app.route("/api/admin/rebuild", methods=["POST"])
  subprocess.Popen(["python", "ai/rebuild_all.py"])
  
  # Line 48: Chạy server trên port 5000
  app.run(host="0.0.0.0", port=5000, debug=False)
  ```
- **Mô tả:**
  - `/api/ask` - Nhận câu hỏi pháp lý + settings, trả lời
  - `/api/admin/rebuild` - Rebuild vector store, BM25, topic clusters

---

### 3️⃣ **`bm25_index.py`** - BM25 Keyword Search
- **Chức năng:** Xây dựng và sử dụng BM25 index (tìm kiếm từ khóa)
- **Dòng quan trọng:**
  ```python
  # Line 24-25: Tokenize text (chia từ)
  def tokenize(text: str) -> List[str]:
      return (text or "").lower().split()
  
  # Line 44-45: Dùng tên file an toàn thay vì path dài
  safe = source.replace("/", "_")
  return INDEX_DIR / f"{safe}_bm25.pkl"
  
  # Line 66-67: Xây dựng BM25 từ corpus
  bm25 = BM25Okapi(corpus_tokens)
  pickle.dump({"bm25": bm25, "ids": ids}, f)
  
  # Line 84-87: Tìm kiếm BM25
  tokens = tokenize(query)
  scores = bm25.get_scores(tokens)
  ranked = sorted(zip(ids, scores), key=lambda x: x[1], reverse=True)[:top_k]
  ```
- **Mô tả:**
  - Cung cấp tìm kiếm từ khóa nhanh (BM25 algorithm)
  - Hỗ trợ 4 nguồn: articles, articles/chunks, faq, simplified
  - Trả về top-k document IDs với điểm số cao nhất

---

### 4️⃣ **`build_vector_store_chunks.py`** - Xây Vector Store Chunks Level
- **Chức năng:** Chia nội dung luật thành chunks nhỏ (khoản/điểm) → embedding
- **Dòng quan trọng:**
  ```python
  # Line 10-11: Chia theo khoản (1.), điểm (a), b), c), đ)
  def split_into_chunks(text):
      parts = re.split(r"(?=(\d+\.\s+|[a-zđ]\)\s+))", text, flags=re.IGNORECASE)
  
  # Line 28: Loại bỏ chunk quá ngắn (< 25 ký tự)
  chunks = [c for c in chunks if len(c.strip()) > 25]
  
  # Line 33-36: Trích xuất số khoản (1, 2, 3...)
  def extract_clause_number(chunk_text):
      m = re.match(r"(\d+)\.\s+", chunk_text)
  
  # Line 50-53: Lấy bài viết từ DB
  cur.execute("""
      SELECT article_id, article_number, article_title, content
      FROM articles WHERE status='active'
  """)
  
  # Line 68-70: Embedding chunk
  emb = get_local_embedding(chunk_text)
  vectors.append(emb)
  metadata.append({...})
  ```
- **Mô tả:**
  - Thực hiện chunking chuẩn cho luật Việt Nam (tách khoản, điểm)
  - Mỗi chunk được embedding → vector 384-dim
  - Lưu vào `vector_store/articles/chunks/` (level 4 chính xác)

---

### 5️⃣ **`build_vector_store_faq.py`** - Xây Vector Store FAQ
- **Chức năng:** Embedding các câu hỏi-đáp FAQ
- **Dòng quan trọng:**
  ```python
  # Line 10-15: Lấy FAQ từ DB
  cur.execute("""
      SELECT faq_id, question, answer, category FROM faq
  """)
  
  # Line 25: Ghép câu hỏi + đáp vào 1 text để embedding
  text = f"Q: {item['question']}\nA: {item['answer']}"
  emb = get_local_embedding(text)
  
  # Line 32-36: Lưu metadata
  meta.append({
      "id": f"faq_{item['faq_id']}",
      ...
  })
  ```
- **Mô tả:**
  - Xây vector store cho FAQ database
  - Mỗi FAQ item = 1 embedding

---

### 6️⃣ **`build_vector_store_simplified.py`** - Xây Vector Store Simplified
- **Chức naung:** Embedding các bản rút gọn luật (dễ hiểu)
- **Dòng quan trọng:**
  ```python
  # Line 10-15: Lấy bản rút gọn từ DB
  cur.execute("""
      SELECT simplified_id, article_id, content_simplified, category
      FROM simplified_articles WHERE status='approved'
  """)
  
  # Line 25: Lấy nội dung rút gọn
  text = item["content_simplified"]
  emb = get_local_embedding(text)
  ```
- **Mô tả:**
  - Xây vector store cho bản rút gọn đơn giản hóa
  - Lưu vào `vector_store/simplified/`

---

### 7️⃣ **`context_builder.py`** - Xây Dựng Context Từ Search Results
- **Chức naung:** Lấy bài viết đầy đủ từ kết quả tìm kiếm để làm context cho LLM
- **Dòng quan trọng:**
  ```python
  # Line 5-12: Lấy bài viết đầy đủ từ article_number
  def load_full_article(article_number: str) -> str:
      cur.execute("""
          SELECT article_title, content FROM articles
          WHERE article_number = %s LIMIT 1
      """)
  
  # Line 18-24: Kiểm tra source có hợp lệ không
  def build_context(results):
      top = results[0]
      if top.get("source") not in ["articles", "articles/chunks"]:
          return None  # Bỏ FAQ, simplified → chỉ dùng luật chính thức
  
  # Line 26-31: Lấy article_number từ search result
  article_number = top.get("article_number")
  full_article = load_full_article(article_number)
  ```
- **Mô tả:**
  - Chỉ chấp nhận context từ "articles" hoặc "articles/chunks" (thực pháp)
  - Lấy nội dung đầy đủ (không dùng chunk nhỏ) để gửi cho LLM
  - Đảm bảo tính xác thực legal

---

### 8️⃣ **`groq_service.py`** - Gọi API Groq LLM
- **Chức naung:** Gửi request tới Groq LLM API + parse response
- **Dòng quan trọng:**
  ```python
  # Line 11-13: Cấu hình API Groq
  API_URL = "https://api.groq.com/openai/v1/chat/completions"
  API_KEY = os.getenv("GROQ_API_KEY")
  model = "llama-3.1-8b-instant"
  
  # Line 33-45: Gửi request + xử lý JSON response
  res = requests.post(API_URL, headers=headers, json=data, timeout=40)
  j = res.json()
  content = j["choices"][0].get("message", {}).get("content", "").strip()
  
  # Line 60-65: Ép kiểu an toàn (FE gửi "0.7" string → float)
  temperature = float(temperature)  # fallback 0.15 nếu lỗi
  max_tokens = int(max_tokens)      # fallback 900 nếu lỗi
  
  # Line 67-90: System prompt nghiêm ngặt (chỉ dùng context)
  system_prompt = """
  1. NGUỒN DUY NHẤT: Chỉ dùng info trong "NGỮ CẢNH PHÁP LUẬT"
  2. TRÍCH DẪN: Phải trích Điều/Khoản đúng
  3. KHÔNG BỊA: Không thêm quy định ngoài context
  ```
- **Mô tả:**
  - Gọi Groq Llama-3.1-8B model
  - System prompt ép LLM tuân thủ luật pháp
  - Xử lý error gracefully (return fallback message)

---

### 9️⃣ **`legal_rag_pipeline.py`** - Main RAG Pipeline (Level 8)
- **Chức nauung:** Orchestrate toàn bộ quy trình: retrieve → context → LLM → response
- **Dòng quan trọng:**
  ```python
  # Line 8: Hàm chính nhận query + settings từ admin
  def answer_legal_question(query: str, settings: dict = None):
  
  # Line 10-16: Kiểm tra admin disable bot
  if settings.get("enabled") is False:
      return {"answer": "⚠️ Chatbot hiện bị tạm thời vô hiệu hóa"}
  
  # Line 22-25: Delay config từ admin (test slow response)
  delay = settings.get("responseDelay", 0)
  if isinstance(delay, (int, float)) and delay > 0:
      time.sleep(delay / 1000)
  
  # Line 27: Filter theo data source (all/articles/faq/simplified)
  source_filter = settings.get("dataSource", "all")
  
  # Line 31: Gọi retrieval multi-source
  results = retrieve_multi_source(query, source_filter=source_filter)
  
  # Line 41-50: Nếu retrieval fail → fallback general answer
  if not results:
      fb = fallback_general_answer(query)
      return {"answer": fb, "source": "fallback", "fallback": True}
  
  # Line 53: Xây full article context
  context = build_context(results)
  
  # Line 62-65: Gọi LLM với temperature + max_tokens từ admin
  answer = guarded_completion(
      context=context,
      question=query,
      temperature=float(temperature),
      max_tokens=int(max_tokens)
  )
  ```
- **Mô tả:**
  - Pipeline chính Level 8 (đầy đủ)
  - Hỗ trợ admin settings: enabled, responseDelay, dataSource, temperature, maxTokens
  - Fallback gracefully nếu retrieval/context fail

---

### 🔟 **`legal_topic_boost.py`** - Boost Điểm Lao Động
- **Chức nauung:** Score boost/penalty dựa trên topic (lao động hoặc không)
- **Dòng quan trọng:**
  ```python
  # Line 5-19: Danh sách keyword lao động
  LABOR_KEYWORDS = [
      "người lao động", "hợp đồng", "lương", "phép năm", 
      "bảo hiểm", "sa thải", ...
  ]
  
  # Line 33-34: Nếu câu hỏi KHÔNG lao động → score âm mạnh (-1.2)
  if not is_labor_question(query_l):
      return -1.2  # Tránh match nhầm
  
  # Line 38-45: Nếu là lao động → score dương (0.40 nếu match topic)
  for topic_name, keywords in topics.items():
      if any(k in query_l for k in keywords):
          if any(k in text_l for k in keywords):
              score += 0.40  # Match tốt
  ```
- **Mô tả:**
  - Boost search results dựa trên topic lao động
  - Tránh confusion với chủ đề khác
  - Được gọi trong retrieval phase

---

### 1️⃣1️⃣ **`local_embedder.py`** - Embedding Model Local
- **Chức nauung:** Load sentence transformer model + encoding text → vector
- **Dòng quan trọng:**
  ```python
  # Line 5-6: Load model multilingual-e5-base (384-dim)
  MODEL_NAME = "intfloat/multilingual-e5-base"
  model = SentenceTransformer(MODEL_NAME)
  
  # Line 10-18: Clean text trước embed (loại Điều/Khoản prefix)
  def clean_text(text: str) -> str:
      text = re.sub(r"Điều\s+\d+\.?", "", text)
      text = re.sub(r"Khoản\s+\d+\.?", "", text)
  
  # Line 22-25: Embedding 1 câu
  def get_local_embedding(text: str) -> np.ndarray:
      vec = model.encode([text], normalize_embeddings=True)[0]
      return np.asarray(vec, dtype=np.float32)
  
  # Line 28-37: Embedding batch (hiệu quả hơn)
  def embed_texts(texts: list[str]) -> np.ndarray:
      vecs = model.encode(cleaned, batch_size=16, normalize_embeddings=True)
      return np.asarray(vecs, dtype=np.float32)
  ```
- **Mô tả:**
  - Model multilingual (tiếng Việt OK)
  - Vector 384-chiều normalized (cosine similarity)
  - Clean text remove Điều/Khoản  prefix

---

### 1️⃣2️⃣ **`rebuild_all.py`** - Rebuild All Models
- **Chức nauung:** Script rebuild toàn bộ vector store, BM25, topic clusters
- **Dòng quan trọng:**
  ```python
  # Line 11-16: Rebuild 3 vector stores
  run("python -m ai.build_vector_store_chunks")
  run("python -m ai.build_vector_store_faq")
  run("python -m ai.build_vector_store_simplified")
  
  # Line 18: Rebuild BM25 index
  run("python -m ai.bm25_index")
  
  # Line 20: Rebuild topic clusters
  run("python -m ai.topic_cluster_builder")
  ```
- **Mô tả:**
  - Script được gọi bằng `/api/admin/rebuild` endpoint
  - Chạy background subprocess
  - Rebuild toàn bộ hệ thống indexing

---

### 1️⃣3️⃣ **`retrieval_level6.py`** - Multi-Source Retrieval (Hybrid)
- **Chức nauung:** Tìm kiếm đa source: BM25 + vector semantic + topic boost
- **Dòng quan trọng:**
  ```python
  # Line 18-23: Phát hiện article number từ query (nếu user viết "Điều 35")
  def detect_article_number(query: str):
      m = re.search(r"điều\s+(\d+)", query.lower())
      if m:
          return m.group(1)
  
  # Line 28-45: Intent routing (ánh xạ intent → articles)
  INTENT_TO_ARTICLES = {
      "nghi_viec": [35, 36, 48, 56],
      "sa_thai": [125],
      "nghi_le": [112],
      ...
  }
  
  # Line 48-68: Detect intent từ keywords
  def detect_intent(query: str):
      if any(k in q for k in ["nghỉ việc", "nghi viec"]):
          return "nghi_viec"
  
  # Line 75-85: Load vector store từ file
  def load_source(name: str):
      vectors = np.load(vec_path)
      meta = json.load(meta_path)
  
  # Line 90+: Hybrid scoring: BM25 + semantic vector + topic boost
  # Tính điểm từ 3 source, normalize, combine
  ```
- **Mô tả:**
  - Hybrid retrieval: BM25 + semantic + intent routing
  - Detect article number trực tiếp từ query (ếu user biết)
  - Intent → article mapping (lao động → Điều 35, 36...)
  - Topic boost tránh cross-topic confusion

---

### 1️⃣4️⃣ **`topic_cluster_builder.py`** - Xây Topic Clusters
- **Chức nauung:** KMeans clustering trên vectors → gán topic cluster ID
- **Dòng quan trọng:**
  ```python
  # Line 7-11: Hỗ trợ 4 sources (thêm chunks)
  SUPPORTED_SOURCES = [
      "articles",
      "articles/chunks",  # NEW
      "faq",
      "simplified"
  ]
  
  # Line 39-42: Tính số cluster thông minh (tùy dataset size)
  def _determine_cluster_count(num_samples, base_clusters=8):
      if num_samples < 5:
          return 1
      if num_samples > 10000:
          return 16
  
  # Line 58-62: KMeans clustering
  kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
  labels = kmeans.fit_predict(vectors)
  
  # Line 64-65: Gán cluster ID vào metadata
  for item, label in zip(meta, labels):
      item["topic_cluster"] = int(label)
  
  # Line 72-73: Save centroids
  np.save(centroids_path, kmeans.cluster_centers_)
  ```
- **Mô tả:**
  - KMeans clustering trên vectors
  - Gán topic cluster ID cho mỗi document
  - Centroids được dùng trong retrieval để search trong cluster
  - Smart cluster count: từ 1 (nhỏ) → 16 (>10K)

---

---

## 📂 PHẦN 2: Thư Mục `crawler/` - Web Crawling & Data Insertion

### 1️⃣ **`__init__.py`**
- **Chức nauung:** Package initialization (trống)
- **Dòng quan trọng:** N/A

---

### 2️⃣ **`archive_cleanup.py`** - Archive Dữ Liệu Cũ
- **Chức nauung:** Soft-delete (archive) dữ liệu phiên bản cũ, thực hiện cascading delete
- **Dòng quan trọng:**
  ```python
  # Line 2-20: Archive các luật khác (keep 1 luật active)
  def archive_other_laws(cur, law_id):
      cur.execute("""
          UPDATE laws SET status='archived'
          WHERE law_id != %s AND status = 'active'
      """)
      # Cascade: archive chapters, sections, articles
  
  # Line 24-56: Archive version cũ của luật hiện tại
  def archive_old_data(cur, law_id):
      cur.execute("""
          UPDATE articles SET status='archived'
          WHERE law_id=%s AND status='active'
      """)
      # Cascade: simplified -> sections -> chapters archived
  
  # Line 59-88: Hard-delete các bản ghi cũ (keep 5 mới nhất)
  def cleanup_versions(cur, keep_last=5):
      cur.execute(f"""
          SELECT law_id, version_number FROM law_versions
          ORDER BY crawled_at DESC LIMIT {keep_last}
      """)
      # Xóa cứng tất cả ngoài top 5 mới nhất
  ```
- **Mô tả:**
  - `archive_other_laws`: Keep 1 luật active, archive phần còn lại
  - `archive_old_data`: Archive phiên bản cũ của luật hiện tại
  - `cleanup_versions`: Hard-delete phiên bản quá cũ (keep 5 mới)
  - Cascading updates: laws → chapters → sections → articles → simplified

---

### 3️⃣ **`content_cleaner.py`** - Chuẩn Hóa Nội Dung
- **Chức nauung:** Clean HTML artifacts, preserve legal structure (khoản, điểm)
- **Dòng quan trọng:**
  ```python
  # Line 6-30: Normalize article content
  def normalize_article_content(raw_text):
      lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
      cleaned = []
      buffer = ""
      
      # Line 11-15: Phát hiện section mới (1., a), -, •)
      def is_new_section(line):
          return (
              re.match(r"^\d+[\.\)]", line) or
              re.match(r"^[a-zA-Z][\.\)]", line) or
              line.startswith("- ") or
              line.startswith("•")
          )
      
      # Line 19-25: Gộp dòng bị xuống dòng, giữ section breaks
      for line in lines:
          if is_new_section(line):
              if buffer:
                  cleaned.append(buffer.strip())
              buffer = line
          else:
              buffer += " " + line
  ```
- **Mô tả:**
  - Gộp dòng bị split do HTML parsing
  - Giữ nguên structure pháp lý (khoản, điểm, bullet)
  - Xóa whitespace thừa

---

### 4️⃣ **`crawl_law.py`** - Main Crawler Logic
- **Chức nauung:** Crawl trang web thuvienphapluat → parse → insert DB
- **Dòng quan trọng:**
  ```python
  # Line 20-22: Dùng Playwright (headless = không mở browser)
  with sync_playwright() as p:
      browser = p.chromium.launch(headless=True)
      page.goto(url)
      page.wait_for_timeout(4000)  # Chờ JS render
  
  # Line 28-30: Parse metadata từ HTML
  title, code, law_type, issued_date, effective_date = extract_metadata(soup)
  
  # Line 33: Tìm tất cả đoạn nội dung (div#ctl00_Content...pnlDocContent p)
  all_p = soup.select("div#ctl00_Content_ThongTinVB_pnlDocContent p")
  
  # Line 46-53: Lấy hoặc tạo luật mới
  cur.execute("""
      SELECT law_id, version_number FROM laws WHERE code=%s ORDER BY law_id ASC LIMIT 1
  """)
  if row:
      law_id = row["law_id"]
      version_number = int(row.get("version_number") or 0) + 1
  else:
      version_number = 1
  
  # Line 66+: Archive dữ liệu cũ, insert chapter/section/article mới
  archive_old_data(cur, law_id)
  insert_chapter(cur, law_id, chapter_num, chapter_title, version_number)
  ```
- **Mô tả:**
  - Dùng Playwright (handle JS rendering)
  - Parse với BeautifulSoup
  - Extract metadata: title, code, type, dates
  - Version incrementing (Auto +1)
  - Cascading insert: chapters → sections → articles

---

### 5️⃣ **`db_inserts.py`** - Insert Functions
- **Chức nauung:** Helper functions để insert chapters, sections, articles vào DB
- **Dòng quan trọng:**
  ```python
  # Line 1-10: Insert chapter
  def insert_chapter(cur, law_id, number, title, version_number):
      cur.execute("""
          INSERT INTO chapters (law_id, chapter_number, chapter_title, version_number, status)
          VALUES (%s,%s,%s,%s,'active')
      """, (law_id, number, title, version_number))
  
  # Line 14-22: Insert section
  def insert_section(cur, chapter_id, number, title, version_number):
      cur.execute("""
          INSERT INTO sections (chapter_id, section_number, section_title, version_number, status)
          VALUES (%s,%s,%s,%s,'active')
      """)
  
  # Line 26-35: Insert article (chính)
  def insert_article(cur, law_id, chapter_id, section_id, number, title, content, version_number):
      cur.execute("""
          INSERT INTO articles (law_id, chapter_id, section_id, article_number, 
                                article_title, content, version_number, status)
          VALUES (%s,%s,%s,%s,%s,%s,%s,'active')
      """)
  
  # Line 37-50: Fallback nếu created_at không có default
  except Exception as exc:
      if "created_at" not in str(exc).lower():
          raise
      # Add created_at=NOW()
  ```
- **Mô tả:**
  - Chuỗi insert dependency: chapters → sections → articles
  - Fallback nếu created_at không có default value

---

### 6️⃣ **`db.py`** - Database Connection
- **Chức nauung:** Wrapper cho database connection
- **Dòng quan trọng:**
  ```python
  # Line 5-6: Import sys path để lấy db_core từ cha
  sys.path.append(str(Path(__file__).resolve().parents[1]))
  from db_core import get_connection, execute_query
  
  # Line 8-9: Backward compatible wrapper
  def get_db_connection():
      return get_connection()
  ```
- **Mô tả:**
  - Wrapper compatibility
  - Dùng `db_core.py` từ thư mục cha

---

### 7️⃣ **`log_utils.py`** - Logging Helper
- **Chức nauung:** In log có timestamp
- **Dòng quan trọng:**
  ```python
  # Line 4-5: In log với timestamp
  def log_step(message: str):
      ts = datetime.now().strftime("%H:%M:%S")
      print(f"[{ts}] {message}", flush=True)
  ```
- **Mô tả:**
  - Simple logging utility
  - Format: `[HH:MM:SS] message`

---

### 8️⃣ **`metadata_extractor.py`** - Extract Metadata từ HTML
- **Chức nauung:** Parse metadata từ HTML table (tiêu đề, mã, loại, ngày ban hành...)
- **Dòng quan trọng:**
  ```python
  # Line 6-21: Safe parse ngày (múi format)
  def safe_date(date_str):
      fmts = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d.%m.%Y")
      for fmt in fmts:
          try:
              return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
          except ValueError:
              continue
      # Fallback: regex match (d/m/Y)
  
  # Line 24-46: Extract metadata từ HTML
  def extract_metadata(soup):
      info_table = soup.select_one("table.table-info, div#ctl00_...")
      meta_info = {}
      for r in info_table.select("tr"):
          tds = r.select("td")
          meta_info[tds[0].get_text()] = tds[1].get_text()
      
      # Title từ h1 tag + cleanup
      title_tag = soup.select_one("h1")
      title = title_tag.get_text(strip=True)
      if "số" in title.lower():
          title = re.split(r"\s*số\s*[\d/]+/qh\d+", title)[0].strip()
      
      # Fallback: extract từ metadata table
      code = meta_info.get("Số hiệu", "Không rõ")
      law_type = meta_info.get("Loại văn bản", "")
      issued_date = safe_date(meta_info.get("Ngày ban hành", ""))
      effective_date = safe_date(meta_info.get("Ngày có hiệu lực", ""))
  
      # Fallback nếu không tìm được: regex search trong HTML
      if not issued_date:
          issued_tag = soup.find("i", string=re.compile(r"ngày\s+\d{1,2}..."))
          m = re.search(r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})", ...)
  ```
- **Mô tả:**
  - Parse metadata từ HTML table
  - Safe date parsing (5 format khác nhau)
  - Fallback: extract từ text nếu table không có
  - Return: title, code, type, issued_date, effective_date

---

### 9️⃣ **`run_crawl_api.py`** - CLI API Crawl (cho backend)
- **Chức nauung:** Entry point gọi từ backend PHP (CLI mode)
- **Dòng quan trọng:**
  ```python
  # Line 4: Force UTF-8
  sys.stdout.reconfigure(encoding="utf-8")
  
  # Line 7-9: Kiểm tra tham số URL
  if len(sys.argv) < 2:
      log_step("ERROR: Missing url argument")
      sys.exit(2)
  
  # Line 12-15: Validate URL (must be thuvienphapluat.vn)
  if not re.match(r"^https://thuvienphapluat\.vn/van-ban/.+", url):
      log_step("ERROR: URL không hợp lệ")
      sys.exit(2)
  
  # Line 21: Gọi main crawl
  crawl_law_page(url)
  ```
- **Mô tả:**
  - CLI entry point (dùng để backend gọi)
  - Validate URL
  - Exit code: 0 (success), 1 (crawl error), 2 (input error)

---

### 🔟 **`run_crawl.py`** - Interactive Crawl (Manual)
- **Chức nauung:** Interactive mode (user input URL)
- **Dòng quan trọng:**
  ```python
  # Line 7-10: In menu + lấy URL input
  print("📘 HỆ THỐNG CRAWLER ILAS — Crawl luật từ Thư viện pháp luật")
  url = input("➡️ URL: ").strip()
  
  # Line 12-15: Validate URL
  if not re.match(r"^https://thuvienphapluat\.vn/van-ban/.+", url):
      print("⚠️ URL không hợp lệ!")
  
  # Line 20: Gọi crawl + print result
  crawl_law_page(url)
  print("\n✅ Crawl hoàn tất và đã lưu dữ liệu vào cơ sở dữ liệu ILAS.")
  ```
- **Mô tả:**
  - Interactive user input
  - Manual crawl từ command line

---

---

## 📊 BẢNG TÓMT TẮT

| File | Loại | Chức Năng | Input | Output |
|------|------|----------|-------|--------|
| **app.py** | Core | Flask API server | HTTP POST | JSON response |
| **bm25_index.py** | Search | BM25 keyword search | query string | Ranked doc IDs |
| **build_vector_store_chunks.py** | Data | Embed chunks → vectors | Articles from DB | vectors.npy + meta.json |
| **build_vector_store_faq.py** | Data | Embed FAQ → vectors | FAQ from DB | vectors.npy + meta.json |
| **build_vector_store_simplified.py** | Data | Embed simplified → vectors | Simplified from DB | vectors.npy + meta.json |
| **context_builder.py** | RAG | Build prompt context | Search results | Full article text |
| **groq_service.py** | LLM | Call Groq API | Context + question | LLM answer |
| **legal_rag_pipeline.py** | RAG | Main RAG pipeline | Query + settings | Final answer |
| **legal_topic_boost.py** | Search | Topic scoring | Query + text | Score multiplier |
| **local_embedder.py** | Embedding | Sentence transformer | Text strings | 384-dim vectors |
| **rebuild_all.py** | Utility | Rebuild all indexes | (N/A) | Updated indexes |
| **retrieval_level6.py** | Search | Hybrid retrieval | Query + filter | Ranked results |
| **topic_cluster_builder.py** | Data | KMeans clustering | Vectors | Cluster IDs + centroids |
| **archive_cleanup.py** | Data | Archive old data | Law versions | Archived records |
| **content_cleaner.py** | Data | Normalize content | Raw HTML text | Clean text |
| **crawl_law.py** | Crawl | Main crawler | URL | Insert DB |
| **db_inserts.py** | Data | Insert chapters/sections | DB cursor | Inserted row IDs |
| **db.py** | Data | DB wrapper | (connection) | Connection object |
| **log_utils.py** | Utility | Logging | Message string | Timestamped log |
| **metadata_extractor.py** | Parse | Extract metadata | soup object | title, code, dates |
| **run_crawl_api.py** | CLI | Backend API entry | URL arg | stdout logs |
| **run_crawl.py** | CLI | User interactive mode | User input | stdout logs |

---

## 🔄 Luồng Dữ Liệu

### Crawler Flow:
```
URL → [run_crawl_api/run_crawl] 
  → [crawl_law.py] 
    → [Playwright download HTML]
    → [BeautifulSoup parse]
    → [metadata_extractor.py] (title, code, dates)
    → [content_cleaner.py] (normalize content)
    → [archive_cleanup.py] (archive old versions)
    → [db_inserts.py] (insert chapters/sections/articles)
    → DB (laws, chapters, sections, articles, simplified_articles)
```

### Vector Store Build Flow:
```
rebuild_all.py
  ├─ [build_vector_store_chunks.py]
  │   ├─ Load articles from DB
  │   ├─ Split into chunks (khoản/điểm)
  │   ├─ [local_embedder.py] embed chunks
  │   └─ Save vectors.npy + meta.json
  ├─ [build_vector_store_faq.py] → FAQ vectors
  ├─ [build_vector_store_simplified.py] → Simplified vectors
  ├─ [bm25_index.py] → BM25 index
  └─ [topic_cluster_builder.py] → KMeans clusters
```

### RAG Query Flow:
```
Query → [app.py /api/ask]
  → [legal_rag_pipeline.py]
    ├─ [retrieval_level6.py] (hybrid: BM25 + semantic + intent)
    │   ├─ [legal_topic_boost.py] (score boost)
    │   ├─ [bm25_index.py] (keyword search)
    │   └─ [local_embedder.py] (semantic search)
    ├─ [context_builder.py] (fetch full article)
    ├─ [groq_service.py] (call LLM)
    │   └─ Answer generation (strict mode)
    └─ [app.py] response JSON
```

---

## 🎯 Dòng Code Quan Trọng - Quick Reference

| Khía Cạnh | File | Dòng |
|-----------|------|------|
| **Model Embedding** | local_embedder.py | 5-6 (`intfloat/multilingual-e5-base`) |
| **LLM API** | groq_service.py | 11-13 (Groq Llama-3.1-8B) |
| **Chunking Strategy** | build_vector_store_chunks.py | 10-11 (regex split khoản/điểm) |
| **Cascading Delete** | archive_cleanup.py | 2-20 (archive_other_laws) |
| **Date Parsing** | metadata_extractor.py | 6-21 (safe_date) |
| **Intent Routing** | retrieval_level6.py | 28-45 (INTENT_TO_ARTICLES) |
| **Topic Boost** | legal_topic_boost.py | 33-34 (-1.2 penalty non-labor) |
| **Admin Settings** | legal_rag_pipeline.py | 10-25 (settings handling) |
| **Web Scraping** | crawl_law.py | 20-27 (Playwright headless) |
| **System Prompt Lock** | groq_service.py | 67-90 (strict legal guidelines) |

---

**End of Analysis**


## 📋 TÓM TẮT HỆ THỐNG AI (Thư Mục `ai/`)

**Hệ thống AI trong ILAS được xây dựng để trả lời câu hỏi pháp lý một cách chính xác bằng cách tìm kiếm thông tin từ cơ sở dữ liệu luật trước, rồi mới gửi cho AI sinh câu trả lời.** Phương pháp này gọi là RAG (Retrieval-Augmented Generation), nghĩa là "Tìm kiếm trước, rồi tăng cường thông tin cho AI". Khác với các chatbot thông thường chỉ dùng kiến thức đã học, ILAS kết hợp tìm kiếm + AI, giúp câu trả lời có căn cứ pháp luật thực tế. Ví dụ khi user hỏi "Tôi muốn xin nghỉ phép", thay vì AI tự phát biểu, hệ thống sẽ: tìm các điều luật liên quan (Điều 113), lấy nội dung đầy đủ, rồi gửi cho AI để tóm tắt câu trả lời dựa trên nội dung đó.

**Bước 1: Tìm kiếm thông minh (Hybrid Search)** - Hệ thống không chỉ tìm kiếm theo từ khóa mà sử dụng 4 phương pháp tìm kiếm cùng lúc để tìm kết quả tốt nhất. (1) **BM25 Search** (50%): Tìm kiếm từ khóa chính xác - nếu user tìm "lương", nó sẽ ưu tiên các văn bản chứa chữ "lương". (2) **Vector Semantic Search** (30%): Tìm ý nghĩa - thay vì tìm chữ "lương" thì tìm các văn bản liên quan đến "lương, tiền, phương pháp tính tiền" dù không dùng chữ "lương". (3) **Topic Boost** (20%): Ưu tiên chủ đề - nếu user hỏi "lương", hệ thống biết đây là chủ đề lao động và sẽ giảm trọng số các kết quả không liên quan lao động (ví dụ: lương ngừng dạy kỹ năng). (4) **Intent Routing**: Nếu user hỏi "nghỉ việc", hệ thống tự động biết nên search Điều 35, 36 (không cần user nói rõ). Để search nhanh hơn với 3000+ văn bản, hệ thống dùng kỹ thuật gọi KMeans clustering - chia 3000 văn bản thành 8-16 nhóm theo ý nghĩa, rồi chỉ tìm trong nhóm liên quan (tốc độ nhanh gấp 8 lần). Công cụ chuyển văn text thành "mã số" (vector) 384 chiều để tìm kiếm là model `intfloat/multilingual-e5-base`, được huấn luyện tối ưu cho tiếng Việt.

**Bước 2: Lấy nội dung đầy đủ (Build Context)** - Sau khi tìm được top-5 kết quả liên quan nhất, hệ thống không dùng ngay kết quả đó, mà lấy bài viết pháp luật **đầy đủ** từ database (ví dụ lấy toàn bộ Điều 113 thay vì chỉ lấy 1 đoạn nhỏ). Chỉ chấp nhận từ các nguồn chính thức là luật thực tế (articles hoặc articles/chunks), không dùng FAQ hay bản rút gọn dễ hiểu (vì có thể sai, không chính xác pháp luật). Hệ thống quản lý 4 "kho văn bản" độc lập: `vector_store/articles/` (1700+ điều luật gốc), `vector_store/articles/chunks/` (3000+ đoạn nhỏ = khoản/điểm của luật), `vector_store/faq/` (500+ câu hỏi-trả lời thường gặp), `vector_store/simplified/` (400+ bản rút gọn dễ hiểu). Mỗi kho chứa: file vectors (các mã số 384-chiều), file metadata (thông tin: ID, nội dung, chủ đề), file centroids (trung tâm nội dung của từng nhóm).

**Bước 3: Gọi AI để viết câu trả lời (Call LLM)** - Hệ thống gửi yêu cầu tới Groq Llama-3.1-8B (một AI model mạnh) kèm thông tin cần trả lời là nội dung luật đã lấy. **Điểm quan trọng là system prompt (chỉ dẫn lập trình cho AI) rất (nghiêm ngặt**: AI PHẢI chỉ dùng nội dung được gửi, phải trích dẫn đúng điều khoản, không được bịa thêm. Temperature (tính sáng tạo) được set rất thấp 0.15 (0 = máy móc, 1 = sáng tạo), nghĩa là AI sẽ tuân thủ pháp luật cứng nhắc, không bịa bịa. Max_tokens 900 nghĩa là câu trả lời dài tối đa 900 ký tự (dài vừa đủ). Tất cả các tham số này có thể admin cấu hình: `enabled` (bật tắt), `responseDelay` (ghost tốc độ để test), `dataSource` (chọn tìm quều loại), `temperature` (độ sáng tạo), `maxTokens` (độ dài).

**Bước 4: Trả lời có trích dẫn (Return Answer)** - Hệ thống trả lời kèm theo nguồn (ví dụ "Theo Điều 113..."). Nếu tìm kiếm thất bại, hệ thống không im lặng mà cảnh báo user "Kết quả này từ AI chung chung, không dựa vào ILAS" (fallback = kế hoạch dự phòng). **Toàn bộ quy trình được điều phối bởi file `legal_rag_pipeline.py`** (người quản lý), nhưng cần nhiều file hỗ trợ: `local_embedder.py` chuyển text thành số, `bm25_index.py` tìm từ khóa, `retrieval_level6.py` kết hợp 4 phương pháp tìm, `groq_service.py` gọi AI, `context_builder.py` lấy nội dung đầy đủ. Admin có thể rebuild toàn bộ hệ thống (rebuild = làm lại từ đầu) thông qua nút `/api/admin/rebuild` khi có luật mới hoặc thay đổi model.

---

---

## 📋 TÓM TẮT HỆ THỐNG CRAWLER (Thư Mục `crawler/`)

**Hệ thống Crawler là một "robot thông minh" tự động lên trang web thuvienphapluat.vn, tải về nội dung luật, làm sạch dữ liệu, rồi lưu vào database để AI có thể search và trả lời câu hỏi.** Thay vì con người phải thủ công copy-paste từng bộ luật, Crawler làm tất cả automatically (tự động). Khi có bộ luật mới trên website, admin chỉ cần cung cấp URL, hệ thống tự động download, xử lý, lưu vào DB trong vài phút.

**Bước 1: Tải xuống HTML (Download HTML)** - Crawler sử dụng Playwright (một trình duyệt ảo không cần hiển thị giao diện) thay vì công cụ tải web thông thường, vì trang web thuvienphapluat.vn sử dụng JavaScript (mã động). Công cụ tải web thông thường sẽ lấy được HTML cơ bản nhưng không chạy JavaScript, nên sẽ bỏ lỡ phần nội dung tải về dynamically. Playwright mở trình duyệt ảo (headless = không hiển thị màn hình), navigate tới URL, chờ JavaScript chạy xong (~4 giây), rồi lấy HTML đầy đủ.

**Bước 2: Trích xuất metadata (Extract Metadata)** - Nhìu file `metadata_extractor.py` đọc HTML và tìm thông tin cơ bản của luật: tiêu đề (ví dụ "Bộ luật Lao động"), "Số hiệu" code (ví dụ "45/QHX"), "Loại văn bản" (luật, lệnh, quyết định), "Ngày ban hành" (ngày phát hành), "Ngày có hiệu lực" (ngày bắt đầu áp dụng). File này rất thông minh vì nó hỗ trợ 5 định dạng ngày khác nhau (d/m/Y, Y-m-d, v.v. - vì các website khác nhau viết ngày khác nhau), và nếu không tìm được trong HTML table (bảng) thì sử dụng regex (quy tắc tìm kiếm chữ) để search trong nội dung HTML.

**Bước 3: Chuẩn hóa nội dung (Normalize Content)** - Khi Crawler lấy nội dung từ HTML, nó bị "bẻ gãy" thành nhiều dòng nhỏ do định dạng HTML (các thẻ `<p>`, `<br>`, v.v.). File `content_cleaner.py` gộp các dòng lại, nhưng rất thông minh: **vẫn giữ nguyên cấu trúc pháp lý** như khoản (1., 2., 3.), điểm (a), b), c)), dấu bullet (•). Ví dụ nó biết rằng khi gặp "1. " là bắt đầu 1 khoản mới, nên giữ lại break line, nhưng nếu là dòng thường là gộp lại.

**Bước 4: Archive dữ liệu cũ (Archive Old Data)** - Khi crawl bộ luật mới (version 2), hệ thống không xóa version cũ (version 1), mà đặt status='archived' (lưu trữ), giữ lại để lịch sử. File `archive_cleanup.py` thực hiện cascading archive (cascading = theo dõi theo chuỗi) - nếu archive 1 bộ luật, tất cả chapters (chương), sections (bộ phận), articles (điều), và simplified_articles (bản rút gọn) của nó cũng được archive theo. Ngoài ra, nó xóa cứng (hard delete) các version quá cũ (chỉ giữ 5 version mới nhất).

**Bước 5: Insert vào Database (Insert into Database)** - File `db_inserts.py` chứa các helper functions (hàm hỗ trợ) để insert chapters → sections → articles vào database. Tại sao phải insert theo thứ tự (cascading)? Vì database có foreign key constraint (ràng buộc) - 1 section phải thuộc 1 chapter, 1 article phải thuộc 1 section, không thể insert article nếu chưa có section. Mỗi lần crawl, version_number tự động tăng (+1).

**Bước 6: Quản lý version (Version Management)** - Mỗi bộ luật có version_number riêng trong database (per-law versioning = phiên bản riêng biệt cho từng luật). Workflow điển hình: Archive old versions (đặt status='archived') → Insert new version (insert data mới với version_number tăng) → Update version_number (+1). Database được thiết kế như cây cấu trúc: laws (luật chính) → chapters (chương) → sections (bộ phận) → articles (điều) → simplified_articles (bản rút gọn), với mỗi level có version_number và status field để track.

**Bước 7: Logging & Error Handling** - File `log_utils.py` in ra log (nhật ký) với timestamp (dấu thời gian) cho mỗi bước ("🚀 Bắt đầu crawl lúc 14:30:45", "✅ Lấy HTML xong lúc 14:31:02", v.v.), để sau này có lỗi thì debug dễ. Entry points (cổng vào) của Crawler là 2 file: `run_crawl_api.py` (CLI-mode = command line, gọi từ backend PHP, trả về exit code: 0=thành công, 1=lỗi crawl, 2=lỗi input) và `run_crawl.py` (interactive mode = user tự nhập URL). **Crawler tích hợp với AI System**: Sau khi update database, Crawler trigger (kích hoạt) `rebuild_all.py` chạy ở background (chạy đụng nền, không chặn) để rebuild toàn bộ vector stores (kho tìm kiếm của AI) từ data mới. Admin có thể gọi endpoint `/api/admin/rebuild` để trigger rebuild on-demand (khi cần).

---

