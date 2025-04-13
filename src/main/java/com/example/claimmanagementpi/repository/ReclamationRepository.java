package com.example.claimmanagementpi.repository;

import com.example.claimmanagementpi.entities.Reclamation;
import com.example.claimmanagementpi.entities.enums.ReclamationPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    // Count by status
    Long countByStatut(String statut);

    // Count by priority
    Long countByPriority(ReclamationPriority priority);

    // Count by type
    @Query("SELECT r.objet, COUNT(r) FROM Reclamation r GROUP BY r.objet")
    List<Object[]> countByType();
}
