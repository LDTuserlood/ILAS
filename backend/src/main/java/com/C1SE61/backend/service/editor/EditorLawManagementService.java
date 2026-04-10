package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.request.admin.AdminLawRequest;
import com.C1SE61.backend.dto.response.user.LawDTO;
import com.C1SE61.backend.model.Law;
import com.C1SE61.backend.repository.LawRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class EditorLawManagementService {

    private final LawRepository lawRepository;

    public Page<LawDTO> list(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Law> laws;

        if (StringUtils.hasText(keyword)) {
            laws = lawRepository.searchAllLaws(keyword.trim(), pageable);
        } else {
            laws = lawRepository.findAll(pageable);
        }
        return laws.map(LawDTO::new);
    }

    public LawDTO create(AdminLawRequest req) {
        Law law = new Law();
        apply(req, law);
        return new LawDTO(lawRepository.save(law));
    }

    public LawDTO update(Integer id, AdminLawRequest req) {
        Law law = lawRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Law not found with id: " + id));
        apply(req, law);
        return new LawDTO(lawRepository.save(law));
    }

    public void delete(Integer id) {
        if (!lawRepository.existsById(id)) {
            throw new IllegalArgumentException("Law not found with id: " + id);
        }
        lawRepository.deleteById(id);
    }

    private void apply(AdminLawRequest req, Law law) {
        if (req.getTitle() != null) law.setTitle(req.getTitle());
        if (req.getCode() != null) law.setCode(req.getCode());
        if (req.getLawType() != null) law.setLawType(req.getLawType());
        if (req.getIssuedDate() != null) law.setIssuedDate(req.getIssuedDate());
        if (req.getEffectiveDate() != null) law.setEffectiveDate(req.getEffectiveDate());
        if (req.getSourceUrl() != null) law.setSourceUrl(req.getSourceUrl());
        if (req.getStatus() != null) law.setStatus(req.getStatus());
        if (req.getAmendedBy() != null) law.setAmendedBy(req.getAmendedBy());
        if (req.getVersionNumber() != null) law.setVersionNumber(req.getVersionNumber());
    }
}
