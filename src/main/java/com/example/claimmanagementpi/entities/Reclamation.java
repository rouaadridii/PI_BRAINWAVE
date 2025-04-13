package com.example.claimmanagementpi.entities;

import com.example.claimmanagementpi.entities.enums.ReclamationPriority;
import com.example.claimmanagementpi.entities.enums.ReclamationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;


    @Enumerated(EnumType.STRING)
    ReclamationType objet;
    
    String statut;
    Date date;
    String description;

    @Enumerated(EnumType.STRING)
    ReclamationPriority priority;

    @ManyToOne
    @JoinColumn(name="user_id", nullable = false)
    User user;

}
