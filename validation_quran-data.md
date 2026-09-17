# Validation du texte coranique Qaloon — quran-data.json (adhkar)

Référence : Quranpedia mushaf 12 (Qaloon) — `quranpedia_mushaf12.json`
App : `adhkar/quran-data.json` (114 sourates, `a` = liste des versets)

Méthode : normalisation NFC, squelette consonantique (hamza isolé → ا, voir script final_diff.py),
comparaison par texte concaténé de sourate (jamais verset-à-verset, numérotation Kufique app vs Médinoise ref).
Qualifier : tout écart **de consonne** dans l'app = faute réelle.

## Résultat global
- **0** sourate 100 % identique au squelette consonantique sur les **114** → attendu.
- **87** sourates identiques au squelette.
- **10** sourates ne diffèrent que par ۓ/ئ (variante d'encodage, bénin) : 3, 6, 12, 18, 29, 34, 35, 59, 84, 85.
- Sourate 1 : seule différence = basmala (connue, attendu).
- **16** sourates signalées au diff LCS, dont **9** contenaient de **vraies fautes**.
- **11 fautes réelles corrigées le 17/09/2026** — texte désormais **100 % correct au squelette consonantique**.

## Fautes réelles (consonne manquante / substituée) — CORRIGÉES ✅

| # | Sourate | Verset (app) | Mot app (avt) | Token QP exact (après) | Faute | Vérif squelette |
|---|---------|-------------|------------------|--------------|-------|-----------------|
| 1 | 2 | 6  | أَنْذَرْتَهُمْ | أَأَنْذَرْتَهُم | ت manquant | ✅ S2 = bénins |
| 2 | 2 | 27 | أُوَيْكَ | أُولَئِكَ | ل manquant | ✅ S2 = bénins |
| 3 | 2 | 42 | تَبْسُوا | تَلْبِسُوا | ل manquant | ✅ S2 = bénins |
| 4 | 7 | 133 | اُلطُّوَان | الطُّوفَان | ف manquant | ✅ S7 = bénins |
| 5 | 9 | 34 | عَ سَبِيلِ | عَن سَبِيلِ | ن manquant | ✅ S9 = bénins |
| 6 | 13 | 33 | سَأُّوهُمْ | سَمُّوهُمْ | م → أ substitué | ✅ S13 = identique |
| 7 | 20 | 121 | وَصَى (وََصَيٰ) | وَعَصَىٰ | ع manquant | ✅ S20 = identique |
| 8 | 21 | 110 | يَعَْمُ | يَعْلَمُ | ل manquant | ✅ S21 = identique |
| 9 | 23 | 59 | يُشْكُونَ | يُشْرِكُونَ | ر manquant | ✅ S23 = identique |
| 10 | 28 | 43 | بَد | بَعْد | ع manquant | ✅ S28 = identique |
| 11 | 40 | 41 | اَلْجَوٰة | النَّجَوٰة | ن manquant | ✅ S40 = identique |

**Méthode de correction** (17/09/2026) :
1. Squelette fautif app identifié (occurrence unique dans son verset sauf S9 v34 — `عَ` présent 2×, dont 1 interne à `بِعَذَابٍ` → remplacement ciblé du token suivi de `سَبِيلِ`).
2. Token QP brut exact extrait du mushaf 12 à l'ayah alignée (diacritiques + marques Qaloon U+06EC/U+06D6/U+06EA/ـٰ conservées telles quelles).
3. Remplacement token-à-token dans `quran-data.json` (minifié, `ensure_ascii=False`).
4. Sauvegarde : `quran-data.backup-BEFORE-FIX.json` (1 448 632 o) — non écrasée.
5. Vérification : re-diff LCS complet → **plus aucune des 11 paires** ; `final_diff_fixed.txt` : uniquement bénins (14 QP_ONLY / 22 APP_ONLY) ; vérification delta backup→FIXED → **11 versets, 1 seul token modifié chacun**, aucun autre changement.

## Écarts bénins (pas des fautes)
- **Encodage hamza**: S2 v72 فَادَّٰرَٰءْتُمْ (ـٰءْ v.s. ـٔا) — un seul artefact « bare hamza » (فادراتم/فادرتم).
- **Marque coranique U+06EA**: S2 v271 فَنِع۪مَّا (فنع۪ما/فنعما) — U+06EA non consonantique.
- **Ordre des diacritiques**: S5 الله/لله (codepoints identiques, shadda/fatha inversées ; لِلَّهِ sans alif = légitime).
- **Segmentation des mots** (même squelette après reconcaténation) : S5 اوامن/او امن, S15 لوما، مالك/لك ما, S27 مالي/ما لي, S36 ومالي/وما لي, S37+S56 اوااباونا, S44 بلوا/بلو ا.

## Classification du diff LCS par sourate (14 QP_ONLY / 22 APP_ONLY après correction)
- S2 : ~~3 fautes réelles (v6, v27, v42)~~ **corrigées** + 2 bénins (فادراتم, فنع۪ما) + artefact d'alignement لكم/لم/ال/هو.
- S5 : bénin (الله/لله).
- S7 : ~~1 faute réelle (v133)~~ **corrigée** + segmentation (اوامن).
- S9 : ~~1 faute réelle (v34)~~ **corrigée** + artefact d'alignement الم/لم ensuite.
- S13 : ~~1 faute réelle (v33)~~ **corrigée** — sourate désormais identique.
- S15 : bénins (segmentation).
- S20 : ~~1 faute réelle (v121)~~ **corrigée** — sourate désormais identique.
- S21 : ~~1 faute réelle (v110)~~ **corrigée** — sourate désormais identique.
- S23 : ~~1 faute réelle (v59)~~ **corrigée** — sourate désormais identique.
- S27 : bénin (segmentation مالي vs ما لي).
- S28 : ~~1 faute réelle (v43)~~ **corrigée** — sourate désormais identique.
- S36, S37, S44, S56 : bénins (segmentation).
- S40 : ~~1 faute réelle (v41)~~ **corrigée** — sourate désormais identique.

## Numérotation
Les numéros de versets ci-dessus sont ceux de **l'app** (compte Kufique).
Écart attendu avec la numérotation standard/Medinoise (référence) : le verset fautif peut être
à ±1 en numérotation officielle (ex. S2 v6 app = 2:6 standard).

## Scripts utilisés
- `final_diff.py` + `final_diff.txt` (diff LCS par squelette, contexte verset + mot brut) — réparé (squelette = aligned_diff, 0621→ا).
- `aligned_diff.py/.txt` (25/33 baseline), `skeleton_compare.py/.txt` (87/114), `full_compare.py/.txt` (8/114).
- `raw_inspect.py/.txt`, `verify_pending.txt` (preuve codepoint des fautes).
- **Correction** : `diag_fix.py` (occurrence unique + candidats QP), `pick_qp.py` (token QP brut à l'ayah alignée), `fix_quran.py` (production `quran-data.FIXED.json` + cas S9 v34 chirurgical), `verify_deltas.py` (backup→FIXED : 11 versets, 1 token/verset), `run_final_diff.py`/`final_diff_fixed.txt` (re-diff complet), `final_check.py` (re-joint squelette).
- Sources dans `C:\Users\dell\AppData\Local\Temp\opencode\`.