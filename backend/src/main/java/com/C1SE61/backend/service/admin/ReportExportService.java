package com.C1SE61.backend.service.admin;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.pdf.BaseFont;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportExportService {

    private static final String DATE_FORMAT = "dd/MM/yyyy HH:mm";
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);

    /**
     * Xuất báo cáo dưới dạng Excel
     */
    public ByteArrayOutputStream exportToExcel(Map<String, Object> reportData) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        
        // Sheet 1: Thống kê tổng quan
        createSummarySheet(workbook, reportData);
        
        // Sheet 2: Dữ liệu tuần
        createWeeklyDataSheet(workbook, reportData);
        
        // Sheet 3: Top trang truy cập
        createTopContentSheet(workbook, reportData);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        return baos;
    }

    /**
     * Xuất báo cáo dưới dạng PDF với bảng
     */
    public ByteArrayOutputStream exportToPdf(Map<String, Object> reportData) throws IOException, DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        Document document = new Document(PageSize.A4, 20, 20, 40, 40);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Register system fonts so FontFactory can find fonts that support Vietnamese/Unicode
        // This avoids using the built-in 14 PDF fonts which don't support accented characters.
        try {
            FontFactory.registerDirectories();
        } catch (Exception ignored) {
            // If registration fails, we'll fall back to default fonts (may lose diacritics).
        }

        // Use a system font (e.g., Arial or other available) with Identity-H encoding and embed it.
        // Identity-H + embedding ensures Unicode characters (Vietnamese) render correctly.
        com.itextpdf.text.Font titleFont = FontFactory.getFont("Arial", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 18, com.itextpdf.text.Font.BOLD);
        com.itextpdf.text.Font dateFont = FontFactory.getFont("Arial", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 10, com.itextpdf.text.Font.NORMAL);
        com.itextpdf.text.Font sectionFont = FontFactory.getFont("Arial", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 14, com.itextpdf.text.Font.BOLD);
        com.itextpdf.text.Font headerFont = FontFactory.getFont("Arial", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 11, com.itextpdf.text.Font.BOLD);
        com.itextpdf.text.Font normalFont = FontFactory.getFont("Arial", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 10, com.itextpdf.text.Font.NORMAL);

        // Title
        Paragraph title = new Paragraph("BÁO CÁO THỐNG KÊ HỆ THỐNG ILAS", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        // Ngày xuất
        Paragraph dateP = new Paragraph("Ngày xuất: " + LocalDateTime.now().format(formatter), dateFont);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        document.add(dateP);
        
        document.add(new Paragraph("\n"));
        
        // Thống kê tổng quan
        Paragraph section1 = new Paragraph("THỐNG KÊ TỔNG QUAN", sectionFont);
        document.add(section1);
        
        // Bảng thống kê
        @SuppressWarnings("unchecked")
        Map<String, Object> stats = (Map<String, Object>) reportData.get("stats");
        if (stats != null) {
            PdfPTable statsTable = new PdfPTable(2);
            statsTable.setWidthPercentage(100);
            
            // Header
            PdfPCell headerCell1 = new PdfPCell(new Phrase("Chỉ tiêu", headerFont));
            PdfPCell headerCell2 = new PdfPCell(new Phrase("Giá trị", headerFont));
            headerCell1.setBackgroundColor(new BaseColor(200, 200, 200));
            headerCell2.setBackgroundColor(new BaseColor(200, 200, 200));
            statsTable.addCell(headerCell1);
            statsTable.addCell(headerCell2);
            
            // Data
            String[][] data = {
                {"Tổng Người Dùng", stats.get("totalUsers") != null ? stats.get("totalUsers").toString() : "0"},
                {"Tổng Nội Dung", stats.get("totalContent") != null ? stats.get("totalContent").toString() : "0"},
                {"Tổng Biểu Mẫu", stats.get("totalForms") != null ? stats.get("totalForms").toString() : "0"},
                {"Tổng Phản Hồi", stats.get("totalFeedback") != null ? stats.get("totalFeedback").toString() : "0"}
            };
            
            for (String[] row : data) {
                statsTable.addCell(new Phrase(row[0], normalFont));
                statsTable.addCell(new Phrase(row[1], normalFont));
            }
            
            document.add(statsTable);
        }
        
        document.add(new Paragraph("\n"));
        
        // Top trang truy cập
        Paragraph section2 = new Paragraph("TOP TRANG ĐƯỢC TRUY CẬP", sectionFont);
        document.add(section2);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topContents = (List<Map<String, Object>>) reportData.get("topContents");
        if (topContents != null && !topContents.isEmpty()) {
            PdfPTable contentTable = new PdfPTable(3);
            contentTable.setWidthPercentage(100);
            contentTable.setWidths(new float[]{0.8f, 4f, 1.2f});
            
            // Header
            PdfPCell h1 = new PdfPCell(new Phrase("STT", headerFont));
            PdfPCell h2 = new PdfPCell(new Phrase("Tiêu đề", headerFont));
            PdfPCell h3 = new PdfPCell(new Phrase("Lượt xem", headerFont));
            h1.setBackgroundColor(new BaseColor(200, 200, 200));
            h2.setBackgroundColor(new BaseColor(200, 200, 200));
            h3.setBackgroundColor(new BaseColor(200, 200, 200));
            contentTable.addCell(h1);
            contentTable.addCell(h2);
            contentTable.addCell(h3);
            
            // Data
            int stt = 1;
            for (Map<String, Object> item : topContents) {
                contentTable.addCell(new Phrase(String.valueOf(stt), normalFont));
                contentTable.addCell(new Phrase(item.get("title") != null ? item.get("title").toString() : "", normalFont));
                contentTable.addCell(new Phrase(item.get("views") != null ? item.get("views").toString() : "0", normalFont));
                stt++;
            }
            
            document.add(contentTable);
        }

        document.close();
        return baos;
    }

    /**
     * Tạo sheet thống kê tổng quan
     */
    private void createSummarySheet(Workbook workbook, Map<String, Object> reportData) {
        Sheet sheet = workbook.createSheet("Thống Kê Tổng Quan");
        
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        // Row 0: Header
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("BÁO CÁO THỐNG KÊ HỆ THỐNG ILAS");
        headerRow.getCell(0).setCellStyle(headerStyle);
        
        // Row 2: Thông tin báo cáo
        sheet.createRow(2).createCell(0).setCellValue("Ngày xuất: " + LocalDateTime.now().format(formatter));
        
        // Row 4: Tiêu đề bảng
        Row titleRow = sheet.createRow(4);
        titleRow.createCell(0).setCellValue("Chỉ tiêu");
        titleRow.createCell(1).setCellValue("Giá trị");
        titleRow.createCell(2).setCellValue("Thay đổi (%)");
        applyHeaderStyle(titleRow, headerStyle);
        
        // Dữ liệu
        @SuppressWarnings("unchecked")
        Map<String, Object> stats = (Map<String, Object>) reportData.get("stats");
        int rowNum = 5;
        
        String[][] data = {
            {"Tổng Người Dùng", "totalUsers", "usersChange"},
            {"Tổng Nội Dung", "totalContent", "contentChange"},
            {"Tổng Biểu Mẫu", "totalForms", "formsChange"},
            {"Tổng Phản Hồi", "totalFeedback", "feedbackChange"}
        };
        
        for (String[] item : data) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(item[0]);
            row.createCell(1).setCellValue(stats.get(item[1]) != null ? stats.get(item[1]).toString() : "0");
            row.createCell(2).setCellValue(stats.get(item[2]) != null ? Double.parseDouble(stats.get(item[2]).toString()) : 0);
        }
        
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);
    }

    /**
     * Tạo sheet dữ liệu tuần
     */
    private void createWeeklyDataSheet(Workbook workbook, Map<String, Object> reportData) {
        Sheet sheet = workbook.createSheet("Dữ Liệu Tuần");
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Ngày");
        headerRow.createCell(1).setCellValue("Người dùng");
        headerRow.createCell(2).setCellValue("Nội dung");
        headerRow.createCell(3).setCellValue("Biểu mẫu");
        applyHeaderStyle(headerRow, headerStyle);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> weeklyData = (List<Map<String, Object>>) reportData.get("weeklyData");
        if (weeklyData != null) {
            int rowNum = 1;
            for (Map<String, Object> item : weeklyData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.get("label") != null ? item.get("label").toString() : "");
                row.createCell(1).setCellValue(item.get("users") != null ? Long.parseLong(item.get("users").toString()) : 0);
                row.createCell(2).setCellValue(item.get("content") != null ? Long.parseLong(item.get("content").toString()) : 0);
                row.createCell(3).setCellValue(item.get("forms") != null ? Long.parseLong(item.get("forms").toString()) : 0);
            }
        }
        
        sheet.setColumnWidth(0, 4000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);
        sheet.setColumnWidth(3, 4000);
    }

    /**
     * Tạo sheet top trang truy cập
     */
    private void createTopContentSheet(Workbook workbook, Map<String, Object> reportData) {
        Sheet sheet = workbook.createSheet("Top Trang Truy Cập");
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("STT");
        headerRow.createCell(1).setCellValue("Tiêu đề");
        headerRow.createCell(2).setCellValue("Lượt xem");
        applyHeaderStyle(headerRow, headerStyle);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topContents = (List<Map<String, Object>>) reportData.get("topContents");
        if (topContents != null) {
            int rowNum = 1;
            int stt = 1;
            for (Map<String, Object> item : topContents) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(stt++);
                row.createCell(1).setCellValue(item.get("title") != null ? item.get("title").toString() : "");
                row.createCell(2).setCellValue(item.get("views") != null ? Long.parseLong(item.get("views").toString()) : 0);
            }
        }
        
        sheet.setColumnWidth(0, 2000);
        sheet.setColumnWidth(1, 6000);
        sheet.setColumnWidth(2, 4000);
    }

    /**
     * Tạo style cho header
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    /**
     * Áp dụng header style cho row
     */
    private void applyHeaderStyle(Row row, CellStyle style) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            if (row.getCell(i) != null) {
                row.getCell(i).setCellStyle(style);
            }
        }
    }
}

