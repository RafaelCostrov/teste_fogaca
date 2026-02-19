# API Fogazza

## Fogazza

### `POST /fogazza/adicionar`

Adiciona uma nova fogazza.

**Recebe:**
```json
{
    "nome_fogazza": "Calabresa",  // string
    "preco_fogazza": 15.00       // float
}
```

**Resposta (201):**
```json
{
    "mensagem": "Fogazza adicionada com sucesso!",
    "fogazza": {
        "id_fogazza": 1,           // int
        "nome_fogazza": "Calabresa", // string
        "preco_fogazza": 15.00     // float
    }
}
```

---

### `GET /fogazza/listar`

Lista todas as fogazzas disponíveis.

**Resposta (200):**
```json
[
    {
        "id_fogazza": 1,           // int
        "nome_fogazza": "Calabresa", // string
        "preco_fogazza": 15.00     // float
    }
]
```

---

### `DELETE /fogazza/remover`

Remove uma fogazza pelo ID.

**Recebe:**
```json
{
    "id_fogazza": 1  // int
}
```

**Resposta (200):**
```json
{
    "mensagem": "Fogazza removida com sucesso!"
}
```

---

## Atendimento

### `POST /atendimento/adicionar`

Adiciona um novo atendimento. Se o tipo_cliente for "equipe", o preço total será 0.

**Recebe:**
```json
{
    "tipo_cliente": "visitante",   // string (opções: "equipe", "visitante", "voluntario")
    "fogazzas": [                  // list[object]
        {
            "id_fogazza": 1,       // int
            "quantidade": 2        // int
        }
    ]
}
```

**Resposta (201):**
```json
{
    "id_atendimento": 1,                    // int
    "tipo_cliente": "visitante",            // string
    "preco_total": 30.00,                   // float
    "comprado_em": "2026-02-19 14:30:00",   // string (formato: "YYYY-MM-DD HH:MM:SS")
    "itens": [                              // list[object]
        {
            "id_fogazza": 1,                // int
            "quantidade": 2,                // int
            "preco_fogazza": 15.00          // float
        }
    ]
}
```

---

### `GET /atendimento/listar`

Lista todos os atendimentos.

**Resposta (200):**
```json
[
    {
        "id_atendimento": 1,                  // int
        "tipo_cliente": "visitante",           // string
        "preco_total": 30.00,                  // float
        "comprado_em": "2026-02-19 14:30:00",  // string
        "itens": [                             // list[object]
            {
                "id_fogazza": 1,               // int
                "quantidade": 2                // int
            }
        ]
    }
]
```

---

### `POST /atendimento/filtrar`

Filtra atendimentos com paginação e ordenação. Todos os campos são opcionais.

**Recebe:**
```json
{
    "id_atendimento": [1, 3],                       // list[int]
    "tipo_cliente": ["VISITANTE", "EQUIPE"],         // list[string] (opções: "EQUIPE", "VISITANTE", "VOLUNTARIO")
    "preco_min": 10.00,                              // float
    "preco_max": 100.00,                             // float
    "data_hora_min": "2025-01-01 00:00:00",          // string (formato: "YYYY-MM-DD HH:MM:SS")
    "data_hora_max": "2026-12-31 23:59:59",          // string (formato: "YYYY-MM-DD HH:MM:SS")
    "pagina": 1,                                     // int (default: 1)
    "limit": 50,                                     // int (default: 50)
    "order_by": "comprado_em",                       // string (opções: "id_atendimento", "tipo_cliente", "preco_total", "comprado_em")
    "order_dir": "desc"                              // string (opções: "asc", "desc")
}
```

**Resposta (200):**
```json
[
    {
        "id_atendimento": 1,                  // int
        "tipo_cliente": "visitante",           // string
        "preco_total": 30.00,                  // float
        "comprado_em": "2026-02-19 14:30:00",  // string
        "itens": [                             // list[object]
            {
                "id_fogazza": 1,               // int
                "quantidade": 2,               // int
                "preco_fogazza": 15.00         // float
            }
        ]
    }
]
```

---

### `PUT /atendimento/atualizar`

Atualiza um atendimento. Apenas os campos enviados serão alterados. O preço total é recalculado automaticamente ao alterar fogazzas ou tipo_cliente.

**Recebe:**
```json
{
    "id_atendimento": 1,           // int (obrigatório)
    "tipo_cliente": "equipe",      // string (opcional, opções: "equipe", "visitante", "voluntario")
    "fogazzas": [                  // list[object] (opcional)
        {
            "id_fogazza": 1,       // int
            "quantidade": 3        // int
        }
    ]
}
```

**Resposta (200):**
```json
{
    "mensagem": "Atendimento atualizado com sucesso!"
}
```

---

### `DELETE /atendimento/remover`

Remove um atendimento e todos os itens vinculados.

**Recebe:**
```json
{
    "id_atendimento": 1  // int
}
```

**Resposta (200):**
```json
{
    "mensagem": "Atendimento removido com sucesso!"
}
```

---

### `POST /atendimento/imprimir`

Imprime o recibo de um atendimento na impressora térmica.

**Recebe:**
```json
{
    "id_atendimento": 1  // int
}
```

**Resposta (200):**
```json
{
    "mensagem": "Recibo impresso com sucesso!"
}
```

---

## Erros

Todas as rotas retornam erro no formato abaixo com status **400**:

```json
{
    "erro": "mensagem de erro"
}
```
