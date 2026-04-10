package com.C1SE61.backend.service.user;

import com.C1SE61.backend.model.Article;
import com.C1SE61.backend.model.Chapter;
import com.C1SE61.backend.model.Law;
import com.C1SE61.backend.repository.ArticleRepository;
import com.C1SE61.backend.repository.ChapterRepository;
import com.C1SE61.backend.repository.LawRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private LawRepository lawRepository;
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private ArticleRepository articleRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu chưa
        if (lawRepository.count() > 0) {
            return; // Đã có dữ liệu, không cần tạo lại
        }
        
        // Tạo dữ liệu mẫu
        createSampleData();
    }
    
    private void createSampleData() {
        // Tạo Bộ luật Lao động 2019
        Law laborLaw = new Law();
        laborLaw.setTitle("Bộ luật Lao động 2019");
        laborLaw.setCode("45/2019/QH14");
        laborLaw.setLawType("Luật");
        laborLaw.setIssuedDate(LocalDate.of(2019, 11, 20));
        laborLaw.setEffectiveDate(LocalDate.of(2021, 1, 1));
        laborLaw.setSourceUrl("https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx");

        laborLaw = lawRepository.save(laborLaw);
        
        // Tạo Chương VII - Thời giờ làm việc, thời giờ nghỉ ngơi
        Chapter chapter7 = new Chapter();
        chapter7.setLaw(laborLaw);
        chapter7.setChapterNumber("VII");
        chapter7.setChapterTitle("Thời giờ làm việc, thời giờ nghỉ ngơi");

        chapter7 = chapterRepository.save(chapter7);
        
        // Tạo Điều 105 - Thời giờ làm việc bình thường
        Article article105 = new Article();
        article105.setLaw(laborLaw);
        article105.setChapter(chapter7);
        article105.setArticleNumber("105");
        article105.setArticleTitle("Thời giờ làm việc bình thường");
        article105.setContent("1. Thời giờ làm việc bình thường không quá 08 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần.\n\n" +
                "2. Người sử dụng lao động có quyền quy định thời giờ làm việc theo ngày hoặc tuần nhưng phải thông báo cho người lao động biết; trường hợp theo tuần thì thời giờ làm việc bình thường không quá 10 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần. Nhà nước khuyến khích người sử dụng lao động thực hiện tuần làm việc 40 giờ đối với người lao động.\n\n" +
                "3. Người sử dụng lao động có trách nhiệm bảo đảm giới hạn thời gian làm việc tiếp xúc với yếu tố nguy hiểm, yếu tố có hại đúng theo quy chuẩn kỹ thuật quốc gia về pháp luật có liên quan.");
        articleRepository.save(article105);
        
        // Tạo Điều 106 - Làm việc ban đêm
        Article article106 = new Article();
        article106.setLaw(laborLaw);
        article106.setChapter(chapter7);
        article106.setArticleNumber("106");
        article106.setArticleTitle("Làm việc ban đêm");
        article106.setContent("1. Thời giờ làm việc ban đêm được tính từ 22 giờ đến 06 giờ sáng ngày hôm sau.\n\n" +
                "2. Người lao động làm việc ban đêm được trả lương theo quy định tại Điều 98 của Bộ luật này và được trả thêm ít nhất bằng 30% tiền lương làm việc vào ban ngày.\n\n" +
                "3. Người lao động làm việc ban đêm được bố trí nghỉ bù thời gian nghỉ ngơi.");
      
        articleRepository.save(article106);
        
        // Tạo Điều 107 - Làm thêm giờ
        Article article107 = new Article();
        article107.setLaw(laborLaw);
        article107.setChapter(chapter7);
        article107.setArticleNumber("107");
        article107.setArticleTitle("Làm thêm giờ");
        article107.setContent("1. Làm thêm giờ là khoảng thời gian làm việc ngoài thời giờ làm việc bình thường được quy định trong pháp luật, thỏa ước lao động tập thể hoặc nội quy lao động.\n\n" +
                "2. Người sử dụng lao động được sử dụng người lao động làm thêm giờ khi đáp ứng đầy đủ các điều kiện sau đây:\n" +
                "a) Được sự đồng ý của người lao động;\n" +
                "b) Bảo đảm số giờ làm thêm của người lao động không quá 50% số giờ làm việc bình thường trong 01 ngày, trường hợp áp dụng quy định làm việc theo tuần thì tổng số giờ làm việc bình thường và số giờ làm thêm không quá 12 giờ trong 01 ngày; 40 giờ trong 01 tuần;\n" +
                "c) Sau mỗi đợt làm thêm giờ liên tục từ 07 ngày đến 30 ngày tùy theo tính chất công việc, người sử dụng lao động phải bố trí để người lao động được nghỉ bù cho số thời gian đã không được nghỉ.\n\n" +
                "3. Người lao động làm thêm giờ được trả lương theo quy định tại Điều 98 của Bộ luật này.");
        
        articleRepository.save(article107);
        
        // Tạo Luật An toàn lao động
        Law safetyLaw = new Law();
        safetyLaw.setTitle("Luật An toàn, vệ sinh lao động");
        safetyLaw.setCode("84/2015/QH13");
        safetyLaw.setLawType("Luật");
        safetyLaw.setIssuedDate(LocalDate.of(2015, 6, 25));
        safetyLaw.setEffectiveDate(LocalDate.of(2016, 7, 1));
        safetyLaw.setSourceUrl("https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Luat-An-toan-ve-sinh-lao-dong-2015-296655.aspx");
    
        safetyLaw = lawRepository.save(safetyLaw);
        
        // Tạo Chương I - Những quy định chung
        Chapter chapter1 = new Chapter();
        chapter1.setLaw(safetyLaw);
        chapter1.setChapterNumber("I");
        chapter1.setChapterTitle("Những quy định chung");
        
        chapter1 = chapterRepository.save(chapter1);
        
        // Tạo Điều 1 - Phạm vi điều chỉnh
        Article article1 = new Article();
        article1.setLaw(safetyLaw);
        article1.setChapter(chapter1);
        article1.setArticleNumber("1");
        article1.setArticleTitle("Phạm vi điều chỉnh");
        article1.setContent("Luật này quy định về quyền, nghĩa vụ của người lao động, người sử dụng lao động về an toàn, vệ sinh lao động; chính sách, biện pháp bảo đảm an toàn, vệ sinh lao động; phòng, chống tai nạn lao động, bệnh nghề nghiệp; quản lý nhà nước về an toàn, vệ sinh lao động.");
        
        articleRepository.save(article1);
        
        System.out.println("✅ Đã tạo dữ liệu mẫu thành công!");
    }
}








