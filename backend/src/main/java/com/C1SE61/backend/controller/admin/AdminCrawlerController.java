package com.C1SE61.backend.controller.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin/crawler")
public class AdminCrawlerController {

    private final JdbcTemplate jdbcTemplate;

    public AdminCrawlerController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Value("${crawler.python.executable}")
    private String pythonExe;

    @Value("${crawler.python.workdir}")
    private String pythonWorkDir;

    @Value("${crawler.python.module}")
    private String pythonModule;

    @Value("${crawler.python.timeoutSeconds:600}")
    private long timeoutSeconds;

    @PostMapping("/laws")
    public ResponseEntity<?> crawlLaw(@RequestBody Map<String, String> body) {
        String url = body.get("url");

        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "URL khong duoc de trong"));
        }

        if (!url.startsWith("https://thuvienphapluat.vn/van-ban/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "URL khong hop le, phai tu thuvienphapluat.vn/van-ban/"));
        }

        Process process = null;
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    pythonExe,
                    "-m",
                    pythonModule,
                    url.trim()
            );

            pb.directory(new File(pythonWorkDir));
            pb.environment().put("PYTHONUTF8", "1");
            pb.environment().put("PYTHONIOENCODING", "utf-8");
            pb.redirectErrorStream(true);

            process = pb.start();
            String logs = readAll(process.getInputStream());

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return ResponseEntity.status(504).body(Map.of(
                        "message", "Crawler timeout",
                        "logs", logs
                ));
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                return ResponseEntity.status(500).body(Map.of(
                        "message", "Crawler loi",
                        "logs", logs
                ));
            }

            Integer lawId = extractLawId(logs);
            String activeLog = "";
            if (lawId != null) {
                forceActive(lawId);
                activeLog = "\nFORCE ACTIVE: law_id=" + lawId + " va toan bo chuong/muc/dieu vua crawl.";
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Cao luat thanh cong");
            response.put("lawId", lawId);
            response.put("logs", logs + activeLog);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Loi khi chay crawler",
                    "error", e.getMessage()
            ));
        } finally {
            if (process != null) {
                try { process.getInputStream().close(); } catch (IOException ignored) {}
                try { process.getOutputStream().close(); } catch (IOException ignored) {}
                try { process.getErrorStream().close(); } catch (IOException ignored) {}
            }
        }
    }

    private String readAll(InputStream in) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    private Integer extractLawId(String logs) {
        if (logs == null) return null;
        Matcher matcher = Pattern.compile("Lu.{1,3}t ID=(\\d+)|Luat ID=(\\d+)", Pattern.CASE_INSENSITIVE)
                .matcher(logs);
        if (!matcher.find()) return null;
        String value = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private void forceActive(Integer lawId) {
        jdbcTemplate.update("UPDATE laws SET status='active' WHERE law_id=?", lawId);
        jdbcTemplate.update("UPDATE chapters SET status='active' WHERE law_id=?", lawId);
        jdbcTemplate.update("""
                UPDATE sections s
                JOIN chapters c ON s.chapter_id = c.chapter_id
                SET s.status='active'
                WHERE c.law_id=?
                """, lawId);
        jdbcTemplate.update("UPDATE articles SET status='active' WHERE law_id=?", lawId);
    }
}
