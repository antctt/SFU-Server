# Ghid de utilizare a API-ului „Queue”

Acest fișier oferă colegilor tăi toate informațiile necesare pentru a interacționa cu sistemul de coadă de vorbitori prin HTTP și WebSocket.

---

## 1. URL de bază

```
https://mic-controller-backend.onrender.com
```

> Înlocuiește `mic-controller-backend.onrender.com` cu domeniul sau subdomeniul generat de Render.

---

## 2. Endpoint-uri disponibile

| Acțiune                    | Metodă HTTP | URL                         | Parametri Query                                             |
|----------------------------|-------------|-----------------------------|-------------------------------------------------------------|
| **Listare stare coadă**    | GET         | `/api/queue`                | —                                                           |
| **Adăugare vorbitor**      | POST        | `/api/queue/add`            | `id`*, `source`*, `name` (opțional), `party_name` (opțional) |
| **Eliminare vorbitor**     | DELETE      | `/api/queue/remove/{id}`    | — (ID în path)                                              |
| **Trecere la următor**     | POST        | `/api/queue/next`           | —                                                           |
| **Listare participanți**   | GET         | `/api/participants`         | —                                                           |

> **Parametri obligatorii**: `id`, `source`

---

## 3. Exemple de comenzi `curl`

### 3.1. Listare participanți

```bash
curl https://mic-controller-backend.onrender.com/api/participants
```

### 3.2. Adăugare vorbitor (numai `id` și `source`)

```bash
curl -X POST   "https://mic-controller-backend.onrender.com/api/queue/add?id=onl001&source=online"
```

### 3.3. Adăugare cu `name` și `party_name`

```bash
curl -X POST   "https://mic-controller-backend.onrender.com/api/queue/add?id=onl002&source=online&name=Ionescu%20Maria&party_name=PNL"
```

### 3.4. Eliminare vorbitor (decline)

```bash
curl -X DELETE   "https://mic-controller-backend.onrender.com/api/queue/remove/onl001"
```

### 3.5. Trecere la următorul vorbitor

```bash
curl -X POST   "https://mic-controller-backend.onrender.com/api/queue/next"
```

### 3.6. Verificare stare coadă

```bash
curl https://mic-controller-backend.onrender.com/api/queue
```

---

## 4. WebSocket (opțional)

Pentru a primi instant actualizări în timp real, puteți deschide un client WebSocket:

```js
const ws = new WebSocket("wss://mic-controller-backend.onrender.com/ws/queue");
ws.onopen    = () => console.log("WS open", ws.readyState);
ws.onmessage = msg => console.log("WS msg", msg.data);
```

- **wsUrl**: `wss://mic-controller-backend.onrender.com/ws/queue`
- La conectare, veți primi un obiect JSON cu:
  - `active` (speaker activ sau `null`)
  - `queue` (toată coada)
  - `visible` (primii 8)

---

## 5. Notă de securitate (opțional)

- Dacă API-ul devine public, puteți adăuga autentificare (API-Key, BasicAuth, JWT) la endpoint-uri.
- Configurați HTTPS (Render oferă automat TLS).

---

## 6. Contact

Pentru probleme sau întrebări, contactați echipa de dezvoltare:

- **Olimp** (dezvoltator backend)

---
