package com.C1SE61.backend.controller.user;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.request.user.FeedbackRequestDTO;
import com.C1SE61.backend.dto.response.user.FeedbackDTO;
import com.C1SE61.backend.model.Feedback;
import com.C1SE61.backend.service.user.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    /**
     * Tạo feedback mới
     * POST /api/feedback
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FeedbackDTO>> createFeedback(@RequestBody FeedbackRequestDTO request) {
        try {
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Nội dung phản hồi không được để trống"));
            }

            FeedbackDTO feedback = feedbackService.createFeedback(request);
            return ResponseEntity.ok(ApiResponse.success("Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp.", feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi gửi phản hồi: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả feedback với phân trang (Admin/Editor)
     * GET /api/feedback?page={page}&size={size}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedbackDTO>>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<FeedbackDTO> feedbacks = feedbackService.getAllFeedbacks(page, size);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phản hồi thành công!", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy danh sách phản hồi: " + e.getMessage()));
        }
    }

    /**
     * Lấy feedback theo trạng thái (Admin/Editor)
     * GET /api/feedback/status/{status}?page={page}&size={size}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<FeedbackDTO>>> getFeedbacksByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Feedback.Status feedbackStatus;
            try {
                feedbackStatus = Feedback.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái không hợp lệ: " + status));
            }

            Page<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByStatus(feedbackStatus, page, size);
            return ResponseEntity.ok(ApiResponse.success("Lấy phản hồi theo trạng thái thành công!", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy phản hồi theo trạng thái: " + e.getMessage()));
        }
    }

    /**
     * Lấy feedback theo user ID
     * GET /api/feedback/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<FeedbackDTO>>> getFeedbacksByUserId(@PathVariable Integer userId) {
        try {
            List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Lấy phản hồi của user thành công!", feedbacks));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi lấy phản hồi của user: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái feedback (Admin/Editor)
     * PUT /api/feedback/{feedbackId}/status
     */
    @PutMapping("/{feedbackId}/status")
    public ResponseEntity<ApiResponse<FeedbackDTO>> updateFeedbackStatus(
            @PathVariable Integer feedbackId,
            @RequestParam String status) {
        try {
            Feedback.Status feedbackStatus;
            try {
                feedbackStatus = Feedback.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái không hợp lệ: " + status));
            }

            FeedbackDTO feedback = feedbackService.updateFeedbackStatus(feedbackId, feedbackStatus);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái phản hồi thành công!", feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Lỗi khi cập nhật trạng thái phản hồi: " + e.getMessage()));
        }
    }
}

