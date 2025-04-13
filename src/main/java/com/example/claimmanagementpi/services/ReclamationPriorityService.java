package com.example.claimmanagementpi.services;

import com.example.claimmanagementpi.entities.Reclamation;
import com.example.claimmanagementpi.entities.enums.ReclamationPriority;
import com.example.claimmanagementpi.entities.enums.ReclamationType;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class ReclamationPriorityService {

    private static final Trie keywordTrie = new Trie();

    // Regex patterns for phrase matching
    private static final Pattern HIGH_PRIORITY_PATTERN = Pattern.compile("urgent|critical|immediate|blocked|failure", Pattern.CASE_INSENSITIVE);
    private static final Pattern MEDIUM_PRIORITY_PATTERN = Pattern.compile("delay|problem|issue|missing|incorrect", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOW_PRIORITY_PATTERN = Pattern.compile("suggestion|feedback|question", Pattern.CASE_INSENSITIVE);

    // Static block to initialize keyword Trie
    static {
        keywordTrie.insert("urgent", 3);
        keywordTrie.insert("critical", 3);
        keywordTrie.insert("immediate", 3);
        keywordTrie.insert("blocked", 3);
        keywordTrie.insert("failure", 2);
        keywordTrie.insert("error", 2);
        keywordTrie.insert("issue", 1);
        keywordTrie.insert("delay", 2);
        keywordTrie.insert("problem", 2);
        keywordTrie.insert("missing", 1);
        keywordTrie.insert("incorrect", 1);
        keywordTrie.insert("suggestion", -1);
        keywordTrie.insert("feedback", -1);
        keywordTrie.insert("question", -1);
    }

    public ReclamationPriority determinePriority(Reclamation reclamation) {
        ReclamationType type = reclamation.getObjet();
        String description = reclamation.getDescription() != null ? reclamation.getDescription().toLowerCase() : "";

        int priorityScore = getBasePriority(type) + keywordTrie.getPriorityScore(description);

        if (HIGH_PRIORITY_PATTERN.matcher(description).find()) priorityScore += 3;
        else if (MEDIUM_PRIORITY_PATTERN.matcher(description).find()) priorityScore += 2;
        else if (LOW_PRIORITY_PATTERN.matcher(description).find()) priorityScore -= 1;

        return getPriorityFromScore(priorityScore);
    }

    private int getBasePriority(ReclamationType type) {
        return switch (type) {
            case TECHNICAL_PROBLEMS -> 5;
            case INSTRUCTOR_OR_SUPPORT_CLAIM -> 4;
            case GRADING_AND_ASSESSMENT_DISPUTES -> 3;
            case ACCOUNT_AND_PAYMENT_ISSUES -> 5;
            case COURSE_CONTENT_ISSUES -> 3;
            default -> 2;
        };
    }

    private ReclamationPriority getPriorityFromScore(int score) {
        return (score >= 5) ? ReclamationPriority.HIGH : (score >= 4) ? ReclamationPriority.MEDIUM : ReclamationPriority.LOW;
    }
}
