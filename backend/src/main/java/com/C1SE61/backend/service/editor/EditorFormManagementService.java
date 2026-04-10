package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.response.admin.AdminFormTemplateResponse;
import com.C1SE61.backend.model.FormTemplate;
import com.C1SE61.backend.repository.FormTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EditorFormManagementService {

    private final FormTemplateRepository formRepo;

    public List<AdminFormTemplateResponse> getAllForms() {
        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return formRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(f -> f.getStatus() != FormTemplate.Status.DRAFT)
                .map(f -> AdminFormTemplateResponse.builder()
                        .id(f.getTemplateId())
                        .name(f.getTitle())
                        .category(f.getCategory())
                        .uploadDate(f.getCreatedAt().format(df))
                        .status(f.getStatus().name())
                        .fileUrl(f.getFileUrl())
                        .build()
                )
                .toList();
    }

    public void approveForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        form.setStatus(FormTemplate.Status.APPROVED);
        formRepo.save(form);
    }

    public void rejectForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        form.setStatus(FormTemplate.Status.REJECTED);
        formRepo.save(form);
    }

    public void deleteForm(Integer id) {
        if (!formRepo.existsById(id)) {
            throw new RuntimeException("Form not found");
        }
        formRepo.deleteById(id);
    }
}
