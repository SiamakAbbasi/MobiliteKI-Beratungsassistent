# Statischer Demo-Zugang

Mobility Pulse verwendet für den MVP ein einzelnes, serverseitig konfiguriertes Demo-Konto.

## Konfiguration

Folgende Werte müssen ausschließlich in der Server-Umgebung bzw. in `/opt/mobility-pulse/.env` gesetzt werden:

```dotenv
MOBILITY_AUTH_USERNAME="demo-user"
MOBILITY_AUTH_PASSWORD="ein-langes-eindeutiges-passwort"
MOBILITY_AUTH_SECRET="mindestens-32-zufaellige-zeichen"
MOBILITY_AUTH_SECURE_COOKIE="true"
```

Für `MOBILITY_AUTH_SECRET` sollte ein kryptografisch zufälliger Wert mit mindestens 32 Zeichen verwendet werden. Zugangsdaten gehören niemals in Git oder in `NEXT_PUBLIC_*`-Variablen.

## Sicherheit und HTTPS

Produktions-Sessions werden ausschließlich als `HttpOnly`, `Secure` und `SameSite=Lax` Cookie gesetzt. Deshalb funktioniert die Anmeldung in `NODE_ENV=production` absichtlich nicht zuverlässig über eine öffentliche HTTP-Verbindung.

Vor der Nutzung auf dem VPS muss HTTPS über einen Reverse Proxy wie Nginx oder Caddy eingerichtet werden. Erst danach darf der Demo-Zugang an Kolleginnen und Kollegen weitergegeben werden.

Für die zeitlich begrenzte Development-Demo unter `http://217.160.50.62:3050`
wird `MOBILITY_AUTH_SECURE_COOKIE=false` gesetzt, damit der Browser das
Session-Cookie über HTTP akzeptiert. Das Cookie bleibt `HttpOnly` und
`SameSite=Lax`, die Verbindung selbst ist jedoch nicht verschlüsselt. Bei der
Umstellung auf HTTPS muss der Wert wieder auf `true` gesetzt werden.

Die statische Anmeldung ist bewusst klein gehalten und kann später durch Microsoft Entra ID ersetzt werden. Es gibt keine Registrierung, Passwort-Wiederherstellung oder Benutzerverwaltung.
