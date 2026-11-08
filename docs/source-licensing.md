# Quellen- und Lizenzprüfung

Stand: 5. November 2026. Die technische Erreichbarkeit eines RSS-Feeds gilt nicht als Nutzungserlaubnis. Aktiviert werden nur Quellen mit dokumentierter Freigabe für den vorgesehenen Gebrauch. Bilder und sonstige Inhalte Dritter werden grundsätzlich nicht übernommen.

| Quelle | Technisch geprüft | Rechtsstatus | Aktiv | Begründung |
| --- | --- | --- | --- | --- |
| Statistisches Bundesamt – Aktuelles | Ja | APPROVED | Ja | Destatis gestattet die Vervielfältigung und Verbreitung der Website-Inhalte, auch auszugsweise, mit Quellennachweis. Abweichende Kennzeichnungen und Bildrechte sind ausgenommen. |
| Europäische Kommission – Press Corner (DE) | Ja | APPROVED | Ja | EU-eigene Inhalte stehen grundsätzlich unter CC BY 4.0. Namensnennung und Kennzeichnung von Änderungen sind erforderlich; Drittinhalte und Logos sind ausgenommen. Der Deutschland- und Verkehrsfilter läuft vor einer Speicherung. |
| Tagesschau – Inland/Wirtschaft | Ja | REQUIRES_PERMISSION | Nein | Kommerzielle Nutzung verlangt Registrierung über das ARD Publishing Portal; Archivierung und Veröffentlichung sind eingeschränkt. |
| Handelsblatt – Unternehmen/Politik | Ja | REQUIRES_PERMISSION | Nein | Kommerzielle Nutzung des RSS-Angebots nur mit vorheriger ausdrücklicher Genehmigung. |
| DER SPIEGEL – Schlagzeilen | Ja | LEGAL_REVIEW | Nein | Keine hinreichend klare Freigabe für den vorgesehenen Plattformbetrieb dokumentiert. |
| DIE ZEIT – Nachrichten | Ja | LEGAL_REVIEW | Nein | Keine hinreichend klare Freigabe für den vorgesehenen Plattformbetrieb dokumentiert. |

Offizielle Nachweise:

- Destatis: https://www.destatis.de/DE/Service/Impressum/_inhalt.html
- Destatis RSS: https://www.destatis.de/DE/Service/RSS/_inhalt.html
- Europäische Kommission: https://commission.europa.eu/legal-notice_en
- Tagesschau RSS: https://www.tagesschau.de/infoservices/rssfeeds
- Handelsblatt RSS: https://www.handelsblatt.com/rss-feeds/

Der Dry-Run `npm run scan:approved:dry` liest ausschließlich aktive Quellen mit `legalStatus=APPROVED`. Er schreibt keine Artikel in die Datenbank und ruft Langdock nicht auf.
