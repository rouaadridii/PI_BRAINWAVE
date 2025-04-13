package com.example.claimmanagementpi.services;

import java.util.HashMap;
import java.util.Map;

class Trie {
    private static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        int weight = 0;
    }

    private final TrieNode root = new TrieNode();

    public void insert(String word, int weight) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -> new TrieNode());
        }
        node.weight = weight;
    }

    public int getPriorityScore(String description) {
        int score = 0;
        for (String word : description.split("\\s+")) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                if (!node.children.containsKey(c)) break;
                node = node.children.get(c);
            }
            score += node.weight;
        }
        return score;
    }
}
