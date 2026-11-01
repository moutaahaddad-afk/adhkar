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

---

## Application Android (Capacitor 7) — depuis 01/11/2026

Le site reste la source de vérité ; l'APK n'est qu'un conteneur natif autour des mêmes fichiers.

### Architecture
| Élément | Valeur |
|---|---|
| Projet | `adhkar/app/` (isolé du site, ne pas mélanger les deux) |
| `www/` | **généré** par `app/sync-web.ps1` (whitelist stricte) — ne jamais éditer à la main |
| IDs | appId / namespace / applicationId = `tn.apexgs.adhkar` |
| Label | `أذكار` (`res/values/strings.xml` → `app_name`) |
| Version | 1.0.0 / versionCode 1 (`app/android/app/build.gradle`) |
| Capacitor | core/android/cli **7.6.10**, local-notifications **7.0.7**, app **7.1.2** |
| SDK | minSdk 23 · compile/targetSdk 35 |
| WebView | scheme `https`, assets embarqués (`server.androidScheme`) → offline-first |

### Sources web modifiées pour le natif
- `index.html` : plus aucune dépendance CDN — Firebase (`vendor/firebase-*-compat.js`) et polices (`fonts/*.woff2`) sont **locaux** ; `native-android.js` chargé après `orad-data.js` ; bloc NOTIFICATIONS avec branche `NATIVE` ; `serviceWorker.register` désactivé en natif.
- `native-android.js` : pont `window.NativeReminders` (`init`, `requestPermission`, `sync`, `notifyNow`, `permission`), IDs 1001-1006, canal `adhkar-reminders`, `exactAllowWhileIdle`. C'est **lui** qui garantit le rappel 20:00 app fermée (LocalNotifications planifie au niveau OS, sans SW).
- Sync Firestore inchangée : même document `adhkar/main` (projet `apexcrm-f4d3a`), mêmes champs `data`/`at`/`device`.

### Build
```powershell
cd adhkar\app
powershell -ExecutionPolicy Bypass -File build-apk.ps1              # complet
powershell -ExecutionPolicy Bypass -File build-apk.ps1 -SkipWebSync # web inchangé
```
Le script : vérifie SDK/JDK → crée keystore + `android/keystore.properties` si absents → `sync-web.ps1` → `cap sync android` → `gradlew assembleRelease` → copie vers `app/release/adhkar-1.0.0.apk` → `apksigner verify` + `aapt2 dump badging`.

- **Keystore (hors dépôt)** : `C:\Users\dell\.adhkar-keys\adhkar-release.p12` (PKCS12, alias `adhkar`, RSA 4096, 30 ans) + mot de passe `adhkar-keystore-password.txt` dans le même dossier. **Sauvegarde obligatoire sur G:** — sans elle, plus aucune mise à jour de l'APK n'est possible.
- **Icônes/splash** : `python make-assets.py` depuis `adhkar/app/` (source : `adhkar/icon-512.png`) — mipmap 48→192 px, foreground adaptatif plein cadre, splash 11 variantes fond `#03140d`, `ic_stat_adhkar.png` (étoile 8 branches blanche).
- **Permissions ajoutées au manifest** : `VIBRATE`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM` (les autres — `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, receivers boot/dismiss — viennent du manifest du plugin).

### Distribution & installation
Sideload (pas de Play Store) : transférer l'APK sur le téléphone, autoriser « installer des applis inconnues », ou `adb install -r app\release\adhkar-1.0.0.apk`.
Android 12+ : accorder « Alarmes et rappels » si le système le demande, et autoriser les notifications au premier lancement.

### Pièges connus
- `www/` et `android/` sont générés : toute correction manuelle y est perdue au prochain `cap sync`.
- `app/android/keystore.properties` et `*.p12` sont gitignorés — ne jamais les committer.
- Les polices ont été vendorisées en un seul fichier par famille (police variable) : ne pas s'étonner que `amiri-400.woff2` et `amiri-700.woff2` aient un contenu proche.
- Pas de `showTrigger`/notif planifiée côté web : la fiabilité du rappel 20:00 passe **exclusivement** par le chemin natif dans l'APK.
- **Différence assumée web ↔ natif** : le web n'envoie un rappel que si l'action du jour n'est pas faite (`checkWirdReminder`), une alarme OS ne peut pas le savoir → en natif les rappels wird/matin/soir/mushaf sont des **récurrences quotidiennes** dont les textes restent neutres (invitation, pas « pas encore terminé »).

