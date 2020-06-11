# Mensagens
- Existem dois tipos de mensagens ao pedestre, em que ambas dependem quer da luz no momento, quer do número de veículos no range da crosswalk:
    - Sempre que existe uma alteração no estado da crosswalk 
        - Cor da luz do semáforo
        - Se existirem veículos nas proximidades: "Pay attention!"
    - Quando o pedestre cruza a crosswalk:
        - Se a luz estiver:
            - verde/amarela: "Pay attention to traffic light!"
                - Para além disso, se existirem veículos nas proximidades: "You could have been run over!"


# Simulações

Para realizar uma simulação específica deve ser executado o comando `node pedestrian.js x` , em que `x` é o número da simulação.

### Simulação 0:

- UM
    - Simula a passagem por quatro crosswalks:
        - a primeira tem o objetivo de mostrar o fluxo completo de um pedestre entrar no range da crosswalk, cruzar a crosswalk e sair do range da mesma.
        - a segunda, terceira e quarta, que estão situadas próximas umas das outras, têm o objetivo de demonstrar que o sistema é capaz de lidar com mais do que uma crosswalk nas proximidades, conseguindo distinguir quais as crosswalks efetivamente cruzadas.

    - Esta simulação pode ser executada em simultâneo com a Simulação 0 do veículo e tem o objetivo de ilustrar o comportamento dos diferentes tipos de intervenientes na crosswalk. As mensagens estarão dependentes das variáveis em cima descritas.


    