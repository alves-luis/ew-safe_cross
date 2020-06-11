# Mensagens
- Existem dois tipos de mensagens ao veículo, em que ambas dependem quer da luz no momento, quer do número de pedestres no range da crosswalk:
    - Sempre que existe uma alteração no estado da crosswalk 
        - Cor da luz do semáforo
        - Se existirem pedestres nas proximidades: "Take care!"
    - Quando o veículo cruza a crosswalk:
        - Se a luz estiver:
            - amarela: "Try to be more careful, the light was yellow!"
            - vermelha: "STOP! Pay attention to traffic light! Real lives are at stake!"
        - Se existirem pedestres nas proximidades: "Pedestrians nearby. Pay attention to your surroundings!"


# Simulações

Para realizar uma simulação específica deve ser executado o comando `node vehicle.js x` , em que `x` é o número da simulação.

### Simulação 0:

- UM
    - Simula a passagem por duas crosswalks:
        - a primeira tem o objetivo de mostrar que quando um veículo inicia a marcha dentro do range de uma crosswalk este é devidamente tratado pelo sistema.
        - a segunda mostra o fluxo completo de um veículo entrar no range da crosswalk, cruzar a crosswalk e sair do range da mesma.

    - Esta simulação pode ser executada em simultâneo com a Simulação 0 do pedestre e tem o objetivo de ilustrar o comportamento dos diferentes tipos de intervenientes na crosswalk. As mensagens estarão dependentes das variáveis em cima descritas.


### Simulação 1:

- Bosch
    - Simula a inversão de marcha de um veículo:
        - tem o objetivo de demonstrar que um mesmo veículo (que possui um ID único) apenas é contabilizado uma vez para as estatísticas relativas ao dia em questão.
    