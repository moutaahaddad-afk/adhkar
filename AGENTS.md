# Adhkar (PWA Évocations & Invocations Quotidiennes) — Directives ECC & Règles du Projet

## Architecture & Stack Technique
**Technologies** : PWA HTML5 / CSS3 / JavaScript / Audio API / LocalStorage

## Règles ECC Activées
Les règles suivantes de l'harness ECC (`.agents/rules/`) s'appliquent à ce projet :
- `web-coding-style.md`
- `web-performance.md`
- `common-development-workflow.md`
- `common-testing.md`
- `common-security.md`
- `common-code-review.md`


## Spécificités Adhkar

- Application spirituelle légère, offline-first avec compteur tactile et récitation audio.
- PWA installable sur smartphone sans aucune dépendance serveur.


## Cadre de Travail ECC (Universal Agent Harness v2.2)

Ce projet applique les principes d'ingénierie et de rigueur **ECC (Everything Claude Code)** :
1. **PLAN** : Analyser les besoins, identifier les contraintes et formaliser l'approche avant d'écrire du code.
2. **TEST (TDD)** : Écrire ou mettre à jour les tests avant/pendant l'implémentation (`common-testing.md`).
3. **IMPLEMENT** : Implémenter selon les standards stricts du projet (`common-coding-style.md`).
4. **REVIEW** : Effectuer une revue de sécurité (`common-security.md`) et de qualité de code (`common-code-review.md`).
5. **VERIFY** : Validation obligatoire en conditions réelles avec preuve tangible.
6. **REMEMBER** : Consigner les choix d'architecture et décisions structurantes.
7. **IMPROVE** : Éliminer la dette technique IA (`ai-debt-detector`) et simplifier le code (`simplify-code`).

## RÈGLE OBLIGATOIRE : Vérification avant résultat (ECC Gate)

**JAMAIS déclarer une tâche terminée sans preuve vérifiable.**

AVANT de dire "c'est fait" ou "c'est corrigé", **vérifie** :
1. **Déploiement / Serveur** : test HTTP (`Invoke-WebRequest` ou `curl`) sur l'URL active
2. **Fonctionnalité** : vérifie que l'endpoint ou la fonctionnalité répond au comportement attendu
3. **Données** : si DB/Stockage, vérifie que les données sont enregistrées et intègres
4. **Code** : vérification syntaxique (`node --check` ou `python -m py_compile`)

### Format de preuve exigé :
```
✅ Vérifié : [action exécutée] → [résultat précis observé]
```
Si la vérification échoue : ne PAS déclarer terminé, diagnostiquer, corriger, et ré-exécuter le contrôle.
