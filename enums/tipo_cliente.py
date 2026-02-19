import enum


class TipoCliente(enum.Enum):
    VISITANTE = "VISITANTE"
    VOLUNTARIO = "VOLUNTARIO"
    EQUIPE = "EQUIPE"

    def __str__(self):
        return str(self.value)
