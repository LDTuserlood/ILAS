package com.C1SE61.backend.service.user;

import com.C1SE61.backend.dto.request.user.FeedbackRequestDTO;
import com.C1SE61.backend.dto.response.user.FeedbackDTO;
import com.C1SE61.backend.model.Article;
import com.C1SE61.backend.model.Feedback;
import com.C1SE61.backend.model.Law;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.ArticleRepository;
import com.C1SE61.backend.repository.FeedbackRepository;
import com.C1SE61.backend.repository.LawRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FeedbackService {
    
    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private UserAccountRepository userAccountRepository;
    
    @Autowired
    private LawRepository lawRepository;
    
    @Autowired
    private ArticleRepository articleRepository;
    
    @Autowired
    private com.C1SE61.backend.service.log.AuditLogService auditLogService;
    
    /**
     * Tạo feedback mới
     */
    public FeedbackDTO createFeedback(FeedbackRequestDTO request) {
        try {
            logger.info("Tạo feedback mới từ user: {}", request.getUserId());
            
            Feedback feedback = new Feedback();
            feedback.setContent(request.getContent());
            feedback.setStatus(Feedback.Status.UNPROCESSED);
            
            // Set user nếu có
            if (request.getUserId() != null) {
                Optional<UserAccount> user = userAccountRepository.findById(request.getUserId());
                if (user.isPresent()) {
                    feedback.setUser(user.get());
                }
            }
            
            // Set law nếu có
            if (request.getLawId() != null) {
                Optional<Law> law = lawRepository.findById(request.getLawId());
                if (law.isPresent()) {
                    feedback.setLaw(law.get());
                }
            }
            
            // Set article nếu có
            if (request.getArticleId() != null) {
                Optional<Article> article = articleRepository.findById(request.getArticleId());
                if (article.isPresent()) {
                    feedback.setArticle(article.get());
                }
            }
            
            Feedback savedFeedback = feedbackRepository.save(feedback);
            logger.info("Tạo feedback thành công với ID: {}", savedFeedback.getFeedbackId());
            try {
                UserAccount u = savedFeedback.getUser();
                auditLogService.log("Gửi phản hồi", "feedbackId=" + savedFeedback.getFeedbackId() + " contentLen=" + (savedFeedback.getContent() == null ? 0 : savedFeedback.getContent().length()), u);
            } catch (Exception ignored) {}
            return new FeedbackDTO(savedFeedback);
        } catch (Exception e) {
            logger.error("Lỗi khi tạo feedback: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo feedback: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy tất cả feedback với phân trang
     */
    public Page<FeedbackDTO> getAllFeedbacks(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Feedback> feedbacks = feedbackRepository.findAllOrderByCreatedAtDesc(pageable);
            return feedbacks.map(FeedbackDTO::new);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách feedback: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy danh sách feedback: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy feedback theo trạng thái
     */
    public Page<FeedbackDTO> getFeedbacksByStatus(Feedback.Status status, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Feedback> feedbacks = feedbackRepository.findByStatus(status, pageable);
            return feedbacks.map(FeedbackDTO::new);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy feedback theo trạng thái: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy feedback theo trạng thái: " + e.getMessage(), e);
        }
    }
    
    /**
     * Lấy feedback theo user
     */
    public List<FeedbackDTO> getFeedbacksByUserId(Integer userId) {
        try {
            List<Feedback> feedbacks = feedbackRepository.findByUserId(userId);
            return feedbacks.stream().map(FeedbackDTO::new).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi lấy feedback theo user: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy feedback theo user: " + e.getMessage(), e);
        }
    }
    
    /**
     * Cập nhật trạng thái feedback (Admin/Editor)
     */
    public FeedbackDTO updateFeedbackStatus(Integer feedbackId, Feedback.Status status) {
        try {
            logger.info("Cập nhật trạng thái feedback ID: {} thành {}", feedbackId, status);
            
            Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
            if (feedbackOpt.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy feedback với ID: " + feedbackId);
            }
            
            Feedback feedback = feedbackOpt.get();
            feedback.setStatus(status);
            
            Feedback updatedFeedback = feedbackRepository.save(feedback);
            logger.info("Cập nhật trạng thái feedback thành công");
            
            return new FeedbackDTO(updatedFeedback);
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật trạng thái feedback: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể cập nhật trạng thái feedback: " + e.getMessage(), e);
        }
    }
}

