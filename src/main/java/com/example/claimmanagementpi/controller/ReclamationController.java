package com.example.claimmanagementpi.controller;

import com.example.claimmanagementpi.entities.Reclamation;
import com.example.claimmanagementpi.services.ReclamationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/recalamtions")
@AllArgsConstructor

@CrossOrigin(origins = "*")


public class ReclamationController {
    ReclamationService reclamationService;


    @GetMapping("/list")
    public List<Reclamation> getAllreclamation(){
        return reclamationService.getAllRecalamation();
    }

//    @PostMapping("/addreclamation")
//    public Reclamation addreclamation(@RequestBody Reclamation reclamation){
//        return reclamationService.SaveReclamation(reclamation);
//    }

    @PostMapping("/addreclamation/{userId}")
    public ResponseEntity<Reclamation> addReclamation(@RequestBody Reclamation reclamation, @PathVariable Long userId) {
        return ResponseEntity.ok(reclamationService.SaveReclamationCreation(reclamation, userId));
    }

    @DeleteMapping("{id}")
    public void deletereclamation(@PathVariable Long id){
        reclamationService.deleteReclamation(id);
    }
    @GetMapping("{id}")
    public Optional<Reclamation> getreclamationbyid(@PathVariable  Long id){
        return reclamationService.getReclamationById(id);
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<Reclamation> updateReclamationById(@PathVariable Long id, @RequestBody Reclamation updatedReclamation) {
//        Optional<Reclamation> existingReclamationOptional = reclamationService.getReclamationById(id);
//
//        if (existingReclamationOptional.isPresent()) {
//            Reclamation existingReclamation = existingReclamationOptional.get();
//
//            // Copier toutes les propriétés de Medecin mises à jour dans l'objet existant
//            existingReclamation.setDate(updatedReclamation.getDate());
//            existingReclamation.setObjet(updatedReclamation.getObjet());
//            existingReclamation.setStatut(updatedReclamation.getStatut());
//            existingReclamation.setDescription(updatedReclamation.getDescription());
//
//
//            // Copier d'autres propriétés à mettre à jour de Medecin
//
//            // Si nécessaire, vous pouvez également mettre à jour les propriétés héritées de User
//
//
//
//            // Enregistrer les modifications dans la base de données
//            Reclamation updatedExistingReclamation = reclamationService.SaveReclamation(existingReclamation);
//
//            return ResponseEntity.ok(updatedExistingReclamation);
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @PutMapping("/{id}")
    public ResponseEntity<Reclamation> updateReclamationById(@PathVariable Long id, @RequestBody Reclamation updatedReclamation) {
        Optional<Reclamation> existingReclamationOptional = reclamationService.getReclamationById(id);

        if (existingReclamationOptional.isPresent()) {
            Reclamation existingReclamation = existingReclamationOptional.get();

            // Check if the status is changing to "traité"
            boolean isNowResolved = !existingReclamation.getStatut().equals("traité") && updatedReclamation.getStatut().equals("traité");

            // Update reclamation details
            existingReclamation.setDate(updatedReclamation.getDate());
            existingReclamation.setObjet(updatedReclamation.getObjet());
            existingReclamation.setStatut(updatedReclamation.getStatut());
            existingReclamation.setDescription(updatedReclamation.getDescription());

            // Save the updated reclamation
            Reclamation updatedExistingReclamation = reclamationService.SaveReclamation(existingReclamation);

            // If status is changed to "traité", send email notification
            if (isNowResolved) {
                reclamationService.notifyUserOfResolution(updatedExistingReclamation);
            }

            return ResponseEntity.ok(updatedExistingReclamation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/stats")
    public Map<String, Object> getReclamationStats() {
        return reclamationService.getReclamationStats();
    }
}
