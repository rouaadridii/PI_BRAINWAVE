package com.example.claimmanagementpi.services;

import com.example.claimmanagementpi.entities.Reclamation;
import com.example.claimmanagementpi.entities.User;
import com.example.claimmanagementpi.entities.enums.ReclamationPriority;
import com.example.claimmanagementpi.entities.enums.ReclamationType;
import com.example.claimmanagementpi.entities.enums.UserRole;
import com.example.claimmanagementpi.repository.ReclamationRepository;
import com.example.claimmanagementpi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor

public class ReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final ReclamationPriorityService priorityService;
    private final UserRepository userRepository;
    private final EmailService emailService;


    public Reclamation SaveReclamationCreation(Reclamation reclamation, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        reclamation.setUser(user);

        // Dynamically assign priority
        reclamation.setPriority(priorityService.determinePriority(reclamation));

        // Save reclamation in the database
        reclamation = reclamationRepository.save(reclamation);

        // Notify all admins via email
        sendNotificationToAdmins(reclamation);

        return reclamation;
    }


    private void sendNotificationToAdmins(Reclamation reclamation) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        System.out.println("111111111111111");

        if (!admins.isEmpty()) {
            String subject = "🚨 New Reclamation Submitted: " + reclamation.getObjet();
            String message = "<h3>A new reclamation has been submitted by <b>" + reclamation.getUser().getName() + "</b>.</h3>" +
                    "<p><strong>Priority:</strong> <span style='color:red;'>" + reclamation.getPriority() + "</span></p>" +
                    "<p><strong>Description:</strong> " + reclamation.getDescription() + "</p>" +
                    "<p><strong>Date:</strong> " + reclamation.getDate() + "</p>";

            for (User admin : admins) {
                System.out.println("2222222222");
                emailService.sendEmail(admin.getEmail(), subject, message);
                System.out.println("3333333333");
            }
        }
    }

    public void notifyUserOfResolution(Reclamation reclamation) {
        User owner = reclamation.getUser();
        if (owner != null && owner.getEmail() != null) {
            String subject = "✅ Your Reclamation Has Been Resolved!";
            String message = "<h3>Hello " + owner.getName() + ",</h3>" +
                    "<p>We are pleased to inform you that your reclamation regarding <strong>" + reclamation.getObjet() + "</strong> has been resolved.</p>" +
                    "<p><strong>Updated Status:</strong> " + reclamation.getStatut() + "</p>" +
                    "<p><strong>Final Notes:</strong> " + reclamation.getDescription() + "</p>" +
                    "<p>Thank you for your patience. If you need further assistance, feel free to contact us.</p>";

            emailService.sendEmail(owner.getEmail(), subject, message);
        }
    }


    public Reclamation SaveReclamation(Reclamation reclamation) {
        reclamation.setPriority(priorityService.determinePriority(reclamation));
        return reclamationRepository.save(reclamation);
    }

    public List<Reclamation> getAllRecalamation(){
        return (List<Reclamation>)reclamationRepository.findAll();
    }


    public void deleteReclamation(Long id) {
        reclamationRepository.deleteById(id);

    }
    public Optional<Reclamation> getReclamationById(Long id){
        return reclamationRepository.findById(id);
    }

    public Map<String, Object> getReclamationStats() {
        Map<String, Object> stats = new HashMap<>();

        // Count by status
        stats.put("traité", reclamationRepository.countByStatut("traité"));
        stats.put("non traité", reclamationRepository.countByStatut("non traité"));

        // Count by priority
        stats.put("HIGH", reclamationRepository.countByPriority(ReclamationPriority.HIGH));
        stats.put("MEDIUM", reclamationRepository.countByPriority(ReclamationPriority.MEDIUM));
        stats.put("LOW", reclamationRepository.countByPriority(ReclamationPriority.LOW));

        // Count by type
        Map<String, Long> typeCounts = new HashMap<>();
        List<Object[]> typeStats = reclamationRepository.countByType();
        for (Object[] obj : typeStats) {
            typeCounts.put(((ReclamationType) obj[0]).name(), (Long) obj[1]);
        }
        stats.put("types", typeCounts);

        return stats;
    }

}
