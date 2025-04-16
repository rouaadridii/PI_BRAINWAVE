@Transactional
public Article createArticle(Article article, Long userId,
                             MultipartFile pictureFile, List<MultipartFile> videoFiles, List<MultipartFile> pdfFiles) throws IOException {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id: " + userId));
    article.setUser(user);

    if (article.getPublicationStatus() == null) {
        article.setPublicationStatus(PublicationStatus.DRAFT); // Default to DRAFT
    }

    if (article.getPublicationStatus() == PublicationStatus.DRAFT) {
        article.setPublished(true); // Drafts are immediately considered published
    } else if (article.getPublicationStatus() == PublicationStatus.PUBLISHED) {
        article.setPublicationStatus(PublicationStatus.PENDING_APPROVAL); // Requires admin approval
        article.setPublished(false); // Not yet fully published
    } else {
        article.setPublished(false); // Default to not published for other statuses
    }

    // Handle main picture
    if (pictureFile != null && !pictureFile.isEmpty()) {
        article.setPicture(saveFile(pictureFile));
    }

    // Handle video resources
    if (videoFiles != null && !videoFiles.isEmpty()) {
        for (MultipartFile videoFile : videoFiles) {
            if (!videoFile.isEmpty()) {
                Ressources videoResource = new Ressources();
                videoResource.setVideo(saveFile(videoFile));
                videoResource.setDescription("Video Resource");
                videoResource.setArticle(article); // Link resource to article
                article.addRessource(videoResource);
            }
        }
    }

    // Handle PDF resources
    if (pdfFiles != null && !pdfFiles.isEmpty()) {
        for (MultipartFile pdfFile : pdfFiles) {
            if (!pdfFile.isEmpty()) {
                Ressources pdfResource = new Ressources();
                pdfResource.setPdf(saveFile(pdfFile));
                pdfResource.setDescription("PDF Resource");
                pdfResource.setArticle(article); // Link resource to article
                article.addRessource(pdfResource);
            }
        }
    }

    // Handle Tags
    if (article.getTags() != null && !article.getTags().isEmpty()) {
        Set<Tag> tags = new HashSet<>();
        for (Tag tag : article.getTags()) {
            Optional<Tag> existingTagOptional = tagRepository.findByName(tag.getName());
            if (existingTagOptional.isPresent()) {
                tags.add(existingTagOptional.get()); // Reuse existing tag
            } else {
                tags.add(tagRepository.save(tag)); // Save new tag
            }
        }
        article.setTags(tags);
    }

    return articleRepository.save(article);
}

@Transactional
public Article updateArticle(Long id, Article article,
                             MultipartFile pictureFile, List<MultipartFile> videoFiles, List<MultipartFile> pdfFiles) throws IOException {
    Article existingArticle = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article non trouvé avec l'id: " + id));
    User user = userRepository.findById(article.getUser().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id: " + article.getUser().getId()));

    existingArticle.setTitle(article.getTitle());
    existingArticle.setDate(article.getDate());
    existingArticle.setPicture(article.getPicture()); // Keep existing if no new picture

    // Handle main picture update
    if (pictureFile != null && !pictureFile.isEmpty()) {
        existingArticle.setPicture(saveFile(pictureFile));
    }

    // Handle video resource update
    if (videoFiles != null && !videoFiles.isEmpty()) {
        for (MultipartFile videoFile : videoFiles) {
            if (!videoFile.isEmpty()) {
                Ressources videoResource = new Ressources();
                videoResource.setVideo(saveFile(videoFile));
                videoResource.setDescription("Updated Video Resource");
                videoResource.setArticle(existingArticle); // Link resource to article
                existingArticle.addRessource(videoResource);
            }
        }
    }

    // Handle PDF resource update
    if (pdfFiles != null && !pdfFiles.isEmpty()) {
        for (MultipartFile pdfFile : pdfFiles) {
            if (!pdfFile.isEmpty()) {
                Ressources pdfResource = new Ressources();
                pdfResource.setPdf(saveFile(pdfFile));
                pdfResource.setDescription("Updated PDF Resource");
                pdfResource.setArticle(existingArticle); // Link resource to article
                existingArticle.addRessource(pdfResource);
            }
        }
    }

    // Handle tags update
    if (article.getTags() != null && !article.getTags().isEmpty()) {
        Set<Tag> updatedTags = new HashSet<>();
        for (Tag tag : article.getTags()) {
            Optional<Tag> existingTagOptional = tagRepository.findByName(tag.getName());
            if (existingTagOptional.isPresent()) {
                updatedTags.add(existingTagOptional.get());
            } else {
                updatedTags.add(tagRepository.save(tag));
            }
        }
        existingArticle.setTags(updatedTags);
    }

    return articleRepository.save(existingArticle);
}

private String saveFile(MultipartFile file) throws IOException {
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    Path filePath = Paths.get(uploadDir, fileName);
    Files.copy(file.getInputStream(), filePath);
    return fileName;
}
