# Installer Adhkar sur Android (APK)

APK signé : `app/release/adhkar-1.0.0.apk` — généré par `app/build-apk.ps1`.

## 1. Transférer le fichier sur le téléphone

Au choix :
- **USB** (le plus simple) : brancher le téléphone, mode « Transfert de fichiers », copier l'APK dans `Download/`.
- **Câble + adb** : `adb install -r "app\release\adhkar-1.0.0.apk"` (débogage USB activé).
- **Cloud** : l'envoyer par Google Drive / WhatsApp / email, puis l'ouvrir depuis le téléphone.

## 2. Autoriser l'installation

1. Ouvrir l'APK depuis l'application **Fichiers** → `Download`.
2. Android demande « Installer des applis inconnues » : autoriser pour l'appli source (Fichiers / Chrome).
3. **Installer**, puis **Ouvrir**.

> Play Protect peut afficher « application non reconnue » : c'est normal pour un APK hors Play Store. Choisir « Installer quand même ».

## 3. Premiers réglages (une seule fois)

| Réglage | Où | Pourquoi |
|---|---|---|
| Notifications | Popup au 1er lancement → **Autoriser** | Rappel quotidien 20:00 |
| Alarmes et rappels | Paramètres Android → Applis → أذكار → **Alarmes et rappels** → Autoriser | Rappel exact même app fermée |
| Batterie | Paramètres → Applis → أذكار → Batterie → **Sans restriction** | Évite que le système tue les rappels (Xiaomi/Samsung/Huawei surtout) |

## 4. Vérifier que le rappel fonctionne

Dans l'app → Paramètres → Notifications → **Tester**. Une notification doit apparaître dans les secondes qui suivent.
Ensuite, fermer complètement l'app (pas juste « retour ») et attendre 20:00 : la notification doit toujours arriver.

## Mettre à jour plus tard

Reconstruire avec `build-apk.ps1` (même keystore !) puis installer par-dessus : les données locales et la synchronisation Firestore sont conservées.
Changer de keystore obligerait à désinstaller l'ancienne version → **perte des données locales** (la sync cloud permet de les restaurer via `import`).

## Sauvegarde indispensable

- Keystore : `C:\Users\dell\.adhkar-keys\adhkar-release.p12`
- Mot de passe : `C:\Users\dell\.adhkar-keys\adhkar-keystore-password.txt`

Copie de ces deux fichiers sur `G:\Mon Drive\ApexGlobalSolutions\Apps\Adhkar\keys\` — sans eux, aucune mise à jour de l'APK n'est possible.
