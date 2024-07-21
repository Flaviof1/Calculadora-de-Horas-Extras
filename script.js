// Adiciona um ouvinte de evento para o formulário
document.getElementById('horaExtraForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    // Obtém os valores dos campos do formulário
    const destino = document.getElementById('destino').value;
    const data = document.getElementById('data').value;
    const horaInicio = document.getElementById('horaInicio').value;
    const horaFim = document.getElementById('horaFim').value;
    const placa = document.getElementById('placa').value;

    // Valores das horas
    const valorHoraExtra = 10.59;
    const valorHoraNoturna = 8.47;
    const jornadaDiaria = 9; // Jornada diária padrão de 9 horas

    // Cria objetos Date para a hora de início e fim
    const inicio = new Date(`${data}T${horaInicio}`);
    const fim = new Date(`${data}T${horaFim}`);
    
    // Ajusta a data de fim se for menor que a data de início (caso o fim seja após a meia-noite)
    if (fim < inicio) {
        fim.setDate(fim.getDate() + 1);
    }

    // Inicializa variáveis para cálculos
    let totalHorasNoturnas = 0;
    let totalHorasExtras = 0;
    let totalHorasNormais = jornadaDiaria;
    let totalValorNoturno = 0;
    let totalValorExtra = 0;

    // Função para calcular horas e minutos entre dois horários
    function calcularHorasMinutos(start, end) {
        const diffMs = end - start;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { horas: diffHrs, minutos: diffMins };
    }

    // Função para calcular horas noturnas e extras
    function calcularHorasPeriodo(inicio, fim) {
        let horasNoturnas = 0;
        let minutosNoturnos = 0;
        let horasExtras = 0;
        let minutosExtras = 0;
        let horasNormais = jornadaDiaria;
        let current = new Date(inicio);

        // Itera por cada minuto entre início e fim
        while (current < fim) {
            let next = new Date(current);
            next.setMinutes(current.getMinutes() + 1);

            // Ajusta o próximo horário se ultrapassar o horário de fim
            if (next > fim) {
                next = new Date(fim);
            }

            // Calcula a diferença entre os horários atual e próximo
            const { horas, minutos } = calcularHorasMinutos(current, next);
            const horaAtual = current.getHours();

            // Verifica se a hora é noturna
            if (horaAtual >= 22 || horaAtual < 5) {
                minutosNoturnos += minutos;
                if (minutosNoturnos >= 60) {
                    horasNoturnas += Math.floor(minutosNoturnos / 60);
                    minutosNoturnos %= 60;
                }
            } else {
                if (horasNormais > 0) {
                    const horasNormaisTrabalhadas = Math.min(horasNormais, horas + minutos / 60);
                    horasNormais -= horasNormaisTrabalhadas;
                    const horasExtrasTrabalhadas = (horas + minutos / 60) - horasNormaisTrabalhadas;
                    if (horasExtrasTrabalhadas > 0) {
                        horasExtras += horasExtrasTrabalhadas;
                    }
                } else {
                    horasExtras += horas + minutos / 60;
                }
            }

            // Avança para o próximo minuto
            current = next;
        }

        // Adiciona minutos noturnos restantes
        horasNoturnas += Math.floor(minutosNoturnos / 60);
        minutosNoturnos %= 60;

        return {
            horasNoturnas: horasNoturnas + minutosNoturnos / 60,
            horasExtras: horasExtras + minutosExtras / 60
        };
    }

    // Calcula o total de horas noturnas e extras
    const resultados = calcularHorasPeriodo(inicio, fim);
    totalHorasNoturnas = resultados.horasNoturnas;
    totalHorasExtras = resultados.horasExtras;

    // Calcula o valor total das horas noturnas e extras
    totalValorNoturno = valorHoraNoturna * totalHorasNoturnas;
    totalValorExtra = valorHoraExtra * totalHorasExtras;

    // Cria um objeto com os dados a serem armazenados
    const dados = {
        destino: destino,
        data: data,
        placa: placa,
        horasExtras: totalHorasExtras,
        horasNoturnas: totalHorasNoturnas,
        valorNoturno: totalValorNoturno,
        valorExtra: totalValorExtra
    };

    // Armazena os dados no localStorage
    let registros = JSON.parse(localStorage.getItem('registros')) || [];
    registros.push(dados);
    localStorage.setItem('registros', JSON.stringify(registros));

    // Exibe o resultado no elemento com id "resultado"
    document.getElementById('resultado').innerText = `
        Destino: ${destino}\n
        Data: ${new Date(data).toLocaleDateString()}\n
        Placa do Veículo: ${placa}\n
        Total de horas extras: ${totalHorasExtras.toFixed(2)}\n
        Total de horas noturnas: ${totalHorasNoturnas.toFixed(2)}\n
        Valor total das horas noturnas: R$ ${totalValorNoturno.toFixed(2)}\n
        Valor total das horas extras: R$ ${totalValorExtra.toFixed(2)}
    `;
});

// Adiciona um ouvinte de evento para o botão de cálculo mensal
document.getElementById('calcularMensal').addEventListener('click', function() {
    // Recupera os dados armazenados no localStorage
    const registros = JSON.parse(localStorage.getItem('registros')) || [];

    // Inicializa variáveis para somar os totais
    let totalHorasNoturnasMensal = 0;
    let totalHorasExtrasMensal = 0;
    let totalValorNoturnoMensal = 0;
    let totalValorExtraMensal = 0;

    // Itera pelos registros e acumula os totais
    registros.forEach(registro => {
        totalHorasNoturnasMensal += registro.horasNoturnas;
        totalHorasExtrasMensal += registro.horasExtras;
        totalValorNoturnoMensal += registro.valorNoturno;
        totalValorExtraMensal += registro.valorExtra;
    });

    // Exibe o resultado mensal no elemento com id "resultadoMensal"
    document.getElementById('resultadoMensal').innerText = `
        Total de horas extras do mês: ${totalHorasExtrasMensal.toFixed(2)}\n
        Total de horas noturnas do mês: ${totalHorasNoturnasMensal.toFixed(2)}\n
        Valor total das horas noturnas do mês: R$ ${totalValorNoturnoMensal.toFixed(2)}\n
        Valor total das horas extras do mês: R$ ${totalValorExtraMensal.toFixed(2)}
    `;
});
